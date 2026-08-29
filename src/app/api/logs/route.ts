import { NextRequest, NextResponse } from "next/server";
import { db, initDb, insertLog, LogLevel, LogCategory } from "@/db";
import * as schema from "@/lib/schema";
import { and, desc, eq, ilike, or, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";
    const timeRange = searchParams.get("timeRange") || "all";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const conditions = [];

    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.systemLogs.action, term),
          ilike(schema.systemLogs.actor, term),
          ilike(schema.systemLogs.details, term),
          ilike(schema.systemLogs.hash_sig, term)
        )
      );
    }

    if (level && level !== "ALL") {
      conditions.push(eq(schema.systemLogs.level, level));
    }

    if (category && category !== "ALL") {
      conditions.push(eq(schema.systemLogs.category, category));
    }

    if (timeRange && timeRange !== "all") {
      let minutes = 0;
      if (timeRange === "15m") minutes = 15;
      else if (timeRange === "1h") minutes = 60;
      else if (timeRange === "6h") minutes = 360;
      else if (timeRange === "24h") minutes = 1440;
      else if (timeRange === "7d") minutes = 10080;

      if (minutes > 0) {
        const threshold = new Date(Date.now() - minutes * 60 * 1000).toISOString();
        conditions.push(gte(schema.systemLogs.timestamp, threshold));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total filtered count
    const countRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.systemLogs)
      .where(whereClause);
    const total = countRes[0]?.count || 0;

    // Fetch logs ordered newest first
    const logs = await db
      .select()
      .from(schema.systemLogs)
      .where(whereClause)
      .orderBy(desc(schema.systemLogs.timestamp), desc(schema.systemLogs.id))
      .limit(limit)
      .offset(offset);

    // Quick level counters across all logs
    const allStatsRes = await db
      .select({
        level: schema.systemLogs.level,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.level);

    const levelCounts: Record<string, number> = {
      INFO: 0,
      SUCCESS: 0,
      WARN: 0,
      ERROR: 0,
      AUDIT: 0,
      DEBUG: 0,
    };
    allStatsRes.forEach((r) => {
      levelCounts[r.level] = r.count;
    });

    const categoryStatsRes = await db
      .select({
        category: schema.systemLogs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.systemLogs)
      .groupBy(schema.systemLogs.category)
      .orderBy(desc(sql`count(*)`));

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      stats: {
        totalLogs: total,
        levelCounts,
        categoryCounts: categoryStatsRes,
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching logs:", err);
    return NextResponse.json({ error: "Failed to query system logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      level = "INFO",
      category = "SYSTEM",
      action,
      actor = "User-UI",
      details,
      latency_ms = 0,
      status_code = "200",
      ip_origin = "127.0.0.1",
    } = body;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const logId = await insertLog(
      level as LogLevel,
      category as LogCategory,
      action,
      actor,
      details,
      latency_ms,
      status_code,
      ip_origin
    );

    return NextResponse.json({ success: true, logId }, { status: 201 });
  } catch (err: unknown) {
    console.error("Error inserting log:", err);
    return NextResponse.json({ error: "Failed to record system log" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const purgeAll = searchParams.get("all") === "true";
    const level = searchParams.get("level");

    if (purgeAll) {
      await db.delete(schema.systemLogs);
      await insertLog("AUDIT", "SYSTEM", "LOGS_PURGED_ALL", "Admin-Operator", { reason: "Manual system purge" });
    } else if (level) {
      await db.delete(schema.systemLogs).where(eq(schema.systemLogs.level, level));
      await insertLog("AUDIT", "SYSTEM", `LOGS_PURGED_LEVEL_${level}`, "Admin-Operator", { level });
    } else {
      return NextResponse.json({ error: "Specify ?all=true or ?level=LEVEL to purge" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Logs purged successfully" });
  } catch (err: unknown) {
    console.error("Error purging logs:", err);
    return NextResponse.json({ error: "Failed to purge logs" }, { status: 500 });
  }
}

