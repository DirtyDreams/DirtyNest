import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { knowledgeDocs } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { ingestDocument } from "@/lib/knowledge/sidecar";

const createDocSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1),
  category: z.string().trim().max(100).default("general"),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");

  const docs = category
    ? await db
        .select()
        .from(knowledgeDocs)
        .where(and(eq(knowledgeDocs.user_id, userId), eq(knowledgeDocs.category, category)))
        .orderBy(desc(knowledgeDocs.updated_at))
    : await db
        .select()
        .from(knowledgeDocs)
        .where(eq(knowledgeDocs.user_id, userId))
        .orderBy(desc(knowledgeDocs.updated_at));

  const filtered = tag
    ? docs.filter((d) => parseTags(d.tags).includes(tag))
    : docs;

  return NextResponse.json({
    docs: filtered.map((d) => ({ ...d, tags: parseTags(d.tags) })),
  });
}

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createDocSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { title, content, category, tags, metadata } = parsed.data;

  const res = await db
    .insert(knowledgeDocs)
    .values({
      user_id: userId,
      title,
      content,
      category,
      tags: JSON.stringify(tags),
      metadata: metadata ? JSON.stringify(metadata) : null,
      source: "manual",
      created_at: now,
      updated_at: now,
    })
    .returning();

  const doc = res[0];

  // Best-effort: embed + upsert into Qdrant. On failure the PG row still
  // exists; qdrant_point_id stays null and the doc is searchable only by list.
  const ingest = await ingestDocument(String(doc.id), title, content, category, tags);
  if (ingest) {
    await db
      .update(knowledgeDocs)
      .set({ qdrant_point_id: ingest.point_ids[0] ?? null, updated_at: now })
      .where(eq(knowledgeDocs.id, doc.id));
  }

  try {
    await insertLog("SUCCESS", "UI", "KNOWLEDGE_DOC_CREATED", "User-Operator", { docId: doc.id, title });
  } catch {}

  const fresh = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, doc.id));
  return NextResponse.json({ doc: { ...fresh[0], tags: parseTags(fresh[0]?.tags ?? null) } }, { status: 201 });
}
