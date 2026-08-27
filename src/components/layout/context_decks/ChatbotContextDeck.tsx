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
  Sliders,
  RotateCcw,
  Brain,
  Globe,
  Braces,
  Flame,
  ShieldCheck,
  Code2,
  Lightbulb,
  Search,
  Activity,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ModelPreset {
  name: string;
  icon: typeof Zap;
  color: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  reasoningEffort: "off" | "low" | "medium" | "high" | "max";
  jsonMode: boolean;
  webGrounding: boolean;
}

const PRESETS: Record<string, ModelPreset> = {
  code: {
    name: "Code Gen",
    icon: Code2,
    color: "#00F0FF",
    temperature: 0.1,
    topP: 0.95,
    topK: 40,
    maxTokens: 16384,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    reasoningEffort: "high",
    jsonMode: false,
    webGrounding: false,
  },
  research: {
    name: "Deep Research",
    icon: Search,
    color: "#BF40FF",
    temperature: 0.4,
    topP: 0.9,
    topK: 50,
    maxTokens: 32768,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1,
    reasoningEffort: "max",
    jsonMode: false,
    webGrounding: true,
  },
  creative: {
    name: "Creative",
    icon: Lightbulb,
    color: "#FFB800",
    temperature: 1.15,
    topP: 0.98,
    topK: 80,
    maxTokens: 8192,
    frequencyPenalty: 0.6,
    presencePenalty: 0.5,
    reasoningEffort: "medium",
    jsonMode: false,
    webGrounding: false,
  },
  audit: {
    name: "Strict Audit",
    icon: ShieldCheck,
    color: "#00FF41",
    temperature: 0.0,
    topP: 0.3,
    topK: 20,
    maxTokens: 12288,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    reasoningEffort: "high",
    jsonMode: true,
    webGrounding: false,
  },
};

