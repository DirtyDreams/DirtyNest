import { db, initDb, insertLog } from "@/db";
import * as schema from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  await initDb();
  const notes = await db.select().from(schema.notes).orderBy(asc(schema.notes.id)).limit(1);
  return Response.json(notes[0] || { id: 0, content: "", updated_at: new Date().toISOString() });
}

export async function PUT(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { content } = body || {};
    if (typeof content !== "string") {
      return Response.json({ error: "Content string is required" }, { status: 400 });
    }
    if (content.length > 50000) {
      return Response.json({ error: "Content exceeds maximum limit of 50,000 characters" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existing = await db.select().from(schema.notes).limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.notes)
        .set({ content, updated_at: now })
        .where(eq(schema.notes.id, existing[0].id));
    } else {
      await db.insert(schema.notes).values({ content, updated_at: now });
    }

    try {
      await insertLog("INFO", "DATABASE", "NOTES_SCRATCHPAD_SAVED", "User-Operator", {
        char_count: content.length,
        snippet: content.substring(0, 80),
      });
    } catch {}

    const note = await db.select().from(schema.notes).orderBy(asc(schema.notes.id)).limit(1);
    return Response.json(note[0] || { id: 1, content, updated_at: now });
  } catch (err) {
    console.error("Error saving note:", err);
    return Response.json({ error: "Invalid JSON or server error" }, { status: 400 });
  }
}

