"use client";

/**
 * F7.6 — Loading / empty / error overlays for the knowledge graph deck.
 * Keeps the deck's cyber HUD language (Tailwind v4 utilities + mono type).
 */
import { Loader2, Network, RefreshCw, Sparkles } from "lucide-react";

interface GraphStateOverlayProps {
  state: "loading" | "empty" | "error";
  error?: string | null;
  onReload?: () => void;
}

export default function GraphStateOverlay({ state, error, onReload }: GraphStateOverlayProps) {
  return (
    <div
      data-testid="graph-state-overlay"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#020306]/85 backdrop-blur-sm font-mono text-center px-6"
    >
      {state === "loading" && (
        <>
          <Loader2 size={28} className="text-[#00F0FF] animate-spin" />
          <span className="text-xs text-[#9499B3] tracking-widest uppercase">
            LOADING KNOWLEDGE GRAPH...
          </span>
        </>
      )}

      {state === "empty" && (
        <>
          <Network size={26} className="text-[#4F536E]" />
          <span className="text-xs font-bold text-[#9499B3] tracking-wider uppercase">
            KNOWLEDGE GRAPH IS EMPTY
          </span>
          <span className="text-[11px] text-[#4F536E] max-w-sm leading-relaxed">
            No vault documents or graph edges yet. Ingest notes via the Knowledge Vault or sync
            your Obsidian wiki to build the constellation.
          </span>
        </>
      )}

      {state === "error" && (
        <>
          <Sparkles size={26} className="text-[#FF2A6D]" />
          <span className="text-xs font-bold text-[#FF2A6D] tracking-wider uppercase">
            GRAPH LINK OFFLINE
          </span>
          <span className="text-[11px] text-[#9499B3] max-w-sm leading-relaxed">
            {error ? `Could not load /api/knowledge/graph — ${error}` : "Could not load /api/knowledge/graph."}
          </span>
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="mt-1 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] text-[11px] font-bold hover:bg-[#00FF41]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              RETRY SYNC
            </button>
          )}
        </>
      )}
    </div>
  );
}