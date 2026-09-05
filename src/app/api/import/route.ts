import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.data) {
      return NextResponse.json({ error: "Invalid backup format: missing 'data' object" }, { status: 400 });
    }

    const { todos, notes, links, events } = data.data;

    await initDb();

    await db.transaction(async (tx) => {
      // 1. Restore Todos
      if (Array.isArray(todos)) {
        await tx.delete(schema.todos);
        for (const todo of todos) {
          await tx.insert(schema.todos).values({
            text: todo.text,
            completed: todo.completed ? 1 : 0,
            sort_order: todo.sort_order || 0,
            priority: todo.priority || "normal",
            due_date: todo.due_date || null,
            created_at: todo.created_at || new Date().toISOString(),
          });
        }
      }

      // 2. Restore Notes
      if (Array.isArray(notes)) {
        await tx.delete(schema.notes);
        for (const note of notes) {
          await tx.insert(schema.notes).values({
            content: note.content || "",
            updated_at: note.updated_at || new Date().toISOString(),
          });
        }
      }

      // 3. Restore Links
      if (Array.isArray(links)) {
        await tx.delete(schema.quickLinks);
        for (const link of links) {
          await tx.insert(schema.quickLinks).values({
            name: link.name || link.label || "Link",
            url: link.url,
            icon: link.icon || null,
            sort_order: link.sort_order || 0,
            created_at: new Date().toISOString(),
          });
        }
      }

      // 4. Restore Events
      if (Array.isArray(events)) {
        await tx.delete(schema.calendarEvents);
        for (const event of events) {
          await tx.insert(schema.calendarEvents).values({
            title: event.title,
            description: event.description || null,
            date: event.date,
            time: event.time || null,
            color: event.color || "#00FF41",
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Import failed:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

