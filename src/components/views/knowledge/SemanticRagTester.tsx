"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface RetrievedChunk {
  id: string;
  docTitle: string;
  category: string;
  similarity: number;
  tokens: number;
  snippet: string;
}

const SAMPLE_CHUNKS: RetrievedChunk[] = [
  {
    id: "chunk-01",
    docTitle: "Zero-Trust eBPF Kernel Mesh Architecture",
    category: "System Arch",
    similarity: 0.942,
    tokens: 380,
    snippet: "eBPF maps are pinned to /sys/fs/bpf/dirtynest_mesh to enable zero-copy packet filtration directly at the XDP driver layer before socket buffer allocation...",
  },
  {
    id: "chunk-02",
    docTitle: "Karpathy Skill: NanoGPT KV-Cache Matrix",
    category: "Karpathy Skills",
    similarity: 0.884,
    tokens: 412,
    snippet: "Key-Value cache stores computed projection matrices across autoregressive generation turns, reducing quadratic self-attention complexity to linear per token...",
  },
  {
    id: "chunk-03",
    docTitle: "CVE-2026-9811 OpenSSH Buffer Boundary Advisory",
    category: "Threat Intel",
    similarity: 0.819,
    tokens: 290,
    snippet: "Unauthenticated remote exploit path identified in pam_namespace handling. Mitigation involves strict AppArmor profile confinement and port rebinding...",
  },
];

export default function SemanticRagTester() {
  const [query, setQuery] = useState("eBPF zero-copy packet filtration and KV-cache optimization");
  const [topK, setTopK] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [isQuerying, setIsQuerying] = useState(false);
  const [results, setResults] = useState<RetrievedChunk[]>(SAMPLE_CHUNKS);

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    cyberAudio.play("warp");
    setIsQuerying(true);

    try {
      const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
      const res = await fetch(`${sidecarUrl}/api/hermes/memories/search?q=${encodeURIComponent(query.trim())}&limit=${topK}&threshold=${similarityThreshold}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const mapped: RetrievedChunk[] = data.results.map((r: any, idx: number) => ({
            id: r.id || `chunk-${idx}`,
            docTitle: r.payload?.title || "Semantic Memory Match",
            category: r.payload?.category || "Facts",
            similarity: r.score || 0.85,
            tokens: r.payload?.content ? Math.round(r.payload.content.split(/\s+/).length * 1.3) : 100,
            snippet: r.payload?.content || "",
          }));
          setResults(mapped);
          cyberAudio.play("chime");
        } else {
          setResults([]);
        }
      }
    } catch {
      // demo fallback
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none border border-[#00F0FF]/30 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center">
            <Sparkles size={16} className="text-[#00F0FF]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              SEMANTIC RAG TESTER // <span className="text-[#00F0FF]">VECTOR SIMILARITY PROBE</span>
            </h3>
            <span className="text-[10px] text-[#9499B3]">
              Simulate high-dimensional embedding retrieval & cosine distance scoring
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          QDRANT / BGE-SMALL (384-DIM)
        </span>
      </div>

      {/* Query Form & Hyperparameter Controls */}
      <form onSubmit={handleTestSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any natural language prompt to test vector recall..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-[#00F0FF] text-xs font-mono text-[#F1F3F9] outline-none"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="px-4 py-2.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
          >
            <Search size={13} className={isQuerying ? "animate-spin" : ""} />
            <span>{isQuerying ? "PROBING..." : "QUERY RAG"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#9499B3] pt-1">
          <div className="flex items-center gap-2">
            <span>Top-K Chunks:</span>
            {[3, 5, 8].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTopK(k)}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  topK === k
                    ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40 font-bold"
                    : "bg-white/5 border-white/10 text-[#4F536E]"
                }`}
              >
                K={k}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span>Min Similarity Threshold:</span>
            <span className="font-bold text-[#00FF41]">0.75 Cosine</span>
          </div>
        </div>
      </form>

      {/* Retrieved Chunks Output */}
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
          Top Retrieved Chunks (Sorted by Cosine Distance):
        </span>

        {results.slice(0, topK).map((chunk, idx) => {
          const scorePercent = (chunk.similarity * 100).toFixed(1);
          return (
            <div
              key={chunk.id}
              className="p-3 rounded-xl bg-black/50 border border-white/5 hover:border-white/20 transition-all flex flex-col gap-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#00F0FF]">#{idx + 1}</span>
                  <span className="font-bold text-[#F1F3F9]">{chunk.docTitle}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#4F536E] border border-white/5 font-mono">
                    {chunk.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-[#4F536E]">{chunk.tokens} tokens</span>
                  <span className="text-[10px] font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                    {scorePercent}% SIMILARITY
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#9499B3] font-sans leading-relaxed">
                &ldquo;{chunk.snippet}&rdquo;
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
