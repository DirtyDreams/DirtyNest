import { getDb, persistDb, queryAll, type CalendarEvent } from "@/db";

export async function GET() {
  const db = await getDb();
  const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
  return Response.json(events);
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { title, description, date, time, color } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 200) {
      return Response.json({ error: "Title must not exceed 200 characters" }, { status: 400 });
    }
    if (!date || typeof date !== "string" || !date.trim()) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 2000) {
      return Response.json({ error: "Description must not exceed 2000 characters" }, { status: 400 });
    }

    db.run(
      "INSERT INTO calendar_events (title, description, date, time, color) VALUES (?, ?, ?, ?, ?)",
      [
        title.trim().slice(0, 200),
        typeof description === "string" ? description.trim().slice(0, 2000) : null,
        date.trim().slice(0, 30),
        typeof time === "string" ? time.trim().slice(0, 30) : null,
        typeof color === "string" ? color.trim().slice(0, 30) : "#00FF41"
      ]
    );
    persistDb();
    const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
    return Response.json(events, { status: 201 });
  } catch (err) {
    console.error("Error creating calendar event:", err);
    return Response.json({ error: "Invalid JSON or request data" }, { status: 400 });
  }
}
