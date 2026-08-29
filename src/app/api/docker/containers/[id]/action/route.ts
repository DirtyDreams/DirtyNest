import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertAuditLog } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart", "pause", "unpause"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = actionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const { action } = parsed.data;

  // Proxy to the sidecar docker engine (best-effort).
  let result: { status: string; error?: string } = { status: "error", error: "sidecar unreachable" };
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/containers/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(15000),
    });
    result = (await res.json()) as { status: string; error?: string };
  } catch {
    // fall through with the default error result
  }

  await insertAuditLog(
    result.status === "success" ? "AUDIT" : "ERROR",
    "DOCKER",
    `DOCKER_CONTAINER_${action.toUpperCase()}`,
    "User-Operator",
    { container_id: id, action, ok: result.status === "success", error: result.error },
    userId,
  );

  return NextResponse.json(result);
}
