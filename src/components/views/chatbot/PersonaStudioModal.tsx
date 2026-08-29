"use client";

import { useState } from "react";
import {
  Bot,
  X,
  RotateCcw,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface AgentPersona {
  id: string;
  name: string;
  roleTitle: string;
  tag: string;
  color: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: "hermes-master",
    name: "Hermes Master Architect",
    roleTitle: "Autonomous Neural Orchestrator",
    tag: "ORCHESTRATOR",
    color: "#00FF41",
    systemPrompt: `You are Hermes, the 100% Master AI Neural Orchestrator powering DirtyNest.
You specialize in system design, multi-agent coordination, sub-millisecond local telemetry, and autonomous tool clearance.
Respond with high-precision engineering architecture, structured XML/markdown, and concise actionable steps.`,
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 8192,
  },
  {
    id: "secops-sentinel",
    name: "SecOps Sentinel",
    roleTitle: "Zero-Trust Security & Audit Officer",
    tag: "SECURITY",
    color: "#FF0055",
    systemPrompt: `You are SecOps Sentinel, the zero-trust security gatekeeper of DirtyNest.
You audit tool executions, socket interceptors, token allocations, and eBPF kernel telemetry.
Always flag potential security vulnerabilities, rate limits, and permission boundaries.`,
    temperature: 0.3,
    topP: 0.8,
    maxTokens: 4096,
  },
  {
    id: "fullstack-engineer",
    name: "Senior Full-Stack Engineer",
    roleTitle: "Next.js 16 & Web Audio Specialist",
    tag: "ENGINEERING",
    color: "#00F0FF",
    systemPrompt: `You are a Senior Full-Stack Engineer mastering Next.js 16 (Turbopack), TypeScript, Web Audio API DSP, and Tailwind CSS.
Provide production-ready, clean, well-typed code without placeholders or omissions.`,
    temperature: 0.4,
    topP: 0.95,
    maxTokens: 8192,
  },
  {
    id: "research-scientist",
    name: "Autonomous Research Scientist",
    roleTitle: "Deep Academic & Market Synthesizer",
    tag: "DEEP RESEARCH",
    color: "#BF40FF",
    systemPrompt: `You are the Deep Research Scientist agent.
You synthesize complex academic papers (arXiv), technical documentation, and market trends into exhaustive, cited briefs with mathematical rigor.`,
    temperature: 0.5,
    topP: 0.9,
    maxTokens: 16384,
  },
  {
    id: "cyber-operative",
    name: "Darknet Cyber Operative",
    roleTitle: "Tactical Red-Team Specialist",
    tag: "TACTICAL",
    color: "#FFB800",
    systemPrompt: `You are a tactical cyber operative operating inside an air-gapped terminal.
Concise, direct, highly technical CLI commands, bash scripts, and telemetry analyses. Speak in a sharp cyberpunk tone.`,
    temperature: 0.8,
    topP: 0.9,
    maxTokens: 4096,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePersona: AgentPersona;
  onSavePersona: (updated: AgentPersona) => void;
}

export default function PersonaStudioModal({
  isOpen,
  onClose,
  activePersona,
  onSavePersona,
}: Props) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(activePersona.id);
  const [customPrompt, setCustomPrompt] = useState<string>(activePersona.systemPrompt);
  const [temp, setTemp] = useState<number>(activePersona.temperature);
  const [topP, setTopP] = useState<number>(activePersona.topP);
  const [maxTokens, setMaxTokens] = useState<number>(activePersona.maxTokens);

  if (!isOpen) return null;

  const handleSelectPreset = (p: AgentPersona) => {
    cyberAudio.play("click");
    setSelectedPersonaId(p.id);
    setCustomPrompt(p.systemPrompt);
    setTemp(p.temperature);
    setTopP(p.topP);
    setMaxTokens(p.maxTokens);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("chime");
    const base = AGENT_PERSONAS.find((p) => p.id === selectedPersonaId) || AGENT_PERSONAS[0];
    const updated: AgentPersona = {
      ...base,
      systemPrompt: customPrompt,
      temperature: temp,
      topP: topP,
      maxTokens: maxTokens,
    };
    onSavePersona(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono select-none">
      <form
        onSubmit={handleSave}
        className="w-full max-w-2xl rounded-2xl border border-white/15 p-5 flex flex-col gap-4 shadow-2xl relative bg-black/95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-[#00FF41]" />
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                PERSONA & SYSTEM PROMPT STUDIO
              </h3>
              <p className="text-[10px] text-[#4F536E]">Configure Agent Directives & LLM Hyperparameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Persona Selector Grid */}
        <div>
          <label className="text-[10px] font-bold text-[#9499B3] uppercase block mb-1.5">
            Select Active Agent Persona:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AGENT_PERSONAS.map((p) => {
              const isSelected = selectedPersonaId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] shadow-[0_0_12px_rgba(255,255,255,0.2)] font-bold"
                      : "bg-black/40 border-white/5 text-[#9499B3] hover:text-white hover:bg-black/60"
                  }`}
                  style={{
                    borderColor: isSelected ? p.color : undefined,
                  }}
                >
                  <span
                    className="text-[8px] font-black px-1.5 py-0.2 rounded w-fit uppercase"
                    style={{ backgroundColor: `${p.color}20`, color: p.color }}
                  >
                    {p.tag}
                  </span>
                  <span className="text-xs text-white truncate">{p.name}</span>
                  <span className="text-[9px] text-[#4F536E] truncate">{p.roleTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Prompt Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-[#9499B3] uppercase">
              System Instruction Prompt:
            </label>
            <button
              type="button"
              onClick={() => {
                const base = AGENT_PERSONAS.find((p) => p.id === selectedPersonaId);
                if (base) setCustomPrompt(base.systemPrompt);
              }}
              className="text-[9px] text-[#00FF41] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Reset to default</span>
            </button>
          </div>
          <textarea
            rows={5}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none resize-none font-mono leading-relaxed"
          />
        </div>

        {/* Hyperparameter Sliders */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Temperature */}
          <div>
            <div className="flex justify-between text-[#9499B3] mb-1">
              <span>Temperature</span>
              <span className="text-[#00FF41] font-bold">{temp}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-[#00FF41] cursor-pointer"
            />
          </div>

          {/* Top_P */}
          <div>
            <div className="flex justify-between text-[#9499B3] mb-1">
              <span>Top_P</span>
              <span className="text-[#00F0FF] font-bold">{topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex justify-between text-[#9499B3] mb-1">
              <span>Max Tokens</span>
              <span className="text-purple-400 font-bold">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="1024"
              max="16384"
              step="1024"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs text-[#9499B3] hover:text-white"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
          >
            APPLY PERSONA & DIRECTIVES
          </button>
        </div>
      </form>
    </div>
  );
}
