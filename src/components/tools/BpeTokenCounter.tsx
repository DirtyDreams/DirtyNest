"use client";

import { useState, useMemo } from "react";
<<<<<<< HEAD
import {
  Calculator,
  Copy,
  Check,
} from "lucide-react";
=======
import { Calculator, Copy, Check } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

const SAMPLE_TEXT = `You are Antigravity, an advanced AI coding assistant designed by Google DeepMind.
Your purpose is to assist developers in architecting, modifying, debugging, and deploying high-performance software systems.
You operate with extreme precision, utilizing rich cybernetic dashboards and autonomous agent swarms.`;

export default function BpeTokenCounter() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    // Standard rule-of-thumb BPE estimation: ~4 chars per token for English text
    const approxTokens = Math.ceil(chars / 3.8);

    const geminiCost = ((approxTokens / 1000000) * 1.25).toFixed(5);
    const claudeCost = ((approxTokens / 1000000) * 3.0).toFixed(5);
    const gpt4oCost = ((approxTokens / 1000000) * 2.5).toFixed(5);
    const deepseekCost = ((approxTokens / 1000000) * 0.14).toFixed(5);

    return { chars, words, approxTokens, geminiCost, claudeCost, gpt4oCost, deepseekCost };
  }, [text]);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              BPE TOKEN COUNTER & PRICING CALCULATOR
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Estimate Byte-Pair Encoding Tokens and Multi-LLM API Inference Costs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText("")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#9499B3] hover:text-white cursor-pointer"
          >
            CLEAR
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "COPIED" : "COPY TEXT"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="cyber-card p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">Characters</span>
          <span className="text-base font-black text-[#F1F3F9] mt-0.5">
            {stats.chars.toLocaleString()}
          </span>
        </div>
        <div className="cyber-card p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">Words</span>
          <span className="text-base font-black text-[#00F0FF] mt-0.5">
            {stats.words.toLocaleString()}
          </span>
        </div>
        <div className="cyber-card p-3 bg-black/40 border border-[#00FF41]/30 rounded-2xl flex flex-col shadow-md">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">Est. BPE Tokens</span>
          <span className="text-base font-black text-[#00FF41] mt-0.5">
            {stats.approxTokens.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Text Area */}
      <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold">
          Prompt Payload Buffer
        </span>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type prompt text..."
          className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Model Pricing Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: "Gemini 2.5 Pro", cost: `$${stats.geminiCost}`, color: "#00FF41" },
          { name: "Claude 3.7 Sonnet", cost: `$${stats.claudeCost}`, color: "#00F0FF" },
          { name: "GPT-4o", cost: `$${stats.gpt4oCost}`, color: "#BF40FF" },
          { name: "DeepSeek R1", cost: `$${stats.deepseekCost}`, color: "#FFB800" },
        ].map((m) => (
          <div
            key={m.name}
            className="cyber-card p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-1"
          >
            <span className="text-[10px] text-[#9499B3] font-bold">{m.name}</span>
            <span className="text-xs font-black" style={{ color: m.color }}>
              {m.cost}
            </span>
            <span className="text-[8px] text-[#4F536E]">Prompt Input Cost</span>
          </div>
        ))}
      </div>
    </div>
  );
}
