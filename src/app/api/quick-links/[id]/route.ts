import { getDb, persistDb, queryAll, type QuickLink } from "@/db";

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

    const db = await getDb();
    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];

    if (typeof body.name === "string" && body.name.trim()) {
      updates.push("name = ?");
      values.push(body.name.trim());
    }
    if (typeof body.url === "string" && body.url.trim()) {
      const trimmedUrl = body.url.trim();
      const isValid = trimmedUrl.startsWith("/") || trimmedUrl.startsWith("#") || ["http:", "https:", "mailto:"].some(p => {
        try { return new URL(trimmedUrl).protocol === p; } catch { return false; }
      });
      if (isValid) {
        updates.push("url = ?");
        values.push(trimmedUrl);
      }
    }
    if (typeof body.icon === "string" || body.icon === null) {
      updates.push("icon = ?");
      values.push(body.icon);
    }

    if (updates.length > 0) {
      values.push(numId);
      db.run(`UPDATE quick_links SET ${updates.join(", ")} WHERE id = ?`, values);
      persistDb();
    }

    const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
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

    const db = await getDb();
    db.run("DELETE FROM quick_links WHERE id = ?", [numId]);
    persistDb();
    const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
    return Response.json(links);
  } catch (err) {
    console.error("Error deleting quick link:", err);
    return Response.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
