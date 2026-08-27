"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Search,
  Sparkles,
  Play,
  CheckCircle2,
  X,
  Code2,
  Database,
  Shield,
  Zap,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

interface QuickSkill {
  id: string;
  name: string;
  category: string;
  shortcut: string;
  description: string;
}

const QUICK_SKILLS: QuickSkill[] = [
  {
    id: "skill-cve",
    name: "CVE Vulnerability Triage & Patch",
    category: "Security",
    shortcut: "/cve",
    description: "Scan local repo AST against CVE databases and draft patches",
  },
  {
    id: "skill-pr-review",
    name: "Autonomous PR Review & TS Audit",
    category: "Code",
    shortcut: "/pr",
    description: "Verify zero 'any' types, linting violations, and performance benchmarks",
  },
  {
    id: "skill-sqlite-vac",
    name: "SQLite WAL VACUUM & B-Tree Balancer",
    category: "DB",
    shortcut: "/db-vac",
    description: "Execute PRAGMA optimize & WAL checkpoint on dirtynest.db",
  },
  {
    id: "skill-dora-audit",
    name: "1-Click DORA Engineering Health Brief",
    category: "DevOps",
    shortcut: "/dora",
    description: "Compute deployment frequency, lead time, and MTTR telemetry",
  },
  {
    id: "skill-audio-focus",
    name: "Modulate Cyber Focus Soundscape",
    category: "Zen",
    shortcut: "/zen",
    description: "Adjust binaural beats based on typing velocity",
  },
];

export default function HermesQuickCommandModal({
  isOpen,
  onClose,
  onNavigateToView,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [executingSkill, setExecutingSkill] = useState<string | null>(null);
  const [executedMessage, setExecutedMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setExecutedMessage(null);
      setExecutingSkill(null);
    }
  }, [isOpen]);

  const filteredSkills = QUICK_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.shortcut.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleRunSkill = (skill: QuickSkill) => {
    cyberAudio.play("toggle");
    setExecutingSkill(skill.id);
    setTimeout(() => {
      cyberAudio.play("chime");
      setExecutingSkill(null);
      setExecutedMessage(`✓ Hermes successfully executed [${skill.name}]!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  const handleCustomDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    cyberAudio.play("toggle");
    setExecutedMessage(`✓ Hermes Master Brain ingested directive: "${query.trim()}"`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div
        className="w-full max-w-2xl bg-[#07070B] border border-[#00FF41]/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,255,65,0.2)] flex flex-col gap-4 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Brain size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  HERMES MASTER COMMAND PALETTE // <span className="text-[#00FF41]">CTRL+K</span>
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  NOUS-HERMES-3
                </span>
              </div>
              <p className="text-[10px] text-[#4F536E]">
                Transmit natural language directives or trigger self-created skills
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#4F536E] hover:text-white p-1 rounded cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Command Input Bar */}
        <form onSubmit={handleCustomDirective} className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00FF41]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type directive (e.g. 'Audit /api/auth' or '/cve')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-3 bg-black/80 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#00FF41] text-black font-black text-[10px] hover:bg-[#00cc34] cursor-pointer"
          >
            EXECUTE
          </button>
        </form>

        {/* Execution Alert */}
        {executedMessage && (
          <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{executedMessage}</span>
          </div>
        )}

        {/* Quick Skills List */}
        <div className="space-y-2">
          <div className="text-[9px] uppercase font-bold text-[#4F536E] px-1 flex items-center justify-between">
            <span>Hermes Self-Created Skills ({filteredSkills.length})</span>
            <span>Press Enter to Run</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {filteredSkills.map((skill, idx) => {
              const isSelected = selectedIdx === idx;
              const isRunning = executingSkill === skill.id;

              return (
                <div
                  key={skill.id}
                  onClick={() => handleRunSkill(skill)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isRunning
                      ? "bg-[#00FF41]/20 border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.3)] animate-pulse"
                      : isSelected
                      ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#F1F3F9]"
                      : "bg-black/40 border-white/5 text-[#9499B3] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#00F0FF] border border-white/10 font-bold">
                      {skill.shortcut}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#F1F3F9] block truncate">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-[#4F536E] block truncate">
                        {skill.description}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 shrink-0"
                  >
                    <Play size={10} />
                    <span>{isRunning ? "RUNNING..." : "RUN"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick View Jumps */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#4F536E]">
          <div className="flex items-center gap-2">
            <span>Jump to:</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "chatbot" }));
              }}
              className="text-[#00F0FF] hover:underline cursor-pointer"
            >
              Neural Chatbot
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "control_room" }));
              }}
              className="text-[#00F0FF] hover:underline cursor-pointer"
            >
              Control Room
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "agents" }));
              }}
              className="text-[#00F0FF] hover:underline cursor-pointer"
            >
              AI Agents Fleet
            </button>
          </div>

          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
