"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Network,
  Server,
  Database,
  Shield,
  Bot,
  Activity,
  Zap,
  Play,
  RotateCcw,
  Download,
  X,
  Plus,
  Radio,
  FileCode,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface TopologyNode {
  id: string;
  name: string;
  type: "gateway" | "agent" | "database" | "cache" | "security" | "service";
  icon: string;
  color: string;
  x: number;
  y: number;
  port: number;
  latencyMs: number;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  rps: number;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface TopologyPreset {
  id: string;
  name: string;
  description: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
}

const PRESET_TOPOLOGIES: TopologyPreset[] = [
  {
    id: "preset-ai-mesh",
    name: "Enterprise AI Swarm & Vector Mesh",
    description: "Multi-agent autonomous coordination with SQLite-Vec HNSW embeddings and eBPF boundary isolation.",
    nodes: [
      {
        id: "node-ingress",
        name: "Traefik Ingress Gateway",
        type: "gateway",
        icon: "🌐",
        color: "#00F0FF",
        x: 60,
        y: 180,
        port: 443,
        latencyMs: 1.2,
        status: "HEALTHY",
        rps: 2450,
      },
      {
        id: "node-tech-lead",
        name: "TECH-LEAD-01 (Claude 3.7)",
        type: "agent",
        icon: "⚡",
        color: "#00FF41",
        x: 280,
        y: 100,
        port: 8080,
        latencyMs: 18.5,
        status: "HEALTHY",
        rps: 120,
      },
      {
        id: "node-sentinel",
        name: "SENTINEL-LEAD (Hermes 3)",
        type: "security",
        icon: "🛡️",
        color: "#FF2A6D",
        x: 280,
        y: 260,
        port: 3000,
        latencyMs: 4.1,
        status: "HEALTHY",
        rps: 890,
      },
      {
        id: "node-vec-db",
        name: "Postgres Vector DB (HNSW)",
        type: "database",
        icon: "🗄️",
        color: "#BF40FF",
        x: 520,
        y: 100,
        port: 5432,
        latencyMs: 3.2,
        status: "HEALTHY",
        rps: 1840,
      },
      {
        id: "node-redis",
        name: "Redis 7.4 Event Bus",
        type: "cache",
        icon: "⚡",
        color: "#FFB800",
        x: 520,
        y: 260,
        port: 6379,
        latencyMs: 0.8,
        status: "HEALTHY",
        rps: 4200,
      },
    ],
    links: [
      { id: "l1", source: "node-ingress", target: "node-tech-lead", label: "Agent REST/JSON" },
      { id: "l2", source: "node-ingress", target: "node-sentinel", label: "eBPF Probe" },
      { id: "l3", source: "node-tech-lead", target: "node-vec-db", label: "Vector Search" },
      { id: "l4", source: "node-sentinel", target: "node-redis", label: "Audit Stream" },
      { id: "l5", source: "node-tech-lead", target: "node-redis", label: "Handoff Events" },
    ],
  },
  {
    id: "preset-k8s-stack",
    name: "Kubernetes Production Microservices",
    description: "High-throughput cluster with Auth Proxy, Redis Cache, and Next.js Core application mesh.",
    nodes: [
      {
        id: "node-ingress-k8s",
        name: "Cloudflare Edge Ingress",
        type: "gateway",
        icon: "☁️",
        color: "#00F0FF",
        x: 60,
        y: 180,
        port: 443,
        latencyMs: 2.1,
        status: "HEALTHY",
        rps: 8900,
      },
      {
        id: "node-auth-proxy",
        name: "Auth Proxy (Ed25519)",
        type: "security",
        icon: "🔒",
        color: "#FF2A6D",
        x: 270,
        y: 180,
        port: 8081,
        latencyMs: 1.5,
        status: "HEALTHY",
        rps: 8900,
      },
      {
        id: "node-next-core",
        name: "Next.js 16 Web Core",
        type: "service",
        icon: "▲",
        color: "#00FF41",
        x: 480,
        y: 100,
        port: 3000,
        latencyMs: 4.8,
        status: "HEALTHY",
        rps: 4500,
      },
      {
        id: "node-postgres-k8s",
        name: "PostgreSQL 16 Multi-AZ",
        type: "database",
        icon: "🐘",
        color: "#BF40FF",
        x: 690,
        y: 180,
        port: 5432,
        latencyMs: 2.9,
        status: "HEALTHY",
        rps: 3200,
      },
      {
        id: "node-redis-k8s",
        name: "Redis Cache Cluster",
        type: "cache",
        icon: "⚡",
        color: "#FFB800",
        x: 480,
        y: 260,
        port: 6379,
        latencyMs: 0.6,
        status: "HEALTHY",
        rps: 7100,
      },
    ],
    links: [
      { id: "k1", source: "node-ingress-k8s", target: "node-auth-proxy", label: "TLS 1.3" },
      { id: "k2", source: "node-auth-proxy", target: "node-next-core", label: "Verified JWT" },
      { id: "k3", source: "node-next-core", target: "node-postgres-k8s", label: "SQL Queries" },
      { id: "k4", source: "node-next-core", target: "node-redis-k8s", label: "Cache Read/Write" },
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NetworkTopologyStudioModal({ isOpen, onClose }: Props) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-ai-mesh");
  const [nodes, setNodes] = useState<TopologyNode[]>(PRESET_TOPOLOGIES[0].nodes);
  const [links, setLinks] = useState<TopologyLink[]>(PRESET_TOPOLOGIES[0].links);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isTrafficSpiked, setIsTrafficSpiked] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Dragging State
  const dragRef = useRef<{
    isDragging: boolean;
    nodeId: string | null;
    startX: number;
    startY: number;
    startNodeX: number;
    startNodeY: number;
  }>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0,
  });

  const handleSelectPreset = (presetId: string) => {
    cyberAudio.play("click");
    setSelectedPresetId(presetId);
    const p = PRESET_TOPOLOGIES.find((item) => item.id === presetId);
    if (p) {
      setNodes(p.nodes);
      setLinks(p.links);
      setIsTrafficSpiked(false);
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    cyberAudio.play("click");
    setActiveNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    dragRef.current = {
      isDragging: true,
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      startNodeX: node.x,
      startNodeY: node.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current.isDragging && dragRef.current.nodeId) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const id = dragRef.current.nodeId;

        setNodes((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  x: Math.max(30, Math.min(740, dragRef.current.startNodeX + dx)),
                  y: Math.max(30, Math.min(360, dragRef.current.startNodeY + dy)),
                }
              : n
          )
        );
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleToggleTrafficSpike = () => {
    cyberAudio.play("warp");
    setIsTrafficSpiked((p) => !p);
  };

  const handleInjectFault = () => {
    cyberAudio.play("error");
    setNodes((prev) =>
      prev.map((n, i) =>
        i === 1
          ? {
              ...n,
              status: n.status === "DOWN" ? "HEALTHY" : "DOWN",
              latencyMs: n.status === "DOWN" ? 18.5 : 999.0,
            }
          : n
      )
    );
  };

  const handleExportMermaid = () => {
    cyberAudio.play("chime");
    let mmd = "graph TD;\n";
    nodes.forEach((n) => {
      mmd += `  ${n.id.replace(/-/g, "_")}["${n.icon} ${n.name} (Port ${n.port})"]\n`;
    });
    links.forEach((l) => {
      mmd += `  ${l.source.replace(/-/g, "_")} -->|${l.label || ""}| ${l.target.replace(/-/g, "_")}\n`;
    });

    navigator.clipboard.writeText(mmd);
    setCopiedFormat("MERMAID");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleExportCompose = () => {
    cyberAudio.play("chime");
    let compose = "version: '3.8'\nservices:\n";
    nodes.forEach((n) => {
      compose += `  ${n.id.replace(/-/g, "_")}:\n`;
      compose += `    image: dirtynest/${n.type}:latest\n`;
      compose += `    ports:\n      - "${n.port}:${n.port}"\n`;
      compose += `    restart: always\n`;
    });

    navigator.clipboard.writeText(compose);
    setCopiedFormat("COMPOSE");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs select-none"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Network size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  NETWORK & MICROSERVICE TOPOLOGY STUDIO // <span className="text-[#00FF41]">CANVAS ENGINE</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  100% FRONTEND
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Interactive drag & drop node routing, real-time packet flow pulses & 1-click Mermaid/Compose exports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Preset Architectures & Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {PRESET_TOPOLOGIES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPresetId === preset.id
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Simulation Triggers */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTrafficSpike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                  isTrafficSpiked
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(255,184,0,0.3)] animate-pulse"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                <Zap size={13} />
                <span>{isTrafficSpiked ? "SURGE ACTIVE (+5k RPS)" : "SIMULATE SURGE"}</span>
              </button>

              <button
                onClick={handleInjectFault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-[10px] font-bold cursor-pointer"
              >
                <AlertTriangle size={13} />
                <span>INJECT FAULT</span>
              </button>
            </div>
          </div>

          {/* Interactive SVG / Canvas Topology Map */}
          <div className="relative w-full h-[400px] rounded-2xl bg-black/90 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Background Cyber Grid Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="topo-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00FF41" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo-grid)" />
            </svg>

            {/* SVG Connecting Links with Animated Packet Flow */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FF41" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {links.map((link) => {
                const src = nodes.find((n) => n.id === link.source);
                const tgt = nodes.find((n) => n.id === link.target);
                if (!src || !tgt) return null;

                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const cx1 = src.x + dx * 0.5;
                const cy1 = src.y;
                const cx2 = src.x + dx * 0.5;
                const cy2 = tgt.y;

                const pathData = `M ${src.x + 40} ${src.y + 25} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgt.x} ${tgt.y + 25}`;

                return (
                  <g key={link.id}>
                    {/* Base connection wire */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={src.status === "DOWN" || tgt.status === "DOWN" ? "#FF2A6D" : "rgba(255,255,255,0.15)"}
                      strokeWidth={src.status === "DOWN" || tgt.status === "DOWN" ? 1.5 : 2}
                      strokeDasharray={src.status === "DOWN" || tgt.status === "DOWN" ? "4 4" : undefined}
                    />

                    {/* Animated Data Packet Dot */}
                    {src.status !== "DOWN" && tgt.status !== "DOWN" && (
                      <circle
                        r={isTrafficSpiked ? 3.5 : 2.5}
                        fill={isTrafficSpiked ? "#FFB800" : "#00FF41"}
                        className="filter drop-shadow-[0_0_5px_#00FF41]"
                      >
                        <animateMotion
                          path={pathData}
                          dur={isTrafficSpiked ? "1.2s" : "2.8s"}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draggable HTML Node Cards */}
            {nodes.map((node) => {
              const isActive = activeNodeId === node.id;
              const isDown = node.status === "DOWN";

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  style={{
                    position: "absolute",
                    left: node.x,
                    top: node.y,
                    borderColor: isDown ? "#FF2A6D" : isActive ? node.color : "rgba(255, 255, 255, 0.15)",
                    boxShadow: isDown
                      ? "0 0 20px rgba(255, 42, 109, 0.3)"
                      : isActive
                      ? `0 0 25px ${node.color}35`
                      : "0 5px 15px rgba(0,0,0,0.6)",
                  }}
                  className={`cursor-move p-3 rounded-xl bg-[#090A14]/95 backdrop-blur-md border flex flex-col gap-1 w-44 select-none transition-shadow ${
                    isDown ? "border-red-500 bg-red-500/10 animate-pulse" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{node.icon}</span>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                        isDown
                          ? "bg-red-500/20 text-red-400 border-red-500/40"
                          : "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="font-bold text-white text-[11px] truncate mt-0.5">{node.name}</div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Port: {node.port}</span>
                    <span className={isDown ? "text-red-400" : "text-[#00FF41]"}>
                      {node.latencyMs}ms
                    </span>
                  </div>

                  <div className="text-[8px] text-slate-500 truncate">
                    Load: {(node.rps * (isTrafficSpiked ? 3.2 : 1)).toFixed(0)} RPS
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Code Drawer */}
          <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-4 border border-white/10 bg-[#0B0C16]">
            <div>
              <h4 className="font-bold text-white text-xs">TOPOLOGY EXPORT UTILITIES</h4>
              <p className="text-[10px] text-slate-400">
                1-Click copy formatted architecture graphs for documentation and CI/CD deployment
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMermaid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
              >
                {copiedFormat === "MERMAID" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                <span>{copiedFormat === "MERMAID" ? "COPIED MERMAID!" : "COPY MERMAID (.mmd)"}</span>
              </button>

              <button
                onClick={handleExportCompose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
              >
                {copiedFormat === "COMPOSE" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                <span>{copiedFormat === "COMPOSE" ? "COPIED COMPOSE!" : "COPY COMPOSE (.yml)"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
