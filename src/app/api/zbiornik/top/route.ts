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
      const mockItems = [
        { nick: "CyberValkyrie", fans: 4820, favs: 1204, likes: 9320, points: 5992, url: "https://zbiornik.com" },
        { nick: "NeonSpectre", fans: 3910, favs: 980, likes: 7840, points: 4890, url: "https://zbiornik.com" },
        { nick: "ShadowKitten", fans: 3120, favs: 850, likes: 6200, points: 3910, url: "https://zbiornik.com" },
        { nick: "GlitchQueen", fans: 2840, favs: 710, likes: 5400, points: 3522, url: "https://zbiornik.com" },
        { nick: "AuroraPulse", fans: 2190, favs: 530, likes: 4100, points: 2706, url: "https://zbiornik.com" },
      ];
      return Response.json({ ok: true, items: mockItems, accType: null, fallback: true });
    }
    const data = (result.data ?? {}) as { items?: unknown[]; accType?: number | null };
    return Response.json({ ok: true, items: data.items ?? [], accType: data.accType ?? null });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "top failed" }, { status: 500 });
  }
}