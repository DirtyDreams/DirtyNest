"use client";

import { useState } from "react";
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface PalettePreset {
  name: string;
  colors: string[];
}

const PRESETS: PalettePreset[] = [
  { name: "Cyber Green", colors: ["#00FF41", "#051A0E", "#0A3D1E", "#00F0FF", "#F1F3F9"] },
  { name: "Vapor Synth", colors: ["#BF40FF", "#180A2E", "#FF007F", "#00F0FF", "#FFE600"] },
  { name: "Amber Terminal", colors: ["#FFB800", "#1F1500", "#3D2B00", "#FF6B00", "#FFF4D4"] },
  { name: "Stealth Obsidian", colors: ["#7928CA", "#07070B", "#161726", "#4F536E", "#00FF41"] },
];

export default function ColorPaletteGenerator() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const activePalette = PRESETS[currentIdx];

  const handleNext = () => {
    cyberAudio.play("click");
    setCurrentIdx((prev) => (prev + 1) % PRESETS.length);
  };

  const handleCopy = (color: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00F0FF]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Palette size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              CYBER PALETTE GENERATOR
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Theme: {activePalette?.name ?? "Cyber Green"}
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00F0FF] font-bold cursor-pointer transition-all"
        >
          <RefreshCw size={11} />
          <span>CYCLE</span>
        </button>
      </div>

      {/* Palette Swatches */}
      <div className="grid grid-cols-5 gap-1.5 h-16 rounded-xl overflow-hidden p-1 bg-black/60 border border-white/5">
        {(activePalette?.colors ?? []).map((c) => {
          const isCopied = copiedColor === c;
          return (
            <button
              key={c}
              onClick={() => handleCopy(c)}
              className="h-full rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition-all relative group cursor-pointer"
              style={{ backgroundColor: c }}
            >
              <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white px-1 py-0.5 rounded text-[8px] transition-opacity">
                {isCopied ? <Check size={10} className="text-[#00FF41]" /> : c}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hex Codes Row */}
      <div className="flex items-center justify-between text-[10px] text-[#9499B3]">
        {(activePalette?.colors ?? []).map((c) => (
          <span
            key={c}
            onClick={() => handleCopy(c)}
            className="hover:text-white cursor-pointer font-mono"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
