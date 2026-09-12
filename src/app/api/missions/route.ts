import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchMissions } from "@/lib/missions/sidecar";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const missions = await fetchMissions();
  return NextResponse.json({ missions, count: missions.length });
}
