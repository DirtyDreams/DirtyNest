import { getDb, persistDb, queryAll, type Todo } from "@/db";

export async function GET() {
  const db = await getDb();
  const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
  return Response.json(todos);
}

export async function POST(request: Request) {
  const db = await getDb();
  const { text } = await request.json();
  if (!text || typeof text !== "string") {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }
  const maxOrder = db.exec("SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM todos");
  const nextOrder = maxOrder.length > 0 ? maxOrder[0].values[0][0] as number : 0;
  db.run("INSERT INTO todos (text, sort_order) VALUES (?, ?)", [text.trim(), nextOrder]);
  persistDb();
  const todos = queryAll<Todo>(db, "SELECT * FROM todos ORDER BY sort_order ASC");
  return Response.json(todos, { status: 201 });
}
