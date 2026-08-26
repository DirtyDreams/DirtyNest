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
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Search,
  Globe,
  Radio,
  BarChart3,
  Server,
  Sparkles,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import AgentMemoryInspector from "./agents/AgentMemoryInspector";
import CreateAgentModal from "./agents/CreateAgentModal";

interface Agent {
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

export default function AiAgentsView() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isSwarmActive, setIsSwarmActive] = useState(true);
  const [filterTag, setFilterTag] = useState("ALL");
  const [missionInput, setMissionInput] = useState("");
  const [inspectingAgent, setInspectingAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "l-1", time: "04:56:10", agent: "SENTINEL-01", level: "PASS", message: "Port 3000 boundary isolation verified. Zero open vulnerabilities." },
    { id: "l-2", time: "04:56:15", agent: "SCRAPER-INTEL", level: "INFO", message: "Fetched 12 new articles from Next.js 16 Edge Stream." },
    { id: "l-3", time: "04:56:22", agent: "CODE-AUDITOR", level: "EXEC", message: "Running AST sanitizer on React 19 Client Components." },
    { id: "l-4", time: "04:56:28", agent: "LATENCY-PINGER", level: "INFO", message: "Mesh nodes ping: 13ms p50, 22ms p99 across all regions." },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Periodic simulation of agent telemetry updates
  useEffect(() => {
    if (!isSwarmActive) return;

    const interval = setInterval(() => {
      // Pick random agent to update
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

      // Add a simulated log occasionally
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
    }, 2800);

    return () => clearInterval(interval);
  }, [isSwarmActive]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleSwarm = () => {
    cyberAudio.play("toggle");
    setIsSwarmActive(!isSwarmActive);
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
        agent: "SWARM-DISPATCH",
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
    <div className="flex flex-col gap-5 font-mono animate-fade-in pb-10">
      {/* Top Swarm Header & Telemetry Summary Cards */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 cyber-card bg-[#07070B]/90 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] relative shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <Cpu size={22} className="animate-pulse" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00FF41]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                Autonomous Agent Swarm Fleet
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                {isSwarmActive ? "SWARM ONLINE" : "SWARM PAUSED"}
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              AGENTIC COGNITION // DECENTRALIZED MULTI-AGENT ORCHESTRATION
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.2)]"
          >
            <Plus size={14} />
            <span>SYNTHESIZE AGENT</span>
          </button>

          <button
            onClick={toggleSwarm}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSwarmActive
                ? "bg-[#FF2A6D]/15 text-[#FF2A6D] border-[#FF2A6D]/40 hover:bg-[#FF2A6D]/25"
                : "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25"
            }`}
          >
            {isSwarmActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isSwarmActive ? "PAUSE SWARM" : "RESUME SWARM"}</span>
          </button>
        </div>
      </div>

      {/* Swarm Vital Metrics HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#090A10] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold flex items-center justify-between">
            <span>ACTIVE AGENTS</span>
            <Bot size={13} className="text-[#00FF41]" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00FF41]">{activeCount}</span>
            <span className="text-xs text-[#9499B3]">/ {agents.length} Nodes</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090A10] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold flex items-center justify-between">
            <span>FLEET CPU LOAD</span>
            <Activity size={13} className="text-[#00F0FF]" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00F0FF]">{avgCpu}%</span>
            <span className="text-xs text-[#9499B3]">8 Threads Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090A10] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold flex items-center justify-between">
            <span>TOTAL DISPATCHED</span>
            <Zap size={13} className="text-[#BF40FF]" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#BF40FF]">{totalTasks}</span>
            <span className="text-xs text-[#9499B3]">Missions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090A10] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold flex items-center justify-between">
            <span>ACCURACY SLA</span>
            <CheckCircle2 size={13} className="text-[#00FF41]" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00FF41]">99.8%</span>
            <span className="text-xs text-[#9499B3]">Zero Failures</span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isPaused = agent.status === "paused";
          return (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl cyber-card bg-[#0A0C14] border transition-all relative overflow-hidden flex flex-col justify-between gap-3.5 group ${
                isPaused
                  ? "border-white/5 opacity-60"
                  : "border-white/10 hover:border-[#00FF41]/40 shadow-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}40`,
                    }}
                  >
                    <Bot size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors">
                      {agent.name}
                    </h3>
                    <span className="text-[10px] text-[#4F536E]">{agent.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setInspectingAgent(agent);
                    }}
                    title="Inspect & Edit Agent Context Memory"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#9499B3] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Database size={12} />
                    <span className="hidden sm:inline">MEMORY</span>
                  </button>

                  <button
                    onClick={() => toggleAgentStatus(agent.id)}
                    title={isPaused ? "Resume Agent" : "Pause Agent"}
                    className={`p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                      isPaused
                        ? "bg-white/5 text-[#9499B3] border-white/10 hover:text-[#00FF41]"
                        : "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 hover:bg-[#FF2A6D]/10 hover:text-[#FF2A6D]"
                    }`}
                  >
                    {isPaused ? <Play size={12} /> : <Pause size={12} />}
                  </button>
                </div>
              </div>

              {/* Role description */}
              <p className="text-[11px] text-[#9499B3] line-clamp-1">{agent.role}</p>

              {/* Live Action Snippet */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#00F0FF] flex items-center gap-2">
                <Radio size={12} className="text-[#00FF41] shrink-0 animate-pulse" />
                <span className="truncate">{agent.lastAction}</span>
              </div>

              {/* Gauges & Tags */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-[10px]">
                <div className="flex items-center justify-between text-[#9499B3]">
                  <span>CPU: {agent.cpuUsage}%</span>
                  <span>RAM: {agent.memoryMb} MB</span>
                  <span className="text-[#00FF41]">{agent.tasksCompleted} OK</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${agent.cpuUsage}%`,
                      backgroundColor: agent.color,
                      boxShadow: `0 0 8px ${agent.color}`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-[#4F536E] border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Swarm Log & Mission Dispatch Console */}
      <div className="cyber-card bg-[#07070B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#00FF41]" />
            <span className="text-xs font-bold text-[#F1F3F9] tracking-wider uppercase">
              Swarm Execution Stream // Real-time IPC Bus
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#4F536E]">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
            <span>STREAM: LIVE</span>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-2 bg-[#040406]">
          {logs.map((log) => {
            let color = "#00FF41";
            if (log.level === "WARN") color = "#FFB800";
            if (log.level === "EXEC") color = "#00F0FF";
            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-[#4F536E] shrink-0">[{log.time}]</span>
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {log.agent}
                </span>
                <span className="text-[#E1E4EE]">{log.message}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>

        {/* Mission Dispatch Bar */}
        <form onSubmit={dispatchMission} className="p-3 border-t border-white/10 bg-[#0A0C14] flex items-center gap-2">
          <input
            type="text"
            value={missionInput}
            onChange={(e) => setMissionInput(e.target.value)}
            placeholder="Issue autonomous mission to swarm (e.g. 'Audit GraphQL endpoint security', 'Run load test')..."
            className="flex-1 bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>DISPATCH MISSION</span>
          </button>
        </form>
      </div>

      {/* AGENT MEMORY INSPECTOR MODAL */}
      {inspectingAgent && (
        <AgentMemoryInspector
          agentName={inspectingAgent.name}
          agentColor={inspectingAgent.color}
          onClose={() => setInspectingAgent(null)}
        />
      )}

      {/* CREATE CUSTOM AGENT WIZARD MODAL */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddAgent={(newAgent) => {
          setAgents((prev) => [newAgent, ...prev]);
        }}
      />
    </div>
  );
}
