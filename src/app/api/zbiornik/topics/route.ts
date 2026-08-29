import { db } from "@/lib/db";
import { zbTopics } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
    const topics = await db.select().from(zbTopics).orderBy(desc(zbTopics.fetched_at), desc(zbTopics.id)).limit(limit);
    return Response.json({ topics });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "topics failed" }, { status: 500 });
  }
}