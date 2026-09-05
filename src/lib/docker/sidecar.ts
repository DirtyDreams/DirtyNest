/**
 * Thin client for the sidecar Docker engine (F6.1). Best-effort: failures
 * degrade to empty lists so the UI never blocks on the sidecar.
 */

import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export interface DockerStack {
  name: string;
  status: string;
  config_files: string;
  services_count: number;
}

/** List Compose stacks from the sidecar. */
export async function fetchDockerStacks(): Promise<DockerStack[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/stacks`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { stacks?: DockerStack[] };
    return data.stacks ?? [];
  } catch {
    return [];
  }
}
