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
import DoraMetricsBar from "@/components/widgets/DoraMetricsBar";
import AiInsightBrief from "@/components/widgets/AiInsightBrief";
import QuickActionHub from "@/components/widgets/QuickActionHub";
import HermesStatusWidget from "@/components/widgets/HermesStatusWidget";
import ServiceStatusCompact from "@/components/widgets/ServiceStatusCompact";
import PipelineQueueWidget from "@/components/widgets/PipelineQueueWidget";
import AiAgentQuotaWidget from "@/components/widgets/AiAgentQuotaWidget";
import AwsCloudBurnWidget from "@/components/widgets/AwsCloudBurnWidget";
import AgentSecurityBeaconWidget from "@/components/widgets/AgentSecurityBeaconWidget";
import SqlSlowQueryRadar from "@/components/widgets/SqlSlowQueryRadar";
import EbpfKernelHeatWidget from "@/components/widgets/EbpfKernelHeatWidget";
import CveVulnerabilityRadar from "@/components/widgets/CveVulnerabilityRadar";
import CryptoHashVerifier from "@/components/widgets/CryptoHashVerifier";
import GitPrVelocityWidget from "@/components/widgets/GitPrVelocityWidget";
import GlobalDnsSslRadar from "@/components/widgets/GlobalDnsSslRadar";
import ClipboardManagerWidget from "@/components/widgets/ClipboardManagerWidget";
import CyberSoundscapeWidget from "@/components/widgets/CyberSoundscapeWidget";
import GitHubTrendingRepos from "@/components/widgets/GitHubTrendingRepos";
import ColorPaletteGenerator from "@/components/widgets/ColorPaletteGenerator";
import MatrixRainZenCanvas from "@/components/widgets/MatrixRainZenCanvas";
import DevHydrationStreak from "@/components/widgets/DevHydrationStreak";
import GlobalTimezonesRadar from "@/components/widgets/GlobalTimezonesRadar";
import DevToolsModal from "@/components/modals/DevToolsModal";
import SettingsModal from "@/components/modals/SettingsModal";
import DashboardCustomizeModal, { DashboardWidgetConfig } from "@/components/modals/DashboardCustomizeModal";
import ThemeCustomizerModal from "@/components/modals/ThemeCustomizerModal";
import AudioMixerModal from "@/components/modals/AudioMixerModal";
import HermesQuickCommandModal from "@/components/modals/HermesQuickCommandModal";
import HermesMasterStatusBadge from "@/components/common/HermesMasterStatusBadge";
import TerminalDock from "@/components/terminal/TerminalDock";
import CyberWindowManager from "@/components/desktop/CyberWindowManager";
import KeyboardHotkeyStudioModal from "@/components/views/tools/KeyboardHotkeyStudioModal";
import dynamic from "next/dynamic";
import ViewLoadingSkeleton from "@/components/common/ViewLoadingSkeleton";
import { loadWidgetLayout, saveWidgetLayout, type WidgetLayoutItem, DEFAULT_LAYOUT, LAYOUT_PRESETS, ALL_WIDGETS_METADATA } from "@/lib/widgetLayout";

