"use client";

import { useState, useEffect } from "react";
import { Brain, Search, Plus, Trash2, Tag, Sparkles, RefreshCw, Layers } from "lucide-react";
import { useHermesAcpStore, AcpMemoryItem } from "@/lib/hermes/hermesAcpStore";
import { cyberAudio } from "@/lib/cyberAudio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AcpMemoryBrowser() {
  const { allMemories, isMemoryLoading, fetchMemories, createMemory, deleteMemory } = useHermesAcpStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("architecture");
  const [newTags, setNewTags] = useState("dirtynest, postgres, qdrant");

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("click");
    fetchMemories(searchQuery.trim());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    cyberAudio.play("toggle");
    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const success = await createMemory(newTitle.trim(), newContent.trim(), newCategory, tagsArray);
    if (success) {
      cyberAudio.play("chime");
      setNewTitle("");
      setNewContent("");
      setIsCreateOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    cyberAudio.play("denied");
    await deleteMemory(id);
  };

  return (
    <div className="cyber-card p-4 flex flex-col gap-4 font-mono select-none border-cyan-500/20 bg-black/40">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider flex items-center gap-2">
              <span>QDRANT SEMANTIC MEMORY BROWSER</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                FASTEMBED 384-DIM
              </span>
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Long-term persistent vectors & contextual knowledge recall
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              fetchMemories(searchQuery);
            }}
            disabled={isMemoryLoading}
            className="h-8 px-2.5 bg-white/5 border-white/10 text-[10px] text-[#9499B3] hover:text-white"
          >
            <RefreshCw size={11} className={`mr-1 ${isMemoryLoading ? "animate-spin" : ""}`} />
            <span>SYNC</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setIsCreateOpen(!isCreateOpen);
            }}
            className="h-8 px-3 bg-cyan-500 text-black font-black text-[10px] hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Plus size={12} className="mr-1" />
            <span>FORGE FACT</span>
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <Input
            type="text"
            placeholder="Semantic vector search across knowledge base (e.g. 'PostgreSQL architecture', 'ACP HITL rules')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-black/60 border-white/10 text-xs text-[#F1F3F9] font-mono h-9"
          />
        </div>
        <Button
          type="submit"
          disabled={isMemoryLoading}
          className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs h-9 px-4 border border-white/10"
        >
          SEARCH VECTORS
        </Button>
      </form>

      {/* Create Memory Form (Collapsible) */}
      {isCreateOpen && (
        <form onSubmit={handleCreate} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-cyan-400 flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>INJECT NEW ARCHITECTURAL FACT / RULE</span>
            </span>
            <span className="text-[9px] text-[#4F536E]">POSTGRES + QDRANT SYNC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              type="text"
              placeholder="Fact Title (e.g. 'SkillClaw Proxy Settings')"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 bg-black/60 border-white/10 text-xs font-mono h-8 text-[#F1F3F9]"
              required
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2 text-xs text-[#F1F3F9] font-mono h-8"
            >
              <option value="architecture">Architecture</option>
              <option value="security">Security & Guardrails</option>
              <option value="database">Database</option>
              <option value="ai">AI / Swarm Models</option>
              <option value="fact">General Fact</option>
            </select>
          </div>

          <textarea
            placeholder="Detailed fact content, design rules, or code conventions to be recalled during agent execution..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-[#F1F3F9] font-mono resize-none focus:outline-none focus:border-cyan-500/50"
            required
          />

          <div className="flex items-center justify-between gap-2">
            <Input
              type="text"
              placeholder="Comma separated tags: ports, docker, acp"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="flex-1 bg-black/60 border-white/10 text-[10px] font-mono h-7 text-[#9499B3]"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-7 px-2.5 text-[10px] text-[#9499B3]"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 px-3 bg-cyan-500 text-black font-black text-[10px] hover:bg-cyan-400"
              >
                EMBED & STORE
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Memory Items List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {allMemories.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#4F536E]">
            {isMemoryLoading ? "Scanning Qdrant vector space..." : "No semantic memories found matching query."}
          </div>
        ) : (
          allMemories.map((mem: AcpMemoryItem) => (
            <div
              key={mem.id}
              className="p-3 rounded-xl bg-black/50 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col gap-1.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-xs font-bold text-[#F1F3F9] truncate group-hover:text-cyan-300 transition-colors">
                    {mem.title}
                  </span>
                  <Badge variant="outline" className="text-[8px] uppercase font-mono px-1 py-0 border-white/10 text-cyan-400 bg-cyan-500/10">
                    {mem.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {mem.score !== undefined && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                      {Math.round(mem.score * 100)}% SIMILARITY
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(mem.id)}
                    className="text-[#4F536E] hover:text-red-400 transition-colors p-1"
                    title="Delete Memory Fact"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#9499B3] font-mono line-clamp-2 leading-relaxed">
                {mem.content}
              </p>

              {mem.tags && mem.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                  <Tag size={9} className="text-[#4F536E]" />
                  {mem.tags.map((t, idx) => (
                    <span key={idx} className="text-[9px] text-[#4F536E] bg-white/5 px-1 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
