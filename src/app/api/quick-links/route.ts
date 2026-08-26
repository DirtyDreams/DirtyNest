import { getDb, persistDb, queryAll, type QuickLink } from "@/db";

export async function GET() {
  const db = await getDb();
  const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
  return Response.json(links);
}

export async function POST(request: Request) {
  const db = await getDb();
  const { name, url, icon } = await request.json();
  if (!name || !url) {
    return Response.json({ error: "Name and URL are required" }, { status: 400 });
  }
  const maxOrder = db.exec("SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM quick_links");
  const nextOrder = maxOrder.length > 0 ? maxOrder[0].values[0][0] as number : 0;
  db.run(
    "INSERT INTO quick_links (name, url, icon, sort_order) VALUES (?, ?, ?, ?)",
    [name.trim(), url.trim(), icon || null, nextOrder]
  );
  persistDb();
  const links = queryAll<QuickLink>(db, "SELECT * FROM quick_links ORDER BY sort_order ASC");
  return Response.json(links, { status: 201 });
}
