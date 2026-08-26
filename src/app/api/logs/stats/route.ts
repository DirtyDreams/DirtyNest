import { NextResponse } from "next/server";
import { getDb, queryAll } from "@/db";

export async function GET() {
  try {
    const db = await getDb();

    // Total count
    const countRes = queryAll<{ total: number }>(db, "SELECT COUNT(*) as total FROM system_logs");
    const total = countRes.length > 0 ? countRes[0].total : 0;

    // Error & Warn count
    const errRes = queryAll<{ errorCount: number }>(
      db,
      "SELECT COUNT(*) as errorCount FROM system_logs WHERE level = 'ERROR'"
    );
    const errorCount = errRes.length > 0 ? errRes[0].errorCount : 0;

    const warnRes = queryAll<{ warnCount: number }>(
      db,
      "SELECT COUNT(*) as warnCount FROM system_logs WHERE level = 'WARN'"
    );
    const warnCount = warnRes.length > 0 ? warnRes[0].warnCount : 0;

    // Average latency
    const latRes = queryAll<{ avgLat: number; maxLat: number }>(
      db,
      "SELECT AVG(latency_ms) as avgLat, MAX(latency_ms) as maxLat FROM system_logs"
    );
    const avgLatency = latRes.length > 0 && latRes[0].avgLat ? Math.round(latRes[0].avgLat * 10) / 10 : 0;
    const maxLatency = latRes.length > 0 ? latRes[0].maxLat : 0;

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

    // Recent logs timeline (mock/aggregated recent hourly distribution or timestamps)
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
