import { getDb, persistDb, queryAll, type Note } from "@/db";

export async function GET() {
  const db = await getDb();
  const notes = queryAll<Note>(db, "SELECT * FROM notes ORDER BY id ASC LIMIT 1");
  return Response.json(notes[0] || { id: 0, content: "", updated_at: new Date().toISOString() });
}

export async function PUT(request: Request) {
  const db = await getDb();
  const { content } = await request.json();
  if (typeof content !== "string") {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const existing = queryAll<Note>(db, "SELECT * FROM notes LIMIT 1");
  if (existing.length > 0) {
    db.run("UPDATE notes SET content = ?, updated_at = ? WHERE id = ?", [content, now, existing[0].id]);
  } else {
    db.run("INSERT INTO notes (content, updated_at) VALUES (?, ?)", [content, now]);
  }
  persistDb();

  try {
    const { insertLog } = await import("@/db");
    await insertLog("INFO", "DATABASE", "NOTES_SCRATCHPAD_SAVED", "User-Operator", {
      char_count: content.length,
      snippet: content.substring(0, 80),
    });
  } catch {}

  const note = queryAll<Note>(db, "SELECT * FROM notes ORDER BY id ASC LIMIT 1");
  return Response.json(note[0]);
}
