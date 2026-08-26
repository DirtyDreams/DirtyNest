import { getDb, persistDb, queryAll, type CalendarEvent } from "@/db";

export async function GET() {
  const db = await getDb();
  const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
  return Response.json(events);
}

export async function POST(request: Request) {
  const db = await getDb();
  const { title, description, date, time, color } = await request.json();
  if (!title || !date) {
    return Response.json({ error: "Title and date are required" }, { status: 400 });
  }
  db.run(
    "INSERT INTO calendar_events (title, description, date, time, color) VALUES (?, ?, ?, ?, ?)",
    [title.trim(), description || null, date, time || null, color || "#00FF41"]
  );
  persistDb();
  const events = queryAll<CalendarEvent>(db, "SELECT * FROM calendar_events ORDER BY date ASC, time ASC");
  return Response.json(events, { status: 201 });
}
