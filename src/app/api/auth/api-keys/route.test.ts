import { describe, it, expect, vi, beforeEach } from "vitest";
import { signAccessToken } from "@/lib/auth/jwt";

const h = vi.hoisted(() => {
  const state = {
    dbResult: [] as unknown[],
    cookieValue: undefined as string | undefined,
    updatedKeys: undefined as unknown,
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(state.dbResult),
      }),
    }),
    update: () => ({
      set: (vals: Record<string, unknown>) => {
        state.updatedKeys = vals.api_keys;
        return { where: () => Promise.resolve(undefined) };
      },
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

import { PUT } from "./route";

const mockUser = { id: 1, username: "admin", role: "admin", api_keys: null };

describe("PUT /api/auth/api-keys", () => {
  beforeEach(() => {
    h.state.dbResult = [mockUser];
    h.state.updatedKeys = undefined;
    h.state.cookieValue = undefined;
  });

  it("returns 401 without an access cookie", async () => {
    const res = await PUT(
      new Request("http://localhost/api/auth/api-keys", {
        method: "PUT",
        body: JSON.stringify({ api_keys: { gemini: "x" } }),
      })
    );
    expect(res.status).toBe(401);
    expect(h.state.updatedKeys).toBeUndefined();
  });

  it("returns 400 when api_keys is not an object", async () => {
    h.state.cookieValue = await signAccessToken({ sub: "1", username: "admin", role: "admin" });
    const res = await PUT(
      new Request("http://localhost/api/auth/api-keys", {
        method: "PUT",
        body: JSON.stringify({ api_keys: "not-an-object" }),
      })
    );
    expect(res.status).toBe(400);
    expect(h.state.updatedKeys).toBeUndefined();
  });

  it("stores keys encrypted (no plaintext in the update)", async () => {
    h.state.cookieValue = await signAccessToken({ sub: "1", username: "admin", role: "admin" });
    const secret = "AIzaSy-super-secret";
    const res = await PUT(
      new Request("http://localhost/api/auth/api-keys", {
        method: "PUT",
        body: JSON.stringify({ api_keys: { gemini: secret } }),
      })
    );
    expect(res.status).toBe(200);
    expect(h.state.updatedKeys).toBeTruthy();
    expect(String(h.state.updatedKeys)).not.toContain(secret);
    expect(String(h.state.updatedKeys)).toContain(":");
  });
});
