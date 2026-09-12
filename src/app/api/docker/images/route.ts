import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchDockerImages } from "@/lib/docker/sidecar";

export async function GET(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await fetchDockerImages();
  return NextResponse.json({ images, count: images.length });
}
