"use client";

import { useState, useEffect, memo } from "react";
import {
  Users,
  Zap,
  DollarSign,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Sparkles,
  ShieldAlert,
  Sliders,
  Download,
  Upload,
  FileCode,
  Target,
  AlertCircle,
  Radio,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { cyberSpeech } from "@/lib/cyberSpeech";
import type {
  AgentRuntimeAdapter,
  AgentTeam,
  GoalNode,
  PaperclipIssue,
  PipelineStage,
  ControlPlaneSubTab,
} from "@/types/paperclip";

const INITIAL_TEAMS: AgentTeam[] = [
  {
    id: "team-eng",
    name: "Core Engineering & Compiler Team",
    lead: "TECH-LEAD-01 (Claude 3.7)",
    icon: "⚡",
    color: "#00FF41",
    runtimeAdapter: "Claude Code CLI",
    heartbeatIntervalSec: 30,
    lastHeartbeatTime: "8s ago",
    nextHeartbeatInSec: 22,
    dailyBudgetCents: 5000,
    spentBudgetCents: 1840,
    status: "running",
    activeGoal: "Implement Paperclip autonomous heartbeat scheduling loop and multi-runtime adapter bridge",
    tasksCompleted: 48,
    members: [
      { id: "m-01", name: "FRONTEND-SPEC", role: "React 19 & Tailwind v4 UI", status: "heartbeat_active", tokensBurned: 142000 },
      { id: "m-02", name: "BACKEND-ARCH", role: "Turbopack Server Actions", status: "idle", tokensBurned: 98000 },
      { id: "m-03", name: "AST-LINTER", role: "Static Code Analysis", status: "idle", tokensBurned: 34000 },
    ],
  },
  {
    id: "team-sec",
    name: "Zero-Trust AppSec & Audit Team",
    lead: "SENTINEL-LEAD (Hermes 3)",
    icon: "🛡️",
    color: "#FF2A6D",
    runtimeAdapter: "Hermes Local Engine",
    heartbeatIntervalSec: 15,
    lastHeartbeatTime: "3s ago",
    nextHeartbeatInSec: 12,
    dailyBudgetCents: 3000,
    spentBudgetCents: 820,
    status: "running",
    activeGoal: "Continuous eBPF syscall probing and AST secrets leak surveillance",
    tasksCompleted: 124,
    members: [
      { id: "m-04", name: "CVE-RECON", role: "Vulnerability Scanning", status: "heartbeat_active", tokensBurned: 64000 },
      { id: "m-05", name: "EBPF-WATCHER", role: "Kernel Probe Monitor", status: "idle", tokensBurned: 45000 },
    ],
  },
  {
    id: "team-ops",
    name: "Autonomous SRE & DevOps Team",
    lead: "KUBE-COMMANDER (Codex)",
    icon: "☁️",
    color: "#00F0FF",
    runtimeAdapter: "OpenAI Codex",
    heartbeatIntervalSec: 60,
    lastHeartbeatTime: "24s ago",
    nextHeartbeatInSec: 36,
    dailyBudgetCents: 4000,
    spentBudgetCents: 1200,
    status: "running",
    activeGoal: "Cluster canary auto-scaling and Prometheus SLO error budget tracking",
    tasksCompleted: 39,
    members: [
      { id: "m-06", name: "DOCKER-ORCH", role: "Container Scaling", status: "idle", tokensBurned: 81000 },
      { id: "m-07", name: "PROBE-ENGINE", role: "REST Endpoint Health", status: "idle", tokensBurned: 29000 },
    ],
  },
  {
    id: "team-rag",
    name: "Vector Research & PKM Vault Team",
    lead: "DEEPMIND-AGENT (MCP)",
    icon: "🧠",
    color: "#BF40FF",
    runtimeAdapter: "Custom MCP Server",
    heartbeatIntervalSec: 120,
    lastHeartbeatTime: "45s ago",
    nextHeartbeatInSec: 75,
    dailyBudgetCents: 2500,
    spentBudgetCents: 490,
    status: "idle" as any,
    activeGoal: "ArXiv papers indexing, embedding clustering & Obsidian graph synthesis",
    tasksCompleted: 67,
    members: [
      { id: "m-08", name: "ARXIV-HARVEST", role: "Academic Scraper", status: "idle", tokensBurned: 42000 },
      { id: "m-09", name: "EMBED-INDEXER", role: "HNSW Vector Re-Index", status: "idle", tokensBurned: 38000 },
    ],
  },
];

const INITIAL_GOAL_TREE: GoalNode = {
  id: "g-l1",
  level: "L1_COMPANY_OBJECTIVE",
  title: "Deploy 100% Autonomous AI Software Corporation with Zero-Trust Governance",
  owner: "Board / Executive Operator",
  progress: 74,
  status: "ON_TRACK",
  children: [
    {
      id: "g-l2-eng",
      level: "L2_DEPARTMENT_GOAL",
      title: "Deliver High-Velocity Compiler & Microservice Architecture",
      owner: "TECH-LEAD-01",
      progress: 82,
      status: "ON_TRACK",
      children: [
        {
          id: "g-l3-pipe",
          level: "L3_TEAM_EPIC",
          title: "Build Paperclip Autonomous Heartbeat Scheduler & Adapters",
          owner: "FRONTEND-SPEC",
          progress: 90,
          status: "ON_TRACK",
          children: [
            {
              id: "g-l4-t1",
              level: "L4_AGENT_TASK",
              title: "React 19 & Tailwind v4 Interactive Heartbeat Countdown",
              owner: "FRONTEND-SPEC",
              progress: 100,
              status: "COMPLETED",
            },
            {
              id: "g-l4-t2",
              level: "L4_AGENT_TASK",
              title: "Multi-Runtime Adapter IPC Socket Bridge",
              owner: "BACKEND-ARCH",
              progress: 80,
              status: "ON_TRACK",
            },
          ],
        },
      ],
    },
    {
      id: "g-l2-sec",
      level: "L2_DEPARTMENT_GOAL",
      title: "Enforce 0 CVEs & Real-Time eBPF Syscall Defense Matrix",
      owner: "SENTINEL-LEAD",
      progress: 68,
      status: "ON_TRACK",
      children: [
        {
          id: "g-l3-sast",
          level: "L3_TEAM_EPIC",
          title: "Zero-Trust AST Secrets & Memory Contention Scanner",
          owner: "CVE-RECON",
          progress: 68,
          status: "ON_TRACK",
        },
      ],
    },
  ],
};

const INITIAL_ISSUES: PaperclipIssue[] = [
  {
    id: "ISSUE-101",
    title: "Implement Heartbeat Atomic Cost-Estimator prior to LLM Tool Dispatch",
    teamId: "team-eng",
    assignedAgent: "BACKEND-ARCH",
    status: "IN_PROGRESS",
    priority: "HIGH",
    githubSyncId: "#142",
    retryCount: 0,
    tokensUsed: 18400,
  },
  {
    id: "ISSUE-102",
    title: "Investigate eBPF Probe Socket Contention during parallel swarm surge",
    teamId: "team-sec",
    assignedAgent: "EBPF-WATCHER",
    status: "FAILED_ESCALATED",
    priority: "CRITICAL",
    githubSyncId: "#144",
    errorTrace: "FATAL: eBPF Map RingBuffer buffer overflow: kernel probe dropped 48 frames on port 3000. Escalated to Operator for manual ringbuffer resize.",
    retryCount: 3,
    tokensUsed: 42000,
  },
  {
    id: "ISSUE-103",
    title: "Kubernetes Canary Traffic Split 10% -> 50% verification",
    teamId: "team-ops",
    assignedAgent: "KUBE-COMMANDER",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    githubSyncId: "#148",
    retryCount: 0,
    tokensUsed: 12000,
  },
  {
    id: "ISSUE-104",
    title: "Index ArXiv 2026 preprints into SQLite-Vec HNSW Graph",
    teamId: "team-rag",
    assignedAgent: "EMBED-INDEXER",
    status: "DONE",
    priority: "LOW",
    githubSyncId: "#150",
    retryCount: 0,
    tokensUsed: 29000,
  },
];

const HeartbeatPulseRing = memo(function HeartbeatPulseRing({
  nextSec,
  intervalSec,
  lastTime,
}: {
  nextSec: number;
  intervalSec: number;
  lastTime: string;
}) {
  return (
    <div className="p-4 bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-16 h-16 rounded-full border-2 border-[#00FF41]/40 flex flex-col items-center justify-center bg-[#00FF41]/5 shadow-[0_0_20px_rgba(0,255,65,0.15)]">
        <span className="text-lg font-black text-white font-mono">{nextSec}s</span>
        <span className="text-[8px] text-[#00FF41] font-bold">NEXT PULSE</span>
      </div>

      <div className="text-[11px] text-slate-300">
        Cadence: <strong>Every {intervalSec} seconds</strong>
      </div>
      <span className="text-[10px] text-slate-500">Last Pulse: {lastTime}</span>
    </div>
  );
});

export default function PaperclipCompanyControlPlane() {
  const [teams, setTeams] = useState<AgentTeam[]>(INITIAL_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("team-eng");
  const [editingAdapterTeam, setEditingAdapterTeam] = useState<AgentTeam | null>(null);
  const [activePipelineStage, setActivePipelineStage] = useState<PipelineStage>("DEV");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<ControlPlaneSubTab>("teams");
  const [goalTree, setGoalTree] = useState<GoalNode>(INITIAL_GOAL_TREE);
  const [issues, setIssues] = useState<PaperclipIssue[]>(INITIAL_ISSUES);
  const [selectedTriageIssue, setSelectedTriageIssue] = useState<PaperclipIssue | null>(INITIAL_ISSUES[1]);
  const [isMasterCompanyPaused, setIsMasterCompanyPaused] = useState(false);
  const [issueFilterStatus, setIssueFilterStatus] = useState<string>("ALL");

  // Load from LocalStorage with Resilient Schema Merging
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_paperclip_teams");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = INITIAL_TEAMS.map((def) => {
            const match = parsed.find((p: any) => p.id === def.id);
            if (!match) return def;
            return {
              ...def,
              ...match,
              members: def.members.map((m) => {
                const mmatch = match.members?.find((mem: any) => mem.id === m.id);
                return mmatch ? { ...m, ...mmatch } : m;
              }),
            };
          });
          setTeams(merged);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTeamsToStorage = (newTeams: AgentTeam[]) => {
    setTeams(newTeams);
    try {
      localStorage.setItem("dirtynest_paperclip_teams", JSON.stringify(newTeams));
    } catch {
      // ignore
    }
  };

  // Heartbeat countdown simulation
  useEffect(() => {
    if (isMasterCompanyPaused) return;

    const interval = setInterval(() => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          if (t.nextHeartbeatInSec <= 1) {
            return {
              ...t,
              lastHeartbeatTime: "Just now",
              nextHeartbeatInSec: t.heartbeatIntervalSec,
              tasksCompleted: t.tasksCompleted + 1,
              spentBudgetCents: Math.min(t.dailyBudgetCents, t.spentBudgetCents + 5),
            };
          }
          return {
            ...t,
            nextHeartbeatInSec: t.nextHeartbeatInSec - 1,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isMasterCompanyPaused]);

  const handleForceHeartbeat = (teamId: string) => {
    cyberAudio.play("chime");
    const updated = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            lastHeartbeatTime: "Just now (Forced)",
            nextHeartbeatInSec: t.heartbeatIntervalSec,
            tasksCompleted: t.tasksCompleted + 1,
            spentBudgetCents: Math.min(t.dailyBudgetCents, t.spentBudgetCents + 10),
          }
        : t
    );
    saveTeamsToStorage(updated);
  };

  const handleToggleTeamStatus = (teamId: string) => {
    cyberAudio.play("toggle");
    const updated = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            status: (t.status === "running" ? "paused" : "running") as "running" | "paused",
          }
        : t
    );
    saveTeamsToStorage(updated);
  };

  const handleToggleMasterCompanyPause = () => {
    cyberAudio.play("toggle");
    setIsMasterCompanyPaused(!isMasterCompanyPaused);
  };

  const handleSaveAdapter = (newAdapter: AgentRuntimeAdapter) => {
    if (!editingAdapterTeam) return;
    cyberAudio.play("click");
    const updated = teams.map((t) =>
      t.id === editingAdapterTeam.id ? { ...t, runtimeAdapter: newAdapter } : t
    );
    saveTeamsToStorage(updated);
    setEditingAdapterTeam(null);
  };

  // Run Inter-Team Autonomous Pipeline (Dev -> Sec -> Ops -> PKM)
  const handleRunInterTeamPipeline = () => {
    cyberAudio.play("warp");
    setIsPipelineRunning(true);
    setActivePipelineStage("DEV");
    setPipelineLog([`[00:00] [DEV] TECH-LEAD-01 dispatched feature branch: feat/heartbeat-runtime`]);

    setTimeout(() => {
      cyberAudio.play("click");
      setActivePipelineStage("SEC");
      setPipelineLog((prev) => [
        ...prev,
        `[00:02] [SEC] Handoff to Zero-Trust AppSec: AST secrets audit passed (0 leaks), eBPF clean`,
      ]);
    }, 1800);

    setTimeout(() => {
      cyberAudio.play("click");
      setActivePipelineStage("OPS");
      setPipelineLog((prev) => [
        ...prev,
        `[00:04] [OPS] Handoff to SRE: Canary deployment staged to Kubernetes mesh at 10% traffic`,
      ]);
    }, 3600);

    setTimeout(() => {
      cyberAudio.play("chime");
      setActivePipelineStage("PKM");
      setPipelineLog((prev) => [
        ...prev,
        `[00:06] [PKM] Handoff to Research & Vault: Architecture diagram generated in Obsidian graph`,
        `[00:07] [PIPELINE] Complete inter-team autonomous lifecycle executed successfully!`,
      ]);
      setIsPipelineRunning(false);
    }, 5400);
  };

  const handleRetryFailedIssue = (issueId: string) => {
    cyberAudio.play("warp");
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              status: "IN_PROGRESS",
              retryCount: iss.retryCount + 1,
              errorTrace: undefined,
              tokensUsed: iss.tokensUsed + 15000,
            }
          : iss
      )
    );
    setSelectedTriageIssue(null);
  };

  const handleResolveIssue = (issueId: string) => {
    cyberAudio.play("chime");
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              status: "DONE",
              errorTrace: undefined,
            }
          : iss
      )
    );
    setSelectedTriageIssue(null);
  };

  const handleExportConfig = () => {
    cyberAudio.play("chime");
    const exportPayload = {
      teams,
      goalTree,
      issues,
      version: "Paperclip-Enterprise-v1.0",
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dirtynest_paperclip_enterprise_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.teams) {
            cyberAudio.play("chime");
            saveTeamsToStorage(parsed.teams);
            if (parsed.goalTree) setGoalTree(parsed.goalTree);
            if (parsed.issues) setIssues(parsed.issues);
          } else if (Array.isArray(parsed)) {
            cyberAudio.play("chime");
            saveTeamsToStorage(parsed);
          }
        } catch {
          cyberAudio.play("error");
        }
      };
    }
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const totalBurnDollars = (teams.reduce((acc, t) => acc + t.spentBudgetCents, 0) / 100).toFixed(2);
  const totalMaxBudgetDollars = (teams.reduce((acc, t) => acc + t.dailyBudgetCents, 0) / 100).toFixed(2);
  const totalBurnPct = Math.round(
    (teams.reduce((acc, t) => acc + t.spentBudgetCents, 0) /
      teams.reduce((acc, t) => acc + t.dailyBudgetCents, 0)) *
      100
  );

  const filteredIssues = issues.filter(
    (iss) => issueFilterStatus === "ALL" || iss.status === issueFilterStatus
  );

  return (
    <div className="flex flex-col gap-5 font-mono text-xs text-white select-none animate-fade-in">
      {/* Top Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[#00FF41]/30">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                PAPERCLIP AI CONTROL PLANE // <span className="text-[#00FF41]">ENTERPRISE ORCHESTRATOR</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                HEARTBEAT RUNTIME v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Agent Teams governance, Org Chart delegation, Heartbeat pulse cycles & runtime adapters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Kill-Switch */}
          <button
            onClick={handleToggleMasterCompanyPause}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isMasterCompanyPaused
                ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(255,0,60,0.3)] animate-pulse"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Global Kill-Switch: Pause all heartbeats company-wide"
          >
            {isMasterCompanyPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isMasterCompanyPaused ? "COMPANY PAUSED" : "PAUSE ALL HEARTBEATS"}</span>
          </button>

          {/* JSON Export / Import */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportConfig}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10 cursor-pointer"
              title="Export Company JSON Config"
            >
              <Download size={13} />
              <span>EXPORT</span>
            </button>

            <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10 cursor-pointer">
              <Upload size={13} />
              <span>IMPORT</span>
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            </label>
          </div>

          <div className="flex flex-col items-end pl-2 border-l border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase">DAILY BURN / CAP</span>
            <span className="text-sm font-bold text-amber-400">
              ${totalBurnDollars} / ${totalMaxBudgetDollars} ({totalBurnPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* SUBTAB NAVIGATION STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { id: "teams" as const, label: "Agent Teams & Heartbeat Pulse", icon: Users },
          { id: "goals_tree" as const, label: "Goal Ancestry & OKRs Tree (L1–L4)", icon: Target },
          { id: "issues" as const, label: "Issue Lifecycle & Failure Triage", icon: AlertTriangle },
          { id: "governance" as const, label: "Dual-Threshold Budgets & Governance", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeControlTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveControlTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)] font-black"
                  : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: TEAMS & HEARTBEAT PULSE ===================== */}
      {activeControlTab === "teams" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Autonomous Inter-Team Pipeline Bar (Dev -> Sec -> Ops -> PKM) */}
          <div className="cyber-card p-4 rounded-2xl border border-cyan-500/30 bg-[#080b14] flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  INTER-TEAM AUTONOMOUS PIPELINE // <span className="text-cyan-400">DEV ➔ SEC ➔ OPS ➔ PKM</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsArtifactModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10 font-bold text-[10px] cursor-pointer"
                >
                  VIEW ARTIFACTS
                </button>

                <button
                  onClick={handleRunInterTeamPipeline}
                  disabled={isPipelineRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:opacity-50"
                >
                  <Play size={13} />
                  <span>{isPipelineRunning ? "EXECUTING HANDOFFS..." : "RUN INTER-TEAM PIPELINE"}</span>
                </button>
              </div>
            </div>

            {/* Visual Stage Connectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {[
                { id: "DEV", label: "1. Core Engineering", detail: "Feature Code & PR", color: "#00FF41" },
                { id: "SEC", label: "2. Zero-Trust AppSec", detail: "SAST & eBPF Probing", color: "#FF2A6D" },
                { id: "OPS", label: "3. SRE & DevOps", detail: "Canary Mesh Deploy", color: "#00F0FF" },
                { id: "PKM", label: "4. Research & Vault", detail: "Obsidian Doc Graph", color: "#BF40FF" },
              ].map((stage) => {
                const isCurrent = activePipelineStage === stage.id && isPipelineRunning;
                const isCompleted =
                  activePipelineStage === "PKM" && !isPipelineRunning
                    ? true
                    : (stage.id === "DEV" && ["SEC", "OPS", "PKM"].includes(activePipelineStage)) ||
                      (stage.id === "SEC" && ["OPS", "PKM"].includes(activePipelineStage)) ||
                      (stage.id === "OPS" && activePipelineStage === "PKM");

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                      isCurrent
                        ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)] animate-pulse"
                        : isCompleted
                        ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-slate-300"
                        : "bg-black/40 border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{stage.label}</span>
                      {isCompleted && <CheckCircle2 size={13} className="text-[#00FF41]" />}
                      {isCurrent && <Activity size={13} className="text-cyan-400 animate-spin" />}
                    </div>
                    <span className="text-[10px] text-slate-400">{stage.detail}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Pipeline Terminal Snippet */}
            {pipelineLog.length > 0 && (
              <div className="p-2.5 rounded-xl bg-black/70 border border-white/5 flex flex-col gap-1 max-h-24 overflow-y-auto font-mono text-[10px] text-slate-300">
                {pipelineLog.map((log, idx) => (
                  <span key={idx} className="text-cyan-300">
                    {log}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grid of Agent Teams (Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {teams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              const pct = Math.round((team.spentBudgetCents / team.dailyBudgetCents) * 100);

              return (
                <div
                  key={team.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedTeamId(team.id);
                  }}
                  className={`cyber-card p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-[#00FF41] bg-black/80 shadow-[0_0_20px_rgba(0,255,65,0.15)]"
                      : "border-white/10 bg-black/40 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{team.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-xs truncate">{team.name}</h3>
                        <span className="text-[10px] text-slate-400">Lead: {team.lead}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        team.status === "running"
                          ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {team.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Heartbeat Status Strip */}
                  <div className="p-2 bg-black/50 rounded-xl border border-white/5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${team.status === "running" ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
                      <span className="text-slate-400">Heartbeat in:</span>
                      <strong className="text-white font-mono">{team.nextHeartbeatInSec}s</strong>
                    </div>
                    <span className="text-slate-500">Every {team.heartbeatIntervalSec}s</span>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Burn: ${(team.spentBudgetCents / 100).toFixed(2)}</span>
                      <span className="text-slate-500">Cap: ${(team.dailyBudgetCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct > 80 ? "#FF2A6D" : team.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Team Detailed Command Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Team Goal, Engine Adapter & Controls (7 cols) */}
            <div className="lg:col-span-7 cyber-card p-5 flex flex-col gap-4 border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedTeam.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedTeam.name}</h3>
                    <span className="text-[10px] text-slate-400">
                      Lead: <strong className="text-cyan-400">{selectedTeam.lead}</strong> · Adapter:{" "}
                      <strong className="text-[#00FF41]">{selectedTeam.runtimeAdapter}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      cyberSpeech.speak(
                        `${selectedTeam.name}. Lead: ${selectedTeam.lead}. Active goal: ${selectedTeam.activeGoal}. Next heartbeat pulse in ${selectedTeam.nextHeartbeatInSec} seconds.`,
                        { pitch: 1.0, rate: 1.05 }
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 font-bold cursor-pointer transition-all"
                    title="Vocalize Team Status via Web Speech API"
                  >
                    <Radio size={13} />
                    <span>SPEAK</span>
                  </button>

                  <button
                    onClick={() => setEditingAdapterTeam(selectedTeam)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white font-bold cursor-pointer"
                    title="Configure Team Runtime Adapter"
                  >
                    <Sliders size={13} />
                    <span>ADAPTER</span>
                  </button>

                  <button
                    onClick={() => handleForceHeartbeat(selectedTeam.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    title="Trigger immediate heartbeat task cycle"
                  >
                    <Zap size={13} />
                    <span>PULSE NOW</span>
                  </button>
                </div>
              </div>

              {/* Active Epic / Goal */}
              <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ACTIVE TEAM GOAL / EPIC:</span>
                <p className="text-xs text-[#00FF41] font-mono leading-relaxed">{selectedTeam.activeGoal}</p>
              </div>

              {/* Team Members Roster */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SPECIALIST WORKER AGENTS ({selectedTeam.members.length}):</span>
                <div className="space-y-2">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                        <div>
                          <span className="font-bold text-white text-xs">{member.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({member.role})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-slate-400 font-mono">{(member.tokensBurned / 1000).toFixed(1)}k tokens</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            member.status === "heartbeat_active"
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {member.status === "heartbeat_active" ? "EXECUTING" : "IDLE"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Heartbeat Telemetry & Governance (5 cols) */}
            <div className="lg:col-span-5 cyber-card p-5 flex flex-col gap-4 border border-white/10">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-white/10">
                HEARTBEAT GOVERNANCE & CADENCE
              </h3>

              <HeartbeatPulseRing
                nextSec={selectedTeam.nextHeartbeatInSec}
                intervalSec={selectedTeam.heartbeatIntervalSec}
                lastTime={selectedTeam.lastHeartbeatTime}
              />

              {/* Quick Team Kill Switch */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 text-xs">Team Execution State:</span>
                <button
                  onClick={() => handleToggleTeamStatus(selectedTeam.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTeam.status === "running"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                      : "bg-[#00FF41] text-black font-black hover:bg-[#00cc34]"
                  }`}
                >
                  {selectedTeam.status === "running" ? <Pause size={14} /> : <Play size={14} />}
                  <span>{selectedTeam.status === "running" ? "PAUSE HEARTBEAT" : "RESUME HEARTBEAT"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: GOAL ANCESTRY & OKRS TREE ===================== */}
      {activeControlTab === "goals_tree" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="cyber-card p-5 flex flex-col gap-4 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Target size={18} className="text-[#00FF41]" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">COMPANY GOAL ANCESTRY & OKR TREE (L1–L4)</h3>
                  <span className="text-[10px] text-slate-400">
                    Strategic alignment mapping: Every agent task anchors to root business objectives
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                L1 ROOT ALIGNMENT: 74%
              </span>
            </div>

            {/* Level 1 Node */}
            <div className="p-4 rounded-xl bg-black/60 border border-[#00FF41]/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#00FF41] text-black font-black text-[9px]">L1 OBJECTIVE</span>
                  <span className="font-bold text-white text-xs">{goalTree.title}</span>
                </div>
                <span className="text-[10px] text-[#00FF41] font-bold">{goalTree.progress}%</span>
              </div>
              <span className="text-[10px] text-slate-400">Owner: {goalTree.owner}</span>

              {/* Level 2 Children */}
              <div className="pl-4 border-l-2 border-[#00FF41]/30 mt-3 space-y-3">
                {goalTree.children?.map((l2) => (
                  <div key={l2.id} className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/40 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-black text-[9px]">L2 GOAL</span>
                        <span className="font-bold text-cyan-300 text-xs">{l2.title}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-bold">{l2.progress}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Owner: {l2.owner}</span>

                    {/* Level 3 Children */}
                    {l2.children && (
                      <div className="pl-4 border-l-2 border-cyan-500/30 mt-2 space-y-2">
                        {l2.children.map((l3) => (
                          <div key={l3.id} className="p-2.5 rounded-lg bg-black/40 border border-purple-500/30 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-purple-500 text-black font-black text-[8px]">L3 EPIC</span>
                                <span className="font-bold text-purple-300 text-xs">{l3.title}</span>
                              </div>
                              <span className="text-[10px] text-purple-400 font-bold">{l3.progress}%</span>
                            </div>

                            {/* Level 4 Children */}
                            {l3.children && (
                              <div className="pl-3 border-l-2 border-purple-500/20 mt-1 space-y-1">
                                {l3.children.map((l4) => (
                                  <div key={l4.id} className="flex items-center justify-between text-[10px] text-slate-300 p-1 bg-black/30 rounded">
                                    <span className="truncate">• {l4.title} ({l4.owner})</span>
                                    <span className="text-emerald-400 font-bold">{l4.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: ISSUE LIFECYCLE & FAILURE TRIAGE ===================== */}
      {activeControlTab === "issues" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="cyber-card p-5 flex flex-col gap-4 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">ISSUE LIFECYCLE & FAILURE TRIAŻ</h3>
                  <span className="text-[10px] text-slate-400">
                    State Machine with No Automatic Recovery guardrails & GitHub Issues bi-directional sync
                  </span>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[10px]">
                {["ALL", "IN_PROGRESS", "FAILED_ESCALATED", "IN_REVIEW", "DONE"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      cyberAudio.play("click");
                      setIssueFilterStatus(st);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      issueFilterStatus === st
                        ? "bg-white/20 text-[#00FF41]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Issues List & Triage Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Issues Grid (7 cols) */}
              <div className="lg:col-span-7 space-y-2.5">
                {filteredIssues.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedTriageIssue(iss);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      selectedTriageIssue?.id === iss.id
                        ? "border-[#00FF41] bg-black/80 shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                        : "border-white/5 bg-black/40 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">{iss.id}</span>
                        <span className="font-bold text-white text-xs">{iss.title}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black border shrink-0 ${
                          iss.status === "FAILED_ESCALATED"
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                            : iss.status === "IN_PROGRESS"
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                            : iss.status === "DONE"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/40"
                        }`}
                      >
                        {iss.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>Assigned: <strong className="text-white">{iss.assignedAgent}</strong></span>
                      <span>GitHub: <strong className="text-cyan-400">{iss.githubSyncId}</strong></span>
                      <span>Tokens: <strong className="text-amber-400">{(iss.tokensUsed / 1000).toFixed(1)}k</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Triage Detail Inspector (5 cols) */}
              <div className="lg:col-span-5 cyber-card p-4 rounded-xl border border-white/10 bg-[#080912] flex flex-col gap-3">
                {selectedTriageIssue ? (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-white text-xs">TRIAŻ: {selectedTriageIssue.id}</span>
                      <span className="text-[9px] text-cyan-400 font-mono">GITHUB SYNC ACTIVE</span>
                    </div>

                    <div className="text-xs text-white font-bold">{selectedTriageIssue.title}</div>

                    {selectedTriageIssue.errorTrace && (
                      <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex flex-col gap-1.5">
                        <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                          <AlertCircle size={12} />
                          EXECUTION ERROR STACK TRACE:
                        </span>
                        <p className="text-[10px] text-rose-200 font-mono leading-relaxed">
                          {selectedTriageIssue.errorTrace}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5 text-[10px] text-slate-400">
                      <div>Assigned Agent: <strong className="text-white">{selectedTriageIssue.assignedAgent}</strong></div>
                      <div>Retries: <strong className="text-white">{selectedTriageIssue.retryCount} times</strong></div>
                      <div>Tokens Consumed: <strong className="text-amber-400">{selectedTriageIssue.tokensUsed}</strong></div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => handleRetryFailedIssue(selectedTriageIssue.id)}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 text-black font-black hover:bg-cyan-400 cursor-pointer text-xs"
                      >
                        RETRY WITH +15K TOKENS
                      </button>

                      <button
                        onClick={() => handleResolveIssue(selectedTriageIssue.id)}
                        className="flex-1 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] cursor-pointer text-xs"
                      >
                        RESOLVE & CLOSE
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Select an issue from the list to inspect failure logs and triage
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: DUAL-THRESHOLD BUDGETS & GOVERNANCE ===================== */}
      {activeControlTab === "governance" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="cyber-card p-5 flex flex-col gap-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <DollarSign size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">
                    DUAL-THRESHOLD BUDGET GOVERNANCE // UTC MONTHLY CYCLE
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    80% Soft Alert Warning + 100% Hard-Stop Atomic Auto-Pause Guardrails
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400">UTC Cycle: 2026-08 (Active)</span>
            </div>

            {/* Threshold Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  80% SOFT THRESHOLD ALERT
                </span>
                <p className="text-[11px] text-slate-300">
                  Sends webhook notifications to Operator and slows heartbeat interval to conserve tokens.
                </p>
                <span className="text-[10px] text-amber-300 font-mono">Status: ACTIVE SURVEILLANCE</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  100% HARD-STOP AUTO-PAUSE
                </span>
                <p className="text-[11px] text-slate-300">
                  Instantly revokes tool execution tokens and pauses agent process loops until approved by Board.
                </p>
                <span className="text-[10px] text-rose-300 font-mono">Status: ENFORCED ATOMICALLY</span>
              </div>
            </div>

            {/* Per-Team Spending Matrix */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase">PER-TEAM MONTHLY BUDGET BURNDOWN:</span>
              {teams.map((t) => {
                const pct = Math.round((t.spentBudgetCents / t.dailyBudgetCents) * 100);
                return (
                  <div key={t.id} className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t.name}</span>
                      <span className="font-mono text-amber-400">
                        ${(t.spentBudgetCents / 100).toFixed(2)} / ${(t.dailyBudgetCents / 100).toFixed(2)} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct > 80 ? "#FF2A6D" : t.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Generated Artifacts Drawer / Modal */}
      {isArtifactModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-card p-6 rounded-2xl max-w-2xl w-full border border-cyan-500/40 bg-[#080910] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase">GENERATED ARTIFACTS & AUDIT LOGS</h3>
              </div>
              <button
                onClick={() => setIsArtifactModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[#00FF41]">src/runtime/heartbeat_scheduler.ts</span>
                  <span className="text-slate-500">2.4 KB · TypeScript</span>
                </div>
                <pre className="p-2 bg-black/80 rounded border border-white/5 text-[9px] text-slate-300 overflow-x-auto">
{`export class HeartbeatLoop {
  constructor(private intervalMs = 30000) {}
  public async pulse(agentId: string) {
    const task = await queue.pop(agentId);
    return adapter.dispatch(task);
  }
}`}
                </pre>
              </div>

              <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-rose-400">audit/sast_secrets_scan.json</span>
                  <span className="text-emerald-400 font-bold">PASS: 0 CVEs</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Scanned 14 source files across 8 routes. Zero hardcoded tokens or memory leak vectors.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Runtime Adapter Selection Modal */}
      {editingAdapterTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-card p-6 rounded-2xl max-w-md w-full border border-[#00FF41]/40 bg-[#080910] shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase">
              SELECT RUNTIME ADAPTER // <span className="text-[#00FF41]">{editingAdapterTeam.name}</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure the underlying execution engine bridge for this agent team:
            </p>

            <div className="space-y-2">
              {(
                [
                  "Claude Code CLI",
                  "OpenAI Codex",
                  "Hermes Local Engine",
                  "Custom MCP Server",
                  "HTTP Webhook REST",
                ] as AgentRuntimeAdapter[]
              ).map((adapter) => (
                <button
                  key={adapter}
                  onClick={() => handleSaveAdapter(adapter)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    editingAdapterTeam.runtimeAdapter === adapter
                      ? "bg-[#00FF41]/20 border-[#00FF41] text-white"
                      : "bg-black/40 border-white/10 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <span className="font-bold text-xs">{adapter}</span>
                  {editingAdapterTeam.runtimeAdapter === adapter && (
                    <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditingAdapterTeam(null)}
              className="mt-2 w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:text-white"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
