import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const { duration_minutes, type } = await req.json();

    if (typeof duration_minutes !== "number" || !type) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = await getDb();
    db.run(
      "INSERT INTO focus_sessions (duration_minutes, type) VALUES (?, ?)",
      [duration_minutes, type]
    );

    // Save DB file since we're using sql.js in memory/disk hybrid
    // The getDb method should ideally save the file if we change it, but currently getDb doesn't have a save method.
    // Let's implement a simple save if we are using sql.js.
    // Wait, getDb returns sql.js Database instance. We need to save it back to disk.
    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "dirtynest.db");
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Focus session save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
