"use client";

import { useState, useEffect, useMemo } from "react";
<<<<<<< HEAD
import {
  Puzzle,
  Search,
  Plus,
  Code,
} from "lucide-react";
=======
import { Puzzle, Search, Plus, Code } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export interface PluginExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  category: "AI & LLM" | "SECURITY & AUTH" | "DEVOPS & CLOUD" | "DATA & COMPILERS";
  description: string;
  permissions: string[];
  enabled: boolean;
  mcpCompatible: boolean;
  executions: number;
  avgLatencyMs: number;
}

const DEFAULT_EXTENSIONS: PluginExtension[] = [
  {
    id: "ext.tokens.calculator",
    name: "BPE Token Counter & LLM Pricing",
    version: "v1.4.2",
    author: "DirtyNest Neural Labs",
    category: "AI & LLM",
    description: "Calculates BPE token distributions and real-time inference pricing for Gemini 2.5, Claude 3.7, and GPT-4o.",
    permissions: ["AI_MEMORY", "TOKEN_ESTIMATOR"],
    enabled: true,
    mcpCompatible: true,
    executions: 1840,
    avgLatencyMs: 2.1,
  },
  {
    id: "ext.json.ts_compiler",
    name: "JSON ➔ TypeScript & Schema Synthesizer",
    version: "v2.1.0",
    author: "DirtyNest DevTools",
    category: "DATA & COMPILERS",
    description: "Compiles nested JSON objects into TypeScript interfaces, type unions, and YAML configs with zero runtime dependencies.",
    permissions: ["AST_PARSER", "CLIPBOARD_WRITE"],
    enabled: true,
    mcpCompatible: true,
    executions: 4210,
    avgLatencyMs: 3.4,
  },
  {
    id: "ext.jwt.inspector",
    name: "JWT Claims & Cryptographic Inspector",
    version: "v3.0.1",
    author: "SecOps Core",
    category: "SECURITY & AUTH",
    description: "Decodes JWT Header & Payload claims, parses Unix expiration offsets, and verifies signature structures.",
    permissions: ["BASE64_DECODE", "CRYPTO_SUBTLE"],
    enabled: true,
    mcpCompatible: true,
    executions: 3190,
    avgLatencyMs: 1.2,
  },
  {
    id: "ext.curl.benchmark",
    name: "cURL & HTTP Endpoint Benchmark Studio",
    version: "v2.0.4",
    author: "Mesh Networking Group",
    category: "SECURITY & AUTH",
    description: "Executes latency probes, verifies HTTP status codes, and generates copy-ready fetch() and cURL snippets.",
    permissions: ["NETWORK_RAW", "CORS_PROXY"],
    enabled: true,
    mcpCompatible: true,
    executions: 1205,
    avgLatencyMs: 18.5,
  },
  {
    id: "ext.crypto.hasher",
    name: "SHA-256 / SHA-512 & HMAC Hasher",
    version: "v1.8.0",
    author: "SecOps Core",
    category: "SECURITY & AUTH",
    description: "High-entropy cryptographic hashing engine with HMAC secret-key signing and rainbow-table defense.",
    permissions: ["CRYPTO_SUBTLE", "HEX_ENCODER"],
    enabled: true,
    mcpCompatible: true,
    executions: 2840,
    avgLatencyMs: 0.8,
  },
  {
    id: "ext.git.commit_architect",
    name: "Conventional Git Commit Architect",
    version: "v1.1.5",
    author: "DevOps Fleet",
    category: "DEVOPS & CLOUD",
    description: "Structures standardized conventional git commits (feat, fix, chore, refactor) with automatic breaking change flags.",
    permissions: ["GIT_METADATA"],
    enabled: true,
    mcpCompatible: true,
    executions: 980,
    avgLatencyMs: 0.5,
  },
  {
    id: "ext.docker.manifest_builder",
    name: "Production Docker & Compose Builder",
    version: "v2.2.0",
    author: "DevOps Fleet",
    category: "DEVOPS & CLOUD",
    description: "Generates production multi-stage Dockerfiles and docker-compose.yml files for Next.js, FastAPI, Go, and Redis.",
    permissions: ["COMPOSE_SYNTAX", "YAML_VALIDATOR"],
    enabled: true,
    mcpCompatible: true,
    executions: 1540,
    avgLatencyMs: 1.1,
  },
  {
    id: "ext.cron.humanizer",
    name: "Cron Schedule Humanizer & Explainer",
    version: "v1.0.9",
    author: "Scheduler Daemon",
    category: "DEVOPS & CLOUD",
    description: "Translates 5-part cron syntax into human-readable sentences and calculates next execution intervals.",
    permissions: ["CHRONO_PARSER"],
    enabled: true,
    mcpCompatible: true,
    executions: 760,
    avgLatencyMs: 0.3,
  },
];

const CATEGORIES = [
  "ALL CATEGORIES",
  "AI & LLM",
  "SECURITY & AUTH",
  "DEVOPS & CLOUD",
  "DATA & COMPILERS",
];

