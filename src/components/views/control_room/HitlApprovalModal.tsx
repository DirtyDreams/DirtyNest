"use client";

import { useState } from "react";
import { X, ShieldAlert, Check, Edit3, Code2, RotateCcw } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface PendingApproval {
  id: string;
  stepIdx?: number;
  agent: string;
  toolName: string;
  argsJson: string;
  risk: "CRITICAL" | "ELEVATED" | "STANDARD";
  description: string;
}

interface HitlApprovalModalProps {
  approval: PendingApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, modifiedArgs?: string) => void;
  onDeny: (id: string, reason: string) => void;
}

export default function HitlApprovalModal({
  approval,
  isOpen,
  onClose,
  onApprove,
  onDeny,
}: HitlApprovalModalProps) {
  const [editedArgs, setEditedArgs] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [showDenyInput, setShowDenyInput] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen || !approval) return null;

  const currentArgs = isEditing ? editedArgs : approval.argsJson;

  const handleStartEdit = () => {
    cyberAudio.play("click");
    setEditedArgs(approval.argsJson);
    setIsEditing(true);
    setJsonError(null);
  };

  const handleValidateAndApprove = () => {
    if (isEditing) {
      try {
        JSON.parse(editedArgs);
        setJsonError(null);
      } catch (err: any) {
        cyberAudio.play("error");
        setJsonError(`Invalid JSON syntax: ${err.message}`);
        return;
      }
    }
    cyberAudio.play("chime");
    onApprove(approval.id, isEditing ? editedArgs : undefined);
    onClose();
  };

  const handleConfirmDeny = () => {
    cyberAudio.play("click");
    onDeny(approval.id, denyReason || "Operator rejected execution.");
    onClose();
  };

  const riskColor =
    approval.risk === "CRITICAL" ? "#FF003C" : approval.risk === "ELEVATED" ? "#FFB800" : "#00F0FF";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#090a10] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-5 bg-[#06070c] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg"
              style={{
                borderColor: `${riskColor}50`,
                backgroundColor: `${riskColor}15`,
                color: riskColor,
              }}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  HITL CLEARANCE GATE // <span style={{ color: riskColor }}>{approval.risk}</span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400">Agent: {approval.agent} · Tool: {approval.toolName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-black/50 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Action Description</span>
            <p className="text-slate-200 leading-relaxed text-[11px]">{approval.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>TOOL PAYLOAD ARGUMENTS (JSON)</span>
              </span>

              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>EDIT PAYLOAD</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET ORIGINAL</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedArgs}
                onChange={(e) => setEditedArgs(e.target.value)}
                rows={6}
                className="w-full bg-black/80 border border-cyan-500/40 rounded-xl p-3 font-mono text-[11px] text-cyan-300 outline-none focus:border-cyan-400 transition-colors"
              />
            ) : (
              <div className="p-3 bg-black/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap overflow-x-auto">
                {approval.argsJson}
              </div>
            )}

            {jsonError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-[10px]">
                {jsonError}
              </div>
            )}
          </div>

          {showDenyInput && (
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
              <span className="text-[10px] text-rose-400 uppercase font-bold">OPERATOR REJECTION REASON</span>
              <input
                type="text"
                placeholder="Reason for blocking execution (e.g. 'AirGap policy forbids external port mutation')..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full bg-black/60 border border-rose-500/30 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#06070c] border-t border-slate-800 flex items-center justify-between gap-3">
          {!showDenyInput ? (
            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowDenyInput(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold transition-colors"
            >
              DENY CLEARANCE...
            </button>
          ) : (
            <button
              onClick={handleConfirmDeny}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors shadow-lg"
            >
              CONFIRM BLOCK
            </button>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                cyberAudio.play("click");
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleValidateAndApprove}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)]"
            >
              <Check className="w-4 h-4" />
              <span>APPROVE & DISPATCH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
