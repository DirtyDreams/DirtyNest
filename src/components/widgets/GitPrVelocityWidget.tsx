"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
} from "lucide-react";
=======
import { GitPullRequest, CheckCircle2, Clock } from "lucide-react";
import {  } from "@/lib/cyberAudio";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24

interface PullRequest {
  id: string;
  title: string;
  author: string;
  branch: string;
  ciStatus: "PASSED" | "RUNNING" | "FAILED";
  reviews: number;
  aheadBehind: string;
}

const INITIAL_PRS: PullRequest[] = [
  {
    id: "pr-42",
    title: "feat(nexus): deliver Virtual Humans & AI Influencer Talent Agency",
    author: "coyot",
    branch: "feat/virtual-influencers",
    ciStatus: "PASSED",
    reviews: 2,
    aheadBehind: "+12 / -0",
  },
  {
    id: "pr-43",
    title: "feat(deck): implement Adaptive Contextual Right Deck",
    author: "coyot",
    branch: "feat/adaptive-deck",
    ciStatus: "PASSED",
    reviews: 1,
    aheadBehind: "+7 / -1",
  },
  {
    id: "pr-44",
    title: "perf(db): optimize sqlite-vec cosine index vector scan",
    author: "codex-agent",
    branch: "perf/sqlite-vec",
    ciStatus: "RUNNING",
    reviews: 0,
    aheadBehind: "+3 / -2",
  },
];

export default function GitPrVelocityWidget() {
  const [prs, setPrs] = useState<PullRequest[]>(INITIAL_PRS);

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00F0FF]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <GitPullRequest size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              PULL REQUESTS & VELOCITY
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              GitHub PRs, CI Health & Approvals
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold">
          <span>{prs.length} OPEN PRS</span>
        </div>
      </div>

      {/* PRs List */}
      <div className="space-y-2 pt-1">
        {prs.map((pr) => (
          <div
            key={pr.id}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-[#F1F3F9] truncate">
                  {pr.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-[#4F536E] mt-0.5">
                  <span className="text-[#00FF41]">{pr.branch}</span>
                  <span>•</span>
                  <span>by @{pr.author}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {pr.ciStatus === "PASSED" ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 flex items-center gap-1">
                    <CheckCircle2 size={10} /> CI PASS
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock size={10} className="animate-spin" /> CI RUNNING
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-[#9499B3] pt-0.5 border-t border-white/5">
              <span>Approvals: <strong className="text-[#F1F3F9]">{pr.reviews}/2</strong></span>
              <span className="font-mono text-[#00F0FF]">{pr.aheadBehind}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
