import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    docs: [] as unknown[],
    edges: [] as unknown[],
    semanticEdges: [] as Array<{ source: string; target: string; relation: string; score: number }>,
  };

  const mockDb = {
    select: () => ({
      from: (table: unknown) => {
        // Table distinction via property inspection or order of call
        return {
          where: () => Promise.resolve(state.docs),
          then: (resolve: (val: unknown) => unknown) => resolve(state.edges),
          // support direct await if no .where() called
          [Symbol.toStringTag]: "Promise",
        };
      },
    }),
  };

  return { state, mockDb };
});

vi.mock("@/lib/db", () => {
  let callCount = 0;
  return {
    initDb: vi.fn().mockResolvedValue(undefined),
    db: {
      select: () => ({
        from: () => {
          callCount++;
          return {
            where: () => Promise.resolve(h.state.docs),
            then: (resolve: (val: unknown) => unknown) => resolve(h.state.edges),
          };
        },
      }),
    },
  };
});

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/knowledge/sidecar", () => ({
  getSemanticEdges: vi.fn().mockImplementation(() => Promise.resolve(h.state.semanticEdges)),
}));

import { GET } from "./route";

describe("GET /api/knowledge/graph", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.docs = [
      { id: 1, user_id: 1, title: "Hermes Core", category: "agent", tags: '["acp","core"]', source: "manual" },
      { id: 2, user_id: 1, title: "Qdrant Vault", category: "storage", tags: '["vectors"]', source: "manual" },
      { id: 3, user_id: 1, title: "CyberVoice Ops", category: "voice", tags: '["stt","tts"]', source: "manual" },
    ];
    h.state.edges = [
      { id: 10, source_doc_id: 1, target_doc_id: 2, relation: "stores_in" },
    ];
    h.state.semanticEdges = [
      { source: "1", target: "3", relation: "semantic", score: 0.88 },
      { source: "1", target: "2", relation: "semantic", score: 0.95 }, // already exists in scopedEdges
    ];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("merges DB edges with sidecar vector semantic edges, avoiding duplicate pairs", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.nodes).toHaveLength(3);
    expect(body.nodes[0]).toEqual({
      id: 1,
      title: "Hermes Core",
      category: "agent",
      tags: ["acp", "core"],
      source: "manual",
    });

    // DB edge 1->2 plus semantic edge 1->3. Duplicate 1->2 semantic edge skipped.
    expect(body.edges).toHaveLength(2);
    expect(body.edges).toContainEqual({
      id: 10,
      source: 1,
      target: 2,
      relation: "stores_in",
    });
    expect(body.edges).toContainEqual({
      id: "sem-1-3",
      source: 1,
      target: 3,
      relation: "semantic",
    });
  });

  it("filters out edges targeting non-existent nodes", async () => {
    h.state.edges = [
      { id: 99, source_doc_id: 1, target_doc_id: 999, relation: "invalid" },
    ];
    h.state.semanticEdges = [
      { source: "1", target: "888", relation: "semantic", score: 0.99 },
    ];

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.edges).toHaveLength(0);
  });
});
