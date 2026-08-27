import { create } from "zustand";
import { NavViewId } from "@/components/layout/Sidebar";
import { cyberAudio } from "@/lib/cyberAudio";

export interface FxConfig {
  backgroundFx: "particles" | "none";
  particleCount: number;
  particleSpeed: number;
  particleInteraction: "repulse" | "attract" | "none";
  particleColorMode: "adaptive" | "green" | "cyan" | "purple";
}

interface AppState {
  // Navigation
  activeView: NavViewId;
  setActiveView: (view: NavViewId) => void;

  // Modals & Panels
  isDevToolsOpen: boolean;
  setDevToolsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isCustomizeOpen: boolean;
  setCustomizeOpen: (open: boolean) => void;
  isThemeModalOpen: boolean;
  setThemeModalOpen: (open: boolean) => void;
  isTerminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  isMobileDeckSheetOpen: boolean;
  setMobileDeckSheetOpen: (open: boolean) => void;

  // FX Canvas & Background State
  fxConfig: FxConfig;
  setFxConfig: (config: Partial<FxConfig>) => void;
  toggleBackgroundFx: () => void;

  // Global Audio / Drone / Soundboard
  isDronePlaying: boolean;
  setDronePlaying: (playing: boolean) => void;
  toggleDrone: () => boolean;
  isAudioMixerOpen: boolean;
  setAudioMixerOpen: (open: boolean) => void;
  toggleAudioMixer: () => void;

  // Viewport / Screen
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;

  // Right Tactical Deck Panel
  isRightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;

  // Dashboard Customization
  customWidgets: Record<string, boolean>;
  setCustomWidgets: (widgets: Record<string, boolean>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: "dashboard",
  setActiveView: (view) => {
    const update = () => {
      set({ activeView: view });
      if (typeof window !== "undefined") {
        try {
          window.history.replaceState(null, "", `#${view}`);
        } catch {
          // ignore
        }
      }
    };

    try {
      type ViewTransitionObject = {
        finished?: Promise<unknown>;
        ready?: Promise<unknown>;
        updateCallbackDone?: Promise<unknown>;
      };

      const doc = typeof document !== "undefined" ? (document as Document & { startViewTransition?: (cb: () => void) => ViewTransitionObject }) : null;

      if (
        doc &&
        typeof doc.startViewTransition === "function" &&
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        const transition = doc.startViewTransition(update);
        transition?.finished?.catch(() => {
          // Handled: Browser AbortError when transition is skipped/superseded
        });
        transition?.ready?.catch(() => {
          // Handled: Browser AbortError
        });
      } else {
        update();
      }
    } catch {
      update();
    }
  },

  isDevToolsOpen: false,
  setDevToolsOpen: (open) => set({ isDevToolsOpen: open }),

  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  isCustomizeOpen: false,
  setCustomizeOpen: (open) => set({ isCustomizeOpen: open }),

  isThemeModalOpen: false,
  setThemeModalOpen: (open) => set({ isThemeModalOpen: open }),

  isTerminalOpen: false,
  setTerminalOpen: (open) => set({ isTerminalOpen: open }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),

  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),

  isMobileDeckSheetOpen: false,
  setMobileDeckSheetOpen: (open) => set({ isMobileDeckSheetOpen: open }),

  fxConfig: {
    backgroundFx: "particles",
    particleCount: 65,
    particleSpeed: 1.0,
    particleInteraction: "repulse",
    particleColorMode: "adaptive",
  },
  setFxConfig: (config) =>
    set((state) => ({
      fxConfig: { ...state.fxConfig, ...config },
    })),
  toggleBackgroundFx: () =>
    set((state) => ({
      fxConfig: {
        ...state.fxConfig,
        backgroundFx: state.fxConfig.backgroundFx === "particles" ? "none" : "particles",
      },
    })),

  isDronePlaying: false,
  setDronePlaying: (playing) => set({ isDronePlaying: playing }),
  toggleDrone: () => {
    const active = cyberAudio.toggleDrone();
    set({ isDronePlaying: active });
    return active;
  },
  isAudioMixerOpen: false,
  setAudioMixerOpen: (open) => set({ isAudioMixerOpen: open }),
  toggleAudioMixer: () => set((state) => ({ isAudioMixerOpen: !state.isAudioMixerOpen })),

  isFullscreen: false,
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

  isRightPanelOpen: true,
  setRightPanelOpen: (open) => {
    set({ isRightPanelOpen: open });
    try {
      localStorage.setItem("dirtynest_right_panel_open", String(open));
    } catch {}
  },
  toggleRightPanel: () => {
    set((state) => {
      const next = !state.isRightPanelOpen;
      try {
        localStorage.setItem("dirtynest_right_panel_open", String(next));
      } catch {}
      return { isRightPanelOpen: next };
    });
  },

  customWidgets: {
    system_stats: true,
    github_activity: true,
    api_health: true,
    rss_feed: true,
    calendar: true,
  },
  setCustomWidgets: (widgets) => set({ customWidgets: widgets }),
}));
