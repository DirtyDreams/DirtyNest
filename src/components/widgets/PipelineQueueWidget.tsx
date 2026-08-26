"use client";

import { GitPullRequest, Play, CheckCircle2, Clock, GitBranch, ArrowRight } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface PipelineJob {
  id: string;
  name: string;
  branch: string;
  trigger: string;
  progress: number;
  status: "RUNNING" | "QUEUED" | "SUCCESS";
  eta: string;
}

const JOBS: PipelineJob[] = [
  {
    id: "job-1",
    name: "Production Build & Edge Route Bundle",
    branch: "main",
    trigger: "Push commit 953cd67",
    progress: 74,
    status: "RUNNING",
    eta: "42s remaining",
  },
  {
    id: "job-2",
    name: "Autonomous Test Suite & E2E Chromium Matrix",
    branch: "feat/telemetry-views",
    trigger: "PR #42 opened",
    progress: 38,
    status: "RUNNING",
    eta: "1m 15s remaining",
  },
  {
    id: "job-3",
    name: "Hermes Agent Deep Knowledge Indexing",
    branch: "system/datacore",
    trigger: "Scheduled Cron",
    progress: 100,
    status: "SUCCESS",
    eta: "Completed 2m ago",
  },
];

export default function PipelineQueueWidget() {
  const handleNavigateToControlRoom = () => {
    cyberAudio.play("click");
    window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "control_room" }));
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3.5 select-none font-mono">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <GitPullRequest size={16} className="text-[#BF40FF]" />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            PIPELINE & SWARM QUEUE // <span className="text-[#BF40FF]">ACTIVE WORKFLOWS</span>
          </h3>
        </div>

        <button
          onClick={handleNavigateToControlRoom}
          className="text-[10px] text-[#BF40FF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
        >
          <span>CONTROL ROOM</span>
          <ArrowRight size={11} />
        </button>
      </div>

      <div className="space-y-2.5">
        {JOBS.map((job) => (
          <div
            key={job.id}
            className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 hover:border-white/15 transition-all text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    job.status === "RUNNING"
                      ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41] animate-pulse"
                      : "bg-[#00F0FF]"
                  }`}
                />
                <span className="font-bold text-[#F1F3F9] truncate">{job.name}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#4F536E]">
                <GitBranch size={11} />
                <span className="font-mono text-[#9499B3]">{job.branch}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  job.status === "SUCCESS"
                    ? "bg-[#00FF41]"
                    : "bg-gradient-to-r from-[#BF40FF] to-[#00FF41]"
                }`}
                style={{ width: `${job.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
              <span>{job.trigger}</span>
              <span className={job.status === "RUNNING" ? "text-[#00FF41] font-bold" : "text-[#9499B3]"}>
                {job.eta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
