import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${SIDECAR_URL}/api/social/publish-due`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
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
