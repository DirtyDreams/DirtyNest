import { db, initDb, insertLog } from "@/db";
import * as schema from "@/lib/schema";
import { asc, sql } from "drizzle-orm";

export async function GET() {
  await initDb();
  const todos = await db.select().from(schema.todos).orderBy(asc(schema.todos.sort_order));
  return Response.json(todos);
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { text, priority = "normal", due_date = null } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }
    if (text.trim().length > 500) {
      return Response.json({ error: "Text exceeds maximum limit of 500 characters" }, { status: 400 });
    }

    const maxOrder = await db
      .select({ next_order: sql<number>`COALESCE(MAX(${schema.todos.sort_order}), -1) + 1` })
      .from(schema.todos);
    const nextOrder = Number(maxOrder[0]?.next_order || 0);

    await db.insert(schema.todos).values({
      text: text.trim(),
      sort_order: nextOrder,
      priority,
      due_date,
      created_at: new Date().toISOString(),
    });

    try {
      await insertLog("SUCCESS", "UI", "TODO_ITEM_CREATED", "User-Operator", { text: text.trim(), order: nextOrder });
    } catch {}

    const todos = await db.select().from(schema.todos).orderBy(asc(schema.todos.sort_order));
    return Response.json(todos, { status: 201 });
  } catch (err) {
    console.error("Error creating todo:", err);
    return Response.json({ error: "Invalid JSON or internal error" }, { status: 400 });
  }
}

