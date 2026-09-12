import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import { db, initDb, insertLog } from "@/lib/db";
import { knowledgeDocs, knowledgeGraphEdges } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { indexObsidianVault, ingestDocument } from "@/lib/knowledge/sidecar";

const syncSchema = z.object({
  vault_path: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = syncSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  let vaultPath = parsed.data.vault_path;
  if (!path.isAbsolute(vaultPath)) {
    vaultPath = path.resolve(process.cwd(), vaultPath);
  }

  const result = await indexObsidianVault(vaultPath);
  if (!result) {
    return NextResponse.json({ error: "Obsidian scan failed (sidecar unavailable or path invalid)" }, { status: 502 });
  }

  const now = new Date().toISOString();
  const created: number[] = [];
  const updated: number[] = [];
  const titleToId = new Map<string, number>();

  // Upsert each vault doc into PG (keyed by obsidian_path) and ingest into Qdrant.
  for (const vdoc of result.docs) {
    const existing = await db
      .select()
      .from(knowledgeDocs)
      .where(eq(knowledgeDocs.obsidian_path, vdoc.obsidian_path))
      .limit(1);

    let docId: number;
    if (existing[0]) {
      docId = existing[0].id;
      await db
        .update(knowledgeDocs)
        .set({
          title: vdoc.title,
          content: vdoc.content,
          category: vdoc.category,
          tags: JSON.stringify(vdoc.tags),
          source: "obsidian",
          updated_at: now,
        })
        .where(eq(knowledgeDocs.id, docId));
      updated.push(docId);
    } else {
      const ins = await db
        .insert(knowledgeDocs)
        .values({
          user_id: userId,
          title: vdoc.title,
          content: vdoc.content,
          category: vdoc.category,
          tags: JSON.stringify(vdoc.tags),
          source: "obsidian",
          obsidian_path: vdoc.obsidian_path,
          created_at: now,
          updated_at: now,
        })
        .returning();
      docId = ins[0].id;
      created.push(docId);
    }
    titleToId.set(vdoc.title, docId);
    titleToId.set(vdoc.title.toLowerCase(), docId);
    const stem = vdoc.obsidian_path.split("/").pop()?.replace(/\.md$/, "") ?? "";
    if (stem) titleToId.set(stem.toLowerCase(), docId);

    await ingestDocument(String(docId), vdoc.title, vdoc.content, vdoc.category, vdoc.tags);
  }

  // Also index pre-existing PG docs for cross-linking
  const allUserDocs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.user_id, userId));
  for (const d of allUserDocs) {
    if (!titleToId.has(d.title)) titleToId.set(d.title, d.id);
    if (!titleToId.has(d.title.toLowerCase())) titleToId.set(d.title.toLowerCase(), d.id);
  }

  // Rebuild wiki-link edges without deleting semantic edges
  await db.delete(knowledgeGraphEdges).where(eq(knowledgeGraphEdges.relation, "wiki_link"));
  let edgeCount = 0;
  for (const edge of result.edges) {
    const sourceId = titleToId.get(edge.source) ?? titleToId.get(edge.source.toLowerCase());
    const targetId = titleToId.get(edge.target) ?? titleToId.get(edge.target.toLowerCase());
    if (sourceId === undefined || targetId === undefined || sourceId === targetId) continue;
    await db.insert(knowledgeGraphEdges).values({
      source_doc_id: sourceId,
      target_doc_id: targetId,
      relation: "wiki_link",
      created_at: now,
    });
    edgeCount += 1;
  }

  try {
    await insertLog("SUCCESS", "UI", "KNOWLEDGE_OBSIDIAN_SYNC", "User-Operator", {
      vaultPath: parsed.data.vault_path,
      docs: result.docs.length,
      edges: edgeCount,
    });
  } catch {}

  return NextResponse.json({
    ok: true,
    scanned: result.docs.length,
    created: created.length,
    edges: edgeCount,
  });
}
