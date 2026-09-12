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

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
  in_use: boolean;
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
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/containers?stats=true`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { containers?: DockerContainer[] };
    return data.containers ?? [];
  } catch {
    return [];
  }
}

/** List cached Docker images from the sidecar. */
export async function fetchDockerImages(): Promise<DockerImage[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/images`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { images?: DockerImage[] };
    return data.images ?? [];
  } catch {
    return [];
  }
}

/** Pull image from Docker registry. */
export async function pullDockerImage(imageName: string): Promise<{ status: string; output?: string; error?: string }> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageName }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return { status: "error", error: `HTTP ${res.status}` };
    return (await res.json()) as { status: string; output?: string; error?: string };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

/** Prune dangling images and stopped containers. */
export async function pruneDockerSystem(): Promise<{ status: string; output?: string; error?: string }> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/prune`, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return { status: "error", error: `HTTP ${res.status}` };
    return (await res.json()) as { status: string; output?: string; error?: string };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

/** Manage container lifecycle (start, stop, restart, pause, unpause). */
export async function manageDockerContainer(
  containerId: string,
  action: "start" | "stop" | "restart" | "pause" | "unpause"
): Promise<{ status: string; action?: string; error?: string }> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/containers/${encodeURIComponent(containerId)}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { status: "error", error: `HTTP ${res.status}` };
    return (await res.json()) as { status: string; action?: string; error?: string };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

/** Orchestrate compose stack (up, down, restart, stop). */
export async function manageDockerStack(
  stackName: string,
  action: "restart" | "stop" | "start" | "up" | "down"
): Promise<{ status: string; stack?: string; action?: string; error?: string }> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/docker/stacks/${encodeURIComponent(stackName)}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { status: "error", error: `HTTP ${res.status}` };
    return (await res.json()) as { status: string; stack?: string; action?: string; error?: string };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
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

