"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Keyboard,
  Command,
  Zap,
  RotateCcw,
  Download,
  X,
  Search,
  Check,
  Sliders,
  Sparkles,
  Layers,
  AlertTriangle,
  FileCode,
  Terminal,
  Activity,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface HotkeyBinding {
  id: string;
  keyCombo: string;
  actionName: string;
  category: "DECKS" | "SYSTEM" | "TOOLS" | "MACROS";
  description: string;
  isCustom?: boolean;
}

const DEFAULT_BINDINGS: HotkeyBinding[] = [
  // 🕹️ SYSTEM SHORTCUTS
  { id: "sys_search", keyCombo: "Ctrl + K", actionName: "Omni-Search Spotlight v2.0", category: "SYSTEM", description: "Search across all notes, CVEs, containers, agent swarms & logs" },
  { id: "sys_paperclip", keyCombo: "Ctrl + Shift + P", actionName: "Paperclip Enterprise Control Plane", category: "SYSTEM", description: "Open multi-team agent orchestrator and budget monitor" },
  { id: "sys_terminal", keyCombo: "` (Backtick)", actionName: "Cyber Terminal Dock", category: "SYSTEM", description: "Toggle bottom interactive CLI terminal & session replayer" },
  { id: "sys_float_os", keyCombo: "Shift + F", actionName: "Float OS Desktop Manager", category: "SYSTEM", description: "Toggle multi-window floating cyberpunk operating system" },
  { id: "sys_help", keyCombo: "Shift + ?", actionName: "Keyboard Macro & Hotkey Studio", category: "SYSTEM", description: "Open interactive visual mechanical keyboard HUD" },

  // 🚀 DECKS NAVIGATION (G + KEY)
  { id: "deck_overview", keyCombo: "G + O", actionName: "Overview Mission HUD", category: "DECKS", description: "Navigate to Dashboard overview and quick status widgets" },
  { id: "deck_agents", keyCombo: "G + A", actionName: "Paperclip AI Swarm Matrix", category: "DECKS", description: "Navigate to Agent Control Plane & Team Architecture" },
  { id: "deck_knowledge", keyCombo: "G + K", actionName: "Knowledge Obsidian Vault", category: "DECKS", description: "Navigate to 2D Graph Visualizer and markdown DataCore" },
  { id: "deck_docker", keyCombo: "G + D", actionName: "Docker Hub Container Deck", category: "DECKS", description: "Navigate to Docker containers, logs & Compose architect" },
  { id: "deck_tools", keyCombo: "G + T", actionName: "Developer Tools Suite", category: "DECKS", description: "Navigate to 16+ dev tools, crypto hashers & schema generators" },
  { id: "deck_chat", keyCombo: "G + C", actionName: "AI Tactical Chat Nexus", category: "DECKS", description: "Navigate to Hermes 3 / Gemini multi-agent chat interface" },
  { id: "deck_sound", keyCombo: "G + V", actionName: "Sound Studio & Voice Matrix", category: "DECKS", description: "Navigate to Web Speech TTS & real-time DSP voice changer" },
  { id: "deck_image", keyCombo: "G + I", actionName: "Image Studio Neural Canvas", category: "DECKS", description: "Navigate to SDXL Turbo latent workbench & prompt matrix" },
  { id: "deck_security", keyCombo: "G + X", actionName: "Security Audit Matrix", category: "DECKS", description: "Navigate to CVE vulnerability scanner & MITRE ATT&CK radar" },
  { id: "deck_stats", keyCombo: "G + S", actionName: "Telemetry & Prometheus PromQL", category: "DECKS", description: "Navigate to hybrid 16-Core CPU matrix & live metrics" },
];

