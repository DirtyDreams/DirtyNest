import { NextResponse } from "next/server";
import { getDb } from "@/db";

export async function GET() {
  try {
    const db = await getDb();
    
    // Create table if it doesn't exist (just in case)
    db.run(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration_minutes INTEGER NOT NULL,
        type TEXT NOT NULL,
        completed_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const res = db.exec("SELECT SUM(duration_minutes) as total FROM focus_sessions WHERE type = 'work'");
    
    let total = 0;
    if (res.length > 0 && res[0].values.length > 0 && res[0].values[0][0]) {
      total = res[0].values[0][0] as number;
    }

    return NextResponse.json({ total_minutes: total });
  } catch (error: any) {
    console.error("Failed to fetch focus stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
