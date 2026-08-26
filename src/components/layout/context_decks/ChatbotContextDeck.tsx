"use client";

import { useState } from "react";
import {
  Bot,
  Zap,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  FileCode,
  Save,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function ChatbotContextDeck() {
  const [tokensUsed, setTokensUsed] = useState(14820);
  const [costBurn, setCostBurn] = useState(0.044);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Antigravity, an expert cyber-agent specializing in high-throughput full-stack engineering."
  );
  const [saved, setSaved] = useState(false);

  const handleSavePrompt = () => {
    cyberAudio.play("chime");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Token & Cost Burn Meter */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00FF41]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00FF41]">
            <Zap size={14} className="animate-pulse" />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Token Burn & Inference
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#9499B3]">
            Gemini 2.5 Pro
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Tokens</span>
            <span className="font-bold text-[#00FF41]">{(tokensUsed / 1000).toFixed(1)}k</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Est. Cost</span>
            <span className="font-bold text-[#FFB800]">${costBurn.toFixed(3)}</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Latency</span>
            <span className="font-bold text-[#00F0FF]">280ms</span>
          </div>
        </div>
      </div>

      {/* Artifacts Canvas Status */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <FileCode size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Live Canvas Artifacts
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#00FF41]">READY</span>
        </div>
        <p className="text-[10px] text-[#9499B3] font-sans">
          Split-screen sandbox ready for live React, HTML & Tailwind rendering.
        </p>
      </div>

      {/* Quick Directives Scratchpad */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#4F536E]">
            System Directives Buffer
          </span>
          <button
            onClick={handleSavePrompt}
            className="flex items-center gap-1 text-[9px] font-bold text-[#00FF41] hover:underline cursor-pointer"
          >
            {saved ? <Check size={11} /> : <Save size={11} />}
            <span>{saved ? "SAVED" : "SAVE"}</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-lg text-[10px] text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
