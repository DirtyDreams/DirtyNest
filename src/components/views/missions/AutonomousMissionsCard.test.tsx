import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AutonomousMissionsCard from "./AutonomousMissionsCard";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockMissions = [
  {
    id: "security_sentinel",
    name: "Cyber Security Sentinel",
    description: "Autonomous security recon: periodic audit of CISA weaponized KEVs and 7-port local mesh health.",
    category: "SECURITY",
    cron: "0 */6 * * *",
    interval_seconds: 21600,
    status: "IDLE",
    enabled: true,
    last_run: Date.now() / 1000 - 120,
    next_run: Date.now() / 1000 + 3600,
    run_count: 5,
    history: [
      {
        timestamp: Date.now() / 1000 - 120,
        status: "SUCCESS",
        duration_ms: 180,
        summary: "Security Sentinel Audit // Posture: OPTIMAL | 1,709 KEVs tracked",
      },
    ],
  },
  {
    id: "content_synthesizer",
    name: "Content & Social Synthesizer",
    description: "Synthesizes Knowledge Vault notes into draft social posts (awaiting HITL).",
    category: "CREATIVE",
    cron: "0 10,22 * * *",
    interval_seconds: 43200,
    status: "IDLE",
    enabled: true,
    last_run: null,
    next_run: Date.now() / 1000 + 1800,
    run_count: 0,
    history: [],
  },
  {
    id: "zbiornik_monitor",
    name: "Zbiornik Portal Watchdog",
    description: "Read-only monitor of Zbiornik portal forum topics and unread messages.",
    category: "PORTAL",
    cron: "*/30 9-22 * * *",
    interval_seconds: 1800,
    status: "IDLE",
    enabled: false,
    last_run: null,
    next_run: null,
    run_count: 0,
    history: [],
  },
];

global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
  if (url.includes("/api/missions") && init?.method === "POST" && url.includes("/trigger")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true, message: "Triggered" }),
    });
  }
  if (url.includes("/api/missions") && init?.method === "POST" && url.includes("/toggle")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
  }
  if (url.includes("/api/missions")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ missions: mockMissions, count: 3 }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as unknown as typeof fetch;

describe("AutonomousMissionsCard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders all 3 autonomous swarm missions", async () => {
    await act(async () => {
      root.render(<AutonomousMissionsCard />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain("HERMES AUTO-OPS // TRI-MISSION LOOP");
    expect(container.textContent).toContain("Cyber Security Sentinel");
    expect(container.textContent).toContain("Content & Social Synthesizer");
    expect(container.textContent).toContain("Zbiornik Portal Watchdog");
  });

  it("triggers a mission when RUN NOW is clicked", async () => {
    const triggerSpy = vi.fn();
    await act(async () => {
      root.render(<AutonomousMissionsCard onMissionTriggered={triggerSpy} />);
      await Promise.resolve();
    });

    const runButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("RUN NOW")
    );
    expect(runButtons.length).toBeGreaterThan(0);

    await act(async () => {
      runButtons[0]?.click();
      await Promise.resolve();
    });

    expect(triggerSpy).toHaveBeenCalledWith("security_sentinel");
  });

  it("toggles a mission pause state", async () => {
    await act(async () => {
      root.render(<AutonomousMissionsCard />);
      await Promise.resolve();
    });

    const pauseButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("PAUSE")
    );
    expect(pauseButtons.length).toBeGreaterThan(0);

    await act(async () => {
      pauseButtons[0]?.click();
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/missions/security_sentinel/toggle"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
