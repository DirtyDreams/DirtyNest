"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Sparkles,
  Code,
  FileCode,
  Star,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

const ALL_DEV_TOOLS = [
  { id: "uuid-gen", name: "UUID / ULID Synthesizer", category: "GENERATOR" },
  { id: "zod-synth", name: "JSON to Zod / TS Synthesizer", category: "TRANSFORMER" },
  { id: "sql-format", name: "SQL Formatter & Minifier", category: "FORMATTER" },
  { id: "epoch-conv", name: "POSIX Unix Epoch Converter", category: "TIME & NETWORK" },
  { id: "token-counter", name: "BPE Token Counter & Pricing", category: "AI & TOKEN" },
  { id: "docker-composer", name: "Dockerfile & Compose Builder", category: "DEVOPS" },
  { id: "jwt", name: "JWT Token Inspector", category: "SECURITY" },
  { id: "regex", name: "Regex Realtime Tester", category: "STRING" },
  { id: "base64", name: "Base64 & Hex Encoder", category: "STRING" },
  { id: "hash", name: "Crypto Digest Generator", category: "SECURITY" },
  { id: "json", name: "JSON Validator & Tree", category: "FORMATTER" },
  { id: "cron", name: "Cron Expression Evaluator", category: "TIME & NETWORK" },
];

export default function ToolsSettingsTab() {
  const toast = useToast();
  const [indentStyle, setIndentStyle] = useState("2");
  const [uuidCasing, setUuidCasing] = useState("lowercase");
  const [pinnedTools, setPinnedTools] = useState<string[]>([
    "uuid-gen",
    "zod-synth",
    "sql-format",
    "token-counter",
    "docker-composer",
  ]);

  useEffect(() => {
    try {
      const savedIndent = localStorage.getItem("dirtynest_tools_indent");
      if (savedIndent) setIndentStyle(savedIndent);
      const savedCase = localStorage.getItem("dirtynest_tools_uuid_case");
      if (savedCase) setUuidCasing(savedCase);
      const savedPinned = localStorage.getItem("dirtynest_tools_pinned");
      if (savedPinned) setPinnedTools(JSON.parse(savedPinned));
    } catch {}
  }, []);

  const togglePin = (id: string) => {
    cyberAudio.play("click");
    const updated = pinnedTools.includes(id)
      ? pinnedTools.filter((t) => t !== id)
      : [...pinnedTools, id];
    setPinnedTools(updated);
    try {
      localStorage.setItem("dirtynest_tools_pinned", JSON.stringify(updated));
    } catch {}
  };

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_tools_indent", indentStyle);
      localStorage.setItem("dirtynest_tools_uuid_case", uuidCasing);
      localStorage.setItem("dirtynest_tools_pinned", JSON.stringify(pinnedTools));
    } catch {}
    toast.success("Tools Matrix Saved", "Developer preferences and pinned tools updated.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <Wrench size={16} />
            <span>Developer Tools Matrix & Workbench Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure pinned favorites, formatter indentation, UUID formatting and syntax defaults
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE TOOLS PREFERENCES</span>
        </button>
      </div>

      {/* Formatter & Code Generation Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Code size={13} className="text-[#00FF41]" />
            <span>Default Code & SQL Indentation</span>
          </label>
          <select
            value={indentStyle}
            onChange={(e) => setIndentStyle(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="2">2 Spaces (Modern Web / TS / React)</option>
            <option value="4">4 Spaces (Standard Backend / Python / Java)</option>
            <option value="tab">Tabs (Hard Tabulation)</option>
          </select>
          <div className="text-[9px] text-[#4F536E]">Used in JSON, SQL and Zod Synthesizer</div>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <FileCode size={13} className="text-[#00F0FF]" />
            <span>UUID & ULID Output Casing</span>
          </label>
          <select
            value={uuidCasing}
            onChange={(e) => setUuidCasing(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="lowercase">lowercase (standard uuidv4)</option>
            <option value="uppercase">UPPERCASE (DATABASE GUID)</option>
          </select>
          <div className="text-[9px] text-[#4F536E]">Default case for batch generation</div>
        </div>
      </div>

      {/* Pinned Favorite Tools */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Star size={14} className="text-[#FFE600]" />
            <span>Pinned Quick-Bar Favorites (Active in Tools View)</span>
          </label>
          <span className="text-[10px] text-[#4F536E]">{pinnedTools.length} Pinned</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {ALL_DEV_TOOLS.map((tool) => {
            const isPinned = pinnedTools.includes(tool.id);
            return (
              <div
                key={tool.id}
                onClick={() => togglePin(tool.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isPinned
                    ? "bg-[#090A14] border-[#00FF41]/40"
                    : "bg-black/40 border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#F1F3F9] truncate">{tool.name}</div>
                  <div className="text-[9px] text-[#4F536E] uppercase">{tool.category}</div>
                </div>

                <Star
                  size={14}
                  className={`shrink-0 ${
                    isPinned ? "text-[#FFE600] fill-[#FFE600]" : "text-[#4F536E]"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
