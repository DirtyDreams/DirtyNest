import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    feed: [] as unknown[],
    cached: [] as unknown[],
    existing: [] as unknown[],
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(state.existing),
        orderBy: () => {
          const p = Promise.resolve(state.cached) as Promise<unknown[]> & { limit: () => Promise<unknown[]> };
          p.limit = () => Promise.resolve(state.cached);
          return p;
        },
      }),
    }),
    insert: () => ({
      values: () => Promise.resolve({}),
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

vi.mock("@/lib/intel/sidecar", () => ({
  fetchCveFeed: vi.fn().mockImplementation(() => Promise.resolve(h.state.feed)),
}));

import { GET } from "./route";

const mockCve = {
  cve_id: "CVE-2026-0001",
  title: "Test CVE",
  description: "A test vulnerability",
  severity: "HIGH",
  cvss_score: "8.1",
  published_at: "2026-08-01T00:00:00.000Z",
  source: "NVD",
  url: "https://nvd.nist.gov/vuln/detail/CVE-2026-0001",
};

const cachedRow = {
  id: 1,
  cve_id: "CVE-2026-0001",
  title: "Test CVE",
  description: "A test vulnerability",
  severity: "HIGH",
  cvss_score: "8.1",
  published_at: "2026-08-01T00:00:00.000Z",
  source: "NVD",
  url: "https://nvd.nist.gov/vuln/detail/CVE-2026-0001",
  raw_json: "{}",
  created_at: "2026-08-29T00:00:00.000Z",
};

describe("GET /api/intel/cve", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.feed = [];
    h.state.cached = [];
    h.state.existing = [];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(new Request("http://localhost/api/intel/cve") as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("persists new CVEs and returns cached rows", async () => {
    h.state.feed = [mockCve];
    h.state.existing = [];
    h.state.cached = [cachedRow];
    const res = await GET(new Request("http://localhost/api/intel/cve") as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.cves[0].cve_id).toBe("CVE-2026-0001");
    expect(body.persisted).toBe(1);
  });

  it("skips persisting CVEs that already exist", async () => {
    h.state.feed = [mockCve];
    h.state.existing = [{ id: 1 }];
    h.state.cached = [cachedRow];
    const res = await GET(new Request("http://localhost/api/intel/cve") as unknown as NextRequest);
    const body = await res.json();
    expect(body.persisted).toBe(0);
  });

  it("falls back to the live feed when the cache is empty", async () => {
    h.state.feed = [mockCve];
    h.state.existing = [];
    h.state.cached = [];
    const res = await GET(new Request("http://localhost/api/intel/cve") as unknown as NextRequest);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.cves[0].cve_id).toBe("CVE-2026-0001");
  });
});
