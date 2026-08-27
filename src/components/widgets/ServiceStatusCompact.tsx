"use client";

import { memo, useState, useEffect } from "react";
import { Server, ArrowRight, Activity, ShieldCheck, Zap, Network, Radio } from "lucide-react";
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
  const width = 38;
  const height = 12;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-70 shrink-0">
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
    <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between gap-3.5 select-none font-mono h-full min-h-[330px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30">
            <Server size={15} className="text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase flex items-center gap-2">
              <span>SERVICE RADAR //</span>
              <span className="text-[#00F0FF]">LIVE MESH</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>8/8 NODES</span>
          </span>

          <button
            onClick={handleNavigateToApi}
            className="text-[10px] text-[#00F0FF] hover:text-white bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold transition-all"
          >
            <span>FULL RADAR</span>
            <ArrowRight size={10} />
          </button>
        </div>
      </div>

      {/* 8 Node Mesh Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
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
              <span className="text-[9px] text-[#9499B3] uppercase font-bold">{svc.category}</span>
              <div className="flex items-center gap-1.5">
                <MiniSparkline data={svc.history} color="#00FF41" />
                <span className="font-bold text-[11px] text-[#00FF41] font-mono">{svc.latency}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster Health & Mesh Telemetry Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-white/10 text-[10px]">
        <div className="bg-black/30 p-1.5 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[9px]">MESH THROUGHPUT</span>
          <span className="text-emerald-400 font-bold font-mono">14.2k req/s</span>
        </div>
        <div className="bg-black/30 p-1.5 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[9px]">GLOBAL P99</span>
          <span className="text-cyan-400 font-bold font-mono">8.4ms OPT</span>
        </div>
        <div className="bg-black/30 p-1.5 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[9px]">EDGE CACHE HIT</span>
          <span className="text-purple-400 font-bold font-mono">96.8%</span>
        </div>
        <div className="bg-black/30 p-1.5 rounded-lg border border-white/5 flex flex-col">
          <span className="text-slate-500 text-[9px]">CLUSTER HEALTH</span>
          <span className="text-emerald-400 font-bold font-mono">99.98%</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ServiceStatusCompact);
