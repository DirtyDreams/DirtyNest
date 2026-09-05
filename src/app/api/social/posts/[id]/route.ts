import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const updatePostSchema = z.object({
  text: z.string().trim().min(1).max(10000).optional(),
  account_id: z.number().int().positive().nullable().optional(),
  media_urls: z.array(z.string().url()).max(10).optional(),
  status: z.enum(["draft", "scheduled", "cancelled"]).optional(),
  scheduled_time: z.string().nullable().optional(),
  cron_expression: z.string().nullable().optional(),
  repeat_until: z.string().nullable().optional(),
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

async function loadOwnedPost(userId: number, postId: number) {
  const rows = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, postId), eq(socialPosts.user_id, userId)));
  return rows[0] ?? null;
}

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

  const post = await loadOwnedPost(userId, postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  return NextResponse.json({ post: { ...post, media_urls: parseMedia(post.media_urls), metrics: parseMedia(post.metrics) } });
}

export async function PUT(
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

  const post = await loadOwnedPost(userId, postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Only drafts and scheduled posts are editable.
  if (post.status !== "draft" && post.status !== "scheduled") {
    return NextResponse.json({ error: "Only draft or scheduled posts can be edited" }, { status: 409 });
  }

  const parsed = updatePostSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (data.text !== undefined) patch.text = data.text;
  if (data.account_id !== undefined) patch.account_id = data.account_id;
  if (data.media_urls !== undefined) patch.media_urls = JSON.stringify(data.media_urls);
  if (data.status !== undefined) patch.status = data.status;
  if (data.scheduled_time !== undefined) patch.scheduled_time = data.scheduled_time;
  if (data.cron_expression !== undefined) patch.cron_expression = data.cron_expression;
  if (data.repeat_until !== undefined) patch.repeat_until = data.repeat_until;

  const res = await db.update(socialPosts).set(patch).where(eq(socialPosts.id, postId)).returning();
  const updated = res[0];

  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_POST_UPDATED", "User-Operator", { postId });
  } catch {}

  return NextResponse.json({ post: { ...updated, media_urls: parseMedia(updated.media_urls), metrics: parseMedia(updated.metrics) } });
}

export async function DELETE(
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

  const post = await loadOwnedPost(userId, postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await db.delete(socialPosts).where(eq(socialPosts.id, postId));

  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_POST_DELETED", "User-Operator", { postId });
  } catch {}

  return NextResponse.json({ ok: true });
}