// Physical Keyboard Keys layout rows
const KEYBOARD_ROWS = [
  // Function Row
  ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  // Number Row
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  // Row 1 (QWERTY)
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  // Row 2 (ASDF)
  ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
  // Row 3 (ZXCV)
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift_R"],
  // Bottom Row
  ["Ctrl", "Win", "Alt", "Space", "Alt_R", "Win_R", "Ctrl_R"],
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardHotkeyStudioModal({ isOpen, onClose }: Props) {
  const [bindings, setBindings] = useState<HotkeyBinding[]>(DEFAULT_BINDINGS);
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>("K");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isCopied, setIsCopied] = useState(false);

  // Load custom bindings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_custom_hotkeys");
      if (saved) {
        setBindings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to physical key events when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key.toUpperCase();
      if (e.key === " ") key = "SPACE";
      if (e.key === "Escape") key = "ESC";
      if (e.key === "Control") key = "CTRL";
      if (e.key === "Shift") key = "SHIFT";
      if (e.key === "Alt") key = "ALT";
      if (e.key === "Meta") key = "WIN";

      setActivePhysicalKey(key);
      setSelectedKey(key);
      cyberAudio.play("click");
    };

    const handleKeyUp = () => {
      setActivePhysicalKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen]);

  // Find bindings for selected key
  const keyBindings = useMemo(() => {
    if (!selectedKey) return [];
    const search = selectedKey.toUpperCase();
    return bindings.filter((b) => b.keyCombo.toUpperCase().includes(search));
  }, [selectedKey, bindings]);

  // Filtered bindings list
  const filteredBindings = useMemo(() => {
    return bindings.filter((b) => {
      if (selectedCategory !== "ALL" && b.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.actionName.toLowerCase().includes(q) ||
          b.keyCombo.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bindings, selectedCategory, searchQuery]);

  const handleExportJson = () => {
    cyberAudio.play("chime");
    const json = JSON.stringify(bindings, null, 2);
    navigator.clipboard.writeText(json);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetDefaults = () => {
    cyberAudio.play("click");
    setBindings(DEFAULT_BINDINGS);
    localStorage.removeItem("dirtynest_custom_hotkeys");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs select-none"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Keyboard size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  KEYBOARD MACRO & HOTKEY STUDIO // <span className="text-[#00FF41]">ANSI 80% HUD</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  LIVE KEYPRESS DETECTION
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Visual mechanical keycap mapping, tactile switch audio feedback & global shortcut matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* VISUAL MECHANICAL KEYBOARD CHASSIS */}
          <div className="p-4 rounded-2xl bg-black/90 border border-white/15 flex flex-col gap-2 shadow-inner overflow-x-auto">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-1.5 justify-center">
                {row.map((key) => {
                  const keyUpper = key.toUpperCase();
                  const isPressed = activePhysicalKey === keyUpper;
                  const isSelected = selectedKey === keyUpper;
                  const hasBinding = bindings.some((b) => b.keyCombo.toUpperCase().includes(keyUpper));

                  let widthClass = "w-10";
                  if (key === "Backspace") widthClass = "w-18";
                  if (key === "Tab") widthClass = "w-14";
                  if (key === "Caps") widthClass = "w-16";
                  if (key === "Enter") widthClass = "w-18";
                  if (key === "Shift" || key === "Shift_R") widthClass = "w-22";
                  if (key === "Space") widthClass = "w-64";
                  if (key === "Ctrl" || key === "Ctrl_R" || key === "Alt" || key === "Alt_R" || key === "Win" || key === "Win_R") {
                    widthClass = "w-12";
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        cyberAudio.play("click");
                        setSelectedKey(keyUpper);
                      }}
                      className={`h-9 ${widthClass} rounded-lg border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer select-none ${
                        isPressed
                          ? "bg-[#00FF41] text-black border-[#00FF41] shadow-[0_0_15px_#00FF41] scale-95"
                          : isSelected
                          ? "bg-[#00F0FF]/25 text-[#00F0FF] border-[#00F0FF]/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          : hasBinding
                          ? "bg-white/10 text-white border-white/20 hover:border-[#00FF41]/40"
                          : "bg-black/50 text-slate-500 border-white/5 hover:border-white/20"
                      }`}
                    >
                      {key.replace("_R", "")}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Key Inspection & Bindings Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Key Info (4 Cols) */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#090A14] border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SELECTED KEYCAP</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {keyBindings.length} ACTIVE BINDINGS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-black border border-[#00FF41]/40 flex items-center justify-center font-black text-lg text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                  {selectedKey || "—"}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">ANSI Standard Key</div>
                  <p className="text-[10px] text-slate-400">
                    {keyBindings.length > 0 ? "Mapped to platform commands" : "Unbound / Available for macros"}
                  </p>
                </div>
              </div>

              {/* Bindings on this key */}
              <div className="flex flex-col gap-2 mt-1">
                {keyBindings.map((kb) => (
                  <div key={kb.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#00FF41]">{kb.keyCombo}</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                        {kb.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white truncate">{kb.actionName}</span>
                    <span className="text-[9px] text-slate-400 leading-tight">{kb.description}</span>
                  </div>
                ))}

                {keyBindings.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-[10px]">
                    No hotkeys assigned to key "{selectedKey}".
                  </div>
                )}
              </div>
            </div>

            {/* Right Complete Hotkeys Directory (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Category Pills & Search */}
              <div className="flex flex-wrap items-center justify-between gap-2 cyber-card p-3 bg-[#0B0C16] border border-white/10">
                <div className="flex items-center gap-1">
                  {["ALL", "SYSTEM", "DECKS", "TOOLS"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        cyberAudio.play("click");
                        setSelectedCategory(cat);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shortcuts..."
                    className="pl-7 pr-3 py-1 bg-black/60 border border-white/10 rounded-lg text-[10px] text-white focus:border-[#00FF41] outline-none"
                  />
                </div>
              </div>

              {/* Hotkeys Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredBindings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-black/50 border border-white/5 hover:border-white/20 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate">{b.actionName}</span>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        {b.keyCombo}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{b.description}</p>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>RESET TO FACTORY DEFAULTS</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
                >
                  {isCopied ? <Check size={12} className="text-[#00FF41]" /> : <Download size={12} />}
                  <span>{isCopied ? "COPIED JSON!" : "EXPORT PROFILE (.json)"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
