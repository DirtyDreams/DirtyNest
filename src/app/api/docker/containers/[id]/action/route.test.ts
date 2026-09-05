import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = { userId: 1 as number | null, sidecarResult: { status: "success" } };
  return { state };
});

vi.mock("@/db", () => ({
  initDb: vi.fn().mockResolvedValue(undefined),
  insertAuditLog: vi.fn().mockResolvedValue(undefined),
  db: {},
}));

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/orchestrator/sidecar", () => ({
  getSidecarBaseUrl: vi.fn().mockReturnValue("http://localhost:8000"),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { POST } from "./route";

describe("POST /api/docker/containers/:id/action", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.sidecarResult = { status: "success" };
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(h.state.sidecarResult),
    });
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await POST(
      new Request("http://localhost/api/docker/containers/abc/action", {
        method: "POST",
        body: JSON.stringify({ action: "start" }),
      }) as unknown as NextRequest,
      { params: Promise.resolve({ id: "abc" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid action", async () => {
    const res = await POST(
      new Request("http://localhost/api/docker/containers/abc/action", {
        method: "POST",
        body: JSON.stringify({ action: "explode" }),
      }) as unknown as NextRequest,
      { params: Promise.resolve({ id: "abc" }) },
    );
    expect(res.status).toBe(400);
  });

  it("proxies a valid action and returns the sidecar result", async () => {
    const res = await POST(
      new Request("http://localhost/api/docker/containers/abc/action", {
        method: "POST",
        body: JSON.stringify({ action: "restart" }),
      }) as unknown as NextRequest,
      { params: Promise.resolve({ id: "abc" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
  });
});
