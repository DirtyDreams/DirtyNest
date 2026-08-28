import { db } from "@/lib/db";
import { hermesSessions, hermesMessages, hermesToolLogs } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await db
      .select()
      .from(hermesSessions)
      .where(eq(hermesSessions.id, id))
      .limit(1);

    if (session.length === 0) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(hermesMessages)
      .where(eq(hermesMessages.session_id, id))
      .orderBy(asc(hermesMessages.created_at));

    const toolLogs = await db
      .select()
      .from(hermesToolLogs)
      .where(eq(hermesToolLogs.session_id, id))
      .orderBy(asc(hermesToolLogs.timestamp));

    return Response.json({
      status: "success",
      session: session[0],
      messages,
      toolLogs,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error retrieving ACP session details:", error);
    return Response.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nowIso = new Date().toISOString();

    const updateData: Partial<typeof hermesSessions.$inferInsert> = {
      updated_at: nowIso,
    };

    if (body.name && typeof body.name === "string") {
      updateData.name = body.name.trim();
    }
    if (body.status && ["IDLE", "RUNNING", "WAITING_CLEARANCE", "ERROR", "COMPLETED"].includes(body.status)) {
      updateData.status = body.status;
    }
    if (body.model && typeof body.model === "string") {
      updateData.model = body.model.trim();
    }

    await db.update(hermesSessions).set(updateData).where(eq(hermesSessions.id, id));

    const updated = await db
      .select()
      .from(hermesSessions)
      .where(eq(hermesSessions.id, id))
      .limit(1);

    return Response.json({ status: "success", session: updated[0] });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error updating ACP session:", error);
    return Response.json({ error: error?.message || "Failed to update session" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.delete(hermesMessages).where(eq(hermesMessages.session_id, id));
    await db.delete(hermesToolLogs).where(eq(hermesToolLogs.session_id, id));
    await db.delete(hermesSessions).where(eq(hermesSessions.id, id));

    return Response.json({ status: "success", message: `Session ${id} deleted` });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error deleting ACP session:", error);
    return Response.json({ error: error?.message || "Failed to delete session" }, { status: 500 });
  }
}
