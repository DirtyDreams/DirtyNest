import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    await initDb();
    const res = await db
      .select({ total: sql<number>`COALESCE(SUM(${schema.focusSessions.duration_minutes}), 0)::int` })
      .from(schema.focusSessions)
      .where(eq(schema.focusSessions.type, "work"));

    const total = res[0]?.total || 0;
    return NextResponse.json({ total_minutes: total });
  } catch (error: unknown) {
    console.error("Failed to fetch focus stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

