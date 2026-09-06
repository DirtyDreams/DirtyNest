import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import type { NextRequest } from "next/server";

const h = vi.hoisted(() => {
  const state = { userId: 1 as number | null, fetchResult: { ok: true, status: 200, data: {} as unknown } };
  return { state };
});

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: vi.fn().mockImplementation(() => Promise.resolve(h.state.userId)),
}));

vi.mock("@/lib/orchestrator/sidecar", () => ({
  getSidecarBaseUrl: () => "http://localhost:8000",
}));

// Mock global fetch
const originalFetch = global.fetch;

import { GET } from "./route";
import { POST } from "./[id]/run/route";

describe("/api/hermes/cron", () => {
  beforeEach(() => {
    h.state.userId = 1;
    h.state.fetchResult = {
      ok: true,
      status: 200,
      data: {
        status: "success",
        cron_jobs: [
          { id: "cve_recon_scan", name: "CVE Recon", schedule: "Every 5 mins", status: "SCHEDULED" },
        ],
      },
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: h.state.fetchResult.ok,
        status: h.state.fetchResult.status,
        json: () => Promise.resolve(h.state.fetchResult.data),
        text: () => Promise.resolve(JSON.stringify(h.state.fetchResult.data)),
      } as unknown as Response)
    );
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("GET returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns cron jobs list from sidecar", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { cron_jobs: Array<{ id: string }> };
    expect(body.cron_jobs).toHaveLength(1);
    expect(body.cron_jobs[0].id).toBe("cve_recon_scan");
  });

  it("GET handles sidecar error gracefully", async () => {
    h.state.fetchResult = { ok: false, status: 500, data: { error: "Failed" } };
    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("POST /run returns 401 when unauthenticated", async () => {
    h.state.userId = null;
    const res = await POST(new Request("http://localhost") as unknown as NextRequest, {
      params: Promise.resolve({ id: "cve_recon_scan" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /run triggers cron job successfully", async () => {
    h.state.fetchResult = {
      ok: true,
      status: 200,
      data: { status: "success", message: "Job cve_recon_scan completed successfully." },
    };
    const res = await POST(new Request("http://localhost") as unknown as NextRequest, {
      params: Promise.resolve({ id: "cve_recon_scan" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("success");
  });
});
