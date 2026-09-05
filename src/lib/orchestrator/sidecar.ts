/**
 * Thin client for the sidecar ACP bridge (F3). Best-effort: failures degrade
 * to a no-op so routing + persistence never block on sidecar availability.
 */

export function getSidecarBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
}

export interface AcpNewSessionResult {
  session?: { id?: string };
}

/** Create an ACP session in the sidecar; returns its id or null on failure. */
export async function createAcpSession(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/hermes/acp/sessions/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AcpNewSessionResult;
    return data.session?.id ?? null;
  } catch {
    return null;
  }
}

/** Fire the ACP prompt at the sidecar (background execution). */
export async function callAcpPrompt(sessionId: string, prompt: string, systemPrompt?: string): Promise<boolean> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/hermes/acp/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, prompt, system_prompt: systemPrompt ?? "" }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
