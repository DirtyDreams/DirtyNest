"use client";

import { useState } from "react";
import {
  X,
  Play,
  RotateCcw,
  GitBranch,
  CheckCircle2,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { SwarmAgent } from "./AgentDetailDrawer";

interface SwarmDagPipelineModalProps {
  agents: SwarmAgent[];
  isOpen: boolean;
  onClose: () => void;
}

interface DagNode {
  id: string;
  agentId: string;
  name: string;
  role: string;
  tokenBudget: number;
  dependsOn: string[];
  status: "idle" | "running" | "completed";
}

export default function SwarmDagPipelineModal({
  agents,
  isOpen,
  onClose,
}: SwarmDagPipelineModalProps) {
  const [nodes, setNodes] = useState<DagNode[]>([
    {
      id: "node-1",
      agentId: "agy-01",
      name: "SENTINEL-01",
      role: "Threat Recon & Vulnerability Hunter",
      tokenBudget: 8000,
      dependsOn: [],
      status: "idle",
    },
    {
      id: "node-2",
      agentId: "agy-02",
      name: "SCRAPER-INTEL",
      role: "Autonomous Threat & News Harvester",
      tokenBudget: 12000,
      dependsOn: ["node-1"],
      status: "idle",
    },
    {
      id: "node-3",
      agentId: "agy-04",
      name: "CODE-AUDITOR",
      role: "AST Pattern & Secrets Leak Verifier",
      tokenBudget: 16000,
      dependsOn: ["node-2"],
      status: "idle",
    },
    {
      id: "node-4",
      agentId: "agy-03",
      name: "KUBE-DEPLOYER",
      role: "Canary Rollout & Mesh Orchestrator",
      tokenBudget: 8000,
      dependsOn: ["node-3"],
      status: "idle",
    },
  ]);

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);

  if (!isOpen) return null;

  const totalTokenBudget = nodes.reduce((acc, n) => acc + n.tokenBudget, 0);

  const handleUpdateBudget = (nodeId: string, budget: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, tokenBudget: budget } : n))
    );
  };

  const handleRunPipeline = () => {
    cyberAudio.play("warp");
    setIsRunningPipeline(true);
    setActiveStep(0);

    // Reset status
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));

    let current = 0;
    const interval = setInterval(() => {
      if (current < nodes.length) {
        const idx = current;
        setNodes((prev) =>
          prev.map((n, i) => ({
            ...n,
            status: i === idx ? "running" : i < idx ? "completed" : "idle",
          }))
        );
        cyberAudio.play("chime");
        setActiveStep(idx);
        current++;
      } else {
        clearInterval(interval);
        setNodes((prev) => prev.map((n) => ({ ...n, status: "completed" })));
        setIsRunningPipeline(false);
        setActiveStep(-1);
        cyberAudio.play("chime");
      }
    }, 1000);
  };

  const handleReset = () => {
    cyberAudio.play("click");
    setIsRunningPipeline(false);
    setActiveStep(-1);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs text-white">
      <div className="relative w-full max-w-4xl bg-[#080910] border border-[#00FF41]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-[#00FF41]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                SWARM DAG PIPELINE // <span className="text-[#00FF41]">DEPENDENCY & BUDGET ARCHITECT</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Directed Acyclic Graph orchestrator, parallel swarm execution handoffs & token budgets
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00FF41] text-black font-bold hover:bg-[#00FF41]/90 transition-all shadow-[0_0_12px_rgba(0,255,65,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunningPipeline ? "EXECUTING PIPELINE..." : "RUN PIPELINE"}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Execution State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="p-4 bg-black/40 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold">ACTIVE NODES</span>
            <span className="text-sm font-black text-[#00FF41] mt-0.5">{nodes.length} AGENTS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold">TOTAL TOKEN BUDGET</span>
            <span className="text-sm font-black text-cyan-400 mt-0.5">
              {totalTokenBudget.toLocaleString()} TOKENS
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold">DAG TOPOLOGY</span>
            <span className="text-sm font-black text-purple-400 mt-0.5">SERIAL & FAN-OUT</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold">ESTIMATED COST</span>
            <span className="text-sm font-black text-amber-400 mt-0.5">
              ${((totalTokenBudget / 1000) * 0.0015).toFixed(4)} USD
            </span>
          </div>
        </div>

        {/* Visual DAG Flow Chart */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-3">
            {nodes.map((node, index) => {
              const isCurrent = node.status === "running";
              const isDone = node.status === "completed";

              return (
                <div key={node.id} className="relative">
                  {/* Step Connector Line */}
                  {index > 0 && (
                    <div className="flex items-center justify-center my-1">
                      <div
                        className={`w-0.5 h-6 transition-all ${
                          isDone || isCurrent ? "bg-[#00FF41] shadow-[0_0_8px_#00FF41]" : "bg-slate-700"
                        }`}
                      />
                    </div>
                  )}

                  {/* DAG Node Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCurrent
                        ? "bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)] ring-1 ring-[#00FF41]"
                        : isDone
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-black/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? "bg-[#00FF41] text-black animate-pulse"
                            : isDone
                            ? "bg-emerald-500 text-black"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${index + 1}`}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs truncate">{node.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isCurrent
                                ? "bg-[#00FF41]/20 text-[#00FF41]"
                                : isDone
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">{node.role}</span>
                      </div>
                    </div>

                    {/* Token Budget Slider */}
                    <div className="flex items-center space-x-4 shrink-0 font-mono">
                      <div className="flex flex-col w-36">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Token Budget:</span>
                          <span className="text-cyan-400 font-bold">{node.tokenBudget / 1000}k</span>
                        </div>
                        <input
                          type="range"
                          min="2000"
                          max="32000"
                          step="2000"
                          value={node.tokenBudget}
                          onChange={(e) => handleUpdateBudget(node.id, parseInt(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer mt-1"
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">DEPENDS ON</span>
                        <span className="text-[10px] text-slate-300 font-bold">
                          {node.dependsOn.length === 0 ? "ENTRYPOINT" : node.dependsOn.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05060b] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Swarm Consensus Protocol: <strong className="text-[#00FF41]">DAG Handoff v2.4</strong>
          </span>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            CLOSE ARCHITECT
          </button>
        </div>
      </div>
    </div>
  );
}
