import { getDb, persistDb, queryAll, insertLog, type Todo } from "@/db";

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

    const db = await getDb();
    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];

    if (typeof body.completed === "boolean") {
      updates.push("completed = ?");
      values.push(body.completed ? 1 : 0);
    }
    if (typeof body.text === "string" && body.text.trim()) {
      updates.push("text = ?");
      values.push(body.text.trim());
    }

    if (updates.length > 0) {
      values.push(numId);
      db.run(`UPDATE todos SET ${updates.join(", ")} WHERE id = ?`, values);
      persistDb();

      try {
        await insertLog("INFO", "UI", "TODO_ITEM_UPDATED", "User-Operator", { id: numId, changes: body });
      } catch {}
    }

    const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
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

    const db = await getDb();
    db.run("DELETE FROM todos WHERE id = ?", [numId]);
    persistDb();

    try {
      await insertLog("WARN", "UI", "TODO_ITEM_DELETED", "User-Operator", { id: numId });
    } catch {}

    const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
    return Response.json(todos);
  } catch (err) {
    console.error("Error deleting todo:", err);
    return Response.json({ error: "Failed to delete todo item" }, { status: 500 });
  }
}
