"use client";

import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  onOpenCommandDrawer?: () => void;
}

export default function HermesMasterStatusBadge({ onOpenCommandDrawer }: Props) {
  const [loadPct, setLoadPct] = useState(38);
  const [_pulseActive, _setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 6 - 3);
      setLoadPct((prev) => Math.min(92, Math.max(18, prev + delta)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    cyberAudio.play("toggle");
    if (onOpenCommandDrawer) onOpenCommandDrawer();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 border border-[#00FF41]/30 hover:border-[#00FF41] hover:bg-[#00FF41]/10 text-xs font-mono transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.1)] group"
      title="Click or press Ctrl+K to open Hermes Master Command Drawer"
    >
      {/* Brain Icon with Pulse */}
      <div className="relative flex items-center justify-center">
        <Brain size={14} className="text-[#00FF41] group-hover:scale-110 transition-transform" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
      </div>

      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="font-bold text-[#F1F3F9] tracking-wider">
          HERMES BRAIN <span className="text-[#00FF41]">// ONLINE</span>
        </span>
        <span className="text-[#4F536E]">|</span>
        <span className="text-[#00F0FF] font-bold">42 SKILLS</span>
        <span className="text-[#4F536E]">|</span>
        <span className="text-[#BF40FF] font-bold">{loadPct}% LOAD</span>
      </div>

      {/* Shortcut Pill */}
      <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-white/10 text-[#9499B3] group-hover:text-white border border-white/5">
        Ctrl+K
      </span>
    </button>
  );
}
