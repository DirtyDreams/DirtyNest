import { getDb, persistDb, queryAll, type QuickLink } from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (typeof body.name === "string") { updates.push("name = ?"); values.push(body.name.trim()); }
  if (typeof body.url === "string") { updates.push("url = ?"); values.push(body.url.trim()); }
  if (typeof body.icon === "string") { updates.push("icon = ?"); values.push(body.icon); }

  if (updates.length > 0) {
    values.push(Number(id));
    db.run(`UPDATE quick_links SET ${updates.join(", ")} WHERE id = ?`, values);
    persistDb();
  }

  const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
  return Response.json(links);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  db.run("DELETE FROM quick_links WHERE id = ?", [Number(id)]);
  persistDb();
  const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
  return Response.json(links);
}
