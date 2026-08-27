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
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  content: string;
  sender: "user" | "bot" | "system";
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

  if (lastIndex < raw.length) {
    const trailing = raw.substring(lastIndex).trim();
    if (trailing) {
      segments.push({ type: "text", content: trailing });
    }
  }

  if (segments.length === 0 && raw.trim()) {
    segments.push({ type: "text", content: raw.trim() });
  }

  return segments;
}

export default function HermesMessageBlock({ content, sender, timestamp, model }: Props) {
  const [thoughtExpanded, setThoughtExpanded] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // User Message Rendering
  if (sender === "user") {
    return (
      <div className="flex justify-end font-mono select-none my-1">
        <div className="max-w-2xl p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-[#00FF41]/30 text-[#F1F3F9] text-xs leading-relaxed space-y-1 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
          <div className="flex items-center justify-between text-[10px] text-[#4F536E] pb-1 border-b border-white/5">
            <span className="font-bold text-[#00FF41] flex items-center gap-1">
              <span>OPERATOR DIRECTIVE</span>
            </span>
            {timestamp && <span>{timestamp}</span>}
          </div>
          <p className="whitespace-pre-wrap font-sans text-xs pt-1 text-slate-100 leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // System Message Rendering
  if (sender === "system") {
    return (
      <div className="flex justify-center my-2 select-none font-mono">
        <div className="px-3 py-1 rounded-full bg-white/[0.02] border border-white/10 text-[10px] text-[#9499B3] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
          <span>{content}</span>
          {timestamp && <span className="text-[#4F536E]">• {timestamp}</span>}
        </div>
      </div>
    );
  }

  // AI Hermes Message Rendering
  const segments = parseHermesContent(content);

  return (
    <div className="flex justify-start font-mono my-2">
      <div className="max-w-4xl w-full p-4 sm:p-5 rounded-2xl bg-[#090B14]/90 border border-white/10 text-xs space-y-3.5 shadow-xl backdrop-blur-md">
        {/* Hermes Message Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.2)]">
              <Brain size={13} />
            </div>
            <span className="font-bold text-[#F1F3F9] tracking-wider text-xs">
              HERMES NEURAL SYNAPSE
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#00FF41] border border-white/10">
              {model || "Nous-Hermes-3-70B"}
            </span>
          </div>

          {timestamp && <span className="text-[10px] text-[#4F536E]">{timestamp}</span>}
        </div>

        {/* Parsed Segments Stream */}
        <div className="space-y-3">
          {segments.map((seg, idx) => {
            if (seg.type === "thought") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                >
                  <div
                    onClick={() => {
                      cyberAudio.play("click");
                      setThoughtExpanded(!thoughtExpanded);
                    }}
                    className="flex items-center justify-between p-2.5 px-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 text-[#A1A7C4] text-[11px] font-bold">
                      <Sparkles size={12} className="text-[#00FF41]" />
                      <span>Thinking Process & Cognitive Reasoning</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4F536E]">
                      <span>{thoughtExpanded ? "Collapse" : "Show details"}</span>
                      {thoughtExpanded ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </div>
                  </div>

                  {thoughtExpanded && (
                    <div className="p-3 pt-2 text-[11px] text-[#A1A7C4] leading-relaxed border-t border-white/5 font-sans whitespace-pre-wrap bg-black/40">
                      {seg.content}
                    </div>
                  )}
                </div>
              );
            }

            if (seg.type === "tool_call") {
              const codeId = `tool-call-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#070913] p-3 space-y-1.5 font-mono"
                >
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-[#00F0FF] text-[10px] font-bold">
                      <Terminal size={12} />
                      <span>FUNCTION INVOCATION // TOOL_CALL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeId, seg.content)}
                      className="text-[9px] text-[#4F536E] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCodeId === codeId ? <Check size={10} className="text-[#00FF41]" /> : <Copy size={10} />}
                      <span>{copiedCodeId === codeId ? "COPIED" : "COPY"}</span>
                    </button>
                  </div>

                  <pre className="p-2 rounded-lg bg-black/60 text-[10px] text-[#00FF41] overflow-x-auto">
                    <code>{seg.content}</code>
                  </pre>
                </div>
              );
            }

            if (seg.type === "tool_response") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#070913] p-3 space-y-1.5 font-mono"
                >
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-[#00FF41] text-[10px] font-bold">
                      <CheckCircle2 size={12} />
                      <span>TOOL RESPONSE TELEMETRY</span>
                    </div>
                    <span className="text-[8px] text-[#4F536E]">STATUS: OK</span>
                  </div>

                  <pre className="p-2 rounded-lg bg-black/60 text-[10px] text-slate-300 overflow-x-auto">
                    <code>{seg.content}</code>
                  </pre>
                </div>
              );
            }

            // Regular Response Body
            return (
              <div
                key={idx}
                className="font-sans text-xs text-[#F1F3F9] leading-relaxed whitespace-pre-wrap selection:bg-[#00FF41]/30"
              >
                {seg.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
