import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { knowledgeDocs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.user_id, userId));
  const tagSet = new Set<string>();
  for (const d of docs) {
    try {
      const parsed = JSON.parse(d.tags ?? "[]") as unknown;
      if (Array.isArray(parsed)) {
        for (const t of parsed) if (typeof t === "string") tagSet.add(t);
      }
    } catch {
      // ignore malformed tags
    }
  }
  const tags = [...tagSet].sort();
  return NextResponse.json({ tags });
}
