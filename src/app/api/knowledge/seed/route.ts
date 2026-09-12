import { NextResponse } from "next/server";
import { db, initDb, insertLog } from "@/lib/db";
import { knowledgeDocs, knowledgeGraphEdges } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { ingestDocument } from "@/lib/knowledge/sidecar";
import path from "path";
import fs from "fs";

export async function POST() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();

  // Read files from vault directory if available
  const vaultDir = path.resolve(process.cwd(), "vault");
  const seededDocs: Array<{ title: string; category: string; tags: string[]; content: string; obsidianPath: string }> = [];

  if (fs.existsSync(vaultDir)) {
    const walk = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (file.endsWith(".md")) {
          const text = fs.readFileSync(fullPath, "utf-8");
          const relPath = path.relative(vaultDir, fullPath).replace(/\\/g, "/");
          
          let title = file.replace(/\.md$/, "");
          let category = "Karpathy Skills";
          let tags = ["karpathy", "skills"];
          let content = text;

          const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
          if (m) {
            content = text.slice(m[0].length);
            for (const line of m[1].split("\n")) {
              const [k, ...v] = line.split(":");
              if (!k || v.length === 0) continue;
              const val = v.join(":").trim().replace(/^['"]|['"]$/g, "");
              const key = k.trim().toLowerCase();
              if (key === "title") title = val;
              if (key === "category") category = val;
              if (key === "tags") {
                const tagStr = val.replace(/^\[|\]$/g, "");
                tags = tagStr.split(",").map((t) => t.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
              }
            }
          }

          seededDocs.push({
            title,
            category,
            tags,
            content,
            obsidianPath: relPath,
          });
        }
      }
    };
    walk(vaultDir);
  }

  const titleToId = new Map<string, number>();
  let docCount = 0;

  for (const item of seededDocs) {
    const existing = await db
      .select()
      .from(knowledgeDocs)
      .where(eq(knowledgeDocs.obsidian_path, item.obsidianPath))
      .limit(1);

    let docId: number;
    if (existing[0]) {
      docId = existing[0].id;
      await db
        .update(knowledgeDocs)
        .set({
          title: item.title,
          content: item.content,
          category: item.category,
          tags: JSON.stringify(item.tags),
          updated_at: now,
        })
        .where(eq(knowledgeDocs.id, docId));
    } else {
      const ins = await db
        .insert(knowledgeDocs)
        .values({
          user_id: userId,
          title: item.title,
          content: item.content,
          category: item.category,
          tags: JSON.stringify(item.tags),
          source: "obsidian",
          obsidian_path: item.obsidianPath,
          created_at: now,
          updated_at: now,
        })
        .returning();
      docId = ins[0].id;
      docCount++;
    }

    titleToId.set(item.title.toLowerCase(), docId);
    titleToId.set(item.obsidianPath.toLowerCase(), docId);

    // Ingest into Qdrant vectors
    await ingestDocument(String(docId), item.title, item.content, item.category, item.tags);
  }

  // Parse WikiLinks and generate edges
  let edgeCount = 0;
  for (const item of seededDocs) {
    const sourceId = titleToId.get(item.title.toLowerCase());
    if (!sourceId) continue;

    const wikiMatches = item.content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
    for (const match of wikiMatches) {
      const targetName = match[1].trim().toLowerCase();
      const targetId = titleToId.get(targetName);
      if (targetId && targetId !== sourceId) {
        await db.insert(knowledgeGraphEdges).values({
          source_doc_id: sourceId,
          target_doc_id: targetId,
          relation: "wiki_link",
          created_at: now,
        });
        edgeCount++;
      }
    }
  }

  try {
    await insertLog("SUCCESS", "UI", "KNOWLEDGE_SEEDED", "User-Operator", {
      docs: seededDocs.length,
      edges: edgeCount,
    });
  } catch {}

  return NextResponse.json({
    ok: true,
    seeded: seededDocs.length,
    newDocs: docCount,
    edges: edgeCount,
  });
}
