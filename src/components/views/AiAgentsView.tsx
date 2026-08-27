"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Terminal,
  Shield,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  Search,
  Globe,
  Radio,
  BarChart3,
  Server,
  Sparkles,
  Trophy,
  GitMerge,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import AgentMemoryInspector from "./agents/AgentMemoryInspector";
import CreateAgentModal from "./agents/CreateAgentModal";
import AgentBlueprintDesigner from "./agents/AgentBlueprintDesigner";
import SwarmOrchestrationTimeline from "./agents/SwarmOrchestrationTimeline";
import AgentPerformanceLeaderboard from "./agents/AgentPerformanceLeaderboard";
import ToolPermissionMatrix from "./agents/ToolPermissionMatrix";
import AgentDetailDrawer, { SwarmAgent } from "./agents/AgentDetailDrawer";
import SwarmDagPipelineModal from "./agents/SwarmDagPipelineModal";
import PaperclipCompanyControlPlane from "./agents/PaperclipCompanyControlPlane";

type Agent = SwarmAgent;

const INITIAL_AGENTS: Agent[] = [
  {
    id: "agy-01",
    name: "SENTINEL-01",
    role: "Threat Recon & Vulnerability Hunter",
    type: "Defensive Security",
    status: "active",
    cpuUsage: 14,
    memoryMb: 142,
    tasksCompleted: 482,
    successRate: 99.8,
    lastAction: "Scanned /api/v1/auth routes - 0 CVEs detected",
    tags: ["mTLS", "Ed25519", "CORS"],
    color: "#00FF41",
  },
  {
    id: "agy-02",
    name: "SCRAPER-INTEL",
    role: "Autonomous Threat & News Harvester",
    type: "Intelligence Feed",
    status: "executing",
    cpuUsage: 22,
    memoryMb: 188,
    tasksCompleted: 914,
    successRate: 98.9,
    lastAction: "Harvested 38 telemetry briefings from HackerNews & Vercel Labs",
    tags: ["RSS", "Scraping", "Parser"],
    color: "#00F0FF",
  },
  {
    id: "agy-03",
    name: "KUBE-DEPLOYER",
    role: "Canary Rollout & Mesh Orchestrator",
    type: "DevOps & CI/CD",
    status: "idle",
    cpuUsage: 3,
    memoryMb: 76,
    tasksCompleted: 156,
    successRate: 100.0,
    lastAction: "Mesh cluster v2.4.0 verified operational with 0 downtime",
    tags: ["Kubernetes", "Docker", "Canary"],
    color: "#BF40FF",
  },
  {
    id: "agy-04",
    name: "CODE-AUDITOR",
    role: "AST Pattern & Secrets Leak Verifier",
    type: "AppSec Static Audit",
    status: "executing",
    cpuUsage: 31,
    memoryMb: 240,
    tasksCompleted: 312,
    successRate: 99.4,
    lastAction: "Analyzing src/components for hardcoded API keys & memory leaks",
    tags: ["AST", "SAST", "TypeScript"],
    color: "#FFB800",
  },
  {
    id: "agy-05",
    name: "DB-OPTIMIZER",
    role: "SQLite Query Profiler & B-Tree Balancer",
    type: "Database Engine",
    status: "idle",
    cpuUsage: 5,
    memoryMb: 92,
    tasksCompleted: 641,
    successRate: 100.0,
    lastAction: "Executed PRAGMA optimize on dirtynest.db [Index Cache 99.2%]",
    tags: ["SQLite", "WAL", "B-Tree"],
    color: "#00FF41",
  },
  {
    id: "agy-06",
    name: "LATENCY-PINGER",
    role: "Synthetic Load Tester & Node Watchdog",
    type: "Telemetry Benchmark",
    status: "active",
    cpuUsage: 18,
    memoryMb: 110,
    tasksCompleted: 1208,
    successRate: 99.9,
    lastAction: "Benchmarked GraphQL Gateway: 28ms latency | 0 packet loss",
    tags: ["p99", "Mesh", "SLA"],
    color: "#FF2A6D",
  },
];

interface LogEntry {
  id: string;
  time: string;
  agent: string;
  level: "INFO" | "EXEC" | "WARN" | "PASS";
  message: string;
}

