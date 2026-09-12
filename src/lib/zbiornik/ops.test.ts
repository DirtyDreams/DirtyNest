import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// Hoist mock state
const h = vi.hoisted(() => {
  const state = {
    rules: [
      { key: "max_per_day", value: "20" },
      { key: "min_gap_minutes", value: "10" },
      { key: "quiet_hours", value: "23:00-07:00" },
    ],
    publishedCount: 0,
    lastPublishedAt: null as string | null,
    insertedActivity: [] as Array<Record<string, unknown>>,
  };
  return { state };
});

vi.mock("@/db", () => {
  const mockDb = {
    select: vi.fn().mockImplementation((fields?: unknown) => ({
      from: vi.fn().mockImplementation((table: unknown) => ({
        where: vi.fn().mockImplementation(() => {
          // If selecting count
          if (fields && typeof fields === "object" && "n" in fields) {
            return Promise.resolve([{ n: h.state.publishedCount }]);
          }
          // If selecting last published
          return {
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockImplementation(() =>
                Promise.resolve(
                  h.state.lastPublishedAt ? [{ publishedAt: h.state.lastPublishedAt }] : []
                )
              ),
            }),
            // If selecting rules
            then: (resolve: (val: unknown) => void) => resolve(h.state.rules),
          };
        }),
      })),
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation((val: Record<string, unknown>) => {
        h.state.insertedActivity.push(val);
        return Promise.resolve();
      }),
    })),
  };
  return { db: mockDb };
});

import {
  sha256Hex,
  contentHash,
  getRules,
  publishGate,
  logActivity,
  sidecarPost,
  sidecarGet,
  DEFAULT_RULES,
} from "./ops";

describe("Zbiornik Ops - Cryptographic Hashing & Dedup", () => {
  it("computes deterministic sha256 hex string", async () => {
    const hash = await sha256Hex("hello world");
    expect(hash).toBe("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
  });

  it("normalizes whitespace and case in contentHash", async () => {
    const hash1 = await contentHash("   Spotkanie   w   Warszawie   ");
    const hash2 = await contentHash("spotkanie w warszawie");
    expect(hash1).toBe(hash2);
  });
});

describe("Zbiornik Ops - getRules", () => {
  it("returns configured rules from database", async () => {
    const rules = await getRules();
    expect(rules.max_per_day).toBe(20);
    expect(rules.min_gap_minutes).toBe(10);
    expect(rules.quiet_hours).toBe("23:00-07:00");
  });

  it("falls back to default rules when empty", async () => {
    h.state.rules = [];
    const rules = await getRules();
    expect(rules.max_per_day).toBe(DEFAULT_RULES.max_per_day);
    expect(rules.min_gap_minutes).toBe(DEFAULT_RULES.min_gap_minutes);
    expect(rules.quiet_hours).toBe(DEFAULT_RULES.quiet_hours);
  });
});

describe("Zbiornik Ops - publishGate HITL Verification", () => {
  beforeEach(() => {
    h.state.rules = [
      { key: "max_per_day", value: "20" },
      { key: "min_gap_minutes", value: "10" },
      { key: "quiet_hours", value: "23:00-07:00" },
    ];
    h.state.publishedCount = 0;
    h.state.lastPublishedAt = null;
    h.state.insertedActivity = [];
    vi.useRealTimers();
  });

  it("blocks publishing when daily limit is exhausted (LIMIT_DAY)", async () => {
    h.state.publishedCount = 20;
    const res = await publishGate();
    expect(res.allowed).toBe(false);
    expect(res.code).toBe("LIMIT_DAY");
    expect(res.usedToday).toBe(20);
  });

  it("blocks publishing when minimum gap has not elapsed (LIMIT_GAP)", async () => {
    // Last published 3 minutes ago, minimum gap is 10 minutes
    h.state.publishedCount = 5;
    h.state.lastPublishedAt = new Date(Date.now() - 3 * 60_000).toISOString();

    const res = await publishGate();
    expect(res.allowed).toBe(false);
    expect(res.code).toBe("LIMIT_GAP");
  });

  it("blocks publishing during quiet hours (QUIET_HOURS)", async () => {
    // Lock time to 02:30 AM (inside 23:00 - 07:00 quiet hours)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 2, 30, 0));

    h.state.publishedCount = 2;
    h.state.lastPublishedAt = new Date(2026, 8, 12, 1, 0, 0).toISOString();

    const res = await publishGate();
    expect(res.allowed).toBe(false);
    expect(res.code).toBe("QUIET_HOURS");

    vi.useRealTimers();
  });

  it("allows publishing when within limits and outside quiet hours", async () => {
    // Lock time to 14:00 PM (outside quiet hours)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 14, 0, 0));

    h.state.publishedCount = 4;
    // Last published 25 minutes ago (gap > 10 min)
    h.state.lastPublishedAt = new Date(2026, 8, 12, 13, 35, 0).toISOString();

    const res = await publishGate();
    expect(res.allowed).toBe(true);
    expect(res.usedToday).toBe(4);

    vi.useRealTimers();
  });
});

describe("Zbiornik Ops - logActivity", () => {
  it("records activity entries into database", async () => {
    await logActivity({
      op: "publish-test",
      targetRef: "ref-101",
      ok: true,
      message: "Publication confirmed",
    });

    expect(h.state.insertedActivity).toHaveLength(1);
    expect(h.state.insertedActivity[0]).toMatchObject({
      op: "publish-test",
      target_ref: "ref-101",
      ok: 1,
      message: "Publication confirmed",
    });
  });
});

describe("Zbiornik Ops - sidecar transport calls", () => {
  const origFetch = global.fetch;

  afterAll(() => {
    global.fetch = origFetch;
  });

  it("sidecarPost handles successful response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, data: { processed: true } }),
    } as unknown as Response);

    const res = await sidecarPost("/api/test", { sample: 1 });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ok: true, data: { processed: true } });
  });

  it("sidecarPost handles network failures gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const res = await sidecarPost("/api/test", {});
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
    expect(res.error).toContain("Connection refused");
  });

  it("sidecarGet returns data on HTTP 200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: "alive" }),
    } as unknown as Response);

    const res = await sidecarGet("/api/health");
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ status: "alive" });
  });
});
