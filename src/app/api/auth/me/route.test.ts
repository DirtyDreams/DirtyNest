import { describe, it, expect, vi, beforeEach } from "vitest";
import { signAccessToken } from "@/lib/auth/jwt";
import { encryptJson } from "@/lib/auth/encryption";

const h = vi.hoisted(() => {
  const state = { dbResult: [] as unknown[], cookieValue: undefined as string | undefined };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(state.dbResult),
      }),
    }),
  };
  return { state, mockDb };
});

vi.mock("@/db", () => ({
  initDb: vi.fn().mockResolvedValue(undefined),
  db: h.mockDb,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: () => (h.state.cookieValue ? { value: h.state.cookieValue } : undefined),
  }),
}));

import { GET } from "./route";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    h.state.dbResult = [];
    h.state.cookieValue = undefined;
  });

  it("returns 401 without an access cookie", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 for a garbage access cookie", async () => {
    h.state.cookieValue = "garbage";
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns the user with decrypted api_keys", async () => {
    const encrypted = await encryptJson({ gemini: "AIzaSy-secret" });
    h.state.dbResult = [{ id: 1, username: "admin", role: "admin", api_keys: encrypted }];
    h.state.cookieValue = await signAccessToken({ sub: "1", username: "admin", role: "admin" });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.username).toBe("admin");
    expect(body.api_keys).toEqual({ gemini: "AIzaSy-secret" });
  });

  it("returns empty api_keys when the user has none stored", async () => {
    h.state.dbResult = [{ id: 1, username: "admin", role: "admin", api_keys: null }];
    h.state.cookieValue = await signAccessToken({ sub: "1", username: "admin", role: "admin" });

    const res = await GET();
    const body = await res.json();
    expect(body.api_keys).toEqual({});
  });
});
