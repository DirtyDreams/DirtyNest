"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Key,
  Lock,
  Database,
  FileCode,
  Globe,
  Radio,
  Clock,
  Code2,
  Container,
  Sliders,
  Sparkles,
  Search,
  Pin,
  Check,
  Zap,
  Layers,
  Settings,
  ChevronRight,
  Terminal,
  Activity,
  Calculator,
  AlignLeft,
  FileText,
  Workflow,
  ArrowRightLeft,
  Network,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

// Interactive Developer Tool Components
import JwtDebugger from "@/components/tools/JwtDebugger";
import HashGenerator from "@/components/tools/HashGenerator";
import UuidUlidGenerator from "@/components/tools/UuidUlidGenerator";
import JsonYamlConverter from "@/components/tools/JsonYamlConverter";
import ZodSchemaSynthesizer from "@/components/tools/ZodSchemaSynthesizer";
import SqlFormatter from "@/components/tools/SqlFormatter";
import ApiWorkbench from "@/components/tools/ApiWorkbench";
import NetworkRadar from "@/components/tools/NetworkRadar";
import CronBuilder from "@/components/tools/CronBuilder";
import DockerComposer from "@/components/tools/DockerComposer";
import EnvEditor from "@/components/tools/EnvEditor";
import RegexTester from "@/components/tools/RegexTester";
import BpeTokenCounter from "@/components/tools/BpeTokenCounter";
import UnixEpochConverter from "@/components/tools/UnixEpochConverter";
import DiffViewer from "@/components/tools/DiffViewer";
import SnippetVault from "@/components/tools/SnippetVault";
import CyberColorPaletteConverter from "@/components/tools/CyberColorPaletteConverter";
import NetworkTopologyStudioModal from "./tools/NetworkTopologyStudioModal";
import CyberpunkShaderFxStudioModal from "./tools/CyberpunkShaderFxStudioModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export interface DevToolItem {
  id: string;
  name: string;
  category: "CRYPTO & AUTH" | "DATA & SCHEMAS" | "WEB & NETWORK" | "DEVOPS & CLOUD" | "CODE & AI";
  icon: any;
  description: string;
  badge?: string;
}

