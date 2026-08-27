"use client";

import { memo, useState, useEffect } from "react";
import { Server, ArrowRight, Activity, ShieldCheck, Zap, Network, Radio, Database, Cpu, Layers } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  latency: number;
  status: "OK" | "WARN" | "DOWN";
  history: number[];
}

const INITIAL_SERVICES: ServiceItem[] = [
  { id: "auth", name: "Auth Provider", category: "Core", latency: 18, status: "OK", history: [16, 18, 19, 17, 18, 18] },
  { id: "gql", name: "GraphQL Gateway", category: "API", latency: 24, status: "OK", history: [22, 25, 24, 23, 26, 24] },
  { id: "pg", name: "Postgres Cluster", category: "DB", latency: 6, status: "OK", history: [5, 6, 7, 6, 6, 6] },
  { id: "redis", name: "Redis Cache", category: "DB", latency: 2, status: "OK", history: [2, 2, 3, 2, 2, 2] },
  { id: "vector", name: "Qdrant Vector", category: "AI", latency: 32, status: "OK", history: [30, 34, 32, 31, 35, 32] },
  { id: "local_ai", name: "RTX 4090 Inference", category: "AI", latency: 85, status: "OK", history: [80, 88, 85, 82, 90, 85] },
  { id: "cdn", name: "Edge CDN", category: "Net", latency: 12, status: "OK", history: [11, 13, 12, 12, 14, 12] },
  { id: "ws", name: "Telemetry WS", category: "Net", latency: 4, status: "OK", history: [4, 4, 5, 4, 4, 4] },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 42;
  const height = 14;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80 shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Live Interactive Mesh Ping Visualizer
function LiveMeshTopologyVisualizer() {
  const [pulseOffset, setPulseOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseOffset((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Node positions in normalized coordinate space
  const nodes = [
    { id: "auth", x: 30, y: 38, label: "AUTH", col: "#00FF41" },
    { id: "gql", x: 110, y: 26, label: "GQL", col: "#00F0FF" },
    { id: "pg", x: 195, y: 30, label: "POSTGRES", col: "#BF40FF" },
    { id: "redis", x: 275, y: 38, label: "REDIS", col: "#FFB800" },
    { id: "vector", x: 45, y: 92, label: "QDRANT", col: "#FF2A6D" },
    { id: "ai", x: 125, y: 96, label: "RTX 4090", col: "#00FF41" },
    { id: "cdn", x: 205, y: 92, label: "EDGE CDN", col: "#00F0FF" },
    { id: "ws", x: 280, y: 96, label: "WS MESH", col: "#3B82F6" },
  ];

  const links = [
    [0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [5, 6], [6, 7], [2, 3], [0, 4], [3, 7]
  ];

  return (
    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 relative overflow-hidden flex-1">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-[#00F0FF] font-bold">
          <Network size={13} className="animate-spin" style={{ animationDuration: "12s" }} />
          <span>INTER-SERVICE SYNAPSE MESH TOPOLOGY</span>
        </div>
        <span className="text-[#4F536E] text-[9px]">PULSE FREQ: 20Hz • DUPLEX</span>
      </div>

      <div className="w-full h-32 sm:h-36 relative bg-black/60 rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 310 120" className="w-full h-full">
          {/* Synapse Lines */}
          {links.map(([srcIdx, tgtIdx], i) => {
            const p1 = nodes[srcIdx];
            const p2 = nodes[tgtIdx];
            return (
              <g key={`link-${i}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(255, 255, 255, 0.09)"
                  strokeWidth="1.3"
                />
                {/* Flowing Laser Photons */}
                <circle
                  cx={p1.x + (p2.x - p1.x) * (((pulseOffset * 1.2 + i * 15) % 100) / 100)}
                  cy={p1.y + (p2.y - p1.y) * (((pulseOffset * 1.2 + i * 15) % 100) / 100)}
                  r="2"
                  fill={p1.col}
                  style={{ filter: `drop-shadow(0 0 4px ${p1.col})` }}
                />
              </g>
            );
          })}

          {/* Node Points */}
          {nodes.map((n) => (
            <g key={n.id} className="cursor-pointer">
              <circle
                cx={n.x}
                cy={n.y}
                r="5"
                fill="#0A0E17"
                stroke={n.col}
                strokeWidth="1.75"
                style={{ filter: `drop-shadow(0 0 6px ${n.col})` }}
              />
              <circle cx={n.x} cy={n.y} r="2" fill={n.col} />
              <text
                x={n.x}
                y={n.y > 60 ? n.y + 14 : n.y - 8}
                textAnchor="middle"
                fontSize="7"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#9499B3"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function ServiceStatusCompact() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);

  // Live Micro-Fluctuation Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const nextLatency = Math.max(1, s.latency + delta);
          const nextHistory = [...s.history.slice(1), nextLatency];
          return { ...s, latency: nextLatency, history: nextHistory };
        })
      );
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleNavigateToApi = () => {
    cyberAudio.play("click");
    window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "api" }));
  };

  return (
    <div className="cyber-card p-5 flex flex-col justify-between gap-4 select-none font-mono h-full min-h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30">
            <Server size={16} className="text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase flex items-center gap-2">
              <span>SERVICE RADAR //</span>
              <span className="text-[#00F0FF]">LIVE MESH</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>8/8 NODES ONLINE</span>
          </span>

          <button
            onClick={handleNavigateToApi}
            className="text-[10px] text-[#00F0FF] hover:text-white bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(0,240,255,0.2)]"
          >
            <span>FULL RADAR</span>
            <ArrowRight size={10} />
          </button>
        </div>
      </div>

      {/* 8 Node Mesh Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-1.5 hover:border-[#00F0FF]/30 hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41] animate-pulse shrink-0" />
                <span className="font-bold text-[11px] text-[#F1F3F9] truncate">{svc.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
              <span className="text-[8px] text-[#9499B3] uppercase font-bold">{svc.category}</span>
              <div className="flex items-center gap-1.5">
                <MiniSparkline data={svc.history} color="#00FF41" />
                <span className="font-bold text-[10px] text-[#00FF41] font-mono">{svc.latency}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Mesh Synapse Graph */}
      <LiveMeshTopologyVisualizer />

      {/* Resource Allocation & Capacity Probes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#9499B3]">
            <span>DB POOL</span>
            <span className="text-emerald-400 font-bold">28/100</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00FF41] h-full rounded-full" style={{ width: "28%" }} />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#9499B3]">
            <span>REDIS RAM</span>
            <span className="text-cyan-400 font-bold">1.2/4.0G</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00F0FF] h-full rounded-full" style={{ width: "30%" }} />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#9499B3]">
            <span>AI VRAM</span>
            <span className="text-purple-400 font-bold">18.2/24G</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#BF40FF] h-full rounded-full" style={{ width: "75%" }} />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#9499B3]">
            <span>EDGE WS</span>
            <span className="text-amber-400 font-bold">1,420</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#FFB800] h-full rounded-full" style={{ width: "47%" }} />
          </div>
        </div>
      </div>

      {/* Cluster Health & Mesh Telemetry Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-white/10 text-[10px]">
        <div className="bg-black/30 p-2 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[8px]">THROUGHPUT</span>
          <span className="text-emerald-400 font-bold font-mono">14.2k req/s</span>
        </div>
        <div className="bg-black/30 p-2 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[8px]">GLOBAL P99</span>
          <span className="text-cyan-400 font-bold font-mono">8.4ms OPT</span>
        </div>
        <div className="bg-black/30 p-2 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[8px]">EDGE HIT</span>
          <span className="text-purple-400 font-bold font-mono">96.8%</span>
        </div>
        <div className="bg-black/30 p-2 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[8px]">CLUSTER</span>
          <span className="text-emerald-400 font-bold font-mono">99.98%</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ServiceStatusCompact);
