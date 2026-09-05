import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { asc, sql } from "drizzle-orm";

export async function GET() {
  await initDb();
  const links = await db.select().from(schema.quickLinks).orderBy(asc(schema.quickLinks.sort_order));
  return Response.json(links);
}

export function isValidUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { name, url, icon } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return Response.json({ error: "Name must not exceed 100 characters" }, { status: 400 });
    }
    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return Response.json({ error: "A valid HTTP, HTTPS, or relative URL is required" }, { status: 400 });
    }
    if (url.length > 500) {
      return Response.json({ error: "URL must not exceed 500 characters" }, { status: 400 });
    }

    const maxOrder = await db
      .select({ next_order: sql<number>`COALESCE(MAX(${schema.quickLinks.sort_order}), -1) + 1` })
      .from(schema.quickLinks);
    const nextOrder = Number(maxOrder[0]?.next_order || 0);

    await db.insert(schema.quickLinks).values({
      name: name.trim().slice(0, 100),
      url: url.trim().slice(0, 500),
      icon: typeof icon === "string" ? icon.trim().slice(0, 50) : null,
      sort_order: nextOrder,
      created_at: new Date().toISOString(),
    });

    const links = await db.select().from(schema.quickLinks).orderBy(asc(schema.quickLinks.sort_order));
    return Response.json(links, { status: 201 });
  } catch (err) {
    console.error("Error creating quick link:", err);
    return Response.json({ error: "Invalid JSON or internal error" }, { status: 400 });
  }
}

