import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    hits: [] as Array<{ doc_id: string; score: number; title: string; text: string }>,
    rows: [] as unknown[],
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(state.rows),
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

vi.mock("@/lib/knowledge/sidecar", () => ({
  searchKnowledge: vi.fn().mockImplementation(() => Promise.resolve(h.state.hits)),
}));

import { POST } from "./route";

const baseRow = {
  id: 7,
  user_id: 1,
  title: "DirtyNest Architecture",
  content: "PostgreSQL for persistence, Qdrant for vectors.",
  category: "architecture",
  tags: '["postgres","qdrant"]',
  metadata: null,
  qdrant_point_id: "uuid-abc",
  source: "manual",
  obsidian_path: null,
  created_at: "2026-08-29T00:00:00.000Z",
  updated_at: "2026-08-29T00:00:00.000Z",
};

describe("POST /api/knowledge/search", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.hits = [{ doc_id: "7", score: 0.83, title: "DirtyNest Architecture", text: "PostgreSQL..." }];
    h.state.rows = [baseRow];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await POST(
      new Request("http://localhost/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: "postgres" }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty query", async () => {
    const res = await POST(
      new Request("http://localhost/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: "  " }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(400);
  });

  it("joins Qdrant hits with PG metadata", async () => {
    const res = await POST(
      new Request("http://localhost/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: "postgres persistence", limit: 5, threshold: 0.3 }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.results[0].doc_id).toBe("7");
    expect(body.results[0].score).toBe(0.83);
    expect(body.results[0].doc).toEqual({
      id: 7,
      title: "DirtyNest Architecture",
      category: "architecture",
      tags: ["postgres", "qdrant"],
      source: "manual",
    });
  });

  it("returns hits without PG rows as doc: null", async () => {
    h.state.rows = [];
    const res = await POST(
      new Request("http://localhost/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: "postgres" }),
      }) as unknown as NextRequest
    );
    const body = await res.json();
    expect(body.results[0].doc).toBeNull();
  });
});
