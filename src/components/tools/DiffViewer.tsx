"use client";

import { useState } from "react";
import { GitCompare, Copy, Sparkles, Check, ArrowRightLeft } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(modified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none border border-[#00FF41]/30">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-[#00FF41]" />
          <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
            SIDE-BY-SIDE DIFF & GIT PATCH INSPECTOR
          </h3>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
        >
          {copied ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
          <span>{copied ? "COPIED" : "COPY MODIFIED"}</span>
        </button>
      </div>

      {/* Editor Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-red-400 font-bold uppercase">Original Text (Before)</label>
          <textarea
            rows={6}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="p-3 bg-black/60 border border-red-500/20 focus:border-red-500/50 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#00FF41] font-bold uppercase">Modified Text (After)</label>
          <textarea
            rows={6}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="p-3 bg-black/60 border border-[#00FF41]/20 focus:border-[#00FF41]/50 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none"
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">Visual Unified Diff:</span>
        <div className="p-3 rounded-xl bg-[#040408] border border-white/10 max-h-60 overflow-y-auto text-[11px] font-mono space-y-0.5 select-text">
          {Array.from({ length: maxLines }).map((_, i) => {
            const orig = originalLines[i];
            const mod = modifiedLines[i];
            const isDiff = orig !== mod;

            if (!isDiff && orig !== undefined) {
              return (
                <div key={i} className="flex gap-2 text-[#9499B3] px-2 py-0.5">
                  <span className="w-6 text-[#4F536E] select-none text-right shrink-0">{i + 1}</span>
                  <span className="w-4 select-none text-[#4F536E]"> </span>
                  <span className="whitespace-pre-wrap">{orig}</span>
                </div>
              );
            }

            return (
              <div key={i} className="flex flex-col space-y-0.5">
                {orig !== undefined && (
                  <div className="flex gap-2 text-red-300 bg-red-500/10 px-2 py-0.5 rounded">
                    <span className="w-6 text-red-500 select-none text-right shrink-0">{i + 1}</span>
                    <span className="w-4 select-none text-red-500 font-bold">-</span>
                    <span className="whitespace-pre-wrap">{orig}</span>
                  </div>
                )}
                {mod !== undefined && (
                  <div className="flex gap-2 text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded">
                    <span className="w-6 text-[#00FF41] select-none text-right shrink-0">{i + 1}</span>
                    <span className="w-4 select-none text-[#00FF41] font-bold">+</span>
                    <span className="whitespace-pre-wrap">{mod}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
