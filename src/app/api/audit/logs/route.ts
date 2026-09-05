import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { auditLogs, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Audit panel is admin-only.
  const me = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
  if (me.length === 0 || me[0].role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);
  const category = searchParams.get("category");

  const rows = await db
    .select()
    .from(auditLogs)
    .where(category ? eq(auditLogs.category, category) : undefined)
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit);

  return NextResponse.json({ logs: rows, count: rows.length });
}
