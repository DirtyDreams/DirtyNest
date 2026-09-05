import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { executePublish } from "@/lib/social/publish";

const resolveSchema = z.object({
  post_id: z.number().int().positive(),
  decision: z.enum(["ALLOW", "DENY"]),
});

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = resolveSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { post_id: postId, decision } = parsed.data;

  const rows = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, postId), eq(socialPosts.user_id, userId)));
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Only posts awaiting HITL can be resolved.
  if (post.status !== "awaiting_hitl") {
    return NextResponse.json({ error: `Post is not awaiting HITL (status '${post.status}')` }, { status: 409 });
  }

  if (decision === "DENY") {
    await db
      .update(socialPosts)
      .set({ status: "cancelled", updated_at: new Date().toISOString() })
      .where(eq(socialPosts.id, postId));
    try {
      await insertLog("SUCCESS", "UI", "SOCIAL_HITL_DENIED", "User-Operator", { postId });
    } catch {}
    return NextResponse.json({ post_id: postId, status: "cancelled", decision: "DENY" });
  }

  const outcome = await executePublish(post);

  try {
    await insertLog(
      outcome.ok ? "SUCCESS" : "ERROR",
      "UI",
      "SOCIAL_HITL_ALLOWED",
      "User-Operator",
      { postId, platform: post.platform, ok: outcome.ok, error: outcome.error },
    );
  } catch {}

  return NextResponse.json({
    post_id: postId,
    status: outcome.status,
    decision: "ALLOW",
    platform_post_id: outcome.platform_post_id,
    error: outcome.error,
  });
}
