import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

const cancelSchema = z.object({
  session_id: z.string().min(1),
});

/**
 * Cancel a running ACP session execution. Auth-gated by middleware; proxies to
 * the sidecar ACP bridge. Best-effort: sidecar failure returns 502.
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = cancelSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/hermes/acp/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Cancel failed" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Sidecar unavailable" }, { status: 502 });
  }
}
