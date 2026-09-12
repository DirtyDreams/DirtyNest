/**
 * Thin client for the sidecar Docker engine (F6.1). Best-effort: failures
 * degrade to empty lists or strings so the UI never blocks on the sidecar.
 */

import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export interface DockerStack {
  name: string;
  status: string;
  config_files: string;
  services_count: number;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "restarting";
  state?: string;
  ports: string;
  uptime: string;
  size?: string;
  created_at?: string;
  cpu_percent?: number;
  memory_usage?: string;
  net_io?: string;
  stack?: string;
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

/** List containers from the sidecar. */
export async function fetchDockerContainers(): Promise<DockerContainer[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/containers`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { containers?: DockerContainer[] };
    return data.containers ?? [];
  } catch {
    return [];
  }
}

/** Fetch logs for a container from the sidecar. */
export async function fetchDockerLogs(containerId: string, tail: number = 150): Promise<string> {
  try {
    const res = await fetch(
      `${getSidecarBaseUrl()}/api/docker/containers/${encodeURIComponent(containerId)}/logs?tail=${tail}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return "";
    const data = (await res.json()) as { logs?: string };
    return data.logs ?? "";
  } catch {
    return "";
  }
}
