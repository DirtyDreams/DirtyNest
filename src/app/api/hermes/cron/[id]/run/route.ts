import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/hermes/cron/${encodeURIComponent(id)}/run`, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }
    const data = (await res.json()) as { status?: string; message?: string };
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
