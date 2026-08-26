"use client";

import { Cpu, Radio } from "lucide-react";

interface Props {
  title?: string;
}

export default function ViewLoadingSkeleton({ title = "INITIALIZING SUBSYSTEM" }: Props) {
  return (
    <div className="w-full flex flex-col gap-5 font-mono select-none animate-pulse pb-10">
      {/* Top Banner Skeleton */}
      <div className="cyber-card p-5 bg-[#07070B]/80 border border-white/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF41]">
            <Cpu size={20} className="animate-spin opacity-50" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 bg-white/10 rounded-md" />
            <div className="h-3 w-72 bg-white/5 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
          <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-widest">
            {title}
          </span>
        </div>
      </div>

      {/* Grid Bento Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card p-5 h-44 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-8 w-20 bg-[#00FF41]/10 rounded" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
        <div className="cyber-card p-5 h-44 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-8 w-20 bg-[#00F0FF]/10 rounded" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
        <div className="cyber-card p-5 h-44 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-8 w-20 bg-[#BF40FF]/10 rounded" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Main Workspace Skeleton */}
      <div className="cyber-card p-6 min-h-[360px] bg-black/50 border border-white/10 rounded-2xl flex flex-col gap-4 justify-center items-center text-[#4F536E]">
        <Radio size={28} className="animate-pulse text-[#00FF41]/40" />
        <span className="text-xs tracking-wider uppercase font-bold text-[#9499B3]">
          Synchronizing Neural State & Memory Mesh...
        </span>
      </div>
    </div>
  );
}
