import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import type { AgentType } from "./types";

export interface ToolEvent {
  toolName: string;
  parameters: Record<string, unknown>;
  result?: string;
  riskLevel?: string;
  permissionStatus?: string;
  executionTimeMs?: number;
}

export interface AssistantEvent {
  text: string;
  thinkingTrace?: string[];
  citations?: unknown[];
  toolCalls?: unknown[];
  agentUsed: AgentType;
  executionTimeMs?: number;
  tokens?: number;
}

/** Persist a user message and bump the session's updated_at. */
export async function persistUserMessage(
  sessionId: number,
  text: string,
  agentUsed: AgentType,
  decisionReasoning?: string
): Promise<number> {
  const now = new Date().toISOString();
  const res = await db
    .insert(chatMessages)
    .values({
      session_id: sessionId,
      sender: "user",
      text,
      agent_used: agentUsed,
      created_at: now,
    })
    .returning({ id: chatMessages.id });

  await db
    .update(chatSessions)
    .set({ updated_at: now, orchestrator_decision: decisionReasoning ?? null })
    .where(eq(chatSessions.id, sessionId));

  return res[0]?.id ?? 0;
}

/** Persist an assistant (AI) message with trace, citations, and tool calls. */
export async function persistAssistantMessage(
  sessionId: number,
  event: AssistantEvent
): Promise<number> {
  const res = await db
    .insert(chatMessages)
    .values({
      session_id: sessionId,
      sender: "ai",
      text: event.text,
      thinking_trace: event.thinkingTrace ? JSON.stringify(event.thinkingTrace) : null,
      citations: event.citations ? JSON.stringify(event.citations) : null,
      tool_calls: event.toolCalls ? JSON.stringify(event.toolCalls) : null,
      agent_used: event.agentUsed,
      execution_time_ms: event.executionTimeMs ?? 0,
      tokens: event.tokens ?? 0,
      created_at: new Date().toISOString(),
    })
    .returning({ id: chatMessages.id });

  await db
    .update(chatSessions)
    .set({ updated_at: new Date().toISOString() })
    .where(eq(chatSessions.id, sessionId));

  return res[0]?.id ?? 0;
}

/** Persist a tool execution event as a `tool` message. */
export async function persistToolEvent(sessionId: number, event: ToolEvent): Promise<number> {
  const res = await db
    .insert(chatMessages)
    .values({
      session_id: sessionId,
      sender: "tool",
      text: event.result ?? "",
      tool_calls: JSON.stringify([
        {
          tool: event.toolName,
          args: event.parameters,
          risk_level: event.riskLevel ?? "medium",
          permission_status: event.permissionStatus ?? "AUTO_APPROVED",
        },
      ]),
      execution_time_ms: event.executionTimeMs ?? 0,
      created_at: new Date().toISOString(),
    })
    .returning({ id: chatMessages.id });

  return res[0]?.id ?? 0;
}

/** Count messages in a session (used for bounds checks). */
export async function countSessionMessages(sessionId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(chatMessages)
    .where(eq(chatMessages.session_id, sessionId));
  return rows[0]?.count ?? 0;
}
