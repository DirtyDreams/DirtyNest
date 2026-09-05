import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Sidebar, { navClusters, navItems, type NavViewId } from "./Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EXPECTED_VIEW_IDS: NavViewId[] = [
  "dashboard",
  "control_room",
  "zbiornik_ops",
  "agents",
  "image_studio",
  "sound_studio",
  "social_media",
  "chatbot",
  "nexus",
  "knowledge",
  "rss",
  "docker",
  "tools",
  "stats",
  "logs",
  "api",
  "calendar",
];

describe("Sidebar Navigation & Tactical Clustering", () => {
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

  describe("navClusters & navItems data integrity", () => {
    it("exports 4 operational clusters with expected codes", () => {
      expect(navClusters).toHaveLength(4);
      expect(navClusters.map((c) => c.code)).toEqual([
        "OPS // 01",
        "CREATIVE // 02",
        "INTEL // 03",
        "SYSTEM // 04",
      ]);
    });

    it("contains all 17 distinct navigation view IDs across clusters", () => {
      const allClusterIds = navClusters.flatMap((c) => c.items.map((i) => i.id));
      expect(allClusterIds).toHaveLength(17);
      expect(new Set(allClusterIds).size).toBe(17);
      for (const viewId of EXPECTED_VIEW_IDS) {
        expect(allClusterIds).toContain(viewId);
      }
    });

    it("maintains backwards compatibility for navItems export", () => {
      expect(navItems).toHaveLength(17);
      const navItemIds = navItems.map((i) => i.id);
      expect(navItemIds).toEqual(EXPECTED_VIEW_IDS);
    });
  });

  describe("Sidebar rendering & ergonomics", () => {
    it("renders cluster headers and navigation buttons for each cluster", () => {
      const onSelectView = vi.fn();
      act(() => {
        root.render(
          <TooltipProvider>
            <Sidebar activeView="dashboard" onSelectView={onSelectView} />
          </TooltipProvider>
        );
      });

      // Monospace cluster headers in expanded rail
      expect(container.textContent).toContain("OPS // 01");
      expect(container.textContent).toContain("CREATIVE // 02");
      expect(container.textContent).toContain("INTEL // 03");
      expect(container.textContent).toContain("SYSTEM // 04");

      // Verify labels are rendered
      expect(container.textContent).toContain("Overview");
      expect(container.textContent).toContain("Control Room");
      expect(container.textContent).toContain("Zbiornik Ops");
      expect(container.textContent).toContain("AI Agents");
      expect(container.textContent).toContain("Image Studio");
      expect(container.textContent).toContain("Sound Studio");
      expect(container.textContent).toContain("Social Media");
      expect(container.textContent).toContain("Chatbot AI");
      expect(container.textContent).toContain("Persona Nexus");
      expect(container.textContent).toContain("Knowledge Vault");
      expect(container.textContent).toContain("Cyber Intel Wire");
      expect(container.textContent).toContain("Docker Hub");
      expect(container.textContent).toContain("Tools Matrix");
      expect(container.textContent).toContain("Stats & Metrics");
      expect(container.textContent).toContain("System Logs");
      expect(container.textContent).toContain("API Health");
      expect(container.textContent).toContain("Schedule");
    });

    it("renders Quick Command micro badge and dispatches event when clicked", () => {
      const onSelectView = vi.fn();
      const paletteListener = vi.fn();
      window.addEventListener("dirtynest-open-palette", paletteListener);

      act(() => {
        root.render(
          <TooltipProvider>
            <Sidebar activeView="dashboard" onSelectView={onSelectView} />
          </TooltipProvider>
        );
      });

      const cmdBadge = container.querySelector('button[aria-label*="Command Palette"]') as HTMLButtonElement | null;
      expect(cmdBadge).not.toBeNull();
      expect(cmdBadge?.textContent).toContain("⌘K");

      act(() => {
        cmdBadge?.click();
      });

      expect(paletteListener).toHaveBeenCalledTimes(1);
      window.removeEventListener("dirtynest-open-palette", paletteListener);
    });

    it("triggers onSelectView with the correct view ID when clicking navigation items", () => {
      const onSelectView = vi.fn();
      act(() => {
        root.render(
          <TooltipProvider>
            <Sidebar activeView="dashboard" onSelectView={onSelectView} />
          </TooltipProvider>
        );
      });

      const controlRoomBtn = container.querySelector(
        'button[aria-label="Navigate to Control Room"]'
      ) as HTMLButtonElement | null;
      expect(controlRoomBtn).not.toBeNull();

      act(() => {
        controlRoomBtn?.click();
      });
      expect(onSelectView).toHaveBeenCalledWith("control_room");

      const soundStudioBtn = container.querySelector(
        'button[aria-label="Navigate to Sound Studio"]'
      ) as HTMLButtonElement | null;
      expect(soundStudioBtn).not.toBeNull();

      act(() => {
        soundStudioBtn?.click();
      });
      expect(onSelectView).toHaveBeenCalledWith("sound_studio");

      const wireBtn = container.querySelector(
        'button[aria-label="Navigate to Cyber Intel Wire"]'
      ) as HTMLButtonElement | null;
      expect(wireBtn).not.toBeNull();

      act(() => {
        wireBtn?.click();
      });
      expect(onSelectView).toHaveBeenCalledWith("rss");
    });

    it("renders active state correctly with indicator notch and aria-current", () => {
      act(() => {
        root.render(
          <TooltipProvider>
            <Sidebar activeView="control_room" onSelectView={vi.fn()} />
          </TooltipProvider>
        );
      });

      const controlRoomBtn = container.querySelector(
        'button[aria-label="Navigate to Control Room"]'
      ) as HTMLButtonElement | null;
      expect(controlRoomBtn).not.toBeNull();
      expect(controlRoomBtn?.getAttribute("aria-current")).toBe("page");

      // Glowing active notch indicator
      const activeNotch = controlRoomBtn?.querySelector('[data-testid="active-notch"]');
      expect(activeNotch).not.toBeNull();
      expect(activeNotch?.className).toContain("bg-neon-green");

      // Non-active button should not have aria-current or notch
      const overviewBtn = container.querySelector(
        'button[aria-label="Navigate to Overview"]'
      ) as HTMLButtonElement | null;
      expect(overviewBtn?.getAttribute("aria-current")).toBeNull();
      expect(overviewBtn?.querySelector('[data-testid="active-notch"]')).toBeNull();
    });

    it("renders footer settings button and handles clicks", () => {
      const onSelectView = vi.fn();
      const onOpenSettingsModal = vi.fn();

      act(() => {
        root.render(
          <TooltipProvider>
            <Sidebar
              activeView="dashboard"
              onSelectView={onSelectView}
              onOpenSettingsModal={onOpenSettingsModal}
            />
          </TooltipProvider>
        );
      });

      const settingsBtn = container.querySelector(
        'button[aria-label="Open System Settings"]'
      ) as HTMLButtonElement | null;
      expect(settingsBtn).not.toBeNull();

      act(() => {
        settingsBtn?.click();
      });

      expect(onSelectView).toHaveBeenCalledWith("settings");
      expect(onOpenSettingsModal).toHaveBeenCalledTimes(1);
    });
  });
});
