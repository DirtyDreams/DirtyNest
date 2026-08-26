"use client";

import { useState } from "react";
import {
  Coffee,
  Droplets,
  Flame,
  Plus,
  Minus,
  Check,
  Sparkles,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function DevHydrationStreak() {
  const [coffeeCount, setCoffeeCount] = useState(3);
  const [waterCount, setWaterCount] = useState(5);
  const [streakSessions] = useState(4);

  const waterTarget = 8;
  const waterPct = Math.min(100, Math.round((waterCount / waterTarget) * 100));

  const addCoffee = () => {
    cyberAudio.play("click");
    setCoffeeCount((prev) => prev + 1);
  };

  const addWater = () => {
    cyberAudio.play("chime");
    setWaterCount((prev) => prev + 1);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00F0FF]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Droplets size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              OPERATOR BIO-RHYTHM & STREAK
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Hydration & Deep Work Momentum
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          <Flame size={12} className="text-amber-400" />
          <span>{streakSessions} SESSIONS</span>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coffee Counter */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#FFB800]/10 text-[#FFB800]">
              <Coffee size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#4F536E] uppercase font-bold">Espresso</span>
              <span className="text-sm font-black text-[#F1F3F9]">{coffeeCount} Cups</span>
            </div>
          </div>

          <button
            onClick={addCoffee}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Water Counter */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
              <Droplets size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#4F536E] uppercase font-bold">Hydration</span>
              <span className="text-sm font-black text-[#00F0FF]">{waterCount} / {waterTarget}</span>
            </div>
          </div>

          <button
            onClick={addWater}
            className="w-7 h-7 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] flex items-center justify-center cursor-pointer transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Water Target Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-[#4F536E]">
          <span>Hydration Goal: {waterPct}%</span>
          <span>{waterCount >= waterTarget ? "Goal Reached! 💧" : `${waterTarget - waterCount} glasses to target`}</span>
        </div>
        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-[#00F0FF] transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
            style={{ width: `${waterPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
