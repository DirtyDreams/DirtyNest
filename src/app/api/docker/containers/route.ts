import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchDockerContainers } from "@/lib/docker/sidecar";

export async function GET(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const containers = await fetchDockerContainers();
  return NextResponse.json({ containers, count: containers.length });
}
