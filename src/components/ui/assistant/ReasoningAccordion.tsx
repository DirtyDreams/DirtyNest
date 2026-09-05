"use client";

import { useState } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReasoningAccordionProps {
  thinking: string;
  isThinking?: boolean;
  durationSeconds?: number;
  className?: string;
}

export function ReasoningAccordion({
  thinking,
  isThinking = false,
  durationSeconds,
  className,
}: ReasoningAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking && !isThinking) return null;

  return (
    <div
      className={cn(
        "luminous-surface-l2 rounded-xl border border-white/10 font-mono text-xs my-2 transition-all duration-200 relative overflow-hidden",
        isThinking
          ? "border-[#BF40FF]/40 shadow-[0_0_15px_rgba(191,64,255,0.12)]"
          : "hover:border-white/20",
        className
      )}
    >
      <div className="hud-corner-bracket tl !border-[#BF40FF]/50" />
      <div className="hud-corner-bracket br !border-[#BF40FF]/50" />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-white/[0.03] text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-[#BF40FF]/15 text-[#BF40FF] flex items-center justify-center shrink-0 border border-[#BF40FF]/30">
            <Brain size={12} className={isThinking ? "animate-pulse" : ""} />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {/* Status Beacon */}
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isThinking
                  ? "bg-[#BF40FF] shadow-[0_0_8px_#BF40FF] animate-pulse"
                  : "bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
              )}
            />

            <span className="font-mono font-bold text-[#E9D5FF] text-[11px] tracking-wider truncate">
              {isThinking ? "THINKING // ACTIVE" : "COGNITIVE TRACE // RESOLVED"}
            </span>
          </div>

          {durationSeconds !== undefined && (
            <span className="tactical-badge text-[9px] border-[#BF40FF]/30 text-[#BF40FF] bg-[#BF40FF]/10 shrink-0">
              {durationSeconds}s
            </span>
          )}
        </div>

        <div className="text-[#9499B3] shrink-0 ml-2">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#BF40FF]/15 bg-black/40 text-[11px] text-[#D8B4FE] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap selection:bg-[#BF40FF]/30">
          {thinking}
        </div>
      )}
    </div>
  );
}
