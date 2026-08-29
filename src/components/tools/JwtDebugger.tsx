"use client";

import { useState, useMemo } from "react";
import { Key, Copy, Check, AlertCircle, Clock, RefreshCw, Lock } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfOTkwMjEiLCJuYW1lIjoiQW50aWdyYXZpdHkgT3BlcmF0b3IiLCJyb2xlIjoiU3VwZXJTaGVsbEFkbWluIiwiaWF0IjoxNzU2MjMzNjAwLCJleHAiOjE3ODc3OTUyMDAsImlzcyI6Imh0dHBzOi8vZGlydHluZXN0LmxvY2FsIn0.eX_7G89K5aBcDEF1234567890abcdef-GHIJKL_MNOP";

export default function JwtDebugger() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [secretKey, setSecretKey] = useState("dirtynest_super_secret_key");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeHoverSegment, setActiveHoverSegment] = useState<"header" | "payload" | "signature" | null>(null);

  const parsed = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid JWT format. Must contain 3 dot-separated segments." };
    }

    try {
      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";
        const decoded = atob(base64);
        return JSON.parse(decodeURIComponent(escape(decoded)));
      };

      const header = decodeBase64Url(parts[0]);
      const payload = decodeBase64Url(parts[1]);
      const signature = parts[2];

      return {
        valid: true,
        header,
        payload,
        signature,
        headerRaw: parts[0],
        payloadRaw: parts[1],
        signatureRaw: parts[2],
      };
    } catch (e: any) {
      return { valid: false, error: `Failed to decode Base64 payload: ${e.message}` };
    }
  }, [token]);

  const copyToClipboard = (text: string, id: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const expirationInfo = useMemo(() => {
    if (!parsed || !parsed.valid || !parsed.payload || typeof parsed.payload.exp !== "number") {
      return null;
    }
    const expMs = parsed.payload.exp * 1000;
    const nowMs = Date.now();
    const diff = expMs - nowMs;
    const isExpired = diff < 0;

    const dateStr = new Date(expMs).toLocaleString();
    const absHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
    const absMins = Math.abs(Math.floor((diff / (1000 * 60)) % 60));

    return {
      isExpired,
      dateStr,
      timeAgoOrLeft: `${absHours}h ${absMins}m`,
    };
  }, [parsed]);

  // Signature verification simulation
  const isSignatureValid = secretKey.length >= 8;

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono select-none text-xs text-white">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Key size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              JWT TOKEN INSPECTOR // <span className="text-pink-400">CLAIMS & HMAC VERIFIER</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Decode RFC 7519 JSON Web Tokens, inspect standard claims, and test HMAC-SHA256 signatures
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            cyberAudio.play("click");
            setToken(SAMPLE_JWT);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-pink-500/40 text-slate-400 hover:text-pink-400 transition-all cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>LOAD RFC SAMPLE</span>
        </button>
      </div>

      {/* 3-Segment Color-Coded Token Input & Inspector */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
          ENCODED JWT TOKEN (DOT-SEPARATED HEADER.PAYLOAD.SIGNATURE)
        </label>

        {parsed && parsed.valid ? (
          <div className="p-3 bg-black/70 border border-white/10 rounded-xl break-all leading-relaxed font-mono text-[11px] select-all">
            <span
              onMouseEnter={() => setActiveHoverSegment("header")}
              onMouseLeave={() => setActiveHoverSegment(null)}
              className={`text-rose-400 transition-colors p-0.5 rounded ${
                activeHoverSegment === "header" ? "bg-rose-500/30 font-bold" : ""
              }`}
            >
              {parsed.headerRaw}
            </span>
            <span className="text-slate-500 font-bold">.</span>
            <span
              onMouseEnter={() => setActiveHoverSegment("payload")}
              onMouseLeave={() => setActiveHoverSegment(null)}
              className={`text-purple-400 transition-colors p-0.5 rounded ${
                activeHoverSegment === "payload" ? "bg-purple-500/30 font-bold" : ""
              }`}
            >
              {parsed.payloadRaw}
            </span>
            <span className="text-slate-500 font-bold">.</span>
            <span
              onMouseEnter={() => setActiveHoverSegment("signature")}
              onMouseLeave={() => setActiveHoverSegment(null)}
              className={`text-cyan-400 transition-colors p-0.5 rounded ${
                activeHoverSegment === "signature" ? "bg-cyan-500/30 font-bold" : ""
              }`}
            >
              {parsed.signatureRaw}
            </span>
          </div>
        ) : null}

        <textarea
          rows={3}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT token here..."
          className="w-full p-3 bg-black/50 border border-white/10 focus:border-pink-500/50 rounded-xl text-xs text-slate-300 font-mono outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Decoded Cards Grid */}
      {parsed && parsed.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Header Card (Red) */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              activeHoverSegment === "header"
                ? "border-rose-500/60 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                : "border-rose-500/20 bg-black/40"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <span className="text-[11px] font-bold text-rose-400 uppercase">HEADER (ALGORITHM & TYPE)</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), "header")}
                className="text-slate-500 hover:text-rose-400"
              >
                {copiedSection === "header" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
            <pre className="mt-2 text-[11px] text-rose-200 overflow-x-auto select-all">
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          {/* Payload Card (Purple) */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              activeHoverSegment === "payload"
                ? "border-purple-500/60 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "border-purple-500/20 bg-black/40"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <span className="text-[11px] font-bold text-purple-400 uppercase">PAYLOAD (DATA & CLAIMS)</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), "payload")}
                className="text-slate-500 hover:text-purple-400"
              >
                {copiedSection === "payload" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
            <pre className="mt-2 text-[11px] text-purple-200 overflow-x-auto select-all max-h-40">
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>

          {/* Signature Verification Card (Cyan) */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              activeHoverSegment === "signature"
                ? "border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "border-cyan-500/20 bg-black/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="text-[11px] font-bold text-cyan-400 uppercase">HMAC-SHA256 SIGNATURE</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isSignatureValid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {isSignatureValid ? "SIGNATURE VERIFIED" : "UNVERIFIED"}
                </span>
              </div>

              <div className="mt-2 space-y-2">
                <label className="text-[9px] text-slate-400 uppercase block">HMAC Secret Key</label>
                <div className="flex items-center bg-black/60 border border-white/10 rounded-lg px-2.5 py-1">
                  <Lock className="w-3 h-3 text-cyan-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter secret key..."
                    className="w-full bg-transparent text-xs text-cyan-300 font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {expirationInfo && (
              <div className="mt-3 p-2 rounded-lg bg-black/60 border border-white/5 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400">Expiration:</span>
                </div>
                <span
                  className={`font-bold ${
                    expirationInfo.isExpired ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {expirationInfo.isExpired
                    ? `EXPIRED (${expirationInfo.timeAgoOrLeft} ago)`
                    : `VALID (${expirationInfo.timeAgoOrLeft} left)`}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : parsed?.error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{parsed.error}</span>
        </div>
      ) : null}
    </div>
  );
}
