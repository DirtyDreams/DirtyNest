import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { knowledgeDocs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { deleteDocumentPoints, ingestDocument } from "@/lib/knowledge/sidecar";

const updateDocSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  content: z.string().trim().min(1).optional(),
  category: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (!Number.isFinite(docId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const rows = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId));
  const doc = rows[0];
  if (!doc || doc.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ doc: { ...doc, tags: parseTags(doc.tags) } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (!Number.isFinite(docId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const rows = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId));
  const existing = rows[0];
  if (!existing || existing.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateDocSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { title, content, category, tags, metadata } = parsed.data;
  const nextTitle = title ?? existing.title;
  const nextContent = content ?? existing.content;
  const nextCategory = category ?? existing.category;
  const nextTags = tags !== undefined ? JSON.stringify(tags) : existing.tags;

  await db
    .update(knowledgeDocs)
    .set({
      title: nextTitle,
      content: nextContent,
      category: nextCategory,
      tags: nextTags,
      metadata: metadata !== undefined ? JSON.stringify(metadata) : existing.metadata,
      updated_at: now,
    })
    .where(eq(knowledgeDocs.id, docId));

  // Re-embed: drop old points, upsert fresh ones.
  await deleteDocumentPoints(String(docId));
  const ingest = await ingestDocument(String(docId), nextTitle, nextContent, nextCategory, tags ?? []);
  if (ingest) {
    await db
      .update(knowledgeDocs)
      .set({ qdrant_point_id: ingest.point_ids[0] ?? null, updated_at: now })
      .where(eq(knowledgeDocs.id, docId));
  }

  try {
    await insertLog("SUCCESS", "UI", "KNOWLEDGE_DOC_UPDATED", "User-Operator", { docId, title: nextTitle });
  } catch {}

  const fresh = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId));
  return NextResponse.json({ doc: { ...fresh[0], tags: parseTags(fresh[0]?.tags ?? null) } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (!Number.isFinite(docId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const rows = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId));
  const existing = rows[0];
  if (!existing || existing.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteDocumentPoints(String(docId));
  await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, docId));

  try {
    await insertLog("SUCCESS", "UI", "KNOWLEDGE_DOC_DELETED", "User-Operator", { docId, title: existing.title });
  } catch {}

  return NextResponse.json({ ok: true });
}
