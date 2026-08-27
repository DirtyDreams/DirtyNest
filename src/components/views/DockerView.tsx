"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal as TerminalIcon,
  FileText,
  Layers,
  HardDrive,
  Cpu,
  Activity,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap,
  Boxes,
  Database,
  ArrowDownToLine,
  Filter,
  ShieldAlert,
  Network,
  Settings,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import DockerTerminalModal from "./docker/DockerTerminalModal";
import DockerCveScannerModal from "./docker/DockerCveScannerModal";
import DockerComposeDesignerModal from "./docker/DockerComposeDesignerModal";
import DockerLogsStreamModal from "./docker/DockerLogsStreamModal";
import NetworkTopologyStudioModal from "./tools/NetworkTopologyStudioModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

interface DockerContainerItem {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "restarting";
  ports: string;
  cpuPercent: number;
  memoryUsage: string;
  netIO: string;
  uptime: string;
  stack?: string;
}

interface DockerImageItem {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
  inUse: boolean;
}

interface ComposeStack {
  name: string;
  servicesCount: number;
  status: "active" | "degraded" | "inactive";
  path: string;
  services: string[];
}

const INITIAL_CONTAINERS: DockerContainerItem[] = [
  {
    id: "7f9a12c8b011",
    name: "dirtynest-core-app",
    image: "dirtynest/core:v2.4.0",
    status: "running",
    ports: "0.0.0.0:3000->3000/tcp",
    cpuPercent: 1.8,
    memoryUsage: "184 MB / 16 GB",
    netIO: "42.5 MB / 18.2 MB",
    uptime: "4h 12m",
    stack: "dirtynest-core",
  },
  {
    id: "2e4b910a7c93",
    name: "dirtynest-sqlite-vec",
    image: "sqlite/vec-daemon:v0.1.4",
    status: "running",
    ports: "127.0.0.1:8080->8080/tcp",
    cpuPercent: 3.4,
    memoryUsage: "420 MB / 16 GB",
    netIO: "189 MB / 94.1 MB",
    uptime: "4h 11m",
    stack: "dirtynest-core",
  },
  {
    id: "9c104df9081e",
    name: "dirtynest-redis-mesh",
    image: "redis:7.2-alpine",
    status: "running",
    ports: "127.0.0.1:6379->6379/tcp",
    cpuPercent: 0.6,
    memoryUsage: "64 MB / 16 GB",
    netIO: "12.8 MB / 14.5 MB",
    uptime: "4h 12m",
    stack: "mesh-infra",
  },
  {
    id: "5a8247bdfa91",
    name: "dirtynest-auth-proxy",
    image: "caddy:2.7-alpine",
    status: "running",
    ports: "0.0.0.0:443->443/tcp",
    cpuPercent: 0.2,
    memoryUsage: "28 MB / 16 GB",
    netIO: "210 MB / 195 MB",
    uptime: "4h 10m",
    stack: "mesh-infra",
  },
  {
    id: "3d719a82bc04",
    name: "ollama-deepseek-sandbox",
    image: "ollama/ollama:latest",
    status: "stopped",
    ports: "127.0.0.1:11434->11434/tcp",
    cpuPercent: 0.0,
    memoryUsage: "0 MB / 16 GB",
    netIO: "0 B / 0 B",
    uptime: "Stopped 1h ago",
    stack: "ai-sandbox",
  },
];

const INITIAL_IMAGES: DockerImageItem[] = [
  { id: "sha256:7f9a12c8b", repository: "dirtynest/core", tag: "v2.4.0", size: "482 MB", created: "2 hours ago", inUse: true },
  { id: "sha256:2e4b910a7", repository: "sqlite/vec-daemon", tag: "v0.1.4", size: "124 MB", created: "1 day ago", inUse: true },
  { id: "sha256:9c104df90", repository: "redis", tag: "7.2-alpine", size: "42 MB", created: "5 days ago", inUse: true },
  { id: "sha256:5a8247bdf", repository: "caddy", tag: "2.7-alpine", size: "38 MB", created: "1 week ago", inUse: true },
  { id: "sha256:3d719a82b", repository: "ollama/ollama", tag: "latest", size: "3.8 GB", created: "3 days ago", inUse: false },
  { id: "sha256:1a84f09bd", repository: "node", tag: "20-alpine", size: "178 MB", created: "2 weeks ago", inUse: false },
  { id: "sha256:8b472e91a", repository: "postgres", tag: "16-alpine", size: "294 MB", created: "3 weeks ago", inUse: false },
];

