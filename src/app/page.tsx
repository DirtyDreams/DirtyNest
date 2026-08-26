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
    customWidgets,
    setCustomWidgets,
  } = useAppStore();

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

  // Global hotkey for terminal (backtick)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "`" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      toggleTerminal();
    }
  }, [toggleTerminal]);

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
    window.addEventListener("dirtynest-navigate", handleCustomNav);
    window.addEventListener("dirtynest-open-theme-studio", handleOpenThemeStudio);
    return () => {
      window.removeEventListener("dirtynest-navigate", handleCustomNav);
      window.removeEventListener("dirtynest-open-theme-studio", handleOpenThemeStudio);
    };
  }, [setThemeModalOpen]);

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
    <>
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
      <TerminalDock isOpen={isTerminalOpen} onClose={() => setTerminalOpen(false)} />

      {/* Main Responsive Grid Layout */}
      <div className="flex min-h-screen bg-[#07070B] text-[#F1F3F9] font-sans antialiased overflow-x-hidden selection:bg-[#00FF41]/20 selection:text-[#00FF41]">
        {/* Left Interactive Nav Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenSettingsModal={() => setSettingsOpen(true)}
        />

        {/* Central Tactical Workspace */}
        <main className="flex-1 min-w-0 max-w-full ml-0 md:ml-[68px] xl:mr-[350px] px-3 sm:px-5 py-3 sm:py-4 pb-24 md:pb-12 min-h-screen flex flex-col transition-all duration-300">
          {/* Top Operational Breadcrumb HUD Bar */}
          <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Mobile Drawer Hamburger Trigger */}
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setMobileDrawerOpen(true);
                }}
                className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
                title="Open Tactical Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu size={18} />
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
            </div>

            {/* View Mode Quick Navigation Chips (Visible and scrollable on all viewports) */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto scrollbar-none max-w-full order-last lg:order-none w-full lg:w-auto" role="tablist" aria-label="Deck Views">
              <button
                role="tab"
                aria-selected={activeView === "dashboard"}
                onClick={() => handleSelectView("dashboard")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "dashboard"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                <LayoutDashboard size={12} />
                <span>OVERVIEW</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "chatbot"}
                onClick={() => handleSelectView("chatbot")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "chatbot"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Bot size={12} />
                <span>CHATBOT</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "control_room"}
                onClick={() => handleSelectView("control_room")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "control_room"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Radio size={12} />
                <span>CONTROL ROOM</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "agents"}
                onClick={() => handleSelectView("agents")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "agents"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Cpu size={12} />
                <span>AGENTS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "knowledge"}
                onClick={() => handleSelectView("knowledge")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "knowledge"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Database size={12} />
                <span>KNOWLEDGE</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "docker"}
                onClick={() => handleSelectView("docker")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "docker"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Container size={12} />
                <span>DOCKER</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "tools"}
                onClick={() => handleSelectView("tools")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "tools"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Wrench size={12} />
                <span>TOOLS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "stats"}
                onClick={() => handleSelectView("stats")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "stats"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Activity size={12} />
                <span>STATS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "logs"}
                onClick={() => handleSelectView("logs")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "logs"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <ScrollText size={12} />
                <span>LOGS</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "settings"}
                onClick={() => handleSelectView("settings")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === "settings"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Settings size={12} />
                <span>SETTINGS</span>
              </button>
            </div>

            {/* Quick Action HUD Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Customize Dashboard Button */}
              {activeView === "dashboard" && (
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    setCustomizeOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/20 transition-all text-xs font-mono font-bold cursor-pointer"
                  title="Customize Overview Widgets"
                  aria-label="Customize Overview Widgets"
                >
                  <Sliders size={13} />
                  <span className="hidden sm:inline">CUSTOMIZE</span>
                </button>
              )}

              {/* Mobile Tactical Deck Button (visible when RightPanel is hidden) */}
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setMobileDeckSheetOpen(true);
                }}
                className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all text-xs font-mono font-bold cursor-pointer"
                title="Open Tactical Deck (Tasks, Notes, Timer)"
                aria-label="Open Tactical Deck"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">DECK</span>
              </button>

              {/* Command palette search trigger */}
              <button
                onClick={triggerCmdPalette}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer group"
                title="Open Command Palette (Ctrl+K)"
                aria-label="Open Command Palette"
              >
                <Search size={14} className="group-hover:text-[#00FF41]" />
                <span className="text-xs font-mono hidden md:inline">Command Palette</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#4F536E] group-hover:text-[#00FF41] hidden sm:inline">
                  Ctrl + K
                </kbd>
              </button>

              {/* DevTools Matrix modal button */}
              <button
                onClick={() => setDevToolsOpen(true)}
                title="Developer Tools Matrix"
                aria-label="Open Developer Tools"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
              >
                <Wrench size={14} />
                <span className="text-xs font-mono hidden lg:inline">DevTools</span>
              </button>

              {/* Terminal CLI Toggle */}
              <button
                onClick={toggleTerminal}
                title="Toggle Cyber CLI Terminal (Hotkey: `)"
                aria-label="Toggle Terminal"
                className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isTerminalOpen
                    ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold"
                    : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40"
                }`}
              >
                <Terminal size={14} />
                <span className="text-xs font-mono hidden lg:inline">CLI</span>
              </button>

              {/* Ambient Focus Audio Drone */}
              <button
                onClick={toggleDrone}
                title={isDronePlaying ? "Mute Ambient Focus Drone" : "Start Binaural Theta Focus Drone"}
                aria-label="Toggle Ambient Focus Drone"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
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
                className="hidden sm:flex p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </header>

          {/* ACTIVE VIEW RENDERING WITH ERROR BOUNDARIES */}
          {activeView === "dashboard" && (
            <ErrorBoundary fallbackTitle="DASHBOARD WIDGET GRID ERROR">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pb-6 animate-fade-in">
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
          )}

          {activeView === "chatbot" && (
            <ErrorBoundary fallbackTitle="NEURAL CHATBOT MALFUNCTION">
              <ChatbotView />
            </ErrorBoundary>
          )}

          {activeView === "control_room" && (
            <ErrorBoundary fallbackTitle="CONTROL ROOM MALFUNCTION">
              <ControlRoomView />
            </ErrorBoundary>
          )}

          {activeView === "agents" && (
            <ErrorBoundary fallbackTitle="AI AGENT SWARM MALFUNCTION">
              <AiAgentsView />
            </ErrorBoundary>
          )}

          {activeView === "knowledge" && (
            <ErrorBoundary fallbackTitle="KNOWLEDGE VAULT MALFUNCTION">
              <KnowledgeView />
            </ErrorBoundary>
          )}

          {activeView === "docker" && (
            <ErrorBoundary fallbackTitle="DOCKER MANAGER MALFUNCTION">
              <DockerView />
            </ErrorBoundary>
          )}

          {activeView === "tools" && (
            <ErrorBoundary fallbackTitle="TACTICAL TOOLS MALFUNCTION">
              <ToolsView />
            </ErrorBoundary>
          )}

          {activeView === "stats" && (
            <ErrorBoundary fallbackTitle="SYSTEM TELEMETRY MALFUNCTION">
              <StatsView />
            </ErrorBoundary>
          )}

          {activeView === "logs" && (
            <ErrorBoundary fallbackTitle="OPERATIONS LOG MALFUNCTION">
              <LogsView />
            </ErrorBoundary>
          )}

          {activeView === "settings" && (
            <ErrorBoundary fallbackTitle="CONFIGURATION MALFUNCTION">
              <SettingsView />
            </ErrorBoundary>
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
    </>
  );
}
