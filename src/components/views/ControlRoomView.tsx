import { useState, useEffect } from "react";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
import {
  Radio,
  Cpu,
  GitBranch,
  OctagonAlert,
  Activity,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Clock,
  Split,
  Brain,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import SwarmTopologyGraph from "./control_room/SwarmTopologyGraph";
import HitlApprovalQueue from "./control_room/HitlApprovalQueue";
import TokenStreamMonitor from "./control_room/TokenStreamMonitor";
import ExecutionTimeline from "./control_room/ExecutionTimeline";
import MultiAgentDiffViewer from "./control_room/MultiAgentDiffViewer";
import ResourceAllocationGauges from "./control_room/ResourceAllocationGauges";
import HermesSkillBrowser from "./control_room/HermesSkillBrowser";
import HermesMemoryInspector from "./control_room/HermesMemoryInspector";
import HitlApprovalModal, { PendingApproval } from "./control_room/HitlApprovalModal";
import MultiFeedCyberStreamGrid from "./control_room/MultiFeedCyberStreamGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export type HarnessId = "hermes" | "pi" | "opencode";

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
    name: "Hermes Master Orchestrator",
    codename: "HERMES-MASTER-AI-BRAIN",
    model: "Nous-Hermes-3-Llama-70B",
    tagline: "100% Master AI Backend: multi-step reasoning, persistent memory, and self-improving skill creation",
    color: "#00FF41",
    accentHex: "rgba(0, 255, 65, 0.2)",
    contextWindow: "128k Tokens",
    temperature: 0.2,
    runtime: "Cloud Multi-Agent RPC",
    defaultPrompt: "You are Hermes, the 100% Master AI Brain of DirtyNest. Orchestrate plans with precision, dispatch coding tasks to subordinate workers (Pi / OpenCode), and enforce zero-trust security.",
  },
  {
    id: "pi",
    name: "Pi Code Synthesis Worker",
    codename: "PI-SUBORDINATE-CODER",
    model: "Inflection-2.5 / Deep-Reflection",
    tagline: "Dedicated code synthesis sub-harness: empathetic refactoring, architectural critique & edge-case linting",
    color: "#BF40FF",
    accentHex: "rgba(191, 64, 255, 0.2)",
    contextWindow: "64k Tokens",
    temperature: 0.7,
    runtime: "V8 Isolate",
    defaultPrompt: "You are Pi Code Synthesis Worker. You operate as a specialized sub-harness under Hermes Master Brain.",
  },
  {
    id: "opencode",
    name: "OpenCode Local AST Worker",
    codename: "OPENCODE-CUDA-SUBORDINATE",
    model: "DeepSeek-Coder-V2-Lite-Q8",
    tagline: "Air-gapped local open-weights code engine with hardware CUDA offloading for high-speed AST transforms",
    color: "#FFB800",
    accentHex: "rgba(255, 184, 0, 0.2)",
    contextWindow: "32k Tokens",
    temperature: 0.3,
    runtime: "Local CUDA (RTX 4090)",
    defaultPrompt: "You are OpenCode Local AST Worker. Run within the air-gapped DirtyNest sandbox and execute safe code transformations under Hermes dispatch.",
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

type ControlRoomSubTab = "trace" | "telemetry" | "skills_memory" | "topology" | "stream";

export default function ControlRoomView() {
  const [selectedHarnessId, setSelectedHarnessId] = useState<HarnessId>("hermes");
  const [temperature, setTemperature] = useState(0.2);
  const [promptInjection, setPromptInjection] = useState("");
  const [isKillswitchActive, setIsKillswitchActive] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ControlRoomSubTab>("trace");
  const [pendingModalApproval, setPendingModalApproval] = useState<PendingApproval | null>(null);

  const {
    activeSessionId,
    sessions,
    messages,
    currentReasoningTrace,
    isStreaming,
    isLoading,
    fetchSessions,
    createSession,
    selectSession,
    deleteSession,
    sendPromptDirective,
    pendingGate,
    resolveGateClearance,
  } = useHermesAcpStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  const activeHarness = HARNESSES.find((h) => h.id === selectedHarnessId) || HARNESSES[0];
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: "none",
    name: "No Active Session",
    status: "IDLE",
    cwd: "",
    model: "",
  };

  const handleStepForward = () => {
    cyberAudio.play("click");
  };

  const handleResetSteps = () => {
    cyberAudio.play("click");
  };

  const handleOpenApprovalModal = (stepIdx: number, toolCall: any) => {
    cyberAudio.play("click");
    setPendingModalApproval({
      id: pendingGate?.request_id || "gate-1",
      stepIdx,
      agent: activeHarness.name,
      toolName: pendingGate?.tool_name || "unknown",
      argsJson: JSON.stringify(pendingGate?.parameters || {}),
      risk: pendingGate?.risk_level === "critical" ? "CRITICAL" : "STANDARD",
      description: `ACP Gate Clearance request for tool: ${pendingGate?.tool_name}`,
    });
  };

  const handleModalApprove = async (id: string, modifiedArgs?: string) => {
    cyberAudio.play("chime");
    if (pendingGate) {
      await resolveGateClearance(pendingGate.request_id, "ALLOW_ONCE");
    }
    setPendingModalApproval(null);
  };

  const handleModalDeny = async (id: string, reason: string) => {
    cyberAudio.play("error");
    if (pendingGate) {
      await resolveGateClearance(pendingGate.request_id, "DENY");
    }
    setPendingModalApproval(null);
  };

  const handleApproveTool = async (stepIdx: number) => {
    cyberAudio.play("chime");
    if (pendingGate) {
      await resolveGateClearance(pendingGate.request_id, "ALLOW_ONCE");
    }
  };

  const handleDenyTool = async (stepIdx: number) => {
    cyberAudio.play("click");
    if (pendingGate) {
      await resolveGateClearance(pendingGate.request_id, "DENY");
    }
  };

  const handleForkSession = async () => {
    cyberAudio.play("click");
    await createSession(`Forked Session // ${activeHarness.name}`, "dirtydaily", activeHarness.model);
  };

  const handleInjectPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInjection.trim()) return;
    cyberAudio.play("click");
    await sendPromptDirective(promptInjection.trim());
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
                  AGENT CONTROL ROOM // <span style={{ color: activeHarness.color }}>HERMES TACTICAL SUITE</span>
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
            {/* Emergency Swarm Killswitch */}
            <Button
              type="button"
              onClick={() => {
                cyberAudio.play("error");
                setIsKillswitchActive(!isKillswitchActive);
              }}
              className={cn(
                "h-9 px-3.5 text-xs font-bold transition-all",
                isKillswitchActive
                  ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,60,0.8)] animate-pulse"
                  : "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25"
              )}
              title="Emergency Swarm Killswitch: Immediately freeze all autonomous loops"
            >
              <OctagonAlert size={14} className="mr-1.5" />
              <span>{isKillswitchActive ? "KILLSWITCH ENGAGED" : "SWARM FREEZE"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleForkSession}
              className="h-9 px-3.5 bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold text-[#F1F3F9]"
            >
              <GitBranch size={14} className="text-[#00F0FF] mr-1.5" />
              <span>FORK SESSION</span>
            </Button>
          </div>
        </div>

        {/* 3 HARNESS SELECTOR TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-white/5">
          {HARNESSES.map((h) => {
            const isSelected = selectedHarnessId === h.id;
            return (
              <button
                key={h.id}
                type="button"
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
                    {h.name} {h.id === "hermes" ? "★ 100% MASTER BRAIN" : "⚡ SUBORDINATE CODER"}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                </div>
                <span className="text-[10px] text-[#4F536E] font-mono mt-1">{h.model}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EMERGENCY KILLSWITCH ALERT BANNER */}
      {isKillswitchActive && (
        <div className="p-4 rounded-2xl bg-red-600/20 border-2 border-red-500 text-white flex items-center justify-between shadow-[0_0_40px_rgba(255,0,60,0.5)] animate-pulse">
          <div className="flex items-center gap-3">
            <OctagonAlert size={24} className="text-red-400" />
            <div className="flex flex-col">
              <span className="font-black text-sm text-red-300">EMERGENCY KILLSWITCH ACTIVE</span>
              <span className="text-xs text-red-200 font-sans">All agent loops, tool invocations, and filesystem writes are frozen.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("chime");
              setIsKillswitchActive(false);
            }}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 cursor-pointer"
          >
            DISENGAGE FREEZE
          </button>
        </div>
      )}

      {/* CONTROL ROOM SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "trace" as const, label: "Cognitive Trace & Sessions", icon: Activity },
          { id: "stream" as const, label: "Tactical Feeds & Broadcast Overlays", icon: Radio },
          { id: "telemetry" as const, label: "Token Burndown & Hardware Gauges", icon: Zap },
          { id: "skills_memory" as const, label: "Hermes Skills & Persistent Memory", icon: Brain },
          { id: "topology" as const, label: "DAG Topology & HITL Approvals", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveSubTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                  : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COGNITIVE TRACE & SESSIONS */}
      {activeSubTab === "trace" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Main 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Sessions & Parameters (4 cols) */}
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
                          selectSession(sess.id);
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
                              sess.status === "WAITING_CLEARANCE"
                                ? "bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 animate-pulse"
                                : sess.status === "RUNNING"
                                ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40"
                                : "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                            }`}
                          >
                            {sess.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
                          <span>Model: {sess.model}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Harness Runtime Dials */}
              <div className="cyber-card p-4 flex flex-col gap-3.5">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">Harness Parameters:</span>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9499B3]">Context Window:</span>
                    <span className="text-[#00FF41] font-bold">128,000 max budget</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00FF41] to-[#00F0FF] rounded-full transition-all"
                      style={{ width: "35%" }}
                    />
                  </div>
                </div>

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

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#9499B3]">System Prompt Directive:</span>
                  <textarea
                    rows={3}
                    defaultValue={activeHarness.defaultPrompt}
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Right Cognitive Trace & Injection (8 cols) */}
            <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity size={18} style={{ color: activeHarness.color }} />
                  <h3 className="text-sm font-black text-[#F1F3F9]">COGNITIVE TRACE & STEP DEBUGGER</h3>
                </div>

                {/* Cognitive Step Playback Controls */}
                <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 text-xs gap-1.5">
                  <button
                    type="button"
                    onClick={handleStepForward}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-colors flex items-center gap-1"
                    title="Step Forward Single Cognitive Tick"
                  >
                    <Zap size={12} />
                    <span>STEP NEXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSteps}
                    className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                    title="Rewind to Step 1"
                  >
                    RESET
                  </button>
                </div>
              </div>

              {/* Reasoning Steps Stream */}
              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                {messages.length === 0 && !currentReasoningTrace && (
                  <div className="py-12 text-center text-xs text-[#4F536E]">
                    No messages in this session yet. Transmit a directive below to begin execution.
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF41]">
                        {msg.role === "user" ? "OPERATOR INJECTION" : "HERMES COGNITION"}
                      </span>
                      <span className="text-[9px] text-[#4F536E] font-mono">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {msg.reasoning_trace && (
                      <div className="p-3 rounded-lg bg-black/60 border border-[#00FF41]/20 text-xs text-[#9499B3] leading-relaxed italic font-mono">
                        {msg.reasoning_trace}
                      </div>
                    )}

                    <p className="text-xs text-[#F1F3F9] leading-relaxed font-mono whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}

                {currentReasoningTrace && (
                  <div className="p-4 rounded-xl bg-[#00FF41]/5 border border-[#00FF41]/30 flex flex-col gap-2 animate-pulse">
                    <span className="text-[10px] font-bold text-[#00FF41]">STREAMING THOUGHT TRACE...</span>
                    <pre className="text-xs text-[#00FF41] font-mono whitespace-pre-wrap leading-relaxed">
                      {currentReasoningTrace}
                      <span className="inline-block w-1.5 h-3.5 bg-[#00FF41] ml-1 animate-ping" />
                    </pre>
                  </div>
                )}
              </div>

              {/* Direct Prompt Injection */}
              <form onSubmit={handleInjectPrompt} className="flex gap-2 mt-2 pt-3 border-t border-white/10">
                <Input
                  type="text"
                  value={promptInjection}
                  onChange={(e) => setPromptInjection(e.target.value)}
                  placeholder={`Inject live directive into ${activeHarness.name}...`}
                  className="flex-1 bg-black/50 border-white/10 text-xs text-[#F1F3F9] font-mono"
                />
                <Button
                  type="submit"
                  className="bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                >
                  TRANSMIT
                </Button>
              </form>
            </div>
          </div>

          {/* Execution Chronological Timeline */}
          <ExecutionTimeline />

          {/* Multi-Agent Diff Comparator */}
          <MultiAgentDiffViewer />
        </div>
      )}

      {/* TAB: MULTI-FEED TACTICAL BROADCAST STREAMS */}
      {activeSubTab === "stream" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <MultiFeedCyberStreamGrid />
        </div>
      )}

      {/* TAB 2: TOKEN BURNDOWN & HARDWARE GAUGES */}
      {activeSubTab === "telemetry" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <TokenStreamMonitor />
          <ResourceAllocationGauges />
        </div>
      )}

      {/* TAB 3: HERMES SKILLS & PERSISTENT MEMORY */}
      {activeSubTab === "skills_memory" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <HermesSkillBrowser />
          <HermesMemoryInspector />
        </div>
      )}

      {/* TAB 4: DAG TOPOLOGY & HITL QUEUE */}
      {activeSubTab === "topology" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <SwarmTopologyGraph
            selectedNodeId={selectedHarnessId}
            onSelectNode={(nodeId) => setSelectedHarnessId(nodeId as HarnessId)}
          />
          <HitlApprovalQueue />
        </div>
      )}

      {/* Interactive HITL Clearance Gate Modal */}
      <HitlApprovalModal
        approval={pendingModalApproval}
        isOpen={!!pendingModalApproval}
        onClose={() => setPendingModalApproval(null)}
        onApprove={handleModalApprove}
        onDeny={handleModalDeny}
      />
    </div>
  );
}
