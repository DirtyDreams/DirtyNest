import { getDb, persistDb, queryAll, type Todo } from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  if (typeof body.completed === "boolean") {
    db.run("UPDATE todos SET completed = ? WHERE id = ?", [body.completed ? 1 : 0, Number(id)]);
  }
  if (typeof body.text === "string") {
    db.run("UPDATE todos SET text = ? WHERE id = ?", [body.text.trim(), Number(id)]);
  }

  persistDb();

  try {
    const { insertLog } = await import("@/db");
    await insertLog("INFO", "UI", "TODO_ITEM_UPDATED", "User-Operator", { id, changes: body });
  } catch {}

  const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
  return Response.json(todos);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  db.run("DELETE FROM todos WHERE id = ?", [Number(id)]);
  persistDb();

  try {
    const { insertLog } = await import("@/db");
    await insertLog("WARN", "UI", "TODO_ITEM_DELETED", "User-Operator", { id });
  } catch {}

  const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
  return Response.json(todos);
}
