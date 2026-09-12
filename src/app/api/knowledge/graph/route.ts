import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { knowledgeDocs, knowledgeGraphEdges } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

import { getSemanticEdges } from "@/lib/knowledge/sidecar";

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.user_id, userId));
  const docById = new Map(docs.map((d) => [d.id, d]));

  const edges = await db.select().from(knowledgeGraphEdges);
  const scopedEdges = edges.filter((e) => docById.has(e.source_doc_id) && docById.has(e.target_doc_id));

  // Merge semantic edges from Qdrant vector proximity
  const semanticEdges = await getSemanticEdges(0.70);
  const existingPairSet = new Set(scopedEdges.map((e) => `${e.source_doc_id}->${e.target_doc_id}`));

  const mergedEdges: Array<{ id: string | number; source: number; target: number; relation: string }> = [
    ...scopedEdges.map((e) => ({
      id: e.id,
      source: e.source_doc_id,
      target: e.target_doc_id,
      relation: e.relation,
    })),
  ];

  for (const se of semanticEdges) {
    const src = Number(se.source);
    const tgt = Number(se.target);
    if (!isNaN(src) && !isNaN(tgt) && docById.has(src) && docById.has(tgt)) {
      const pairKey = `${src}->${tgt}`;
      if (!existingPairSet.has(pairKey)) {
        existingPairSet.add(pairKey);
        mergedEdges.push({
          id: `sem-${src}-${tgt}`,
          source: src,
          target: tgt,
          relation: "semantic",
        });
      }
    }
  }

  return NextResponse.json({
    nodes: docs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      tags: parseTags(d.tags),
      source: d.source,
    })),
    edges: mergedEdges,
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