const COMPOSE_STACKS: ComposeStack[] = [
  {
    name: "dirtynest-core",
    servicesCount: 2,
    status: "active",
    path: "/app/docker-compose.yml",
    services: ["dirtynest-core-app", "dirtynest-sqlite-vec"],
  },
  {
    name: "mesh-infra",
    servicesCount: 2,
    status: "active",
    path: "/infra/docker-compose.infra.yml",
    services: ["dirtynest-redis-mesh", "dirtynest-auth-proxy"],
  },
  {
    name: "ai-sandbox",
    servicesCount: 1,
    status: "inactive",
    path: "/ai/docker-compose.ai.yml",
    services: ["ollama-deepseek-sandbox"],
  },
];

export default function DockerView() {
  const { setActiveView } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<"containers" | "images" | "compose" | "logs">("containers");
  const [containers, setContainers] = useState<DockerContainerItem[]>(INITIAL_CONTAINERS);
  const [images, setImages] = useState<DockerImageItem[]>(INITIAL_IMAGES);
  const [selectedContainerId, setSelectedContainerId] = useState<string>("7f9a12c8b011");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPullModal, setShowPullModal] = useState(false);
  const [pullImageInput, setPullImageInput] = useState("alpine:latest");
  const [isPulling, setIsPulling] = useState(false);
  const [terminalContainer, setTerminalContainer] = useState<DockerContainerItem | null>(null);
  const [cveImage, setCveImage] = useState<string | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showTopologyModal, setShowTopologyModal] = useState(false);
  const [streamingLogsContainer, setStreamingLogsContainer] = useState<string | null>(null);
  const [showPruneModal, setShowPruneModal] = useState(false);
  const [isPruning, setIsPruning] = useState(false);

  // Live Logs Simulation
  const [logs, setLogs] = useState<string[]>([
    "[2026-08-25T05:40:01.102Z] INFO: dirtynest-core daemon started on :3000",
    "[2026-08-25T05:40:02.341Z] INFO: Connected to sqlite-vec vector mesh at 127.0.0.1:8080",
    "[2026-08-25T05:40:02.890Z] INFO: Loaded 142 Obsidian Vault embeddings into memory pool",
    "[2026-08-25T05:41:15.004Z] DEBUG: Healthcheck ping OK · latency=1.2ms · memory=184MB",
    "[2026-08-25T05:42:30.912Z] INFO: WebSocket client connected from 127.0.0.1:54210",
    "[2026-08-25T05:43:00.001Z] DEBUG: Swarm agent telemetry heartbeat broadcast (4 nodes synced)",
  ]);
  const [cliInput, setCliInput] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberAudio.play("click");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleContainerAction = (id: string, action: "start" | "stop" | "restart") => {
    cyberAudio.play("click");
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (action === "start") return { ...c, status: "running", uptime: "Just started" };
          if (action === "stop") return { ...c, status: "stopped", cpuPercent: 0, uptime: "Stopped just now" };
          if (action === "restart") return { ...c, status: "restarting", uptime: "Restarting..." };
        }
        return c;
      })
    );

    if (action === "restart") {
      setTimeout(() => {
        setContainers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "running", uptime: "Just started" } : c))
        );
        cyberAudio.play("chime");
      }, 1500);
    }
  };

  const handleExecuteCli = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    cyberAudio.play("click");
    const cmd = cliInput.trim();
    setLogs((prev) => [...prev, `$ ${cmd}`, `[EXEC] Command executed inside container sandbox · returncode=0`]);
    setCliInput("");
  };

  const handlePullImage = () => {
    if (!pullImageInput.trim()) return;
    cyberAudio.play("click");
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
      setShowPullModal(false);
      setImages((prev) => [
        {
          id: `sha256:${Math.random().toString(36).slice(2, 11)}`,
          repository: pullImageInput.split(":")[0] || pullImageInput,
          tag: pullImageInput.split(":")[1] || "latest",
          size: "64 MB",
          created: "Just now",
          inUse: false,
        },
        ...prev,
      ]);
      cyberAudio.play("chime");
    }, 2000);
  };

  const handlePruneSystem = () => {
    cyberAudio.play("click");
    setIsPruning(true);
    setTimeout(() => {
      setIsPruning(false);
      setShowPruneModal(false);
      setImages((prev) => prev.filter((img) => img.inUse));
      setContainers((prev) => prev.filter((c) => c.status === "running"));
      cyberAudio.play("chime");
    }, 1500);
  };

  const selectedContainer = containers.find((c) => c.id === selectedContainerId) || containers[0];
  const runningCount = containers.filter((c) => c.status === "running").length;

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP DOCKER ENGINE HUD BANNER */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(0,255,65,0.2) 100%)",
                border: "1px solid rgba(0,240,255,0.4)",
                boxShadow: "0 0 16px rgba(0,240,255,0.3)",
              }}
            >
              <Container size={20} className="text-[#00F0FF]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  DOCKER CONTAINER // <span className="text-[#00F0FF]">ENGINE HUB</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                  {runningCount} / {containers.length} CONTAINERS ACTIVE
                </span>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 hidden sm:inline">
                  DOCKER v27.1.1 · SOCKET CONNECTED
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Local Docker Daemon bridge · Container lifecycle management · Image registry & Compose stack orchestration
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberAudio.play("warp");
                setShowTopologyModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Network size={14} />
              <span>TOPOLOGY STUDIO</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowComposeModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-400 hover:bg-purple-500/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(191,64,255,0.2)] cursor-pointer"
            >
              <Boxes size={14} />
              <span>COMPOSE ARCHITECT</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowPullModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] cursor-pointer"
            >
              <ArrowDownToLine size={14} />
              <span>PULL IMAGE</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 text-xs font-bold transition-all cursor-pointer"
              title="Configure Docker Socket Daemon in Settings"
            >
              <Settings size={14} />
              <span>DAEMON SETTINGS</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowPruneModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              <span>PRUNE SYSTEM</span>
            </button>
          </div>
        </div>

        {/* METRICS & ENGINE STATUS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-3.5 border-t border-white/5">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Docker Daemon</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
              ONLINE (Unix)
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Running Containers</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5 flex items-center gap-1">
              <NumberFlow value={runningCount} /> Active
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Cached Images</span>
            <span className="text-sm font-bold text-[#BF40FF] mt-0.5 flex items-center gap-1">
              <NumberFlow value={images.length} /> Repositories
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Memory Pool</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">696 MB / 16 GB</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Storage Driver</span>
            <span className="text-sm font-bold text-[#FFB800] mt-0.5">overlay2 (SSD)</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Compose Stacks</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">2 Active / 1 Idle</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveSubTab("containers");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "containers"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Container size={13} />
            <span>CONTAINERS ({containers.length})</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveSubTab("images");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "images"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#00FF41]"
            }`}
          >
            <Layers size={13} />
            <span>IMAGES ({images.length})</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveSubTab("compose");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "compose"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                : "text-[#9499B3] hover:text-[#BF40FF]"
            }`}
          >
            <Boxes size={13} />
            <span>COMPOSE STACKS ({COMPOSE_STACKS.length})</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveSubTab("logs");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "logs"
                ? "bg-[#FFB800]/15 text-[#FFB800] font-bold border border-[#FFB800]/30 shadow-[0_0_8px_rgba(255,184,0,0.2)]"
                : "text-[#9499B3] hover:text-[#FFB800]"
            }`}
          >
            <TerminalIcon size={13} />
            <span>LIVE LOGS & EXEC</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search containers, images, ports..."
            className="pl-8 bg-black/40 border-white/10 text-xs"
          />
        </div>
      </div>

      {/* 1. CONTAINERS VIEW */}
      {activeSubTab === "containers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* CONTAINERS LIST (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {containers
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.id.includes(searchQuery)
              )
              .map((c) => {
                const isSelected = selectedContainerId === c.id;
                const isRunning = c.status === "running";
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedContainerId(c.id);
                    }}
                    className={`cyber-card p-4 transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? "border-[#00F0FF]/50 bg-[#00F0FF]/[0.06] shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        : "hover:border-white/20 bg-black/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            isRunning
                              ? "bg-[#00FF41] shadow-[0_0_8px_#00FF41]"
                              : c.status === "restarting"
                              ? "bg-[#FFB800] animate-pulse"
                              : "bg-[#FF2A6D]"
                          }`}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#F1F3F9]">{c.name}</span>
                            <span className="text-[10px] font-mono text-[#4F536E]">{c.id.slice(0, 10)}</span>
                          </div>
                          <span className="text-[11px] text-[#00F0FF] font-mono mt-0.5">{c.image}</span>
                        </div>
                      </div>

                      {/* Container Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleContainerAction(c.id, "stop")}
                            className="h-7 w-7 text-[#9499B3] hover:text-[#FF2A6D] hover:bg-[#FF2A6D]/10"
                            title="Stop Container"
                          >
                            <Square size={13} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleContainerAction(c.id, "start")}
                            className="h-7 w-7 text-[#9499B3] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                            title="Start Container"
                          >
                            <Play size={13} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContainerAction(c.id, "restart")}
                          className="h-7 w-7 text-[#9499B3] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10"
                          title="Restart Container"
                        >
                          <RotateCw size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            cyberAudio.play("click");
                            setTerminalContainer(c);
                          }}
                          className="h-7 w-7 text-[#9499B3] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                          title="Open In-Browser Exec Terminal"
                        >
                          <TerminalIcon size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            cyberAudio.play("click");
                            setStreamingLogsContainer(c.name);
                          }}
                          className="h-7 w-7 text-[#9499B3] hover:text-emerald-400 hover:bg-emerald-500/10"
                          title="Live Streaming Logs Pipe"
                        >
                          <FileText size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            cyberAudio.play("click");
                            setCveImage(c.image);
                          }}
                          className="h-7 w-7 text-[#9499B3] hover:text-amber-400 hover:bg-amber-500/10"
                          title="Scan Image for CVEs with Trivy"
                        >
                          <ShieldAlert size={13} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">CPU Load</span>
                        <span className="text-[#00FF41] font-bold mt-0.5">{c.cpuPercent}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">Memory</span>
                        <span className="text-[#00F0FF] font-bold mt-0.5">{c.memoryUsage}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#4F536E] uppercase">Port Binding</span>
                        <span className="text-[#BF40FF] font-bold mt-0.5 truncate">{c.ports}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* CONTAINER INSPECTOR (5 Cols) */}
          <div className="lg:col-span-5 cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00F0FF]" />
                <h3 className="text-sm font-black text-[#F1F3F9]">CONTAINER TELEMETRY</h3>
              </div>
              <span className="text-xs text-[#00FF41] font-bold uppercase">{selectedContainer.status}</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#4F536E] uppercase">Full Container ID</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#00F0FF] font-mono break-all">{selectedContainer.id}</span>
                  <button
                    onClick={() => copyToClipboard(selectedContainer.id, "cid")}
                    className="text-[10px] text-[#9499B3] hover:text-[#00F0FF] ml-2 shrink-0 cursor-pointer"
                  >
                    {copiedId === "cid" ? "COPIED" : "COPY"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#4F536E] uppercase block mb-1">Uptime Duration</span>
                  <strong className="text-[#F1F3F9]">{selectedContainer.uptime}</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#4F536E] uppercase block mb-1">Network I/O</span>
                  <strong className="text-[#BF40FF]">{selectedContainer.netIO}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">RAW JSON INSPECTION:</span>
                <pre className="p-3 bg-black/80 rounded-lg text-[11px] text-[#00FF41] font-mono max-h-48 overflow-y-auto leading-relaxed">
{JSON.stringify(
  {
    Id: selectedContainer.id,
    Name: selectedContainer.name,
    Image: selectedContainer.image,
    State: {
      Status: selectedContainer.status,
      Running: selectedContainer.status === "running",
      StartedAt: "2026-08-25T01:32:00Z"
    },
    HostConfig: {
      PortBindings: { "3000/tcp": [{ HostPort: "3000" }] },
      Memory: 17179869184,
      CpuShares: 1024
    }
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMAGES VIEW */}
      {activeSubTab === "images" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#00FF41]" />
              <h3 className="text-sm font-black text-[#F1F3F9]">LOCAL IMAGE REPOSITORY</h3>
            </div>
            <span className="text-xs text-[#00F0FF] font-bold">{images.length} TOTAL IMAGES</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#4F536E] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Repository</th>
                  <th className="py-2.5 px-3">Tag</th>
                  <th className="py-2.5 px-3">Image ID</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {images.map((img) => (
                  <tr key={img.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#F1F3F9]">{img.repository}</td>
                    <td className="py-3 px-3 text-[#00F0FF] font-mono">{img.tag}</td>
                    <td className="py-3 px-3 text-[#9499B3] font-mono">{img.id.slice(0, 15)}</td>
                    <td className="py-3 px-3 text-[#BF40FF] font-bold">{img.size}</td>
                    <td className="py-3 px-3 text-[#4F536E]">{img.created}</td>
                    <td className="py-3 px-3">
                      {img.inUse ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 font-bold">
                          IN USE
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#9499B3] border border-white/10">
                          UNUSED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. COMPOSE STACKS */}
      {activeSubTab === "compose" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {COMPOSE_STACKS.map((stack) => (
            <div key={stack.name} className="cyber-card p-4 flex flex-col justify-between gap-3 bg-black/40">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#F1F3F9]">{stack.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      stack.status === "active"
                        ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                        : "bg-white/5 text-[#4F536E]"
                    }`}
                  >
                    {stack.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-[#4F536E] font-mono">{stack.path}</span>

                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] text-[#9499B3]">Services ({stack.servicesCount}):</span>
                  {stack.services.map((svc) => (
                    <div key={svc} className="px-2 py-1 rounded bg-black/60 border border-white/5 text-[11px] text-[#00F0FF] font-mono">
                      {svc}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                <button className="text-[#00FF41] hover:underline font-bold cursor-pointer">RESTART STACK</button>
                <button className="text-[#FF2A6D] hover:underline cursor-pointer">DOWN</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. LIVE LOGS & TERMINAL EXEC */}
      {activeSubTab === "logs" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TerminalIcon size={18} className="text-[#FFB800]" />
              <h3 className="text-sm font-black text-[#F1F3F9]">
                CONTAINER EXEC & LOG STREAM // <span className="text-[#00F0FF]">{selectedContainer.name}</span>
              </h3>
            </div>
            <span className="text-xs text-[#00FF41] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
              STREAM LIVE
            </span>
          </div>

          <div className="p-4 bg-black/80 border border-white/10 rounded-xl h-[340px] overflow-y-auto font-mono text-xs text-[#00FF41] leading-relaxed flex flex-col gap-1">
            {logs.map((log, idx) => (
              <div key={idx} className="break-all">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <form onSubmit={handleExecuteCli} className="flex gap-2">
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="docker exec -it dirtynest-core-app sh -c '...' or custom command..."
              className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00F0FF]/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer"
            >
              EXECUTE
            </button>
          </form>
        </div>
      )}

      {/* PULL IMAGE MODAL */}
      {showPullModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowPullModal(false)}
        >
          <div
            className="w-full max-w-md cyber-card p-6 flex flex-col gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-[#00F0FF]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ArrowDownToLine size={18} className="text-[#00F0FF]" />
                <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                  PULL DOCKER IMAGE FROM REGISTRY
                </h3>
              </div>
              <button
                onClick={() => setShowPullModal(false)}
                className="text-xs text-[#4F536E] hover:text-[#F1F3F9] px-2 py-1 rounded bg-white/5"
              >
                ESC
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-[#4F536E] uppercase block">Image Tag (e.g. redis:alpine, node:20)</label>
              <input
                type="text"
                value={pullImageInput}
                onChange={(e) => setPullImageInput(e.target.value)}
                placeholder="repository:tag"
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowPullModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#9499B3] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                disabled={isPulling}
                onClick={handlePullImage}
                className="px-5 py-2 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] cursor-pointer disabled:opacity-40"
              >
                {isPulling ? "PULLING LAYERS..." : "PULL IMAGE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCKER IN-BROWSER EXEC TERMINAL MODAL */}
      {terminalContainer && (
        <DockerTerminalModal
          containerName={terminalContainer.name}
          containerId={terminalContainer.id}
          onClose={() => setTerminalContainer(null)}
        />
      )}

      {/* DOCKER TRIVY CVE SCANNER MODAL */}
      {cveImage && (
        <DockerCveScannerModal
          imageName={cveImage}
          onClose={() => setCveImage(null)}
        />
      )}

      {/* DOCKER COMPOSE STACK DESIGNER MODAL */}
      <DockerComposeDesignerModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
      />

      {/* STREAMING CONTAINER LOGS MODAL */}
      {streamingLogsContainer && (
        <DockerLogsStreamModal
          containerName={streamingLogsContainer}
          isOpen={!!streamingLogsContainer}
          onClose={() => setStreamingLogsContainer(null)}
        />
      )}

      {/* PRUNE SYSTEM CONFIRMATION MODAL */}
      {showPruneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowPruneModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#090a10] border border-rose-500/40 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  PRUNE DOCKER SYSTEM
                </h3>
                <span className="text-[11px] text-slate-400">Remove stopped containers & unused images</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              This will execute <code className="text-rose-400">docker system prune -a --volumes</code>, reclaiming disk space by wiping stopped containers and dangling images.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowPruneModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                CANCEL
              </button>
              <button
                disabled={isPruning}
                onClick={handlePruneSystem}
                className="px-5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,42,109,0.3)] disabled:opacity-40"
              >
                {isPruning ? "PRUNING SYSTEM..." : "CONFIRM PRUNE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network & Microservice Topology Canvas Modal */}
      <NetworkTopologyStudioModal
        isOpen={showTopologyModal}
        onClose={() => setShowTopologyModal(false)}
      />
    </div>
  );
}
