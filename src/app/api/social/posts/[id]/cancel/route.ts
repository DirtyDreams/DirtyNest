import { NextRequest, NextResponse } from "next/server";
import { db, initDb, insertLog } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

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

  const rows = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, postId), eq(socialPosts.user_id, userId)));
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Only pending states can be cancelled.
  if (post.status !== "draft" && post.status !== "scheduled" && post.status !== "awaiting_hitl") {
    return NextResponse.json({ error: `Post in state '${post.status}' cannot be cancelled` }, { status: 409 });
  }

  await db
    .update(socialPosts)
    .set({ status: "cancelled", updated_at: new Date().toISOString() })
    .where(eq(socialPosts.id, postId));

  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_POST_CANCELLED", "User-Operator", { postId });
  } catch {}

  return NextResponse.json({ ok: true, status: "cancelled" });
}
