"use client";

import { Cpu, Zap, Database, MessageSquare, User, BookOpen } from "lucide-react";

interface Props {
  charTokens: number;
  userTokens: number;
  loreTokens: number;
  historyTokens: number;
  maxTokens?: number;
}

export default function TokenContextInspector({
  charTokens,
  userTokens,
  loreTokens,
  historyTokens,
  maxTokens = 8192,
}: Props) {
  const usedTokens = charTokens + userTokens + loreTokens + historyTokens;
  const usedPercent = Math.min(100, (usedTokens / maxTokens) * 100);

  const charPercent = (charTokens / maxTokens) * 100;
  const userPercent = (userTokens / maxTokens) * 100;
  const lorePercent = (loreTokens / maxTokens) * 100;
  const historyPercent = (historyTokens / maxTokens) * 100;

  return (
    <div className="cyber-card p-3.5 bg-black/70 border border-white/10 rounded-xl flex flex-col gap-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-[#00FF41]" />
          <span className="font-bold text-[#F1F3F9] text-[11px] uppercase tracking-wider">
            CONTEXT WINDOW TOKEN USAGE
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-bold text-[#00FF41]">{usedTokens}</span>
          <span className="text-[#4F536E]">/ {maxTokens} TOKENS ({usedPercent.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Progress Bar with Color Slices */}
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
        <div
          style={{ width: `${charPercent}%` }}
          className="h-full bg-[#00FF41]"
          title={`Character Tokens: ${charTokens}`}
        />
        <div
          style={{ width: `${userPercent}%` }}
          className="h-full bg-[#00F0FF]"
          title={`User Persona Tokens: ${userTokens}`}
        />
        <div
          style={{ width: `${lorePercent}%` }}
          className="h-full bg-[#BF40FF]"
          title={`Lorebook Tokens: ${loreTokens}`}
        />
        <div
          style={{ width: `${historyPercent}%` }}
          className="h-full bg-[#FFB800]"
          title={`Chat History Tokens: ${historyTokens}`}
        />
      </div>

      {/* Legend Breakdown Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px]">
        <span className="flex items-center gap-1 text-[#00FF41]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
          Character ({charTokens} T)
        </span>
        <span className="flex items-center gap-1 text-[#00F0FF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
          User Persona ({userTokens} T)
        </span>
        <span className="flex items-center gap-1 text-[#BF40FF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF40FF]" />
          Lorebook ({loreTokens} T)
        </span>
        <span className="flex items-center gap-1 text-[#FFB800]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
          History ({historyTokens} T)
        </span>
      </div>
    </div>
  );
}
