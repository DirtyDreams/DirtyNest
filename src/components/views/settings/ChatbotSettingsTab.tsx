"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Bot,
  Sparkles,
  Cpu,
  RotateCcw,
  Check,
  BrainCircuit,
  FileCode,
  Volume2,
  LayoutTemplate,
} from "lucide-react";
=======
import { Bot, Sparkles, Cpu, RotateCcw, Check, BrainCircuit, FileCode, Volume2, LayoutTemplate } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { AI_MODELS_REGISTRY } from "@/lib/aiModels";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

const DEFAULT_SYSTEM_PROMPT = `You are DirtyNest Cyber-Intelligence Core, a high-performance terminal AI with full system observability, devtool mastery, and defensive cybersecurity capabilities. Respond with technical precision, clean code blocks, and concise analytical clarity.`;

export default function ChatbotSettingsTab() {
  const toast = useToast();
  const [defaultAiModel, setDefaultAiModel] = useState("gemini-2.5-pro");
  const [temperature, setTemperature] = useState("0.7");
  const [topP, setTopP] = useState("0.95");
  const [maxTokens, setMaxTokens] = useState("8192");
  const [reasoningMode, setReasoningMode] = useState(false);
  const [voiceSpeechSynth, setVoiceSpeechSynth] = useState(false);
  const [artifactsCanvas, setArtifactsCanvas] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  useEffect(() => {
    try {
      const savedModel = localStorage.getItem("dirtynest_default_ai_model");
      if (savedModel) setDefaultAiModel(savedModel);
      const savedTemp = localStorage.getItem("dirtynest_ai_temperature");
      if (savedTemp) setTemperature(savedTemp);
      const savedTopP = localStorage.getItem("dirtynest_ai_top_p");
      if (savedTopP) setTopP(savedTopP);
      const savedTokens = localStorage.getItem("dirtynest_ai_max_tokens");
      if (savedTokens) setMaxTokens(savedTokens);
      const savedReasoning = localStorage.getItem("dirtynest_ai_reasoning");
      if (savedReasoning) setReasoningMode(savedReasoning === "true");
      const savedVoice = localStorage.getItem("dirtynest_ai_voice");
      if (savedVoice) setVoiceSpeechSynth(savedVoice === "true");
      const savedArtifacts = localStorage.getItem("dirtynest_ai_artifacts");
      if (savedArtifacts) setArtifactsCanvas(savedArtifacts !== "false");
      const savedPrompt = localStorage.getItem("dirtynest_ai_system_prompt");
      if (savedPrompt) setSystemPrompt(savedPrompt);
    } catch {}
  }, []);

  const handleModelChange = (model: string) => {
    cyberAudio.play("click");
    setDefaultAiModel(model);
    try {
      localStorage.setItem("dirtynest_default_ai_model", model);
    } catch {}
    toast.success("AI Model Updated", `Default model set to ${model}`);
  };

  const handleSaveAll = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_default_ai_model", defaultAiModel);
      localStorage.setItem("dirtynest_ai_temperature", temperature);
      localStorage.setItem("dirtynest_ai_top_p", topP);
      localStorage.setItem("dirtynest_ai_max_tokens", maxTokens);
      localStorage.setItem("dirtynest_ai_reasoning", String(reasoningMode));
      localStorage.setItem("dirtynest_ai_voice", String(voiceSpeechSynth));
      localStorage.setItem("dirtynest_ai_artifacts", String(artifactsCanvas));
      localStorage.setItem("dirtynest_ai_system_prompt", systemPrompt);
    } catch {}
    toast.success("Chatbot Parameters Saved", "Neural hyperparameters and rendering modes updated.");
  };

  const handleResetPrompt = () => {
    cyberAudio.play("click");
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    toast.info("Prompt Reset", "Default Master Persona restored.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
            <Bot size={16} />
            <span>Chatbot AI & Neural Persona Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure multi-LLM engines, reasoning tokens, speech synthesis, and live artifacts canvas
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00c8d6] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE CHATBOT CONFIG</span>
        </button>
      </div>

      {/* Model Selection Grid */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <Cpu size={14} className="text-[#00F0FF]" />
          <span>Default LLM Inference Engine</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {AI_MODELS_REGISTRY.map((m) => {
            const isSelected = defaultAiModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleModelChange(m.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-[#090A14] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    : "bg-black/40 border-white/5 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F1F3F9]">{m.name}</span>
                    {isSelected && <Check size={12} className="text-[#00F0FF]" />}
                  </div>
                  <span className="text-[10px] text-[#4F536E] mt-0.5 block">{m.provider}</span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-[#9499B3]">
                  <span>{(m.contextWindow / 1000).toFixed(0)}k Context</span>
                  <span style={{ color: m.badgeColor }}>${m.inputCostPer1M}/1M</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hyperparameters Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Temperature</label>
            <span className="font-bold text-xs text-[#00F0FF]">{temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>0.0 (Precise)</span>
            <span>0.7 (Balanced)</span>
            <span>1.0 (Creative)</span>
          </div>
        </div>

        {/* Top-P */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Top-P Sampling</label>
            <span className="font-bold text-xs text-[#00F0FF]">{topP}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={topP}
            onChange={(e) => setTopP(e.target.value)}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>0.1 (Focused)</span>
            <span>0.95 (Standard)</span>
            <span>1.0 (Full)</span>
          </div>
        </div>

        {/* Max Output Tokens */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold">Max Output Tokens</label>
          <select
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="2048">2,048 Tokens</option>
            <option value="4096">4,096 Tokens</option>
            <option value="8192">8,192 Tokens</option>
            <option value="16384">16,384 Tokens</option>
            <option value="32768">32,768 Tokens</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Per generation limit</span>
        </div>
      </div>

      {/* Toggles: Reasoning, Voice, Artifacts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrainCircuit size={15} className="text-[#BF40FF]" />
            <div className="font-bold text-xs text-[#F1F3F9]">Deep Reasoning Mode</div>
          </div>
          <p className="text-[10px] text-[#4F536E]">Enforce step-by-step chain-of-thought logic</p>
          <button
            onClick={() => {
              cyberAudio.play("click");
              setReasoningMode(!reasoningMode);
            }}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reasoningMode ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40" : "bg-white/5 text-[#9499B3]"
            }`}
          >
            {reasoningMode ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 size={15} className="text-[#00F0FF]" />
            <div className="font-bold text-xs text-[#F1F3F9]">Voice Speech Synth (TTS)</div>
          </div>
          <p className="text-[10px] text-[#4F536E]">Synthesize neural voice responses upon completion</p>
          <button
            onClick={() => {
              cyberAudio.play("click");
              setVoiceSpeechSynth(!voiceSpeechSynth);
            }}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              voiceSpeechSynth ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40" : "bg-white/5 text-[#9499B3]"
            }`}
          >
            {voiceSpeechSynth ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={15} className="text-[#00FF41]" />
            <div className="font-bold text-xs text-[#F1F3F9]">Artifacts Interactive Canvas</div>
          </div>
          <p className="text-[10px] text-[#4F536E]">Side-by-side interactive code & HTML preview</p>
          <button
            onClick={() => {
              cyberAudio.play("click");
              setArtifactsCanvas(!artifactsCanvas);
            }}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              artifactsCanvas ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40" : "bg-white/5 text-[#4F536E]"
            }`}
          >
            {artifactsCanvas ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>

      {/* System Prompt Instruction Template */}
      <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-[#00FF41]" />
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">
              Global System Instruction (Master Persona)
            </label>
          </div>
          <button
            onClick={handleResetPrompt}
            className="flex items-center gap-1 text-[10px] text-[#9499B3] hover:text-white cursor-pointer"
          >
            <RotateCcw size={10} />
            <span>Reset to Default</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
