import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    await initDb();

    // Summary stats
    const summaryRes = await db
      .select({
        total: sql<number>`count(*)::int`,
        errorCount: sql<number>`sum(case when ${schema.systemLogs.level} = 'ERROR' then 1 else 0 end)::int`,
        warnCount: sql<number>`sum(case when ${schema.systemLogs.level} = 'WARN' then 1 else 0 end)::int`,
        avgLat: sql<number>`avg(${schema.systemLogs.latency_ms})::float`,
        maxLat: sql<number>`max(${schema.systemLogs.latency_ms})::int`,
      })
      .from(schema.systemLogs);

    const summary = summaryRes[0] || { total: 0, errorCount: 0, warnCount: 0, avgLat: 0, maxLat: 0 };
    const total = summary.total || 0;
    const errorCount = summary.errorCount || 0;
    const warnCount = summary.warnCount || 0;
    const avgLatency = summary.avgLat ? Math.round(summary.avgLat * 10) / 10 : 0;
    const maxLatency = summary.maxLat || 0;

    // Levels breakdown
    const levelCountsRes = await db
      .select({
        level: schema.systemLogs.level,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.level)
      .orderBy(desc(sql`count(*)`));

    // Categories breakdown
    const catCountsRes = await db
      .select({
        category: schema.systemLogs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.category)
      .orderBy(desc(sql`count(*)`));

    // Top Actors
    const actorCountsRes = await db
      .select({
        actor: schema.systemLogs.actor,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.actor)
      .orderBy(desc(sql`count(*)`))
      .limit(8);

    // Top Actions
    const actionCountsRes = await db
      .select({
        action: schema.systemLogs.action,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.action)
      .orderBy(desc(sql`count(*)`))
      .limit(8);

    // Recent logs timeline
    const recentLogs = await db
      .select({
        timestamp: schema.systemLogs.timestamp,
        level: schema.systemLogs.level,
      })
      .from(schema.systemLogs)
      .orderBy(desc(schema.systemLogs.timestamp))
      .limit(60);

    const successRate = total > 0 ? Math.round(((total - errorCount) / total) * 1000) / 10 : 100;

    return NextResponse.json({
      total,
      errorCount,
      warnCount,
      successRate,
      avgLatency,
      maxLatency,
      levels: levelCountsRes,
      categories: catCountsRes,
      topActors: actorCountsRes,
      topActions: actionCountsRes,
      recentTimeline: recentLogs,
    });
  } catch (err: unknown) {
    console.error("Error computing log stats:", err);
    return NextResponse.json({ error: "Failed to compute log statistics" }, { status: 500 });
  }
}

