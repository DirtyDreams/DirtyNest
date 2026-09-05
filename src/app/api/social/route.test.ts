import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = {
    userId: 1 as number | null,
    listResult: [] as unknown[],
    insertResult: [] as unknown[],
    updateResult: [] as unknown[],
    publishOutcome: {
      ok: true,
      status: "published",
      platform_post_id: "twitter_abc",
      error: null,
    } as {
      ok: boolean;
      status: "published" | "failed";
      platform_post_id: string | null;
      error: string | null;
    },
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
  insertAuditLog: vi.fn().mockResolvedValue(undefined),
  db: h.mockDb,
}));

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/auth/encryption", () => ({
  encryptJson: vi.fn().mockImplementation((data: unknown) => Promise.resolve(`iv:${JSON.stringify(data)}`)),
  decryptJson: vi.fn().mockImplementation(() => null),
}));

vi.mock("@/lib/social/publish", () => ({
  executePublish: vi.fn().mockImplementation(() => Promise.resolve(h.state.publishOutcome)),
}));

import { GET as accountsGET, POST as accountsPOST } from "./accounts/route";
import { GET as postsGET, POST as postsPOST } from "./posts/route";
import { POST as publishPOST } from "./posts/[id]/publish/route";
import { POST as cancelPOST } from "./posts/[id]/cancel/route";
import { GET as metricsGET } from "./posts/[id]/metrics/route";
import { POST as gatePOST } from "./gate/resolve/route";
import { GET as analyticsGET } from "./analytics/route";

const basePost = {
  id: 1,
  user_id: 1,
  account_id: null,
  platform: "twitter",
  text: "Hello world",
  media_urls: "[]",
  status: "draft",
  scheduled_time: null,
  cron_expression: null,
  repeat_until: null,
  published_time: null,
  platform_post_id: null,
  metrics: "{}",
  error: null,
  created_at: "2026-08-29T00:00:00.000Z",
  updated_at: "2026-08-29T00:00:00.000Z",
};

const baseAccount = {
  id: 1,
  user_id: 1,
  platform: "twitter",
  account_name: "main",
  access_token: "iv:encrypted",
  refresh_token: null,
  expires_at: null,
  is_active: 1,
  created_at: "2026-08-29T00:00:00.000Z",
  updated_at: "2026-08-29T00:00:00.000Z",
};

const baseMetric = {
  id: 1,
  post_id: 1,
  platform: "twitter",
  reach: 100,
  engagement: 20,
  likes: 10,
  comments: 5,
  shares: 5,
  collected_at: "2026-08-29T00:00:00.000Z",
};

function req(url: string, init?: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

describe("GET /api/social/accounts", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [baseAccount];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await accountsGET(req("http://localhost/api/social/accounts"));
    expect(res.status).toBe(401);
  });

  it("lists accounts without leaking tokens", async () => {
    const res = await accountsGET(req("http://localhost/api/social/accounts"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accounts).toHaveLength(1);
    expect(body.accounts[0].account_name).toBe("main");
    expect(body.accounts[0].access_token).toBeUndefined();
    expect(body.accounts[0].refresh_token).toBeUndefined();
  });
});

