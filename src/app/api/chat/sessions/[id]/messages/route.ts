import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { chatSessions, chatMessages } from "@/lib/schema";
import { and, asc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { loadAgents } from "@/lib/orchestrator/registry";
import { routePrompt } from "@/lib/orchestrator/classifier";
import { persistUserMessage, countSessionMessages } from "@/lib/orchestrator/persist";
import { createAcpSession, callAcpPrompt } from "@/lib/orchestrator/sidecar";
import { startAcpBridge } from "@/lib/orchestrator/acpBridge";

const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(50000),
});

const MAX_MESSAGES = 200;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.user_id, userId)))
    .limit(1);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.session_id, sessionId))
    .orderBy(asc(chatMessages.created_at));

  return NextResponse.json({ session, messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.user_id, userId)))
    .limit(1);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const parsed = sendMessageSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const messageCount = await countSessionMessages(sessionId);
  if (messageCount >= MAX_MESSAGES) {
    return NextResponse.json({ error: "Session message limit reached" }, { status: 400 });
  }

  // 1. Route the prompt to an agent.
  const agents = await loadAgents();
  const decision = await routePrompt(parsed.data.message, agents);

  // 2. Persist the user message + routing decision.
  await persistUserMessage(sessionId, parsed.data.message, decision.agentType, decision.reasoning);

  // 3. Ensure a sidecar ACP session exists, then fire the prompt (best-effort).
  let harnessSessionId = session.harness_session_id;
  if (!harnessSessionId) {
    harnessSessionId = await createAcpSession(session.title);
    if (harnessSessionId) {
      await db
        .update(chatSessions)
        .set({ harness_session_id: harnessSessionId })
        .where(eq(chatSessions.id, sessionId));
    }
  }
  if (harnessSessionId) {
    const agent = agents.find((a) => a.agentType === decision.agentType);
    await callAcpPrompt(harnessSessionId, parsed.data.message, agent?.systemPrompt);
  }
  // 4. Ensure the server-side ACP bridge is subscribed so the assistant
  //    response (trace, tool calls, final message) is persisted to chat_messages.
  startAcpBridge();

  return NextResponse.json({
    routedAgent: decision.agentType,
    decision,
    harnessSessionId: harnessSessionId ?? null,
  });
}
