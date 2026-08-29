/**
 * Shared social post publish logic (F5). Used by the publish route and the
 * HITL gate resolve route. Publishes through the sidecar adapter and updates
 * PG metadata. Best-effort: if the sidecar is down, the post is marked failed
 * with a descriptive error rather than blocking.
 */

import { db } from "@/lib/db";
import { socialPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { publishToSidecar } from "./sidecar";

export interface PublishOutcome {
  ok: boolean;
  status: "published" | "failed";
  platform_post_id: string | null;
  error: string | null;
}

/**
 * Publish a post through its platform adapter and persist the outcome.
 * `post` must already be loaded and ownership-verified by the caller.
 */
export async function executePublish(post: {
  id: number;
  platform: string;
  text: string;
  account_id: number | null;
}): Promise<PublishOutcome> {
  const result = await publishToSidecar(post.platform, post.text);
  if (result.ok) {
    await db
      .update(socialPosts)
      .set({
        status: "published",
        platform_post_id: result.platform_post_id,
        published_time: new Date().toISOString(),
        error: null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(socialPosts.id, post.id));
    return {
      ok: true,
      status: "published",
      platform_post_id: result.platform_post_id,
      error: null,
    };
  }

  await db
    .update(socialPosts)
    .set({
      status: "failed",
      error: result.error,
      updated_at: new Date().toISOString(),
    })
    .where(eq(socialPosts.id, post.id));
  return { ok: false, status: "failed", platform_post_id: null, error: result.error };
}