const MODELS = [
  { id: "nous-hermes-3", name: "Nous-Hermes-3-70B", context: "128k", provider: "Nous Research" },
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet (Thinking)", context: "200k", provider: "Anthropic" },
  { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro Multimodal", context: "1M", provider: "Google DeepMind" },
  { id: "deepseek-r1", name: "DeepSeek-R1 671B Reasoning", context: "128k", provider: "DeepSeek" },
  { id: "gpt-4o", name: "GPT-4o Omnimodal", context: "128k", provider: "OpenAI" },
];

export default function ChatbotContextDeck() {
  const [selectedModel, setSelectedModel] = useState("nous-hermes-3");
  const [tokensUsed, setTokensUsed] = useState(14820);
  const [costBurn, setCostBurn] = useState(0.044);
  const [latency, setLatency] = useState(280);

  // Hyperparameters State
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [reasoningEffort, setReasoningEffort] = useState<"off" | "low" | "medium" | "high" | "max">("high");
  const [jsonMode, setJsonMode] = useState(false);
  const [webGrounding, setWebGrounding] = useState(false);
  const [streamTokens, setStreamTokens] = useState(true);

  // Directives State
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Antigravity, an expert cyber-agent specializing in high-throughput full-stack engineering."
  );
  const [saved, setSaved] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (key: string) => {
    cyberAudio.play("warp");
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setTemperature(p.temperature);
    setTopP(p.topP);
    setTopK(p.topK);
    setMaxTokens(p.maxTokens);
    setFrequencyPenalty(p.frequencyPenalty);
    setPresencePenalty(p.presencePenalty);
    setReasoningEffort(p.reasoningEffort);
    setJsonMode(p.jsonMode);
    setWebGrounding(p.webGrounding);
  };

  const handleResetDefaults = () => {
    cyberAudio.play("click");
    setActivePreset(null);
    setTemperature(0.7);
    setTopP(0.95);
    setTopK(40);
    setMaxTokens(8192);
    setFrequencyPenalty(0.0);
    setPresencePenalty(0.0);
    setReasoningEffort("high");
    setJsonMode(false);
    setWebGrounding(false);
    setStreamTokens(true);
  };

  const handleSavePrompt = () => {
    cyberAudio.play("chime");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full pb-6">
      {/* 1. Token & Cost Burn Telemetry Card */}
      <div className="cyber-card p-3.5 bg-black/70 border border-[#00FF41]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00FF41]">
            <Zap size={14} className="animate-pulse" />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Token Burn & Inference
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-bold">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Tokens</span>
            <span className="font-bold text-[#00FF41]">{(tokensUsed / 1000).toFixed(1)}k</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Est. Cost</span>
            <span className="font-bold text-[#FFB800]">${costBurn.toFixed(3)}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Latency</span>
            <span className="font-bold text-[#00F0FF]">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* 2. FULL MODEL SETTINGS & HYPERPARAMETERS STUDIO */}
      <div className="cyber-card p-3.5 bg-black/70 border border-white/15 rounded-xl space-y-3.5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 rounded-md bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Sliders size={12} />
            </div>
            <div>
              <h4 className="text-[11px] font-black tracking-wider uppercase text-white">
                Model Hyperparameters
              </h4>
              <p className="text-[8px] text-[#4F536E]">Inference Engine Tuning</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[9px] text-[#9499B3] hover:text-white px-2 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw size={10} />
            <span>Reset</span>
          </button>
        </div>

        {/* Model Engine Selector */}
        <div className="space-y-1">
          <label className="text-[9px] text-[#4F536E] uppercase font-bold tracking-wider flex justify-between">
            <span>Active LLM Architecture</span>
            <span className="text-[#00F0FF]">
              {MODELS.find((m) => m.id === selectedModel)?.context} CTX
            </span>
          </label>
          <select
            value={selectedModel}
            onChange={(e) => {
              cyberAudio.play("click");
              setSelectedModel(e.target.value);
            }}
            className="w-full px-2.5 py-1.5 bg-[#070914] border border-white/15 focus:border-[#00F0FF] rounded-lg text-[10px] text-[#F1F3F9] font-mono outline-none cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0A0C16] text-white">
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Presets Grid */}
        <div className="space-y-1.5">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold tracking-wider">
            Operational Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(PRESETS).map(([key, p]) => {
              const Icon = p.icon;
              const isActive = activePreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-[10px] text-left transition-all cursor-pointer border ${
                    isActive
                      ? "bg-white/10 border-white/30 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={12} style={{ color: p.color }} />
                  <span className="font-bold truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hyperparameter Sliders */}
        <div className="space-y-3 pt-1 border-t border-white/5">
          {/* Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#9499B3] flex items-center gap-1.5">
                <Flame size={11} className="text-[#FF2A6D]" />
                <span>Temperature</span>
              </span>
              <span className="font-bold text-[#FF2A6D] bg-[#FF2A6D]/10 px-1.5 py-0.2 rounded">
                {temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => {
                setActivePreset(null);
                setTemperature(parseFloat(e.target.value));
              }}
              className="w-full accent-[#FF2A6D] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-[#4F536E]">
              <span>0.0 Precise</span>
              <span>1.0 Balanced</span>
              <span>2.0 Wild</span>
            </div>
          </div>

          {/* Top_P Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#9499B3] flex items-center gap-1.5">
                <Layers size={11} className="text-[#00F0FF]" />
                <span>Top_P (Nucleus)</span>
              </span>
              <span className="font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.2 rounded">
                {topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => {
                setActivePreset(null);
                setTopP(parseFloat(e.target.value));
              }}
              className="w-full accent-[#00F0FF] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Top_K Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#9499B3] flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#BF40FF]" />
                <span>Top_K Sampling</span>
              </span>
              <span className="font-bold text-[#BF40FF] bg-[#BF40FF]/10 px-1.5 py-0.2 rounded">
                {topK}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={topK}
              onChange={(e) => {
                setActivePreset(null);
                setTopK(parseInt(e.target.value));
              }}
              className="w-full accent-[#BF40FF] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#9499B3] flex items-center gap-1.5">
                <Cpu size={11} className="text-[#00FF41]" />
                <span>Max Output Tokens</span>
              </span>
              <span className="font-bold text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.2 rounded">
                {maxTokens >= 1000 ? `${(maxTokens / 1024).toFixed(0)}k` : maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="256"
              max="32768"
              step="256"
              value={maxTokens}
              onChange={(e) => {
                setActivePreset(null);
                setMaxTokens(parseInt(e.target.value));
              }}
              className="w-full accent-[#00FF41] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Frequency & Presence Penalties (2 Cols) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-[#4F536E]">Freq Penalty</span>
                <span className="text-white font-bold">{frequencyPenalty.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={frequencyPenalty}
                onChange={(e) => {
                  setActivePreset(null);
                  setFrequencyPenalty(parseFloat(e.target.value));
                }}
                className="w-full accent-slate-300 cursor-pointer h-1 bg-white/10 rounded appearance-none"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-[#4F536E]">Pres Penalty</span>
                <span className="text-white font-bold">{presencePenalty.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={presencePenalty}
                onChange={(e) => {
                  setActivePreset(null);
                  setPresencePenalty(parseFloat(e.target.value));
                }}
                className="w-full accent-slate-300 cursor-pointer h-1 bg-white/10 rounded appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Reasoning & Agent Capabilities */}
        <div className="space-y-2.5 pt-2 border-t border-white/5">
          {/* Reasoning Effort */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[#4F536E] uppercase font-bold flex items-center gap-1">
                <Brain size={11} className="text-[#00FF41]" />
                <span>Reasoning Effort</span>
              </span>
              <span className="text-[#00FF41] uppercase font-bold text-[9px]">
                {reasoningEffort}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(["off", "low", "medium", "high", "max"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setReasoningEffort(lvl);
                  }}
                  className={`py-1 text-[9px] rounded uppercase font-bold transition-all cursor-pointer ${
                    reasoningEffort === lvl
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                      : "bg-white/5 text-[#4F536E] hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-1.5 pt-1">
            {/* Web Grounding Toggle */}
            <div
              onClick={() => {
                cyberAudio.play("click");
                setWebGrounding(!webGrounding);
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe size={12} className={webGrounding ? "text-[#00FF41]" : "text-[#4F536E]"} />
                <span className="text-[10px] text-slate-200">Web Grounding (Perplexity/Google)</span>
              </div>
              <div
                className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                  webGrounding ? "bg-[#00FF41] justify-end" : "bg-white/10 justify-start"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-black shadow" />
              </div>
            </div>

            {/* JSON Mode Toggle */}
            <div
              onClick={() => {
                cyberAudio.play("click");
                setJsonMode(!jsonMode);
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Braces size={12} className={jsonMode ? "text-[#00F0FF]" : "text-[#4F536E]"} />
                <span className="text-[10px] text-slate-200">Structured JSON Schema Mode</span>
              </div>
              <div
                className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                  jsonMode ? "bg-[#00F0FF] justify-end" : "bg-white/10 justify-start"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-black shadow" />
              </div>
            </div>

            {/* Stream Tokens */}
            <div
              onClick={() => {
                cyberAudio.play("click");
                setStreamTokens(!streamTokens);
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity size={12} className={streamTokens ? "text-[#FFB800]" : "text-[#4F536E]"} />
                <span className="text-[10px] text-slate-200">Stream Token Response</span>
              </div>
              <div
                className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                  streamTokens ? "bg-[#FFB800] justify-end" : "bg-white/10 justify-start"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-black shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Canvas Artifacts Status */}
      <div className="cyber-card p-3.5 bg-black/70 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <FileCode size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Live Canvas Artifacts
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#00FF41] px-1.5 py-0.2 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
            READY
          </span>
        </div>
        <p className="text-[10px] text-[#9499B3] font-sans">
          Split-screen sandbox ready for live React, HTML & Tailwind rendering.
        </p>
      </div>

      {/* 4. Quick Directives Scratchpad */}
      <div className="cyber-card p-3.5 bg-black/70 border border-white/10 rounded-xl space-y-2">
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
          rows={3}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-2.5 bg-[#070914] border border-white/10 focus:border-[#00FF41] rounded-lg text-[10px] text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
