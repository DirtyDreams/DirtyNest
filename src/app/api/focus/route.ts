import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const { duration_minutes, type } = await req.json();

    if (
      typeof duration_minutes !== "number" ||
      duration_minutes <= 0 ||
      duration_minutes > 1440 ||
      !type ||
      typeof type !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid payload: duration must be between 1 and 1440 minutes" },
        { status: 400 }
      );
    }

    await initDb();
    await db.insert(schema.focusSessions).values({
      duration_minutes,
      type: type.slice(0, 50),
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Focus session save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

