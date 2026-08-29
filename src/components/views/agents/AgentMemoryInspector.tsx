"use client";

import { useState } from "react";
import { Database, Trash2, X, Sparkles, CheckCircle2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface MemoryItem {
  id: string;
  type: "SHORT_TERM" | "VECTOR_RECALL" | "SYSTEM_DIRECTIVE";
  content: string;
  relevance: number;
  timestamp: string;
}

interface Props {
  agentName: string;
  agentColor: string;
  onClose: () => void;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    type: "SYSTEM_DIRECTIVE",
    content: "Enforce zero-regression policy. Verify TypeScript compilation before staging git commits.",
    relevance: 1.0,
    timestamp: "Permanent Root",
  },
  {
    id: "mem-2",
    type: "SHORT_TERM",
    content: "Active focus: Refactoring ToolsView.tsx and optimizing Overview bento grid masonry stream.",
    relevance: 0.96,
    timestamp: "2m ago",
  },
  {
    id: "mem-3",
    type: "VECTOR_RECALL",
    content: "Vector cluster #342: eBPF packet filter rules and SQLite-vec embedding distance metrics (cosine 0.94).",
    relevance: 0.88,
    timestamp: "14m ago",
  },
  {
    id: "mem-4",
    type: "SHORT_TERM",
    content: "JWT security token vault verified with 15-minute idle timeout and Level 5 Root clearance.",
    relevance: 0.82,
    timestamp: "28m ago",
  },
];

export default function AgentMemoryInspector({ agentName, agentColor, onClose }: Props) {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [newEntry, setNewEntry] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    cyberAudio.play("error");
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;
    cyberAudio.play("chime");

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      type: "SHORT_TERM",
      content: newEntry.trim(),
      relevance: 0.95,
      timestamp: "Just now",
    };

    setMemories((prev) => [newMem, ...prev]);
    setNewEntry("");
    setNotice("Memory injected into agent context buffer.");
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div
        className="w-full max-w-2xl cyber-card p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border"
        style={{ borderColor: `${agentColor}50` }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${agentColor}20`, border: `1px solid ${agentColor}50` }}>
              <Database size={16} style={{ color: agentColor }} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider">
                {agentName} // CONTEXT MEMORY INSPECTOR
              </h3>
              <span className="text-[10px] text-[#9499B3]">
                Inspect & inject short-term cache and vector recall nodes
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-[#4F536E] hover:text-[#F1F3F9] text-xs cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* Quick Inject Input */}
        <form onSubmit={handleAddMemory} className="flex gap-2">
          <input
            type="text"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Inject memory cue into active context cache..."
            className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-xs font-mono text-[#F1F3F9] outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>INJECT</span>
          </button>
        </form>

        {notice && (
          <div className="p-2.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs text-[#00FF41] flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={13} />
            <span>{notice}</span>
          </div>
        )}

        {/* Memory List */}
        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          {memories.map((mem) => {
            const typeColor = mem.type === "SYSTEM_DIRECTIVE" ? "#BF40FF" : mem.type === "VECTOR_RECALL" ? "#00F0FF" : "#00FF41";
            return (
              <div
                key={mem.id}
                className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col gap-1.5 text-xs hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: typeColor,
                        background: `${typeColor}15`,
                        borderColor: `${typeColor}40`,
                      }}
                    >
                      {mem.type}
                    </span>
                    <span className="text-[10px] text-[#4F536E]">{mem.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#9499B3]">Relevance: {(mem.relevance * 100).toFixed(0)}%</span>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="text-[#4F536E] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-[#F1F3F9] font-sans text-xs leading-relaxed">{mem.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
