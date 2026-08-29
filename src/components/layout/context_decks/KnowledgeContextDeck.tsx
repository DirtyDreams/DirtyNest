"use client";

import { useState } from "react";
import { Database, Check } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function KnowledgeContextDeck() {
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [quickNote, setQuickNote] = useState("");
  const [ingested, setIngested] = useState(false);

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    cyberAudio.play("warp");
    setIngested(true);
    setQuickNote("");
    setTimeout(() => setIngested(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Vector Store Telemetry */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00F0FF]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <Database size={14} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Vector Vault Telemetry
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#00FF41]">SQLITE-VEC</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Dimension</span>
            <span className="font-bold text-[#00F0FF]">1536-dim</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Documents</span>
            <span className="font-bold text-[#00FF41]">48 Files</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Chunks</span>
            <span className="font-bold text-[#BF40FF]">1,240 T</span>
          </div>
        </div>
      </div>

      {/* Cosine Similarity Probe Mini-Slider */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#4F536E] uppercase font-bold">Cosine Threshold (Top-K)</span>
          <span className="text-[#00FF41] font-bold">{similarityThreshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="0.95"
          step="0.05"
          value={similarityThreshold}
          onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
          className="w-full accent-[#00FF41]"
        />
      </div>

      {/* Quick Vector Ingest Scratchpad */}
      <form onSubmit={handleIngest} className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#4F536E]">
            Quick Vector Ingest
          </span>
          {ingested && (
            <span className="text-[9px] font-bold text-[#00FF41] flex items-center gap-1">
              <Check size={10} /> INDEXED
            </span>
          )}
        </div>
        <textarea
          rows={3}
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Paste raw markdown, logs or facts to embed into SQLite-Vec..."
          className="w-full p-2 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-lg text-[10px] text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
        <button
          type="submit"
          disabled={!quickNote.trim()}
          className="w-full py-1.5 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-40"
        >
          EMBED INTO VAULT
        </button>
      </form>
    </div>
  );
}
