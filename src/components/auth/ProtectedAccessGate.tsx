"use client";

import { ShieldAlert, Lock, ArrowUpRight, ShieldCheck, KeyRound } from "lucide-react";
import { type ClearanceLevel } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { cyberAudio } from "@/lib/cyberAudio";

interface ProtectedAccessGateProps {
  children: React.ReactNode;
  minClearance?: ClearanceLevel;
  requiredPermission?: string;
  viewName?: string;
}

export default function ProtectedAccessGate({
  children,
  minClearance = 1,
  requiredPermission,
  viewName = "Classified Asset",
}: ProtectedAccessGateProps) {
  const { currentUser, hasClearance, hasPermission, switchPersona } = useAuthStore();

  const isLevelAllowed = hasClearance(minClearance);
  const isPermAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  if (isLevelAllowed && isPermAllowed) {
    return <>{children}</>;
  }

  const handleElevateToRoot = () => {
    cyberAudio.play("warp");
    switchPersona("root_operator");
  };

  const handleElevateToNetrunner = () => {
    cyberAudio.play("warp");
    switchPersona("netrunner_devops");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[500px] text-center font-mono select-none">
      <div
        className="w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-red-500/30 flex flex-col items-center shadow-[0_20px_50px_rgba(255,0,50,0.15)] animate-fade-in"
        style={{
          background: "rgba(18, 10, 15, 0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
          <ShieldAlert size={32} />
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 text-xs text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 mb-2">
          <span>CLASSIFIED LEVEL {minClearance} DIRECTIVE</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#F1F3F9] tracking-wider mb-2">
          ACCESS RESTRICTED
        </h2>

        <p className="text-xs text-[#9499B3] max-w-sm mb-6 leading-relaxed">
          The view <span className="text-red-400 font-bold">[{viewName.toUpperCase()}]</span> requires
          Security Clearance Level <span className="text-[#00FF41] font-bold">LVL-{minClearance}</span> or above.
          Your current clearance is <span className="text-amber-400 font-bold">LVL-{currentUser?.clearanceLevel || 1} ({currentUser?.codename})</span>.
        </p>

        {/* Clearance Comparison Gauge */}
        <div className="w-full grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/10 mb-6 text-xs">
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/5">
            <span className="text-[10px] text-[#4F536E]">YOUR CLEARANCE</span>
            <span className="text-base font-bold text-amber-400">
              LEVEL {currentUser?.clearanceLevel || 1}
            </span>
            <span className="text-[9px] text-[#9499B3]">{currentUser?.role.toUpperCase()}</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] text-red-400/70">REQUIRED CLEARANCE</span>
            <span className="text-base font-bold text-red-400">
              LEVEL {minClearance}+
            </span>
            <span className="text-[9px] text-red-400/80">SECURE ZONE</span>
          </div>
        </div>

        {/* Elevation Quick Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          {minClearance <= 3 && (
            <button
              type="button"
              onClick={handleElevateToNetrunner}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 transition-all text-xs font-bold cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Elevate to Netrunner (Lvl 3)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleElevateToRoot}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 transition-all text-xs font-bold cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.2)]"
          >
            <ShieldCheck size={14} />
            <span>Elevate to Root (Lvl 5)</span>
          </button>
        </div>

        {/* Security Audit Note */}
        <div className="mt-4 text-[9px] text-[#4F536E]">
          SECURITY LOG: Access denial event recorded to neural audit log.
        </div>
      </div>
    </div>
  );
}
