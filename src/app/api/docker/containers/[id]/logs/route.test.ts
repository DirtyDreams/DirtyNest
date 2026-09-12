import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = { userId: 1 as number | null, logs: "test log output\nline 2" };
  return { state };
});

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/docker/sidecar", () => ({
  fetchDockerLogs: vi.fn().mockImplementation(() => Promise.resolve(h.state.logs)),
}));

import { GET } from "./route";

describe("GET /api/docker/containers/[id]/logs", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.logs = "test log output\nline 2";
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(
      new Request("http://localhost/api/docker/containers/c123/logs") as unknown as NextRequest,
      { params: Promise.resolve({ id: "c123" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns logs for container when authenticated", async () => {
    const res = await GET(
      new Request("http://localhost/api/docker/containers/c123/logs?tail=50") as unknown as NextRequest,
      { params: Promise.resolve({ id: "c123" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.container_id).toBe("c123");
    expect(body.logs).toContain("test log output");
    expect(body.tail).toBe(50);
  });
});
