"use client";

import { useState, useMemo } from "react";
import { GitCompare, Copy, Check, ArrowRightLeft } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const ORIGINAL_SAMPLE = `// Version 1.0 - Auth Handler
export async function authenticate(req: Request) {
  const token = req.headers.get("authorization");
  if (!token) {
    throw new Error("Missing token");
  }
  return verifyJwt(token);
}`;

const MODIFIED_SAMPLE = `// Version 2.0 - Auth Handler with Rate Limiting & eBPF
export async function authenticate(req: Request) {
  const token = req.headers.get("authorization");
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await checkRateLimit(req.headers.get("x-forwarded-for"));
  return verifyJwtWithMtls(token);
}`;

export default function DiffViewer() {
  const [original, setOriginal] = useState(ORIGINAL_SAMPLE);
  const [modified, setModified] = useState(MODIFIED_SAMPLE);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [copied, setCopied] = useState(false);

  const originalLines = useMemo(
    () => (ignoreWhitespace ? original.split("\n").map((l) => l.trimEnd()) : original.split("\n")),
    [original, ignoreWhitespace]
  );
  const modifiedLines = useMemo(
    () => (ignoreWhitespace ? modified.split("\n").map((l) => l.trimEnd()) : modified.split("\n")),
    [modified, ignoreWhitespace]
  );
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  // Calculate Diff Stats
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i];
      const mod = modifiedLines[i];
      if (orig === undefined && mod !== undefined) additions++;
      else if (orig !== undefined && mod === undefined) deletions++;
      else if (orig !== mod) {
        additions++;
        deletions++;
      } else {
        unchanged++;
      }
    }
    return { additions, deletions, unchanged };
  }, [originalLines, modifiedLines, maxLines]);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(modified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    cyberAudio.play("click");
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none border border-[#00FF41]/30 text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <GitCompare size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SIDE-BY-SIDE DIFF & GIT PATCH INSPECTOR
            </h3>
            <span className="text-[10px] text-slate-400">
              Synchronized 2-pane code comparator with line-by-line diff highlights
            </span>
          </div>
        </div>

        {/* View Mode & Toggles */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setViewMode("split");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === "split"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SPLIT 2-PANE
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setViewMode("unified");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === "unified"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              UNIFIED DIFF
            </button>
          </div>

          <button
            onClick={handleSwap}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Swap Original and Modified"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? "COPIED" : "COPY MODIFIED"}</span>
          </button>
        </div>
      </div>

      {/* Diff Metrics Badge */}
      <div className="flex items-center space-x-3 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
        <span className="text-emerald-400 font-bold">+{stats.additions} additions</span>
        <span className="text-slate-600">•</span>
        <span className="text-rose-400 font-bold">-{stats.deletions} deletions</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">{stats.unchanged} unchanged lines</span>
      </div>

      {/* Editor Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-rose-400 font-bold uppercase">Original Text (Before)</label>
          <textarea
            rows={5}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="p-3 bg-black/60 border border-rose-500/20 focus:border-rose-500/50 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-emerald-400 font-bold uppercase">Modified Text (After)</label>
          <textarea
            rows={5}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="p-3 bg-black/60 border border-emerald-500/20 focus:border-emerald-500/50 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none"
          />
        </div>
      </div>

      {/* Visual Diff View */}
      <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          {viewMode === "split" ? "SIDE-BY-SIDE SYNCHRONIZED COMPARISON:" : "UNIFIED GIT PATCH STREAM:"}
        </span>

        {viewMode === "split" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#040408] border border-white/10 rounded-xl p-3 max-h-72 overflow-y-auto font-mono text-[11px]">
            {/* Left Pane (Original) */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-rose-400 pb-1 border-b border-rose-500/20">ORIGINAL</div>
              {Array.from({ length: maxLines }).map((_, i) => {
                const orig = originalLines[i];
                const mod = modifiedLines[i];
                const isDiff = orig !== mod;

                return (
                  <div
                    key={`orig-${i}`}
                    className={`flex items-start space-x-2 px-2 py-0.5 rounded ${
                      orig === undefined
                        ? "bg-transparent text-slate-700 select-none"
                        : isDiff
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        : "text-slate-400 hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="w-6 text-slate-600 select-none text-right shrink-0">{i + 1}</span>
                    <span className="whitespace-pre-wrap break-all">{orig ?? " "}</span>
                  </div>
                );
              })}
            </div>

            {/* Right Pane (Modified) */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-emerald-400 pb-1 border-b border-emerald-500/20">MODIFIED</div>
              {Array.from({ length: maxLines }).map((_, i) => {
                const orig = originalLines[i];
                const mod = modifiedLines[i];
                const isDiff = orig !== mod;

                return (
                  <div
                    key={`mod-${i}`}
                    className={`flex items-start space-x-2 px-2 py-0.5 rounded ${
                      mod === undefined
                        ? "bg-transparent text-slate-700 select-none"
                        : isDiff
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-400 hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="w-6 text-slate-600 select-none text-right shrink-0">{i + 1}</span>
                    <span className="whitespace-pre-wrap break-all">{mod ?? " "}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#040408] border border-white/10 max-h-72 overflow-y-auto text-[11px] font-mono space-y-1 select-text">
            {Array.from({ length: maxLines }).map((_, i) => {
              const orig = originalLines[i];
              const mod = modifiedLines[i];
              const isDiff = orig !== mod;

              if (!isDiff && orig !== undefined) {
                return (
                  <div key={i} className="flex gap-2 text-slate-400 px-2 py-0.5">
                    <span className="w-6 text-slate-600 select-none text-right shrink-0">{i + 1}</span>
                    <span className="w-4 select-none text-slate-600"> </span>
                    <span className="whitespace-pre-wrap">{orig}</span>
                  </div>
                );
              }

              return (
                <div key={i} className="space-y-0.5">
                  {orig !== undefined && (
                    <div className="flex gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      <span className="w-6 text-rose-500/60 select-none text-right shrink-0">{i + 1}</span>
                      <span className="w-4 select-none text-rose-400 font-bold">-</span>
                      <span className="whitespace-pre-wrap">{orig}</span>
                    </div>
                  )}
                  {mod !== undefined && (
                    <div className="flex gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      <span className="w-6 text-emerald-500/60 select-none text-right shrink-0">{i + 1}</span>
                      <span className="w-4 select-none text-emerald-400 font-bold">+</span>
                      <span className="whitespace-pre-wrap">{mod}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
