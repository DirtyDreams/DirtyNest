"use client";

import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningTreeInspectorProps {
  reasoningTrace: string;
  isStreaming?: boolean;
}

export default function ReasoningTreeInspector({
  reasoningTrace,
  isStreaming = false,
}: ReasoningTreeInspectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!reasoningTrace.trim()) return null;

  // Approximate token count based on words
  const approxTokens = Math.round(reasoningTrace.split(/\s+/).length * 1.3);

  return (
    <div className="rounded-xl bg-black/70 border border-[#BF40FF]/30 overflow-hidden font-mono text-xs shadow-lg animate-fade-in">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-[#BF40FF]/10 hover:bg-[#BF40FF]/15 border-b border-[#BF40FF]/20 flex items-center justify-between transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#BF40FF]/20 text-[#BF40FF]">
            <Brain size={14} className={cn(isStreaming && "animate-pulse")} />
          </div>
          <span className="font-bold text-[#F1F3F9] text-[11px] uppercase flex items-center gap-2">
            <span>KARPATHY REASONING TRACE</span>
            {isStreaming && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40 animate-pulse font-black">
                THINKING...
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#9499B3]">
          <span className="flex items-center gap-1">
            <Cpu size={11} className="text-[#00F0FF]" />
            <span>~{approxTokens} Tokens</span>
          </span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Trace Body */}
      {isOpen && (
        <div className="p-3 max-h-60 overflow-y-auto bg-black/90 text-[#9499B3] text-[11px] leading-relaxed whitespace-pre-wrap font-mono border-t border-white/5">
          {reasoningTrace}
          {isStreaming && (
            <span className="inline-block w-2 h-3.5 ml-1 bg-[#BF40FF] animate-pulse align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
