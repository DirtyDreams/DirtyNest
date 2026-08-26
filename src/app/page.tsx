"use client";

import { useEffect, useCallback } from "react";
import Sidebar, { NavViewId } from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import StatusBar from "@/components/layout/StatusBar";
import CommandPalette from "@/components/layout/CommandPalette";
import ThemeMenu from "@/components/layout/ThemeMenu";
import MobileNavBar from "@/components/layout/MobileNavBar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import MobileDeckSheet from "@/components/layout/MobileDeckSheet";
import SystemStats from "@/components/widgets/SystemStats";
import GitHubActivity from "@/components/widgets/GitHubActivity";
import RssFeed from "@/components/widgets/RssFeed";
import ApiHealth from "@/components/widgets/ApiHealth";
import CalendarWidget from "@/components/widgets/Calendar";
import DevToolsModal from "@/components/modals/DevToolsModal";
import SettingsModal from "@/components/modals/SettingsModal";
import DashboardCustomizeModal, { DashboardWidgetConfig } from "@/components/modals/DashboardCustomizeModal";
import ThemeCustomizerModal from "@/components/modals/ThemeCustomizerModal";
import AudioMixerModal from "@/components/modals/AudioMixerModal";
import TerminalDock from "@/components/terminal/TerminalDock";
import ChatbotView from "@/components/views/ChatbotView";
import AiAgentsView from "@/components/views/AiAgentsView";
import ControlRoomView from "@/components/views/ControlRoomView";
import DockerView from "@/components/views/DockerView";
import ToolsView from "@/components/views/ToolsView";
import StatsView from "@/components/views/StatsView";
import LogsView from "@/components/views/LogsView";
import SettingsView from "@/components/views/SettingsView";
import KnowledgeView from "@/components/views/KnowledgeView";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UptimeBadge } from "@/components/common/UptimeBadge";
import { useAppStore } from "@/stores/useAppStore";
import { cyberAudio } from "@/lib/cyberAudio";
import { applyThemePreset } from "@/lib/theme";
import { ToastProvider } from "@/components/common/ToastProvider";
import AuthLockScreen from "@/components/auth/AuthLockScreen";
import UserStatusPill from "@/components/auth/UserStatusPill";
import ProtectedAccessGate from "@/components/auth/ProtectedAccessGate";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Terminal,
  Activity,
  ScrollText,
  Sliders,
  Maximize2,
  Minimize2,
  Wrench,
  Search,
  Headphones,
  Settings,
  Bot,
  Cpu,
  Database,
  LayoutDashboard,
  Container,
  Radio,
  Layers,
  Menu,
} from "lucide-react";

