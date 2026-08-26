import { getDb, persistDb, queryAll, type QuickLink } from "@/db";

export async function GET() {
  const db = await getDb();
  const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
  return Response.json(links);
}

export function isValidUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { name, url, icon } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return Response.json({ error: "Name must not exceed 100 characters" }, { status: 400 });
    }
    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return Response.json({ error: "A valid HTTP, HTTPS, or relative URL is required" }, { status: 400 });
    }
    if (url.length > 500) {
      return Response.json({ error: "URL must not exceed 500 characters" }, { status: 400 });
    }

    const maxOrder = db.exec("SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM quick_links");
    const nextOrder = maxOrder.length > 0 ? (maxOrder[0].values[0][0] as number) : 0;
    db.run(
      "INSERT INTO quick_links (name, url, icon, sort_order) VALUES (?, ?, ?, ?)",
      [
        name.trim().slice(0, 100),
        url.trim().slice(0, 500),
        typeof icon === "string" ? icon.trim().slice(0, 50) : null,
        nextOrder
      ]
    );
    persistDb();
    const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
    return Response.json(links, { status: 201 });
  } catch (err) {
    console.error("Error creating quick link:", err);
    return Response.json({ error: "Invalid JSON or internal error" }, { status: 400 });
  }
}
