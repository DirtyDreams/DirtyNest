import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchDockerLogs } from "@/lib/docker/sidecar";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const tailParam = searchParams.get("tail");
  const tail = tailParam ? parseInt(tailParam, 10) || 150 : 150;

  const logs = await fetchDockerLogs(id, tail);
  return NextResponse.json({ container_id: id, logs, tail });
}
