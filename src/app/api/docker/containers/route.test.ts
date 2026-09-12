import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = { userId: 1 as number | null, containers: [] as unknown[] };
  return { state };
});

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/docker/sidecar", () => ({
  fetchDockerContainers: vi.fn().mockImplementation(() => Promise.resolve(h.state.containers)),
}));

import { GET } from "./route";

describe("GET /api/docker/containers", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.containers = [];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(new Request("http://localhost/api/docker/containers") as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns the containers from the sidecar", async () => {
    h.state.containers = [
      {
        id: "7f9a12c8b011",
        name: "dirtynest-web",
        image: "dirtynest/web:latest",
        status: "running",
        ports: "3000/tcp",
      },
    ];
    const res = await GET(new Request("http://localhost/api/docker/containers") as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.containers[0].name).toBe("dirtynest-web");
  });

  it("returns an empty list when the sidecar has no containers", async () => {
    h.state.containers = [];
    const res = await GET(new Request("http://localhost/api/docker/containers") as unknown as NextRequest);
    const body = await res.json();
    expect(body.count).toBe(0);
  });
});
