import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { knowledgeDocs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { searchKnowledge } from "@/lib/knowledge/sidecar";

const searchSchema = z.object({
  query: z.string().trim().min(1).max(500),
  limit: z.number().int().min(1).max(50).default(5),
  threshold: z.number().min(0).max(1).default(0.5),
});

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = searchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { query, limit, threshold } = parsed.data;
  const hits = await searchKnowledge(query, limit, threshold);

  // Join Qdrant hits with PG metadata (title/category/tags live in both; PG is
  // authoritative for the doc record). Hits without a PG row are still returned.
  const docIds = [...new Set(hits.map((h) => Number(h.doc_id)).filter((n) => Number.isFinite(n)))];
  const rows = docIds.length
    ? await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.user_id, userId))
    : [];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const results = hits.map((h) => {
    const doc = byId.get(Number(h.doc_id));
    return {
      ...h,
      doc: doc
        ? { id: doc.id, title: doc.title, category: doc.category, tags: parseTags(doc.tags), source: doc.source }
        : null,
    };
  });

  return NextResponse.json({ query, results, count: results.length });
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
