"use client";

import { useState } from "react";
import { Database, Search, Pin, Trash2, Check, Clock, Brain, Tag, Sparkles } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface MemoryEntry {
  id: string;
  category: "Decisions" | "Preferences" | "Facts" | "Workflows";
  title: string;
  content: string;
  timestamp: string;
  recalls: number;
  isPinned: boolean;
}

const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: "mem-01",
    category: "Preferences",
    title: "Cyberpunk Terminal Aesthetic Preference",
    content: "Operator prefers obsidian backgrounds (#07070B), luminous green accents (#00FF41), and CRT scanline styling.",
    timestamp: "2026-08-20 18:22",
    recalls: 48,
    isPinned: true,
  },
  {
    id: "mem-02",
    category: "Decisions",
    title: "Single Write-Mutex Persistence Architecture",
    content: "All SQLite mutations must execute through @/db persistDb() mutex to prevent multi-process database locks.",
    timestamp: "2026-08-22 14:05",
    recalls: 32,
    isPinned: true,
  },
  {
    id: "mem-03",
    category: "Facts",
    title: "AirGap Isolation Boundary on Port 8080",
    content: "Container dirtynest-auth-proxy enforces Ed25519 signatures and disallows unauthenticated ingress requests.",
    timestamp: "2026-08-23 09:15",
    recalls: 19,
    isPinned: false,
  },
  {
    id: "mem-04",
    category: "Workflows",
    title: "1-Click DORA Metric Audit Pipeline",
    content: "Automated aggregation of lead time for changes, deployment frequency, MTTR, and change failure rate.",
    timestamp: "2026-08-24 16:40",
    recalls: 67,
    isPinned: false,
  },
  {
    id: "mem-05",
    category: "Decisions",
    title: "Bento Grid Dense Auto-Packing Rules",
    content: "Dashboard layout uses [grid-auto-flow:dense] with 2-col full-width spans for wide tactical feeds (RSS, Calendar).",
    timestamp: "2026-08-26 23:35",
    recalls: 12,
    isPinned: true,
  },
];

export default function HermesMemoryInspector() {
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "Decisions", "Preferences", "Facts", "Workflows"];

  const filteredMemories = memories.filter((m) => {
    const matchesCat = activeCategory === "ALL" || m.category === activeCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const togglePin = (id: string) => {
    cyberAudio.play("click");
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  const deleteMemory = (id: string) => {
    cyberAudio.play("error");
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              HERMES PERSISTENT MEMORY // <span className="text-[#00F0FF]">FTS5 RECALL VAULT</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Cross-session recall: user preferences, architectural decisions & learned knowledge
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            placeholder="Search memory graph..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveCategory(cat);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory Cards Stream */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#4F536E]">
            No persistent memories match your query.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className={`p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                mem.isPinned
                  ? "bg-[#00F0FF]/5 border-[#00F0FF]/30"
                  : "bg-black/40 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#00F0FF] border border-white/10 uppercase shrink-0">
                    {mem.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#F1F3F9] truncate">
                    {mem.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-[#4F536E]">
                    Recalled {mem.recalls}x
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePin(mem.id)}
                    className={`p-1 rounded cursor-pointer ${
                      mem.isPinned ? "text-[#00F0FF]" : "text-[#4F536E] hover:text-white"
                    }`}
                    title={mem.isPinned ? "Unpin Memory" : "Pin Memory"}
                  >
                    <Pin size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1 rounded text-[#4F536E] hover:text-[#FF2A6D] cursor-pointer"
                    title="Prune Memory"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#9499B3] leading-relaxed">
                {mem.content}
              </p>

              <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-2 border-t border-white/5">
                <span>Timestamp: {mem.timestamp}</span>
                <span className="text-[#00FF41]">STORED IN SQLITE_FTS5</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
