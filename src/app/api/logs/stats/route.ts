import { NextResponse } from "next/server";
import { getDb, queryAll } from "@/db";

export async function GET() {
  try {
    const db = await getDb();

    // Single consolidated aggregation for totals, error counts, warn counts, and latency
    const summaryRes = queryAll<{
      total: number;
      errorCount: number;
      warnCount: number;
      avgLat: number;
      maxLat: number;
    }>(
      db,
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as errorCount,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warnCount,
        AVG(latency_ms) as avgLat,
        MAX(latency_ms) as maxLat
      FROM system_logs`
    );

    const summary = summaryRes[0] || { total: 0, errorCount: 0, warnCount: 0, avgLat: 0, maxLat: 0 };
    const total = summary.total || 0;
    const errorCount = summary.errorCount || 0;
    const warnCount = summary.warnCount || 0;
    const avgLatency = summary.avgLat ? Math.round(summary.avgLat * 10) / 10 : 0;
    const maxLatency = summary.maxLat || 0;

    // Levels breakdown
    const levelCountsRes = queryAll<{ level: string; count: number }>(
      db,
      "SELECT level, COUNT(*) as count FROM system_logs GROUP BY level ORDER BY count DESC"
    );

    // Categories breakdown
    const catCountsRes = queryAll<{ category: string; count: number }>(
      db,
      "SELECT category, COUNT(*) as count FROM system_logs GROUP BY category ORDER BY count DESC"
    );

    // Top Actors
    const actorCountsRes = queryAll<{ actor: string; count: number }>(
      db,
      "SELECT actor, COUNT(*) as count FROM system_logs GROUP BY actor ORDER BY count DESC LIMIT 8"
    );

    // Top Actions
    const actionCountsRes = queryAll<{ action: string; count: number }>(
      db,
      "SELECT action, COUNT(*) as count FROM system_logs GROUP BY action ORDER BY count DESC LIMIT 8"
    );

    // Recent logs timeline
    const recentLogs = queryAll<{ timestamp: string; level: string }>(
      db,
      "SELECT timestamp, level FROM system_logs ORDER BY timestamp DESC LIMIT 60"
    );

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
