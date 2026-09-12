import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { manageDockerStack } from "@/lib/docker/sidecar";
import { insertAuditLog } from "@/lib/db";

const stackActionSchema = z.object({
  action: z.enum(["restart", "stop", "start", "up", "down"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await params;
  const parsed = stackActionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stack action" }, { status: 400 });
  }

  const result = await manageDockerStack(name, parsed.data.action);

  await insertAuditLog(
    result.status === "success" ? "AUDIT" : "ERROR",
    "DOCKER",
    `DOCKER_STACK_${parsed.data.action.toUpperCase()}`,
    "User-Operator",
    { stack: name, action: parsed.data.action, status: result.status, error: result.error },
    userId
  );

  return NextResponse.json(result);
}