type AgentsSubTab = "fleet" | "blueprint" | "orchestration" | "permissions" | "company";

export default function AiAgentsView() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isSwarmActive, setIsSwarmActive] = useState(true);
  const [swarmSpeed, setSwarmSpeed] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [filterTag, setFilterTag] = useState("ALL");
  const [missionInput, setMissionInput] = useState("");
  const [inspectingAgent, setInspectingAgent] = useState<Agent | null>(null);
  const [selectedDetailAgent, setSelectedDetailAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDagModal, setShowDagModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<AgentsSubTab>("fleet");
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "l-1", time: "23:40:10", agent: "SENTINEL-01", level: "PASS", message: "Port 3000 boundary isolation verified. Zero open vulnerabilities." },
    { id: "l-2", time: "23:40:15", agent: "SCRAPER-INTEL", level: "INFO", message: "Fetched 12 new articles from Next.js 16 Edge Stream." },
    { id: "l-3", time: "23:40:22", agent: "CODE-AUDITOR", level: "EXEC", message: "Running AST sanitizer on React 19 Client Components." },
    { id: "l-4", time: "23:40:28", agent: "LATENCY-PINGER", level: "INFO", message: "Mesh nodes ping: 13ms p50, 22ms p99 across all regions." },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Periodic simulation of agent telemetry updates with speed multiplier
  useEffect(() => {
    if (!isSwarmActive) return;

    const intervalTime = Math.max(500, 2800 / swarmSpeed);
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((ag) => {
          if (ag.status === "paused") return ag;
          const cpuDelta = (Math.random() * 6 - 3).toFixed(0);
          const newCpu = Math.min(95, Math.max(2, ag.cpuUsage + parseInt(cpuDelta)));
          return {
            ...ag,
            cpuUsage: newCpu,
            tasksCompleted: Math.random() > 0.6 ? ag.tasksCompleted + 1 : ag.tasksCompleted,
          };
        })
      );

      if (Math.random() > 0.4) {
        const randomAgent = INITIAL_AGENTS[Math.floor(Math.random() * INITIAL_AGENTS.length)];
        const timeNow = new Date().toLocaleTimeString("en-US", { hour12: false });
        const sampleLogs = [
          "Dispatched autonomous thread worker pool #34",
          "Synchronized memory buffer cache with master ledger",
          "Calculated token budget efficiency: 98.6% compliance",
          "Verified TLS certificate chain for local mesh proxy",
          "Garbage collector pruned 18.4MB inactive AST nodes",
          "Emitted telemetry heartbeat packet to command center",
        ];
        const randomMsg = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
        setLogs((prev) => [
          ...prev.slice(-30),
          {
            id: `log-${Date.now()}`,
            time: timeNow,
            agent: randomAgent.name,
            level: Math.random() > 0.8 ? "PASS" : "INFO",
            message: randomMsg,
          },
        ]);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSwarmActive, swarmSpeed]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleSwarm = () => {
    cyberAudio.play("toggle");
    setIsSwarmActive(!isSwarmActive);
  };

  const handleStepTick = () => {
    cyberAudio.play("click");
    setAgents((prev) =>
      prev.map((ag) => ({
        ...ag,
        tasksCompleted: ag.tasksCompleted + 1,
        cpuUsage: Math.min(98, Math.max(10, ag.cpuUsage + Math.floor(Math.random() * 8 - 4))),
      }))
    );
  };

  const handleStatusChange = (id: string, newStatus: SwarmAgent["status"]) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedDetailAgent?.id === id) {
      setSelectedDetailAgent((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleFlushMemory = (id: string) => {
    const timeNow = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [
      ...prev,
      {
        id: `flush-${Date.now()}`,
        time: timeNow,
        agent: id,
        level: "WARN",
        message: `FLUSH_MEMORY triggered: Cleared active context buffer for ${id}`,
      },
    ]);
  };

  const toggleAgentStatus = (id: string) => {
    cyberAudio.play("click");
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === "paused" ? "active" : "paused";
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const dispatchMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionInput.trim()) return;

    cyberAudio.play("toggle");
    const timeNow = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        time: timeNow,
        agent: "HERMES-SWARM",
        level: "EXEC",
        message: `MISSION TRIGGERED: "${missionInput}" -> Assigned to 6 Autonomous Agents`,
      },
    ]);
    setMissionInput("");
  };

  const totalTasks = agents.reduce((acc, curr) => acc + curr.tasksCompleted, 0);
  const avgCpu = Math.round(agents.reduce((acc, curr) => acc + curr.cpuUsage, 0) / agents.length);
  const activeCount = agents.filter((a) => a.status !== "paused").length;

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Top Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                HERMES SWARM FLEET // <span className="text-[#00FF41]">AUTONOMOUS MESH</span>
              </h2>
              <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                NOUS-HERMES-3
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Multi-agent persistent memory orchestration, cognitive trace dispatch & self-created skills
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Swarm Speed Selector */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1 text-[10px] font-bold">
            <span className="px-2 text-[#4F536E]">SPEED:</span>
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  setSwarmSpeed(spd);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  swarmSpeed === spd
                    ? "bg-[#00FF41] text-black font-black"
                    : "text-[#9499B3] hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
            <button
              type="button"
              onClick={handleStepTick}
              className="ml-1 px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
              title="Execute Single Step Tick"
            >
              STEP
            </button>
          </div>

          <button
            type="button"
            onClick={toggleSwarm}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSwarmActive
                ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                : "bg-red-500/20 border-red-500/40 text-red-400"
            }`}
          >
            {isSwarmActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isSwarmActive ? "SWARM ACTIVE" : "SWARM PAUSED"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setShowDagModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-xs hover:bg-cyan-500/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <GitMerge size={14} />
            <span>DAG PIPELINE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("blueprint")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          >
            <Plus size={14} />
            <span>FORGE AGENT</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="cyber-card p-3 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Active Agents</span>
          <span className="text-lg font-black text-[#00FF41]">{activeCount} / {agents.length}</span>
        </div>
        <div className="cyber-card p-3 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Avg Swarm Load</span>
          <span className="text-lg font-black text-[#00F0FF]">{avgCpu}% CPU</span>
        </div>
        <div className="cyber-card p-3 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Completed Tasks</span>
          <span className="text-lg font-black text-[#BF40FF]">{totalTasks.toLocaleString()}</span>
        </div>
        <div className="cyber-card p-3 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Swarm Success Rate</span>
          <span className="text-lg font-black text-[#FFB800]">99.7%</span>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS & STATUS FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "fleet" as const, label: "Swarm Fleet & Live Telemetry", icon: Bot },
            { id: "company" as const, label: "Paperclip Teams Control Plane", icon: Users },
            { id: "blueprint" as const, label: "Hermes Blueprint Forge", icon: Sparkles },
            { id: "orchestration" as const, label: "Gantt Timeline & Leaderboard", icon: GitMerge },
            { id: "permissions" as const, label: "Zero-Trust Tool Permissions", icon: ShieldCheck },
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

        {/* Status Filter Badges */}
        {activeSubTab === "fleet" && (
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
            {["ALL", "ACTIVE", "EXECUTING", "IDLE", "PAUSED"].map((st) => {
              const active = statusFilter === st;
              const count = st === "ALL" ? agents.length : agents.filter((a) => a.status.toUpperCase() === st).length;
              return (
                <button
                  key={st}
                  onClick={() => {
                    cyberAudio.play("click");
                    setStatusFilter(st);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    active ? "bg-white/15 text-[#00FF41] border border-[#00FF41]/30" : "text-[#9499B3] hover:text-white"
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[9px] text-[#4F536E]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 1: FLEET & LIVE TELEMETRY */}
      {activeSubTab === "fleet" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Mission Dispatch Bar */}
          <form onSubmit={dispatchMission} className="cyber-card p-3 flex gap-2">
            <input
              type="text"
              placeholder="Dispatch collective swarm directive (e.g. 'Audit /api/auth endpoints for CVE-2026-9811 and run PR review')..."
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00FF41]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.3)]"
            >
              DISPATCH
            </button>
          </form>

          {/* Agents Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {agents
              .filter((a) => statusFilter === "ALL" || a.status.toUpperCase() === statusFilter)
              .map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedDetailAgent(agent)}
                className="cyber-card p-4 flex flex-col justify-between gap-3 hover:border-emerald-500/40 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: agent.color }} />
                      <h4 className="text-xs font-black text-[#F1F3F9] group-hover:text-emerald-400 transition-colors">{agent.name}</h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        agent.status === "active" || agent.status === "executing"
                          ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                          : "bg-white/5 text-[#4F536E] border border-white/10"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#4F536E] block mt-0.5">{agent.role}</span>

                  <p className="text-[11px] text-[#9499B3] mt-2 p-2 rounded bg-black/40 border border-white/5 line-clamp-2 font-mono">
                    {agent.lastAction}
                  </p>
                </div>

                <div>
                  {/* Stats Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] py-2 border-y border-white/5 my-2">
                    <div>
                      <span className="text-[#4F536E] block">CPU</span>
                      <span className="font-bold text-[#00FF41]">{agent.cpuUsage}%</span>
                    </div>
                    <div>
                      <span className="text-[#4F536E] block">RAM</span>
                      <span className="font-bold text-[#00F0FF]">{agent.memoryMb}MB</span>
                    </div>
                    <div>
                      <span className="text-[#4F536E] block">SUCCESS</span>
                      <span className="font-bold text-[#BF40FF]">{agent.successRate}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailAgent(agent)}
                      className="text-[10px] text-[#00F0FF] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Database size={11} />
                      <span>INSPECT HUD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAgentStatus(agent.id)}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-[#F1F3F9] font-bold cursor-pointer"
                    >
                      {agent.status === "paused" ? "RESUME" : "PAUSE"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Swarm Terminal Log */}
          <div className="cyber-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[#00FF41]" />
                <span className="text-xs font-black text-[#F1F3F9]">LIVE SWARM TELEMETRY LOG</span>
              </div>
              <span className="text-[10px] text-[#4F536E]">STREAMING · NOUS-HERMES-3</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-[#4F536E] shrink-0">[{log.time}]</span>
                  <span className="text-[#00F0FF] shrink-0 font-bold">{log.agent}:</span>
                  <span className="text-[#F1F3F9]">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAPERCLIP AGENT TEAMS CONTROL PLANE */}
      {activeSubTab === "company" && (
        <div className="animate-fade-in">
          <PaperclipCompanyControlPlane />
        </div>
      )}

      {/* TAB 2: HERMES BLUEPRINT FORGE */}
      {activeSubTab === "blueprint" && (
        <div className="animate-fade-in">
          <AgentBlueprintDesigner
            onAgentCreated={() => {
              setActiveSubTab("fleet");
            }}
          />
        </div>
      )}

      {/* TAB 3: GANTT TIMELINE & LEADERBOARD */}
      {activeSubTab === "orchestration" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <SwarmOrchestrationTimeline />
          <AgentPerformanceLeaderboard />
        </div>
      )}

      {/* TAB 4: ZERO-TRUST TOOL PERMISSIONS */}
      {activeSubTab === "permissions" && (
        <div className="animate-fade-in">
          <ToolPermissionMatrix />
        </div>
      )}

      {/* Agent Detail HUD Drawer */}
      <AgentDetailDrawer
        agent={selectedDetailAgent}
        isOpen={!!selectedDetailAgent}
        onClose={() => setSelectedDetailAgent(null)}
        onStatusChange={handleStatusChange}
        onFlushMemory={handleFlushMemory}
      />

      {/* Memory Inspector Modal */}
      {inspectingAgent && (
        <AgentMemoryInspector
          agentName={inspectingAgent.name}
          agentColor={inspectingAgent.color}
          onClose={() => setInspectingAgent(null)}
        />
      )}

      {/* Create Agent Modal */}
      {isCreateModalOpen && (
        <CreateAgentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAddAgent={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Swarm DAG Pipeline Modal */}
      {showDagModal && (
        <SwarmDagPipelineModal
          agents={agents}
          isOpen={showDagModal}
          onClose={() => setShowDagModal(false)}
        />
      )}
    </div>
  );
}
