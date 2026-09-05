import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  await initDb();
  const events = await db
    .select()
    .from(schema.calendarEvents)
    .orderBy(asc(schema.calendarEvents.date), asc(schema.calendarEvents.time));
  return Response.json(events);
}

export async function POST(request: Request) {
  try {
    await initDb();
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

    await db.insert(schema.calendarEvents).values({
      title: title.trim().slice(0, 200),
      description: typeof description === "string" ? description.trim().slice(0, 2000) : null,
      date: date.trim().slice(0, 30),
      time: typeof time === "string" ? time.trim().slice(0, 30) : null,
      color: typeof color === "string" ? color.trim().slice(0, 30) : "#00FF41",
      created_at: new Date().toISOString(),
    });

    const events = await db
      .select()
      .from(schema.calendarEvents)
      .orderBy(asc(schema.calendarEvents.date), asc(schema.calendarEvents.time));
    return Response.json(events, { status: 201 });
  } catch (err) {
    console.error("Error creating calendar event:", err);
    return Response.json({ error: "Invalid JSON or request data" }, { status: 400 });
  }
}

