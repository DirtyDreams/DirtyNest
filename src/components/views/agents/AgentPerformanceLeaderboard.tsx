"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Zap, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface AgentRankData {
  rank: number;
  id: string;
  name: string;
  role: string;
  color: string;
  tasksCompleted: number;
  successRate: number;
  avgLatencyMs: number;
  costPer1k: number;
  uptimePct: number;
}

const LEADERBOARD_DATA: AgentRankData[] = [
  {
    rank: 1,
    id: "agy-01",
    name: "SENTINEL-01",
    role: "Defensive Security",
    color: "#00FF41",
    tasksCompleted: 482,
    successRate: 99.8,
    avgLatencyMs: 320,
    costPer1k: 0.0014,
    uptimePct: 100.0,
  },
  {
    rank: 2,
    id: "agy-06",
    name: "LATENCY-PINGER",
    role: "Telemetry Benchmark",
    color: "#FF2A6D",
    tasksCompleted: 1208,
    successRate: 99.9,
    avgLatencyMs: 84,
    costPer1k: 0.0008,
    uptimePct: 99.9,
  },
  {
    rank: 3,
    id: "agy-02",
    name: "SCRAPER-INTEL",
    role: "Intelligence Feed",
    color: "#00F0FF",
    tasksCompleted: 914,
    successRate: 98.9,
    avgLatencyMs: 640,
    costPer1k: 0.0022,
    uptimePct: 99.7,
  },
  {
    rank: 4,
    id: "agy-05",
    name: "DB-OPTIMIZER",
    role: "Database Engine",
    color: "#00FF41",
    tasksCompleted: 641,
    successRate: 100.0,
    avgLatencyMs: 140,
    costPer1k: 0.0005,
    uptimePct: 100.0,
  },
  {
    rank: 5,
    id: "agy-04",
    name: "CODE-AUDITOR",
    role: "AppSec Static Audit",
    color: "#FFB800",
    tasksCompleted: 312,
    successRate: 99.4,
    avgLatencyMs: 920,
    costPer1k: 0.0035,
    uptimePct: 99.2,
  },
  {
    rank: 6,
    id: "agy-03",
    name: "KUBE-DEPLOYER",
    role: "DevOps & CI/CD",
    color: "#BF40FF",
    tasksCompleted: 156,
    successRate: 100.0,
    avgLatencyMs: 410,
    costPer1k: 0.0018,
    uptimePct: 99.8,
  },
];

export default function AgentPerformanceLeaderboard() {
  const [sortBy, setSortBy] = useState<"successRate" | "tasksCompleted" | "avgLatencyMs">("successRate");

  const sortedData = [...LEADERBOARD_DATA].sort((a, b) => {
    if (sortBy === "avgLatencyMs") return a.avgLatencyMs - b.avgLatencyMs;
    return b[sortBy] - a[sortBy];
  });

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              AGENT PERFORMANCE LEADERBOARD // <span className="text-[#FFB800]">SWARM KPI RANKING</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Success rate, throughput velocity, latency p50 & cost efficiency benchmarking
            </p>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[#4F536E] mr-1">Sort:</span>
          {[
            { key: "successRate", label: "Success Rate" },
            { key: "tasksCompleted", label: "Throughput" },
            { key: "avgLatencyMs", label: "Speed" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setSortBy(tab.key as typeof sortBy);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                sortBy === tab.key
                  ? "bg-[#FFB800] text-black"
                  : "bg-white/5 text-[#9499B3] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-[#4F536E] uppercase font-bold">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Agent</th>
              <th className="py-2 px-3">Success Rate</th>
              <th className="py-2 px-3">Tasks Completed</th>
              <th className="py-2 px-3">Avg Latency</th>
              <th className="py-2 px-3">Cost / 1k</th>
              <th className="py-2 px-3">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((ag, idx) => {
              const medal =
                idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;

              return (
                <tr key={ag.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-sm">{medal}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ag.color }} />
                      <div>
                        <span className="font-bold text-[#F1F3F9] block">{ag.name}</span>
                        <span className="text-[9px] text-[#4F536E] block">{ag.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#00FF41]">{ag.successRate}%</td>
                  <td className="py-2.5 px-3 text-[#F1F3F9] font-bold">{ag.tasksCompleted}</td>
                  <td className="py-2.5 px-3 text-[#00F0FF]">{ag.avgLatencyMs}ms</td>
                  <td className="py-2.5 px-3 text-[#BF40FF]">${ag.costPer1k.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-[#9499B3]">{ag.uptimePct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
