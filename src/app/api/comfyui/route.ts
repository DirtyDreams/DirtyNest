import { NextRequest, NextResponse } from "next/server";

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    let targetEndpoint = `${SIDECAR_URL}/api/comfy/stats`;
    if (action === "checkpoints") {
      targetEndpoint = `${SIDECAR_URL}/api/comfy/checkpoints`;
    } else if (action === "queue") {
      targetEndpoint = `${SIDECAR_URL}/api/comfy/queue`;
    } else if (action === "history") {
      const limit = searchParams.get("limit") || "20";
      targetEndpoint = `${SIDECAR_URL}/api/comfy/history?limit=${limit}`;
    }

    const res = await fetch(targetEndpoint, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Sidecar returned ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, online: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${SIDECAR_URL}/api/comfy/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(150000), // 2.5 mins max for image generation
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Sidecar error (${res.status}): ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
