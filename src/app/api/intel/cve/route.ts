import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { intelCves } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchCveFeed, type CveItem } from "@/lib/intel/sidecar";

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  // Fetch from the sidecar feed (best-effort).
  const cves = await fetchCveFeed(force);

  // Persist new CVEs to the intel_cves cache table (idempotent by cve_id).
  let persisted = 0;
  for (const cve of cves) {
    try {
      const existing = await db
        .select({ id: intelCves.id })
        .from(intelCves)
        .where(eq(intelCves.cve_id, cve.cve_id));
      if (existing.length > 0) continue;
      await db.insert(intelCves).values({
        cve_id: cve.cve_id,
        title: cve.title,
        description: cve.description,
        severity: cve.severity,
        cvss_score: cve.cvss_score,
        published_at: cve.published_at || null,
        source: cve.source,
        url: cve.url,
        raw_json: JSON.stringify(cve),
        created_at: new Date().toISOString(),
      });
      persisted += 1;
    } catch {
      // skip individual insert failures; keep the rest
    }
  }

  // Return the cached DB rows (fall back to the live feed if empty).
  const cached = await db.select().from(intelCves).orderBy(desc(intelCves.published_at)).limit(200);
  const items: CveItem[] =
    cached.length > 0
      ? cached.map((c) => ({
          cve_id: c.cve_id,
          title: c.title,
          description: c.description ?? "",
          severity: c.severity,
          cvss_score: c.cvss_score ?? "",
          published_at: c.published_at ?? "",
          source: c.source,
          url: c.url ?? "",
        }))
      : cves;

  return NextResponse.json({ cves: items, count: items.length, persisted });
}