const DEV_TOOLS: DevToolItem[] = [
  // 🔐 CRYPTO & AUTH
  {
    id: "jwt_debugger",
    name: "JWT Claims & Signature Inspector",
    category: "CRYPTO & AUTH",
    icon: Key,
    description: "Decode JWT headers and payload claims, inspect expiration and verify signatures.",
    badge: "RFC 7519",
  },
  {
    id: "hash_generator",
    name: "Cryptographic Hasher & HMAC",
    category: "CRYPTO & AUTH",
    icon: Lock,
    description: "High-entropy SHA-256, SHA-512, MD5, Keccak, and HMAC signing engine.",
  },
  {
    id: "uuid_generator",
    name: "UUID / ULID / NanoID Generator",
    category: "CRYPTO & AUTH",
    icon: Zap,
    description: "Batch generate UUID v4, monotonic UUID v7, Crockford ULID, and NanoIDs.",
    badge: "v4 / v7 / ULID",
  },

  // 📊 DATA & SCHEMAS
  {
    id: "zod_schema",
    name: "Zod Schema & TypeScript Synthesizer",
    category: "DATA & SCHEMAS",
    icon: FileCode,
    description: "Infer type-safe Zod schema objects and TypeScript interfaces from JSON payloads.",
    badge: "Type-Safe",
  },
  {
    id: "json_yaml",
    name: "JSON ➔ YAML ➔ TOML Converter",
    category: "DATA & SCHEMAS",
    icon: ArrowRightLeft,
    description: "Bi-directional formatting and syntax conversion for structured config formats.",
  },
  {
    id: "sql_formatter",
    name: "SQL Query Prettifier & Formatter",
    category: "DATA & SCHEMAS",
    icon: Database,
    description: "Beautify, keyword-capitalize, and minify Postgres, SQLite, and MySQL queries.",
  },
  {
    id: "cyber_colors",
    name: "Cyberpunk Palette & CSS Theme Engine",
    category: "DATA & SCHEMAS",
    icon: Sparkles,
    description: "HEX / RGB / HSL / OKLCH conversions, WCAG contrast auditor, and :root CSS variables exporter.",
    badge: "CSS / WCAG",
  },

  // 🌐 WEB & NETWORK
  {
    id: "api_workbench",
    name: "API Workbench & cURL Studio",
    category: "WEB & NETWORK",
    icon: Globe,
    description: "Interactive HTTP REST request builder with headers, params, and response metrics.",
    badge: "REST / cURL",
  },
  {
    id: "network_radar",
    name: "Network & TLS Security Radar",
    category: "WEB & NETWORK",
    icon: Radio,
    description: "Live DNS propagation latency, SSL certificate expiry, and ping probe monitor.",
  },
  {
    id: "network_topology",
    name: "Network & Microservice Topology Canvas",
    category: "WEB & NETWORK",
    icon: Network,
    description: "Interactive drag-and-drop architecture studio with animated packet flow and Mermaid/Compose export.",
    badge: "Canvas / SVG",
  },

  // ⚙️ DEVOPS & CLOUD
  {
    id: "docker_composer",
    name: "Dockerfile & Compose Builder",
    category: "DEVOPS & CLOUD",
    icon: Container,
    description: "Multi-stage production Dockerfiles and docker-compose configurations.",
    badge: "Docker / Compose",
  },
  {
    id: "cron_builder",
    name: "Cron Expression Humanizer",
    category: "DEVOPS & CLOUD",
    icon: Clock,
    description: "Interactive 5-part cron generator with human natural-language translations.",
  },
  {
    id: "env_editor",
    name: "Environment .env Vault & Parser",
    category: "DEVOPS & CLOUD",
    icon: Sliders,
    description: "Manage, mask, validate, and convert .env key-value variables to JSON/Docker.",
  },

  // 📝 CODE & AI
  {
    id: "bpe_tokens",
    name: "BPE Token Counter & LLM Pricing",
    category: "CODE & AI",
    icon: Calculator,
    description: "Estimate BPE token counts and prompt costs for Gemini 2.5, Claude 3.7, and GPT-4o.",
    badge: "Multi-LLM",
  },
  {
    id: "unix_epoch",
    name: "Unix Epoch Time Converter",
    category: "CODE & AI",
    icon: Activity,
    description: "Real-time POSIX timestamp ticker with ISO-8601 and relative time conversion.",
  },
  {
    id: "regex_tester",
    name: "Regex AST Tester & Cheat Sheet",
    category: "CODE & AI",
    icon: Code2,
    description: "Real-time regular expression pattern evaluator with live capture group highlights.",
  },
  {
    id: "diff_viewer",
    name: "Unified & Side-by-Side Diff",
    category: "CODE & AI",
    icon: Workflow,
    description: "Compare code snippets and text revisions with highlighted insertions and deletions.",
  },
  {
    id: "snippet_vault",
    name: "Developer Snippet Vault",
    category: "CODE & AI",
    icon: FileText,
    description: "Searchable repository for reusable scripts, queries, and code patterns.",
  },
  {
    id: "shader_fx",
    name: "Cyberpunk Shader & Matrix FX Studio",
    category: "CODE & AI",
    icon: Sparkles,
    description: "Interactive CRT scanlines, RGB glitch displacement, Matrix digital rain & ASCII art synthesizer.",
    badge: "WebGL / Canvas",
  },
];

const CATEGORIES = [
  "ALL TOOLS",
  "CRYPTO & AUTH",
  "DATA & SCHEMAS",
  "WEB & NETWORK",
  "DEVOPS & CLOUD",
  "CODE & AI",
];

