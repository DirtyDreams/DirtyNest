"use client";

import { memo, useState, useEffect } from "react";
import { Cpu, Database, Wifi, ShieldCheck, Activity, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SubsystemInfo {
  id: string;
  label: string;
  name: string;
  status: "OPTIMAL" | "HEALTHY" | "WARM";
  metric: string;
  latency: number;
  color: string;
  targetView: string;
}

const INITIAL_SUBSYSTEMS: SubsystemInfo[] = [
  {
    id: "ai",
    label: "AI CORE",
    name: "RTX Neural Engine & Gemini Bridge",
    status: "OPTIMAL",
    metric: "42 SKILLS",
    latency: 18,
    color: "#00FF41",
    targetView: "agents",
  },
  {
    id: "db",
    label: "DATA CLUSTER",
    name: "PostgreSQL & Qdrant Vector Mesh",
    status: "HEALTHY",
    metric: "4.2M VECTORS",
    latency: 4,
    color: "#00F0FF",
    targetView: "knowledge",
  },
  {
    id: "net",
    label: "MESH NET",
    name: "Edge CDN & Telemetry WebSockets",
    status: "OPTIMAL",
    metric: "0% LOSS",
    latency: 2,
    color: "#BF40FF",
    targetView: "api",
  },
  {
    id: "sec",
    label: "DEFENSE",
    name: "Zero-Trust RBAC & Threat Sentinel",
    status: "OPTIMAL",
    metric: "ARMED",
    latency: 1,
    color: "#FFB800",
    targetView: "control_room",
  },
];

function HeaderSubsystemsHud() {
  const [subsystems, setSubsystems] = useState<SubsystemInfo[]>(INITIAL_SUBSYSTEMS);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Micro-fluctuation simulation for live feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setSubsystems((prev) =>
        prev.map((s) => ({
          ...s,
          latency: Math.max(1, s.latency + (Math.floor(Math.random() * 3) - 1)),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClickSubsystem = (targetView: string) => {
    cyberAudio.play("click");
    window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: targetView }));
  };

  return (
    <div className="hidden 2xl:flex items-center gap-1.5 font-mono select-none">
      {subsystems.map((sub) => (
        <div key={sub.id} className="relative group/sub">
          <button
            type="button"
            onClick={() => handleClickSubsystem(sub.targetView)}
            onMouseEnter={() => setActiveTooltip(sub.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            className="h-8 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              boxShadow: activeTooltip === sub.id ? `0 0 10px ${sub.color}25` : undefined,
              borderColor: activeTooltip === sub.id ? `${sub.color}60` : undefined,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: sub.color,
                boxShadow: `0 0 6px ${sub.color}`,
              }}
            />

            <span className="text-[10px] font-bold text-[#F1F3F9] tracking-wider">
              {sub.label}
            </span>

            <span
              className="text-[9px] font-semibold px-1 py-0.2 rounded bg-black/40 border border-white/5"
              style={{ color: sub.color }}
            >
              {sub.metric}
            </span>
          </button>

          {/* High-Tech Subsystem Flyout Tooltip */}
          {activeTooltip === sub.id && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-2.5 rounded-xl z-50 animate-fade-in border border-white/15 pointer-events-none"
              style={{
                background: "rgba(10, 11, 20, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: `0 12px 30px -4px rgba(0, 0, 0, 0.9), 0 0 15px ${sub.color}20`,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: sub.color, boxShadow: `0 0 8px ${sub.color}` }}
                  />
                  <span className="text-[11px] font-black text-white">{sub.label}</span>
                </div>
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded border"
                  style={{
                    color: sub.color,
                    borderColor: `${sub.color}40`,
                    backgroundColor: `${sub.color}15`,
                  }}
                >
                  {sub.status}
                </span>
              </div>

              <p className="text-[9px] text-[#9499B3] mb-2 leading-relaxed">{sub.name}</p>

              <div className="grid grid-cols-2 gap-1.5 text-[9px] pt-1.5 border-t border-white/5">
                <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[7px] text-[#4F536E]">LATENCY</span>
                  <span className="font-bold font-mono" style={{ color: sub.color }}>
                    {sub.latency}ms
                  </span>
                </div>
                <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[7px] text-[#4F536E]">HEALTH</span>
                  <span className="font-bold text-[#00FF41] font-mono">99.9%</span>
                </div>
              </div>

              <div className="mt-2 text-[8px] text-[#00F0FF] flex items-center justify-between font-bold">
                <span>CLICK TO DIAGNOSE</span>
                <ChevronRight size={10} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(HeaderSubsystemsHud);
