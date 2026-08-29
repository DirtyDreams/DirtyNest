import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { chatSessions } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

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

  return NextResponse.json({ session });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const res = await db
    .delete(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.user_id, userId)))
    .returning({ id: chatSessions.id });

  if (res.length === 0) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
