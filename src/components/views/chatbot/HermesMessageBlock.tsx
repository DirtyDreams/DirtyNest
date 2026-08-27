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
  Copy,
  Check,
  Zap,
  Volume2,
  VolumeX,
  Database,
  FileCode,
  CheckCheck,
  Table,
  Play,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  content: string;
  sender: "user" | "bot" | "system";
  timestamp?: string;
  model?: string;
  tokens?: number;
  onSaveToObsidian?: (text: string) => void;
  onOpenArtifact?: (artifact: { title: string; language: string; code: string }) => void;
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

// Inline formatting helper for bold, code, links
function formatInlineMarkdown(text: string) {
  // Regex to split by bold (**text**), inline code (`code`), or links [text](url)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-[#00FF41] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00F0FF] hover:underline font-semibold"
          >
            {match[1]}
          </a>
        );
      }
    }
    return part;
  });
}

// Markdown Formatter Component for AI text
function MarkdownContent({
  text,
  onOpenArtifact,
}: {
  text: string;
  onOpenArtifact?: (artifact: { title: string; language: string; code: string }) => void;
}) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Split content by code fences ```lang\ncode\n```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-sans text-xs text-[#E2E8F0] leading-relaxed select-text w-full">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).split("\n");
          const firstLine = lines[0].trim();
          const language = firstLine || "code";
          const codeBody = (firstLine ? lines.slice(1) : lines).join("\n");

          return (
            <div
              key={idx}
              className="my-3 rounded-xl border border-white/10 bg-[#070913] overflow-hidden font-mono text-[11px] shadow-lg w-full"
            >
              {/* Code block header */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D101E] border-b border-white/10 text-[10px] text-[#9499B3]">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#00FF41]">
                  <FileCode size={13} />
                  <span>{language}</span>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenArtifact && (
                    <button
                      type="button"
                      onClick={() => {
                        cyberAudio.play("warp");
                        onOpenArtifact({
                          title: `Interactive Code Artifact (${language.toUpperCase()})`,
                          language: language || "tsx",
                          code: codeBody,
                        });
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 font-bold transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer text-[10px]"
                      title="Run and preview in split-screen Live Canvas"
                    >
                      <Play size={10} className="fill-[#00FF41]" />
                      <span>RUN IN LIVE CANVAS</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(codeBody, idx)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded hover:bg-white/5"
                  >
                    {copiedCodeIndex === idx ? (
                      <>
                        <CheckCheck size={12} className="text-[#00FF41]" />
                        <span className="text-[#00FF41] font-bold">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code body */}
              <pre className="p-3.5 overflow-x-auto text-[#A6E22E] bg-black/50 leading-relaxed font-mono">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Render standard Markdown elements (Headers, Tables, Lists, Blockquotes, Paragraphs)
        const paragraphs = part.split("\n\n");
        return (
          <div key={idx} className="space-y-3 w-full">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // Markdown Table Detection (contains pipes and table row delimiters)
              if (trimmed.includes("|") && (trimmed.includes("---") || trimmed.includes(":---") || trimmed.split("\n").length >= 2)) {
                const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|") || r.trim().includes("|"));
                if (rows.length >= 2) {
                  const headerRow = rows[0].split("|").filter((c) => c.trim().length > 0);
                  const dataRows = rows.slice(1).filter((r) => !r.includes("---") && !r.includes(":---"));

                  return (
                    <div
                      key={pIdx}
                      className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#070913]/90 shadow-md w-full"
                    >
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="bg-[#0D101E] border-b border-white/10 text-white font-bold">
                            {headerRow.map((cell, cIdx) => (
                              <th key={cIdx} className="px-3.5 py-2.5 text-[11px] text-[#00F0FF] uppercase tracking-wider">
                                {formatInlineMarkdown(cell.trim())}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {dataRows.map((row, rIdx) => {
                            const cells = row.split("|").filter((c) => c.trim().length > 0);
                            return (
                              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                                {cells.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3.5 py-2 text-[11px] text-slate-200">
                                    {formatInlineMarkdown(cell.trim())}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Divider
              if (trimmed === "---" || trimmed === "***") {
                return <hr key={pIdx} className="border-white/10 my-3" />;
              }

              // Header 4
              if (trimmed.startsWith("#### ")) {
                return (
                  <h4 key={pIdx} className="text-xs font-bold text-[#00FF41] pt-2 font-mono flex items-center gap-1.5 uppercase tracking-wider">
                    <span>####</span>
                    <span>{formatInlineMarkdown(trimmed.replace(/^####\s+/, ""))}</span>
                  </h4>
                );
              }
              // Header 3
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={pIdx} className="text-sm font-bold text-white pt-2 text-[#00FF41] font-mono flex items-center gap-1.5">
                    <span>###</span>
                    <span>{formatInlineMarkdown(trimmed.replace(/^###\s+/, ""))}</span>
                  </h3>
                );
              }
              // Header 2
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={pIdx} className="text-sm font-black text-white pt-2.5 text-[#00F0FF] font-mono flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <span>##</span>
                    <span>{formatInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</span>
                  </h2>
                );
              }
              // Header 1
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={pIdx} className="text-base font-black text-white pt-3 text-[#00FF41] font-mono border-b border-white/10 pb-1.5">
                    {formatInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
                  </h1>
                );
              }

              // Blockquote
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={pIdx}
                    className="border-l-2 border-[#00FF41]/60 bg-white/[0.02] pl-3.5 py-2 rounded-r-lg text-slate-300 italic"
                  >
                    {formatInlineMarkdown(trimmed.replace(/^>\s+/, ""))}
                  </blockquote>
                );
              }

              // Bullet List
              if (trimmed.split("\n").some((l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim()))) {
                const listLines = trimmed.split("\n");
                return (
                  <ul key={pIdx} className="space-y-1.5 pl-2">
                    {listLines.map((line, lIdx) => {
                      const cleanLine = line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, "");
                      return (
                        <li key={lIdx} className="flex items-start gap-2">
                          <span className="text-[#00FF41] text-xs select-none mt-0.5">•</span>
                          <span className="flex-1 leading-relaxed">{formatInlineMarkdown(cleanLine)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Regular paragraph with inline bold / code parsing
              return (
                <p key={pIdx} className="leading-relaxed text-slate-200">
                  {formatInlineMarkdown(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function HermesMessageBlock({
  content,
  sender,
  timestamp,
  model,
  tokens,
  onSaveToObsidian,
  onOpenArtifact,
}: Props) {
  const [thoughtExpanded, setThoughtExpanded] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopyFullMessage = () => {
    cyberAudio.play("click");
    // Strip XML tags for pure response copy
    const cleanText = content.replace(/<(thought|tool_call|tool_response)>[\s\S]*?<\/\1>/gi, "").trim();
    navigator.clipboard?.writeText(cleanText || content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = content.replace(/<(thought|tool_call|tool_response)>[\s\S]*?<\/\1>/gi, "").trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // User Message Rendering
  if (sender === "user") {
    return (
      <div className="flex justify-end font-mono select-none my-1.5 animate-slide-up-fade w-full">
        <div className="max-w-3xl p-3.5 sm:p-4 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#F1F3F9] text-xs leading-relaxed space-y-1.5 shadow-[0_0_20px_rgba(0,255,65,0.08)] transition-all duration-200 hover:border-[#00FF41]/50">
          <div className="flex items-center justify-between text-[10px] text-[#4F536E] pb-1 border-b border-white/5">
            <span className="font-bold text-[#00FF41] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-neural-pulse" />
              <span>OPERATOR DIRECTIVE</span>
            </span>
            {timestamp && <span>{timestamp}</span>}
          </div>
          <p className="whitespace-pre-wrap font-sans text-xs pt-0.5 text-slate-100 leading-relaxed select-text">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // System Message Rendering
  if (sender === "system") {
    return (
      <div className="flex justify-center my-2 select-none font-mono animate-slide-up-fade w-full">
        <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] text-[#9499B3] flex items-center gap-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-neural-pulse" />
          <span>{content}</span>
          {timestamp && <span className="text-[#4F536E]">• {timestamp}</span>}
        </div>
      </div>
    );
  }

  // AI Hermes Message Rendering
  const segments = parseHermesContent(content);

  return (
    <div className="flex justify-start font-mono my-2 animate-slide-up-fade w-full">
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#090B14]/95 border border-white/10 text-xs space-y-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-white/20">
        {/* Hermes Message Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.25)]">
              <Brain size={13} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F1F3F9] tracking-wider text-xs">
                HERMES NEURAL SYNAPSE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-neural-pulse" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#00FF41] border border-white/10">
              {model || "Nous-Hermes-3-70B"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#4F536E]">
            {tokens && <span className="text-[#00FF41] font-mono">{tokens} tok</span>}
            {timestamp && <span>{timestamp}</span>}
          </div>
        </div>

        {/* Parsed Segments Stream */}
        <div className="space-y-3 w-full">
          {segments.map((seg, idx) => {
            if (seg.type === "thought") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden w-full shadow-sm"
                >
                  <div
                    onClick={() => {
                      cyberAudio.play("click");
                      setThoughtExpanded(!thoughtExpanded);
                    }}
                    className="flex items-center justify-between p-2.5 px-3.5 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2 text-[#A1A7C4] text-[11px] font-bold group-hover:text-white transition-colors">
                      <Sparkles size={12} className="text-[#00FF41] animate-pulse" />
                      <span>Thinking Process & Cognitive Reasoning</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4F536E] group-hover:text-[#9499B3] transition-colors">
                      <span>{thoughtExpanded ? "Collapse" : "Show details"}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-300 ease-out ${
                          thoughtExpanded ? "rotate-180 text-[#00FF41]" : "text-[#4F536E]"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden font-sans whitespace-pre-wrap bg-black/40 ${
                      thoughtExpanded
                        ? "max-h-[900px] opacity-100 p-3.5 pt-2 border-t border-white/5 text-[11px] text-[#A1A7C4] leading-relaxed"
                        : "max-h-0 opacity-0 p-0 border-t-0"
                    }`}
                  >
                    {seg.content}
                  </div>
                </div>
              );
            }

            if (seg.type === "tool_call") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#070913] p-3 space-y-1.5 font-mono w-full shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-[#00F0FF] text-[10px] font-bold">
                      <Terminal size={12} />
                      <span>FUNCTION INVOCATION // TOOL_CALL</span>
                    </div>
                  </div>

                  <pre className="p-2.5 rounded-lg bg-black/60 text-[10px] text-[#00FF41] overflow-x-auto">
                    <code>{seg.content}</code>
                  </pre>
                </div>
              );
            }

            if (seg.type === "tool_response") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#070913] p-3 space-y-1.5 font-mono w-full shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-[#00FF41] text-[10px] font-bold">
                      <CheckCircle2 size={12} />
                      <span>TOOL RESPONSE TELEMETRY</span>
                    </div>
                    <span className="text-[8px] text-[#4F536E]">STATUS: OK</span>
                  </div>

                  <pre className="p-2.5 rounded-lg bg-black/60 text-[10px] text-slate-300 overflow-x-auto">
                    <code>{seg.content}</code>
                  </pre>
                </div>
              );
            }

            // Rich Markdown Body
            return <MarkdownContent key={idx} text={seg.content} onOpenArtifact={onOpenArtifact} />;
          })}
        </div>

        {/* Bottom Message Action Bar */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px] text-[#9499B3]">
          <div className="flex items-center gap-2">
            {/* Copy Full Message */}
            <button
              type="button"
              onClick={handleCopyFullMessage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Copy message text"
            >
              {copiedAll ? (
                <>
                  <Check size={12} className="text-[#00FF41]" />
                  <span className="text-[#00FF41] font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>COPY</span>
                </>
              )}
            </button>

            {/* Save to Obsidian */}
            <button
              type="button"
              onClick={() => {
                cyberAudio.play("chime");
                if (onSaveToObsidian) {
                  onSaveToObsidian(content);
                } else {
                  window.dispatchEvent(
                    new CustomEvent("dirtynest-add-note", {
                      detail: {
                        title: `Hermes AI Brief - ${new Date().toLocaleDateString()}`,
                        content: content.replace(/<(thought|tool_call|tool_response)>[\s\S]*?<\/\1>/gi, "").trim(),
                        tags: ["hermes-ai", "chat-export"],
                      },
                    })
                  );
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#00F0FF] hover:text-cyan-300 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Save to Obsidian Markdown Notes"
            >
              <Database size={12} />
              <span>SAVE TO OBSIDIAN</span>
            </button>

            {/* Read Aloud (TTS) */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                isSpeaking
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse"
                  : "bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-purple-300"
              }`}
              title={isSpeaking ? "Stop speech audio" : "Read aloud (Text-to-Speech)"}
            >
              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
              <span>{isSpeaking ? "STOP AUDIO" : "READ ALOUD"}</span>
            </button>
          </div>

          <span className="text-[9px] text-[#4F536E]">
            ACP PROTOCOL V2 // VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
}
