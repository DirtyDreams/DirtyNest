import { db } from "@/db";
import { zbRules } from "@/lib/schema";
import { getRules, publishedToday } from "@/lib/zbiornik/ops";
import {  } from "drizzle-orm";

export const dynamic = "force-dynamic";

const QUIET_RE = /^([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$/;

export async function GET() {
  try {
    const [rules, usedToday] = await Promise.all([getRules(), publishedToday()]);
    return Response.json({ rules, usedToday });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "rules get failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      max_per_day?: number;
      min_gap_minutes?: number;
      quiet_hours?: string;
    };
    const updates: Array<{ key: string; value: string }> = [];

    if (body.max_per_day !== undefined) {
      const v = Number(body.max_per_day);
      if (!Number.isInteger(v) || v < 1 || v > 100) return Response.json({ error: "max_per_day: 1..100" }, { status: 400 });
      updates.push({ key: "max_per_day", value: String(v) });
    }
    if (body.min_gap_minutes !== undefined) {
      const v = Number(body.min_gap_minutes);
      if (!Number.isFinite(v) || v < 0 || v > 720) return Response.json({ error: "min_gap_minutes: 0..720" }, { status: 400 });
      updates.push({ key: "min_gap_minutes", value: String(v) });
    }
    if (body.quiet_hours !== undefined) {
      const v = String(body.quiet_hours).trim();
      if (!QUIET_RE.test(v)) return Response.json({ error: 'quiet_hours format "HH:MM-HH:MM"' }, { status: 400 });
      updates.push({ key: "quiet_hours", value: v });
    }

    const now = new Date().toISOString();
    for (const u of updates) {
      await db
        .insert(zbRules)
        .values({ key: u.key, value: u.value, updated_at: now })
        .onConflictDoUpdate({ target: zbRules.key, set: { value: u.value, updated_at: now } });
    }

    const rules = await getRules();
    return Response.json({ ok: true, rules });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "rules patch failed" }, { status: 500 });
  }
}