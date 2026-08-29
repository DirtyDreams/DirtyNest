"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface SessionTokenMetric {
  id: string;
  name: string;
  harness: string;
  color: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  maxBudget: number;
  tokensPerSec: number;
}

const INITIAL_METRICS: SessionTokenMetric[] = [
  {
    id: "sess-hermes-8821",
    name: "HERMES-8821 // Infra Audit",
    harness: "Nous-Hermes-3-70B",
    color: "#00FF41",
    promptTokens: 28400,
    completionTokens: 13780,
    cachedTokens: 14200,
    maxBudget: 128000,
    tokensPerSec: 64.2,
  },
  {
    id: "sess-hermes-8902",
    name: "HERMES-8902 // CVE Triage",
    harness: "Nous-Hermes-3-70B",
    color: "#00F0FF",
    promptTokens: 41200,
    completionTokens: 18900,
    cachedTokens: 26500,
    maxBudget: 128000,
    tokensPerSec: 82.5,
  },
  {
    id: "sess-pi-2101",
    name: "PI-2101 // Reflection Loop",
    harness: "Pi-Reasoner-2.5",
    color: "#BF40FF",
    promptTokens: 14200,
    completionTokens: 8400,
    cachedTokens: 6100,
    maxBudget: 64000,
    tokensPerSec: 42.0,
  },
  {
    id: "sess-opencode-4412",
    name: "OPENCODE-4412 // Local Mesh",
    harness: "DeepSeek-Coder-Q8",
    color: "#FFB800",
    promptTokens: 11200,
    completionTokens: 4800,
    cachedTokens: 4200,
    maxBudget: 32000,
    tokensPerSec: 78.4,
  },
];

export default function TokenStreamMonitor() {
  const [metrics, setMetrics] = useState<SessionTokenMetric[]>(INITIAL_METRICS);

  // Live token consumption simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const deltaComp = Math.floor(Math.random() * 28 + 6);
          const newCompletion = m.completionTokens + deltaComp;
          const newTps = +(m.tokensPerSec + (Math.random() * 4 - 2)).toFixed(1);
          return {
            ...m,
            completionTokens: newCompletion,
            tokensPerSec: Math.max(10, Math.min(120, newTps)),
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const totalUsed = metrics.reduce(
    (acc, curr) => acc + curr.promptTokens + curr.completionTokens,
    0
  );
  const totalMax = metrics.reduce((acc, curr) => acc + curr.maxBudget, 0);
  const overallPct = Math.round((totalUsed / totalMax) * 100);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                HERMES TOKEN STREAM MONITOR // <span className="text-[#00FF41]">REAL-TIME TELEMETRY</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
            </div>
            <p className="text-[10px] text-[#4F536E]">
              Per-session prompt, completion, and cached context window burndown
            </p>
          </div>
        </div>

        {/* Global Cluster Token Meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] text-[#4F536E] uppercase block">Cluster Active Token Load</span>
            <span className="text-xs font-black text-[#00F0FF]">
              {totalUsed.toLocaleString()} / {totalMax.toLocaleString()} tok ({overallPct}%)
            </span>
          </div>
          <div className="w-20 h-2 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00FF41] via-[#00F0FF] to-[#BF40FF] transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sessions Bar Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {metrics.map((m) => {
          const totalSessionUsed = m.promptTokens + m.completionTokens;
          const promptPct = (m.promptTokens / m.maxBudget) * 100;
          const compPct = (m.completionTokens / m.maxBudget) * 100;
          const cachedPct = (m.cachedTokens / m.maxBudget) * 100;
          const usedPct = Math.min(100, Math.round((totalSessionUsed / m.maxBudget) * 100));

          return (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-xs font-bold text-[#F1F3F9] truncate">{m.name}</span>
                </div>
                <span className="text-[10px] font-bold text-[#00FF41] shrink-0">
                  {m.tokensPerSec} tok/s
                </span>
              </div>

              {/* Stacked Bar */}
              <div className="w-full h-3 rounded-md bg-black/80 border border-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-[#00F0FF] transition-all"
                  style={{ width: `${promptPct}%` }}
                  title={`Prompt: ${m.promptTokens.toLocaleString()} tok`}
                />
                <div
                  className="h-full bg-[#00FF41] transition-all"
                  style={{ width: `${compPct}%` }}
                  title={`Completion: ${m.completionTokens.toLocaleString()} tok`}
                />
                <div
                  className="h-full bg-[#BF40FF]/60 transition-all"
                  style={{ width: `${cachedPct}%` }}
                  title={`Cached: ${m.cachedTokens.toLocaleString()} tok`}
                />
              </div>

              {/* Legend & Stats */}
              <div className="flex items-center justify-between text-[9px] text-[#9499B3] pt-1 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Prompt: {m.promptTokens.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" /> Comp: {m.completionTokens.toLocaleString()}
                  </span>
                </div>
                <span className="font-bold text-[#F1F3F9]">
                  {usedPct}% / {m.maxBudget.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
