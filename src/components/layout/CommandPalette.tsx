"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
<<<<<<< HEAD
import {
  Search,
  ArrowRight,
  Command,
  Terminal,
  Activity,
  Calendar,
  Sparkles,
  Layers,
  Wrench,
  Bot,
  Cpu,
  Database,
  ScrollText,
  FileText,
  Wifi,
  Rss,
  Users,
  Image as ImageIcon,
  Mic,
  Share2,
  Radio,
  ShieldAlert,
  Server,
  Network,
  Keyboard,
  Music,
  Waves,
} from "lucide-react";
=======
import { Search, ArrowRight, Command, Terminal, Activity, Calendar, Sparkles, Layers, Wrench, Bot, Cpu, Database, ScrollText, FileText, Wifi, Rss, Users, Image as ImageIcon, Mic, Share2, Radio, ShieldAlert, Server, Network, Keyboard, Music, Waves } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type SpotlightCategory = "ALL" | "DECKS" | "NOTES" | "CVES" | "CONTAINERS" | "AGENTS" | "LOGS";

interface CommandItem {
  id: string;
  label: string;
  category: SpotlightCategory;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  action: () => void;
  shortcut?: string;
  icon?: React.ReactNode;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpotlightCategory>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateToDeck = (viewId: string) => {
    cyberAudio.play("warp");
    window.dispatchEvent(
      new CustomEvent("dirtynest-navigate", { detail: viewId })
    );
  };

