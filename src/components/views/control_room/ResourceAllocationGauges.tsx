"use client";

import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi, Activity, Sparkles } from "lucide-react";

interface GaugeData {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  color: string;
  unit: string;
}

function MiniGauge({
  value,
  color,
  size = 76,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.8s ease-in-out",
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }}
      />
    </svg>
  );
}

export default function ResourceAllocationGauges() {
  const [gauges, setGauges] = useState<GaugeData[]>([
    { id: "cpu", label: "CPU Core Load", sublabel: "Hermes Thread Pool", value: 38, color: "#00FF41", unit: "%" },
    { id: "vram", label: "CUDA VRAM Reserve", sublabel: "RTX 4090 (24 GB)", value: 74, color: "#BF40FF", unit: "%" },
    { id: "ram", label: "Isolate Heap RAM", sublabel: "Node/V8 Memory", value: 46, color: "#00F0FF", unit: "%" },
    { id: "net", label: "Cluster I/O Mesh", sublabel: "Telemetry Ingress", value: 29, color: "#FFB800", unit: "%" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGauges((prev) =>
        prev.map((g) => {
          const delta = Math.floor(Math.random() * 8 - 4);
          const newVal = Math.min(96, Math.max(12, g.value + delta));
          return { ...g, value: newVal };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Cpu size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              HARNESS RESOURCE ALLOCATION // <span className="text-[#00FF41]">HARDWARE TELEMETRY</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Hardware offloading, VRAM reserve, and V8 isolate allocations
            </p>
          </div>
        </div>

        <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          HEALTHY (ALL PROBES PASS)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gauges.map((g) => (
          <div
            key={g.id}
            className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center gap-2 hover:border-white/15 transition-all"
          >
            <div className="relative flex items-center justify-center">
              <MiniGauge value={g.value} color={g.color} size={72} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-[#F1F3F9] leading-none">
                  {g.value}
                </span>
                <span className="text-[8px] text-[#4F536E] font-bold">{g.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">{g.label}</span>
              <span className="text-[9px] text-[#4F536E] block mt-0.5">{g.sublabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
