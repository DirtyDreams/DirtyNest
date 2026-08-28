import { NextRequest, NextResponse } from "next/server";
import { getDb, persistDb } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.data) {
      return NextResponse.json({ error: "Invalid backup format: missing 'data' object" }, { status: 400 });
    }

    const { todos, notes, links, events } = data.data;

    const db = await getDb();

    // Begin a transaction of sorts
    db.exec("BEGIN TRANSACTION;");

    // 1. Restore Todos
    if (Array.isArray(todos)) {
      db.exec("DELETE FROM todos;");
      for (const todo of todos) {
        db.run("INSERT INTO todos (id, text, completed, sort_order, priority, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
          todo.id,
          todo.text,
          todo.completed,
          todo.sort_order,
          todo.priority || "normal",
          todo.due_date || null,
          todo.created_at || new Date().toISOString()
        ]);
      }
    }

    // 2. Restore Notes
    if (Array.isArray(notes)) {
      db.exec("DELETE FROM notes;");
      for (const note of notes) {
        db.run("INSERT INTO notes (id, content, updated_at) VALUES (?, ?, ?)", [note.id, note.content, note.updated_at || new Date().toISOString()]);
      }
    }

    // 3. Restore Links
    if (Array.isArray(links)) {
      db.exec("DELETE FROM quick_links;");
      for (const link of links) {
        db.run("INSERT INTO quick_links (id, label, url, icon, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [link.id, link.label, link.url, link.icon, link.category, link.sort_order]);
      }
    }

    // 4. Restore Events
    if (Array.isArray(events)) {
      db.exec("DELETE FROM events;");
      for (const event of events) {
        db.run("INSERT INTO events (id, title, date, time, type) VALUES (?, ?, ?, ?, ?)", [event.id, event.title, event.date, event.time, event.type]);
      }
    }

    db.exec("COMMIT;");
    persistDb();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Import failed:", error);
    try {
      const db = await getDb();
      db.exec("ROLLBACK;");
    } catch (_e) {
      // ignore
    }
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
