"use client";

import { useState } from "react";
import { GitMerge, Clock, CheckCircle2, AlertCircle, Play, Layers } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SwarmTask {
  id: string;
  agentId: string;
  agentName: string;
  color: string;
  taskTitle: string;
  startMin: number;
  durationMin: number;
  status: "running" | "completed" | "queued" | "failed";
}

const TASKS: SwarmTask[] = [
  {
    id: "t-1",
    agentId: "agy-01",
    agentName: "SENTINEL-01",
    color: "#00FF41",
    taskTitle: "Network Boundary Recon & Port Audit",
    startMin: 0,
    durationMin: 35,
    status: "completed",
  },
  {
    id: "t-2",
    agentId: "agy-02",
    agentName: "SCRAPER-INTEL",
    color: "#00F0FF",
    taskTitle: "Harvest CVE Disclosures & RSS Feeds",
    startMin: 15,
    durationMin: 45,
    status: "running",
  },
  {
    id: "t-3",
    agentId: "agy-03",
    agentName: "KUBE-DEPLOYER",
    color: "#BF40FF",
    taskTitle: "Canary Rollout & Zero-Downtime Validation",
    startMin: 40,
    durationMin: 30,
    status: "queued",
  },
  {
    id: "t-4",
    agentId: "agy-04",
    agentName: "CODE-AUDITOR",
    color: "#FFB800",
    taskTitle: "AST Secrets Sanitization on Client Components",
    startMin: 10,
    durationMin: 50,
    status: "running",
  },
  {
    id: "t-5",
    agentId: "agy-05",
    agentName: "DB-OPTIMIZER",
    color: "#00FF41",
    taskTitle: "PRAGMA Optimize on SQLite WAL Index",
    startMin: 25,
    durationMin: 20,
    status: "completed",
  },
  {
    id: "t-6",
    agentId: "agy-06",
    agentName: "LATENCY-PINGER",
    color: "#FF2A6D",
    taskTitle: "Synthetic GraphQL Mesh Benchmarks (p99)",
    startMin: 5,
    durationMin: 70,
    status: "running",
  },
];

export default function SwarmOrchestrationTimeline() {
  const [selectedTask, setSelectedTask] = useState<SwarmTask | null>(TASKS[0]);

  const timeSlots = ["00m", "15m", "30m", "45m", "60m", "75m", "90m"];

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <GitMerge size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              SWARM ORCHESTRATION TIMELINE // <span className="text-[#BF40FF]">GANTT SCHEDULER</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Concurrent execution streams, task dependencies, and agent throughput schedule
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          6 ACTIVE WORKSTREAMS
        </span>
      </div>

      {/* Gantt Matrix Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px] space-y-2">
          {/* Time Header */}
          <div className="grid grid-cols-7 text-[10px] text-[#4F536E] pb-1 border-b border-white/5 pl-36">
            {timeSlots.map((slot) => (
              <span key={slot}>{slot}</span>
            ))}
          </div>

          {/* Agent Rows */}
          {TASKS.map((t) => {
            const isSelected = selectedTask?.id === t.id;
            const leftPct = (t.startMin / 90) * 100;
            const widthPct = Math.max(12, (t.durationMin / 90) * 100);

            return (
              <div
                key={t.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedTask(t);
                }}
                className={`flex items-center py-2 px-2 rounded-xl transition-all cursor-pointer ${
                  isSelected ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02]"
                }`}
              >
                {/* Agent Label */}
                <div className="w-36 shrink-0 flex items-center gap-2 pr-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-xs font-bold text-[#F1F3F9] truncate">{t.agentName}</span>
                </div>

                {/* Timeline Bar Track */}
                <div className="flex-1 relative h-6 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                  <div
                    className={`absolute top-0 bottom-0 rounded-md flex items-center px-2 text-[9px] font-bold truncate transition-all ${
                      t.status === "running"
                        ? "text-black shadow-[0_0_10px_currentColor] animate-pulse"
                        : t.status === "completed"
                        ? "text-black opacity-90"
                        : "bg-white/10 text-[#9499B3]"
                    }`}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: t.status === "queued" ? undefined : t.color,
                    }}
                  >
                    <span className="truncate">{t.taskTitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Task Inspector Details */}
      {selectedTask && (
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#4F536E] text-[10px] block">SELECTED MISSION:</span>
            <span className="font-bold text-[#F1F3F9]">{selectedTask.taskTitle}</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[#9499B3]">
            <span>Agent: <strong className="text-white">{selectedTask.agentName}</strong></span>
            <span>Duration: <strong className="text-white">{selectedTask.durationMin}m</strong></span>
            <span>
              Status:{" "}
              <strong className="text-[#00FF41] uppercase">
                {selectedTask.status}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
