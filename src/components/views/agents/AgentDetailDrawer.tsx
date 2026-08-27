"use client";

import { useState } from "react";
import {
  X,
  Cpu,
  Activity,
  Bot,
  Terminal,
  Shield,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Code2,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  type: string;
  status: "active" | "executing" | "idle" | "paused";
  cpuUsage: number;
  memoryMb: number;
  tasksCompleted: number;
  successRate: number;
  lastAction: string;
  tags: string[];
  color: string;
}

interface AgentDetailDrawerProps {
  agent: SwarmAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: SwarmAgent["status"]) => void;
  onFlushMemory: (id: string) => void;
}

export default function AgentDetailDrawer({
  agent,
  isOpen,
  onClose,
  onStatusChange,
  onFlushMemory,
}: AgentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"monologue" | "memory" | "tools" | "telemetry">("monologue");
  const [copiedMemory, setCopiedMemory] = useState(false);

  if (!isOpen || !agent) return null;

  const mockThoughts = [
    { time: "00:01.2s", type: "THOUGHT", text: `Analyzing task buffer for ${agent.role}... Found 3 unresolved telemetry events.` },
    { time: "00:02.8s", type: "DISPATCH", text: `Triggering subprocess hook with permissions [${agent.tags.join(", ")}].` },
    { time: "00:04.1s", type: "EXEC", text: agent.lastAction },
    { time: "00:05.4s", type: "VERIFY", text: `Output validation passed. Health score 99.8%. Checkpointing memory layer.` },
  ];

  const mockMemory = {
    agentId: agent.id,
    allocatedMemoryKb: agent.memoryMb * 1024,
    contextWindow: "64k Tokens",
    activeBuffer: `# Working Context Buffer: ${agent.name}
- Current Strategy: Continuous Zero-Trust Autonomous Recon
- Target Environment: Localhost & Cluster Mesh
- Assigned Tags: ${agent.tags.join(", ")}
- Last Verified Checkpoint: 2026-08-27 08:24:00 UTC
- Error Budget Remaining: 100.0%`,
  };

  const handleCopyMemory = () => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(mockMemory.activeBuffer);
    setCopiedMemory(true);
    setTimeout(() => setCopiedMemory(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#0b0c10] border-l border-emerald-500/30 text-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-emerald-500/20 bg-[#07070b]/90 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded border flex items-center justify-center font-mono font-bold"
                style={{ borderColor: agent.color, color: agent.color, backgroundColor: `${agent.color}15` }}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold font-mono text-white tracking-wide">{agent.name}</h2>
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border"
                    style={{ borderColor: agent.color, color: agent.color }}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">{agent.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Ribbon */}
          <div className="px-5 py-3 bg-[#0a0b12] border-b border-emerald-500/10 flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              {agent.status === "paused" ? (
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    onStatusChange(agent.id, "active");
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>RESUME AGENT</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    onStatusChange(agent.id, "paused");
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE SWARM</span>
                </button>
              )}

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onStatusChange(agent.id, "executing");
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>STEP TICK</span>
              </button>
            </div>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onFlushMemory(agent.id);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>FLUSH BUFFER</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-emerald-500/10 bg-[#07070b] px-4 font-mono text-xs">
            {[
              { id: "monologue", label: "INTERNAL MONOLOGUE", icon: Terminal },
              { id: "memory", label: "WORKING MEMORY", icon: Database },
              { id: "tools", label: "TOOL ACCESS", icon: Sliders },
              { id: "telemetry", label: "LIVE TELEMETRY", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    cyberAudio.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center space-x-1.5 py-3 px-3 border-b-2 transition-colors ${
                    active
                      ? "border-emerald-400 text-emerald-400 font-bold bg-emerald-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
            {activeTab === "monologue" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>LIVE COGNITIVE TRACE</span>
                  <span className="text-emerald-400 animate-pulse">● STREAM ACTIVE</span>
                </div>
                {mockThoughts.map((t, idx) => (
                  <div key={idx} className="p-3 rounded bg-black/40 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="text-cyan-400 font-bold">[{t.type}]</span>
                      <span>+{t.time}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-mono">{t.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">EPISODIC BUFFER (MEMORY.MD)</span>
                  <button
                    onClick={handleCopyMemory}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  >
                    {copiedMemory ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMemory ? "COPIED" : "COPY BUFFER"}</span>
                  </button>
                </div>
                <div className="p-3 bg-black/60 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {mockMemory.activeBuffer}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-slate-500">Context Window</div>
                    <div className="font-bold text-white mt-0.5">{mockMemory.contextWindow}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-slate-500">Buffer Size</div>
                    <div className="font-bold text-white mt-0.5">{mockMemory.allocatedMemoryKb} KB</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-3">
                <div className="text-slate-400 pb-2 border-b border-slate-800">AUTHORIZED SUBPROCESS HOOKS</div>
                <div className="space-y-2">
                  {[
                    { name: "bash_exec", desc: "Execute sandboxed terminal commands", authorized: true },
                    { name: "sqlite_query", desc: "Read & write to local telemetry db", authorized: true },
                    { name: "web_fetch_jina", desc: "Agent-Reach HTTP reader & markdown extractor", authorized: true },
                    { name: "docker_socket", desc: "Docker daemon container controls", authorized: false },
                    { name: "fs_write_sandbox", desc: "Direct file write to workspace", authorized: true },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="p-3 rounded bg-black/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">{tool.name}</div>
                        <div className="text-[11px] text-slate-400">{tool.desc}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tool.authorized
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {tool.authorized ? "AUTHORIZED" : "CLEARANCE REQ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "telemetry" && (
              <div className="space-y-4">
                <div className="text-slate-400 pb-2 border-b border-slate-800">RESOURCE UTILIZATION</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>CPU USAGE</span>
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{agent.cpuUsage}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded" style={{ width: `${agent.cpuUsage}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>MEMORY</span>
                      <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{agent.memoryMb} MB</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div
                        className="bg-purple-400 h-full rounded"
                        style={{ width: `${Math.min(100, (agent.memoryMb / 512) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>EXECUTION METRICS</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
                    <div>Tasks Executed: <span className="font-bold text-white">{agent.tasksCompleted}</span></div>
                    <div>Success Rate: <span className="font-bold text-emerald-400">{agent.successRate}%</span></div>
                    <div>Process PID: <span className="font-bold text-white">#8914</span></div>
                    <div>Tick Latency: <span className="font-bold text-white">42ms</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