describe("POST /api/social/accounts", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.insertResult = [baseAccount];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await accountsPOST(
      req("http://localhost/api/social/accounts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", account_name: "main", access_token: "tok" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid payload", async () => {
    const res = await accountsPOST(
      req("http://localhost/api/social/accounts", {
        method: "POST",
        body: JSON.stringify({ platform: "myspace", account_name: "", access_token: "" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("creates an account and returns it without tokens", async () => {
    const res = await accountsPOST(
      req("http://localhost/api/social/accounts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", account_name: "main", access_token: "tok" }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.account.id).toBe(1);
    expect(body.account.access_token).toBeUndefined();
  });
});

describe("GET /api/social/posts", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [basePost];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await postsGET(req("http://localhost/api/social/posts"));
    expect(res.status).toBe(401);
  });

  it("lists posts with parsed media_urls", async () => {
    const res = await postsGET(req("http://localhost/api/social/posts"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.posts).toHaveLength(1);
    expect(body.posts[0].media_urls).toEqual([]);
  });
});

describe("POST /api/social/posts", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.insertResult = [basePost];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await postsPOST(
      req("http://localhost/api/social/posts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", text: "hi" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid payload", async () => {
    const res = await postsPOST(
      req("http://localhost/api/social/posts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", text: "" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for scheduled post without scheduled_time", async () => {
    const res = await postsPOST(
      req("http://localhost/api/social/posts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", text: "hi", status: "scheduled" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("creates a draft post", async () => {
    const res = await postsPOST(
      req("http://localhost/api/social/posts", {
        method: "POST",
        body: JSON.stringify({ platform: "twitter", text: "hi" }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.post.id).toBe(1);
  });
});

describe("POST /api/social/posts/:id/publish (HITL gate)", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [basePost];
    h.state.publishOutcome = {
      ok: true,
      status: "published",
      platform_post_id: "twitter_abc",
      error: null,
    };
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 for a missing post", async () => {
    h.state.listResult = [];
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 409 for an already-published post", async () => {
    h.state.listResult = [{ ...basePost, status: "published" }];
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(409);
  });

  it("draft without approval → 403 awaiting_hitl (no publish)", async () => {
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.status).toBe("awaiting_hitl");
  });

  it("draft with approved:true → published", async () => {
    const res = await publishPOST(
      req("http://localhost/api/social/posts/1/publish", {
        method: "POST",
        body: JSON.stringify({ approved: true }),
      }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("published");
    expect(body.platform_post_id).toBe("twitter_abc");
  });

  it("scheduled post publishes directly without HITL", async () => {
    h.state.listResult = [{ ...basePost, status: "scheduled" }];
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("published");
  });

  it("awaiting_hitl post → 403 (must resolve via gate)", async () => {
    h.state.listResult = [{ ...basePost, status: "awaiting_hitl" }];
    const res = await publishPOST(req("http://localhost/api/social/posts/1/publish", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/social/gate/resolve", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [{ ...basePost, status: "awaiting_hitl" }];
    h.state.publishOutcome = {
      ok: true,
      status: "published",
      platform_post_id: "twitter_abc",
      error: null,
    };
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await gatePOST(
      req("http://localhost/api/social/gate/resolve", {
        method: "POST",
        body: JSON.stringify({ post_id: 1, decision: "ALLOW" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 409 for a post not awaiting HITL", async () => {
    h.state.listResult = [{ ...basePost, status: "draft" }];
    const res = await gatePOST(
      req("http://localhost/api/social/gate/resolve", {
        method: "POST",
        body: JSON.stringify({ post_id: 1, decision: "ALLOW" }),
      }),
    );
    expect(res.status).toBe(409);
  });

  it("DENY → cancelled", async () => {
    const res = await gatePOST(
      req("http://localhost/api/social/gate/resolve", {
        method: "POST",
        body: JSON.stringify({ post_id: 1, decision: "DENY" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("cancelled");
    expect(body.decision).toBe("DENY");
  });

  it("ALLOW → published", async () => {
    const res = await gatePOST(
      req("http://localhost/api/social/gate/resolve", {
        method: "POST",
        body: JSON.stringify({ post_id: 1, decision: "ALLOW" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("published");
    expect(body.decision).toBe("ALLOW");
  });
});

describe("POST /api/social/posts/:id/cancel", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [basePost];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await cancelPOST(req("http://localhost/api/social/posts/1/cancel", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 409 for a published post", async () => {
    h.state.listResult = [{ ...basePost, status: "published" }];
    const res = await cancelPOST(req("http://localhost/api/social/posts/1/cancel", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(409);
  });

  it("cancels a draft post", async () => {
    const res = await cancelPOST(req("http://localhost/api/social/posts/1/cancel", { method: "POST" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("cancelled");
  });
});

describe("GET /api/social/posts/:id/metrics", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.listResult = [basePost];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await metricsGET(req("http://localhost/api/social/posts/1/metrics"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 for a missing post", async () => {
    h.state.listResult = [];
    const res = await metricsGET(req("http://localhost/api/social/posts/1/metrics"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns metrics for the post", async () => {
    h.state.listResult = [basePost, baseMetric];
    const res = await metricsGET(req("http://localhost/api/social/posts/1/metrics"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.post_id).toBe(1);
    expect(body.metrics).toHaveLength(2);
  });
});

describe("GET /api/social/analytics", () => {
  beforeEach(() => {
    h.state.userId = 1;
    // The mock returns the same rows for both the posts and metrics queries;
    // a single metric row yields total_posts=1 and reach=100.
    h.state.listResult = [baseMetric];
  });

  it("returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await analyticsGET(req("http://localhost/api/social/analytics"));
    expect(res.status).toBe(401);
  });

  it("aggregates metrics by platform", async () => {
    const res = await analyticsGET(req("http://localhost/api/social/analytics"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.analytics.total_posts).toBe(1);
    expect(body.analytics.totals.reach).toBe(100);
    expect(body.analytics.by_platform.twitter.reach).toBe(100);
  });
});