export default function Home() {
  const {
    activeView,
    setActiveView,
    isDevToolsOpen,
    setDevToolsOpen,
    isSettingsOpen,
    setSettingsOpen,
    isCustomizeOpen,
    setCustomizeOpen,
    isThemeModalOpen,
    setThemeModalOpen,
    isTerminalOpen,
    setTerminalOpen,
    toggleTerminal,
    isDronePlaying,
    toggleDrone,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
    isMobileDeckSheetOpen,
    setMobileDeckSheetOpen,
    isFullscreen,
    setIsFullscreen,
    isRightPanelOpen,
    toggleRightPanel,
    isAudioMixerOpen,
    setAudioMixerOpen,
    customWidgets,
    setCustomWidgets,
  } = useAppStore();

  const { isAuthenticated, isLocked, recordActivity, lockSession } = useAuthStore();

  useEffect(() => {
    // Sync initial view from URL hash if provided
    if (typeof window !== "undefined" && window.location.hash) {
      const initialHash = window.location.hash.replace("#", "") as NavViewId;
      if (initialHash) {
        setActiveView(initialHash);
      }
    }

    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.replace("#", "") as NavViewId;
        if (hash) setActiveView(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);

    try {
      const savedTheme = localStorage.getItem("dirtynest_theme") || "matrix";
      applyThemePreset(savedTheme);
      const saved = localStorage.getItem("dirtynest_dashboard_layout");
      if (saved) {
        const parsed: DashboardWidgetConfig[] = JSON.parse(saved);
        const map: Record<string, boolean> = {};
        parsed.forEach((w) => (map[w.id] = w.enabled));
        setCustomWidgets(map);
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [setActiveView, setCustomWidgets]);

  // Activity listeners & Auto-Lock timer
  useEffect(() => {
    const handleActivity = () => {
      recordActivity();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    const autoLockInterval = setInterval(() => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated && !state.isLocked && state.autoLockMinutes > 0) {
        const elapsedMs = Date.now() - state.lastActiveTimestamp;
        if (elapsedMs >= state.autoLockMinutes * 60 * 1000) {
          state.lockSession();
        }
      }
    }, 20000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(autoLockInterval);
    };
  }, [recordActivity]);

  // Global hotkeys (Terminal `, Right Panel Ctrl+\, Lock Session Ctrl+L)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
    if (e.key === "`" && !isInput) {
      e.preventDefault();
      toggleTerminal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "\\" && !isInput) {
      e.preventDefault();
      toggleRightPanel();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l" && !isInput) {
      e.preventDefault();
      lockSession();
    }
  }, [toggleTerminal, toggleRightPanel, lockSession]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelectView = (viewId: NavViewId) => {
    setMobileDrawerOpen(false);
    setMobileDeckSheetOpen(false);
    setCustomizeOpen(false);
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", `#${viewId}`);
      } catch {
        // ignore
      }
    }
    if (["api", "rss", "calendar"].includes(viewId)) {
      setActiveView("dashboard");
      setTimeout(() => {
        const el = document.getElementById(`${viewId}-widget`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setActiveView(viewId);
      if (typeof window !== "undefined") {
        try {
          window.scrollTo({ top: 0, behavior: "instant" });
        } catch {
          // ignore
        }
      }
    }
  };

  // Listen for custom navigation events from CommandPalette
  useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<NavViewId>;
      if (customEvent.detail) {
        handleSelectView(customEvent.detail);
      }
    };
    const handleOpenThemeStudio = () => {
      setThemeModalOpen(true);
    };

    let leaderTimeout: NodeJS.Timeout | null = null;
    let isLeaderActive = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        isLeaderActive = true;
        if (leaderTimeout) clearTimeout(leaderTimeout);
        leaderTimeout = setTimeout(() => {
          isLeaderActive = false;
        }, 1000); // 1 second window
        return;
      }

      if (isLeaderActive) {
        let viewId: NavViewId | null = null;
        switch (e.key) {
          case "d": viewId = "dashboard"; break;
          case "c": viewId = "chatbot"; break;
          case "r": viewId = "control_room"; break;
          case "a": viewId = "agents"; break;
          case "k": viewId = "knowledge"; break;
          case "t": viewId = "tools"; break;
          case "s": viewId = "stats"; break;
          case "l": viewId = "logs"; break;
          // Settings uses 'g ,' or 'g S' typically, but let's use 'g ,'
          case ",": viewId = "settings"; break;
        }

        if (viewId) {
          handleSelectView(viewId);
          isLeaderActive = false;
          if (leaderTimeout) clearTimeout(leaderTimeout);
        }
      }
    };

    const handleOpenAudioMixer = () => setAudioMixerOpen(true);

    window.addEventListener("dirtynest-navigate", handleCustomNav);
    window.addEventListener("dirtynest-open-theme-studio", handleOpenThemeStudio);
    window.addEventListener("dirtynest-open-audio-mixer", handleOpenAudioMixer);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("dirtynest-navigate", handleCustomNav);
      window.removeEventListener("dirtynest-open-theme-studio", handleOpenThemeStudio);
      window.removeEventListener("dirtynest-open-audio-mixer", handleOpenAudioMixer);
      window.removeEventListener("keydown", handleKeyDown);
      if (leaderTimeout) clearTimeout(leaderTimeout);
    };
  }, [setThemeModalOpen, setAudioMixerOpen]);

  const toggleFullscreen = () => {
    cyberAudio.play("click");
    try {
      if (typeof document !== "undefined") {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const triggerCmdPalette = () => {
    cyberAudio.play("click");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-open-palette"));
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
      );
    }
  };

  const handleLayoutUpdated = (widgets: DashboardWidgetConfig[]) => {
    const map: Record<string, boolean> = {};
    widgets.forEach((w) => (map[w.id] = w.enabled));
    setCustomWidgets(map);
  };

  return (
    <ToastProvider>
      {/* Cyber Security Lock Screen Gateway */}
      {(!isAuthenticated || isLocked) && <AuthLockScreen />}

      <CommandPalette />
      <DevToolsModal isOpen={isDevToolsOpen} onClose={() => setDevToolsOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setCustomizeOpen(false)}
        onLayoutChange={handleLayoutUpdated}
      />
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
      <AudioMixerModal
        isOpen={isAudioMixerOpen}
        onClose={() => setAudioMixerOpen(false)}
      />
      <TerminalDock isOpen={isTerminalOpen} onClose={() => setTerminalOpen(false)} />

      {/* Main Responsive Grid Layout */}
      <div className="flex min-h-screen bg-[#07070B] text-[#F1F3F9] font-sans antialiased selection:bg-[#00FF41]/20 selection:text-[#00FF41]">
        {/* Left Interactive Nav Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenSettingsModal={() => setSettingsOpen(true)}
        />

        {/* Central Tactical Workspace */}
        <main className={`flex-1 min-w-0 max-w-full ml-0 md:ml-[68px] ${isRightPanelOpen ? "xl:mr-[340px]" : "xl:mr-[52px]"} px-3 sm:px-5 py-3 sm:py-4 pb-40 flex flex-col transition-all duration-300`}>
          {/* Top Operational Breadcrumb HUD Bar */}
          <header className="flex flex-col gap-2.5 mb-4 pb-3 border-b border-white/5 relative z-30">
            {/* Row 1: Brand & Node Status (Left) + Identity + Compact Non-wrapping HUD Toolbar (Right) */}
            <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-4 w-full h-10 shrink-0">
              {/* Left: Brand & Mobile Trigger */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 h-9">
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    setMobileDrawerOpen(true);
                  }}
                  className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
                  title="Open Tactical Menu"
                  aria-label="Open Navigation Menu"
                >
                  <Menu size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-extrabold tracking-wider"
                    style={{
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      color: "#00FF41",
                      textShadow: "0 0 12px rgba(0,255,65,0.4)",
                    }}
                  >
                    DirtyNest
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                    OPERATIONAL
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#4F536E]">
                  <span>NODE://ROOT/MAIN</span>
                  <span>•</span>
                  <UptimeBadge />
                </div>

                {/* Operator Identity & Clearance Dropdown */}
                <UserStatusPill />
              </div>

              {/* Right: Quick Action HUD Controls (Strictly Non-Wrapping, Locked Height) */}
              <div className="flex flex-nowrap items-center gap-1 sm:gap-1.5 shrink-0 h-9">
                {/* Customize Dashboard Button */}
                {activeView === "dashboard" && (
                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setCustomizeOpen(true);
                    }}
                    className="h-9 px-2.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/20 transition-all text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5"
                    title="Customize Overview Widgets"
                    aria-label="Customize Overview Widgets"
                  >
                    <Sliders size={14} />
                    <span className="hidden 2xl:inline">CUSTOMIZE</span>
                  </button>
                )}

                {/* Tactical Deck Toggle Button (Desktop & Mobile) */}
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    if (window.innerWidth >= 1280) {
                      toggleRightPanel();
                    } else {
                      setMobileDeckSheetOpen(true);
                    }
                  }}
                  className={`h-9 px-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 ${
                    isRightPanelOpen
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                      : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#00F0FF] hover:border-[#00F0FF]/40"
                  }`}
                  title="Toggle Tactical Deck Panel (Hotkey: Ctrl + \)"
                  aria-label="Toggle Tactical Deck"
                >
                  <Layers size={14} />
                  <span className="hidden 2xl:inline">DECK</span>
                </button>

                {/* Command palette search trigger */}
                <button
                  onClick={triggerCmdPalette}
                  className="h-9 flex items-center gap-1.5 px-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer group"
                  title="Open Command Palette (Ctrl+K)"
                  aria-label="Open Command Palette"
                >
                  <Search size={14} className="group-hover:text-[#00FF41]" />
                  <span className="text-xs font-mono hidden 2xl:inline">Palette</span>
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[#4F536E] group-hover:text-[#00FF41] hidden sm:inline">
                    ^K
                  </kbd>
                </button>

                {/* DevTools Matrix modal button */}
                <button
                  onClick={() => setDevToolsOpen(true)}
                  title="Developer Tools Matrix"
                  aria-label="Open Developer Tools"
                  className="h-9 px-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench size={14} />
                  <span className="text-xs font-mono hidden 2xl:inline">DevTools</span>
                </button>

                {/* Terminal CLI Toggle */}
                <button
                  onClick={toggleTerminal}
                  title="Toggle Cyber CLI Terminal (Hotkey: `)"
                  aria-label="Toggle Terminal"
                  className={`h-9 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isTerminalOpen
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold"
                      : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40"
                  }`}
                >
                  <Terminal size={14} />
                  <span className="text-xs font-mono hidden 2xl:inline">CLI</span>
                </button>

                {/* Ambient Focus Audio Soundboard */}
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    setAudioMixerOpen(true);
                  }}
                  title="Open Cyber Audio Matrix & Ambient Soundboard"
                  aria-label="Toggle Ambient Audio Matrix"
                  className={`h-9 w-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isDronePlaying
                      ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/40 shadow-[0_0_10px_rgba(191,64,255,0.3)] animate-pulse"
                      : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#BF40FF] hover:border-[#BF40FF]/40"
                  }`}
                >
                  <Headphones size={15} />
                </button>

                {/* Theme Palette Switcher */}
                <ThemeMenu onOpenCustomizer={() => setThemeModalOpen(true)} />

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  title="Toggle Fullscreen Deck"
                  aria-label="Toggle Fullscreen"
                  className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer flex items-center justify-center"
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* Row 2: View Mode Quick Navigation Strip (Full width, scrollable, clean) */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto scrollbar-none w-full" role="tablist" aria-label="Deck Views">
              <button
                role="tab"
                aria-selected={activeView === "dashboard"}
                onClick={() => handleSelectView("dashboard")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "dashboard"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                <LayoutDashboard size={13} />
                <span>OVERVIEW</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "chatbot"}
                onClick={() => handleSelectView("chatbot")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "chatbot"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Bot size={13} />
                <span>CHATBOT</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "control_room"}
                onClick={() => handleSelectView("control_room")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "control_room"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Radio size={13} />
                <span>CONTROL ROOM</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "agents"}
                onClick={() => handleSelectView("agents")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "agents"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Cpu size={13} />
                <span>AGENTS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "knowledge"}
                onClick={() => handleSelectView("knowledge")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "knowledge"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Database size={13} />
                <span>KNOWLEDGE</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "docker"}
                onClick={() => handleSelectView("docker")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "docker"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Container size={13} />
                <span>DOCKER</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "tools"}
                onClick={() => handleSelectView("tools")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "tools"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Wrench size={13} />
                <span>TOOLS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "stats"}
                onClick={() => handleSelectView("stats")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "stats"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Activity size={13} />
                <span>STATS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "logs"}
                onClick={() => handleSelectView("logs")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "logs"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <ScrollText size={13} />
                <span>LOGS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "settings"}
                onClick={() => handleSelectView("settings")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "settings"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Settings size={13} />
                <span>SETTINGS</span>
              </button>
            </div>
          </header>

          {/* ACTIVE VIEW RENDERING WITH ERROR BOUNDARIES & PROTECTED ACCESS GATES */}
          {activeView === "dashboard" && (
            <ProtectedAccessGate minClearance={1} viewName="Overview Dashboard">
              <ErrorBoundary fallbackTitle="DASHBOARD WIDGET GRID ERROR">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pb-6 animate-fade-in items-start">
                  {customWidgets.system_stats !== false && (
                    <div id="stats-widget">
                      <SystemStats />
                    </div>
                  )}
                  {customWidgets.github_activity !== false && (
                    <div id="git-widget">
                      <GitHubActivity />
                    </div>
                  )}
                  {customWidgets.rss_feed !== false && (
                    <div id="rss-widget">
                      <RssFeed />
                    </div>
                  )}
                  {customWidgets.api_health !== false && (
                    <div id="api-widget">
                      <ApiHealth />
                    </div>
                  )}
                  {customWidgets.calendar !== false && (
                    <div id="calendar-widget" className="lg:col-span-2">
                      <CalendarWidget />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "chatbot" && (
            <ProtectedAccessGate minClearance={2} viewName="Neural Chatbot Matrix">
              <ErrorBoundary fallbackTitle="NEURAL CHATBOT MALFUNCTION">
                <ChatbotView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "control_room" && (
            <ProtectedAccessGate minClearance={2} viewName="Agent Control Room">
              <ErrorBoundary fallbackTitle="CONTROL ROOM MALFUNCTION">
                <ControlRoomView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "agents" && (
            <ProtectedAccessGate minClearance={3} viewName="Autonomous AI Agents">
              <ErrorBoundary fallbackTitle="AI AGENT SWARM MALFUNCTION">
                <AiAgentsView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "knowledge" && (
            <ProtectedAccessGate minClearance={2} viewName="Knowledge Vault Matrix">
              <ErrorBoundary fallbackTitle="KNOWLEDGE VAULT MALFUNCTION">
                <KnowledgeView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "docker" && (
            <ProtectedAccessGate minClearance={3} viewName="Docker Hub & Containers">
              <ErrorBoundary fallbackTitle="DOCKER MANAGER MALFUNCTION">
                <DockerView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "tools" && (
            <ProtectedAccessGate minClearance={3} viewName="Tactical DevTools Matrix">
              <ErrorBoundary fallbackTitle="TACTICAL TOOLS MALFUNCTION">
                <ToolsView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "stats" && (
            <ProtectedAccessGate minClearance={2} viewName="Prometheus Telemetry & Stats">
              <ErrorBoundary fallbackTitle="SYSTEM TELEMETRY MALFUNCTION">
                <StatsView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "logs" && (
            <ProtectedAccessGate minClearance={2} viewName="Security & Event Logs">
              <ErrorBoundary fallbackTitle="OPERATIONS LOG MALFUNCTION">
                <LogsView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "settings" && (
            <ProtectedAccessGate minClearance={3} viewName="System Configuration">
              <ErrorBoundary fallbackTitle="CONFIGURATION MALFUNCTION">
                <SettingsView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}
        </main>

        {/* Right Tactical Sidebar with Tabbed Focus Deck */}
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenDeckSheet={() => setMobileDeckSheetOpen(true)}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenSettingsModal={() => setSettingsOpen(true)}
        onOpenDevTools={() => setDevToolsOpen(true)}
        onToggleTerminal={toggleTerminal}
        isTerminalOpen={isTerminalOpen}
        isDronePlaying={isDronePlaying}
        onToggleDrone={toggleDrone}
        uptimeText="SYSTEM ONLINE"
      />

      {/* Mobile Tactical Deck Sheet */}
      <MobileDeckSheet
        isOpen={isMobileDeckSheetOpen}
        onClose={() => setMobileDeckSheetOpen(false)}
      />

      {/* Persistent Bottom HUD Status Bar (Desktop) */}
      <StatusBar
        onToggleTerminal={toggleTerminal}
        isTerminalOpen={isTerminalOpen}
      />
    </ToastProvider>
  );
}
