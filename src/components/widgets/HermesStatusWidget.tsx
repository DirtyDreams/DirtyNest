"use client";

import { useState } from "react";
import { Brain, ArrowRight, Play, Terminal } from "lucide-react";
import { useHermesStore } from "@/lib/hermes/hermesStore";
import { cyberAudio } from "@/lib/cyberAudio";

export default function HermesStatusWidget() {
  const { config, memories, skills, isAcpConnected } = useHermesStore();
  const [runningSkill, setRunningSkill] = useState<string | null>(null);

  const handleQuickSkill = (skillId: string) => {
    cyberAudio.play("toggle");
    setRunningSkill(skillId);
    setTimeout(() => {
      cyberAudio.play("chime");
      setRunningSkill(null);
    }, 1500);
  };

  const handleOpenDrawer = () => {
    cyberAudio.play("click");
    // Trigger global Hermes quick command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="cyber-card p-4 flex flex-col justify-between gap-3 h-full font-mono select-none border-[#00FF41]/20 hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]">
              <Brain size={13} />
            </div>
            <span className="text-xs font-black text-[#F1F3F9] tracking-wider">
              HERMES MASTER BRAIN
            </span>
          </div>

          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Model Spec */}
        <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] text-[#4F536E] mt-2 overflow-hidden">
          <span className="truncate">Model: <strong className="text-white truncate">{config.model.modelId}</strong></span>
          <span className="text-[#00F0FF] shrink-0">ACP v2</span>
        </div>

        {/* Stats 3-Column */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center py-2 px-1 my-2 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
          <div className="truncate">
            <span className="text-[8px] sm:text-[9px] text-[#4F536E] uppercase block truncate">Skills</span>
            <span className="text-[11px] sm:text-xs font-black text-[#00FF41] block truncate">{skills.length} Loaded</span>
          </div>
          <div className="truncate">
            <span className="text-[8px] sm:text-[9px] text-[#4F536E] uppercase block truncate">Memories</span>
            <span className="text-[11px] sm:text-xs font-black text-[#00F0FF] block truncate">{memories.length} Stored</span>
          </div>
          <div className="truncate">
            <span className="text-[8px] sm:text-[9px] text-[#4F536E] uppercase block truncate">Recall</span>
            <span className="text-[11px] sm:text-xs font-black text-[#BF40FF] block truncate">99.8%</span>
          </div>
        </div>

        {/* Quick Launch Skill Pills */}
        <div className="space-y-1.5">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold block">
            1-Click Skill Triggers:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {skills.slice(0, 2).map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleQuickSkill(skill.id)}
                disabled={runningSkill === skill.id}
                className="p-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-[#00FF41]/40 text-left flex items-center justify-between text-[10px] text-[#9499B3] hover:text-white transition-all cursor-pointer disabled:opacity-50 truncate"
              >
                <span className="truncate">{skill.name}</span>
                <Play size={10} className="text-[#00FF41] shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Open Palette Button */}
      <button
        type="button"
        onClick={handleOpenDrawer}
        className="w-full py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 hover:bg-[#00FF41]/25 text-[#00FF41] text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Terminal size={11} />
        <span>OPEN HERMES COMMAND PALETTE (CTRL+K)</span>
        <ArrowRight size={11} />
      </button>
    </div>
  );
}
