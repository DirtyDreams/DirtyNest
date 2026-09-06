import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/hermes/cron`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Sidecar cron unreachable" }, { status: res.status });
    }
    const data = (await res.json()) as { cron_jobs?: unknown[] };
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
