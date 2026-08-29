import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    role: "admin",
    logs: [] as unknown[],
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => {
          const p = Promise.resolve([{ role: state.role }]) as Promise<unknown[]> & {
            orderBy: () => Promise<unknown[]> & { limit: () => Promise<unknown[]> };
          };
          p.orderBy = () => {
            const q = Promise.resolve(state.logs) as Promise<unknown[]> & { limit: () => Promise<unknown[]> };
            q.limit = () => Promise.resolve(state.logs);
            return q;
          };
          return p;
        },
      }),
    }),
  };
  return { state, mockDb };
});

vi.mock("@/db", () => ({
  initDb: vi.fn().mockResolvedValue(undefined),
  db: h.mockDb,
}));

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

import { GET } from "./route";

const mockLog = {
  id: 1,
  user_id: 1,
  timestamp: "2026-08-29T00:00:00.000Z",
  level: "AUDIT",
  category: "AUTH",
  action: "login",
  actor: "admin",
  details: "{}",
  ip_origin: "127.0.0.1",
  hash_sig: "abc123",
};

describe("GET /api/audit/logs", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.role = "admin";
    h.state.logs = [];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(new Request("http://localhost/api/audit/logs") as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    h.state.role = "operator";
    const res = await GET(new Request("http://localhost/api/audit/logs") as unknown as NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns the audit logs for an admin", async () => {
    h.state.logs = [mockLog];
    const res = await GET(new Request("http://localhost/api/audit/logs") as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.logs[0].action).toBe("login");
  });
});
