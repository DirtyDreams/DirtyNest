"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Radio, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";

interface SwarmNode {
  id: string;
  name: string;
  role: string;
  model: string;
  status: "ACTIVE" | "IDLE" | "AWAITING_HUMAN" | "EXECUTING";
  color: string;
  tokensProcessed: string;
  currentTask: string;
  isStreamingNode?: boolean;
}

interface Props {
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
}

export default function SwarmTopologyGraph({ onSelectNode, selectedNodeId }: Props) {
  const [pulseTick, setPulseTick] = useState(0);

  const {
    isStreaming,
    currentReasoningTrace,
    activeToolExecutions,
    pendingGate,
    activeSessionId,
    browserState,
    sessions,
  } = useHermesAcpStore();

  useEffect(() => {
    const interval = setInterval(() => setPulseTick((t) => (t + 1) % 100), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const nodes: SwarmNode[] = useMemo(() => {
    // 1. Hermes Core
    let hermesStatus: SwarmNode["status"] = "IDLE";
    let hermesTask = "Supervisor & Planner standing by for operator directives";
    if (pendingGate) {
      hermesStatus = "AWAITING_HUMAN";
      hermesTask = `Clearance Required: ${pendingGate.tool_name} [${pendingGate.risk_level.toUpperCase()}]`;
    } else if (isStreaming) {
      hermesStatus = "EXECUTING";
      hermesTask = currentReasoningTrace
        ? currentReasoningTrace.slice(0, 95) + "..."
        : "Streaming thoughts and decomposing swarm tasks...";
    } else if (activeToolExecutions.some((t) => t.status === "running")) {
      hermesStatus = "ACTIVE";
      const running = activeToolExecutions.find((t) => t.status === "running");
      hermesTask = `Supervising active tool: ${running?.tool_name || "ACP execution"}`;
    }

    // 2. Pi Reasoner
    let piStatus: SwarmNode["status"] = "IDLE";
    let piTask = "Standing by for architectural invariant and semantic validation";
    if (isStreaming && currentReasoningTrace) {
      piStatus = "ACTIVE";
      piTask = "Critiquing AST diffs and reasoning trajectory for zero-regression";
    }

    // 3. Codex Engine
    let codexStatus: SwarmNode["status"] = "IDLE";
    let codexTask = "Standing by for high-leverage code synthesis and patch generation";
    if (pendingGate) {
      codexStatus = "AWAITING_HUMAN";
      codexTask = `Staging ${pendingGate.tool_name} patch (Awaiting operator approval)`;
    } else if (activeToolExecutions.some((t) => t.status === "running")) {
      codexStatus = "EXECUTING";
      const running = activeToolExecutions.find((t) => t.status === "running");
      codexTask = `Executing ${running?.tool_name || "code modification"} in sandbox`;
    } else if (isStreaming) {
      codexStatus = "ACTIVE";
      codexTask = "Synthesizing code transforms and preparing patch buffers";
    }

    // 4. OpenCode Local
    let opencodeStatus: SwarmNode["status"] = "IDLE";
    let opencodeTask = "Standing by on local RTX 4090 GPU (CUDA accelerated)";
    if (browserState?.isConnected) {
      opencodeStatus = "ACTIVE";
      opencodeTask = `CDP Browser attached on port ${browserState.port} (${browserState.url || "ready"})`;
    } else if (isStreaming) {
      opencodeStatus = "ACTIVE";
      opencodeTask = "Local open-weights engine assisting with token acceleration";
    }

    return [
      {
        id: "hermes",
        name: "Hermes Core",
        role: "Supervisor & Master Planner",
        model: activeSession?.model || "Nous-Hermes-3-70B",
        status: hermesStatus,
        color: "#00FF41",
        tokensProcessed: isStreaming ? "STREAMING" : "4.2M",
        currentTask: hermesTask,
        isStreamingNode: isStreaming,
      },
      {
        id: "pi",
        name: "Pi Reasoner",
        role: "Reflective Validator",
        model: "Deep-Reflection-2.5",
        status: piStatus,
        color: "#BF40FF",
        tokensProcessed: isStreaming ? "VERIFYING" : "1.8M",
        currentTask: piTask,
        isStreamingNode: isStreaming && Boolean(currentReasoningTrace),
      },
      {
        id: "codex",
        name: "Codex Engine",
        role: "Code Synthesizer",
        model: "Claude-3.7-Sonnet",
        status: codexStatus,
        color: "#00F0FF",
        tokensProcessed: pendingGate ? "GATE_HOLD" : "8.9M",
        currentTask: codexTask,
        isStreamingNode: activeToolExecutions.some((t) => t.status === "running"),
      },
      {
        id: "opencode",
        name: "OpenCode Local",
        role: "Local GPU Worker",
        model: "Qwen-2.5-Coder-32B",
        status: opencodeStatus,
        color: "#FFB800",
        tokensProcessed: browserState?.isConnected ? "CDP_LIVE" : "3.1M",
        currentTask: opencodeTask,
        isStreamingNode: browserState?.isConnected,
      },
    ];
  }, [
    activeSession,
    activeToolExecutions,
    browserState,
    currentReasoningTrace,
    isStreaming,
    pendingGate,
  ]);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none relative overflow-hidden">
      {/* HEADER WITH LIVE TELEMETRY BADGES */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Radio size={16} className={isStreaming ? "text-[#00FF41] animate-spin" : "text-[#00FF41]"} />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            SWARM DAG TOPOLOGY // <span className="text-[#00FF41]">LANGGRAPH RUNTIME</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pendingGate && (
            <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center gap-1 animate-pulse">
              <ShieldAlert size={12} className="text-amber-400" />
              HITL CLEARANCE PENDING
            </span>
          )}

          {isStreaming ? (
            <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center gap-1">
              <Zap size={12} className="text-[#00FF41] animate-bounce" />
              LIVE STREAMING
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#9499B3] px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#00FF41]" />
              DAG SYNCHRONIZED
            </span>
          )}

          <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
            4 AGENTS CONNECTED
          </span>
        </div>
      </div>

      {/* SVG DATA FLOW TRACK (Desktop Only) */}
      <div className="hidden md:block relative h-2 -my-2 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 10">
          <line
            x1="125"
            y1="5"
            x2="875"
            y2="5"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {isStreaming && (
            <line
              x1="125"
              y1="5"
              x2="875"
              y2="5"
              stroke="#00FF41"
              strokeWidth="2"
              strokeDasharray="16 32"
              strokeDashoffset={-(pulseTick * 8) % 100}
              className="opacity-75"
            />
          )}
          {pendingGate && (
            <line
              x1="375"
              y1="5"
              x2="625"
              y2="5"
              stroke="#FFB800"
              strokeWidth="3"
              strokeDasharray="8 8"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* VISUAL DAG TOPOLOGY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isExecuting = node.status === "EXECUTING";
          const isAwaiting = node.status === "AWAITING_HUMAN";

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
                    : isAwaiting
                    ? "border-amber-500/60 shadow-[0_0_12px_rgba(255,184,0,0.2)] bg-amber-500/5"
                    : isExecuting
                    ? "border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.15)] bg-white/5"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                {/* Node Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${node.isStreamingNode ? "animate-ping" : "animate-pulse"}`}
                      style={{ background: isAwaiting ? "#FFB800" : node.color }}
                    />
                    <span className="font-bold text-xs text-[#F1F3F9]">{node.name}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: isAwaiting ? "#FFB800" : node.color,
                      background: isAwaiting ? "rgba(255,184,0,0.15)" : `${node.color}15`,
                      border: `1px solid ${isAwaiting ? "rgba(255,184,0,0.4)" : `${node.color}40`}`,
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
                  <span className="text-[9px] text-[#4F536E] uppercase font-bold flex items-center justify-between">
                    <span>Active Directive:</span>
                    <span className="text-[8px] text-white/40">{node.tokensProcessed}</span>
                  </span>
                  <p
                    className={`text-[10px] line-clamp-2 leading-tight font-sans ${
                      isAwaiting ? "text-amber-200 font-semibold" : "text-[#F1F3F9]"
                    }`}
                  >
                    {node.currentTask}
                  </p>
                </div>
              </button>

              {/* Connecting DAG arrow between sequential nodes on desktop */}
              {index < nodes.length - 1 && (
                <div
                  className={`hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 ${
                    isStreaming ? "text-[#00FF41] animate-bounce" : "text-[#00FF41]/60"
                  }`}
                >
                  <ArrowRight size={14} className={isStreaming ? "animate-pulse" : ""} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
