import { describe, it, expect } from "vitest";
import { encryptJson, decryptJson } from "./encryption";

describe("encryption", () => {
  it("round-trips an object through AES-GCM", async () => {
    const data = { gemini: "AIzaSy-secret", discord_webhook: "https://discord/..." };
    const encrypted = await encryptJson(data);
    expect(encrypted).toContain(":");
    const decrypted = await decryptJson<Record<string, string>>(encrypted);
    expect(decrypted).toEqual(data);
  });

  it("does not leak plaintext into the ciphertext", async () => {
    const data = { gemini: "AIzaSy-super-secret-value" };
    const encrypted = await encryptJson(data);
    expect(encrypted).not.toContain("AIzaSy-super-secret-value");
  });

  it("returns null for a tampered payload", async () => {
    const data = { gemini: "key" };
    const encrypted = await encryptJson(data);
    const [iv, ct] = encrypted.split(":");
    const tampered = `${iv}:${Buffer.from("tampered").toString("base64")}`;
    expect(await decryptJson(tampered)).toBeNull();
  });

  it("returns null for malformed input", async () => {
    expect(await decryptJson("not-a-valid-payload")).toBeNull();
    expect(await decryptJson("")).toBeNull();
  });
});
