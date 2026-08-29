"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Radio } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SwarmNode {
  id: string;
  name: string;
  role: string;
  model: string;
  status: "ACTIVE" | "IDLE" | "AWAITING_HUMAN" | "EXECUTING";
  color: string;
  tokensProcessed: string;
  currentTask: string;
}

const NODES: SwarmNode[] = [
  {
    id: "hermes",
    name: "Hermes Core",
    role: "Supervisor & Planner",
    model: "Nous-Hermes-3-70B",
    status: "EXECUTING",
    color: "#00FF41",
    tokensProcessed: "4.2M",
    currentTask: "Orchestrating microservice healthcheck scan",
  },
  {
    id: "pi",
    name: "Pi Reasoner",
    role: "Reflective Validator",
    model: "Deep-Reflection-2.5",
    status: "ACTIVE",
    color: "#BF40FF",
    tokensProcessed: "1.8M",
    currentTask: "Critiquing AST diffs for zero-regression",
  },
  {
    id: "codex",
    name: "Codex Engine",
    role: "Code Synthesizer",
    model: "Claude-3.7-Sonnet",
    status: "AWAITING_HUMAN",
    color: "#00F0FF",
    tokensProcessed: "8.9M",
    currentTask: "Staging Docker compose network refactor (Clearance required)",
  },
  {
    id: "opencode",
    name: "OpenCode Local",
    role: "Local GPU Worker",
    model: "Qwen-2.5-Coder-32B",
    status: "IDLE",
    color: "#FFB800",
    tokensProcessed: "3.1M",
    currentTask: "Standing by on local RTX 4090 GPU",
  },
];

interface Props {
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
}

export default function SwarmTopologyGraph({ onSelectNode, selectedNodeId }: Props) {
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulseTick((t) => (t + 1) % 100), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-[#00FF41]" />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            SWARM DAG TOPOLOGY // <span className="text-[#00FF41]">LANGGRAPH RUNTIME</span>
          </h3>
        </div>
        <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
          4 AGENTS CONNECTED
        </span>
      </div>

      {/* VISUAL DAG TOPOLOGY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {NODES.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div key={node.id} className="flex flex-col relative">
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  onSelectNode(node.id);
                }}
                className={`p-3.5 rounded-xl bg-black/50 border text-left transition-all cursor-pointer flex flex-col gap-2.5 relative group ${
                  isSelected
                    ? "border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)] bg-[#00FF41]/5"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                {/* Node Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: node.color }} />
                    <span className="font-bold text-xs text-[#F1F3F9]">{node.name}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                    style={{
                      color: node.color,
                      background: `${node.color}15`,
                      border: `1px solid ${node.color}40`,
                    }}
                  >
                    {node.status}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-[#9499B3]">{node.role}</span>
                  <span className="text-[9px] text-[#4F536E] font-mono">{node.model}</span>
                </div>

                <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] text-[#4F536E] uppercase font-bold">Active Directive:</span>
                  <p className="text-[10px] text-[#F1F3F9] line-clamp-2 leading-tight font-sans">
                    {node.currentTask}
                  </p>
                </div>
              </button>

              {/* Connecting DAG arrow between sequential nodes on desktop */}
              {index < NODES.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#00FF41]/60">
                  <ArrowRight size={14} className="animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
