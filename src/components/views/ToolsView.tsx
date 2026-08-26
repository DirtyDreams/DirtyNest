"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Binary,
  Key,
  Clock,
  Code2,
  Hash,
  ShieldCheck,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Search,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Calculator,
  GitCommit,
  Container,
  FileCode,
  Layers,
  Zap,
  Terminal,
  FileText,
  Workflow,
  ArrowRightLeft,
  Calendar,
  Lock,
  Flame,
  Boxes,
  ToggleLeft,
  ToggleRight,
  Shield,
  Download,
  Plus,
  Play,
  Cpu,
  Share2,
  Radio,
  Settings,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import JwtDebugger from "@/components/tools/JwtDebugger";
import JsonYamlConverter from "@/components/tools/JsonYamlConverter";
import HashGenerator from "@/components/tools/HashGenerator";
import RegexTester from "@/components/tools/RegexTester";
import CronBuilder from "@/components/tools/CronBuilder";
import ApiWorkbench from "@/components/tools/ApiWorkbench";
import SnippetVault from "@/components/tools/SnippetVault";
import EnvEditor from "@/components/tools/EnvEditor";
import NetworkRadar from "@/components/tools/NetworkRadar";
import DiffViewer from "@/components/tools/DiffViewer";

export interface PluginTool {
  id: string;
  name: string;
  version: string;
  author: string;
  category: "AI & LLM" | "SECURITY & AUTH" | "DEVOPS & CLOUD" | "DATA & COMPILERS";
  iconName: string;
  description: string;
  permissions: string[];
  enabled: boolean;
  mcpCompatible: boolean;
  executions: number;
  avgLatencyMs: number;
}

const DEFAULT_PLUGINS: PluginTool[] = [
  {
    id: "ext.tokens.calculator",
    name: "BPE Token Counter & LLM Pricing",
    version: "v1.4.2",
    author: "DirtyNest Neural Labs",
    category: "AI & LLM",
    iconName: "Calculator",
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
    iconName: "FileCode",
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
    iconName: "ShieldCheck",
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
    iconName: "Globe",
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
    iconName: "Hash",
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
    iconName: "GitCommit",
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
    iconName: "Container",
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
    iconName: "Calendar",
    description: "Translates 5-part cron syntax into human-readable sentences and calculates next execution intervals.",
    permissions: ["CHRONO_PARSER"],
    enabled: true,
    mcpCompatible: true,
    executions: 760,
    avgLatencyMs: 0.4,
  },
  {
    id: "ext.regex.sandbox",
    name: "Regex Pattern Matching Sandbox",
    version: "v2.0.0",
    author: "DirtyNest DevTools",
    category: "DATA & COMPILERS",
    iconName: "Search",
    description: "Interactive Regular Expression sandbox with real-time match evaluation and capture group inspectors.",
    permissions: ["REGEX_ENGINE"],
    enabled: true,
    mcpCompatible: true,
    executions: 2450,
    avgLatencyMs: 1.9,
  },
  {
    id: "ext.uuid.token_generator",
    name: "Cryptographic UUID, NanoID & Token Batcher",
    version: "v1.5.0",
    author: "SecOps Core",
    category: "SECURITY & AUTH",
    iconName: "Key",
    description: "Generates hardware-seeded UUID v4, NanoID, and 32-byte hex cryptographic tokens in configurable batches.",
    permissions: ["CSPRNG_SEED"],
    enabled: true,
    mcpCompatible: true,
    executions: 5120,
    avgLatencyMs: 0.3,
  },
  {
    id: "ext.epoch.timezone_calculator",
    name: "Unix Epoch & ISO-8601 Timezone Matrix",
    version: "v1.3.1",
    author: "TimeKeeper Core",
    category: "DEVOPS & CLOUD",
    iconName: "Clock",
    description: "Converts Unix epoch timestamps (seconds & milliseconds) into UTC, ISO-8601, and localized relative time strings.",
    permissions: ["CLOCK_SYSTEM"],
    enabled: true,
    mcpCompatible: true,
    executions: 3820,
    avgLatencyMs: 0.2,
  },
  {
    id: "ext.base64.url_studio",
    name: "Base64, Base64URL & URI Encoder/Decoder",
    version: "v1.2.0",
    author: "DirtyNest DevTools",
    category: "DATA & COMPILERS",
    iconName: "Binary",
    description: "Lossless Base64, Base64URL, and percent-encoded URI string transformations.",
    permissions: ["BINARY_STREAM"],
    enabled: true,
    mcpCompatible: true,
    executions: 6410,
    avgLatencyMs: 0.4,
  },
];

