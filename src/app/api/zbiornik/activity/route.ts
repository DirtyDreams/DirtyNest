import { db } from "@/db";
import { zbActivityLog } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 300);
    const items = await db.select().from(zbActivityLog).orderBy(desc(zbActivityLog.id)).limit(limit);
    return Response.json({ items });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "activity failed" }, { status: 500 });
  }
}