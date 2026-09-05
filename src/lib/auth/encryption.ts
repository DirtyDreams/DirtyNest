import { createHash } from "crypto";

// AES-256-GCM encryption for sensitive values (LLM/social API keys).
// Key derived from API_KEY_ENC_KEY env (any length → SHA-256 → 32 bytes).
const ENC_KEY = process.env.API_KEY_ENC_KEY || "dev-insecure-api-key-encryption";

async function getKey(): Promise<CryptoKey> {
  const raw = createHash("sha256").update(ENC_KEY).digest();
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptJson(data: unknown): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const ivB64 = Buffer.from(iv).toString("base64");
  const ctB64 = Buffer.from(ciphertext).toString("base64");
  return `${ivB64}:${ctB64}`;
}

export async function decryptJson<T>(payload: string): Promise<T | null> {
  try {
    const [ivB64, ctB64] = payload.split(":");
    if (!ivB64 || !ctB64) return null;
    const key = await getKey();
    const iv = Buffer.from(ivB64, "base64");
    const ct = Buffer.from(ctB64, "base64");
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    return null;
  }
}
