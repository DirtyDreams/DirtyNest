import { db, initDb, insertLog } from "@/db";
import * as schema from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return Response.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    await initDb();
    const body = await request.json();

    const updateData: Partial<typeof schema.todos.$inferInsert> = {};

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed ? 1 : 0;
    }
    if (typeof body.text === "string" && body.text.trim()) {
      updateData.text = body.text.trim();
    }
    if (body.priority) {
      updateData.priority = body.priority;
    }
    if (body.due_date !== undefined) {
      updateData.due_date = body.due_date;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(schema.todos).set(updateData).where(eq(schema.todos.id, numId));

      try {
        await insertLog("INFO", "UI", "TODO_ITEM_UPDATED", "User-Operator", { id: numId, changes: body });
      } catch {}
    }

    const todos = await db.select().from(schema.todos).orderBy(asc(schema.todos.sort_order));
    return Response.json(todos);
  } catch (err) {
    console.error("Error updating todo:", err);
    return Response.json({ error: "Failed to update todo item" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return Response.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    await initDb();
    await db.delete(schema.todos).where(eq(schema.todos.id, numId));

    try {
      await insertLog("WARN", "UI", "TODO_ITEM_DELETED", "User-Operator", { id: numId });
    } catch {}

    const todos = await db.select().from(schema.todos).orderBy(asc(schema.todos.sort_order));
    return Response.json(todos);
  } catch (err) {
    console.error("Error deleting todo:", err);
    return Response.json({ error: "Failed to delete todo item" }, { status: 500 });
  }
}

