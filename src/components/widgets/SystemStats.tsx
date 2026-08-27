"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Cpu, HardDrive, Wifi, MemoryStick, Activity } from "lucide-react";

interface StatData {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  glowColor: string;
  unit: string;
  history: number[];
}

function CircularGauge({
  value,
  color,
  glowColor,
  size = 86,
}: {
  value: number;
  color: string;
  glowColor: string;
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
        stroke="rgba(255, 255, 255, 0.05)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
    </svg>
  );
}

function SparklineArea({
  data,
  color,
  glowColor,
  width = 96,
  height = 26,
  id,
}: {
  data: number[];
  color: string;
  glowColor: string;
  width?: number;
  height?: number;
  id: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
      />
    </svg>
  );
}

function SystemStats() {
  const [stats, setStats] = useState<StatData[]>([
    {
      id: "cpu",
      label: "CPU",
      sublabel: "8 Cores @ 3.8 GHz",
      value: 48,
      icon: Cpu,
      color: "#00FF41",
      glowColor: "rgba(0, 255, 65, 0.6)",
      unit: "%",
      history: [30, 42, 38, 55, 48, 62, 50, 44, 48],
    },
    {
      id: "mem",
      label: "MEMORY",
      sublabel: "11.2 / 16.0 GB",
      value: 70,
      icon: MemoryStick,
      color: "#BF40FF",
      glowColor: "rgba(191, 64, 255, 0.6)",
      unit: "%",
      history: [65, 66, 68, 70, 69, 72, 70, 71, 70],
    },
    {
      id: "disk",
      label: "STORAGE",
      sublabel: "NVMe 1.4 TB / 2.0 TB",
      value: 72,
      icon: HardDrive,
      color: "#00F0FF",
      glowColor: "rgba(0, 240, 255, 0.6)",
      unit: "%",
      history: [72, 72, 72, 72, 72, 72, 72, 72, 72],
    },
    {
      id: "net",
      label: "BANDWIDTH",
      sublabel: "▲ 14.2 MB/s  ▼ 42.8 MB/s",
      value: 36,
      icon: Wifi,
      color: "#FFB800",
      glowColor: "rgba(255, 184, 0, 0.6)",
      unit: "Mb/s",
      history: [12, 28, 45, 30, 52, 40, 32, 48, 36],
    },
  ]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          if (s.id === "disk") return s; // Disk rarely jumps randomly
          const delta = (Math.random() - 0.5) * 16;
          const newValue = Math.max(8, Math.min(96, Math.round(s.value + delta)));
          const newHistory = [...s.history.slice(-14), newValue];
          return { ...s, value: newValue, history: newHistory };
        })
      );
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="cyber-card p-5 relative flex flex-col justify-between gap-3.5 h-full min-h-[330px]">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Activity size={15} className="icon" />
        <h3>Hardware Telemetry</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/20">
            POLL: 2.5s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="flex flex-col items-center p-3 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
            >
              <div className="relative mb-2">
                <CircularGauge
                  value={stat.value}
                  color={stat.color}
                  glowColor={stat.glowColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-xl font-mono font-black tracking-tight"
                    style={{
                      color: stat.color,
                      textShadow: `0 0 10px ${stat.glowColor}`,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[9px] font-mono text-[#9499B3] uppercase">
                    {stat.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={14} className="shrink-0" style={{ color: stat.color }} />
                <span className="text-xs font-mono font-bold text-[#F1F3F9] tracking-wider">
                  {stat.label}
                </span>
              </div>

              <span className="text-[10px] font-mono text-[#4F536E] truncate max-w-full mb-2">
                {stat.sublabel}
              </span>

              <SparklineArea
                data={stat.history}
                color={stat.color}
                glowColor={stat.glowColor}
                id={stat.id}
                width={100}
                height={22}
              />
            </div>
          );
        })}
      </div>

      {/* GPU & Thermal Quick Metrics Strip */}
      <div className="pt-2.5 sm:pt-3 border-t border-white/5 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[9px] sm:text-[10px] font-mono">
        <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
          <span className="text-[#4F536E] block truncate text-[8px] sm:text-[9px]">GPU VRAM</span>
          <span className="font-bold text-[#BF40FF] mt-0.5 block truncate">18.2/24G</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
          <span className="text-[#4F536E] block truncate text-[8px] sm:text-[9px]">DIE TEMP</span>
          <span className="font-bold text-[#00FF41] mt-0.5 block truncate">54°C OPT</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
          <span className="text-[#4F536E] block truncate text-[8px] sm:text-[9px]">SWAP LOAD</span>
          <span className="font-bold text-[#00F0FF] mt-0.5 block truncate">0.8/8.0G</span>
        </div>
      </div>
    </div>
  );
}

export default memo(SystemStats);
