"use client";

import { useState, useMemo } from "react";
import { Key, Copy, Check, AlertCircle, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfOTkwMjEiLCJuYW1lIjoiQW50aWdyYXZpdHkgT3BlcmF0b3IiLCJyb2xlIjoiU3VwZXJTaGVsbEFkbWluIiwiaWF0IjoxNzU2MjMzNjAwLCJleHAiOjE3ODc3OTUyMDAsImlzcyI6Imh0dHBzOi8vZGlydHluZXN0LmxvY2FsIn0.eX_7G89K5aBcDEF1234567890abcdef-GHIJKL_MNOP";

export default function JwtDebugger() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-4.5 font-mono">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-[#00FF41]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            JWT Token Inspector & Decoder
          </h3>
        </div>
        <button
          onClick={() => {
            cyberAudio.play("click");
            setToken(SAMPLE_JWT);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>LOAD SAMPLE</span>
        </button>
      </div>

      {/* Input Token Box */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
          Encoded JWT Token
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your eyJhbGciOi... token here"
          rows={4}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF41] text-xs font-mono text-[#F1F3F9] outline-none resize-none transition-all placeholder:text-[#4F536E] selection:bg-[#00FF41]/20"
        />
      </div>

      {/* Error State */}
      {parsed && !parsed.valid && (
        <div className="p-3.5 rounded-xl bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-[#FF2A6D] text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{parsed.error}</span>
        </div>
      )}

      {/* Decoded Sections */}
      {parsed && parsed.valid && (
        <div className="flex flex-col gap-4">
          {/* Expiration Status Banner */}
          {expirationInfo && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                expirationInfo.isExpired
                  ? "bg-[#FF2A6D]/10 border-[#FF2A6D]/30 text-[#FF2A6D]"
                  : "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={15} />
                <span>
                  {expirationInfo.isExpired ? "TOKEN EXPIRED:" : "TOKEN ACTIVE:"}{" "}
                  {expirationInfo.dateStr}
                </span>
              </div>
              <span className="font-bold">
                {expirationInfo.isExpired
                  ? `Expired ${expirationInfo.timeAgoOrLeft} ago`
                  : `Valid for next ${expirationInfo.timeAgoOrLeft}`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#BF40FF]">
                  <ShieldCheck size={14} />
                  <span>HEADER: ALGORITHM & TOKEN TYPE</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(parsed.header, null, 2), "header")
                  }
                  className="p-1 rounded text-[#9499B3] hover:text-[#BF40FF] transition-all cursor-pointer"
                  title="Copy Header JSON"
                >
                  {copiedSection === "header" ? <Check size={14} className="text-[#00FF41]" /> : <Copy size={14} />}
                </button>
              </div>
              <pre className="text-xs text-[#BF40FF] bg-black/40 p-3 rounded-lg overflow-x-auto selection:bg-[#BF40FF]/20">
                {JSON.stringify(parsed.header, null, 2)}
              </pre>
            </div>

            {/* Signature Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00FF41]">
                  <Key size={14} />
                  <span>SIGNATURE VERIFICATION SEGMENT</span>
                </div>
                <button
                  onClick={() => copyToClipboard(parsed.signature || "", "sig")}
                  className="p-1 rounded text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
                  title="Copy Signature"
                >
                  {copiedSection === "sig" ? <Check size={14} className="text-[#00FF41]" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="text-xs text-[#00FF41] bg-black/40 p-3 rounded-lg break-all font-mono">
                {parsed.signature}
              </div>
              <p className="text-[10px] text-[#4F536E] mt-1">
                HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
              </p>
            </div>
          </div>

          {/* Payload Box (Full width) */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF]">
                <Clock size={14} />
                <span>PAYLOAD: CLAIMS & USER DATA</span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(parsed.payload, null, 2), "payload")
                }
                className="p-1 rounded text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
                title="Copy Payload JSON"
              >
                {copiedSection === "payload" ? <Check size={14} className="text-[#00FF41]" /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="text-xs text-[#00F0FF] bg-black/40 p-3.5 rounded-lg overflow-x-auto selection:bg-[#00F0FF]/20">
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