  const commands: CommandItem[] = useMemo(
    () => [
      // DECKS & DIRECTIVES
      {
        id: "deck_overview",
        label: "Overview Operations & Modular Bento Dashboard",
        category: "DECKS",
        sublabel: "Core operational HUD & widget customizer",
        action: () => navigateToDeck("dashboard"),
        shortcut: "G O",
        icon: <Layers size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_paperclip",
        label: "Paperclip AI Enterprise Control Plane",
        category: "DECKS",
        sublabel: "Autonomous agent teams, heartbeat loops & OKR tree",
        badge: "ENTERPRISE",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("agents"),
        shortcut: "Ctrl+Shift+P",
        icon: <Users size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_agents",
        label: "Autonomous AI Agent Swarm Fleet",
        category: "DECKS",
        sublabel: "Mesh DAG pipeline, token budgets & telemetry",
        action: () => navigateToDeck("agents"),
        shortcut: "G A",
        icon: <Cpu size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "deck_control_room",
        label: "Control Room Multi-Feed Cyber Stream",
        category: "DECKS",
        sublabel: "4-channel stream studio & HITL clearance gates",
        action: () => navigateToDeck("control_room"),
        shortcut: "G H",
        icon: <Bot size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_image_studio",
        label: "Image Studio // Latent Diffusion Workbench",
        category: "DECKS",
        sublabel: "SDXL Turbo, noise seed explorer & LoRA weights",
        action: () => navigateToDeck("image_studio"),
        shortcut: "G I",
        icon: <ImageIcon size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_sound_studio",
        label: "Sound Studio & Voice Cloning Matrix",
        category: "DECKS",
        sublabel: "Web Audio DSP & procedural phoneme avatars",
        action: () => navigateToDeck("sound_studio"),
        shortcut: "G V",
        icon: <Mic size={14} className="text-[#BF40FF]" />,
      },
      {
        id: "tool_agent_voice",
        label: "Agent Voice TTS Synthesizer Studio // Web Speech API",
        category: "DECKS",
        sublabel: "Procedural agent vocal profiles, pitch/rate formant modulation & canvas oscilloscope",
        badge: "VOICE",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("sound_studio"),
        icon: <Radio size={14} className="text-[#00FF41]" />,
      },
      {
        id: "tool_daw_tracker",
        label: "Web Audio 16-Step Tracker & Cyber Beat Synthesizer DAW",
        category: "DECKS",
        sublabel: "Procedural 909 drums, sub-bass oscillator, resonant filter & WAV exporter",
        badge: "DAW",
        badgeColor: "#BF40FF",
        action: () => navigateToDeck("sound_studio"),
        icon: <Music size={14} className="text-[#BF40FF]" />,
      },
      {
        id: "deck_social_media",
        label: "Social Media Command Hub & Omnichannel Feed",
        category: "DECKS",
        sublabel: "Multi-platform broadcasting & threat scraper",
        action: () => navigateToDeck("social_media"),
        shortcut: "G M",
        icon: <Share2 size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "deck_zbiornik_ops",
        label: "Zbiornik Ops — HITL Gatekeeper (zbiornik.com)",
        category: "DECKS",
        sublabel: "Kolejka zatwierdzeń, monitor tematów, skrzynka — jedno konto, pełny nadzór",
        action: () => navigateToDeck("zbiornik_ops"),
        icon: <Waves size={14} className="text-[#BF40FF]" />,
      },
      {
        id: "deck_nexus",
        label: "Persona Nexus // Character Metahuman Studio",
        category: "DECKS",
        sublabel: "2D/3D reactive viseme sync & lorebook manager",
        action: () => navigateToDeck("nexus"),
        shortcut: "G N",
        icon: <Users size={14} className="text-[#BF40FF]" />,
      },
      {
        id: "deck_knowledge",
        label: "Knowledge Matrix // Obsidian DataCore Vault",
        category: "DECKS",
        sublabel: "2D graph node visualizer & markdown split-editor",
        action: () => navigateToDeck("knowledge"),
        shortcut: "G K",
        icon: <Database size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_docker",
        label: "Docker Hub // Container Matrix & Compose Stacks",
        category: "DECKS",
        sublabel: "Live grep logs, stack templates & resource heatmaps",
        action: () => navigateToDeck("docker"),
        shortcut: "G D",
        icon: <Server size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "deck_tools",
        label: "Developer Tools Suite // Diff, JWT & Palette Studio",
        category: "DECKS",
        sublabel: "Side-by-side diff inspector & HMAC verifier",
        action: () => navigateToDeck("tools"),
        shortcut: "G T",
        icon: <Wrench size={14} className="text-[#00FF41]" />,
      },
      {
        id: "tool_asciinema",
        label: "CLI Session Replay Studio & Asciinema Recorder",
        category: "DECKS",
        sublabel: "Frame-by-frame terminal playback & pure-client .cast exporter",
        badge: "FRONTEND",
        badgeColor: "#00FF41",
        action: () => {
          cyberAudio.play("warp");
          window.dispatchEvent(new CustomEvent("dirtynest-toggle-terminal"));
        },
        shortcut: "`",
        icon: <Terminal size={14} className="text-[#00FF41]" />,
      },
      {
        id: "tool_topology",
        label: "Network & Microservice Topology Canvas Studio",
        category: "DECKS",
        sublabel: "Drag & drop architecture visualizer, packet flow simulator & Mermaid/Compose export",
        badge: "CANVAS",
        badgeColor: "#00F0FF",
        action: () => navigateToDeck("tools"),
        icon: <Network size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "tool_shader_fx",
        label: "Cyberpunk Shader & Matrix FX Studio // WebGL & Canvas",
        category: "DECKS",
        sublabel: "CRT scanlines, RGB glitch, Matrix digital rain & ASCII art synthesizer",
        badge: "SHADER",
        badgeColor: "#BF40FF",
        action: () => navigateToDeck("tools"),
        icon: <Sparkles size={14} className="text-[#BF40FF]" />,
      },
      {
        id: "tool_hotkeys",
        label: "Keyboard Macro & Hotkey Customizer Studio",
        category: "DECKS",
        sublabel: "ANSI 80% visual mechanical keyboard, live keypress HUD & JSON profile export",
        badge: "HOTKEYS",
        badgeColor: "#00FF41",
        action: () => {
          cyberAudio.play("warp");
          window.dispatchEvent(new CustomEvent("dirtynest-toggle-hotkeys"));
        },
        shortcut: "?",
        icon: <Keyboard size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_stats",
        label: "Telemetry & Prometheus PromQL Simulator",
        category: "DECKS",
        sublabel: "16-Core hybrid CPU matrix & vector charts",
        action: () => navigateToDeck("stats"),
        shortcut: "G S",
        icon: <Activity size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_logs",
        label: "System & Security Logs // Time-Series Ingestion",
        category: "DECKS",
        sublabel: "16-bucket frequency histogram & NDJSON exports",
        action: () => navigateToDeck("logs"),
        shortcut: "G L",
        icon: <ScrollText size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_intel",
        label: "Cyber Intel Wire // MITRE ATT&CK Matrix",
        category: "DECKS",
        sublabel: "Threat vector kill-chain & CVE advisories",
        action: () => navigateToDeck("rss"),
        shortcut: "G R",
        icon: <Rss size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "deck_calendar",
        label: "Operations & Deployment Calendar // 24h Gantt",
        category: "DECKS",
        sublabel: "Cron daemon task runner & recurring schedules",
        action: () => navigateToDeck("calendar"),
        shortcut: "G E",
        icon: <Calendar size={14} className="text-[#00FF41]" />,
      },
      {
        id: "deck_api_health",
        label: "API & Microservice Health Probes",
        category: "DECKS",
        sublabel: "Synchronous endpoint probe modal & 30-day SLA history",
        action: () => navigateToDeck("api"),
        shortcut: "G P",
        icon: <Wifi size={14} className="text-[#00FF41]" />,
      },

      // KNOWLEDGE & OBSIDIAN NOTES
      {
        id: "note_arch",
        label: "DirtyNest Architecture & Microservice Topology",
        category: "NOTES",
        sublabel: "Knowledge Vault • High-density core specs",
        badge: "PKM",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("knowledge"),
        icon: <FileText size={14} className="text-[#00FF41]" />,
      },
      {
        id: "note_rag",
        label: "HNSW Vector Embeddings & SQLite-Vec Clustering",
        category: "NOTES",
        sublabel: "Knowledge Vault • 1536-dim tensor storage",
        badge: "PKM",
        badgeColor: "#00F0FF",
        action: () => navigateToDeck("knowledge"),
        icon: <FileText size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "note_zero_trust",
        label: "Zero-Trust AppSec & Kernel eBPF Enforcement",
        category: "NOTES",
        sublabel: "Knowledge Vault • AST security rules",
        badge: "PKM",
        badgeColor: "#BF40FF",
        action: () => navigateToDeck("knowledge"),
        icon: <FileText size={14} className="text-[#BF40FF]" />,
      },

      // SECURITY & CVES
      {
        id: "cve_openssh",
        label: "CVE-2026-3849: RegreSSHion Remote Code Execution",
        category: "CVES",
        sublabel: "MITRE ATT&CK TA0001 • Critical zero-day advisory",
        badge: "CRITICAL",
        badgeColor: "#FF2A6D",
        action: () => navigateToDeck("rss"),
        icon: <ShieldAlert size={14} className="text-rose-400" />,
      },
      {
        id: "cve_ebpf",
        label: "CVE-2026-1029: eBPF RingBuffer Memory Overflow",
        category: "CVES",
        sublabel: "Kernel probe boundary patch directives",
        badge: "HIGH",
        badgeColor: "#FFB800",
        action: () => navigateToDeck("rss"),
        icon: <ShieldAlert size={14} className="text-amber-400" />,
      },

      // DOCKER CONTAINERS
      {
        id: "dock_postgres",
        label: "postgres-vector:16-alpine (Port 5432)",
        category: "CONTAINERS",
        sublabel: "Healthy • HNSW vector indexer active",
        badge: "HEALTHY",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("docker"),
        icon: <Server size={14} className="text-[#00FF41]" />,
      },
      {
        id: "dock_redis",
        label: "redis-mesh:7.4-cluster (Port 6379)",
        category: "CONTAINERS",
        sublabel: "Running • Sub/pub event bus online",
        badge: "HEALTHY",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("docker"),
        icon: <Server size={14} className="text-[#00F0FF]" />,
      },
      {
        id: "dock_auth",
        label: "auth-proxy-go:2.1 (Port 8080)",
        category: "CONTAINERS",
        sublabel: "Running • Ed25519 JWT validation proxy",
        badge: "HEALTHY",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("docker"),
        icon: <Server size={14} className="text-[#BF40FF]" />,
      },

      // AGENT TEAMS & AGENTS
      {
        id: "agent_tech_lead",
        label: "TECH-LEAD-01 // Claude 3.7 Sonnet",
        category: "AGENTS",
        sublabel: "Core Engineering Team • Claude Code CLI Adapter",
        badge: "LEAD",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("agents"),
        icon: <Bot size={14} className="text-[#00FF41]" />,
      },
      {
        id: "agent_sentinel",
        label: "SENTINEL-LEAD // Nous-Hermes-3",
        category: "AGENTS",
        sublabel: "Zero-Trust AppSec Team • Hermes Local Engine",
        badge: "LEAD",
        badgeColor: "#FF2A6D",
        action: () => navigateToDeck("agents"),
        icon: <Bot size={14} className="text-[#FF2A6D]" />,
      },
      {
        id: "agent_kube",
        label: "KUBE-COMMANDER // OpenAI Codex",
        category: "AGENTS",
        sublabel: "Autonomous SRE Team • Kubernetes Auto-Scaler",
        badge: "LEAD",
        badgeColor: "#00F0FF",
        action: () => navigateToDeck("agents"),
        icon: <Bot size={14} className="text-[#00F0FF]" />,
      },

      // LOGS & AUDIT
      {
        id: "log_boundary",
        label: "Port 3000 boundary isolation verified. Zero open vulnerabilities.",
        category: "LOGS",
        sublabel: "SENTINEL-01 • Level: PASS",
        badge: "PASS",
        badgeColor: "#00FF41",
        action: () => navigateToDeck("logs"),
        icon: <ScrollText size={14} className="text-[#00FF41]" />,
      },
      {
        id: "log_canary",
        label: "Canary deployment staged to Kubernetes mesh at 10% traffic",
        category: "LOGS",
        sublabel: "KUBE-COMMANDER • Level: EXEC",
        badge: "EXEC",
        badgeColor: "#00F0FF",
        action: () => navigateToDeck("logs"),
        icon: <ScrollText size={14} className="text-[#00F0FF]" />,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    let result = commands;
    if (selectedCategory !== "ALL") {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.sublabel?.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.badge?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [commands, selectedCategory, query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cyberAudio.play("warp");
      setOpen((prev) => !prev);
      setQuery("");
      setSelectedCategory("ALL");
      setSelectedIndex(0);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    const handleOpenEvent = () => {
      cyberAudio.play("warp");
      setOpen(true);
      setQuery("");
      setSelectedCategory("ALL");
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
      cyberAudio.play("click");
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cyberAudio.play("click");
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent
        className="sm:max-w-2xl bg-[#080912] border-[#00FF41]/40 text-[#F1F3F9] font-mono p-0 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col gap-0"
        onKeyDown={handleCommandKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 shrink-0 bg-[#0A0C16]">
          <div className="w-7 h-7 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Search size={15} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Omni-Search: notes, CVEs, containers, agents, logs..."
            className="flex-1 min-w-0 bg-transparent outline-none text-xs text-[#F1F3F9] font-mono placeholder:text-[#4F536E]"
            aria-label="Omni-Search Spotlight Query"
          />
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-[#9499B3]">
            ESC
          </Badge>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-black/40 overflow-x-auto scrollbar-none text-[10px]">
          {(["ALL", "DECKS", "NOTES", "CVES", "CONTAINERS", "AGENTS", "LOGS"] as SpotlightCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
              aria-label={`Filter by ${cat}`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-[9px] text-slate-500 font-bold shrink-0">
            {filtered.length} MATCHES
          </span>
        </div>

        {/* Results Stream */}
        <div className="flex-1 max-h-[50vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={cmd.id}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer select-none"
                style={{
                  background: isSelected ? "rgba(0, 255, 65, 0.12)" : "transparent",
                  border: isSelected ? "1px solid rgba(0, 255, 65, 0.3)" : "1px solid transparent",
                  color: isSelected ? "#00FF41" : "#F1F3F9",
                }}
                onClick={() => {
                  cmd.action();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                aria-label={cmd.label}
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    background: isSelected ? "rgba(0, 255, 65, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  {cmd.icon || <Command size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold block truncate">
                      {cmd.label}
                    </span>
                    {cmd.badge && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[8px] font-black"
                        style={{
                          backgroundColor: `${cmd.badgeColor || "#00FF41"}20`,
                          color: cmd.badgeColor || "#00FF41",
                          border: `1px solid ${cmd.badgeColor || "#00FF41"}40`,
                        }}
                      >
                        {cmd.badge}
                      </Badge>
                    )}
                  </div>
                  {cmd.sublabel && (
                    <span className="text-[10px] font-mono text-[#9499B3] block truncate mt-0.5">
                      {cmd.sublabel}
                    </span>
                  )}
                </div>

                {cmd.shortcut && (
                  <Badge variant="outline" className="text-[10px] font-mono text-[#9499B3] border-white/10 shrink-0">
                    {cmd.shortcut}
                  </Badge>
                )}

                {isSelected && <ArrowRight size={14} className="text-[#00FF41] shrink-0" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-xs font-mono text-[#4F536E]">
              NO MATCHING DIRECTIVES FOUND ACROSS SYSTEM REGISTRIES
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#4F536E] bg-black/40">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">↑↓</kbd> NAVIGATE
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">↵</kbd> EXECUTE
            </span>
          </div>
          <span>SPOTLIGHT v2.0 // OMNI-INDEXED</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