const ChatbotView = dynamic(() => import("@/components/views/ChatbotView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="AI CHATBOT & CANVAS" />,
});
const PersonaNexusView = dynamic(() => import("@/components/views/PersonaNexusView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="PERSONA NEXUS & CHARACTERS" />,
});
const AiAgentsView = dynamic(() => import("@/components/views/AiAgentsView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="AGENT SWARM FLEET" />,
});
const ControlRoomView = dynamic(() => import("@/components/views/ControlRoomView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="CONTROL ROOM & DAG TOPOLOGY" />,
});
const DockerView = dynamic(() => import("@/components/views/DockerView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="DOCKER CONTAINER MATRIX" />,
});
const ToolsView = dynamic(() => import("@/components/views/ToolsView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="DEVELOPER TOOLS SUITE" />,
});
const StatsView = dynamic(() => import("@/components/views/StatsView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="SYSTEM MONITOR & TELEMETRY" />,
});
const LogsView = dynamic(() => import("@/components/views/LogsView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="SYSTEM & SECURITY LOGS" />,
});
const SettingsView = dynamic(() => import("@/components/views/SettingsView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="CONFIGURATION & PARAMETERS" />,
});
const KnowledgeView = dynamic(() => import("@/components/views/KnowledgeView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="KNOWLEDGE VAULT & PKM" />,
});
const ApiHealthView = dynamic(() => import("@/components/views/ApiHealthView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="API HEALTH MATRIX" />,
});
const IntelFeedView = dynamic(() => import("@/components/views/IntelFeedView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="CYBER INTEL WIRE" />,
});
const ScheduleView = dynamic(() => import("@/components/views/ScheduleView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="MISSION SCHEDULE & CALENDAR" />,
});
const ImageStudioView = dynamic(() => import("@/components/views/ImageStudioView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="IMAGE STUDIO & DIFFUSION CANVAS" />,
});
const SoundStudioView = dynamic(() => import("@/components/views/SoundStudioView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="SOUND STUDIO & VOICE CLONING" />,
});
const SocialMediaView = dynamic(() => import("@/components/views/SocialMediaView"), {
  ssr: false,
  loading: () => <ViewLoadingSkeleton title="SOCIAL MEDIA COMMAND HUB" />,
});
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
  Wifi,
  Rss,
  Calendar,
  Image as ImageIcon,
  Mic,
  Share2,
  Square,
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

  const [isHermesCommandModalOpen, setIsHermesCommandModalOpen] = useState(false);
  const [isFloatingOsOpen, setIsFloatingOsOpen] = useState(false);
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState(false);
  const { isAuthenticated, isLocked, recordActivity, lockSession } = useAuthStore();

  useEffect(() => {
    const handleCustomToggleHotkeys = () => {
      cyberAudio.play("warp");
      setIsHotkeyModalOpen((prev) => !prev);
    };
    window.addEventListener("dirtynest-toggle-hotkeys", handleCustomToggleHotkeys);
    return () => window.removeEventListener("dirtynest-toggle-hotkeys", handleCustomToggleHotkeys);
  }, []);

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

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInput =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable;

    if (e.key === "`" && !isInput) {
      e.preventDefault();
      toggleTerminal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !isInput) {
      e.preventDefault();
      setIsHermesCommandModalOpen((prev) => !prev);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "\\" && !isInput) {
      e.preventDefault();
      toggleRightPanel();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p" && !isInput) {
      e.preventDefault();
      cyberAudio.play("warp");
      handleSelectView("agents");
    }
    if ((e.key === "?" || (e.shiftKey && e.key === "/")) && !isInput) {
      e.preventDefault();
      cyberAudio.play("warp");
      setIsHotkeyModalOpen((prev) => !prev);
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l" && !isInput) {
      e.preventDefault();
      lockSession();
    }
  }, [toggleTerminal, toggleRightPanel, lockSession, setIsHermesCommandModalOpen, setIsHotkeyModalOpen]);

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
        window.scrollTo({ top: 0, behavior: "instant" });
      } catch {
        // ignore
      }
    }
    setActiveView(viewId);
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

  const [dashboardLayout, setDashboardLayout] = useState<WidgetLayoutItem[]>(() => loadWidgetLayout());

  useEffect(() => {
    const handleSync = () => setDashboardLayout(loadWidgetLayout());
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("dirtynest-layout-updated", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("dirtynest-layout-updated", handleSync);
    };
  }, []);

  const handleLayoutUpdated = (widgets: DashboardWidgetConfig[]) => {
    const map: Record<string, boolean> = {};
    widgets.forEach((w) => (map[w.id] = w.enabled));
    setCustomWidgets(map);
    setDashboardLayout(loadWidgetLayout());
  };

  const handleQuickPreset = (presetKey: string) => {
    cyberAudio.play("chime");
    let targetIds: string[] = [];
    if (presetKey === "all_widgets" || presetKey === "all") {
      targetIds = ALL_WIDGETS_METADATA.map((w) => w.id);
    } else if (presetKey === "tactical_sre" || presetKey === "sre") {
      targetIds = LAYOUT_PRESETS.sre.ids;
    } else if (presetKey === "ai_researcher" || presetKey === "ai") {
      targetIds = LAYOUT_PRESETS.ai.ids;
    } else if (presetKey === "cyber_ops" || presetKey === "devops") {
      targetIds = LAYOUT_PRESETS.devops.ids;
    } else if (presetKey === "developer_docker") {
      targetIds = ["service_status", "system_stats", "aws_cloud_burn", "git_pr_velocity", "github_trending", "pipeline_queue", "github_activity", "api_health"];
    } else if (presetKey === "minimalist" || presetKey === "minimal") {
      targetIds = LAYOUT_PRESETS.minimal.ids;
    }

    const newLayout: WidgetLayoutItem[] = ALL_WIDGETS_METADATA.map((w) => ({
      id: w.id,
      enabled: targetIds.includes(w.id),
      span: w.defaultSpan,
    }));

    saveWidgetLayout(newLayout);
    setDashboardLayout(newLayout);
    const map: Record<string, boolean> = {};
    newLayout.forEach((w) => (map[w.id] = w.enabled));
    setCustomWidgets(map);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
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
      <div className="h-[100dvh] md:h-auto md:min-h-screen bg-[#07070B] text-[#F1F3F9] font-sans antialiased selection:bg-[#00FF41]/20 selection:text-[#00FF41] flex flex-col md:block overflow-hidden md:overflow-visible">
        {/* Top Operational Breadcrumb HUD Bar (Persistent Global Header) */}
        <header
          className={`sticky md:fixed top-0 left-0 right-0 md:left-[68px] ${isRightPanelOpen ? "xl:right-[340px]" : "xl:right-[52px]"} z-40 shrink-0 flex flex-col gap-2 px-3 sm:px-5 pt-safe pt-2 sm:pt-3 pb-2 bg-[#07070B]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.85)] transition-all duration-300`}
        >
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
                  <span>•</span>
                  <HermesMasterStatusBadge onOpenCommandDrawer={() => setIsHermesCommandModalOpen(true)} />
                </div>
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

                {/* Floating Multi-Window Desktop OS Toggle */}
                <button
                  onClick={() => {
                    cyberAudio.play("warp");
                    setIsFloatingOsOpen((prev) => !prev);
                  }}
                  className={`h-9 px-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 ${
                    isFloatingOsOpen
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.3)] animate-pulse"
                      : "bg-white/[0.03] border-white/10 text-slate-300 hover:text-[#00FF41] hover:border-[#00FF41]/40"
                  }`}
                  title="Toggle Cyberpunk Floating Multi-Window Desktop OS"
                  aria-label="Toggle Floating Multi-Window Desktop OS"
                >
                  <Square size={13} className={isFloatingOsOpen ? "text-[#00FF41]" : "text-slate-400"} />
                  <span className="hidden sm:inline">FLOAT OS</span>
                </button>

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
                  title="Open Command Palette (Ctrl+P)"
                  aria-label="Open Command Palette"
                >
                  <Search size={14} className="group-hover:text-[#00FF41]" />
                  <span className="text-xs font-mono hidden 2xl:inline">Palette</span>
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[#4F536E] group-hover:text-[#00FF41] hidden sm:inline">
                    ^P
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
                aria-selected={activeView === "image_studio"}
                onClick={() => handleSelectView("image_studio")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "image_studio"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <ImageIcon size={13} />
                <span>IMAGE STUDIO</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "sound_studio"}
                onClick={() => handleSelectView("sound_studio")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "sound_studio"
                    ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                    : "text-[#9499B3] hover:text-[#BF40FF]"
                }`}
              >
                <Mic size={13} />
                <span>SOUND STUDIO</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "social_media"}
                onClick={() => handleSelectView("social_media")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "social_media"
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-[#9499B3] hover:text-[#00F0FF]"
                }`}
              >
                <Share2 size={13} />
                <span>SOCIAL MEDIA</span>
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
                aria-selected={activeView === "api"}
                onClick={() => handleSelectView("api")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "api"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Wifi size={13} />
                <span>API HEALTH</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "rss"}
                onClick={() => handleSelectView("rss")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "rss"
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-[#9499B3] hover:text-[#00F0FF]"
                }`}
              >
                <Rss size={13} />
                <span>INTEL FEED</span>
              </button>

              <button
                role="tab"
                aria-selected={activeView === "calendar"}
                onClick={() => handleSelectView("calendar")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "calendar"
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#00FF41]"
                }`}
              >
                <Calendar size={13} />
                <span>SCHEDULE</span>
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

          {/* Left Interactive Nav Sidebar */}
          <Sidebar
            activeView={activeView}
            onSelectView={handleSelectView}
            onOpenSettingsModal={() => setSettingsOpen(true)}
          />

          {/* Central Tactical Workspace */}
          <main className={`flex-1 overflow-y-auto md:overflow-visible min-w-0 max-w-full ml-0 md:ml-[68px] ${isRightPanelOpen ? "xl:mr-[340px]" : "xl:mr-[52px]"} px-3 sm:px-5 py-3 md:pt-[112px] md:sm:pt-[118px] pb-24 md:pb-40 flex flex-col transition-all duration-300`}>
            {/* ACTIVE VIEW RENDERING WITH ERROR BOUNDARIES & PROTECTED ACCESS GATES */}
          {activeView === "dashboard" && (
            <ProtectedAccessGate minClearance={1} viewName="Overview Dashboard">
              <ErrorBoundary fallbackTitle="DASHBOARD WIDGET GRID ERROR">
                <div className="flex flex-col gap-4 sm:gap-5 pb-6 animate-fade-in">
                  {/* Tactical Preset Quick Toolbar */}
                  <div className="cyber-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">BENTO PRESET:</span>
                      {[
                        { id: "all_widgets", label: "ALL WIDGETS" },
                        { id: "tactical_sre", label: "TACTICAL SRE" },
                        { id: "ai_researcher", label: "AI RESEARCH" },
                        { id: "cyber_ops", label: "CYBER OPS" },
                        { id: "developer_docker", label: "DEV & DOCKER" },
                        { id: "minimalist", label: "MINIMAL" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleQuickPreset(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00FF41]/10 text-slate-300 hover:text-[#00FF41] border border-white/10 hover:border-[#00FF41]/30 transition-all font-bold cursor-pointer text-[10px] shrink-0"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        cyberAudio.play("click");
                        setCustomizeOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 text-[11px] font-bold transition-all shadow-[0_0_8px_rgba(0,255,65,0.2)] cursor-pointer shrink-0"
                    >
                      <Sliders size={12} />
                      <span>EDIT TILES ({dashboardLayout.filter((w) => w.enabled).length})</span>
                    </button>
                  </div>

                  {/* Top North Star DORA Metrics Bar */}
                  {customWidgets.dora_metrics !== false && (
                    <div id="dora-widget">
                      <DoraMetricsBar />
                    </div>
                  )}

                  {/* Tactical AI Executive Briefing */}
                  {customWidgets.ai_insight !== false && (
                    <div id="ai-brief-widget">
                      <AiInsightBrief />
                    </div>
                  )}

                  {/* Dynamic Floating Waterfall / Masonry Tile Stream (Tight vertical stacking with 0 dead space) */}
                  <div className="flex flex-col gap-4 sm:gap-5">
                    {(() => {
                      const renderWidgetNode = (w: WidgetLayoutItem) => {
                        let widgetNode: React.ReactNode = null;
                        switch (w.id) {
                          case "clock":
                          case "system":
                          case "system_stats":
                            widgetNode = <SystemStats />;
                            break;
                          case "api_health":
                            widgetNode = <ApiHealth />;
                            break;
                          case "security":
                          case "agent_beacon":
                          case "agent_security_beacon":
                            widgetNode = <AgentSecurityBeaconWidget />;
                            break;
                          case "quick_links":
                          case "quick_actions":
                            widgetNode = <QuickActionHub />;
                            break;
                          case "tasks":
                          case "pipeline_queue":
                            widgetNode = <PipelineQueueWidget />;
                            break;
                          case "logs":
                          case "github_activity":
                            widgetNode = <GitHubActivity />;
                            break;
                          case "docker":
                          case "service_status":
                            widgetNode = <ServiceStatusCompact />;
                            break;
                          case "hermes_brain":
                            widgetNode = <HermesStatusWidget />;
                            break;
                          case "ai_quota":
                            widgetNode = <AiAgentQuotaWidget />;
                            break;
                          case "sql_radar":
                          case "sql_slow_queries":
                            widgetNode = <SqlSlowQueryRadar />;
                            break;
                          case "ebpf_heat":
                          case "ebpf_kernel_heat":
                            widgetNode = <EbpfKernelHeatWidget />;
                            break;
                          case "cve_radar":
                          case "cve_vulnerability_radar":
                            widgetNode = <CveVulnerabilityRadar />;
                            break;
                          case "crypto_hash":
                          case "crypto_hash_verifier":
                            widgetNode = <CryptoHashVerifier />;
                            break;
                          case "aws_burn":
                          case "aws_cloud_burn":
                            widgetNode = <AwsCloudBurnWidget />;
                            break;
                          case "git_velocity":
                          case "git_pr_velocity":
                            widgetNode = <GitPrVelocityWidget />;
                            break;
                          case "dns_ssl":
                          case "global_dns_ssl":
                            widgetNode = <GlobalDnsSslRadar />;
                            break;
                          case "github_trending":
                            widgetNode = <GitHubTrendingRepos />;
                            break;
                          case "clipboard_mgr":
                          case "clipboard_manager":
                            widgetNode = <ClipboardManagerWidget />;
                            break;
                          case "cyber_soundscape":
                            widgetNode = <CyberSoundscapeWidget />;
                            break;
                          case "palette_gen":
                          case "color_palette":
                            widgetNode = <ColorPaletteGenerator />;
                            break;
                          case "matrix_zen":
                          case "matrix_rain":
                            widgetNode = <MatrixRainZenCanvas />;
                            break;
                          case "hydration_streak":
                          case "dev_hydration":
                            widgetNode = <DevHydrationStreak />;
                            break;
                          case "global_timezones":
                            widgetNode = <GlobalTimezonesRadar />;
                            break;
                          case "rss_feed":
                            widgetNode = <RssFeed />;
                            break;
                          case "calendar":
                            widgetNode = <CalendarWidget />;
                            break;
                          default:
                            widgetNode = null;
                        }

                        if (!widgetNode) return null;
                        return (
                          <div key={w.id} id={`${w.id}-widget`} className="w-full h-full flex flex-col">
                            {widgetNode}
                          </div>
                        );
                      };

                      // Partition into full-width sections and 2-column masonry waterfalls
                      const enabled = dashboardLayout.filter((w) => w.enabled);
                      const sections: { type: "wide" | "masonry"; items: WidgetLayoutItem[] }[] = [];
                      let currentBatch: WidgetLayoutItem[] = [];

                      enabled.forEach((w) => {
                        if (w.span === "2-col") {
                          if (currentBatch.length > 0) {
                            sections.push({ type: "masonry", items: currentBatch });
                            currentBatch = [];
                          }
                          sections.push({ type: "wide", items: [w] });
                        } else {
                          currentBatch.push(w);
                        }
                      });

                      if (currentBatch.length > 0) {
                        sections.push({ type: "masonry", items: currentBatch });
                      }

                      return sections.map((sec, secIdx) => {
                        if (sec.type === "wide") {
                          return (
                            <div key={`sec-wide-${secIdx}`} className="w-full">
                              {renderWidgetNode(sec.items[0])}
                            </div>
                          );
                        }

                        // If exactly 2 items in this section, stretch them equally in height
                        if (sec.items.length === 2) {
                          return (
                            <div
                              key={`sec-pair-${secIdx}`}
                              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch"
                            >
                              <div className="w-full min-w-0 flex flex-col h-full">{renderWidgetNode(sec.items[0])}</div>
                              <div className="w-full min-w-0 flex flex-col h-full">{renderWidgetNode(sec.items[1])}</div>
                            </div>
                          );
                        }

                        const colLeft = sec.items.filter((_, i) => i % 2 === 0);
                        const colRight = sec.items.filter((_, i) => i % 2 === 1);

                        return (
                          <div
                            key={`sec-masonry-${secIdx}`}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start"
                          >
                            <div className="flex flex-col gap-4 sm:gap-5 w-full min-w-0">
                              {colLeft.map((w) => renderWidgetNode(w))}
                            </div>
                            <div className="flex flex-col gap-4 sm:gap-5 w-full min-w-0">
                              {colRight.map((w) => renderWidgetNode(w))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "image_studio" && (
            <ProtectedAccessGate minClearance={1} viewName="Image Studio & Diffusion Canvas">
              <ErrorBoundary fallbackTitle="IMAGE STUDIO MALFUNCTION">
                <ImageStudioView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "sound_studio" && (
            <ProtectedAccessGate minClearance={1} viewName="Sound Studio & Voice Cloning">
              <ErrorBoundary fallbackTitle="SOUND STUDIO MALFUNCTION">
                <SoundStudioView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "social_media" && (
            <ProtectedAccessGate minClearance={1} viewName="Social Media Broadcast Hub">
              <ErrorBoundary fallbackTitle="SOCIAL MEDIA COMMAND MALFUNCTION">
                <SocialMediaView />
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

          {activeView === "nexus" && (
            <ProtectedAccessGate minClearance={1} viewName="Persona Nexus Characters">
              <ErrorBoundary fallbackTitle="PERSONA NEXUS MALFUNCTION">
                <PersonaNexusView />
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

          {activeView === "api" && (
            <ProtectedAccessGate minClearance={1} viewName="API Health & Service Radar">
              <ErrorBoundary fallbackTitle="API HEALTH RADAR MALFUNCTION">
                <ApiHealthView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "rss" && (
            <ProtectedAccessGate minClearance={1} viewName="Cyber Intelligence Feed">
              <ErrorBoundary fallbackTitle="INTEL FEED MALFUNCTION">
                <IntelFeedView />
              </ErrorBoundary>
            </ProtectedAccessGate>
          )}

          {activeView === "calendar" && (
            <ProtectedAccessGate minClearance={1} viewName="Mission Schedule Calendar">
              <ErrorBoundary fallbackTitle="SCHEDULE MATRIX MALFUNCTION">
                <ScheduleView />
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

      {/* Hermes Master Command Palette Modal */}
      <HermesQuickCommandModal
        isOpen={isHermesCommandModalOpen}
        onClose={() => setIsHermesCommandModalOpen(false)}
      />

      {/* Cyberpunk Multi-Window Floating Desktop Manager */}
      <CyberWindowManager
        isOpen={isFloatingOsOpen}
        onClose={() => setIsFloatingOsOpen(false)}
      />

      {/* Cyberpunk Keyboard Macro & Hotkey Studio Modal */}
      <KeyboardHotkeyStudioModal
        isOpen={isHotkeyModalOpen}
        onClose={() => setIsHotkeyModalOpen(false)}
      />

      {/* Persistent Bottom HUD Status Bar (Desktop) */}
      <StatusBar
        onToggleTerminal={toggleTerminal}
        isTerminalOpen={isTerminalOpen}
      />
    </ToastProvider>
  );
}
