"use client";

import { useState, useRef, useEffect } from "react";
<<<<<<< HEAD
import {
  Lock,
  LogOut,
  ChevronDown,
} from "lucide-react";
=======
import { Lock, LogOut, ChevronDown } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { AUTH_PERSONAS } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { cyberAudio } from "@/lib/cyberAudio";

interface UserStatusPillProps {
  inSidebar?: boolean;
}

export default function UserStatusPill({ inSidebar = false }: UserStatusPillProps) {
  const { currentUser, switchPersona, lockSession, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [_showToken, _setShowToken] = useState(false);
  const [_copied, setCopied] = useState(false);
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

  const _handleCopyToken = () => {
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

  if (inSidebar) {
    return (
      <div className="relative w-full shrink-0 flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("click");
            setOpen(!open);
          }}
          className={`w-full relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-left cursor-pointer touch-manipulation group/btn border font-mono ${
            open
              ? "bg-white/[0.08] border-white/30 text-[#F1F3F9] shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              : "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/20 text-[#9499B3] hover:text-[#F1F3F9]"
          }`}
          title="Active Operator Identity & Security Clearance"
          aria-label="User Security Menu"
        >
          <span className="text-sm shrink-0">{currentUser?.avatar || "⚡"}</span>

          <span
            className="text-xs font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1 truncate text-[#F1F3F9]"
            style={{
              fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            }}
          >
            {currentUser?.codename || "OPERATOR"}
          </span>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${colors.text} ${colors.border} ${colors.bg}`}
          >
            LVL-{currentUser?.clearanceLevel || 1}
          </span>

          <ChevronDown
            size={12}
            className={`text-[#4F536E] shrink-0 opacity-0 group-hover:opacity-100 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu popped beside the sidebar */}
        {open && (
          <div
            className="absolute left-full bottom-0 ml-3 w-72 p-3 z-50 animate-fade-in rounded-2xl flex flex-col font-mono border border-white/15"
            style={{
              background: "rgba(10, 11, 20, 0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 255, 65, 0.15)",
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
                          <span className="text-[9px] text-[#4F536E]">{p.role}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${
                        p.clearanceLevel === 5 ? "text-[#00FF41] border-[#00FF41]/40" :
                        p.clearanceLevel === 3 ? "text-[#00F0FF] border-[#00F0FF]/40" :
                        p.clearanceLevel === 2 ? "text-[#BF40FF] border-[#BF40FF]/40" : "text-slate-400 border-white/10"
                      }`}>
                        L{p.clearanceLevel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Lock Session & Logout */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  lockSession();
                  setOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Lock size={12} className="text-amber-400" />
                <span>LOCK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  logout();
                  setOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
              >
                <LogOut size={12} />
                <span>EXIT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

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
                        <span className="text-[9px] text-[#4F536E]">{p.role}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${
                      p.clearanceLevel === 5 ? "text-[#00FF41] border-[#00FF41]/40" :
                      p.clearanceLevel === 3 ? "text-[#00F0FF] border-[#00F0FF]/40" :
                      p.clearanceLevel === 2 ? "text-[#BF40FF] border-[#BF40FF]/40" : "text-slate-400 border-white/10"
                    }`}>
                      L{p.clearanceLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions: Lock Session & Logout */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                lockSession();
                setOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Lock size={12} className="text-amber-400" />
              <span>LOCK</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                logout();
                setOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut size={12} />
              <span>EXIT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
