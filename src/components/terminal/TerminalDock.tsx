"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { applyThemePreset } from "@/lib/theme";

interface HistoryEntry {
  type: "input" | "output" | "error" | "system";
  text: string;
}

export default function TerminalDock({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "system", text: "DIRTYNEST KERNEL v2.4.0 (x86_64-node-wasm)" },
    { type: "system", text: "Type 'help' for available directives or 'clear' to purge buffer." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    cyberAudio.playClick();
    const newHistory: HistoryEntry[] = [...history, { type: "input", text: trimmed }];
    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (cmd) {
      case "help":
        newHistory.push({
          type: "output",
          text: `AVAILABLE PROTOCOLS:
  calc <expression>     - Safe arithmetic evaluation (e.g. calc 2^10 + 50*4)
  uuid                  - Generate RFC 4122 v4 identifier
  b64 <text>            - Base64 encode string
  ping <node>           - Ping cluster service (e.g. ping auth)
  theme <name>          - Switch palette (matrix | cyber2077 | synthwave | amber)
  drone                 - Toggle ambient focus theta hum
  weather <city>        - Atmospheric telemetry
  time                  - Display synchronized UTC/Local timestamp
  clear                 - Purge terminal console
  exit                  - Terminate terminal session`,
        });
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "exit":
        onClose();
        return;

      case "calc":
        if (!args) {
          newHistory.push({ type: "error", text: "Usage: calc <expression>" });
        } else {
          try {
            // Safe mathematical expression evaluator
            const sanitized = args.replace(/\^/g, "**").replace(/[^0-9+\-*/().%\s*]/g, "");
            // eslint-disable-next-line no-new-func
            const result = Function(`'use strict'; return (${sanitized})`)();
            newHistory.push({ type: "output", text: `RESULT: ${result}` });
          } catch {
            newHistory.push({ type: "error", text: "Math parsing error: Invalid expression" });
          }
        }
        break;

      case "uuid":
        try {
          if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            newHistory.push({ type: "output", text: `UUID: ${crypto.randomUUID()}` });
          } else {
            const fallbackId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
            newHistory.push({ type: "output", text: `UUID: ${fallbackId}` });
          }
        } catch {
          newHistory.push({ type: "output", text: `UUID: ${Math.random().toString(36).substring(2, 15)}` });
        }
        break;

      case "b64":
        if (!args) {
          newHistory.push({ type: "error", text: "Usage: b64 <text>" });
        } else {
          try {
            newHistory.push({ type: "output", text: `BASE64: ${btoa(args)}` });
          } catch {
            newHistory.push({ type: "error", text: "Base64 encoding error" });
          }
        }
        break;

      case "ping":
        const target = args || "mesh.local";
        const latency = Math.floor(Math.random() * 25) + 8;
        newHistory.push({
          type: "output",
          text: `64 bytes from ${target}: icmp_seq=1 ttl=64 time=${latency}.4ms [PACKET OK]`,
        });
        break;

      case "theme":
        const validThemes = ["matrix", "cyber2077", "synthwave", "amber"];
        if (!validThemes.includes(args.toLowerCase())) {
          newHistory.push({
            type: "error",
            text: `Invalid theme. Available: ${validThemes.join(", ")}`,
          });
        } else {
          applyThemePreset(args.toLowerCase());
          newHistory.push({
            type: "output",
            text: `Cyberpunk palette updated to: ${args.toUpperCase()}`,
          });
        }
        break;

      case "drone":
        const active = cyberAudio.toggleDrone();
        newHistory.push({
          type: "output",
          text: active ? "AMBIENT FOCUS DRONE: ONLINE (55Hz / 58Hz Binaural)" : "AMBIENT FOCUS DRONE: MUTED",
        });
        break;

      case "weather":
        const city = args || "Night City";
        newHistory.push({
          type: "output",
          text: `ATMOSPHERE [${city.toUpperCase()}]: 21°C · Acid Rain: 12% · Wind: 14kt NW · Air Quality: 88 (Moderate)`,
        });
        break;

      case "time":
        newHistory.push({
          type: "output",
          text: `TIMESTAMP: ${new Date().toISOString()} · LOCAL: ${new Date().toLocaleTimeString()}`,
        });
        break;

      default:
        newHistory.push({
          type: "error",
          text: `Unknown directive: '${cmd}'. Type 'help' for available command registry.`,
        });
        break;
    }

    setHistory(newHistory);
    setInput("");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isExpanded ? "h-[500px] max-h-[85vh]" : "h-[300px] max-h-[65vh]"
      } flex flex-col bg-[#07070B]/95 backdrop-blur-2xl border-t border-[#00FF41]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe`}
    >
      {/* Top Console Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 font-mono text-xs text-[#9499B3]">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#00FF41]" />
          <span className="text-[#00FF41] font-bold">DIRTYNEST CLI</span>
          <span className="text-[#4F536E]">•</span>
          <span className="text-[10px] text-[#4F536E]">TTY/1 // SESSION ACTIVE</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-[#9499B3] hover:text-[#FF2A6D]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs">
        {history.map((h, i) => (
          <div key={i} className="leading-relaxed">
            {h.type === "input" && (
              <div className="flex items-center gap-2 text-[#00FF41]">
                <span className="text-[#BF40FF]">operator@dirtynest:~$</span>
                <span className="text-[#F1F3F9]">{h.text}</span>
              </div>
            )}
            {h.type === "output" && (
              <pre className="text-[#00F0FF] whitespace-pre-wrap pl-4 font-mono">
                {h.text}
              </pre>
            )}
            {h.type === "error" && (
              <div className="text-[#FF2A6D] pl-4 font-mono">
                [ERROR] {h.text}
              </div>
            )}
            {h.type === "system" && (
              <div className="text-[#4F536E] font-mono italic">
                # {h.text}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Shell Prompt Input */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-black/60 border-t border-white/5 font-mono text-xs">
        <span className="text-[#BF40FF] shrink-0 font-bold hidden sm:inline">operator@dirtynest:~$</span>
        <span className="text-[#BF40FF] shrink-0 font-bold sm:hidden">~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommand(input);
          }}
          placeholder="Type directive (e.g. 'calc', 'uuid', 'theme')..."
          className="flex-1 min-w-0 bg-transparent outline-none text-[#F1F3F9] placeholder:text-[#4F536E]"
        />
        <button
          onClick={() => handleCommand(input)}
          className="p-1 rounded bg-[#00FF41]/10 text-[#00FF41] hover:bg-[#00FF41]/20"
        >
          <CornerDownLeft size={12} />
        </button>
      </div>
    </div>
  );
}
