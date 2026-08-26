"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, AlertCircle, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const PRESETS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "IPv4 Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { name: "URL / Web Address", pattern: "https?:\\/\\/[\\w\\-\\.]+(?:\\:[0-9]+)?(?:\\/[\\w\\-\\._~:/?#[\\]@!$&'()*+,;=]*)?", flags: "gi" },
  { name: "Hex Color Code", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "g" },
  { name: "Semantic Version", pattern: "v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?", flags: "g" },
  { name: "UUID (v4)", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}", flags: "gi" },
];

const SAMPLE_TEXT = `Node cluster initialized at IP 192.168.1.104 with fallback on 10.0.0.1.
Contact system architect via root@dirtynest.local or support@matrix-ops.dev.
Deployment release version v2.5.0-beta.1 verified.
Primary theme palette: #00FF41, #BF40FF, #00F0FF with deep base #07070B.
Session UUID: 4ea6216b-116a-4504-9890-7152216d03a1 verified via https://api.dirtynest.local:3000/v1/auth.`;

export default function RegexTester() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testText, setTestText] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const activeFlagsStr = useMemo(() => {
    let f = "";
    if (flags.g) f += "g";
    if (flags.i) f += "i";
    if (flags.m) f += "m";
    if (flags.s) f += "s";
    return f;
  }, [flags]);

  const regexResult = useMemo(() => {
    if (!pattern.trim()) return null;
    try {
      const reg = new RegExp(pattern, activeFlagsStr);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (flags.g) {
        let m;
        let count = 0;
        while ((m = reg.exec(testText)) !== null && count < 200) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          count++;
          if (m[0].length === 0) reg.lastIndex++; // Avoid infinite loop on zero-length matches
        }
      } else {
        const m = reg.exec(testText);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      return { valid: true, matches, error: null };
    } catch (e: any) {
      return { valid: false, matches: [], error: e.message };
    }
  }, [pattern, activeFlagsStr, testText, flags.g]);

  const loadPreset = (p: typeof PRESETS[0]) => {
    cyberAudio.play("click");
    setPattern(p.pattern);
    setFlags({
      g: p.flags.includes("g"),
      i: p.flags.includes("i"),
      m: p.flags.includes("m"),
      s: p.flags.includes("s"),
    });
  };

  const copyMatches = () => {
    if (!regexResult || !regexResult.matches.length) return;
    cyberAudio.play("click");
    const text = regexResult.matches.map((m) => m.match).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4.5 font-mono">
      {/* Header with Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[#00FF41]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            Regular Expression (RegEx) Lab & Visualizer
          </h3>
        </div>

        {/* Presets Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#4F536E] mr-1">PRESETS:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="px-2 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Input & Flags Selector */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 flex items-center bg-black/50 rounded-xl border border-white/10 focus-within:border-[#00FF41] px-3 py-2 transition-all">
            <span className="text-[#00FF41] font-bold text-sm mr-1.5">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ([a-z]+)@([a-z]+)"
              className="flex-1 bg-transparent outline-none text-xs text-[#F1F3F9] font-mono selection:bg-[#00FF41]/20"
            />
            <span className="text-[#00FF41] font-bold text-sm ml-1.5">/{activeFlagsStr}</span>
          </div>

          {/* Flags Toggles */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: "g", label: "global (g)", active: flags.g },
              { id: "i", label: "case-insens (i)", active: flags.i },
              { id: "m", label: "multiline (m)", active: flags.m },
              { id: "s", label: "dotAll (s)", active: flags.s },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setFlags((prev) => ({ ...prev, [f.id]: !prev[f.id as keyof typeof flags] }));
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  f.active
                    ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                    : "text-[#4F536E] hover:text-[#9499B3] border border-transparent"
                }`}
                title={f.label}
              >
                {f.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Status */}
        {regexResult && !regexResult.valid && (
          <div className="p-2.5 rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-[#FF2A6D] text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>Regex Error: {regexResult.error}</span>
          </div>
        )}
      </div>

      {/* Test String Input & Match Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test Textarea */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
            <span>TEST STRINGS PAYLOAD</span>
            <span>{testText.length} CHARS</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={10}
            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF41] text-xs font-mono text-[#F1F3F9] outline-none resize-none transition-all placeholder:text-[#4F536E] selection:bg-[#00FF41]/20"
          />
        </div>

        {/* Match Inspection Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5 text-[#00FF41]">
              <CheckCircle2 size={12} />
              MATCHES FOUND: {regexResult?.matches.length || 0}
            </span>
            {regexResult && regexResult.matches.length > 0 && (
              <button
                onClick={copyMatches}
                className="flex items-center gap-1 text-[#00FF41] hover:underline cursor-pointer"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? "COPIED" : "COPY ALL MATCHES"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3.5 overflow-y-auto max-h-[240px] flex flex-col gap-2">
            {(!regexResult || regexResult.matches.length === 0) && (
              <div className="text-xs text-[#4F536E] text-center py-8">
                No matching patterns found in test string.
              </div>
            )}

            {regexResult?.matches.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1.5 text-xs hover:border-[#00FF41]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/20">
                    MATCH #{idx + 1} • INDEX {m.index}
                  </span>
                  <span className="text-[10px] text-[#4F536E] font-mono">
                    {m.match.length} chars
                  </span>
                </div>
                <div className="text-[#F1F3F9] font-bold break-all bg-black/40 p-1.5 rounded">
                  {m.match}
                </div>

                {m.groups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.groups.map((g, gIdx) => (
                      <span
                        key={gIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30"
                      >
                        ${gIdx + 1}: {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
