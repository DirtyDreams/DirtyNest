import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { knowledgeDocs } from "@/lib/schema";
import { count, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getKnowledgeStats } from "@/lib/knowledge/sidecar";

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [docRow] = await db
    .select({ value: count() })
    .from(knowledgeDocs)
    .where(eq(knowledgeDocs.user_id, userId));
  const qdrant = await getKnowledgeStats();

  return NextResponse.json({
    doc_count: Number(docRow?.value ?? 0),
    point_count: qdrant?.point_count ?? 0,
    qdrant_ready: qdrant?.ready ?? false,
  });
}
