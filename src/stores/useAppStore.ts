import { create } from "zustand";
import { NavViewId } from "@/components/layout/Sidebar";
import { cyberAudio } from "@/lib/cyberAudio";

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
    set({ activeView: view });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${view}`);
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
