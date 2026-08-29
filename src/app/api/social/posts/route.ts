import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const createPostSchema = z.object({
  platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "reddit"]),
  text: z.string().trim().min(1).max(10000),
  account_id: z.number().int().positive().optional(),
  media_urls: z.array(z.string().url()).max(10).default([]),
  status: z.enum(["draft", "scheduled"]).default("draft"),
  scheduled_time: z.string().optional(),
  cron_expression: z.string().optional(),
  repeat_until: z.string().optional(),
});

function parseMedia(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  const conditions = [eq(socialPosts.user_id, userId)];
  if (status) conditions.push(eq(socialPosts.status, status));
  if (platform) conditions.push(eq(socialPosts.platform, platform));

  const posts = await db
    .select()
    .from(socialPosts)
    .where(and(...conditions))
    .orderBy(desc(socialPosts.created_at));

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      media_urls: parseMedia(p.media_urls),
      metrics: parseMedia(p.metrics),
    })),
  });
}

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createPostSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { platform, text, account_id, media_urls, status, scheduled_time, cron_expression, repeat_until } =
    parsed.data;
  const now = new Date().toISOString();

  // A scheduled post must have a scheduled_time.
  if (status === "scheduled" && !scheduled_time) {
    return NextResponse.json({ error: "scheduled_time is required for scheduled posts" }, { status: 400 });
  }

  const res = await db
    .insert(socialPosts)
    .values({
      user_id: userId,
      account_id: account_id ?? null,
      platform,
      text,
      media_urls: JSON.stringify(media_urls),
      status,
      scheduled_time: scheduled_time ?? null,
      cron_expression: cron_expression ?? null,
      repeat_until: repeat_until ?? null,
      created_at: now,
      updated_at: now,
    })
    .returning();

  const post = res[0];
  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_POST_CREATED", "User-Operator", {
      postId: post.id,
      platform,
      status,
    });
  } catch {}

  return NextResponse.json(
    { post: { ...post, media_urls: parseMedia(post.media_urls), metrics: parseMedia(post.metrics) } },
    { status: 201 },
  );
}
