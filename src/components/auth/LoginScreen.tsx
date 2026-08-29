"use client";

import { useState } from "react";
import { Lock, User, LogIn, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useRealAuthStore } from "@/stores/useRealAuthStore";

export default function LoginScreen() {
  const login = useRealAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Enter username and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await login(username, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || "Login failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-hidden bg-[#07080E]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,8,14,0.9)_80%,#07080E_100%)]" />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#00FF41]/30 p-6 sm:p-8 flex flex-col font-mono shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,65,0.15)] animate-fade-in"
        style={{ background: "rgba(11, 12, 22, 0.95)", backdropFilter: "blur(30px)" }}
      >
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.3)]">
            <Lock size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-base font-black tracking-wider text-[#00FF41]">DIRTYNEST GATEWAY</div>
            <p className="text-[11px] text-[#9499B3]">OPERATOR AUTHENTICATION REQUIRED</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-shake">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[11px] text-[#4F536E] uppercase font-bold tracking-wider">
            Username
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
                placeholder="admin"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-[11px] text-[#4F536E] uppercase font-bold tracking-wider">
            Password
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F536E] hover:text-white cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all text-xs font-bold cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
          >
            <LogIn size={14} />
            <span>{submitting ? "AUTHENTICATING..." : "AUTHENTICATE"}</span>
          </button>
        </form>

        <div className="mt-4 text-[9px] text-[#4F536E] text-center">
          SECURE CHANNEL // AES-256-GCM // SESSION COOKIE HTTPONLY
        </div>
      </div>
    </div>
  );
}
