import { sidecarPost } from "@/lib/zbiornik/ops";

export const dynamic = "force-dynamic";

/**
 * Read-only mirror of the portal's OWN public leaderboard (getRanking).
 * Contract note (docs/zbiornik-ops.md §6): display-only; no exports,
 * no bulk outreach features. accType filter: 2=kobieta, 3=para.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 300);
    const accTypeRaw = url.searchParams.get("accType");
    const args = [String(limit)];
    if (accTypeRaw && Number.isFinite(Number(accTypeRaw))) args.push(String(Number(accTypeRaw)));

    const res = await sidecarPost("/api/automations/zbiornik/read", { op: "top-list", args }, 90_000);
    const result = (res.data?.result ?? {}) as Record<string, unknown>;
    if (!res.ok || result.ok !== true) {
      return Response.json({ error: String((result as { message?: string }).message || res.error || "ranking failed") }, { status: 502 });
    }
    const data = (result.data ?? {}) as { items?: unknown[]; accType?: number | null };
    return Response.json({ ok: true, items: data.items ?? [], accType: data.accType ?? null });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "top failed" }, { status: 500 });
  }
}