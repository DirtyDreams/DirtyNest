/**
 * ACP event persistence bridge (F3b).
 *
 * Subscribes to the sidecar `/ws/acp` stream and persists ACP events to
 * `chat_messages`, keyed by the chat session's `harness_session_id`. This is
 * what turns a fire-and-forget sidecar prompt into durable chat history with
 * thinking trace, tool calls, citations, and the final assistant message.
 *
 * `mapAcpEvent` is pure (unit-testable); `persistAcpEvent` applies it to the DB.
 */

import { db } from "@/lib/db";
import { chatSessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { signWsToken } from "@/lib/auth/jwt";
import { getSidecarBaseUrl } from "./sidecar";
import { persistAssistantMessage, persistToolEvent } from "./persist";
import type { AgentType } from "./types";

export type AcpEventKind =
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "token"
  | "source"
  | "hitl_gate"
  | "done"
  | "error"
  | "cancelled"
  | "ignored";

export interface MappedAcpEvent {
  kind: AcpEventKind;
  /** text delta for token/thinking events */
  delta?: string;
  /** tool name for tool_call/tool_result/hitl_gate */
  toolName?: string;
  /** tool result text */
  result?: string;
  /** risk level for hitl_gate */
  riskLevel?: string;
  /** permission status for hitl_gate */
  permissionStatus?: string;
  /** citations for source events */
  citations?: unknown[];
  /** final message for done/error/cancelled */
  finalMessage?: string;
  /** error message for error events */
  error?: string;
  /** execution time ms for done events */
  executionTimeMs?: number;
}

/** Pure mapping of a raw ACP event to a normalized shape. */
export function mapAcpEvent(event: Record<string, unknown>): MappedAcpEvent {
  const type = event.type as string;
  switch (type) {
    case "ACP_REASONING_DELTA":
      return { kind: "thinking", delta: (event.delta as string) ?? "" };
    case "ACP_MESSAGE_CHUNK":
      return { kind: "token", delta: (event.chunk as string) ?? "" };
    case "ACP_MEMORY_RECALLED": {
      const memories = Array.isArray(event.recalled_memories) ? event.recalled_memories : [];
      return { kind: "source", citations: memories };
    }
    case "ACP_TOOL_EXECUTED":
      return {
        kind: "tool_result",
        toolName: (event.tool_name as string) ?? "unknown_tool",
        result: (event.result as string) ?? "",
      };
    case "ACP_GATE_REQUESTED": {
      const gate = (event.gate as Record<string, unknown>) ?? {};
      return {
        kind: "hitl_gate",
        toolName: (gate.tool_name as string) ?? "unknown_tool",
        riskLevel: (gate.risk_level as string) ?? "medium",
        permissionStatus: "AWAITING_HITL",
      };
    }
    case "ACP_EXECUTION_FINISHED": {
      const status = (event.status as string) ?? "SUCCESS";
      if (status === "ERROR") {
        return { kind: "error", error: (event.error as string) ?? "Execution error" };
      }
      if (status === "DENIED") {
        return { kind: "cancelled", finalMessage: (event.result as string) ?? "Execution denied by operator." };
      }
      return {
        kind: "done",
        finalMessage: (event.final_message as string) ?? (event.result as string) ?? "Completed.",
        executionTimeMs: typeof event.execution_time_ms === "number" ? event.execution_time_ms : 0,
      };
    }
    case "ACP_EXECUTION_CANCELLED":
      return { kind: "cancelled", finalMessage: (event.result as string) ?? "Execution cancelled." };
    default:
      return { kind: "ignored" };
  }
}

interface SessionState {
  thinkingTrace: string;
  text: string;
  citations: unknown[];
  toolCalls: unknown[];
  agentUsed: AgentType | null;
  executionTimeMs: number;
}

const sessionState = new Map<string, SessionState>();

function getState(harnessSessionId: string): SessionState {
  let s = sessionState.get(harnessSessionId);
  if (!s) {
    s = { thinkingTrace: "", text: "", citations: [], toolCalls: [], agentUsed: null, executionTimeMs: 0 };
    sessionState.set(harnessSessionId, s);
  }
  return s;
}

/** Look up the chat session id for a harness (ACP) session id. */
async function findChatSessionId(harnessSessionId: string): Promise<number | null> {
  const rows = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(eq(chatSessions.harness_session_id, harnessSessionId))
    .limit(1);
  return rows[0]?.id ?? null;
}

/**
 * Persist a single ACP event to the chat session that owns the harness session.
 * Returns true if the event was persisted, false if no matching chat session.
 */
export async function persistAcpEvent(harnessSessionId: string, event: Record<string, unknown>): Promise<boolean> {
  const chatSessionId = await findChatSessionId(harnessSessionId);
  if (chatSessionId === null) return false;

  const mapped = mapAcpEvent(event);
  const state = getState(harnessSessionId);

  switch (mapped.kind) {
    case "thinking":
      state.thinkingTrace += mapped.delta ?? "";
      return true;
    case "token":
      state.text += mapped.delta ?? "";
      return true;
    case "source":
      state.citations.push(...(mapped.citations ?? []));
      return true;
    case "tool_result":
      state.toolCalls.push({ tool: mapped.toolName, result: mapped.result });
      await persistToolEvent(chatSessionId, {
        toolName: mapped.toolName ?? "unknown_tool",
        parameters: {},
        result: mapped.result,
        permissionStatus: "AUTO_APPROVED",
      });
      return true;
    case "hitl_gate":
      await persistToolEvent(chatSessionId, {
        toolName: mapped.toolName ?? "unknown_tool",
        parameters: {},
        riskLevel: mapped.riskLevel,
        permissionStatus: mapped.permissionStatus,
      });
      return true;
    case "done":
    case "error":
    case "cancelled": {
      const finalText = mapped.finalMessage ?? mapped.error ?? (state.text || "Completed.");
      await persistAssistantMessage(chatSessionId, {
        text: finalText,
        thinkingTrace: state.thinkingTrace ? state.thinkingTrace.split("\n").filter(Boolean) : undefined,
        citations: state.citations.length ? state.citations : undefined,
        toolCalls: state.toolCalls.length ? state.toolCalls : undefined,
        agentUsed: state.agentUsed ?? "hermes",
        executionTimeMs: mapped.executionTimeMs ?? state.executionTimeMs,
      });
      sessionState.delete(harnessSessionId);
      return true;
    }
    default:
      return true;
  }
}

let bridgeStarted = false;

/** Start (once) a server-side subscription to the sidecar ACP event stream. */
export function startAcpBridge(): void {
  if (bridgeStarted) return;
  bridgeStarted = true;

  const baseUrl = getSidecarBaseUrl();
  const wsUrl = baseUrl.replace(/^http/, "ws");

  const connect = async () => {
    try {
      const token = await signWsToken({ sub: "bridge", username: "acp-bridge", role: "system" });
      const socket = new WebSocket(`${wsUrl}/ws/acp?token=${encodeURIComponent(token)}`);

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(String(msg.data)) as Record<string, unknown>;
          const sessionId = data.session_id as string | undefined;
          if (sessionId) {
            void persistAcpEvent(sessionId, data);
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        // Reconnect after a short delay (best-effort bridge).
        setTimeout(connect, 5000);
      };
      socket.onerror = () => {
        socket.close();
      };
    } catch {
      setTimeout(connect, 5000);
    }
  };

  void connect();
}