export default function PluginsSettingsTab() {
  const toast = useToast();
  const [plugins, setPlugins] = useState<PluginExtension[]>(DEFAULT_EXTENSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL CATEGORIES");
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [manifestInput, setManifestInput] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState<PluginExtension | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_plugins_registry");
      if (saved) {
        setPlugins(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const savePlugins = (newPlugins: PluginExtension[]) => {
    setPlugins(newPlugins);
    try {
      localStorage.setItem("dirtynest_plugins_registry", JSON.stringify(newPlugins));
    } catch {
      // ignore
    }
  };

  const togglePlugin = (id: string) => {
    cyberAudio.play("click");
    const updated = plugins.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    savePlugins(updated);
    toast.success("Plugin state updated", "Extension runtime toggled.");
  };

  const filteredPlugins = useMemo(() => {
    return plugins.filter((p) => {
      if (selectedCategory !== "ALL CATEGORIES" && p.category !== selectedCategory)
        return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesAuthor = p.author.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc && !matchesAuthor) return false;
      }
      return true;
    });
  }, [plugins, selectedCategory, searchQuery]);

  const activeCount = plugins.filter((p) => p.enabled).length;

  const handleInstall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestInput.trim()) return;

    try {
      const parsed = JSON.parse(manifestInput);
      if (!parsed.id || !parsed.name) {
        toast.error("Invalid Manifest", "Plugin must contain 'id' and 'name'.");
        return;
      }

      const newPlugin: PluginExtension = {
        id: parsed.id,
        name: parsed.name,
        version: parsed.version || "v1.0.0",
        author: parsed.author || "Custom Dev",
        category: parsed.category || "DATA & COMPILERS",
        description: parsed.description || "Custom installed user extension.",
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ["AST_PARSER"],
        enabled: true,
        mcpCompatible: true,
        executions: 0,
        avgLatencyMs: 1.0,
      };

      cyberAudio.play("chime");
      const updated = [newPlugin, ...plugins.filter((p) => p.id !== newPlugin.id)];
      savePlugins(updated);
      setIsInstallModalOpen(false);
      setManifestInput("");
      toast.success("Plugin Installed", `${newPlugin.name} is now active.`);
    } catch {
      toast.error("JSON Syntax Error", "Please provide a valid JSON manifest string.");
    }
  };

  const handleCopyMcpSchema = () => {
    cyberAudio.play("click");
    const mcpSchema = {
      protocol: "mcp-v1",
      tools: plugins
        .filter((p) => p.enabled)
        .map((p) => ({
          name: p.id.replace(/\./g, "_"),
          description: p.description,
          inputSchema: {
            type: "object",
            properties: {
              input: { type: "string", description: "Payload string or JSON" },
            },
            required: ["input"],
          },
        })),
    };
    navigator.clipboard.writeText(JSON.stringify(mcpSchema, null, 2));
    toast.success("MCP Schema Copied", "Tool declarations copied to clipboard.");
  };

  return (
    <div className="space-y-5 animate-fade-in font-mono select-none">
      {/* Top Banner Hub */}
      <div className="cyber-card p-5 bg-[#07070B]/95 border border-[#00FF41]/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Puzzle size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                PLUGIN EXPLORER & EXTENSION ENGINE
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                {activeCount} / {plugins.length} ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              Manage sandboxed extensions, grant capabilities & export Model Context Protocol (MCP) tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMcpSchema}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 transition-all cursor-pointer"
            title="Export Model Context Protocol Tools JSON"
          >
            <Code size={14} />
            <span>EXPORT MCP TOOLS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsInstallModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF41] text-black hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          >
            <Plus size={14} />
            <span>INSTALL PLUGIN</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-col gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "bg-white/5 text-[#9499B3] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions by name, ID, author, or permissions..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
          />
        </div>
      </div>

      {/* Installed & Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`cyber-card p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
              plugin.enabled
                ? "bg-[#090A14] border-white/10 hover:border-[#00FF41]/40 shadow-lg"
                : "bg-black/20 border-white/5 opacity-60 hover:opacity-90"
            }`}
          >
            {/* Top Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    plugin.enabled
                      ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                      : "bg-white/5 text-[#4F536E] border border-white/10"
                  }`}
                >
                  <Puzzle size={18} />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-xs text-[#F1F3F9] truncate">
                      {plugin.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#4F536E]">
                      {plugin.version}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#00FF41] font-mono mt-0.5">
                    {plugin.id}
                  </span>

                  <p className="text-[11px] text-[#9499B3] font-sans leading-relaxed mt-1 line-clamp-2">
                    {plugin.description}
                  </p>
                </div>
              </div>

              {/* On / Off Switch */}
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer relative shrink-0 p-0.5 border ${
                  plugin.enabled
                    ? "bg-[#00FF41]/20 border-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                    : "bg-black border-white/20"
                }`}
                title={plugin.enabled ? "Disable Extension" : "Enable Extension"}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    plugin.enabled
                      ? "translate-x-6 bg-[#00FF41]"
                      : "translate-x-0 bg-[#4F536E]"
                  }`}
                />
              </button>
            </div>

            {/* Permissions & Telemetry Strip */}
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                {plugin.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] font-bold"
                  >
                    {perm}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#4F536E]">
                <span>Author: <strong className="text-[#9499B3]">{plugin.author}</strong></span>
                <span suppressHydrationWarning>{plugin.executions} runs</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Install Plugin Modal */}
      {isInstallModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono"
          onClick={() => setIsInstallModalOpen(false)}
        >
          <div
            className="w-full max-w-lg cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase">
                  INSTALL CUSTOM EXTENSION
                </h3>
              </div>
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="text-[#4F536E] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInstall} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Plugin JSON Manifest
                </label>
                <textarea
                  rows={6}
                  value={manifestInput}
                  onChange={(e) => setManifestInput(e.target.value)}
                  placeholder={`{\n  "id": "ext.my_tool",\n  "name": "Custom Analyzer",\n  "version": "v1.0.0",\n  "author": "Operator",\n  "category": "DATA & COMPILERS",\n  "description": "Analyzes AST trees.",\n  "permissions": ["AST_PARSER"]\n}`}
                  className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.4)]"
                >
                  INSTALL EXTENSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
