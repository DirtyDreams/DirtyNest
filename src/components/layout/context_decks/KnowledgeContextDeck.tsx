"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Database,
  Check,
  TriangleAlert,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

type IngestPhase = "idle" | "submitting" | "ok" | "error";

export default function KnowledgeContextDeck() {
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [quickNote, setQuickNote] = useState("");
  const [ingestPhase, setIngestPhase] = useState<IngestPhase>("idle");
  const [ingestInfo, setIngestInfo] = useState<{ chunks?: number; message?: string }>({});
  const [telemetry, setTelemetry] = useState<{ docs: number; chunks: number; ready: boolean }>({
    docs: 0,
    chunks: 0,
    ready: false,
  });

  const loadTelemetry = useCallback(async () => {
    try {
      const res = await fetch(`${SIDECAR_URL}/api/knowledge/list?limit=500`);
      if (!res.ok) return;
      const data = await res.json();
      const docs = (data.documents || []) as Array<{ chunks?: number }>;
      setTelemetry({
        docs: data.count ?? docs.length,
        chunks: docs.reduce((acc, d) => acc + (d.chunks || 0), 0),
        ready: true,
      });
    } catch {
      // sidecar offline — keep zeros, retry on next ingest
    }
  }, []);

  useEffect(() => {
    loadTelemetry();
  }, [loadTelemetry]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim() || ingestPhase === "submitting") return;

    cyberAudio.play("warp");
    setIngestPhase("submitting");
    setIngestInfo({});

    const derivedTitle = quickNote.trim().split(/\r?\n/)[0].slice(0, 60) || "quick note";
    try {
      const res = await fetch(`${SIDECAR_URL}/api/knowledge/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: derivedTitle,
          content: quickNote,
          source: "quick-vector-ingest",
          category: "note",
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        cyberAudio.play("chime");
        setIngestPhase("ok");
        setIngestInfo({ chunks: data.document?.chunks });
        setQuickNote("");
        loadTelemetry();
        setTimeout(() => setIngestPhase("idle"), 2500);
      } else {
        setIngestPhase("error");
        setIngestInfo({ message: data.error || `HTTP ${res.status}` });
        setTimeout(() => setIngestPhase("idle"), 4000);
      }
    } catch (err) {
      setIngestPhase("error");
      setIngestInfo({ message: err instanceof Error ? err.message : "sidecar unreachable" });
      setTimeout(() => setIngestPhase("idle"), 4000);
    }
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
          <span className="text-[9px] font-bold text-[#00FF41]">{telemetry.ready ? "QDRANT ✓" : "OFFLINE"}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Dimension</span>
            <span className="font-bold text-[#00F0FF]">384-dim</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Documents</span>
            <span className="font-bold text-[#00FF41]">{telemetry.docs}</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Chunks</span>
            <span className="font-bold text-[#BF40FF]">{telemetry.chunks}</span>
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
      <form
        onSubmit={handleIngest}
        className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#4F536E]">
            Quick Vector Ingest
          </span>
          {ingestPhase === "ok" && (
            <span className="text-[9px] font-bold text-[#00FF41] flex items-center gap-1">
              <Check size={10} /> INDEXED{typeof ingestInfo.chunks === "number" ? ` (${ingestInfo.chunks})` : ""}
            </span>
          )}
          {ingestPhase === "error" && (
            <span className="text-[9px] font-bold text-[#FF2A6D] flex items-center gap-1">
              <TriangleAlert size={10} /> {ingestInfo.message?.slice(0, 40) || "FAILED"}
            </span>
          )}
          {ingestPhase === "submitting" && (
            <span className="text-[9px] font-bold text-[#00F0FF] animate-pulse">EMBEDDING…</span>
          )}
        </div>
        <textarea
          rows={3}
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Paste raw markdown, logs or facts to embed into Qdrant..."
          className="w-full p-2 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-lg text-[10px] text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
        <button
          type="submit"
          disabled={!quickNote.trim() || ingestPhase === "submitting"}
          className="w-full py-1.5 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-40"
        >
          EMBED INTO VAULT
        </button>
      </form>
    </div>
  );
}