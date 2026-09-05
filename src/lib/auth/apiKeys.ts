// Client-side API-key storage for frontend-only mode.
// Keys are persisted locally in browser storage so the settings panels remain
// usable without any server routes.

const STORAGE_KEY = "dirtynest_api_keys";

export async function fetchApiKeys(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function saveApiKeys(keys: Record<string, string>): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    return true;
  } catch {
    return false;
  }
}
