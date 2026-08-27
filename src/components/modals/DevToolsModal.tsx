"use client";

import { useState } from "react";
import {
  Wrench,
  X,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Binary,
  Clock,
  Code2,
  Key,
} from "lucide-react";

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "base64" | "uuid" | "epoch" | "json" | "hash";

export default function DevToolsModal({ isOpen, onClose }: DevToolsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("base64");
  const [copied, setCopied] = useState<string | null>(null);

  // Base64 state
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");

  // UUID state
  const [uuidCount, setUuidCount] = useState(3);
  const [uuids, setUuids] = useState<string[]>([
    "4ea6216b-116a-4504-9890-7152216d03a1",
  ]);

  // Epoch state
  const [epochInput, setEpochInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [epochResult, setEpochResult] = useState<string>("");

  // JSON state
  const [jsonInput, setJsonInput] = useState('{"status":"active","code":200,"service":"dirtynest"}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Hash state
  const [hashInput, setHashInput] = useState("");
  const [hashOutput, setHashOutput] = useState("");

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  // Base64 handlers
  const handleEncodeB64 = () => {
    try {
      setB64Output(btoa(b64Input));
    } catch {
      setB64Output("Error: Failed to encode to Base64");
    }
  };

  const handleDecodeB64 = () => {
    try {
      setB64Output(atob(b64Input));
    } catch {
      setB64Output("Error: Invalid Base64 string");
    }
  };

  // UUID generator
  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          list.push(crypto.randomUUID());
        } else {
          list.push(
            "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            })
          );
        }
      } catch {
        list.push(Math.random().toString(36).substring(2, 15));
      }
    }
    setUuids(list);
  };

  // Epoch converter
  const handleConvertEpoch = () => {
    const num = Number(epochInput);
    if (isNaN(num)) {
      setEpochResult("Invalid numerical timestamp");
      return;
    }
    // Check if seconds or milliseconds
    const date = new Date(num > 100000000000 ? num : num * 1000);
    setEpochResult(
      `UTC: ${date.toUTCString()}\nISO: ${date.toISOString()}\nLocal: ${date.toLocaleString()}`
    );
  };

  // JSON format
  const handleFormatJson = (minify = false) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`JSON Syntax Error: ${e.message}`);
    }
  };

  // Hash SHA-256
  const handleHash = async () => {
    if (!hashInput) return;
    const msgBuffer = new TextEncoder().encode(hashInput);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setHashOutput(hashHex);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col cyber-card overflow-hidden animate-modal-pop shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
        style={{
          border: "1px solid rgba(0, 255, 65, 0.3)",
          background: "rgba(11, 12, 20, 0.95)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
              <Wrench size={16} />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[#F1F3F9] uppercase tracking-wider">
                Developer Utilities Matrix
              </h2>
              <p className="text-[10px] font-mono text-[#4F536E]">
                DIRTYNEST // CORE DEVTOOL SUITE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#9499B3] hover:text-[#FF2A6D] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-white/5 bg-black/20 px-3 overflow-x-auto scrollbar-none text-[11px] font-mono shrink-0">
          {[
            { id: "base64", label: "Base64", icon: Binary },
            { id: "uuid", label: "UUID Generator", icon: Key },
            { id: "epoch", label: "Epoch Converter", icon: Clock },
            { id: "json", label: "JSON Formatter", icon: Code2 },
            { id: "hash", label: "SHA-256 Hash", icon: Hash },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#00FF41] text-[#00FF41] font-bold bg-white/[0.02]"
                    : "border-transparent text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {/* Base64 Tab */}
          {activeTab === "base64" && (
            <div className="space-y-3">
              <textarea
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                placeholder="Enter string to encode or Base64 to decode..."
                className="w-full h-24 bg-[#07070B] rounded-xl p-3 text-xs font-mono text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEncodeB64}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all"
                >
                  ENCODE BASE64
                </button>
                <button
                  onClick={handleDecodeB64}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30 hover:bg-[#BF40FF]/25 transition-all"
                >
                  DECODE BASE64
                </button>
              </div>
              {b64Output && (
                <div className="relative mt-2">
                  <div className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#00F0FF] break-all">
                    {b64Output}
                  </div>
                  <button
                    onClick={() => copyToClipboard(b64Output, "b64")}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
                  >
                    {copied === "b64" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UUID Tab */}
          {activeTab === "uuid" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#9499B3]">Generate count:</span>
                {[1, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setUuidCount(cnt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono ${
                      uuidCount === cnt
                        ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 font-bold"
                        : "bg-white/5 text-[#9499B3]"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
                <button
                  onClick={generateUuids}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all"
                >
                  <RefreshCw size={12} />
                  <span>GENERATE</span>
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {uuids.map((id, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#00FF41]"
                  >
                    <span>{id}</span>
                    <button
                      onClick={() => copyToClipboard(id, `uuid-${idx}`)}
                      className="p-1 rounded hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
                    >
                      {copied === `uuid-${idx}` ? (
                        <Check size={13} className="text-[#00FF41]" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Epoch Tab */}
          {activeTab === "epoch" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder="Unix timestamp in seconds or ms..."
                  className="flex-1 bg-[#07070B] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] outline-none"
                />
                <button
                  onClick={() => {
                    const now = Math.floor(Date.now() / 1000).toString();
                    setEpochInput(now);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-[#9499B3]"
                >
                  NOW
                </button>
                <button
                  onClick={handleConvertEpoch}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25"
                >
                  CONVERT
                </button>
              </div>

              {epochResult && (
                <pre className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#00F0FF] leading-relaxed">
                  {epochResult}
                </pre>
              )}
            </div>
          )}

          {/* JSON Formatter */}
          {activeTab === "json" && (
            <div className="space-y-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste raw JSON here..."
                className="w-full h-44 bg-[#07070B] rounded-xl p-3 text-xs font-mono text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFormatJson(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25"
                >
                  PRETTIFY (2 SPACES)
                </button>
                <button
                  onClick={() => handleFormatJson(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-[#9499B3]"
                >
                  MINIFY
                </button>
                <button
                  onClick={() => copyToClipboard(jsonInput, "json")}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
                >
                  {copied === "json" ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                  <span>COPY JSON</span>
                </button>
              </div>
              {jsonError && (
                <div className="p-2.5 rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-xs font-mono text-[#FF2A6D]">
                  {jsonError}
                </div>
              )}
            </div>
          )}

          {/* Hash SHA-256 */}
          {activeTab === "hash" && (
            <div className="space-y-3">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="String to hash with SHA-256..."
                className="w-full bg-[#07070B] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleHash()}
              />
              <button
                onClick={handleHash}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25"
              >
                COMPUTE SHA-256
              </button>
              {hashOutput && (
                <div className="relative mt-2">
                  <div className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#BF40FF] break-all">
                    {hashOutput}
                  </div>
                  <button
                    onClick={() => copyToClipboard(hashOutput, "hash")}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
                  >
                    {copied === "hash" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
