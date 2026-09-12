import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { scanLocalPorts } from "@/lib/intel/sidecar";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const host = searchParams.get("host") || "127.0.0.1";

  const result = await scanLocalPorts(host);
  return NextResponse.json(result);
}
