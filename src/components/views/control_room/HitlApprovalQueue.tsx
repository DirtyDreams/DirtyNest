"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Check, X, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ApprovalItem {
  id: string;
  agent: string;
  action: string;
  details: string;
  risk: "CRITICAL" | "ELEVATED" | "STANDARD";
  timestamp: string;
}

const INITIAL_REQUESTS: ApprovalItem[] = [
  {
    id: "req-1",
    agent: "Codex Code Synthesis",
    action: "REF_COMPOSE_NETWORK_MUTATION",
    details: "Apply live port bindings and rebuild Docker bridge network on dirtynest-db cluster.",
    risk: "CRITICAL",
    timestamp: "1m ago",
  },
  {
    id: "req-2",
    agent: "Hermes Agent Core",
    action: "GIT_FORCE_PR_MERGE",
    details: "Auto-merge PR #44 (telemetry enhancements) into main after 100% test pass.",
    risk: "ELEVATED",
    timestamp: "3m ago",
  },
  {
    id: "req-3",
    agent: "OpenCode Local",
    action: "CACHE_INODE_PRUNE",
    details: "Prune 1.4GB temporary embeddings cache in Qdrant vector memory storage.",
    risk: "STANDARD",
    timestamp: "8m ago",
  },
];

export default function HitlApprovalQueue() {
  const [requests, setRequests] = useState<ApprovalItem[]>(INITIAL_REQUESTS);
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string, actionName: string) => {
    cyberAudio.play("chime");
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setLastActionNotice(`APPROVED: ${actionName} executed successfully.`);
    setTimeout(() => setLastActionNotice(null), 3000);
  };

  const handleReject = (id: string, actionName: string) => {
    cyberAudio.play("error");
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setLastActionNotice(`REJECTED: ${actionName} cancelled and rolled back.`);
    setTimeout(() => setLastActionNotice(null), 3000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3.5 font-mono select-none border border-amber-500/25">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400" />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            HITL GATEKEEPER // <span className="text-amber-400">HUMAN APPROVAL QUEUE</span>
          </h3>
        </div>

        <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
          {requests.length} AWAITING CLEARANCE
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-center text-xs text-[#4F536E] gap-2">
          <ShieldCheck size={24} className="text-[#00FF41]/40" />
          <p>Zero pending approval gates. All autonomous agents operate within clearance boundaries.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((req) => {
            const riskColor = req.risk === "CRITICAL" ? "#FF003C" : req.risk === "ELEVATED" ? "#FFB800" : "#00F0FF";
            return (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: riskColor,
                        background: `${riskColor}15`,
                        borderColor: `${riskColor}40`,
                      }}
                    >
                      {req.risk}
                    </span>
                    <span className="font-bold text-[#F1F3F9]">{req.action}</span>
                    <span className="text-[10px] text-[#4F536E]">by {req.agent}</span>
                  </div>
                  <p className="text-[11px] text-[#9499B3] font-sans leading-tight">
                    {req.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <button
                    onClick={() => handleReject(req.id, req.action)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X size={13} />
                    <span>REJECT</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req.id, req.action)}
                    className="px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>APPROVE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastActionNotice && (
        <div className="p-2.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs text-[#00FF41] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} />
          <span>{lastActionNotice}</span>
        </div>
      )}
    </div>
  );
}
