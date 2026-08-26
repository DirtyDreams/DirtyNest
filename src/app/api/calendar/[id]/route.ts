import { getDb, persistDb, queryAll, type CalendarEvent } from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (typeof body.title === "string") { updates.push("title = ?"); values.push(body.title.trim()); }
  if (typeof body.description === "string") { updates.push("description = ?"); values.push(body.description); }
  if (typeof body.date === "string") { updates.push("date = ?"); values.push(body.date); }
  if (typeof body.time === "string") { updates.push("time = ?"); values.push(body.time); }
  if (typeof body.color === "string") { updates.push("color = ?"); values.push(body.color); }

  if (updates.length > 0) {
    values.push(Number(id));
    db.run(`UPDATE calendar_events SET ${updates.join(", ")} WHERE id = ?`, values);
    persistDb();
  }

  const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
  return Response.json(events);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  db.run("DELETE FROM calendar_events WHERE id = ?", [Number(id)]);
  persistDb();
  const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
  return Response.json(events);
}
