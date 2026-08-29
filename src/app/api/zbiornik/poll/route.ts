import { ingestPoll, sidecarPost } from "@/lib/zbiornik/ops";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const res = await sidecarPost("/api/automations/zbiornik/poll", { topic_limit: 30, inbox_limit: 20, notif_limit: 20 }, 280_000);
    if (!res.ok || !res.data) {
      const code = res.error?.includes("timeout") ? "SIDECAR_TIMEOUT" : "SIDECAR_DOWN";
      return Response.json({ ok: false, error: res.error ?? "sidecar poll failed", code }, { status: 502 });
    }
    const ingested = await ingestPoll(res.data);
    const counts = (res.data.counts ?? {}) as Record<string, unknown>;
    return Response.json({
      ok: ingested.ok,
      at: res.data.at ?? null,
      loginCode: ingested.loginCode,
      counts,
      topicsNew: ingested.topicsNew,
      privDrafts: ingested.privDrafts,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "poll failed" }, { status: 500 });
  }
}