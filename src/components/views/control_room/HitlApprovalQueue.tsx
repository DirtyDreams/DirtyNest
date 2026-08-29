import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function HitlApprovalQueue() {
  const { pendingGate, resolveGateClearance } = useHermesAcpStore();

  const handleApprove = async () => {
    if (!pendingGate) return;
    cyberAudio.play("chime");
    await resolveGateClearance(pendingGate.request_id, "ALLOW_ONCE");
  };

  const handleReject = async () => {
    if (!pendingGate) return;
    cyberAudio.play("error");
    await resolveGateClearance(pendingGate.request_id, "DENY");
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
          {pendingGate ? 1 : 0} AWAITING CLEARANCE
        </span>
      </div>

      {!pendingGate ? (
        <div className="py-6 flex flex-col items-center justify-center text-center text-xs text-[#4F536E] gap-2">
          <ShieldCheck size={24} className="text-[#00FF41]/40" />
          <p>Zero pending approval gates. All autonomous agents operate within clearance boundaries.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div
            className="p-3.5 rounded-xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded border text-red-500 bg-red-500/10 border-red-500/30 uppercase"
                >
                  {pendingGate.risk_level}
                </span>
                <span className="font-bold text-[#F1F3F9]">{pendingGate.tool_name}</span>
                <span className="text-[10px] text-[#4F536E]">Session ID: {pendingGate.session_id}</span>
              </div>
              <p className="text-[11px] text-[#9499B3] font-sans leading-tight">
                Parameters: {JSON.stringify(pendingGate.parameters)}
              </p>
              {pendingGate.diff_preview && (
                <pre className="mt-2 p-2 bg-black text-[10px] font-mono text-[#00FF41] border border-white/5 rounded overflow-x-auto max-w-full">
                  {pendingGate.diff_preview}
                </pre>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <button
                onClick={handleReject}
                className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <X size={13} />
                <span>REJECT</span>
              </button>

              <button
                onClick={handleApprove}
                className="px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer flex items-center gap-1"
              >
                <Check size={13} />
                <span>APPROVE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
