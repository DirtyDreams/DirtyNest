import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { pruneDockerSystem } from "@/lib/docker/sidecar";
import { insertAuditLog } from "@/lib/db";

export async function POST(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await pruneDockerSystem();

  await insertAuditLog(
    result.status === "success" ? "AUDIT" : "ERROR",
    "DOCKER",
    "DOCKER_SYSTEM_PRUNE",
    "User-Operator",
    { status: result.status, output: result.output, error: result.error },
    userId
  );

  return NextResponse.json(result);
}
