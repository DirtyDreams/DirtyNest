"use client";

import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Lock,
  LogOut,
  Users,
  Key,
  ChevronDown,
  Check,
  Zap,
  Copy,
  CheckCheck,
} from "lucide-react";
import { AUTH_PERSONAS } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { cyberAudio } from "@/lib/cyberAudio";

export default function UserStatusPill() {
  const { currentUser, switchPersona, lockSession, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyToken = () => {
    if (currentUser?.token) {
      navigator.clipboard.writeText(currentUser.token);
      setCopied(true);
      cyberAudio.play("chime");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getClearanceColor = (level: number) => {
    switch (level) {
      case 5:
        return { text: "text-[#00FF41]", border: "border-[#00FF41]/40", bg: "bg-[#00FF41]/10" };
      case 3:
        return { text: "text-[#00F0FF]", border: "border-[#00F0FF]/40", bg: "bg-[#00F0FF]/10" };
      case 2:
        return { text: "text-[#BF40FF]", border: "border-[#BF40FF]/40", bg: "bg-[#BF40FF]/10" };
      default:
        return { text: "text-[#9499B3]", border: "border-white/10", bg: "bg-white/5" };
    }
  };

  const colors = getClearanceColor(currentUser?.clearanceLevel || 1);

  return (
    <div className="relative shrink-0 flex items-center h-9" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          cyberAudio.play("click");
          setOpen(!open);
        }}
        className={`h-9 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 font-mono ${
          open
            ? "bg-white/[0.08] border-white/30 text-[#F1F3F9] shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            : "bg-white/[0.03] border-white/10 hover:border-white/20 text-[#9499B3] hover:text-[#F1F3F9]"
        }`}
        title="Active Operator Identity & Security Clearance"
        aria-label="User Security Menu"
      >
        <span className="text-sm">{currentUser?.avatar || "⚡"}</span>

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-bold text-[#F1F3F9] leading-tight">
            {currentUser?.codename || "OPERATOR"}
          </span>
        </div>

        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors.text} ${colors.border} ${colors.bg}`}
        >
          LVL-{currentUser?.clearanceLevel || 1}
        </span>

        <ChevronDown size={12} className={`text-[#4F536E] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 p-3 z-50 animate-fade-in rounded-2xl flex flex-col font-mono border border-white/15"
          style={{
            background: "rgba(10, 11, 20, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 255, 65, 0.1)",
          }}
        >
          {/* Header Identity Card */}
          <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F1F3F9] truncate">
                  {currentUser?.codename}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${colors.text} ${colors.border} ${colors.bg}`}>
                  LVL-{currentUser?.clearanceLevel}
                </span>
              </div>
              <p className="text-[10px] text-[#4F536E] truncate">{currentUser?.email}</p>
            </div>
          </div>

          {/* Quick Switch Persona Section */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold tracking-wider mb-1.5 px-1">
              <span>Switch Persona</span>
              <span className="text-[9px] text-[#00FF41]">Demo RBAC</span>
            </div>

            <div className="space-y-1">
              {AUTH_PERSONAS.map((p) => {
                const isSelected = currentUser?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      switchPersona(p.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all text-xs cursor-pointer border ${
                      isSelected
                        ? "bg-white/[0.08] border-white/20 text-[#00FF41]"
                        : "bg-transparent border-transparent hover:bg-white/[0.03] text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{p.avatar}</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold leading-tight">{p.codename}</span>
                        <span className="text-[9px] text-[#4F536E]">Level {p.clearanceLevel}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={12} className="text-[#00FF41]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            {/* Show JWT Token Toggle */}
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Key size={13} />
                <span>Simulated JWT Token</span>
              </span>
              <span className="text-[10px] font-mono text-[#4F536E]">{showToken ? "HIDE" : "VIEW"}</span>
            </button>

            {/* Token Snippet Box */}
            {showToken && (
              <div className="p-2 rounded-lg bg-black/60 border border-white/10 text-[9px] text-[#00FF41] font-mono break-all relative group">
                <p className="line-clamp-3">{currentUser?.token}</p>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="mt-1.5 flex items-center gap-1 text-[9px] text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
                >
                  {copied ? <CheckCheck size={10} className="text-[#00FF41]" /> : <Copy size={10} />}
                  <span>{copied ? "COPIED TO CLIPBOARD" : "COPY TOKEN"}</span>
                </button>
              </div>
            )}

            {/* Lock Session (Ctrl + L) */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                lockSession();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-amber-500/10 text-xs text-[#9499B3] hover:text-amber-400 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock size={13} />
                <span>Lock Terminal</span>
              </span>
              <kbd className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-[#4F536E]">Ctrl+L</kbd>
            </button>

            {/* Terminate Session */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-xs text-[#9499B3] hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Terminate Session (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
