"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Sparkles,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
=======
import { Sparkles, Bot, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

interface BlueprintData {
  name: string;
  codename: string;
  role: string;
  color: string;
  model: string;
  temperature: number;
  maxTokens: number;
  persistentMemory: boolean;
  skillLearning: boolean;
  sandbox: "docker" | "ssh" | "local" | "modal";
  selectedTools: string[];
}

const AVAILABLE_TOOLS = [
  { id: "fs.read", name: "File System Read", cat: "Storage" },
  { id: "fs.write", name: "File System Mutate (HITL)", cat: "Storage" },
  { id: "net.curl", name: "Network Ingress/Fetch", cat: "Network" },
  { id: "exec.shell", name: "Terminal Bash Exec (HITL)", cat: "Runtime" },
  { id: "db.query", name: "SQLite Vector Search", cat: "Database" },
  { id: "browser.crawl", name: "Headless Browser Automation", cat: "Web" },
  { id: "git.pr", name: "GitHub PR & Diff Review", cat: "VCS" },
  { id: "audio.synth", name: "Cyber Audio Synthesizer", cat: "Audio" },
];

export default function AgentBlueprintDesigner({
  onAgentCreated,
}: {
  onAgentCreated?: (agent: unknown) => void;
}) {
  const [step, setStep] = useState<number>(1);
  const [blueprint, setBlueprint] = useState<BlueprintData>({
    name: "CYBER-HUNTER-07",
    codename: "HUNTER-ZERO-DAY",
    role: "Autonomous Vulnerability Recon & Patch Synthesizer",
    color: "#00FF41",
    model: "Nous-Hermes-3-Llama-70B",
    temperature: 0.2,
    maxTokens: 128000,
    persistentMemory: true,
    skillLearning: true,
    sandbox: "docker",
    selectedTools: ["fs.read", "net.curl", "db.query", "git.pr"],
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  const toggleTool = (toolId: string) => {
    cyberAudio.play("click");
    setBlueprint((prev) => {
      const exists = prev.selectedTools.includes(toolId);
      return {
        ...prev,
        selectedTools: exists
          ? prev.selectedTools.filter((t) => t !== toolId)
          : [...prev.selectedTools, toolId],
      };
    });
  };

  const handleDeploy = () => {
    cyberAudio.play("toggle");
    setIsDeploying(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsDeploying(false);
      setDeployedSuccess(true);
      if (onAgentCreated) onAgentCreated(blueprint);
    }, 2000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              HERMES BLUEPRINT DESIGNER // <span className="text-[#00FF41]">AGENT FORGE</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Design, configure tool permissions, persistent memory & deploy autonomous swarm agents
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                step === s
                  ? "bg-[#00FF41] text-black border-[#00FF41]"
                  : step > s
                  ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                  : "bg-white/5 text-[#4F536E] border-white/10"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={blueprint.name}
                onChange={(e) => setBlueprint({ ...blueprint, name: e.target.value })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Codename
              </label>
              <input
                type="text"
                value={blueprint.codename}
                onChange={(e) => setBlueprint({ ...blueprint, codename: e.target.value })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Operational Role & Directive
            </label>
            <input
              type="text"
              value={blueprint.role}
              onChange={(e) => setBlueprint({ ...blueprint, role: e.target.value })}
              className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {["#00FF41", "#00F0FF", "#BF40FF", "#FFB800", "#FF2A6D"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBlueprint({ ...blueprint, color: c })}
                  className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer ${
                    blueprint.color === c ? "border-white scale-110 shadow-[0_0_10px_currentColor]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ background: c, color: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Model & Parameters */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                LLM Inference Engine
              </label>
              <select
                value={blueprint.model}
                onChange={(e) => setBlueprint({ ...blueprint, model: e.target.value })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
              >
                <option value="Nous-Hermes-3-Llama-70B">Nous-Hermes-3-Llama-70B (Primary)</option>
                <option value="Hermes-2-Pro-Llama-3-8B">Hermes-2-Pro-Llama-3-8B (Lightweight)</option>
                <option value="DeepSeek-Coder-V2">DeepSeek-Coder-V2 (AST Mode)</option>
                <option value="Gemini-2.5-Pro">Gemini 2.5 Pro (Cloud Bridge)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Sandbox Environment
              </label>
              <select
                value={blueprint.sandbox}
                onChange={(e) => setBlueprint({ ...blueprint, sandbox: e.target.value as "docker" | "ssh" | "local" | "modal" })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
              >
                <option value="docker">Docker Container Sandbox (Isolated)</option>
                <option value="local">Local Native Process (V8)</option>
                <option value="ssh">Remote SSH Server Node</option>
                <option value="modal">Modal Serverless Cloud Sandbox</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9499B3]">Temperature</span>
              <span className="text-[#00FF41] font-bold">{blueprint.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={blueprint.temperature}
              onChange={(e) => setBlueprint({ ...blueprint, temperature: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF41] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Step 3: Tools & Permissions */}
      {step === 3 && (
        <div className="space-y-3 animate-fade-in">
          <label className="text-[10px] font-bold text-[#4F536E] uppercase block">
            Select Permitted Hermes Tools ({blueprint.selectedTools.length} enabled)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {AVAILABLE_TOOLS.map((tool) => {
              const isSelected = blueprint.selectedTools.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#F1F3F9]"
                      : "bg-black/40 border-white/5 text-[#9499B3] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] uppercase">
                      {tool.cat}
                    </span>
                    <span className="text-xs font-bold">{tool.name}</span>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? "bg-[#00FF41] border-[#00FF41] text-black" : "border-white/20"}`}>
                    {isSelected && <CheckCircle2 size={12} />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Review & Deploy */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: blueprint.color }} />
                <span className="text-sm font-black text-[#F1F3F9]">{blueprint.name}</span>
              </div>
              <span className="text-[10px] text-[#00FF41] font-bold">READY TO FORGE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9499B3]">
              <div>Role: <span className="text-white font-bold">{blueprint.role}</span></div>
              <div>Model: <span className="text-white font-bold">{blueprint.model}</span></div>
              <div>Sandbox: <span className="text-white font-bold">{blueprint.sandbox.toUpperCase()}</span></div>
              <div>Permitted Tools: <span className="text-[#00FF41] font-bold">{blueprint.selectedTools.length}</span></div>
            </div>
          </div>

          {deployedSuccess ? (
            <div className="p-4 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-center font-bold text-xs">
              ✓ AGENT SUCCESSFULLY FORGED & DEPLOYED TO HERMES SWARM!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-2.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.4)] flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>{isDeploying ? "FORGING & PROVISIONING CONTAINER..." : "FORGE & DEPLOY AGENT"}</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("click");
            setStep((s) => Math.max(1, s - 1));
          }}
          disabled={step === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-[#9499B3] hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>PREVIOUS</span>
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setStep((s) => Math.min(4, s + 1));
            }}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold hover:bg-[#00FF41]/30 cursor-pointer"
          >
            <span>NEXT STEP</span>
            <ArrowRight size={12} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
