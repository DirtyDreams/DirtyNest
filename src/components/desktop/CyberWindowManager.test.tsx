import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import CyberWindowManager from "./CyberWindowManager";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock fetch for live components
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes("/api/docker/containers")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          containers: [
            {
              id: "c-1",
              name: "dirtynest-postgres",
              state: "running",
              image: "postgres:16-alpine",
              cpu_perc: "0.85%",
              mem_usage: "45.2MiB",
            },
          ],
        }),
    });
  }
  if (url.includes("/api/intel/summary")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          posture: "ELEVATED",
          kev_total_weaponized: 1709,
          kev_ransomware_linked: 48,
          mesh_healthy_services: 6,
          mesh_total_services: 6,
        }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as unknown as typeof fetch;

describe("CyberWindowManager", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
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

  it("does not render when isOpen is false", () => {
    act(() => {
      root.render(<CyberWindowManager isOpen={false} onClose={() => {}} />);
    });
    expect(container.innerHTML).toBe("");
  });

  it("renders floating windows when isOpen is true", () => {
    act(() => {
      root.render(<CyberWindowManager isOpen={true} onClose={() => {}} />);
    });
    expect(container.textContent).toContain("CYBER TERMINAL CORE");
    expect(container.textContent).toContain("PAPERCLIP AI");
    expect(container.textContent).toContain("EXIT OS");
  });

  it("spawns a new Docker watcher window when APPS launcher button is used", async () => {
    act(() => {
      root.render(<CyberWindowManager isOpen={true} onClose={() => {}} />);
    });

    // Find APPS button
    const buttons = Array.from(container.querySelectorAll("button"));
    const appsBtn = buttons.find((b) => b.textContent?.includes("APPS"));
    expect(appsBtn).toBeDefined();

    act(() => {
      appsBtn?.click();
    });

    // Find Docker Watcher button in launcher popout
    const popoutButtons = Array.from(container.querySelectorAll("button"));
    const dockerBtn = popoutButtons.find((b) => b.textContent?.includes("Docker Watcher"));
    expect(dockerBtn).toBeDefined();

    await act(async () => {
      dockerBtn?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain("DOCKER HUB WATCHER");
  });

  it("calls onClose when EXIT OS is clicked", () => {
    const onCloseSpy = vi.fn();
    act(() => {
      root.render(<CyberWindowManager isOpen={true} onClose={onCloseSpy} />);
    });

    const exitBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("EXIT OS")
    );
    expect(exitBtn).toBeDefined();

    act(() => {
      exitBtn?.click();
    });

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
});
