import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import EngagementRadar from "./EngagementRadar";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@/lib/cyberAudio", () => ({
  cyberAudio: {
    play: vi.fn(),
  },
}));

describe("EngagementRadar", () => {
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
    vi.restoreAllMocks();
  });

  it("renders with fallback channel data when analytics fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.reject(new Error("Network offline")))
    );

    await act(async () => {
      root.render(<EngagementRadar />);
    });

    expect(container.textContent).toContain("ENGAGEMENT & AUDIENCE RADAR");
    expect(container.textContent).toContain("X / Twitter");
    expect(container.textContent).toContain("Reddit /r/Cyberpunk");
    expect(container.textContent).toContain("STANDBY");
  });

  it("renders live metrics when /api/social/analytics returns telemetry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              analytics: {
                total_posts: 8,
                by_platform: {
                  twitter: {
                    posts: 5,
                    reach: 52000,
                    engagement: 3800,
                    likes: 2100,
                    comments: 400,
                    shares: 1300,
                  },
                },
                totals: {
                  reach: 52000,
                  engagement: 3800,
                  likes: 2100,
                  comments: 400,
                  shares: 1300,
                },
              },
            }),
        })
      )
    );

    await act(async () => {
      root.render(<EngagementRadar />);
    });

    expect(container.textContent).toContain("LIVE SYNC");
    expect(container.textContent).toContain("8 tracked posts");
    expect(container.textContent).toContain("5 POSTS");
  });

  it("clicking refresh triggers a re-fetch", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ analytics: { total_posts: 0, by_platform: {}, totals: {} } }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      root.render(<EngagementRadar />);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const buttons = Array.from(container.querySelectorAll("button"));
    const refreshBtn = buttons.find((b) => b.textContent?.includes("REFRESH"));
    expect(refreshBtn).toBeDefined();

    await act(async () => {
      refreshBtn?.click();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
