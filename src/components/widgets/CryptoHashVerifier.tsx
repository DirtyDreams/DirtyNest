"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Key,
  Copy,
  Check,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

// Quick synchronous lightweight hashing for browser runtime demo
async function computeSha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function CryptoHashVerifier() {
  const [inputText, setInputText] = useState("DirtyNest-Matrix-Node-01");
  const [algo, setAlgo] = useState<"SHA-256" | "SHA-512">("SHA-256");
  const [computedHash, setComputedHash] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    computeSha256(inputText).then((res) => {
      if (active) setComputedHash(res);
    });
    return () => {
      active = false;
    };
  }, [inputText, algo]);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(computedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatch =
    compareHash.trim().length > 0 &&
    compareHash.trim().toLowerCase() === computedHash.toLowerCase();

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              CRYPTO HASH & INTEGRITY CHECK
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Subtle-Crypto SHA-256 Engine
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-[#00FF41] font-bold cursor-pointer transition-all"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? "COPIED" : "COPY HASH"}</span>
        </button>
      </div>

      {/* Input Text Buffer */}
      <div className="space-y-1">
        <label className="text-[9px] text-[#4F536E] uppercase font-bold">Input Payload</label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Payload to hash..."
          className="w-full px-3 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
        />
      </div>

      {/* Computed Hash Display */}
      <div className="space-y-1">
        <label className="text-[9px] text-[#4F536E] uppercase font-bold">
          Computed Digest (SHA-256)
        </label>
        <div className="p-2.5 rounded-xl bg-black/80 border border-white/5 text-[10px] text-[#00FF41] font-mono break-all leading-relaxed">
          {computedHash || "Computing..."}
        </div>
      </div>

      {/* Hash Verification Probe */}
      <div className="space-y-1 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[#4F536E] uppercase font-bold">Integrity Match Probe</span>
          {compareHash.trim().length > 0 && (
            <span
              className={`font-bold flex items-center gap-1 ${
                isMatch ? "text-[#00FF41]" : "text-red-400"
              }`}
            >
              {isMatch ? <ShieldCheck size={11} /> : <ShieldX size={11} />}
              {isMatch ? "VALID MATCH" : "DIGEST MISMATCH"}
            </span>
          )}
        </div>
        <input
          type="text"
          value={compareHash}
          onChange={(e) => setCompareHash(e.target.value)}
          placeholder="Paste expected hash to verify..."
          className="w-full px-3 py-1.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-[11px] text-[#9499B3] font-mono outline-none"
        />
      </div>
    </div>
  );
}
