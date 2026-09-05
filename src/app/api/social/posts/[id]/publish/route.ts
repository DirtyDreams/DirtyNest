import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertAuditLog, insertLog } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { executePublish } from "@/lib/social/publish";

const publishSchema = z.object({
  approved: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const parsed = publishSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { approved } = parsed.data;

  const rows = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, postId), eq(socialPosts.user_id, userId)));
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Already published / failed / cancelled — nothing to do.
  if (post.status === "published") {
    return NextResponse.json({ error: "Post already published" }, { status: 409 });
  }
  if (post.status === "awaiting_hitl") {
    return NextResponse.json(
      { error: "Post is awaiting HITL approval", status: "awaiting_hitl" },
      { status: 403 },
    );
  }

  // Scheduled posts were pre-approved at scheduling time → publish directly.
  // Draft posts require an explicit HITL approval entry.
  if (post.status === "draft" && !approved) {
    await db
      .update(socialPosts)
      .set({ status: "awaiting_hitl", updated_at: new Date().toISOString() })
      .where(eq(socialPosts.id, postId));
    return NextResponse.json(
      { error: "HITL approval required", status: "awaiting_hitl", post_id: postId },
      { status: 403 },
    );
  }

  const outcome = await executePublish(post);

  try {
    await insertLog(
      outcome.ok ? "SUCCESS" : "ERROR",
      "UI",
      "SOCIAL_POST_PUBLISHED",
      "User-Operator",
      { postId, platform: post.platform, ok: outcome.ok, error: outcome.error },
    );
  } catch {}

  await insertAuditLog(
    outcome.ok ? "AUDIT" : "ERROR",
    "UI",
    "SOCIAL_POST_PUBLISHED",
    "User-Operator",
    { postId, platform: post.platform, ok: outcome.ok, error: outcome.error },
    userId,
  );

  return NextResponse.json({
    post_id: postId,
    status: outcome.status,
    platform_post_id: outcome.platform_post_id,
    error: outcome.error,
  });
}
