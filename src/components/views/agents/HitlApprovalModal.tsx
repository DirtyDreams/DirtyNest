"use client";

import { useEffect } from "react";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileCode, Terminal, Zap, Lock } from "lucide-react";
import { AcpGateItem } from "@/lib/hermes/hermesAcpStore";
import { cyberAudio } from "@/lib/cyberAudio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HitlApprovalModalProps {
  gate: AcpGateItem | null;
  onResolve: (decision: "ALLOW_ONCE" | "ALLOW_SESSION" | "DENY") => void;
}

export default function HitlApprovalModal({ gate, onResolve }: HitlApprovalModalProps) {
  useEffect(() => {
    if (gate) {
      cyberAudio.play("laser");
    }
  }, [gate]);

  useEffect(() => {
    if (!gate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "y" || e.key === "Y") {
        cyberAudio.play("click");
        onResolve("ALLOW_ONCE");
      } else if (e.key === "s" || e.key === "S") {
        cyberAudio.play("click");
        onResolve("ALLOW_SESSION");
      } else if (e.key === "Escape") {
        cyberAudio.play("click");
        onResolve("DENY");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gate, onResolve]);

  if (!gate) return null;

  const isCritical = gate.risk_level === "critical";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#070913] border-2 border-[#FF0055] rounded-2xl shadow-[0_0_40px_rgba(255,0,85,0.4)] overflow-hidden flex flex-col">
        {/* Glowing warning header bar */}
        <div className="bg-[#FF0055]/15 border-b border-[#FF0055]/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF0055]/20 border border-[#FF0055] text-[#FF0055] animate-pulse">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wider uppercase">
                  ZERO-TRUST HITL GATE // <span className="text-[#FF0055]">CLEARANCE REQUIRED</span>
                </h3>
                <Badge
                  variant="outline"
                  className="text-[9px] bg-[#FF0055]/20 text-[#FF0055] border-[#FF0055] font-black uppercase"
                >
                  RISK: {gate.risk_level}
                </Badge>
              </div>
              <p className="text-[11px] text-[#9499B3]">
                Hermes ACP engine paused execution pending operator authorization.
              </p>
            </div>
          </div>

          <span className="text-[10px] text-[#4F536E] font-bold">ID: {gate.request_id}</span>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Tool Info Card */}
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {gate.tool_name === "patch" || gate.tool_name === "write_file" ? (
                <FileCode size={18} className="text-[#00F0FF]" />
              ) : (
                <Terminal size={18} className="text-[#00FF41]" />
              )}
              <div>
                <span className="text-[10px] text-[#4F536E] uppercase block font-bold">Target Tool Action</span>
                <span className="text-xs font-bold text-white font-mono">{gate.tool_name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#4F536E] uppercase block font-bold">Session ID</span>
              <span className="text-xs text-[#00FF41] font-mono">{gate.session_id}</span>
            </div>
          </div>

          {/* Parameters / Diff Preview */}
          {gate.diff_preview ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-[#FFE600]" />
                Proposed AST / Code Mutation Diff:
              </span>
              <pre className="p-3 bg-black/90 border border-[#FF0055]/30 rounded-xl text-xs text-[#00FF41] overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed">
                {gate.diff_preview}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold">Invocation Parameters:</span>
              <pre className="p-3 bg-black/80 border border-white/10 rounded-xl text-xs text-[#F1F3F9] overflow-x-auto font-mono">
                {JSON.stringify(gate.parameters, null, 2)}
              </pre>
            </div>
          )}

          {/* Security policy note */}
          <div className="p-2.5 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center gap-2 text-[11px] text-[#FFB800]">
            <Lock size={14} className="shrink-0" />
            <span>Policy: Granting clearance executes tool immediately on host within workspace boundaries.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => onResolve("DENY")}
            className="text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20"
          >
            <XCircle size={14} className="mr-1.5" />
            <span>DENY & ABORT (Esc)</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onResolve("ALLOW_SESSION")}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-xs text-white font-bold"
            >
              <Zap size={14} className="mr-1.5 text-[#00F0FF]" />
              <span>ALLOW FOR SESSION (S)</span>
            </Button>

            <Button
              onClick={() => onResolve("ALLOW_ONCE")}
              className="bg-[#00FF41] hover:bg-[#00cc34] text-black font-black text-xs shadow-[0_0_15px_rgba(0,255,65,0.4)]"
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              <span>ALLOW ONCE (Y)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
