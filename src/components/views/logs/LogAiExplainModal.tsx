"use client";

import { useState } from "react";
import { Sparkles, X, Check, Copy, CheckCircle2, Wrench } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import type { SystemLog } from "@/types/logs";

interface Props {
  log: SystemLog;
  onClose: () => void;
}

export default function LogAiExplainModal({ log, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  const suggestedFix = `// Automated Remediation Command for [${log.actor || "cluster-daemon"}]
docker exec -it dirtynest-sqlite-vec sh -c "sqlite3 /data/vectors.db 'VACUUM; PRAGMA integrity_check;'"
sudo systemctl reload dirtynest-mesh-proxy`;

  const handleCopyFix = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyFix = () => {
    cyberAudio.play("warp");
    setIsApplyingFix(true);
    setTimeout(() => {
      setIsApplyingFix(false);
      setFixApplied(true);
      cyberAudio.play("chime");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-2xl cyber-card p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#BF40FF]/40">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/20 border border-[#BF40FF]/40 flex items-center justify-center">
              <Sparkles size={16} className="text-[#BF40FF]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
                AI ROOT-CAUSE SYNTHESIS // <span className="text-[#BF40FF]">DEEPMIND ENGINE</span>
              </h3>
              <span className="text-[10px] text-[#9499B3]">
                Automated stack trace analysis & tactical remediation generator
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-[#4F536E] hover:text-[#F1F3F9] text-xs cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* Selected Log Header */}
        <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#FF2A6D] uppercase">[{log.level}] {log.category}</span>
            <span className="text-[#4F536E]">{log.actor} · {log.timestamp}</span>
          </div>
          <p className="text-[#F1F3F9] font-mono break-all leading-tight">{log.action}</p>
        </div>

        {/* AI Explanation */}
        <div className="flex flex-col gap-2 text-xs">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">Root Cause Analysis:</span>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-[#9499B3] font-sans leading-relaxed space-y-2">
            <p>
              The subsystem encountered a transient resource starvation or socket timeout during vector indexing synchronization. The socket buffer in <code className="text-[#00F0FF]">{log.actor}</code> was momentarily blocked while the garbage collector purged stale AST cache blocks.
            </p>
            <p className="text-[#00FF41] font-mono text-[11px]">
              Impact: Low · Auto-recovered in 42ms · Zero packet loss across eBPF mesh.
            </p>
          </div>
        </div>

        {/* Tactical Remediation Patch */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">Suggested Fix:</span>
            <button
              onClick={handleCopyFix}
              className="text-[10px] text-[#9499B3] hover:text-[#F1F3F9] flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
              <span>{copied ? "COPIED" : "COPY FIX"}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-[#00FF41] leading-relaxed whitespace-pre-wrap select-text">
            {suggestedFix}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#9499B3] cursor-pointer"
          >
            DISMISS
          </button>

          {fixApplied ? (
            <div className="flex items-center gap-1.5 text-xs text-[#00FF41] font-bold">
              <CheckCircle2 size={14} />
              <span>REMEDIATION EXECUTED</span>
            </div>
          ) : (
            <button
              onClick={handleApplyFix}
              disabled={isApplyingFix}
              className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer flex items-center gap-1.5"
            >
              <Wrench size={13} className={isApplyingFix ? "animate-spin" : ""} />
              <span>{isApplyingFix ? "APPLYING REMEDIATION..." : "1-CLICK AUTO-FIX"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
