import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    listResult: [] as unknown[],
    insertResult: [] as unknown[],
    updateResult: [] as unknown[],
    ingestResult: null as { point_ids: string[] } | null,
  };
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => {
          const p = Promise.resolve(state.listResult) as Promise<unknown[]> & {
            orderBy: () => Promise<unknown[]>;
          };
          p.orderBy = () => Promise.resolve(state.listResult);
          return p;
        },
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(state.insertResult),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(state.updateResult),
      }),
    }),
  };
  return { state, mockDb };
});

vi.mock("@/db", () => ({
  initDb: vi.fn().mockResolvedValue(undefined),
  insertLog: vi.fn().mockResolvedValue(undefined),
  db: h.mockDb,
}));

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/knowledge/sidecar", () => ({
  ingestDocument: vi.fn().mockImplementation(() => Promise.resolve(h.state.ingestResult)),
}));

import { GET, POST } from "./route";

const baseDoc = {
  id: 1,
  user_id: 1,
  title: "DirtyNest Architecture",
  content: "PostgreSQL for persistence, Qdrant for vectors.",
  category: "architecture",
  tags: '["postgres","qdrant"]',
  metadata: null,
  qdrant_point_id: null,
  source: "manual",
  obsidian_path: null,
  created_at: "2026-08-29T00:00:00.000Z",
  updated_at: "2026-08-29T00:00:00.000Z",
};

describe("GET /api/knowledge/docs", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [baseDoc];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET(new Request("http://localhost/api/knowledge/docs") as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns the docs list with parsed tags", async () => {
    const res = await GET(new Request("http://localhost/api/knowledge/docs") as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.docs).toHaveLength(1);
    expect(body.docs[0].title).toBe("DirtyNest Architecture");
    expect(body.docs[0].tags).toEqual(["postgres", "qdrant"]);
  });
});

describe("POST /api/knowledge/docs", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.insertResult = [{ ...baseDoc, id: 5 }];
    h.state.ingestResult = { point_ids: ["uuid-abc"] };
    h.state.listResult = [{ ...baseDoc, id: 5, qdrant_point_id: "uuid-abc" }];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await POST(
      new Request("http://localhost/api/knowledge/docs", {
        method: "POST",
        body: JSON.stringify({ title: "T", content: "C" }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/knowledge/docs", {
        method: "POST",
        body: JSON.stringify({ title: "", content: "" }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(400);
  });

  it("creates a doc, ingests into Qdrant, and stores the point id", async () => {
    const res = await POST(
      new Request("http://localhost/api/knowledge/docs", {
        method: "POST",
        body: JSON.stringify({
          title: "DirtyNest Architecture",
          content: "PostgreSQL for persistence, Qdrant for vectors.",
          category: "architecture",
          tags: ["postgres", "qdrant"],
        }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.doc.id).toBe(5);
    expect(body.doc.qdrant_point_id).toBe("uuid-abc");
    expect(body.doc.tags).toEqual(["postgres", "qdrant"]);
  });

  it("still creates the doc when Qdrant ingest fails (best-effort)", async () => {
    h.state.ingestResult = null;
    h.state.listResult = [{ ...baseDoc, id: 5, qdrant_point_id: null }];
    const res = await POST(
      new Request("http://localhost/api/knowledge/docs", {
        method: "POST",
        body: JSON.stringify({ title: "T", content: "C" }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.doc.qdrant_point_id).toBeNull();
  });
});
