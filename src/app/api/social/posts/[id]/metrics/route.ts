import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { socialMetrics, socialPosts } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function GET(
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

  const postRows = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, postId), eq(socialPosts.user_id, userId)));
  const post = postRows[0];
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const metrics = await db
    .select()
    .from(socialMetrics)
    .where(eq(socialMetrics.post_id, postId))
    .orderBy(desc(socialMetrics.collected_at));

  return NextResponse.json({ post_id: postId, metrics });
}
