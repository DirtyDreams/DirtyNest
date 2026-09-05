import { ingestPoll, logActivity } from "@/lib/zbiornik/ops";

export const dynamic = "force-dynamic";

/**
 * Ingest push from the sidecar (best-effort bridge). Body: { source, poll }.
 * Idempotent: topics upsert by portal_ref, priv drafts deduped.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { source?: string; poll?: Record<string, unknown> };
    if (!body.poll || typeof body.poll !== "object") {
      return Response.json({ error: "poll payload required" }, { status: 400 });
    }
    const result = await ingestPoll(body.poll);
    await logActivity({ op: "ingest", ok: true, message: `push from ${body.source ?? "unknown"}` });
    return Response.json({ ...result });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "ingest failed" }, { status: 500 });
  }
}