"use client";

import { useState } from "react";
import { Bot, Cpu, Shield, Sparkles, X, Check, ArrowRight, Wrench, Layers } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: any) => void;
}

export default function CreateAgentModal({ isOpen, onClose, onAddAgent }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("Autonomous Specialist");
  const [color, setColor] = useState("#00FF41");
  const [prompt, setPrompt] = useState("");
  const [tools, setTools] = useState<string[]>(["web_search", "git_apply"]);

  if (!isOpen) return null;

  const toggleTool = (tool: string) => {
    cyberAudio.play("click");
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("chime");

    const newAgent = {
      id: `agy-${Date.now()}`,
      name: name || "CUSTOM-AGENT",
      role: role || "General Autonomous Task Worker",
      type,
      status: "active",
      cpuUsage: 12,
      memoryMb: 128,
      tasksCompleted: 0,
      successRate: 100.0,
      lastAction: "Agent initialized and standing by for directives.",
      tags: tools,
      color,
    };

    onAddAgent(newAgent);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-lg cyber-card p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#00FF41]/40">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center">
              <Bot size={16} className="text-[#00FF41]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider">
                CUSTOM AGENT SYNTHESIS WIZARD
              </h3>
              <span className="text-[10px] text-[#9499B3]">Step {step} of 3</span>
            </div>
          </div>

          <button onClick={onClose} className="text-[#4F536E] hover:text-[#F1F3F9] text-xs cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="flex flex-col gap-3 text-xs animate-fade-in">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Agent Codename</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CYBER-PROWLER-X"
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Primary Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Realtime Zero-Day Exploit Fuzzing & SAST"
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Theme Color</label>
              <div className="flex items-center gap-2">
                {["#00FF41", "#00F0FF", "#BF40FF", "#FFB800", "#FF003C"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer"
                    style={{
                      background: c,
                      borderColor: color === c ? "#FFF" : "transparent",
                      boxShadow: color === c ? `0 0 10px ${c}` : "none",
                    }}
                  >
                    {color === c && <Check size={14} className="text-black font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT: INSTRUCTIONS</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROMPT DIRECTIVE */}
        {step === 2 && (
          <div className="flex flex-col gap-3 text-xs animate-fade-in">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">System Directive (Prompt)</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="You are an autonomous tactical agent. Analyze system vulnerabilities and report findings with reproducible proofs..."
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT: TOOLS</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TOOLS & FINISH */}
        {step === 3 && (
          <div className="flex flex-col gap-3 text-xs animate-fade-in">
            <label className="text-[10px] text-[#4F536E] uppercase font-bold">Assign MCP Tools & Capabilities</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "web_search", name: "Web Search & Scrape" },
                { id: "git_apply", name: "Git Repo Mutator" },
                { id: "docker_exec", name: "Docker Container Exec" },
                { id: "sqlite_vec", name: "Vector Knowledge DB" },
                { id: "ebpf_probe", name: "eBPF Packet Filter" },
                { id: "ast_grep", name: "AST Code Grep" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTool(t.id)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    tools.includes(t.id)
                      ? "bg-[#00FF41]/15 border-[#00FF41]/50 text-[#00FF41]"
                      : "bg-black/40 border-white/5 text-[#9499B3]"
                  }`}
                >
                  <span className="text-[11px] font-bold">{t.name}</span>
                  {tools.includes(t.id) && <Check size={12} />}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.4)]"
              >
                DEPLOY AGENT TO SWARM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
