import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

const h = vi.hoisted(() => {
  const state = { dbResult: [] as unknown[] };
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
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { POST } from "./route";

const mockUser = {
  id: 1,
  username: "admin",
  password_hash: bcrypt.hashSync("admin123", 10),
  role: "admin",
  api_keys: null,
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    h.state.dbResult = [mockUser];
    setCookies.mockClear();
  });

  it("returns 401 for wrong password", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "wrong" }),
      })
    );
    expect(res.status).toBe(401);
    expect(setCookies).not.toHaveBeenCalled();
  });

  it("returns 401 for unknown user", async () => {
    h.state.dbResult = [];
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "nobody", password: "x" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when credentials are missing", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("sets auth cookies and returns the user on success", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ id: 1, username: "admin", role: "admin" });
    expect(setCookies).toHaveBeenCalledTimes(1);
    const [access, refresh] = setCookies.mock.calls[0];
    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();
  });
});
