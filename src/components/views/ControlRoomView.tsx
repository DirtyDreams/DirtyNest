"use client";

import { useState } from "react";
import {
  Radio,
  Cpu,
  Bot,
  Play,
  Pause,
  RotateCw,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Terminal,
  Activity,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Split,
  Download,
  Share2,
  Code2,
  FileCode,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export type HarnessId = "hermes" | "pi" | "codex" | "opencode";

interface HarnessMeta {
  id: HarnessId;
  name: string;
  codename: string;
  model: string;
  tagline: string;
  color: string;
  accentHex: string;
  contextWindow: string;
  temperature: number;
  runtime: "V8 Isolate" | "Local CUDA (RTX 4090)" | "Cloud Multi-Agent RPC" | "Ollama Daemon";
  defaultPrompt: string;
}

const HARNESSES: HarnessMeta[] = [
  {
    id: "hermes",
    name: "Hermes Agent Core",
    codename: "HERMES-AUTONOMY-V2.5",
    model: "Nous-Hermes-3-Llama-70B",
    tagline: "General autonomy, complex multi-step reasoning, and tool execution orchestration",
    color: "#00FF41",
    accentHex: "rgba(0, 255, 65, 0.2)",
    contextWindow: "128k Tokens",
    temperature: 0.2,
    runtime: "Cloud Multi-Agent RPC",
    defaultPrompt: "You are Hermes, an autonomous tactical agent. Execute plans with precision and request human clearance before mutating file systems or launching network probes.",
  },
  {
    id: "pi",
    name: "Pi Reflection Harness",
    codename: "PI-EMPATHY-REASONER",
    model: "Inflection-2.5 / Deep-Reflection",
    tagline: "Conversational empathy, deep user intent alignment, and iterative hypothesis critique",
    color: "#BF40FF",
    accentHex: "rgba(191, 64, 255, 0.2)",
    contextWindow: "64k Tokens",
    temperature: 0.7,
    runtime: "V8 Isolate",
    defaultPrompt: "You are Pi Reasoner. Analyze the psychological and architectural context of every request. Question edge cases with empathy.",
  },
  {
    id: "codex",
    name: "Codex Code Synthesis",
    codename: "CODEX-AST-REFACTOR",
    model: "GPT-4o-Code-Engine / Claude-3.7-Sonnet",
    tagline: "High-frequency code synthesis, full repository AST transforms, and strict type safety",
    color: "#00F0FF",
    accentHex: "rgba(0, 240, 255, 0.2)",
    contextWindow: "200k Tokens",
    temperature: 0.1,
    runtime: "Cloud Multi-Agent RPC",
    defaultPrompt: "You are Codex Core. Produce high-performance, strictly typed, zero-regression code with full test matrices.",
  },
  {
    id: "opencode",
    name: "OpenCode Local Mesh",
    codename: "OPENCODE-DEEPSEEK-OLLAMA",
    model: "DeepSeek-Coder-V2-Lite-Q8",
    tagline: "Local open-weights code harness with zero telemetry leakage and hardware CUDA offloading",
    color: "#FFB800",
    accentHex: "rgba(255, 184, 0, 0.2)",
    contextWindow: "32k Tokens",
    temperature: 0.3,
    runtime: "Local CUDA (RTX 4090)",
    defaultPrompt: "You are OpenCode Local. Run within the air-gapped DirtyNest sandbox and execute safe code transformations.",
  },
];

interface CognitiveStep {
  step: number;
  title: string;
  thought: string;
  toolCall?: {
    name: string;
    args: string;
    requiresApproval: boolean;
    status: "pending" | "approved" | "denied";
  };
  output?: string;
}

interface AgentSession {
  id: string;
  harnessId: HarnessId;
  name: string;
  status: "THINKING" | "STREAMING" | "PAUSED" | "AWAITING_CLEARANCE";
  currentTokens: number;
  maxTokens: number;
  steps: CognitiveStep[];
}

const INITIAL_SESSIONS: AgentSession[] = [
  {
    id: "sess-hermes-8821",
    harnessId: "hermes",
    name: "Session #HERMES-8821 // Infrastructure Audit",
    status: "AWAITING_CLEARANCE",
    currentTokens: 42180,
    maxTokens: 128000,
    steps: [
      {
        step: 1,
        title: "Ingest System Architecture Directive",
        thought: "Analyzing multi-agent requirements across DirtyNest Docker containers and Obsidian vector indexes.",
        output: "Identified 4 active container endpoints and 142 markdown knowledge nodes.",
      },
      {
        step: 2,
        title: "Query DataCore Vector Knowledge Base",
        thought: "Performing cosine distance lookup on 'CVE_2026_9811' and 'eBPF Daemon' schemas.",
        toolCall: {
          name: "sqlite_vec_query",
          args: '{"collection": "threat_intel", "query": "CVE_2026_9811", "limit": 3}',
          requiresApproval: false,
          status: "approved",
        },
        output: "Cosine match 0.94 found in note: Threats/CVE_2026_9811.md",
      },
      {
        step: 3,
        title: "Execute Security Clearance Probe",
        thought: "Requesting container socket validation to verify zero unauthorized ingress ports.",
        toolCall: {
          name: "docker_socket_inspect",
          args: '{"target": "dirtynest-auth-proxy", "action": "scan_ports", "ports": [443, 8080]}',
          requiresApproval: true,
          status: "pending",
        },
      },
    ],
  },
  {
    id: "sess-codex-7104",
    harnessId: "codex",
    name: "Session #CODEX-7104 // Next.js Component Refactor",
    status: "STREAMING",
    currentTokens: 18450,
    maxTokens: 200000,
    steps: [
      {
        step: 1,
        title: "Parse AST Tree of ToolsView.tsx",
        thought: "Verifying that all 12 plugin modules export type-safe manifests.",
        output: "AST parsed cleanly with zero syntax violations.",
      },
      {
        step: 2,
        title: "Synthesize Tailwind v4 Neon Tokens",
        thought: "Injecting luminous #00FF41, #00F0FF, and #BF40FF glassmorphism gradients.",
        output: "Generated 4 responsive glass cards.",
      },
    ],
  },
  {
    id: "sess-opencode-4412",
    harnessId: "opencode",
    name: "Session #OPENCODE-4412 // Local Air-Gapped Sandbox",
    status: "THINKING",
    currentTokens: 11200,
    maxTokens: 32000,
    steps: [
      {
        step: 1,
        title: "Initialize Ollama CUDA Memory Buffer",
        thought: "Loaded DeepSeek-Coder-V2-Lite onto RTX 4090 VRAM (8.4 GB reserved).",
        output: "Inference engine warm · 78 tokens/sec.",
      },
    ],
  },
];

export default function ControlRoomView() {
  const [selectedHarnessId, setSelectedHarnessId] = useState<HarnessId>("hermes");
  const [sessions, setSessions] = useState<AgentSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("sess-hermes-8821");
  const [temperature, setTemperature] = useState(0.2);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [promptInjection, setPromptInjection] = useState("");

  const activeHarness = HARNESSES.find((h) => h.id === selectedHarnessId) || HARNESSES[0];
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleApproveTool = (stepIdx: number) => {
    cyberAudio.play("chime");
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === activeSessionId) {
          const updatedSteps = [...sess.steps];
          if (updatedSteps[stepIdx]?.toolCall) {
            updatedSteps[stepIdx].toolCall!.status = "approved";
            updatedSteps[stepIdx].output = "[APPROVED BY OPERATOR] Tool executed successfully · returncode=0 · telemetry verified.";
          }
          return { ...sess, status: "STREAMING", steps: updatedSteps };
        }
        return sess;
      })
    );
  };

  const handleDenyTool = (stepIdx: number) => {
    cyberAudio.play("click");
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === activeSessionId) {
          const updatedSteps = [...sess.steps];
          if (updatedSteps[stepIdx]?.toolCall) {
            updatedSteps[stepIdx].toolCall!.status = "denied";
            updatedSteps[stepIdx].output = "[DENIED BY OPERATOR] Execution blocked by AirGap security protocol.";
          }
          return { ...sess, status: "PAUSED", steps: updatedSteps };
        }
        return sess;
      })
    );
  };

  const handleForkSession = () => {
    cyberAudio.play("click");
    const newSessionId = `sess-${selectedHarnessId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSession: AgentSession = {
      id: newSessionId,
      harnessId: selectedHarnessId,
      name: `Session #${newSessionId.toUpperCase()} // Forked Branch`,
      status: "THINKING",
      currentTokens: Math.floor(activeSession.currentTokens * 0.7),
      maxTokens: activeSession.maxTokens,
      steps: [
        ...activeSession.steps,
        {
          step: activeSession.steps.length + 1,
          title: "Forked Execution Branch Initiated",
          thought: "Rewound state to current checkpoint and branched decision path.",
          output: "Ready for operator prompt injection.",
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    cyberAudio.play("chime");
  };

  const handleInjectPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInjection.trim()) return;
    cyberAudio.play("click");
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            status: "THINKING",
            steps: [
              ...s.steps,
              {
                step: s.steps.length + 1,
                title: "Operator Injected Directive",
                thought: `Parsing operator input: "${promptInjection.trim()}"`,
                output: `Directive queued for execution by ${activeHarness.name}.`,
              },
            ],
          };
        }
        return s;
      })
    );
    setPromptInjection("");
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP CONTROL ROOM HUD BANNER */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${activeHarness.accentHex} 0%, rgba(0,240,255,0.2) 100%)`,
                border: `1px solid ${activeHarness.color}80`,
                boxShadow: `0 0 16px ${activeHarness.accentHex}`,
              }}
            >
              <Radio size={20} style={{ color: activeHarness.color }} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  AGENT CONTROL ROOM // <span style={{ color: activeHarness.color }}>MULTI-HARNESS MATRIX</span>
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded border"
                  style={{
                    color: activeHarness.color,
                    background: activeHarness.accentHex,
                    borderColor: `${activeHarness.color}60`,
                  }}
                >
                  {activeHarness.codename}
                </span>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 hidden sm:inline">
                  {activeHarness.runtime}
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">{activeHarness.tagline}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleForkSession}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#F1F3F9] transition-all cursor-pointer"
            >
              <GitBranch size={14} className="text-[#00F0FF]" />
              <span>FORK SESSION</span>
            </button>
          </div>
        </div>

        {/* 4 HARNESS SELECTOR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-white/5">
          {HARNESSES.map((h) => {
            const isSelected = selectedHarnessId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedHarnessId(h.id);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    : "bg-black/20 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20"
                }`}
                style={{
                  borderColor: isSelected ? h.color : undefined,
                  boxShadow: isSelected ? `0 0 12px ${h.accentHex}` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black" style={{ color: isSelected ? h.color : "#F1F3F9" }}>
                    {h.name}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                </div>
                <span className="text-[10px] text-[#4F536E] font-mono mt-1">{h.model}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN 2-COLUMN CONTROL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ACTIVE SESSIONS & HARNESS CONTROLS (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Sessions List */}
          <div className="cyber-card p-4 flex flex-col gap-3">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Active Sessions ({sessions.length}):</span>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = activeSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      cyberAudio.play("click");
                      setActiveSessionId(sess.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#00FF41]/10 border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                        : "bg-black/40 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F1F3F9] truncate">{sess.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          sess.status === "AWAITING_CLEARANCE"
                            ? "bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 animate-pulse"
                            : sess.status === "STREAMING"
                            ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40"
                            : "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
                      <span>{sess.steps.length} Reasoning Steps</span>
                      <span>
                        {Math.round((sess.currentTokens / sess.maxTokens) * 100)}% Context Used
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Harness Runtime Dials */}
          <div className="cyber-card p-4 flex flex-col gap-3.5">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Harness Parameters:</span>

            {/* Context Window Meter */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9499B3]">Context Window:</span>
                <span className="text-[#00FF41] font-bold">{activeSession.currentTokens.toLocaleString()} / {activeSession.maxTokens.toLocaleString()} tok</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00FF41] to-[#00F0FF] rounded-full transition-all"
                  style={{ width: `${(activeSession.currentTokens / activeSession.maxTokens) * 100}%` }}
                />
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9499B3]">Temperature:</span>
                <span className="text-[#00F0FF] font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>

            {/* System Prompt Override */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9499B3]">System Prompt Override:</span>
              <textarea
                rows={3}
                defaultValue={activeHarness.defaultPrompt}
                className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP-BY-STEP REASONING & TOOL INTERCEPTOR (8 Cols) */}
        <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity size={18} style={{ color: activeHarness.color }} />
              <h3 className="text-sm font-black text-[#F1F3F9]">COGNITIVE TRACE & REASONING SCRATCHPAD</h3>
            </div>
            <span className="text-xs font-bold" style={{ color: activeHarness.color }}>
              SESSION: {activeSession.id.toUpperCase()}
            </span>
          </div>

          {/* Reasoning Steps Stream */}
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            {activeSession.steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-xs font-bold text-[#00FF41] flex items-center justify-center">
                      {step.step}
                    </span>
                    <h4 className="text-xs font-bold text-[#F1F3F9]">{step.title}</h4>
                  </div>
                  <span className="text-[10px] text-[#4F536E] font-mono">TRACE_OK</span>
                </div>

                {/* Thought String */}
                <p className="text-xs text-[#9499B3] leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                  &quot;{step.thought}&quot;
                </p>

                {/* Tool Call Interceptor Gate */}
                {step.toolCall && (
                  <div
                    className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      step.toolCall.status === "pending"
                        ? "bg-[#FFB800]/10 border-[#FFB800]/40 shadow-[0_0_12px_rgba(255,184,0,0.15)]"
                        : step.toolCall.status === "approved"
                        ? "bg-[#00FF41]/10 border-[#00FF41]/30"
                        : "bg-[#FF2A6D]/10 border-[#FF2A6D]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert size={14} className={step.toolCall.status === "pending" ? "text-[#FFB800]" : "text-[#00FF41]"} />
                        <span className="font-black text-[#F1F3F9]">TOOL INVOCATION: {step.toolCall.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          step.toolCall.status === "pending"
                            ? "bg-[#FFB800]/20 text-[#FFB800]"
                            : step.toolCall.status === "approved"
                            ? "bg-[#00FF41]/20 text-[#00FF41]"
                            : "bg-[#FF2A6D]/20 text-[#FF2A6D]"
                        }`}
                      >
                        {step.toolCall.status.toUpperCase()}
                      </span>
                    </div>

                    <code className="p-2 rounded bg-black/80 text-[#00F0FF] text-[11px] font-mono break-all">
                      {step.toolCall.args}
                    </code>

                    {step.toolCall.status === "pending" && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleDenyTool(idx)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF2A6D]/15 border border-[#FF2A6D]/40 text-[#FF2A6D] hover:bg-[#FF2A6D]/25 text-xs font-bold cursor-pointer"
                        >
                          <XCircle size={12} />
                          <span>DENY INVOCATION</span>
                        </button>
                        <button
                          onClick={() => handleApproveTool(idx)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold shadow-[0_0_8px_rgba(0,255,65,0.2)] cursor-pointer"
                        >
                          <CheckCircle2 size={12} />
                          <span>APPROVE & DISPATCH</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Output String */}
                {step.output && (
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-xs text-[#00FF41] font-mono leading-relaxed">
                    {step.output}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Operator Direct Prompt Injection */}
          <form onSubmit={handleInjectPrompt} className="flex gap-2 mt-2 pt-3 border-t border-white/10">
            <input
              type="text"
              value={promptInjection}
              onChange={(e) => setPromptInjection(e.target.value)}
              placeholder={`Inject live directive into ${activeHarness.name}...`}
              className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00FF41]/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              TRANSMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
