// Client-side helpers for reading/writing the encrypted API-key vault.
// Keys live server-side in users.api_keys (AES-GCM encrypted); the browser
// reads them via /api/auth/me and writes via /api/auth/api-keys.

export async function fetchApiKeys(): Promise<Record<string, string>> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) return {};
    const data = await res.json();
    return (data.api_keys as Record<string, string>) || {};
  } catch {
    return {};
  }
}

export async function saveApiKeys(keys: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/api-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_keys: keys }),
      credentials: "same-origin",
    });
    return res.ok;
  } catch {
    return false;
  }
}
