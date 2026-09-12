const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export interface MissionRunLog {
  timestamp: number;
  status: "SUCCESS" | "ERROR" | "SKIPPED";
  duration_ms: number;
  summary: string;
  details?: Record<string, unknown>;
}

export interface MissionMetadata {
  id: string;
  name: string;
  description: string;
  category: "SECURITY" | "CREATIVE" | "PORTAL";
  cron: string;
  interval_seconds: number;
  status: "IDLE" | "RUNNING" | "PAUSED" | "ERROR";
  enabled: boolean;
  last_run: number | null;
  next_run: number | null;
  run_count: number;
  history: MissionRunLog[];
}

export async function fetchMissions(): Promise<MissionMetadata[]> {
  try {
    const res = await fetch(`${SIDECAR_URL}/api/missions`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.missions || [];
  } catch {
    return [];
  }
}

export async function triggerMission(missionId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${SIDECAR_URL}/api/missions/${encodeURIComponent(missionId)}/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: err.detail || "Trigger failed" };
    }
    return await res.json();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

export async function toggleMission(missionId: string): Promise<{ ok: boolean; mission?: MissionMetadata }> {
  try {
    const res = await fetch(`${SIDECAR_URL}/api/missions/${encodeURIComponent(missionId)}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}
