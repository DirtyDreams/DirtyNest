"use client";

import { useState } from "react";
import {
  Brain,
  Wrench,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Terminal,
  Activity,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  content: string;
  sender: "user" | "bot";
  timestamp?: string;
  model?: string;
}

interface ParsedSegment {
  type: "thought" | "tool_call" | "tool_response" | "text";
  content: string;
}

export function parseHermesContent(raw: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /<(thought|tool_call|tool_response)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    // Push preceding text segment if any
    if (match.index > lastIndex) {
      const textChunk = raw.substring(lastIndex, match.index).trim();
      if (textChunk) {
        segments.push({ type: "text", content: textChunk });
      }
    }

    const tagType = match[1].toLowerCase() as "thought" | "tool_call" | "tool_response";
    segments.push({
      type: tagType,
      content: match[2].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < raw.length) {
    const trailing = raw.substring(lastIndex).trim();
    if (trailing) {
      segments.push({ type: "text", content: trailing });
    }
  }

  // Fallback if no tags detected
  if (segments.length === 0 && raw.trim()) {
    segments.push({ type: "text", content: raw.trim() });
  }

  return segments;
}

export default function HermesMessageBlock({ content, sender, timestamp, model }: Props) {
  const [thoughtExpanded, setThoughtExpanded] = useState(true);

  if (sender === "user") {
    return (
      <div className="flex justify-end font-mono select-none">
        <div className="max-w-2xl p-4 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#F1F3F9] text-xs leading-relaxed space-y-1 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
          <div className="flex items-center justify-between text-[10px] text-[#4F536E] pb-1 border-b border-white/5">
            <span className="font-bold text-[#00FF41]">OPERATOR DIRECTIVE</span>
            {timestamp && <span>{timestamp}</span>}
          </div>
          <p className="whitespace-pre-wrap font-sans text-xs pt-1">{content}</p>
        </div>
      </div>
    );
  }

  const segments = parseHermesContent(content);

  return (
    <div className="flex justify-start font-mono">
      <div className="max-w-3xl w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-3 shadow-lg">
        {/* Hermes Message Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
              <Brain size={12} />
            </div>
            <span className="font-black text-[#F1F3F9] tracking-wider text-xs">
              HERMES NEURAL SYNAPSE
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              {model || "NOUS-HERMES-3-70B"}
            </span>
          </div>

          {timestamp && <span className="text-[10px] text-[#4F536E]">{timestamp}</span>}
        </div>

        {/* Parsed Segments Stream */}
        <div className="space-y-2.5">
          {segments.map((seg, idx) => {
            if (seg.type === "thought") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#BF40FF]/30 bg-[#BF40FF]/5 p-3 space-y-1.5 transition-all"
                >
                  <div
                    onClick={() => {
                      cyberAudio.play("click");
                      setThoughtExpanded(!thoughtExpanded);
                    }}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5 text-[#BF40FF] text-[11px] font-bold">
                      <Sparkles size={13} />
                      <span>COGNITIVE REASONING TRACE</span>
                    </div>
                    {thoughtExpanded ? (
                      <ChevronDown size={14} className="text-[#BF40FF]" />
                    ) : (
                      <ChevronRight size={14} className="text-[#BF40FF]" />
                    )}
                  </div>

                  {thoughtExpanded && (
                    <p className="text-[11px] text-[#D199FF] leading-relaxed italic pt-1 border-t border-[#BF40FF]/20 whitespace-pre-wrap">
                      {seg.content}
                    </p>
                  )}
                </div>
              );
            }

            if (seg.type === "tool_call") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#00F0FF]/40 bg-[#00F0FF]/5 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#00F0FF] font-bold">
                      <Wrench size={13} />
                      <span>HERMES TOOL INVOCATION</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                      FUNCTION_CALL
                    </span>
                  </div>

                  <pre className="p-2.5 rounded-lg bg-black/80 border border-white/10 text-[10px] text-[#00FF41] overflow-x-auto font-mono">
                    {seg.content}
                  </pre>
                </div>
              );
            }

            if (seg.type === "tool_response") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-black/80 p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-[#00FF41] text-[10px] font-bold">
                    <Terminal size={12} />
                    <span>TOOL EXECUTION RESPONSE</span>
                  </div>
                  <pre className="text-[10px] text-[#F1F3F9] overflow-x-auto whitespace-pre-wrap font-mono">
                    {seg.content}
                  </pre>
                </div>
              );
            }

            // Regular Markdown / Text
            return (
              <div key={idx} className="text-xs text-[#F1F3F9] leading-relaxed whitespace-pre-wrap font-sans">
                {seg.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
