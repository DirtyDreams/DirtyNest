"use client";

import { useState, useEffect } from "react";
import { Database, Search, Pin, Trash2, Check, Clock, Brain, Tag, Sparkles } from "lucide-react";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
import { cyberAudio } from "@/lib/cyberAudio";

export default function HermesMemoryInspector() {
  const { allMemories, fetchMemories, deleteMemory, isMemoryLoading } = useHermesAcpStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchMemories();
  }, []);

  const categories = ["ALL", "Fact", "Decision", "Preference", "Workflow"];

  const filteredMemories = allMemories.filter((m) => {
    const matchesCat = activeCategory === "ALL" || m.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    cyberAudio.play("error");
    await deleteMemory(id);
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
              HERMES PERSISTENT MEMORY // <span className="text-[#00F0FF]">POSTGRESQL RECALL VAULT</span>
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
            placeholder="Search memory..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchMemories(e.target.value);
            }}
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
        {isMemoryLoading ? (
          <div className="py-12 text-center text-xs text-[#00F0FF] animate-pulse">
            Accessing database core...
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#4F536E]">
            No persistent memories match your query.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-xl border border-white/5 bg-black/40 hover:border-white/15 transition-all flex flex-col gap-2"
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
                  {mem.recall_count !== undefined && (
                    <span className="text-[9px] text-[#4F536E]">
                      Recalls: {mem.recall_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(mem.id)}
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

              {mem.tags && mem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {mem.tags.map((t) => (
                    <span key={t} className="text-[9px] text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.2 rounded border border-[#00FF41]/20">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-2 border-t border-white/5">
                <span>Timestamp: {mem.created_at ? new Date(mem.created_at).toLocaleString() : "just now"}</span>
                <span className="text-[#00FF41]">STORED IN POSTGRESQL</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
