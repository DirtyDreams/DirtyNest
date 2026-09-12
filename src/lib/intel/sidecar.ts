/**
 * Thin client for the sidecar Threat-Intel & Security Mesh Radar (Step 8).
 * Best-effort: failures degrade cleanly so the UI never blocks on the sidecar.
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

export interface KevItem {
  cve_id: string;
  title: string;
  vendor: string;
  product: string;
  description: string;
  required_action: string;
  due_date: string;
  date_added: string;
  ransomware_use: string;
  severity: string;
  is_actively_exploited: boolean;
  source: string;
  url: string;
}

export interface PortScanItem {
  port: number;
  service: string;
  role: string;
  target: string;
  open: boolean;
  latency_ms: number;
  error: string | null;
  timestamp: number;
}

export interface PortScanResult {
  target: string;
  scan: PortScanItem[];
  open_count: number;
  total_services: number;
}

export interface ThreatRadarSummary {
  posture: string;
  kev_total_weaponized: number;
  kev_ransomware_linked: number;
  recent_cve_count: number;
  critical_cve_count: number;
  high_cve_count: number;
  mesh_total_services: number;
  mesh_healthy_services: number;
  mesh_ports: PortScanItem[];
  top_threats: Array<CveItem | KevItem>;
  timestamp: number;
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

/** Fetch CISA Known Exploited Vulnerabilities catalog. */
export async function fetchKevFeed(force = false): Promise<KevItem[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/intel/kev?force=${force}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { vulnerabilities?: KevItem[] };
    return data.vulnerabilities ?? [];
  } catch {
    return [];
  }
}

/** Trigger zero-trust TCP port scan across DirtyNest infrastructure. */
export async function scanLocalPorts(host = "127.0.0.1"): Promise<PortScanResult> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/intel/ports?host=${encodeURIComponent(host)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return { target: host, scan: [], open_count: 0, total_services: 0 };
    }
    return (await res.json()) as PortScanResult;
  } catch {
    return { target: host, scan: [], open_count: 0, total_services: 0 };
  }
}

/** Aggregate threat radar summary posture snapshot. */
export async function fetchThreatRadarSummary(): Promise<ThreatRadarSummary | null> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/intel/summary`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.json()) as ThreatRadarSummary;
  } catch {
    return null;
  }
}

