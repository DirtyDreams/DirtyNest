"use client";

import { useState, useEffect, useCallback } from "react";
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
import SettingsView from "@/components/views/SettingsView";
import KnowledgeView from "@/components/views/KnowledgeView";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  Terminal,
  Activity,
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
  Sparkles,
  Layers,
  Menu,
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<NavViewId>("dashboard");
  const [uptimeSeconds, setUptimeSeconds] = useState(14820);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isDronePlaying, setIsDronePlaying] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileDeckSheetOpen, setIsMobileDeckSheetOpen] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<Record<string, boolean>>({
    system_stats: true,
    github_activity: true,
    api_health: true,
    rss_feed: true,
    calendar: true,
  });

  useEffect(() => {
    setMounted(true);
    // Sync initial view from URL hash if provided
    if (typeof window !== "undefined" && window.location.hash) {
      const initialHash = window.location.hash.replace("#", "") as NavViewId;
      if (initialHash) {
        setActiveView(initialHash);
      }
    }

    const handleHashChange = () => {
      if (window.location.hash) {
        const hash = window.location.hash.replace("#", "") as NavViewId;
        if (hash) setActiveView(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);

    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);

    try {
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
      clearInterval(interval);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Global hotkey for terminal (backtick)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "`" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      setIsTerminalOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelectView = (viewId: NavViewId) => {
    setIsMobileDrawerOpen(false);
    setIsMobileDeckSheetOpen(false);
    setIsCustomizeOpen(false);
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
    const handleCustomNav = (e: CustomEvent<NavViewId>) => {
      if (e.detail) {
        handleSelectView(e.detail);
      }
    };
    const handleOpenThemeStudio = () => {
      setIsThemeModalOpen(true);
    };
    window.addEventListener("dirtynest-navigate" as any, handleCustomNav);
    window.addEventListener("dirtynest-open-theme-studio" as any, handleOpenThemeStudio);
    return () => {
      window.removeEventListener("dirtynest-navigate" as any, handleCustomNav);
      window.removeEventListener("dirtynest-open-theme-studio" as any, handleOpenThemeStudio);
    };
  }, []);

  const formatUptime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const toggleScanlines = () => {
    cyberAudio.play("click");
    try {
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.toggle("scan-overlay");
      }
    } catch {
      // ignore
    }
  };

  const toggleDroneAudio = () => {
    const active = cyberAudio.toggleDrone();
    setIsDronePlaying(active);
  };

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
      <DevToolsModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onLayoutChange={handleLayoutUpdated}
      />
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
      <TerminalDock isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

      {/* Main Responsive Grid Layout */}
      <div className="flex min-h-screen bg-[#07070B] text-[#F1F3F9] font-sans antialiased overflow-x-hidden selection:bg-[#00FF41]/20 selection:text-[#00FF41]">
        {/* Left Interactive Nav Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
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
                  setIsMobileDrawerOpen(true);
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
                <div className="flex items-center gap-1">
                  <span>
                    UPTIME:{" "}
                    <span className="text-[#00F0FF]" suppressHydrationWarning>
                      {mounted ? formatUptime(uptimeSeconds) : "04h 07m 00s"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode Quick Navigation Chips (Visible and scrollable on all viewports) */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto scrollbar-none max-w-full order-last lg:order-none w-full lg:w-auto">
              <button
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
                    setIsCustomizeOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/20 transition-all text-xs font-mono font-bold cursor-pointer"
                  title="Customize Overview Widgets"
                >
                  <Sliders size={13} />
                  <span className="hidden sm:inline">CUSTOMIZE</span>
                </button>
              )}

              {/* Mobile Tactical Deck Button (visible when RightPanel is hidden) */}
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setIsMobileDeckSheetOpen(true);
                }}
                className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all text-xs font-mono font-bold cursor-pointer"
                title="Open Tactical Deck (Tasks, Notes, Timer)"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">DECK</span>
              </button>

              {/* Command palette search trigger */}
              <button
                onClick={triggerCmdPalette}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer group"
                title="Open Command Palette (Ctrl+K)"
              >
                <Search size={14} className="group-hover:text-[#00FF41]" />
                <span className="text-xs font-mono hidden md:inline">Command Palette</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#4F536E] group-hover:text-[#00FF41] hidden sm:inline">
                  Ctrl + K
                </kbd>
              </button>

              {/* DevTools Matrix modal button */}
              <button
                onClick={() => setIsDevToolsOpen(true)}
                title="Developer Tools Matrix"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
              >
                <Wrench size={14} />
                <span className="text-xs font-mono hidden lg:inline">DevTools</span>
              </button>

              {/* Terminal CLI Toggle */}
              <button
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                title="Toggle Cyber CLI Terminal (Hotkey: `)"
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
                onClick={toggleDroneAudio}
                title={isDronePlaying ? "Mute Ambient Focus Drone" : "Start Binaural Theta Focus Drone"}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDronePlaying
                    ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/40 shadow-[0_0_10px_rgba(191,64,255,0.3)] animate-pulse"
                    : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#BF40FF] hover:border-[#BF40FF]/40"
                }`}
              >
                <Headphones size={15} />
              </button>

              {/* Theme Palette Switcher */}
              <ThemeMenu onOpenCustomizer={() => setIsThemeModalOpen(true)} />

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen Deck"
                className="hidden sm:flex p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </header>

          {/* ACTIVE VIEW RENDERING */}
          {activeView === "dashboard" && (
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
          )}

          {activeView === "chatbot" && <ChatbotView />}

          {activeView === "control_room" && <ControlRoomView />}

          {activeView === "agents" && <AiAgentsView />}

          {activeView === "knowledge" && <KnowledgeView />}

          {activeView === "docker" && <DockerView />}

          {activeView === "tools" && <ToolsView />}

          {activeView === "stats" && <StatsView />}

          {activeView === "settings" && <SettingsView />}
        </main>

        {/* Right Tactical Sidebar with Tabbed Focus Deck */}
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenDeckSheet={() => setIsMobileDeckSheetOpen(true)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenDevTools={() => setIsDevToolsOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
        isDronePlaying={isDronePlaying}
        onToggleDrone={toggleDroneAudio}
        uptimeText={formatUptime(uptimeSeconds)}
      />

      {/* Mobile Tactical Deck Sheet */}
      <MobileDeckSheet
        isOpen={isMobileDeckSheetOpen}
        onClose={() => setIsMobileDeckSheetOpen(false)}
      />

      {/* Persistent Bottom HUD Status Bar (Desktop) */}
      <StatusBar
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
      />
    </>
  );
}
