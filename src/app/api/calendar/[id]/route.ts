import { getDb, persistDb, queryAll, type CalendarEvent } from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return Response.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const db = await getDb();
    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];

    if (typeof body.title === "string" && body.title.trim()) {
      updates.push("title = ?");
      values.push(body.title.trim());
    }
    if (typeof body.description === "string" || body.description === null) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (typeof body.date === "string" && body.date.trim()) {
      updates.push("date = ?");
      values.push(body.date.trim());
    }
    if (typeof body.time === "string" || body.time === null) {
      updates.push("time = ?");
      values.push(body.time);
    }
    if (typeof body.color === "string" && body.color.trim()) {
      updates.push("color = ?");
      values.push(body.color.trim());
    }

    if (updates.length > 0) {
      values.push(numId);
      db.run(`UPDATE calendar_events SET ${updates.join(", ")} WHERE id = ?`, values);
      persistDb();
    }

    const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
    return Response.json(events);
  } catch (err) {
    console.error("Error updating calendar event:", err);
    return Response.json({ error: "Failed to update calendar event" }, { status: 400 });
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
      return Response.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const db = await getDb();
    db.run("DELETE FROM calendar_events WHERE id = ?", [numId]);
    persistDb();
    const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
    return Response.json(events);
  } catch (err) {
    console.error("Error deleting calendar event:", err);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
