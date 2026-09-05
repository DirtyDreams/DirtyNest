import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { knowledgeDocs, knowledgeGraphEdges } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.user_id, userId));
  const docById = new Map(docs.map((d) => [d.id, d]));

  const edges = await db.select().from(knowledgeGraphEdges);
  const scoped = edges.filter((e) => docById.has(e.source_doc_id) && docById.has(e.target_doc_id));

  return NextResponse.json({
    nodes: docs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      tags: parseTags(d.tags),
      source: d.source,
    })),
    edges: scoped.map((e) => ({
      id: e.id,
      source: e.source_doc_id,
      target: e.target_doc_id,
      relation: e.relation,
    })),
  });
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}
