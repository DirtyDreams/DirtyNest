"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Fingerprint,
  Key,
  Users,
  Lock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AUTH_PERSONAS, type AuthPresetPersona } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { cyberAudio } from "@/lib/cyberAudio";

export default function AuthLockScreen() {
  const {
    isLocked,
    isAuthenticated,
    currentUser,
    loginWithPersona,
    loginWithPin,
    loginWithBiometrics,
    unlockSession,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<"personas" | "pin" | "biometric">("personas");
  const [pinInput, setPinInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chronometer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Matrix Canvas Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const chars = "0123456789ABCDEF$#@%&*+-/<>~ΞΨΩλπ";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -100));

    const render = () => {
      ctx.fillStyle = "rgba(7, 8, 14, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00FF41";
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright lead character
        if (Math.random() > 0.95) {
          ctx.fillStyle = "#00F0FF";
        } else {
          ctx.fillStyle = "rgba(0, 255, 65, 0.7)";
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSelectPersona = (persona: AuthPresetPersona) => {
    cyberAudio.play("click");
    setSuccessMessage(`Authenticating as ${persona.codename}...`);
    setTimeout(() => {
      loginWithPersona(persona.id);
    }, 300);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput) return;

    if (isLocked && isAuthenticated) {
      const ok = unlockSession(pinInput);
      if (!ok) {
        setErrorMessage("PIN mismatch. Security authorization refused.");
        setPinInput("");
      }
    } else {
      const res = loginWithPin(pinInput);
      if (!res.success) {
        setErrorMessage(res.message);
        setPinInput("");
      }
    }
  };

  const handleKeyPress = (num: string) => {
    cyberAudio.play("click");
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + num);
      setErrorMessage("");
    }
  };

  const handleClearPin = () => {
    cyberAudio.play("click");
    setPinInput("");
    setErrorMessage("");
  };

  const handleBiometricScan = () => {
    cyberAudio.play("click");
    setIsScanning(true);
    setScanProgress(0);
    setErrorMessage("");

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        if (isLocked && isAuthenticated) {
          unlockSession();
        } else {
          loginWithBiometrics();
        }
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden bg-[#07080E]">
      {/* Matrix Rain Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* Cyber Grid Overlay & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,8,14,0.85)_80%,#07080E_100%)] pointer-events-none" />

      {/* Main Security Portal Terminal */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-[#00FF41]/30 p-4 sm:p-8 flex flex-col font-mono shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,65,0.15)] animate-fade-in"
        style={{
          background: "rgba(11, 12, 22, 0.95)",
          backdropFilter: "blur(30px)",
        }}
      >
        {/* Top Military HUD Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.3)]">
              {isLocked ? <Lock size={20} className="animate-pulse" /> : <Shield size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-[#00FF41]">
                  DIRTYNEST GATEWAY
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold animate-pulse">
                  {isLocked ? "TERMINAL LOCKED" : "AUTH REQUIRED"}
                </span>
              </div>
              <p className="text-[11px] text-[#9499B3]">
                PROTOCOL: AES-256-GCM // NODE://ROOT/MAIN // CHRONO: {currentTime}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#4F536E]">
            <Radio size={14} className="text-[#00FF41] animate-pulse" />
            <span>SECURE LINK ACTIVE</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setAuthMode("personas");
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              authMode === "personas"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Users size={14} />
            <span>PERSONAS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setAuthMode("pin");
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              authMode === "pin"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Key size={14} />
            <span>PIN MATRIX</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setAuthMode("biometric");
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              authMode === "biometric"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Fingerprint size={14} />
            <span>NEURAL SCAN</span>
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-shake">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs">
            <CheckCircle2 size={15} className="shrink-0 animate-bounce" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Tactical Personas (1-Click Login) */}
        {authMode === "personas" && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] text-[#4F536E] uppercase font-bold tracking-wider">
              Select Operator Clearance Persona:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AUTH_PERSONAS.map((persona) => {
                const isCurrent = currentUser?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectPersona(persona)}
                    className="flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01]"
                    style={{
                      background: isCurrent ? "rgba(0, 255, 65, 0.05)" : "rgba(255, 255, 255, 0.02)",
                      borderColor: isCurrent ? `${persona.color}60` : "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{persona.avatar}</span>
                        <span className="text-xs font-bold text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors">
                          {persona.codename}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                        style={{
                          color: persona.color,
                          borderColor: `${persona.color}40`,
                          background: `${persona.color}15`,
                        }}
                      >
                        LVL-{persona.clearanceLevel}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#9499B3] line-clamp-2 leading-relaxed mb-2">
                      {persona.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono text-[#4F536E]">
                      <span>PIN: {persona.pin}</span>
                      <span className="text-[#00FF41] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-bold">
                        ENGAGE <ArrowRight size={10} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: PIN Matrix */}
        {authMode === "pin" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <form onSubmit={handlePinSubmit} className="w-full max-w-xs flex flex-col items-center gap-3">
              <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 focus-within:border-[#00FF41]/50 text-center tracking-[0.5em] text-lg font-bold text-[#00FF41]">
                <span>{pinInput.padEnd(4, "•").replace(/./g, (c, i) => (i < pinInput.length ? "●" : "○"))}</span>
                <span className="text-[10px] tracking-normal text-[#4F536E]">HINT: 1337 / 2077</span>
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "OK"].map((key) => {
                  if (key === "CLR") {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={handleClearPin}
                        className="py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        CLR
                      </button>
                    );
                  }
                  if (key === "OK") {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePinSubmit()}
                        className="py-2.5 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 hover:bg-[#00FF41]/30 text-[#00FF41] text-xs font-bold transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      >
                        AUTH
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyPress(key)}
                      className="py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00FF41]/40 hover:text-[#00FF41] text-[#F1F3F9] text-sm font-bold transition-all cursor-pointer active:scale-95"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Neural / Biometric Scanner */}
        {authMode === "biometric" && (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
            <div className="relative">
              {/* Pulsing Concentric Rings */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#00F0FF]/30 ${
                  isScanning ? "animate-ping opacity-40" : ""
                }`}
              />
              <button
                type="button"
                onClick={handleBiometricScan}
                disabled={isScanning}
                className={`relative w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isScanning
                    ? "bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                    : "bg-white/[0.03] border-white/20 text-[#9499B3] hover:border-[#00F0FF]/50 hover:text-[#00F0FF]"
                }`}
              >
                <Fingerprint size={42} className={isScanning ? "animate-pulse" : ""} />
                <span className="text-[9px] font-bold tracking-wider">
                  {isScanning ? `${scanProgress}%` : "TAP TO SCAN"}
                </span>
              </button>
            </div>

            <div className="max-w-xs">
              <div className="text-xs font-bold text-[#F1F3F9] mb-1">
                {isScanning ? "DECRYPTING NEURAL PATTERN..." : "SYNAPSE & RETINAL VERIFICATION"}
              </div>
              <p className="text-[10px] text-[#4F536E]">
                Simulates hardware security key and cryptographic zero-knowledge proof verification.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#4F536E]">
          <span>DIRTYNEST ACCESS GATE v2.4</span>
          <span className="text-[#00FF41]">STATUS: ONLINE (ENCRYPTED)</span>
        </div>
      </div>
    </div>
  );
}
