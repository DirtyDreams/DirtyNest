import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchDockerStacks } from "@/lib/docker/sidecar";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stacks = await fetchDockerStacks();
  return NextResponse.json({ stacks, count: stacks.length });
}
