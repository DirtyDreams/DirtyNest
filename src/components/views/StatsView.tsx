"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Download,
  Clock,
  TrendingUp,
  Flame,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Server,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function StatsView() {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [exportCopied, setExportCopied] = useState(false);

  // Time-series mock points
  const cpuPoints = [32, 45, 68, 54, 42, 60, 78, 64, 49, 58, 72, 64];
  const memPoints = [40, 42, 45, 48, 52, 55, 58, 62, 60, 64, 65, 66];
  const netPoints = [12, 18, 45, 80, 60, 40, 95, 110, 85, 70, 90, 105];
  const gpuPoints = [20, 22, 50, 75, 60, 45, 80, 85, 70, 60, 75, 82];

  const handleExportData = () => {
    cyberAudio.play("chime");
    const data = {
      timestamp: new Date().toISOString(),
      cluster: "dirtynest-core-node-01",
      sla_percent: 99.98,
      metrics: {
        avg_cpu_load: "56.4%",
        peak_memory_mb: 11240,
        network_ingress_mb: 1420.5,
        gpu_vram_allocated_gb: 18.2,
      },
      latency_percentiles_ms: {
        p50: 18.2,
        p90: 45.1,
        p99: 120.4,
      },
      accumulated_costs_usd: {
        gemini_flash: 1.42,
        claude_sonnet: 8.90,
        gpt4o: 14.20,
        local_gpu_power: 3.10,
        total: 27.62,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dirtynest-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const renderSvgSparkline = (points: number[], color: string, fillHex: string) => {
    const min = 0;
    const max = 120;
    const width = 280;
    const height = 60;
    const step = width / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = idx * step;
      const y = height - (p / max) * height;
      return `${x},${y}`;
    });

    const pathStr = `M ${coords.join(" L ")}`;
    const areaStr = `${pathStr} L ${width},${height} L 0,${height} Z`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaStr} fill={`url(#grad-${color})`} stroke="none" />
        <path d={pathStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, idx) => {
          const x = idx * step;
          const y = height - (p / max) * height;
          return <circle key={idx} cx={x} cy={y} r="3" fill={color} className="animate-pulse" />;
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP STATS HUD */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(191,64,255,0.25) 0%, rgba(0,255,65,0.2) 100%)",
                border: "1px solid rgba(191,64,255,0.4)",
                boxShadow: "0 0 16px rgba(191,64,255,0.3)",
              }}
            >
              <Activity size={20} className="text-[#BF40FF]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  ANALYTICS & METRICS // <span className="text-[#BF40FF]">TELEMETRY MATRIX</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                  99.98% SLA UPTIME
                </span>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 hidden sm:inline">
                  PROMETHEUS TIME-SERIES
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Cluster performance telemetry · Token burn rates · Latency percentiles & Provider cost distribution
              </span>
            </div>
          </div>

          {/* Time Range Selector & Export */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
              {(["1h", "6h", "24h", "7d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    cyberAudio.play("click");
                    setTimeRange(r);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? "bg-[#BF40FF]/20 text-[#BF40FF] font-bold border border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                      : "text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Download size={14} />
              <span>{exportCopied ? "DOWNLOADED" : "EXPORT JSON"}</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-3.5 border-t border-white/5">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Average Latency (p50)</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">18.2 ms</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Tail Latency (p99)</span>
            <span className="text-sm font-bold text-[#FFB800] mt-0.5">120.4 ms</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Token Ingestion Rate</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">4.8k tok / min</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Network Ingress</span>
            <span className="text-sm font-bold text-[#BF40FF] mt-0.5">1,420 MB</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">GPU VRAM Used</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">18.2 / 24 GB</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Total Cost (24h)</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">$27.62 USD</span>
          </div>
        </div>
      </div>

      {/* 4 TIME-SERIES SPARKLINES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F1F3F9]">CPU Core Utilization</span>
            <span className="text-xs font-black text-[#00FF41]">64.2%</span>
          </div>
          {renderSvgSparkline(cpuPoints, "#00FF41", "rgba(0,255,65,0.1)")}
        </div>

        <div className="cyber-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F1F3F9]">Cluster RAM Pool</span>
            <span className="text-xs font-black text-[#00F0FF]">66.4%</span>
          </div>
          {renderSvgSparkline(memPoints, "#00F0FF", "rgba(0,240,255,0.1)")}
        </div>

        <div className="cyber-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F1F3F9]">Network Throughput (MB/s)</span>
            <span className="text-xs font-black text-[#BF40FF]">105 MB/s</span>
          </div>
          {renderSvgSparkline(netPoints, "#BF40FF", "rgba(191,64,255,0.1)")}
        </div>

        <div className="cyber-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F1F3F9]">GPU VRAM Workload</span>
            <span className="text-xs font-black text-[#FFB800]">82.1%</span>
          </div>
          {renderSvgSparkline(gpuPoints, "#FFB800", "rgba(255,184,0,0.1)")}
        </div>
      </div>

      {/* DETAILED STATS & COST MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LATENCY PERCENTILES (6 Cols) */}
        <div className="lg:col-span-6 cyber-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#00FF41]" />
              <h3 className="text-sm font-black text-[#F1F3F9]">LATENCY PERCENTILE DISTRIBUTION</h3>
            </div>
            <span className="text-xs text-[#00F0FF] font-bold">14,820 SAMPLES</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#9499B3]">p50 (Median Response Time)</span>
              <strong className="text-[#00FF41] font-mono text-sm">18.2 ms</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#9499B3]">p90 (High Load Requests)</span>
              <strong className="text-[#00F0FF] font-mono text-sm">45.1 ms</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#9499B3]">p95 (Complex Agent Swarms)</span>
              <strong className="text-[#BF40FF] font-mono text-sm">78.6 ms</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#9499B3]">p99 (Peak Outlier Worst-Case)</span>
              <strong className="text-[#FFB800] font-mono text-sm">120.4 ms</strong>
            </div>
          </div>
        </div>

        {/* ACCUMULATED PROVIDER COST MATRIX (6 Cols) */}
        <div className="lg:col-span-6 cyber-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-[#00F0FF]" />
              <h3 className="text-sm font-black text-[#F1F3F9]">INFERENCE COST ACCUMULATION</h3>
            </div>
            <span className="text-xs text-[#00FF41] font-bold">$27.62 / 24H</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[#F1F3F9]">Gemini 2.5 Flash</span>
                <span className="text-[10px] text-[#4F536E]">18.9M Tokens processed</span>
              </div>
              <span className="text-[#00FF41] font-mono font-bold">$1.42</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[#F1F3F9]">Claude 3.7 Sonnet (Thinking)</span>
                <span className="text-[10px] text-[#4F536E]">2.96M Tokens processed</span>
              </div>
              <span className="text-[#BF40FF] font-mono font-bold">$8.90</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[#F1F3F9]">GPT-4o Omniscience</span>
                <span className="text-[10px] text-[#4F536E]">5.68M Tokens processed</span>
              </div>
              <span className="text-[#00F0FF] font-mono font-bold">$14.20</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[#F1F3F9]">Local GPU Hardware Power (RTX 4090)</span>
                <span className="text-[10px] text-[#4F536E]">12.4 kWh @ $0.25/kWh</span>
              </div>
              <span className="text-[#FFB800] font-mono font-bold">$3.10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
