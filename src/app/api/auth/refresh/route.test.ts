import { describe, it, expect, vi, beforeEach } from "vitest";
import { signRefreshToken } from "@/lib/auth/jwt";

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

const setCookies = vi.fn();
vi.mock("@/lib/auth/cookies", () => ({
  setAuthCookies: (...args: unknown[]) => setCookies(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: () => (h.state.cookieValue ? { value: h.state.cookieValue } : undefined),
  }),
}));

import { POST } from "./route";

const mockUser = { id: 1, username: "admin", role: "admin", api_keys: null };

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    h.state.dbResult = [mockUser];
    h.state.cookieValue = undefined;
    setCookies.mockClear();
  });

  it("returns 401 without a refresh cookie", async () => {
    const res = await POST();
    expect(res.status).toBe(401);
    expect(setCookies).not.toHaveBeenCalled();
  });

  it("rotates tokens with a valid refresh cookie", async () => {
    h.state.cookieValue = await signRefreshToken({ sub: "1", username: "admin", role: "admin" });
    const res = await POST();
    expect(res.status).toBe(200);
    expect(setCookies).toHaveBeenCalledTimes(1);
  });

  it("returns 401 for a garbage refresh cookie", async () => {
    h.state.cookieValue = "garbage-token";
    const res = await POST();
    expect(res.status).toBe(401);
    expect(setCookies).not.toHaveBeenCalled();
  });
});
