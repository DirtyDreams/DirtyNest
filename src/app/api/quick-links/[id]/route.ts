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
      return Response.json({ error: "Invalid link ID" }, { status: 400 });
    }

    await initDb();
    const body = await request.json();

    const updateData: Partial<typeof schema.quickLinks.$inferInsert> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (typeof body.url === "string" && body.url.trim()) {
      const trimmedUrl = body.url.trim();
      const isValid = trimmedUrl.startsWith("/") || trimmedUrl.startsWith("#") || ["http:", "https:", "mailto:"].some(p => {
        try { return new URL(trimmedUrl).protocol === p; } catch { return false; }
      });
      if (isValid) {
        updateData.url = trimmedUrl;
      }
    }
    if (body.icon !== undefined) {
      updateData.icon = body.icon;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(schema.quickLinks).set(updateData).where(eq(schema.quickLinks.id, numId));
    }

    const links = await db.select().from(schema.quickLinks).orderBy(asc(schema.quickLinks.sort_order));
    return Response.json(links);
  } catch (err) {
    console.error("Error updating quick link:", err);
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
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
      return Response.json({ error: "Invalid link ID" }, { status: 400 });
    }

    await initDb();
    await db.delete(schema.quickLinks).where(eq(schema.quickLinks.id, numId));

    const links = await db.select().from(schema.quickLinks).orderBy(asc(schema.quickLinks.sort_order));
    return Response.json(links);
  } catch (err) {
    console.error("Error deleting quick link:", err);
    return Response.json({ error: "Failed to delete link" }, { status: 500 });
  }
}

