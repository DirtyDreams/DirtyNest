/**
 * Thin client for the sidecar Social Media adapters (F5). Best-effort:
 * failures degrade to a no-op result so PG metadata never blocks on the
 * sidecar being down.
 */

import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export interface SocialPublishResult {
  ok: boolean;
  platform_post_id: string | null;
  error: string | null;
}

export interface SocialAdapterInfo {
  platform: string;
  adapter: string;
}

/** List the platform adapters the sidecar can publish to. */
export async function listSocialAdapters(): Promise<SocialAdapterInfo[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/social/adapters`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { platforms?: SocialAdapterInfo[] };
    return data.platforms ?? [];
  } catch {
    return [];
  }
}

/** Proxy a publish to the sidecar adapter for the given platform. */
export async function publishToSidecar(
  platform: string,
  text: string,
  opts: { post_id?: string; subreddit?: string } = {},
): Promise<SocialPublishResult> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/social/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, text, ...opts }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, platform_post_id: null, error: `sidecar publish HTTP ${res.status}` };
    const data = (await res.json()) as SocialPublishResult;
    return {
      ok: Boolean(data.ok),
      platform_post_id: data.platform_post_id ?? null,
      error: data.error ?? null,
    };
  } catch {
    return { ok: false, platform_post_id: null, error: "sidecar unreachable" };
  }
}
