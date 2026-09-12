import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { toggleMission } from "@/lib/missions/sidecar";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const result = await toggleMission(id);
  if (!result.ok) {
    return NextResponse.json({ error: "Failed to toggle mission" }, { status: 400 });
  }
  return NextResponse.json(result);
}
