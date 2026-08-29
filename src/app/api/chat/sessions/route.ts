import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { chatSessions } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const createSessionSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  model: z.string().trim().max(100).optional(),
  mode: z.enum(["standard", "reasoning", "deep_research", "code_interpreter"]).optional(),
});

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.user_id, userId))
    .orderBy(desc(chatSessions.updated_at));

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSessionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const title = parsed.data.title ?? `Chat ${new Date().toLocaleString()}`;
  const res = await db
    .insert(chatSessions)
    .values({
      user_id: userId,
      title,
      model: parsed.data.model ?? null,
      mode: parsed.data.mode ?? "standard",
      created_at: now,
      updated_at: now,
    })
    .returning();

  return NextResponse.json({ session: res[0] }, { status: 201 });
}
