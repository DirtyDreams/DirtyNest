import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hermesMemories } from "@/lib/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("search");

    if (query) {
      // First try semantic search via Sidecar Qdrant engine
      try {
        const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
        const sidecarRes = await fetch(
          `${sidecarUrl}/api/hermes/memories/search?q=${encodeURIComponent(query)}&limit=10&threshold=0.60`,
          { next: { revalidate: 0 } }
        );
        if (sidecarRes.ok) {
          const sidecarData = await sidecarRes.json();
          if (sidecarData?.results && sidecarData.results.length > 0) {
            return NextResponse.json({
              status: "success",
              source: "qdrant_vector",
              memories: sidecarData.results,
            });
          }
        }
      } catch (sidecarErr) {
        console.warn("Sidecar semantic search fallback to PostgreSQL:", sidecarErr);
      }

      // Fallback to PostgreSQL ILIKE search
      const memories = await db
        .select()
        .from(hermesMemories)
        .where(
          or(
            like(hermesMemories.title, `%${query}%`),
            like(hermesMemories.content, `%${query}%`)
          )
        )
        .orderBy(desc(hermesMemories.created_at))
        .limit(20);

      return NextResponse.json({ status: "success", source: "postgres_ilike", memories });
    }

    // Default: Return all memories from PostgreSQL
    const memories = await db
      .select()
      .from(hermesMemories)
      .orderBy(desc(hermesMemories.created_at))
      .limit(50);

    return NextResponse.json({ status: "success", memories });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch memories";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category = "fact", tags = [] } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // 1. Save to PostgreSQL
    await db.insert(hermesMemories).values({
      id: memoryId,
      title,
      content,
      category,
      tags_json: JSON.stringify(tags),
      recall_count: 0,
      created_at: now,
    });

    // 2. Sync to Qdrant vector database via Sidecar
    try {
      const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
      await fetch(`${sidecarUrl}/api/hermes/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, tags }),
      });
    } catch (qdrantErr) {
      console.warn("Failed to sync new memory to Qdrant sidecar:", qdrantErr);
    }

    return NextResponse.json({
      status: "success",
      memory: {
        id: memoryId,
        title,
        content,
        category,
        tags,
        recall_count: 0,
        created_at: now,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create memory";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
