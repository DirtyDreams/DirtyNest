import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { socialMetrics, socialPosts } from "@/lib/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  // All posts owned by this user (to scope metrics by ownership).
  const posts = await db
    .select({ id: socialPosts.id, platform: socialPosts.platform })
    .from(socialPosts)
    .where(eq(socialPosts.user_id, userId));
  const postIds = posts.map((p) => p.id);
  if (postIds.length === 0) {
    return NextResponse.json({ analytics: { total_posts: 0, by_platform: {}, totals: {} } });
  }

  const metrics = await db
    .select()
    .from(socialMetrics)
    .where(
      platform
        ? and(eq(socialMetrics.platform, platform), inArray(socialMetrics.post_id, postIds))
        : inArray(socialMetrics.post_id, postIds),
    )
    .orderBy(desc(socialMetrics.collected_at));

  const byPlatform: Record<string, { posts: number; reach: number; engagement: number; likes: number; comments: number; shares: number }> = {};
  const totals = { reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0 };

  for (const m of metrics) {
    const key = m.platform;
    if (!byPlatform[key]) {
      byPlatform[key] = { posts: 0, reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0 };
    }
    byPlatform[key].posts += 1;
    byPlatform[key].reach += m.reach;
    byPlatform[key].engagement += m.engagement;
    byPlatform[key].likes += m.likes;
    byPlatform[key].comments += m.comments;
    byPlatform[key].shares += m.shares;
    totals.reach += m.reach;
    totals.engagement += m.engagement;
    totals.likes += m.likes;
    totals.comments += m.comments;
    totals.shares += m.shares;
  }

  return NextResponse.json({
    analytics: {
      total_posts: posts.length,
      by_platform: byPlatform,
      totals,
    },
  });
}
