import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${SIDECAR_URL}/api/cdp/status`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return NextResponse.json({ is_connected: false, error: "Sidecar error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ is_connected: false, error: msg }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${SIDECAR_URL}/api/cdp/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Sidecar error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