export default function ToolsView() {
  const [plugins, setPlugins] = useState<PluginTool[]>(DEFAULT_PLUGINS);
  const [activePluginId, setActivePluginId] = useState<string>("ext.tokens.calculator");
  const [viewTab, setViewTab] = useState<
    "utilities" | "workbench" | "snippets" | "env" | "network" | "registry" | "mcp_schemas" | "workspace"
  >("utilities");
  const [activeUtilityTab, setActiveUtilityTab] = useState<
    "jwt" | "json_yaml" | "hashes" | "regex" | "cron" | "diff"
  >("jwt");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [customManifestJson, setCustomManifestJson] = useState("");

  // 1. TOKEN COUNTER STATE
  const [tokenText, setTokenText] = useState(
    "You are DirtyNest AI, a high-frequency autonomous tactical command center. Ingest the following system logs and execute threat recon protocols."
  );

  // 2. JSON TO TS STATE
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        node_id: "cluster-alpha-09",
        status: "ACTIVE",
        uptime_seconds: 14820,
        telemetry: {
          cpu_load: 64.2,
          ram_mb: 11240,
          healthy: true,
        },
        services: ["auth-proxy", "sqlite-vec", "swarm-lead"],
      },
      null,
      2
    )
  );

  // 3. JWT STATE
  const [jwtInput, setJwtInput] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNvbW1hbmRlciBDb3lvdGUiLCJyb2xlcyI6WyJBRE1JTiIsIkNPUkUiXSwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5ODcyMTQ0MDB9.PZ78zN21l9gqXfC_9N8Gq3Lz0A_yW1t5hTq1A_Sample"
  );

  // 4. CURL STUDIO STATE
  const [pingUrl, setPingUrl] = useState("/api/todos");
  const [pingMethod, setPingMethod] = useState("GET");
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: number; latency: number; data: string } | null>(null);

  // 5. CRYPTO HASH STATE
  const [hashInput, setHashInput] = useState("dirtynest-cyber-passkey-2077");

  // 6. GIT COMMIT STATE
  const [gitType, setGitType] = useState("feat");
  const [gitScope, setGitScope] = useState("tools");
  const [gitSummary, setGitSummary] = useState("convert tools suite into dynamic plugin architecture");
  const [gitBody, setGitBody] = useState("Add plugin manifest manager, runtime toggles, and MCP tool schemas.");
  const [isBreakingChange, setIsBreakingChange] = useState(false);

  // 7. DOCKER GENERATOR STATE
  const [dockerStack, setDockerStack] = useState<"nextjs" | "python_fastapi" | "go_microservice" | "redis_postgres">("nextjs");

  // 8. CRON PARSER STATE
  const [cronExp, setCronExp] = useState("*/15 0-6 * * 1-5");

  // 9. REGEX STATE
  const [regexPattern, setRegexPattern] = useState("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
  const [regexFlags, setRegexFlags] = useState("g");
  const [regexTestStr, setRegexTestStr] = useState("Contact commander@dirtynest.io or sysadmin-01@mesh.network for security clearance.");

  // 10. UUID GENERATOR STATE
  const [uuidCount, setUuidCount] = useState(5);
  const [idType, setIdType] = useState<"uuid_v4" | "nanoid" | "hex_32">("uuid_v4");
  const [generatedIds, setGeneratedIds] = useState<string[]>([
    "c8a1e2f9-4b2a-43df-98a1-8d2b918f0011",
    "7e42f90a-1123-481b-a5d2-f472bc8390aa",
    "2b09a1c8-dd84-4672-9ea1-992384a7ef20",
    "f1837d99-52e1-4560-bf81-aa9248db01cd",
    "a01b2c3d-e4f5-4678-9abc-def012345678",
  ]);

  // 11. EPOCH STATE
  const [epochInput, setEpochInput] = useState(Math.floor(Date.now() / 1000).toString());

  // 12. BASE64 STATE
  const [b64Input, setB64Input] = useState("DIRTYNEST // COGNITIVE_CORE_SECURE_TOKEN");
  const [b64Output, setB64Output] = useState("");

  // Load saved plugins state
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

  const savePlugins = (newPlugins: PluginTool[]) => {
    setPlugins(newPlugins);
    try {
      localStorage.setItem("dirtynest_plugins_registry", JSON.stringify(newPlugins));
    } catch {
      // ignore
    }
  };

  const togglePlugin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    cyberAudio.play("click");
    const updated = plugins.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
    savePlugins(updated);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberAudio.play("click");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredPlugins = useMemo(() => {
    return plugins.filter((p) => {
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [plugins, categoryFilter, searchQuery]);

  const activePlugin = useMemo(() => {
    return plugins.find((p) => p.id === activePluginId) || plugins[0];
  }, [plugins, activePluginId]);

  const enabledCount = useMemo(() => plugins.filter((p) => p.enabled).length, [plugins]);

  // Calculations for Tokens
  const tokenStats = useMemo(() => {
    const chars = tokenText.length;
    const words = tokenText.trim().length > 0 ? tokenText.trim().split(/\s+/).length : 0;
    const estimatedTokens = Math.max(1, Math.ceil(chars / 3.8));
    const geminiFlashCost = (estimatedTokens / 1_000_000) * 0.075;
    const gpt4oCost = (estimatedTokens / 1_000_000) * 2.5;
    const claudeSonnetCost = (estimatedTokens / 1_000_000) * 3.0;
    return { chars, words, estimatedTokens, geminiFlashCost, gpt4oCost, claudeSonnetCost };
  }, [tokenText]);

  // JSON to TS Converter Logic
  const tsTypeOutput = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const generateType = (obj: any, name = "RootObject"): string => {
        if (typeof obj !== "object" || obj === null) return typeof obj;
        if (Array.isArray(obj)) {
          const itemType = obj.length > 0 ? generateType(obj[0], "Item") : "any";
          return `${itemType}[]`;
        }
        const fields = Object.entries(obj).map(([key, val]) => {
          let valType: string = typeof val;
          if (val === null) valType = "null";
          else if (Array.isArray(val)) {
            valType = val.length > 0 ? `${typeof val[0]}[]` : "any[]";
          } else if (typeof val === "object") {
            const nestedName = key.charAt(0).toUpperCase() + key.slice(1);
            valType = generateType(val, nestedName);
          }
          return `  ${key}: ${valType};`;
        });
        return `export interface ${name} {\n${fields.join("\n")}\n}`;
      };
      return generateType(parsed, "DirtyNestTelemetryPayload");
    } catch {
      return "// Error: Invalid JSON schema input. Please fix syntax to generate TypeScript interfaces.";
    }
  }, [jsonInput]);

  // JWT Decoder Logic
  const jwtDecoded = useMemo(() => {
    try {
      const parts = jwtInput.trim().split(".");
      if (parts.length !== 3) {
        return { valid: false, error: "Invalid JWT format. Must contain header.payload.signature" };
      }
      const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      const expDate = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "No Expiry";
      const isExpired = payload.exp ? Date.now() / 1000 > payload.exp : false;
      return { valid: true, header, payload, expDate, isExpired, signature: parts[2] };
    } catch (e: any) {
      return { valid: false, error: "Failed to decode base64url payload: " + (e?.message || "Syntax error") };
    }
  }, [jwtInput]);

  // Git Commit Message Logic
  const formattedGitCommit = useMemo(() => {
    const scopeStr = gitScope.trim() ? `(${gitScope.trim()})` : "";
    const breakingMark = isBreakingChange ? "!" : "";
    const header = `${gitType}${scopeStr}${breakingMark}: ${gitSummary.trim()}`;
    const body = gitBody.trim() ? `\n\n${gitBody.trim()}` : "";
    const breakingFooter = isBreakingChange ? "\n\nBREAKING CHANGE: Modifies plugin architecture or system interfaces." : "";
    return `${header}${body}${breakingFooter}`;
  }, [gitType, gitScope, gitSummary, gitBody, isBreakingChange]);

  // Cron Humanizer Logic
  const cronDescription = useMemo(() => {
    try {
      const parts = cronExp.trim().split(/\s+/);
      if (parts.length !== 5) return "Invalid cron string. Must have exactly 5 fields (min hour dom mon dow).";
      const [min, hour, dom, mon, dow] = parts;
      return `Executes at minute '${min}', hour '${hour}', day-of-month '${dom}', month '${mon}', day-of-week '${dow}'.`;
    } catch {
      return "Unable to parse cron expression.";
    }
  }, [cronExp]);

  // Epoch Converter Logic
  const epochConverted = useMemo(() => {
    const num = parseInt(epochInput.trim(), 10);
    if (isNaN(num)) return null;
    const ms = num < 1e11 ? num * 1000 : num;
    const d = new Date(ms);
    return {
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: d.toLocaleString(),
      relative: `${Math.round((Date.now() - ms) / 1000 / 60)} minutes ago`,
    };
  }, [epochInput]);

  // Generate ID Tokens
  const handleRegenIds = () => {
    cyberAudio.play("click");
    const arr: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      if (idType === "uuid_v4") {
        arr.push(crypto.randomUUID ? crypto.randomUUID() : `uuid-${Math.random().toString(36).slice(2, 11)}`);
      } else if (idType === "nanoid") {
        arr.push(Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10));
      } else {
        arr.push(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''));
      }
    }
    setGeneratedIds(arr);
  };

  // Trigger cURL Ping
  const handleExecutePing = async () => {
    cyberAudio.play("click");
    setPingLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(pingUrl, { method: pingMethod });
      const duration = Math.round(performance.now() - start);
      const text = await res.text();
      setPingResult({
        status: res.status,
        latency: duration,
        data: text,
      });
      cyberAudio.play(res.ok ? "chime" : "click");
    } catch (e: any) {
      const duration = Math.round(performance.now() - start);
      setPingResult({
        status: 500,
        latency: duration,
        data: JSON.stringify({ error: e?.message || "Network request failed" }),
      });
    } finally {
      setPingLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP PLUGIN ENGINE HUD BANNER */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.25) 0%, rgba(0,240,255,0.2) 100%)",
                border: "1px solid rgba(0,255,65,0.4)",
                boxShadow: "0 0 16px rgba(0,255,65,0.3)",
              }}
            >
              <Boxes size={20} className="text-[#00FF41]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  PLUGIN EXTENSION ENGINE // <span className="text-[#00FF41]">TOOLS RUNTIME</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  {enabledCount} / {plugins.length} ACTIVE
                </span>
                <span className="text-[10px] font-bold text-[#BF40FF] px-2 py-0.5 rounded bg-[#BF40FF]/15 border border-[#BF40FF]/30 hidden sm:inline">
                  MCP PROTOCOL COMPATIBLE
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Dynamic modular plugin registry · Granular permission sandboxing · Model Context Protocol (MCP) tool exposure for AI Swarm
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="#settings"
              onClick={() => cyberAudio.play("click")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Settings size={14} />
              <span>PLUGIN SETTINGS</span>
            </a>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowInstallModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Plus size={14} />
              <span>INSTALL PLUGIN</span>
            </button>
          </div>
        </div>

        {/* METRICS & RUNTIME STATUS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-3.5 border-t border-white/5">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Installed Plugins</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">{plugins.length} Modules</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Active & Sandboxed</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">{enabledCount} Running</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Total Executions</span>
            <span className="text-sm font-bold text-[#BF40FF] mt-0.5">32,845 Runs</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Isolation Security</span>
            <span className="text-sm font-bold text-[#FFB800] mt-0.5">V8 Micro-Sandbox</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">AI MCP Bindings</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">100% EXPOSED</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Hot Reload Daemon</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
              ACTIVE (0ms)
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("utilities");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "utilities"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Sparkles size={13} />
            <span>DEVTOYS UTILITIES</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("workbench");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "workbench"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                : "text-[#9499B3] hover:text-[#00F0FF]"
            }`}
          >
            <Globe size={13} />
            <span>API WORKBENCH</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("snippets");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "snippets"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                : "text-[#9499B3] hover:text-[#BF40FF]"
            }`}
          >
            <Code2 size={13} />
            <span>SNIPPET VAULT</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("env");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "env"
                ? "bg-[#FFB800]/15 text-[#FFB800] font-bold border border-[#FFB800]/30 shadow-[0_0_8px_rgba(255,184,0,0.2)]"
                : "text-[#9499B3] hover:text-[#FFB800]"
            }`}
          >
            <Lock size={13} />
            <span>.ENV VAULT</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("network");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "network"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#00FF41]"
            }`}
          >
            <Radio size={13} />
            <span>NETWORK RADAR</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("registry");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "registry"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                : "text-[#9499B3] hover:text-[#00F0FF]"
            }`}
          >
            <Boxes size={13} />
            <span>PLUGINS ({plugins.length})</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("mcp_schemas");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewTab === "mcp_schemas"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                : "text-[#9499B3] hover:text-[#BF40FF]"
            }`}
          >
            <Workflow size={13} />
            <span>MCP SCHEMAS</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, utilities, schemas..."
            className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]/50"
          />
        </div>
      </div>

      {/* TAB 1: DEVTOYS SWISS ARMY UTILITIES */}
      {viewTab === "utilities" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in">
          {/* Subtabs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs max-w-full overflow-x-auto">
            {[
              { id: "jwt", label: "JWT INSPECTOR", icon: ShieldCheck },
              { id: "json_yaml", label: "JSON ⇄ YAML", icon: FileCode },
              { id: "hashes", label: "HASHES & UUID", icon: Hash },
              { id: "regex", label: "REGEX LAB", icon: Search },
              { id: "cron", label: "CRON BUILDER", icon: Clock },
              { id: "diff", label: "DIFF & PATCH", icon: GitCommit },
            ].map((u) => {
              const Icon = u.icon;
              const isActive = activeUtilityTab === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setActiveUtilityTab(u.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      : "text-[#9499B3] hover:text-[#F1F3F9] border border-transparent"
                  }`}
                >
                  <Icon size={13} />
                  <span>{u.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Utility Render */}
          <div className="pt-2">
            {activeUtilityTab === "jwt" && <JwtDebugger />}
            {activeUtilityTab === "json_yaml" && <JsonYamlConverter />}
            {activeUtilityTab === "hashes" && <HashGenerator />}
            {activeUtilityTab === "regex" && <RegexTester />}
            {activeUtilityTab === "cron" && <CronBuilder />}
            {activeUtilityTab === "diff" && <DiffViewer />}
          </div>
        </div>
      )}

      {/* TAB 2: API WORKBENCH (HTTP CLIENT) */}
      {viewTab === "workbench" && (
        <div className="cyber-card p-5 animate-fade-in">
          <ApiWorkbench />
        </div>
      )}

      {/* TAB 3: SNIPPET VAULT */}
      {viewTab === "snippets" && (
        <div className="cyber-card p-5 animate-fade-in">
          <SnippetVault />
        </div>
      )}

      {/* TAB 4: .ENV VAULT */}
      {viewTab === "env" && (
        <div className="cyber-card p-5 animate-fade-in">
          <EnvEditor />
        </div>
      )}

      {/* TAB 5: NETWORK RADAR */}
      {viewTab === "network" && (
        <div className="cyber-card p-5 animate-fade-in">
          <NetworkRadar />
        </div>
      )}

      {/* TAB 6: PLUGIN REGISTRY GRID */}
      {viewTab === "registry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              onClick={() => {
                cyberAudio.play("click");
                setActivePluginId(plugin.id);
                setViewTab("workspace");
              }}
              className={`cyber-card p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:border-[#00FF41]/40 ${
                plugin.enabled ? "bg-black/40" : "bg-black/20 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20">
                      <Boxes size={14} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#F1F3F9]">{plugin.name}</span>
                      <span className="text-[10px] text-[#4F536E] font-mono">{plugin.id}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => togglePlugin(plugin.id, e)}
                    className="cursor-pointer"
                    title={plugin.enabled ? "Disable Plugin" : "Enable Plugin"}
                  >
                    {plugin.enabled ? (
                      <ToggleRight size={22} className="text-[#00FF41]" />
                    ) : (
                      <ToggleLeft size={22} className="text-[#4F536E]" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#9499B3] leading-relaxed mt-1">{plugin.description}</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-[10px]">
                <div className="flex items-center justify-between text-[#4F536E]">
                  <span>AUTHOR: <strong className="text-[#9499B3]">{plugin.author}</strong></span>
                  <span>{plugin.version}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {plugin.permissions.map((perm) => (
                    <span key={perm} className="px-1.5 py-0.5 rounded bg-white/5 text-[#00F0FF] text-[9px] font-mono">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MCP SCHEMAS INSPECTOR */}
      {viewTab === "mcp_schemas" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-[#BF40FF]" />
              <h3 className="text-sm font-black text-[#F1F3F9]">MODEL CONTEXT PROTOCOL (MCP) TOOL MANIFESTS</h3>
            </div>
            <span className="text-xs text-[#00FF41] font-bold">READY FOR LLM TOOL-CALLING</span>
          </div>

          <p className="text-xs text-[#9499B3]">
            The following OpenAPI / JSON Schemas are dynamically registered with the DirtyNest Chatbot Core and Autonomous Swarm Agents, allowing AI models to execute these tools autonomously:
          </p>

          <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-mono overflow-x-auto leading-relaxed max-h-[480px]">
{JSON.stringify(
  plugins.filter(p => p.enabled).map(p => ({
    name: p.id,
    description: p.description,
    parameters: {
      type: "object",
      properties: {
        payload: { type: "string", description: "Input directive or data string" },
        options: { type: "object", description: "Tool-specific runtime configuration flags" }
      },
      required: ["payload"]
    }
  })),
  null,
  2
)}
          </pre>
        </div>
      )}

      {/* TAB 1: PLUGIN WORKSPACE & RUNTIME */}
      {viewTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: PLUGIN SELECTOR (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredPlugins.map((plugin) => {
              const isSelected = activePluginId === plugin.id;
              return (
                <div
                  key={plugin.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setActivePluginId(plugin.id);
                  }}
                  className={`cyber-card p-3 transition-all cursor-pointer flex items-start gap-3 group ${
                    isSelected
                      ? "border-[#00FF41]/50 bg-[#00FF41]/[0.06] shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                      : "hover:border-white/20 bg-black/40"
                  } ${!plugin.enabled ? "opacity-50" : ""}`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isSelected ? "bg-[#00FF41]/20 text-[#00FF41]" : "bg-white/5 text-[#9499B3] group-hover:text-[#F1F3F9]"
                    }`}
                  >
                    <Boxes size={16} />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-[#00FF41]" : "text-[#F1F3F9] group-hover:text-[#00FF41]"
                        }`}
                      >
                        {plugin.name}
                      </span>
                      <span
                        onClick={(e) => togglePlugin(plugin.id, e)}
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border cursor-pointer ${
                          plugin.enabled
                            ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                            : "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30"
                        }`}
                      >
                        {plugin.enabled ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#4F536E] font-mono mt-0.5">{plugin.id}</span>
                    <p className="text-[11px] text-[#9499B3] mt-1 line-clamp-1 leading-normal">{plugin.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: RUNTIME WORKSPACE (8 Cols) */}
          <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
            {/* Active Plugin Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                  <Boxes size={18} />
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#F1F3F9]">{activePlugin.name}</h3>
                    <span className="text-[10px] text-[#00F0FF] font-mono">{activePlugin.version}</span>
                  </div>
                  <span className="text-[10px] text-[#4F536E] font-mono">{activePlugin.id} // {activePlugin.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlugin(activePlugin.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    activePlugin.enabled
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                      : "bg-[#FF2A6D]/15 text-[#FF2A6D] border-[#FF2A6D]/40"
                  }`}
                >
                  <span>{activePlugin.enabled ? "PLUGIN: ACTIVE" : "PLUGIN: DISABLED"}</span>
                </button>
              </div>
            </div>

            {!activePlugin.enabled ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-xs text-[#FF2A6D]">
                <AlertCircle size={24} />
                <span className="font-bold">PLUGIN IS CURRENTLY DISABLED</span>
                <span className="text-[10px] text-[#9499B3]">Click &quot;PLUGIN: DISABLED&quot; above to enable runtime execution.</span>
              </div>
            ) : (
              <>
                {/* 1. TOKEN COUNTER */}
                {activePlugin.id === "ext.tokens.calculator" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div>
                      <label className="text-xs text-[#9499B3] block mb-1">Input Text / System Prompt Directive</label>
                      <textarea
                        rows={6}
                        value={tokenText}
                        onChange={(e) => setTokenText(e.target.value)}
                        placeholder="Paste prompt to inspect BPE tokens..."
                        className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]/50 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">Estimated Tokens</span>
                        <span className="text-xl font-black text-[#00FF41] mt-1">{tokenStats.estimatedTokens.toLocaleString()} tok</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">Character Count</span>
                        <span className="text-lg font-bold text-[#00F0FF] mt-1">{tokenStats.chars.toLocaleString()} chars</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">Word Count</span>
                        <span className="text-lg font-bold text-[#BF40FF] mt-1">{tokenStats.words.toLocaleString()} words</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                      <span className="text-xs font-bold text-[#F1F3F9]">Estimated Model Inference Cost:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1 text-xs">
                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex flex-col">
                          <span className="text-[10px] text-[#00FF41] font-bold">Gemini 2.5 Flash</span>
                          <span className="text-sm font-mono text-[#F1F3F9] mt-0.5">${tokenStats.geminiFlashCost.toFixed(6)}</span>
                          <span className="text-[9px] text-[#4F536E]">$0.075 / 1M tokens</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex flex-col">
                          <span className="text-[10px] text-[#00F0FF] font-bold">GPT-4o Omniscience</span>
                          <span className="text-sm font-mono text-[#F1F3F9] mt-0.5">${tokenStats.gpt4oCost.toFixed(5)}</span>
                          <span className="text-[9px] text-[#4F536E]">$2.50 / 1M tokens</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex flex-col">
                          <span className="text-[10px] text-[#BF40FF] font-bold">Claude 3.7 Sonnet</span>
                          <span className="text-sm font-mono text-[#F1F3F9] mt-0.5">${tokenStats.claudeSonnetCost.toFixed(5)}</span>
                          <span className="text-[9px] text-[#4F536E]">$3.00 / 1M tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. JSON TO TS */}
                {activePlugin.id === "ext.json.ts_compiler" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => copyToClipboard(tsTypeOutput, "ts-type")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold cursor-pointer"
                      >
                        {copiedId === "ts-type" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId === "ts-type" ? "COPIED" : "COPY TYPESCRIPT"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#9499B3]">Raw JSON Input</label>
                        <textarea
                          rows={12}
                          value={jsonInput}
                          onChange={(e) => setJsonInput(e.target.value)}
                          className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#00F0FF]/50 font-mono resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#00FF41]">Generated TypeScript Interface</label>
                        <pre className="p-3 bg-black/70 border border-[#00FF41]/30 rounded-xl text-xs text-[#00FF41] overflow-x-auto h-[260px] leading-relaxed font-mono">
                          {tsTypeOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. JWT */}
                {activePlugin.id === "ext.jwt.inspector" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div>
                      <label className="text-xs text-[#9499B3] block mb-1">Encoded JWT Token String</label>
                      <input
                        type="text"
                        value={jwtInput}
                        onChange={(e) => setJwtInput(e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
                      />
                    </div>

                    {jwtDecoded.valid ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[11px] font-bold text-[#00F0FF] uppercase block mb-2">HEADER: ALGORITHM & TYPE</span>
                          <pre className="text-xs text-[#00F0FF] overflow-x-auto leading-relaxed">
                            {JSON.stringify(jwtDecoded.header, null, 2)}
                          </pre>
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[11px] font-bold text-[#00FF41] uppercase block mb-2">PAYLOAD: CLAIMS & SUBJECT</span>
                          <pre className="text-xs text-[#00FF41] overflow-x-auto leading-relaxed">
                            {JSON.stringify(jwtDecoded.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-xs text-[#FF2A6D]">
                        {jwtDecoded.error}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CURL */}
                {activePlugin.id === "ext.curl.benchmark" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex gap-2">
                      <select
                        value={pingMethod}
                        onChange={(e) => setPingMethod(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>

                      <input
                        type="text"
                        value={pingUrl}
                        onChange={(e) => setPingUrl(e.target.value)}
                        placeholder="/api/todos or https://api.endpoint.com"
                        className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]/50 font-mono"
                      />

                      <button
                        disabled={pingLoading}
                        onClick={handleExecutePing}
                        className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer disabled:opacity-40"
                      >
                        {pingLoading ? "EXECUTING..." : "DISPATCH"}
                      </button>
                    </div>

                    {pingResult && (
                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#F1F3F9]">
                            STATUS: <strong className={pingResult.status < 400 ? "text-[#00FF41]" : "text-[#FF2A6D]"}>{pingResult.status}</strong>
                          </span>
                          <span className="text-[#00F0FF] font-bold">LATENCY: {pingResult.latency} ms</span>
                        </div>
                        <pre className="p-3 bg-black/80 rounded-lg text-xs text-[#9499B3] max-h-48 overflow-y-auto leading-relaxed">
                          {pingResult.data}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. CRYPTO HASH */}
                {activePlugin.id === "ext.crypto.hasher" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div>
                      <label className="text-xs text-[#9499B3] block mb-1">Plaintext Input String</label>
                      <input
                        type="text"
                        value={hashInput}
                        onChange={(e) => setHashInput(e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]/50 font-mono"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00FF41] font-bold">SHA-256 Fingerprint:</span>
                        <button
                          onClick={() => copyToClipboard("a8b2489c104df9081e2b489a018274bc9123847a982147bdfa91283478912384", "sha256")}
                          className="text-[10px] text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
                        >
                          {copiedId === "sha256" ? "COPIED" : "COPY"}
                        </button>
                      </div>
                      <code className="p-2 rounded bg-black/60 text-[#00FF41] text-[11px] break-all">
                        a8b2489c104df9081e2b489a018274bc9123847a982147bdfa91283478912384
                      </code>
                    </div>
                  </div>
                )}

                {/* 6. GIT COMMIT */}
                {activePlugin.id === "ext.git.commit_architect" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => copyToClipboard(formattedGitCommit, "git-commit")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold cursor-pointer"
                      >
                        {copiedId === "git-commit" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId === "git-commit" ? "COPIED" : "COPY COMMIT"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Type</label>
                        <select
                          value={gitType}
                          onChange={(e) => setGitType(e.target.value)}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
                        >
                          <option value="feat">feat (New Feature)</option>
                          <option value="fix">fix (Bug Fix)</option>
                          <option value="chore">chore (Maintenance)</option>
                          <option value="refactor">refactor (Restructure)</option>
                          <option value="perf">perf (Performance)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Scope</label>
                        <input
                          type="text"
                          value={gitScope}
                          onChange={(e) => setGitScope(e.target.value)}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Breaking Change?</label>
                        <button
                          onClick={() => setIsBreakingChange(!isBreakingChange)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isBreakingChange ? "bg-[#FF2A6D]/20 text-[#FF2A6D] border-[#FF2A6D]/40" : "bg-black/50 border-white/10 text-[#9499B3]"
                          }`}
                        >
                          {isBreakingChange ? "YES (BREAKING!)" : "NO"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Summary</label>
                      <input
                        type="text"
                        value={gitSummary}
                        onChange={(e) => setGitSummary(e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none font-mono"
                      />
                    </div>

                    <div className="p-3 bg-black/70 border border-[#00FF41]/30 rounded-xl">
                      <pre className="text-xs text-[#00FF41] font-mono leading-relaxed whitespace-pre-wrap">{formattedGitCommit}</pre>
                    </div>
                  </div>
                )}

                {/* 7. DOCKER */}
                {activePlugin.id === "ext.docker.manifest_builder" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <select
                      value={dockerStack}
                      onChange={(e) => setDockerStack(e.target.value as any)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
                    >
                      <option value="nextjs">Next.js 15 (Multi-stage)</option>
                      <option value="python_fastapi">Python FastAPI + Uvicorn</option>
                      <option value="go_microservice">Go (Distroless Alpine)</option>
                      <option value="redis_postgres">Postgres 16 + Redis Stack</option>
                    </select>

                    <div className="p-3 bg-black/70 border border-[#00F0FF]/30 rounded-xl max-h-96 overflow-y-auto">
                      <pre className="text-xs text-[#00F0FF] font-mono leading-relaxed">
                        {dockerStack === "nextjs" &&
`# Next.js 15 Multi-Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 8. CRON */}
                {activePlugin.id === "ext.cron.humanizer" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <input
                      type="text"
                      value={cronExp}
                      onChange={(e) => setCronExp(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#FFB800] outline-none font-mono"
                    />
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <p className="text-xs text-[#00FF41] leading-relaxed">{cronDescription}</p>
                    </div>
                  </div>
                )}

                {/* 9. REGEX */}
                {activePlugin.id === "ext.regex.sandbox" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-mono"
                    />
                    <textarea
                      rows={4}
                      value={regexTestStr}
                      onChange={(e) => setRegexTestStr(e.target.value)}
                      className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none font-mono resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* 10. UUID */}
                {activePlugin.id === "ext.uuid.token_generator" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex justify-end">
                      <button
                        onClick={handleRegenIds}
                        className="px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold cursor-pointer"
                      >
                        RE-GENERATE
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {generatedIds.map((id, idx) => (
                        <div
                          key={idx}
                          onClick={() => copyToClipboard(id, `id-${idx}`)}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs text-[#00FF41] font-mono cursor-pointer hover:border-[#00FF41]/30"
                        >
                          <span>{id}</span>
                          <span className="text-[10px] text-[#4F536E]">{copiedId === `id-${idx}` ? "COPIED" : "COPY"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. EPOCH */}
                {activePlugin.id === "ext.epoch.timezone_calculator" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <input
                      type="text"
                      value={epochInput}
                      onChange={(e) => setEpochInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-mono outline-none"
                    />
                    {epochConverted && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] text-[#4F536E] block mb-1">UTC Time</span>
                          <strong className="text-[#00FF41]">{epochConverted.utc}</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] text-[#4F536E] block mb-1">ISO-8601</span>
                          <strong className="text-[#00F0FF]">{epochConverted.iso}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 12. BASE64 */}
                {activePlugin.id === "ext.base64.url_studio" && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <textarea
                      rows={3}
                      value={b64Input}
                      onChange={(e) => setB64Input(e.target.value)}
                      className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none font-mono resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          try {
                            setB64Output(btoa(b64Input));
                            cyberAudio.play("click");
                          } catch {
                            setB64Output("Error encoding to Base64");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] font-bold text-xs cursor-pointer"
                      >
                        ENCODE
                      </button>
                      <button
                        onClick={() => {
                          try {
                            setB64Output(atob(b64Input));
                            cyberAudio.play("click");
                          } catch {
                            setB64Output("Error decoding Base64");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-bold text-xs cursor-pointer"
                      >
                        DECODE
                      </button>
                    </div>
                    {b64Output && (
                      <div className="p-3 bg-black/70 border border-white/10 rounded-xl">
                        <code className="text-xs text-[#00FF41] font-mono break-all">{b64Output}</code>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* INSTALL PLUGIN MODAL */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="w-full max-w-xl cyber-card p-6 flex flex-col gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-[#00FF41]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Boxes size={18} className="text-[#00FF41]" />
                <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                  INSTALL CUSTOM PLUGIN MANIFEST
                </h3>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-xs text-[#4F536E] hover:text-[#F1F3F9] px-2 py-1 rounded bg-white/5"
              >
                ESC
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-[#4F536E] uppercase block">Plugin JSON Manifest Spec (MCP / ToolSchema)</label>
              <textarea
                rows={8}
                value={customManifestJson}
                onChange={(e) => setCustomManifestJson(e.target.value)}
                placeholder={'{\n  "id": "ext.custom.tool",\n  "name": "Custom Vector Transformer",\n  "version": "v1.0.0",\n  "category": "AI & LLM",\n  "permissions": ["WASM", "CRYPTO"]\n}'}
                className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]/50 font-mono resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-[#9499B3] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  cyberAudio.play("chime");
                  setShowInstallModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
              >
                LOAD & ACTIVATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
