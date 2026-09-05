import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = { userId: 1 as number | null, stacks: [] as unknown[] };
  return { state };
});

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/docker/sidecar", () => ({
  fetchDockerStacks: vi.fn().mockImplementation(() => Promise.resolve(h.state.stacks)),
}));

import { GET } from "./route";

describe("GET /api/docker/stacks", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.stacks = [];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(new Request("http://localhost/api/docker/stacks") as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns the stacks from the sidecar", async () => {
    h.state.stacks = [{ name: "dirtynest", status: "running", config_files: "docker-compose.yml", services_count: 3 }];
    const res = await GET(new Request("http://localhost/api/docker/stacks") as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.stacks[0].name).toBe("dirtynest");
  });

  it("returns an empty list when the sidecar is unreachable", async () => {
    h.state.stacks = [];
    const res = await GET(new Request("http://localhost/api/docker/stacks") as unknown as NextRequest);
    const body = await res.json();
    expect(body.count).toBe(0);
  });
});
