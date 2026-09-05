"use client";

import {  } from "react";
import { useState } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        "rounded-xl border border-[#BF40FF]/20 bg-[#12071E]/40 overflow-hidden font-mono text-xs my-2 transition-all",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-[#BF40FF]/5 text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#BF40FF]/15 text-[#BF40FF] flex items-center justify-center">
            <Brain size={13} className={isThinking ? "animate-pulse" : ""} />
          </div>
          <span className="font-bold text-[#E9D5FF] text-[11px] uppercase tracking-wider">
            {isThinking ? "Deep Thinking / Reasoning..." : "AI Thought Process"}
          </span>
          {durationSeconds !== undefined && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 border-[#BF40FF]/30 text-[#BF40FF] bg-[#BF40FF]/10"
            >
              {durationSeconds}s
            </Badge>
          )}
        </div>

        <div className="text-[#9499B3]">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#BF40FF]/10 bg-black/40 text-[11px] text-[#D8B4FE] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
          {thinking}
        </div>
      )}
    </div>
  );
}
