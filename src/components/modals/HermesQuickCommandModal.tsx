"use client";

import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import {
  Brain,
  Search,
  Play,
} from "lucide-react";
=======
import { Brain, Search, Play } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
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
      toast.success(skill.name, {
        description: "Hermes successfully executed directive.",
      });
      setTimeout(() => {
        onClose();
      }, 500);
    }, 1000);
  };

  const handleCustomDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    cyberAudio.play("toggle");
    toast.success("DIRECTIVE INGESTED", {
      description: `Hermes Master Brain processing: "${query.trim()}"`,
    });
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#090B14] border-[#00FF41]/40 text-[#F1F3F9] font-mono p-5 shadow-[0_0_50px_rgba(0,255,65,0.2)]">
        {/* Top Header */}
        <DialogHeader className="pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Brain size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  HERMES MASTER COMMAND PALETTE // <span className="text-[#00FF41]">CTRL+K</span>
                </DialogTitle>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30">
                  NOUS-HERMES-3
                </Badge>
              </div>
              <p className="text-[10px] text-[#4F536E]">
                Transmit natural language directives or trigger self-created skills
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Command Input Bar */}
        <form onSubmit={handleCustomDirective} className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00FF41]" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type directive (e.g. 'Audit /api/auth' or '/cve')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-24 h-11 bg-black/80 border-white/10 focus-visible:border-[#00FF41]/60 text-xs text-[#F1F3F9] font-mono"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 bg-[#00FF41] text-black font-black text-[10px] hover:bg-[#00cc34] cursor-pointer"
          >
            EXECUTE
          </Button>
        </form>

        {/* Quick Skills List */}
        <div className="space-y-2">
          <div className="text-[9px] uppercase font-bold text-[#4F536E] px-1 flex items-center justify-between">
            <span>Hermes Self-Created Skills ({filteredSkills.length})</span>
            <span>Press Enter to Run</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredSkills.map((skill, idx) => {
              const isSelected = selectedIdx === idx;
              const isRunning = executingSkill === skill.id;

              return (
                <div
                  key={skill.id}
                  onClick={() => handleRunSkill(skill)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                    isRunning
                      ? "bg-[#00FF41]/20 border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.3)] animate-pulse"
                      : isSelected
                      ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#F1F3F9]"
                      : "bg-black/40 border-white/5 text-[#9499B3] hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="text-[9px] font-mono bg-white/5 text-[#00F0FF] border-white/10 font-bold">
                      {skill.shortcut}
                    </Badge>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#F1F3F9] block truncate">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-[#4F536E] block truncate">
                        {skill.description}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 border-transparent shrink-0"
                  >
                    <Play size={10} className="mr-1" />
                    <span>{isRunning ? "RUNNING..." : "RUN"}</span>
                  </Button>
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
      </DialogContent>
    </Dialog>
  );
}
