"use client";

import { useState } from "react";
import {
  Container,
  RotateCcw,
  Trash2,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function DockerContextDeck() {
  const [pruned, setPruned] = useState(false);
  const [restarted, setRestarted] = useState(false);

  const handlePrune = () => {
    cyberAudio.play("warp");
    setPruned(true);
    setTimeout(() => setPruned(false), 2000);
  };

  const handleRestart = () => {
    cyberAudio.play("chime");
    setRestarted(true);
    setTimeout(() => setRestarted(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Container Status Gauge */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00FF41]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00FF41]">
            <Container size={14} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Container Telemetry
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#00FF41]">ENGINE v24.0</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Running</span>
            <span className="font-bold text-[#00FF41]">4 Active</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Stopped</span>
            <span className="font-bold text-[#9499B3]">1 Exited</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">RAM</span>
            <span className="font-bold text-[#00F0FF]">1.42 GB</span>
          </div>
        </div>
      </div>

      {/* Quick Docker Actions */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#4F536E]">
          Quick Container Operations
        </span>

        <div className="space-y-1.5">
          <button
            onClick={handleRestart}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F1F3F9] text-[11px] font-bold flex items-center justify-between border border-white/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RotateCcw size={12} className="text-[#00F0FF]" />
              <span>Restart Container Fleet</span>
            </div>
            {restarted && <Check size={12} className="text-[#00FF41]" />}
          </button>

          <button
            onClick={handlePrune}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-red-500/15 text-[#9499B3] hover:text-red-400 text-[11px] font-bold flex items-center justify-between border border-white/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={12} className="text-red-400" />
              <span>Prune Dangling Images</span>
            </div>
            {pruned && <Check size={12} className="text-[#00FF41]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
