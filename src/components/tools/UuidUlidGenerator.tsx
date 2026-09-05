"use client";

import { useState } from "react";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

type IdFormat = "UUID_V4" | "UUID_V7" | "ULID" | "NANOID";

function generateRandomId(format: IdFormat, uppercase: boolean, hyphens: boolean): string {
  let result = "";
  if (format === "UUID_V4") {
    result = crypto.randomUUID();
    if (!hyphens) result = result.replace(/-/g, "");
  } else if (format === "UUID_V7") {
    // Monotonic timestamp-first UUID v7 simulation
    const timestamp = Date.now().toString(16).padStart(12, "0");
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const combined = `${timestamp.slice(0, 8)}-${timestamp.slice(8, 12)}-7${rand.slice(0, 3)}-${rand.slice(3, 7)}-${rand.slice(7, 19)}`;
    result = hyphens ? combined : combined.replace(/-/g, "");
  } else if (format === "ULID") {
    // Crockford Base32 26-char ULID simulation
    const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let ulid = "";
    const bytes = crypto.getRandomValues(new Uint8Array(26));
    for (let i = 0; i < 26; i++) {
      ulid += crockford[bytes[i]! % crockford.length];
    }
    result = ulid;
  } else {
    // NanoID 21-char url-safe
    const alphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqwxJpty";
    let nanoid = "";
    const bytes = crypto.getRandomValues(new Uint8Array(21));
    for (let i = 0; i < 21; i++) {
      nanoid += alphabet[bytes[i]! % alphabet.length];
    }
    result = nanoid;
  }

  return uppercase ? result.toUpperCase() : result.toLowerCase();
}

export default function UuidUlidGenerator() {
  const [format, setFormat] = useState<IdFormat>("UUID_V4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [generatedIds, setGeneratedIds] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => generateRandomId("UUID_V4", false, true))
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = () => {
    cyberAudio.play("click");
    setGeneratedIds(
      Array.from({ length: count }, () =>
        generateRandomId(format, uppercase, hyphens)
      )
    );
  };

  const handleCopySingle = (id: string, idx: number) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(id);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleCopyAll = () => {
    cyberAudio.play("chime");
    navigator.clipboard.writeText(generatedIds.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Key size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              UUID & ULID ENTROPY GENERATOR
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Cryptographically Secure Unique Identifiers (v4, v7, ULID, NanoID)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00FF41] font-bold border border-white/10 transition-all cursor-pointer"
          >
            {copiedAll ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedAll ? "COPIED ALL" : "COPY ALL"}</span>
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          >
            <RefreshCw size={12} />
            <span>REGENERATE</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="cyber-card p-4 bg-black/40 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-[#4F536E] uppercase font-bold">Identifier Format</label>
          <select
            value={format}
            onChange={(e) => {
              const fmt = e.target.value as IdFormat;
              setFormat(fmt);
              setGeneratedIds(Array.from({ length: count }, () => generateRandomId(fmt, uppercase, hyphens)));
            }}
            className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none"
          >
            <option value="UUID_V4">UUID v4 (Random Crypto)</option>
            <option value="UUID_V7">UUID v7 (Time-Ordered Monotonic)</option>
            <option value="ULID">ULID (26-char Crockford Base32)</option>
            <option value="NANOID">NanoID (21-char URL-Safe)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-[#4F536E] uppercase font-bold">Batch Quantity</label>
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => {
              const val = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
              setCount(val);
              setGeneratedIds(Array.from({ length: val }, () => generateRandomId(format, uppercase, hyphens)));
            }}
            className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-xs text-[#9499B3] cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => {
                setUppercase(e.target.checked);
                setGeneratedIds((prev) =>
                  prev.map((id) => (e.target.checked ? id.toUpperCase() : id.toLowerCase()))
                );
              }}
              className="accent-[#00FF41]"
            />
            <span>UPPERCASE</span>
          </label>

          {(format === "UUID_V4" || format === "UUID_V7") && (
            <label className="flex items-center gap-2 text-xs text-[#9499B3] cursor-pointer">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => {
                  setHyphens(e.target.checked);
                  handleGenerate();
                }}
                className="accent-[#00FF41]"
              />
              <span>HYPHENS (-)</span>
            </label>
          )}
        </div>
      </div>

      {/* Generated IDs Output Stream */}
      <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold">
          <span>Generated Output ({generatedIds.length} IDs)</span>
          <span className="text-[#00FF41]">128-bit Random Entropy</span>
        </div>

        <div className="space-y-1.5">
          {generatedIds.map((id, idx) => {
            const isCopied = copiedIdx === idx;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-black/60 border border-white/5 hover:border-[#00FF41]/30 flex items-center justify-between gap-2 transition-all group"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-[10px] text-[#4F536E] w-5 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <code className="text-xs font-mono text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors truncate">
                    {id}
                  </code>
                </div>

                <button
                  onClick={() => handleCopySingle(id, idx)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer shrink-0"
                  title="Copy ID"
                >
                  {isCopied ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
