"use client";

import { useState, useEffect, useMemo } from "react";
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
  Radio,
  Network,
  Bot,
  Database,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Filter,
  Play,
  Pause,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import PromQlQueryBuilder from "./stats/PromQlQueryBuilder";
import CpuCoreHeatmap from "./stats/CpuCoreHeatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

type TelemetryTab = "cluster" | "promql" | "llm" | "api" | "agents" | "security";

export default function StatsView() {
  const [activeTab, setActiveTab] = useState<TelemetryTab>("cluster");
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d" | "30d">("24h");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [exportCopied, setExportCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>("all");

  // Simulated live fluctuating telemetry tick
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Dynamic time-series data with subtle fluctuations based on tick
  const cpuPoints = useMemo(() => [32, 45, 68, 54, 42, 60, 78, 64, 49, 58, 72, 64 + (tick % 7) - 3], [tick]);
  const memPoints = useMemo(() => [40, 42, 45, 48, 52, 55, 58, 62, 60, 64, 65, 66 + (tick % 5) - 2], [tick]);
  const netPoints = useMemo(() => [12, 18, 45, 80, 60, 40, 95, 110, 85, 70, 90, 105 + (tick % 12) - 6], [tick]);
  const gpuPoints = useMemo(() => [20, 22, 50, 75, 60, 45, 80, 85, 70, 60, 75, 82 + (tick % 6) - 3], [tick]);

  const handleExportData = () => {
    cyberAudio.play("chime");
    const data = {
      exported_at: new Date().toISOString(),
      active_tab: activeTab,
      time_range: timeRange,
      cluster_health: "OPTIMAL",
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
    a.download = `dirtynest-telemetry-${activeTab}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const renderSvgSparkline = (points: number[], color: string, fillHex: string) => {
    const min = 0;
    const max = 130;
    const width = 280;
    const height = 64;
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
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaStr} fill={`url(#grad-${color})`} stroke="none" />
        <path d={pathStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, idx) => {
          const x = idx * step;
          const y = height - (p / max) * height;
          return <circle key={idx} cx={x} cy={y} r={idx === points.length - 1 ? 4 : 2.5} fill={color} className={idx === points.length - 1 ? "animate-ping" : ""} />;
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
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
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                  99.98% SLA
                </span>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 hidden sm:inline">
                  PROMETHEUS ENGINE
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Multi-node telemetry · Token ingestion rates · Latency percentiles & AI compute distribution
              </span>
            </div>
          </div>

          {/* Controls: Live Stream Toggle, Time Range, Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Stream Toggle */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsLiveStreaming(!isLiveStreaming);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isLiveStreaming
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "bg-white/[0.03] border-white/10 text-[#9499B3]"
              }`}
              title="Toggle Live Stream Simulation"
            >
              {isLiveStreaming ? <Pause size={13} /> : <Play size={13} />}
              <span>{isLiveStreaming ? "STREAMING" : "PAUSED"}</span>
            </button>

            {/* Time Range Selector */}
            <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
              {(["1h", "6h", "24h", "7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    cyberAudio.play("click");
                    setTimeRange(r);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? "bg-[#BF40FF]/20 text-[#BF40FF] font-bold border border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                      : "text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Export JSON */}
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">{exportCopied ? "SAVED" : "EXPORT"}</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION STRIP */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("cluster");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "cluster"
                ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Server size={14} />
            <span>CLUSTER HARDWARE</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("promql");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "promql"
                ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#00FF41]"
            }`}
          >
            <Activity size={14} />
            <span>PROMQL SIMULATOR</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("llm");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "llm"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Zap size={14} />
            <span>LLM & INFERENCE</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("api");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "api"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] border-[#BF40FF]/40 shadow-[0_0_10px_rgba(191,64,255,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Network size={14} />
            <span>API & GATEWAYS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("agents");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "agents"
                ? "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Bot size={14} />
            <span>AGENT SWARM</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("security");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "security"
                ? "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <ShieldAlert size={14} />
            <span>SECURITY & AUDIT</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CLUSTER HARDWARE & PERFORMANCE                     */}
      {/* ========================================================= */}
      {activeTab === "cluster" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* 4 TIME-SERIES SPARKLINES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cyber-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={15} className="text-[#00FF41]" />
                  <span className="text-xs font-bold text-[#F1F3F9]">CPU Core Load</span>
                </div>
                <span className="text-xs font-black text-[#00FF41] flex items-center">
                  <NumberFlow value={cpuPoints[cpuPoints.length - 1]} />%
                </span>
              </div>
              {renderSvgSparkline(cpuPoints, "#00FF41", "rgba(0,255,65,0.1)")}
              <div className="flex items-center justify-between text-[10px] text-[#4F536E] pt-1 border-t border-white/5">
                <span>8 CORES @ 3.8 GHz</span>
                <span>PEAK: 84.1%</span>
              </div>
            </div>

            <div className="cyber-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-[#00F0FF]" />
                  <span className="text-xs font-bold text-[#F1F3F9]">RAM Pool</span>
                </div>
                <span className="text-xs font-black text-[#00F0FF] flex items-center">
                  <NumberFlow value={memPoints[memPoints.length - 1]} />%
                </span>
              </div>
              {renderSvgSparkline(memPoints, "#00F0FF", "rgba(0,240,255,0.1)")}
              <div className="flex items-center justify-between text-[10px] text-[#4F536E] pt-1 border-t border-white/5">
                <span>11.2 / 16.0 GB</span>
                <span>SWAP: 1.2 GB</span>
              </div>
            </div>

            <div className="cyber-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi size={15} className="text-[#BF40FF]" />
                  <span className="text-xs font-bold text-[#F1F3F9]">Throughput</span>
                </div>
                <span className="text-xs font-black text-[#BF40FF] flex items-center">
                  <NumberFlow value={netPoints[netPoints.length - 1]} /> MB/s
                </span>
              </div>
              {renderSvgSparkline(netPoints, "#BF40FF", "rgba(191,64,255,0.1)")}
              <div className="flex items-center justify-between text-[10px] text-[#4F536E] pt-1 border-t border-white/5">
                <span>TX: 42.8 MB/s</span>
                <span>RX: 62.2 MB/s</span>
              </div>
            </div>

            <div className="cyber-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-amber-400" />
                  <span className="text-xs font-bold text-[#F1F3F9]">GPU VRAM (CUDA)</span>
                </div>
                <span className="text-xs font-black text-amber-400 flex items-center">
                  <NumberFlow value={gpuPoints[gpuPoints.length - 1]} />%
                </span>
              </div>
              {renderSvgSparkline(gpuPoints, "#FFB800", "rgba(255,184,0,0.1)")}
              <div className="flex items-center justify-between text-[10px] text-[#4F536E] pt-1 border-t border-white/5">
                <span>18.2 / 24 GB</span>
                <span>TEMP: 54°C</span>
              </div>
            </div>
          </div>

          {/* NODE BREAKDOWN TABLE & HARDWARE METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Cluster Nodes (8 cols) */}
            <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-[#00FF41]" />
                  <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                    Cluster Node Matrix
                  </h3>
                </div>
                <span className="text-[10px] text-[#00FF41] font-bold">4 NODES SYNCED</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: "node-01-core-main", role: "Primary Orchestrator", cpu: 42, ram: 68, gpu: "RTX 4090", status: "HEALTHY", ip: "192.168.1.10" },
                  { name: "node-02-worker-agents", role: "Agent Swarm Engine", cpu: 78, ram: 84, gpu: "RTX 3090", status: "HIGH_LOAD", ip: "192.168.1.11" },
                  { name: "node-03-db-vector", role: "Vector Knowledge DB", cpu: 28, ram: 52, gpu: "N/A", status: "HEALTHY", ip: "192.168.1.12" },
                  { name: "node-04-edge-gateway", role: "API Edge Proxy", cpu: 18, ram: 34, gpu: "N/A", status: "HEALTHY", ip: "192.168.1.13" },
                ].map((node) => (
                  <div
                    key={node.name}
                    className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs hover:border-white/20 transition-all gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${node.status === "HEALTHY" ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-amber-400 shadow-[0_0_6px_#f59e0b]"} animate-pulse`} />
                      <div className="flex flex-col">
                        <span className="font-bold text-[#F1F3F9]">{node.name}</span>
                        <span className="text-[10px] text-[#4F536E]">{node.role} • {node.ip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#4F536E]">CPU</span>
                        <span className={`font-bold ${node.cpu > 70 ? "text-amber-400" : "text-[#00FF41]"}`}>{node.cpu}%</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#4F536E]">RAM</span>
                        <span className="font-bold text-[#00F0FF]">{node.ram}%</span>
                      </div>
                      <div className="flex flex-col text-right hidden sm:flex">
                        <span className="text-[10px] text-[#4F536E]">ACCEL</span>
                        <span className="text-[11px] text-[#9499B3]">{node.gpu}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage & I/O Telemetry (4 cols) */}
            <div className="lg:col-span-4 cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-[#00F0FF]" />
                  <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                    Storage NVMe I/O
                  </h3>
                </div>
                <span className="text-[10px] text-[#00F0FF] font-bold">1.4 / 2.0 TB</span>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-[#9499B3]">Root NVMe Array</span>
                    <span className="text-[#00FF41] font-bold">72% Used</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00FF41] to-[#00F0FF] rounded-full" style={{ width: "72%" }} />
                  </div>
                  <span className="text-[10px] text-[#4F536E]">1,440 GB used · 560 GB free</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[#9499B3]">Read IOPS</span>
                  <span className="text-[#00FF41] font-bold font-mono">14,280 IOPS</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[#9499B3]">Write IOPS</span>
                  <span className="text-[#00F0FF] font-bold font-mono">6,840 IOPS</span>
                </div>
              </div>
            </div>
          </div>

          {/* PER-CORE THERMAL & VOLTAGE HEATMAP MATRIX */}
          <CpuCoreHeatmap />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: PROMQL INTERACTIVE VECTOR QUERY LAB                  */}
      {/* ========================================================= */}
      {activeTab === "promql" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <PromQlQueryBuilder />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LLM INFERENCE & TOKEN BURN                         */}
      {/* ========================================================= */}
      {activeTab === "llm" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Top Token & Cost Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="cyber-card p-3.5 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Total Tokens Ingested</span>
              <span className="text-lg font-black text-[#00FF41] mt-1">27.54M</span>
              <span className="text-[9px] text-[#00FF41]/80">+14.2% from yesterday</span>
            </div>

            <div className="cyber-card p-3.5 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Tokens Generated</span>
              <span className="text-lg font-black text-[#00F0FF] mt-1">4.82M</span>
              <span className="text-[9px] text-[#00F0FF]/80">Avg speed 82 tok/sec</span>
            </div>

            <div className="cyber-card p-3.5 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Accumulated 24h Spend</span>
              <span className="text-lg font-black text-amber-400 mt-1">$27.62 USD</span>
              <span className="text-[9px] text-amber-400/80">Within budget limit ($50/day)</span>
            </div>

            <div className="cyber-card p-3.5 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Cache Hit Ratio</span>
              <span className="text-lg font-black text-[#BF40FF] mt-1">68.4%</span>
              <span className="text-[9px] text-[#BF40FF]/80">Saved ~$18.40 via Context Cache</span>
            </div>
          </div>

          {/* Model Breakdown Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#00F0FF]" />
                  <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                    Model Provider Utilization Breakdown
                  </h3>
                </div>
                <span className="text-[10px] text-[#00F0FF] font-bold">4 ACTIVE MODELS</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Gemini 2.5 Flash", provider: "Google DeepMind", tokens: "18.9M", cost: "$1.42", latency: "240ms", color: "#00FF41", pct: 68 },
                  { name: "Claude 3.7 Sonnet (Thinking)", provider: "Anthropic", tokens: "2.96M", cost: "$8.90", latency: "1,240ms", color: "#BF40FF", pct: 15 },
                  { name: "GPT-4o Omniscience", provider: "OpenAI", tokens: "5.68M", cost: "$14.20", latency: "680ms", color: "#00F0FF", pct: 20 },
                  { name: "Ollama / Qwen-2.5-Coder 32B", provider: "Local GPU (RTX 4090)", tokens: "4.10M", cost: "$3.10", latency: "110ms", color: "#FFB800", pct: 28 },
                ].map((m) => (
                  <div key={m.name} className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                        <span className="font-bold text-[#F1F3F9]">{m.name}</span>
                        <span className="text-[10px] text-[#4F536E]">({m.provider})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[#9499B3]">{m.tokens} tok</span>
                        <span className="font-bold" style={{ color: m.color }}>{m.cost}</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#4F536E]">
                      <span>Avg Latency: {m.latency}</span>
                      <span>Share: {m.pct}% of requests</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Window & Caching Telemetry */}
            <div className="lg:col-span-4 cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#BF40FF]" />
                  <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                    Context Cache Efficiency
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                  <span className="text-[#9499B3]">Cached Prompt Tokens</span>
                  <span className="text-base font-bold text-[#00FF41]">12.8M Tokens</span>
                  <span className="text-[10px] text-[#4F536E]">Reduced token compute cost by 75%</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                  <span className="text-[#9499B3]">Prompt Caching Latency Boost</span>
                  <span className="text-base font-bold text-[#00F0FF]">3.4x Faster TTFT</span>
                  <span className="text-[10px] text-[#4F536E]">Time-to-first-token reduced from 840ms to 240ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: API & GATEWAY PERCENTILES                          */}
      {/* ========================================================= */}
      {activeTab === "api" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Latency Percentiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Median Latency (p50)</span>
              <span className="text-xl font-black text-[#00FF41] mt-1">18.2 ms</span>
              <span className="text-[9px] text-[#4F536E]">Optimal baseline</span>
            </div>

            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">p90 Response Time</span>
              <span className="text-xl font-black text-[#00F0FF] mt-1">45.1 ms</span>
              <span className="text-[9px] text-[#4F536E]">High concurrency load</span>
            </div>

            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">p95 Agent Reasoning</span>
              <span className="text-xl font-black text-[#BF40FF] mt-1">78.6 ms</span>
              <span className="text-[9px] text-[#4F536E]">Complex agent workflows</span>
            </div>

            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Worst-Case Tail (p99)</span>
              <span className="text-xl font-black text-amber-400 mt-1">120.4 ms</span>
              <span className="text-[9px] text-[#4F536E]">Outlier requests</span>
            </div>
          </div>

          {/* API Endpoints Health Table */}
          <div className="cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Service Gateway Status & Traffic
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF41] font-bold">ALL ENDPOINTS OPERATIONAL</span>
            </div>

            <div className="space-y-2">
              {[
                { path: "GET /api/v1/telemetry/live", requests: "148.2k", p99: "14ms", errorRate: "0.00%", status: "200 OK" },
                { path: "POST /api/v1/agents/execute", requests: "12.4k", p99: "840ms", errorRate: "0.02%", status: "200 OK" },
                { path: "GET /api/v1/docker/containers", requests: "38.6k", p99: "28ms", errorRate: "0.00%", status: "200 OK" },
                { path: "POST /api/v1/auth/verify-token", requests: "94.1k", p99: "8ms", errorRate: "0.00%", status: "200 OK" },
                { path: "WS /ws/mesh/control-room", requests: "Active (48 streams)", p99: "2ms", errorRate: "0.00%", status: "CONNECTED" },
              ].map((ep) => (
                <div key={ep.path} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs hover:border-white/15 gap-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-bold">
                      {ep.status}
                    </span>
                    <span className="font-bold text-[#F1F3F9]">{ep.path}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[#4F536E]">24H VOLUME</span>
                      <span className="text-[#00F0FF]">{ep.requests}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[#4F536E]">p99 LATENCY</span>
                      <span className="text-[#00FF41]">{ep.p99}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[#4F536E]">ERRORS</span>
                      <span className="text-[#9499B3]">{ep.errorRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AGENT SWARM RUNTIME TELEMETRY                      */}
      {/* ========================================================= */}
      {activeTab === "agents" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                id: "hermes",
                name: "Hermes Agent Core",
                role: "Research & Synthesis",
                runs: 1420,
                successRate: "99.4%",
                avgTime: "3.4s",
                toolsUsed: ["web_search", "fetch_url", "mcp_index"],
                color: "#00FF41",
              },
              {
                id: "pi",
                name: "Pi Code Engine",
                role: "Architecture & Refactoring",
                runs: 840,
                successRate: "98.8%",
                avgTime: "6.8s",
                toolsUsed: ["ast_grep", "git_apply", "typecheck"],
                color: "#00F0FF",
              },
              {
                id: "codex",
                name: "Codex Automation",
                role: "Docker & CI/CD Pipelines",
                runs: 620,
                successRate: "100.0%",
                avgTime: "2.1s",
                toolsUsed: ["docker_exec", "compose_up", "healthcheck"],
                color: "#BF40FF",
              },
            ].map((agent) => (
              <div key={agent.id} className="cyber-card p-5 flex flex-col gap-3 border" style={{ borderColor: `${agent.color}30` }}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: agent.color }} />
                    <span className="font-bold text-xs text-[#F1F3F9]">{agent.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}40` }}>
                    {agent.successRate} OK
                  </span>
                </div>

                <p className="text-[10px] text-[#9499B3]">{agent.role}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono my-1">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#4F536E]">TOTAL RUNS</span>
                    <p className="font-bold text-[#F1F3F9]">{agent.runs}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#4F536E]">AVG DURATION</span>
                    <p className="font-bold" style={{ color: agent.color }}>{agent.avgTime}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-[9px] text-[#4F536E] uppercase font-bold tracking-wider">Top Tools Invoked:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.toolsUsed.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3] border border-white/10">
                        {t}()
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SECURITY & ACCESS AUDIT RADAR                      */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Threat Level</span>
              <span className="text-xl font-black text-[#00FF41] mt-1">DEFCON 5 (NORMAL)</span>
              <span className="text-[9px] text-[#00FF41]">No active intrusions detected</span>
            </div>

            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Failed Auth Attempts (24h)</span>
              <span className="text-xl font-black text-amber-400 mt-1">3 ATTEMPTS</span>
              <span className="text-[9px] text-amber-400/80">IPs rate-limited & blocked</span>
            </div>

            <div className="cyber-card p-4 flex flex-col">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">RBAC Clearance Denials</span>
              <span className="text-xl font-black text-[#00F0FF] mt-1">12 BLOCKS</span>
              <span className="text-[9px] text-[#00F0FF]/80">Guest persona blocked on classified tabs</span>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Realtime Security Audit Trail
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF41] font-bold">ZERO-TRUST POLICY ACTIVE</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { time: "20:29:12", event: "TOKEN_REFRESH", user: "CIPHER_ZERO (Root)", ip: "127.0.0.1", status: "ALLOWED", color: "#00FF41" },
                { time: "20:25:38", event: "ACCESS_DENIED", user: "GHOST_DRIFTER (Guest)", ip: "127.0.0.1", status: "BLOCKED (Lvl 3 required)", color: "#FF003C" },
                { time: "20:18:40", event: "SESSION_LOCKED", user: "SYSTEM (Ctrl+L)", ip: "NODE://ROOT", status: "LOCKED", color: "#F59E0B" },
                { time: "20:12:05", event: "BIOMETRIC_VERIFY", user: "HEX_BLADE (Netrunner)", ip: "127.0.0.1", status: "AUTHORIZED", color: "#00F0FF" },
                { time: "19:54:10", event: "PIN_AUTH_SUCCESS", user: "ORACLE_EYE (Analyst)", ip: "127.0.0.1", status: "AUTHORIZED", color: "#00FF41" },
              ].map((log, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4F536E]">{log.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold text-[#F1F3F9]">
                      {log.event}
                    </span>
                    <span className="text-[#9499B3]">{log.user}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#4F536E]">{log.ip}</span>
                    <span className="text-[10px] font-bold" style={{ color: log.color }}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