export default function ToolsView() {
  const [activeToolId, setActiveToolId] = useState<string>("jwt_debugger");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL TOOLS");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>(["jwt_debugger", "bpe_tokens", "uuid_generator"]);

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem("dirtynest_pinned_tools");
      if (savedPins) setPinnedIds(JSON.parse(savedPins));
      const savedActive = localStorage.getItem("dirtynest_active_tool");
      if (savedActive) setActiveToolId(savedActive);
    } catch {
      // ignore
    }
  }, []);

  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const [isShaderModalOpen, setIsShaderModalOpen] = useState(false);

  const handleSelectTool = (id: string) => {
    cyberAudio.play("click");
    setActiveToolId(id);
    try {
      localStorage.setItem("dirtynest_active_tool", id);
    } catch {
      // ignore
    }
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberAudio.play("chime");
    const updated = pinnedIds.includes(id)
      ? pinnedIds.filter((item) => item !== id)
      : [...pinnedIds, id];
    setPinnedIds(updated);
    try {
      localStorage.setItem("dirtynest_pinned_tools", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filteredTools = useMemo(() => {
    return DEV_TOOLS.filter((t) => {
      if (selectedCategory !== "ALL TOOLS" && t.category !== selectedCategory) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const activeTool = useMemo(() => {
    return DEV_TOOLS.find((t) => t.id === activeToolId) || DEV_TOOLS[0]!;
  }, [activeToolId]);

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in pb-12">
      {/* Top Header HUD Banner */}
      <div className="cyber-card p-5 bg-[#07070B]/90 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Wrench size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                CYBERNETIC DEVELOPER WORKBENCH // <span className="text-[#00FF41]">TOOLS MATRIX</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                16 INTERACTIVE TOOLS
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              HIGH-PERFORMANCE UTILITY SUITE FOR CIPHERS, SCHEMAS, NETWORKING, CONTAINERS & TOKENS
            </p>
          </div>
        </div>

        {/* Link to Plugins in Settings */}
        <a
          href="#settings"
          onClick={() => cyberAudio.play("click")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          title="Configure Plugin Extensions in Settings"
        >
          <Settings size={14} />
          <span>PLUGIN EXTENSIONS (SETTINGS)</span>
        </a>
      </div>

      {/* Pinned Quick Bar */}
      {pinnedIds.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-[#4F536E] uppercase font-bold shrink-0">
            <Pin size={11} className="text-[#00FF41] fill-[#00FF41]" />
            <span>PINNED:</span>
          </div>

          {pinnedIds.map((pinId) => {
            const tool = DEV_TOOLS.find((t) => t.id === pinId);
            if (!tool) return null;
            const Icon = tool.icon;
            const isSelected = activeToolId === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 text-[#9499B3] border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon size={13} />
                <span>{tool.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Studio Grid: Left Tools Navigator + Right Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Navigator (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Categories Filter Strip */}
          <div className="cyber-card p-3 bg-black/60 border border-white/10 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                      : "text-[#9499B3] hover:text-white"
                  }`}
                >
                  {cat.replace(" & ", "/")}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="pl-8 bg-black/60 border-white/10 text-[11px]"
              />
            </div>
          </div>

          {/* Tools List */}
          <div className="flex flex-col gap-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = activeToolId === tool.id;
              const isPinned = pinnedIds.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group select-none ${
                    isSelected
                      ? "bg-[#090A14] border-[#00FF41]/50 shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                      : "bg-[#080912]/80 border-white/5 hover:border-white/20 hover:bg-[#080912]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                          : "bg-white/5 text-[#9499B3] group-hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`font-bold text-xs truncate ${
                            isSelected ? "text-[#00FF41]" : "text-[#F1F3F9]"
                          }`}
                        >
                          {tool.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#4F536E] font-bold mt-0.5">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => togglePin(tool.id, e)}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer shrink-0 transition-colors ${
                      isPinned
                        ? "text-[#00FF41] fill-[#00FF41]"
                        : "text-[#4F536E] opacity-0 group-hover:opacity-100 hover:text-white"
                    }`}
                    title={isPinned ? "Unpin Tool" : "Pin Tool"}
                  >
                    <Pin size={13} className={isPinned ? "fill-current" : ""} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Studio Stage (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Tool Header Pill */}
          <div className="p-4 cyber-card bg-[#07070B]/95 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
                {(() => {
                  const Icon = activeTool.icon;
                  return <Icon size={16} />;
                })()}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#F1F3F9] uppercase tracking-wider">
                  {activeTool.name}
                </span>
                <span className="text-[10px] text-[#9499B3]">{activeTool.description}</span>
              </div>
            </div>

            {activeTool.badge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 shrink-0">
                {activeTool.badge}
              </span>
            )}
          </div>

          {/* DYNAMIC ACTIVE TOOL WORKSPACE */}
          <div className="w-full">
            {activeToolId === "jwt_debugger" && <JwtDebugger />}
            {activeToolId === "hash_generator" && <HashGenerator />}
            {activeToolId === "uuid_generator" && <UuidUlidGenerator />}
            {activeToolId === "zod_schema" && <ZodSchemaSynthesizer />}
            {activeToolId === "json_yaml" && <JsonYamlConverter />}
            {activeToolId === "sql_formatter" && <SqlFormatter />}
            {activeToolId === "cyber_colors" && <CyberColorPaletteConverter />}
            {activeToolId === "api_workbench" && <ApiWorkbench />}
            {activeToolId === "network_radar" && <NetworkRadar />}
            {activeToolId === "docker_composer" && <DockerComposer />}
            {activeToolId === "cron_builder" && <CronBuilder />}
            {activeToolId === "env_editor" && <EnvEditor />}
            {activeToolId === "bpe_tokens" && <BpeTokenCounter />}
            {activeToolId === "unix_epoch" && <UnixEpochConverter />}
            {activeToolId === "regex_tester" && <RegexTester />}
            {activeToolId === "diff_viewer" && <DiffViewer />}
            {activeToolId === "snippet_vault" && <SnippetVault />}
            {activeToolId === "network_topology" && (
              <div className="cyber-card p-6 bg-[#07070B]/95 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                  <Network size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">
                    NETWORK & MICROSERVICE TOPOLOGY CANVAS
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Visual drag-and-drop studio with real-time animated packet flow, fault injection, and 1-click Mermaid / Docker Compose exporters.
                  </p>
                </div>
                <button
                  onClick={() => {
                    cyberAudio.play("warp");
                    setIsTopologyModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all"
                >
                  <Network size={15} />
                  <span>LAUNCH FULL TOPOLOGY STUDIO</span>
                </button>
              </div>
            )}

            {activeToolId === "shader_fx" && (
              <div className="cyber-card p-6 bg-[#07070B]/95 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">
                    CYBERPUNK SHADER & MATRIX FX STUDIO
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Real-time HTML5 Canvas rendering of CRT phosphor scanlines, RGB chromatic aberration glitches, Matrix digital rain, and Image-to-ASCII synthesizer.
                  </p>
                </div>
                <button
                  onClick={() => {
                    cyberAudio.play("warp");
                    setIsShaderModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all"
                >
                  <Sparkles size={15} />
                  <span>LAUNCH FULL SHADER STUDIO</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Topology Studio Modal */}
      <NetworkTopologyStudioModal
        isOpen={isTopologyModalOpen}
        onClose={() => setIsTopologyModalOpen(false)}
      />

      {/* Cyberpunk Shader & Matrix FX Studio Modal */}
      <CyberpunkShaderFxStudioModal
        isOpen={isShaderModalOpen}
        onClose={() => setIsShaderModalOpen(false)}
      />
    </div>
  );
}
