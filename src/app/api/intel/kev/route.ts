import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchKevFeed } from "@/lib/intel/sidecar";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  const kevs = await fetchKevFeed(force);
  return NextResponse.json({ vulnerabilities: kevs, count: kevs.length });
}
