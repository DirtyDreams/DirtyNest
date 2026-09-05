import { db, initDb } from "@/db";
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
      return Response.json({ error: "Invalid event ID" }, { status: 400 });
    }

    await initDb();
    const body = await request.json();

    const updateData: Partial<typeof schema.calendarEvents.$inferInsert> = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updateData.title = body.title.trim();
    }
    if (typeof body.description === "string" || body.description === null) {
      updateData.description = body.description;
    }
    if (typeof body.date === "string" && body.date.trim()) {
      updateData.date = body.date.trim();
    }
    if (typeof body.time === "string" || body.time === null) {
      updateData.time = body.time;
    }
    if (typeof body.color === "string" && body.color.trim()) {
      updateData.color = body.color.trim();
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(schema.calendarEvents).set(updateData).where(eq(schema.calendarEvents.id, numId));
    }

    const events = await db
      .select()
      .from(schema.calendarEvents)
      .orderBy(asc(schema.calendarEvents.date), asc(schema.calendarEvents.time));
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

    await initDb();
    await db.delete(schema.calendarEvents).where(eq(schema.calendarEvents.id, numId));

    const events = await db
      .select()
      .from(schema.calendarEvents)
      .orderBy(asc(schema.calendarEvents.date), asc(schema.calendarEvents.time));
    return Response.json(events);
  } catch (err) {
    console.error("Error deleting calendar event:", err);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

