/**
 * Minions Swarm Subordinate Bridge - Frontend Client.
 * Communicates with the FastAPI Sidecar on :8000.
 */

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export interface MinionTask {
  id: string;
  minion_id: string;
  name: string;
  directive: string;
  status: "QUEUED" | "EXECUTING" | "COMPLETED" | "FAILED";
  progress: number;
  created_at: number;
  completed_at?: number | null;
  output?: string | null;
  logs: string[];
}

export interface MinionNode {
  id: string;
  name: string;
  role: string;
  model: string;
  status: "IDLE" | "EXECUTING" | "PAUSED" | "OFFLINE";
  load: number;
  memory_mb: number;
  tasks_completed: number;
  success_rate: number;
  last_ping: string;
  current_task?: MinionTask | null;
  tags: string[];
  color: string;
  is_upstream?: boolean;
}

export async function fetchMinions(): Promise<{ status: string; count: number; minions: MinionNode[] }> {
  const res = await fetch(`${SIDECAR_URL}/api/hermes/minions`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch minions from sidecar: ${res.status}`);
  }
  return res.json();
}

export async function fetchMinion(minionId: string): Promise<{ status: string; minion: MinionNode }> {
  const res = await fetch(`${SIDECAR_URL}/api/hermes/minions/${encodeURIComponent(minionId)}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch minion '${minionId}': ${res.status}`);
  }
  return res.json();
}

export async function dispatchMinionTask(
  minionId: string,
  payload: { name: string; directive: string; duration?: number }
): Promise<{ status: string; task: MinionTask }> {
  const res = await fetch(`${SIDECAR_URL}/api/hermes/minions/${encodeURIComponent(minionId)}/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to dispatch task to '${minionId}': ${res.status}`);
  }
  return res.json();
}

export async function controlMinionNode(
  minionId: string,
  action: "pause" | "resume" | "restart"
): Promise<{ status: string; result: { ok: boolean; status: string; message: string } }> {
  const res = await fetch(`${SIDECAR_URL}/api/hermes/minions/${encodeURIComponent(minionId)}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to control minion '${minionId}': ${res.status}`);
  }
  return res.json();
}

export async function fetchMinionTasks(
  minionId: string
): Promise<{ status: string; minion_id: string; tasks: MinionTask[] }> {
  const res = await fetch(`${SIDECAR_URL}/api/hermes/minions/${encodeURIComponent(minionId)}/tasks`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks for '${minionId}': ${res.status}`);
  }
  return res.json();
}
