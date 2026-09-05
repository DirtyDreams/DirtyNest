"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Play,
  Copy,
  Check,
  Activity,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface MetricSample {
  timestamp: string;
  value: number;
}

interface QueryResult {
  metric: string;
  status: "success" | "error";
  latencyMs: number;
  resultType: "matrix" | "vector";
  data: MetricSample[];
}

const PRESET_QUERIES = [
  {
    name: "Swarm CPU Rate (5m)",
    query: 'rate(container_cpu_usage_seconds_total{container=~"dirtynest-.*"}[5m]) * 100',
    description: "Per-second CPU consumption across active Docker containers",
    baseValue: 48.5,
    unit: "%",
    color: "#00FF41",
  },
  {
    name: "Free Node Memory",
    query: "node_memory_MemFree_bytes / node_memory_MemTotal_bytes * 100",
    description: "Percentage of available RAM across host cluster",
    baseValue: 34.2,
    unit: "%",
    color: "#00F0FF",
  },
  {
    name: "HTTP 5xx Error Spike Rate",
    query: 'sum(rate(http_requests_total{status=~"5.."}[1m]))',
    description: "Frequency of internal server errors in gateway",
    baseValue: 0.12,
    unit: "req/s",
    color: "#FF2A6D",
  },
  {
    name: "Vector Memory Index Footprint",
    query: 'process_resident_memory_bytes{job="sqlite-vec"} / 1024 / 1024',
    description: "Resident memory in MB allocated to sqlite-vec daemon",
    baseValue: 420.0,
    unit: "MB",
    color: "#BF40FF",
  },
  {
    name: "LLM Inference Token Throughput",
    query: 'rate(llm_generated_tokens_total[1m])',
    description: "Tokens per second generated across local Ollama instances",
    baseValue: 84.6,
    unit: "tok/s",
    color: "#FFB800",
  },
];

export default function PromQlQueryBuilder() {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [activePreset, setActivePreset] = useState(PRESET_QUERIES[0].name);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);

  const activeMeta = useMemo(() => {
    return PRESET_QUERIES.find((p) => p.name === activePreset) || PRESET_QUERIES[0];
  }, [activePreset]);

  // Generate simulated time-series vector points based on query
  const queryResult: QueryResult = useMemo(() => {
    const points: MetricSample[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const timeStr = new Date(now - i * 5000).toLocaleTimeString("en-US", {
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      });
      const fluctuation = ((i * 7 + tick * 3) % 11) - 5;
      const val = Math.max(0, activeMeta.baseValue + fluctuation * (activeMeta.baseValue * 0.08));
      points.push({ timestamp: timeStr, value: parseFloat(val.toFixed(2)) });
    }

    return {
      metric: query,
      status: "success",
      latencyMs: 14.2 + (tick % 5),
      resultType: "matrix",
      data: points,
    };
  }, [query, activeMeta, tick]);

  const handleExecute = () => {
    cyberAudio.play("click");
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setTick((t) => t + 1);
      cyberAudio.play("chime");
    }, 400);
  };

  const handleSelectPreset = (p: typeof PRESET_QUERIES[0]) => {
    cyberAudio.play("click");
    setActivePreset(p.name);
    setQuery(p.query);
  };

  const handleCopyQuery = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sparkline calculation
  const maxVal = Math.max(...queryResult.data.map((d) => d.value), 1);
  const minVal = Math.min(...queryResult.data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const svgPoints = queryResult.data
    .map((pt, idx) => {
      const x = (idx / (queryResult.data.length - 1)) * 400;
      const y = 80 - ((pt.value - minVal) / range) * 60;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              PROMQL QUERY LAB // <span className="text-[#00FF41]">INTERACTIVE VECTOR SIMULATOR</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Execute PromQL vector selectors & visualize metric aggregations in real-time
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            ENGINE: PROMETHEUS v2.52
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            TSDB LATENCY: {queryResult.latencyMs}ms
          </span>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-slate-500 font-bold mr-1">PRESETS:</span>
        {PRESET_QUERIES.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelectPreset(p)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
              activePreset === p.name
                ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "bg-black/40 text-slate-400 border-white/5 hover:text-white hover:border-white/20"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#00FF41]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-transparent font-mono text-xs text-[#00FF41] outline-none placeholder:text-slate-600 selection:bg-emerald-500/30"
            placeholder="Enter PromQL query, e.g. sum(rate(node_cpu_seconds_total[5m]))"
          />
        </div>

        <button
          onClick={handleCopyQuery}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Copy PromQL Query"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isExecuting ? "QUERYING..." : "EVALUATE"}</span>
        </button>
      </div>

      {/* Query Result Metric Card & Vector Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
        {/* Metric Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              CURRENT VECTOR VALUE
            </span>
            <div className="text-2xl font-black" style={{ color: activeMeta.color }}>
              {queryResult.data[queryResult.data.length - 1]?.value}{" "}
              <span className="text-xs text-slate-400 font-normal">{activeMeta.unit}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{activeMeta.description}</p>
          </div>

          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            <span>
              MIN: <strong className="text-white">{minVal.toFixed(2)}</strong>
            </span>
            <span>•</span>
            <span>
              MAX: <strong className="text-white">{maxVal.toFixed(2)}</strong>
            </span>
            <span>•</span>
            <span>
              SAMPLES: <strong className="text-white">{queryResult.data.length}</strong>
            </span>
          </div>
        </div>

        {/* Vector SVG Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>TIME-SERIES VECTOR RESOLUTION (5s INTERVALS)</span>
            <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
          </div>

          <div className="relative h-24 bg-black/60 rounded-lg border border-white/5 p-2 overflow-hidden flex items-end">
            <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="promqlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeMeta.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={activeMeta.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <polygon
                points={`0,80 ${svgPoints} 400,80`}
                fill="url(#promqlGrad)"
              />
              {/* Stroke line */}
              <polyline
                fill="none"
                stroke={activeMeta.color}
                strokeWidth="2"
                points={svgPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
