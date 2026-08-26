"use client";

import { useState, useEffect } from "react";
import { Server, Wifi, CheckCircle2, ArrowRight } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  latency: number;
  status: "OK" | "WARN" | "DOWN";
}

const SERVICES: ServiceItem[] = [
  { id: "auth", name: "Auth Provider", category: "Core", latency: 18, status: "OK" },
  { id: "gql", name: "GraphQL Gateway", category: "API", latency: 24, status: "OK" },
  { id: "pg", name: "Postgres Cluster", category: "DB", latency: 6, status: "OK" },
  { id: "redis", name: "Redis Cache", category: "DB", latency: 2, status: "OK" },
  { id: "vector", name: "Qdrant Vector", category: "AI", latency: 32, status: "OK" },
  { id: "local_ai", name: "RTX 4090 Inference", category: "AI", latency: 85, status: "OK" },
  { id: "cdn", name: "Edge CDN", category: "Net", latency: 12, status: "OK" },
  { id: "ws", name: "Telemetry WS", category: "Net", latency: 4, status: "OK" },
];

export default function ServiceStatusCompact() {
  const [services, setServices] = useState(SERVICES);

  const handleNavigateToApi = () => {
    cyberAudio.play("click");
    window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "api" }));
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3.5 select-none font-mono">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-[#00F0FF]" />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            SERVICE RADAR // <span className="text-[#00F0FF]">LIVE MESH</span>
          </h3>
        </div>

        <button
          onClick={handleNavigateToApi}
          className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
        >
          <span>VIEW FULL RADAR</span>
          <ArrowRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-1.5 hover:border-white/15 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41] animate-pulse shrink-0" />
                <span className="font-bold text-xs text-[#F1F3F9] truncate">{svc.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
              <span className="text-[#4F536E] uppercase">{svc.category}</span>
              <span className="font-bold text-[#00FF41] font-mono">{svc.latency}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
