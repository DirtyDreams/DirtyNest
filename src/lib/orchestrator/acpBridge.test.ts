import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    chatSessionId: 7 as number | null,
    toolEvents: [] as unknown[],
    assistantMessages: [] as unknown[],
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(state.chatSessionId === null ? [] : [{ id: state.chatSessionId }]),
        }),
      }),
    }),
  };
  return { state, mockDb };
});

vi.mock("@/lib/db", () => ({
  db: h.mockDb,
}));

vi.mock("./persist", () => ({
  persistToolEvent: vi.fn(async (_id: number, ev: unknown) => {
    h.state.toolEvents.push(ev);
    return 1;
  }),
  persistAssistantMessage: vi.fn(async (_id: number, ev: unknown) => {
    h.state.assistantMessages.push(ev);
    return 1;
  }),
}));

import { mapAcpEvent, persistAcpEvent } from "./acpBridge";

describe("mapAcpEvent", () => {
  it("maps reasoning delta to thinking", () => {
    expect(mapAcpEvent({ type: "ACP_REASONING_DELTA", delta: "step" })).toEqual({
      kind: "thinking",
      delta: "step",
    });
  });

  it("maps message chunk to token", () => {
    expect(mapAcpEvent({ type: "ACP_MESSAGE_CHUNK", chunk: "hi" })).toEqual({
      kind: "token",
      delta: "hi",
    });
  });

  it("maps memory recall to source citations", () => {
    const m = mapAcpEvent({ type: "ACP_MEMORY_RECALLED", recalled_memories: [{ id: 1 }] });
    expect(m.kind).toBe("source");
    expect(m.citations).toEqual([{ id: 1 }]);
  });

  it("maps tool executed to tool_result", () => {
    const m = mapAcpEvent({ type: "ACP_TOOL_EXECUTED", tool_name: "system_scan", result: "ok" });
    expect(m.kind).toBe("tool_result");
    expect(m.toolName).toBe("system_scan");
    expect(m.result).toBe("ok");
  });

  it("maps gate requested to hitl_gate", () => {
    const m = mapAcpEvent({
      type: "ACP_GATE_REQUESTED",
      gate: { tool_name: "patch", risk_level: "critical" },
    });
    expect(m.kind).toBe("hitl_gate");
    expect(m.riskLevel).toBe("critical");
    expect(m.permissionStatus).toBe("AWAITING_HITL");
  });

  it("maps finished success to done", () => {
    const m = mapAcpEvent({ type: "ACP_EXECUTION_FINISHED", status: "SUCCESS", final_message: "done" });
    expect(m.kind).toBe("done");
    expect(m.finalMessage).toBe("done");
  });

  it("maps finished error to error", () => {
    const m = mapAcpEvent({ type: "ACP_EXECUTION_FINISHED", status: "ERROR", error: "boom" });
    expect(m.kind).toBe("error");
    expect(m.error).toBe("boom");
  });

  it("maps cancelled to cancelled", () => {
    const m = mapAcpEvent({ type: "ACP_EXECUTION_CANCELLED", result: "stopped" });
    expect(m.kind).toBe("cancelled");
    expect(m.finalMessage).toBe("stopped");
  });

  it("ignores unknown events", () => {
    expect(mapAcpEvent({ type: "ACP_BROWSER_UPDATED" })).toEqual({ kind: "ignored" });
  });
});

describe("persistAcpEvent", () => {
  beforeEach(() => {
    h.state.chatSessionId = 7;
    h.state.toolEvents = [];
    h.state.assistantMessages = [];
  });

  it("returns false when no chat session owns the harness session", async () => {
    h.state.chatSessionId = null;
    const ok = await persistAcpEvent("acp-nope", { type: "ACP_EXECUTION_FINISHED", status: "SUCCESS" });
    expect(ok).toBe(false);
    expect(h.state.assistantMessages).toHaveLength(0);
  });

  it("persists a tool event for ACP_TOOL_EXECUTED", async () => {
    const ok = await persistAcpEvent("acp-1", { type: "ACP_TOOL_EXECUTED", tool_name: "system_scan", result: "ok" });
    expect(ok).toBe(true);
    expect(h.state.toolEvents).toHaveLength(1);
    expect(h.state.toolEvents[0]).toMatchObject({ toolName: "system_scan", permissionStatus: "AUTO_APPROVED" });
  });

  it("persists a HITL tool event for ACP_GATE_REQUESTED", async () => {
    const ok = await persistAcpEvent("acp-1", {
      type: "ACP_GATE_REQUESTED",
      gate: { tool_name: "patch", risk_level: "critical" },
    });
    expect(ok).toBe(true);
    expect(h.state.toolEvents[0]).toMatchObject({ toolName: "patch", permissionStatus: "AWAITING_HITL" });
  });

  it("accumulates thinking + text and persists the final assistant message", async () => {
    await persistAcpEvent("acp-1", { type: "ACP_REASONING_DELTA", delta: "think1\n" });
    await persistAcpEvent("acp-1", { type: "ACP_MESSAGE_CHUNK", chunk: "Hello " });
    await persistAcpEvent("acp-1", { type: "ACP_MESSAGE_CHUNK", chunk: "world" });
    const ok = await persistAcpEvent("acp-1", { type: "ACP_EXECUTION_FINISHED", status: "SUCCESS", final_message: "Hello world" });
    expect(ok).toBe(true);
    expect(h.state.assistantMessages).toHaveLength(1);
    const msg = h.state.assistantMessages[0] as Record<string, unknown>;
    expect(msg.text).toBe("Hello world");
    expect(msg.thinkingTrace).toEqual(["think1"]);
    expect(msg.agentUsed).toBe("hermes");
  });

  it("persists a cancelled assistant message on ACP_EXECUTION_CANCELLED", async () => {
    const ok = await persistAcpEvent("acp-1", { type: "ACP_EXECUTION_CANCELLED", result: "stopped" });
    expect(ok).toBe(true);
    expect(h.state.assistantMessages).toHaveLength(1);
    expect((h.state.assistantMessages[0] as Record<string, unknown>).text).toBe("stopped");
  });
});
