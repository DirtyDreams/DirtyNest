import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { pullDockerImage } from "@/lib/docker/sidecar";
import { insertAuditLog } from "@/lib/db";

const pullSchema = z.object({
  image: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = pullSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Image name is required" }, { status: 400 });
  }

  const result = await pullDockerImage(parsed.data.image);

  await insertAuditLog(
    result.status === "success" ? "AUDIT" : "ERROR",
    "DOCKER",
    "DOCKER_IMAGE_PULL",
    "User-Operator",
    { image: parsed.data.image, status: result.status, error: result.error },
    userId
  );

  return NextResponse.json(result);
}
