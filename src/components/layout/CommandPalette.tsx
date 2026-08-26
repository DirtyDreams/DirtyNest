"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ArrowRight,
  ExternalLink,
  Command,
  Sliders,
  Terminal,
  Activity,
  Calendar,
  Sparkles,
  Layers,
  Wrench,
  Headphones,
  Timer,
  Palette,
  Bot,
  Cpu,
  Database,
  Settings,
  ScrollText,
  FileText,
  CheckCircle2,
  Lock,
  Wifi,
  Rss,
  Users,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { applyThemePreset } from "@/lib/theme";

interface CommandItem {
  id: string;
  label: string;
  category: string;
  action: () => void;
  shortcut?: string;
  icon?: React.ReactNode;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateToDeck = (viewId: string) => {
    window.dispatchEvent(
      new CustomEvent("dirtynest-navigate", { detail: viewId })
    );
  };

  const commands: CommandItem[] = [
    {
      id: "deck_overview",
      label: "Switch Deck: Overview Operations",
      category: "Deck Navigation",
      action: () => navigateToDeck("dashboard"),
      shortcut: "G O",
      icon: <Layers size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_chatbot",
      label: "Switch Deck: Cyber AI Chatbot Core",
      category: "Deck Navigation",
      action: () => navigateToDeck("chatbot"),
      shortcut: "G C",
      icon: <Bot size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_nexus",
      label: "Switch Deck: Persona Nexus // Character Discovery & Roleplay",
      category: "Deck Navigation",
      action: () => navigateToDeck("nexus"),
      shortcut: "G N",
      icon: <Users size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_control_room",
      label: "Switch Deck: Agent Control Room (Hermes, Pi, Codex, OpenCode)",
      category: "Deck Navigation",
      action: () => navigateToDeck("control_room"),
      shortcut: "G H",
      icon: <Bot size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_agents",
      label: "Switch Deck: Autonomous AI Agent Swarm",
      category: "Deck Navigation",
      action: () => navigateToDeck("agents"),
      shortcut: "G A",
      icon: <Cpu size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "deck_knowledge",
      label: "Switch Deck: Knowledge Matrix // DataCore Vault",
      category: "Deck Navigation",
      action: () => navigateToDeck("knowledge"),
      shortcut: "G K",
      icon: <Database size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_docker",
      label: "Switch Deck: Docker Container Hub & Compose Stacks",
      category: "Deck Navigation",
      action: () => navigateToDeck("docker"),
      shortcut: "G D",
      icon: <Cpu size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "deck_tools",
      label: "Switch Deck: Tactical Developer Tools Matrix",
      category: "Deck Navigation",
      action: () => navigateToDeck("tools"),
      shortcut: "G T",
      icon: <Wrench size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "deck_stats",
      label: "Switch Deck: Stats & Prometheus Telemetry Matrix",
      category: "Deck Navigation",
      action: () => navigateToDeck("stats"),
      shortcut: "G M",
      icon: <Activity size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "deck_api",
      label: "Switch Deck: API Health & Service Radar",
      category: "Deck Navigation",
      action: () => navigateToDeck("api"),
      shortcut: "G 1",
      icon: <Wifi size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_rss",
      label: "Switch Deck: Cyber Intel Feed & Wire Stream",
      category: "Deck Navigation",
      action: () => navigateToDeck("rss"),
      shortcut: "G 2",
      icon: <Rss size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "deck_calendar",
      label: "Switch Deck: Mission Schedule & Cron Calendar",
      category: "Deck Navigation",
      action: () => navigateToDeck("calendar"),
      shortcut: "G 3",
      icon: <Calendar size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_logs",
      label: "Switch Deck: Operations & System Audit Logs",
      category: "Deck Navigation",
      action: () => navigateToDeck("logs"),
      shortcut: "G L",
      icon: <ScrollText size={14} className="text-[#00FF41]" />,
    },
    {
      id: "deck_settings",
      label: "Switch Deck: Comprehensive Settings & Config",
      category: "Deck Navigation",
      action: () => navigateToDeck("settings"),
      shortcut: "G S",
      icon: <Settings size={14} className="text-[#FFB800]" />,
    },
    {
      id: "drone_audio",
      label: "Audio Matrix: Open Cyber Ambient Soundboard",
      category: "Audio",
      action: () => window.dispatchEvent(new CustomEvent("dirtynest-open-audio-mixer")),
      shortcut: "T D",
      icon: <Headphones size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "tool_jwt",
      label: "DevTool: JWT Claims & Expiry Token Inspector",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D J",
      icon: <Wrench size={14} className="text-[#00FF41]" />,
    },
    {
      id: "tool_api",
      label: "DevTool: API Workbench (HTTP REST & cURL Client)",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D A",
      icon: <Wrench size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "tool_snippets",
      label: "DevTool: Code Snippet & Docker Command Vault",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D S",
      icon: <Wrench size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "tool_env",
      label: "DevTool: Environment Variables (.env) Secret Vault",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D E",
      icon: <Wrench size={14} className="text-[#FFB800]" />,
    },
    {
      id: "tool_radar",
      label: "DevTool: Network Radar & Local Port Probe Scanner",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D N",
      icon: <Wrench size={14} className="text-[#00FF41]" />,
    },
    {
      id: "tool_regex",
      label: "DevTool: Regular Expression (Regex) Test Lab",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D R",
      icon: <Wrench size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "tool_cron",
      label: "DevTool: Cron Visual Expression Builder & Scheduler",
      category: "Developer Utilities",
      action: () => navigateToDeck("tools"),
      shortcut: "D C",
      icon: <Wrench size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "theme_studio",
      label: "Theme Studio: Create & Customize Palettes",
      category: "Colorways",
      action: () => window.dispatchEvent(new CustomEvent("dirtynest-open-theme-studio")),
      icon: <Sparkles size={14} className="text-[#00FF41]" />,
    },
    {
      id: "theme_crimson",
      label: "Theme: Blood Moon Protocol (Crimson)",
      category: "Colorways",
      action: () => applyThemePreset("crimson"),
      icon: <Palette size={14} className="text-[#FF003C]" />,
    },
    {
      id: "theme_arctic",
      label: "Theme: Ghost Ice Glitch (Arctic Cyan)",
      category: "Colorways",
      action: () => applyThemePreset("arctic"),
      icon: <Palette size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "theme_tokyo",
      label: "Theme: Tokyo Midnight (Neon Violet)",
      category: "Colorways",
      action: () => applyThemePreset("tokyo_midnight"),
      icon: <Palette size={14} className="text-[#B026FF]" />,
    },
    {
      id: "theme_cyber",
      label: "Theme: Night City 2077",
      category: "Colorways",
      action: () => applyThemePreset("cyber2077"),
      icon: <Palette size={14} className="text-[#FFE600]" />,
    },
    {
      id: "theme_synth",
      label: "Theme: Synthwave Outrun",
      category: "Colorways",
      action: () => applyThemePreset("synthwave"),
      icon: <Palette size={14} className="text-[#FF1493]" />,
    },
    {
      id: "theme_matrix",
      label: "Theme: Matrix Core (Green)",
      category: "Colorways",
      action: () => applyThemePreset("matrix"),
      icon: <Palette size={14} className="text-[#00FF41]" />,
    },
    {
      id: "theme_amber",
      label: "Theme: Amber Phosphor CRT",
      category: "Colorways",
      action: () => applyThemePreset("amber"),
      icon: <Palette size={14} className="text-[#FFB000]" />,
    },
    {
      id: "auth_lock",
      label: "Security: Lock Terminal & Session",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().lockSession();
      },
      shortcut: "Ctrl+L",
      icon: <Lock size={14} className="text-amber-400" />,
    },
    {
      id: "auth_switch_root",
      label: "Security: Switch to Root Operator (Cipher Zero - Lvl 5)",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().switchPersona("root_operator");
      },
      icon: <CheckCircle2 size={14} className="text-[#00FF41]" />,
    },
    {
      id: "auth_switch_netrunner",
      label: "Security: Switch to Netrunner DevOps (Hex Blade - Lvl 3)",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().switchPersona("netrunner_devops");
      },
      icon: <CheckCircle2 size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "auth_switch_analyst",
      label: "Security: Switch to Data Analyst (Oracle Eye - Lvl 2)",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().switchPersona("data_analyst");
      },
      icon: <CheckCircle2 size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "auth_switch_guest",
      label: "Security: Switch to Guest Visitor (Ghost Drifter - Lvl 1)",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().switchPersona("guest_drifter");
      },
      icon: <CheckCircle2 size={14} className="text-[#9499B3]" />,
    },
    {
      id: "auth_logout",
      label: "Security: Terminate Active Session (Logout)",
      category: "Security & Access",
      action: () => {
        const { useAuthStore } = require("@/stores/useAuthStore");
        useAuthStore.getState().logout();
      },
      icon: <Terminal size={14} className="text-red-400" />,
    },
    {
      id: "scanlines",
      label: "Toggle CRT Matrix Scanlines",
      category: "Interface",
      action: () => document.body.classList.toggle("scan-overlay"),
      shortcut: "T S",
      icon: <Sliders size={14} className="text-[#BF40FF]" />,
    },
    {
      id: "github",
      label: "Launch GitHub Workspace",
      category: "Warp Gate",
      action: () => window.open("https://github.com", "_blank"),
      icon: <ExternalLink size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "hackernews",
      label: "Launch Hacker News Stream",
      category: "Warp Gate",
      action: () => window.open("https://news.ycombinator.com", "_blank"),
      icon: <ExternalLink size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "reload",
      label: "Soft Reboot Command Center",
      category: "System",
      action: () => window.location.reload(),
      shortcut: "R B",
      icon: <Terminal size={14} className="text-[#FFB800]" />,
    },
    // New Search Enhancements
    {
      id: "note_bpe",
      label: "Search Note: BPE Tokenizer from Scratch",
      category: "Knowledge Vault",
      action: () => navigateToDeck("knowledge"),
      icon: <FileText size={14} className="text-[#00FF41]" />,
    },
    {
      id: "note_zero_trust",
      label: "Search Note: Zero-Trust Mesh Topology",
      category: "Knowledge Vault",
      action: () => navigateToDeck("knowledge"),
      icon: <FileText size={14} className="text-[#00FF41]" />,
    },
    {
      id: "todo_ebpf",
      label: "Todo: Deploy eBPF filter",
      category: "Todos",
      action: () => navigateToDeck("dashboard"),
      icon: <CheckCircle2 size={14} className="text-[#00F0FF]" />,
    },
    {
      id: "cal_standup",
      label: "Calendar: Daily Sync",
      category: "Calendar",
      action: () => navigateToDeck("calendar"),
      icon: <Calendar size={14} className="text-[#BF40FF]" />,
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
      setQuery("");
      setSelectedIndex(0);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    const handleOpenEvent = () => {
      setOpen(true);
      setQuery("");
      setSelectedIndex(0);
    };
    window.addEventListener("dirtynest-open-palette", handleOpenEvent);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dirtynest-open-palette", handleOpenEvent);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(10px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
        style={{
          border: "1px solid rgba(0, 255, 65, 0.3)",
          background: "rgba(11, 12, 20, 0.95)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleCommandKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 shrink-0">
          <Search size={18} className="text-[#00FF41]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Execute protocol, warp link, or search..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#F1F3F9] font-mono placeholder:text-[#4F536E]"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#9499B3]">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="flex-1 max-h-[50vh] sm:max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={cmd.id}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer"
                style={{
                  background: isSelected
                    ? "rgba(0, 255, 65, 0.12)"
                    : "transparent",
                  border: isSelected
                    ? "1px solid rgba(0, 255, 65, 0.25)"
                    : "1px solid transparent",
                  color: isSelected ? "#00FF41" : "#F1F3F9",
                }}
                onClick={() => {
                  cmd.action();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div
                  className="p-1.5 rounded-lg"
                  style={{
                    background: isSelected ? "rgba(0, 255, 65, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  {cmd.icon || <Command size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono font-medium block truncate">
                    {cmd.label}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-[#4F536E]">
                    {cmd.category}
                  </span>
                </div>

                {cmd.shortcut && (
                  <kbd className="text-[10px] font-mono text-[#9499B3] px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                    {cmd.shortcut}
                  </kbd>
                )}

                {isSelected && (
                  <ArrowRight size={14} className="text-[#00FF41] shrink-0" />
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs font-mono text-[#4F536E]">
              NO MATCHING DIRECTIVES FOUND
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#4F536E] bg-black/20">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.2 rounded bg-white/5 border border-white/5">↑↓</kbd> NAVIGATE
            </span>
            <span>
              <kbd className="px-1 py-0.2 rounded bg-white/5 border border-white/5">↵</kbd> EXECUTE
            </span>
          </div>
          <span className="text-[#00FF41]">DIRTYNEST KERNEL // READY</span>
        </div>
      </div>
    </div>
  );
}
