/**
 * Thin client for the sidecar Threat-Intel CVE feed (F6.2). Best-effort:
 * failures degrade to an empty list so the UI never blocks on the sidecar.
 */

import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export interface CveItem {
  cve_id: string;
  title: string;
  description: string;
  severity: string;
  cvss_score: string;
  published_at: string;
  source: string;
  url: string;
}

/** Fetch recent CVEs from the sidecar feed. */
export async function fetchCveFeed(force = false): Promise<CveItem[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/intel/cve?force=${force}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { cves?: CveItem[] };
    return data.cves ?? [];
  } catch {
    return [];
  }
}
