"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ScrollText,
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Play,
  Pause,
  Bot,
  Container,
  Wrench,
  Wifi,
  Database,
  Cpu,
  Terminal,
  Copy,
  Check,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { SystemLog, LogLevel, LogCategory } from "@/db";
import LogAiExplainModal from "./logs/LogAiExplainModal";
import LogHistogramBarChart from "./logs/LogHistogramBarChart";
import { DataTable, ColumnDef } from "@/components/ui/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubTab = "stream" | "analytics" | "traces" | "security";
type ViewMode = "table" | "raw";

export default function LogsView() {
  const [subTab, setSubTab] = useState<SubTab>("stream");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [aiExplainingLog, setAiExplainingLog] = useState<SystemLog | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    totalLogs: number;
    levelCounts: Record<string, number>;
    categoryCounts: { category: string; count: number }[];
  }>({
    totalLogs: 0,
    levelCounts: { INFO: 0, SUCCESS: 0, WARN: 0, ERROR: 0, AUDIT: 0, DEBUG: 0 },
    categoryCounts: [],
  });

  const rawStreamEndRef = useRef<HTMLDivElement>(null);

  // Fetch logs
  const fetchLogs = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedLevel !== "ALL") params.set("level", selectedLevel);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (timeRange !== "all") params.set("timeRange", timeRange);
      params.set("limit", "150");

      const res = await fetch(`/api/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, [searchQuery, selectedLevel, selectedCategory, timeRange]);

  // Initial load
  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  // Live polling stream
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      fetchLogs(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveStreaming, fetchLogs]);

  // Auto-scroll in raw console mode
  useEffect(() => {
    if (viewMode === "raw" && autoScroll && rawStreamEndRef.current) {
      rawStreamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, viewMode, autoScroll]);

  // Toggle row expand
  const toggleExpand = (id: number) => {
    cyberAudio.play("click");
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy log JSON
  const handleCopyLog = (log: SystemLog, e?: React.MouseEvent) => {
    e?.stopPropagation();
    cyberAudio.play("chime");
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulate an event
  const handleSimulateEvent = async () => {
    cyberAudio.play("click");
    const simulatedEvents = [
      {
        level: "INFO" as LogLevel,
        category: "AGENT" as LogCategory,
        action: "AGENT_DEEP_RESEARCH_CYCLE",
        actor: "Hermes-Agent-01",
        details: { query: "Quantum neural architectures", sources_scanned: 14, confidence: 0.94 },
        latency_ms: 320,
      },
      {
        level: "SUCCESS" as LogLevel,
        category: "DOCKER" as LogCategory,
        action: "CONTAINER_IMAGE_PULL_OK",
        actor: "Docker-Daemon",
        details: { image: "alpine/git:latest", layers: 3, bytes: 14200000 },
        latency_ms: 1240,
      },
      {
        level: "WARN" as LogLevel,
        category: "API" as LogCategory,
        action: "HIGH_LATENCY_SPIKE_DETECTED",
        actor: "Prometheus-Gateway",
        details: { endpoint: "/api/chat/stream", latency_ms: 890, threshold_ms: 500 },
        latency_ms: 890,
      },
      {
        level: "AUDIT" as LogLevel,
        category: "AUTH" as LogCategory,
        action: "SESSION_TOKEN_REFRESH",
        actor: "Security-Engine",
        details: { user: "operator_root", scope: "full_access", expires_in_sec: 7200 },
        latency_ms: 14,
      },
      {
        level: "ERROR" as LogLevel,
        category: "DATABASE" as LogCategory,
        action: "INDEX_FRAGMENTATION_WARN",
        actor: "Sqlite-Optimizer",
        details: { table: "system_logs", fragmentation_ratio: "14.2%", action_required: "VACUUM" },
        latency_ms: 45,
      },
      {
        level: "DEBUG" as LogLevel,
        category: "SYSTEM" as LogCategory,
        action: "MEMORY_TELEMETRY_PULSE",
        actor: "Node-Kernel",
        details: { heap_used_mb: 312, active_handles: 18, gc_pause_ms: 1.2 },
        latency_ms: 2,
      },
    ];

    const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(randomEvent),
      });
      fetchLogs(false);
    } catch {
      // ignore
    }
  };

  // Purge logs
  const handlePurgeLogs = async () => {
    if (!confirm("Are you sure you want to purge all system logs? This action is irreversible.")) return;
    cyberAudio.play("click");
    try {
      await fetch("/api/logs?all=true", { method: "DELETE" });
      fetchLogs(true);
    } catch {
      // ignore
    }
  };

  // Export logs
  const handleExport = (format: "json" | "csv" | "txt") => {
    cyberAudio.play("chime");
    let content = "";
    let mimeType = "text/plain";
    let filename = `dirtynest-logs-${Date.now()}`;

    if (format === "json") {
      content = JSON.stringify(logs, null, 2);
      mimeType = "application/json";
      filename += ".json";
    } else if (format === "csv") {
      const headers = ["id", "timestamp", "level", "category", "action", "actor", "latency_ms", "status_code", "hash_sig", "details"];
      const rows = logs.map((l) => [
        l.id,
        `"${l.timestamp}"`,
        l.level,
        l.category,
        `"${l.action}"`,
        `"${l.actor}"`,
        l.latency_ms,
        l.status_code,
        `"${l.hash_sig || ""}"`,
        `"${(l.details || "").replace(/"/g, '""')}"`,
      ]);
      content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      mimeType = "text/csv";
      filename += ".csv";
    } else {
      content = logs
        .map(
          (l) =>
            `[${l.timestamp}] [${l.level.padEnd(7)}] [${l.category.padEnd(8)}] [${l.actor}] ${l.action} (latency: ${l.latency_ms}ms, status: ${l.status_code}) -> ${l.details || ""}`
        )
        .join("\n");
      mimeType = "text/plain";
      filename += ".log";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helpers for styling
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return "bg-[#FF003C]/15 text-[#FF003C] border-[#FF003C]/40 shadow-[0_0_8px_rgba(255,0,60,0.3)]";
      case "WARN":
        return "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40 shadow-[0_0_8px_rgba(255,184,0,0.2)]";
      case "SUCCESS":
        return "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]";
      case "AUDIT":
        return "bg-[#BF40FF]/15 text-[#BF40FF] border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.25)]";
      case "INFO":
        return "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]";
      case "DEBUG":
      default:
        return "bg-white/10 text-[#9499B3] border-white/20";
    }
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case "AGENT":
        return <Bot size={13} className="text-[#00FF41]" />;
      case "DOCKER":
        return <Container size={13} className="text-[#00F0FF]" />;
      case "TOOL":
        return <Wrench size={13} className="text-[#BF40FF]" />;
      case "API":
        return <Wifi size={13} className="text-[#FFB800]" />;
      case "DATABASE":
        return <Database size={13} className="text-[#00FF41]" />;
      case "AUTH":
        return <ShieldCheck size={13} className="text-[#BF40FF]" />;
      case "SYSTEM":
        return <Cpu size={13} className="text-[#00F0FF]" />;
      case "UI":
      default:
        return <Layers size={13} className="text-[#9499B3]" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        "." + String(d.getMilliseconds()).padStart(3, "0");
    } catch {
      return ts;
    }
  };

  const logColumns: ColumnDef<SystemLog>[] = useMemo(
    () => [
      {
        key: "timestamp",
        header: "Timestamp",
        sortable: true,
        accessor: (item: SystemLog) => (
          <span className="font-mono text-[#9499B3] whitespace-nowrap text-xs">
            {formatTimestamp(item.timestamp)}
          </span>
        ),
      },
      {
        key: "level",
        header: "Level",
        sortable: true,
        accessor: (item: SystemLog) => (
          <Badge
            variant="outline"
            className={cn("text-[10px] font-bold border", getLevelBadge(item.level))}
          >
            {item.level}
          </Badge>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        accessor: (item: SystemLog) => (
          <div className="flex items-center gap-1.5 text-[#F1F3F9] whitespace-nowrap">
            {getCategoryIcon(item.category)}
            <span className="text-[11px] font-medium">{item.category}</span>
          </div>
        ),
      },
      {
        key: "action",
        header: "Action / Directive",
        searchable: true,
        accessor: (item: SystemLog) => (
          <div className="flex flex-col gap-1 min-w-[220px]">
            <div className="flex items-center gap-2 font-bold text-[#F1F3F9]">
              <span>{item.action}</span>
              {item.status_code && item.status_code !== "200" && (
                <Badge variant="outline" className="text-[9px] px-1 bg-[#FF003C]/20 text-[#FF003C] border-[#FF003C]/30">
                  {item.status_code}
                </Badge>
              )}
            </div>
            {item.details && (
              <span className="text-[10px] text-[#4F536E] font-mono truncate max-w-md">
                {item.details}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "actor",
        header: "Actor",
        searchable: true,
        accessor: (item: SystemLog) => (
          <Badge variant="outline" className="bg-white/5 border-white/10 text-[11px] text-[#9499B3]">
            {item.actor}
          </Badge>
        ),
      },
      {
        key: "latency_ms",
        header: "Latency",
        sortable: true,
        accessor: (item: SystemLog) => (
          <span className={cn("font-mono text-xs font-bold", item.latency_ms > 500 ? "text-[#FFB800]" : "text-[#00FF41]")}>
            {item.latency_ms}ms
          </span>
        ),
      },
      {
        key: "hash_sig",
        header: "Hash",
        accessor: (item: SystemLog) => (
          <span className="font-mono text-[10px] text-[#4F536E] whitespace-nowrap">
            {item.hash_sig || "0x--------"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        accessor: (item: SystemLog) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                cyberAudio.play("click");
                setAiExplainingLog(item);
              }}
              className="h-7 w-7 text-[#BF40FF] hover:bg-[#BF40FF]/20"
              title="Explain with AI & Generate Fix"
            >
              <Sparkles size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleCopyLog(item, e)}
              className="h-7 w-7 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
              title="Copy JSON Payload"
            >
              {copiedId === item.id ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
            </Button>
          </div>
        ),
      },
    ],
    [copiedId]
  );

  // Computed metrics for analytics tab
  const totalEvents = stats.totalLogs || logs.length;
  const errorCount = stats.levelCounts.ERROR || 0;
  const warnCount = stats.levelCounts.WARN || 0;
  const successCount = stats.levelCounts.SUCCESS || 0;
  const successRate = totalEvents > 0 ? Math.round(((totalEvents - errorCount) / totalEvents) * 1000) / 10 : 100;
  const avgLatency = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0);
    return Math.round((sum / logs.length) * 10) / 10;
  }, [logs]);

  // Security logs filter
  const securityLogs = useMemo(() => {
    return logs.filter((l) => l.category === "AUTH" || l.level === "AUDIT" || l.action.includes("CLEARANCE") || l.action.includes("SECURITY"));
  }, [logs]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
      <div className="cyber-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.25) 0%, rgba(0,240,255,0.2) 100%)",
                border: "1px solid rgba(0,255,65,0.4)",
                boxShadow: "0 0 16px rgba(0,255,65,0.3)",
              }}
            >
              <ScrollText size={20} className="text-[#00FF41]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-[#F1F3F9]">
                  OPERATIONS LOG // <span className="text-[#00FF41]">AUDIT TELEMETRY HUB</span>
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLiveStreaming ? "bg-[#00FF41] animate-pulse shadow-[0_0_8px_#00FF41]" : "bg-[#FFB800]"
                    }`}
                  />
                  <span className={isLiveStreaming ? "text-[#00FF41] font-bold" : "text-[#FFB800]"}>
                    {isLiveStreaming ? "LIVE STREAM ACTIVE" : "STREAM PAUSED"}
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Real-time operational ledger · Multi-agent trace logs · Security audit trail & System event telemetry
              </span>
            </div>
          </div>

          {/* Quick HUD Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Stream pause/play */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsLiveStreaming(!isLiveStreaming);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isLiveStreaming
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                  : "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40 hover:bg-[#FFB800]/25"
              }`}
              title={isLiveStreaming ? "Pause Live Polling Stream" : "Resume Live Polling Stream"}
            >
              {isLiveStreaming ? <Pause size={13} /> : <Play size={13} />}
              <span className="hidden sm:inline">{isLiveStreaming ? "PAUSE" : "RESUME"}</span>
            </button>

            {/* Simulate Event button */}
            <button
              onClick={handleSimulateEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10 text-xs font-bold transition-all cursor-pointer"
              title="Inject test telemetry event to verify real-time stream"
            >
              <Zap size={13} />
              <span className="hidden sm:inline">SIMULATE EVENT</span>
            </button>

            {/* Export Dropdown */}
            <div className="flex items-center p-0.5 bg-black/40 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => handleExport("json")}
                className="px-2.5 py-1 text-[#9499B3] hover:text-[#00FF41] transition-colors cursor-pointer"
                title="Export JSON"
              >
                JSON
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => handleExport("csv")}
                className="px-2.5 py-1 text-[#9499B3] hover:text-[#00F0FF] transition-colors cursor-pointer"
                title="Export CSV"
              >
                CSV
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => handleExport("txt")}
                className="px-2.5 py-1 text-[#9499B3] hover:text-[#BF40FF] transition-colors cursor-pointer"
                title="Export Monospace Raw Text"
              >
                RAW
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                fetchLogs(true);
              }}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
              title="Force Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#00FF41]" : ""} />
            </button>

            {/* Purge */}
            <button
              onClick={handlePurgeLogs}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#FF003C]/40 text-[#9499B3] hover:text-[#FF003C] transition-all cursor-pointer"
              title="Purge Operations Logs"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 4 PRIMARY METRIC TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-white/5 text-xs">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Total Captured Events</span>
            <span className="text-sm sm:text-base font-bold text-[#00FF41] mt-0.5">
              {totalEvents.toLocaleString()} OPS
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Success Rate</span>
            <span className="text-sm sm:text-base font-bold text-[#00F0FF] mt-0.5">
              {successRate}%
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Errors & Warnings</span>
            <span className="text-sm sm:text-base font-bold text-[#FFB800] mt-0.5">
              <span className="text-[#FF003C]">{errorCount} ERR</span> / {warnCount} WARN
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Average Latency</span>
            <span className="text-sm sm:text-base font-bold text-[#BF40FF] mt-0.5">
              {avgLatency} ms
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION & SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setSubTab("stream");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === "stream"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <ScrollText size={13} />
            <span>OPERATIONS STREAM</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setSubTab("analytics");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === "analytics"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Activity size={13} />
            <span>ANALYTICS & METRICS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setSubTab("traces");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === "traces"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Terminal size={13} />
            <span>TRACE INSPECTOR</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setSubTab("security");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === "security"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <ShieldCheck size={13} />
            <span>SECURITY AUDIT ({securityLogs.length})</span>
          </button>
        </div>

        {/* View Mode Switcher (Table vs Raw Console) */}
        {subTab === "stream" && (
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setViewMode("table");
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white/10 text-white font-bold"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              STRUCTURED TABLE
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setViewMode("raw");
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "raw"
                  ? "bg-[#00FF41]/20 text-[#00FF41] font-bold border border-[#00FF41]/30"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              RAW CONSOLE
            </button>
          </div>
        )}
      </div>

      {/* Real-time Ingestion Histogram */}
      {subTab === "stream" && <LogHistogramBarChart logs={logs} />}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-3 cyber-card p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
            <Search size={14} className="text-[#00FF41]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, actor, hash signature, payload..."
              className="flex-1 bg-transparent outline-none text-[#F1F3F9] font-mono placeholder:text-[#4F536E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[10px] font-bold text-[#9499B3] hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
            {(["all", "15m", "1h", "6h", "24h", "7d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  cyberAudio.play("click");
                  setTimeRange(t);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  timeRange === t
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30"
                    : "text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Level & Category Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          {/* Level Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-[#4F536E] uppercase mr-1">Level:</span>
            {(["ALL", "INFO", "SUCCESS", "WARN", "ERROR", "AUDIT", "DEBUG"] as const).map((lvl) => {
              const count = lvl === "ALL" ? totalEvents : stats.levelCounts[lvl] || 0;
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedLevel(lvl);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? getLevelBadge(lvl as LogLevel)
                      : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {lvl} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-[#4F536E] uppercase mr-1">Category:</span>
            {(["ALL", "AGENT", "DOCKER", "TOOL", "API", "DATABASE", "AUTH", "SYSTEM", "UI"] as const).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCategory(cat);
                  }}
                  className={`px-2 py-0.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: STREAM VIEW */}
      {subTab === "stream" && (
        <>
          {viewMode === "table" ? (
            <DataTable<SystemLog>
              data={logs}
              columns={logColumns}
              exportFilename="dirtynest-logs"
              searchPlaceholder="Filter operational directives, actors, hashes..."
              onRowClick={(row) => setSelectedLog(row)}
            />
          ) : (
            /* RAW MONOSPACE CONSOLE STREAM */
            <div className="cyber-card p-4 flex flex-col gap-2 bg-[#040508] border border-[#00FF41]/20">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-[#00FF41]" />
                  <span className="font-bold text-white">CYBER KERNEL LOG STREAM // MONOSPACE RAW PIPE</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-[#9499B3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="accent-[#00FF41]"
                    />
                    <span>Auto-Scroll to Bottom</span>
                  </label>
                  <button
                    onClick={() => handleExport("txt")}
                    className="flex items-center gap-1 text-[11px] text-[#00FF41] hover:underline cursor-pointer"
                  >
                    <Download size={12} />
                    <span>Dump Pipe</span>
                  </button>
                </div>
              </div>

              <div className="bg-black/80 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[580px] space-y-1 scrollbar-none">
                {logs.map((log) => {
                  let colorClass = "text-[#00FF41]";
                  if (log.level === "ERROR") colorClass = "text-[#FF003C]";
                  else if (log.level === "WARN") colorClass = "text-[#FFB800]";
                  else if (log.level === "AUDIT") colorClass = "text-[#BF40FF]";
                  else if (log.level === "INFO") colorClass = "text-[#00F0FF]";
                  else if (log.level === "DEBUG") colorClass = "text-[#4F536E]";

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-white/5 px-2 py-1 rounded transition-colors cursor-pointer leading-relaxed flex flex-wrap items-baseline gap-2"
                    >
                      <span className="text-[#4F536E] select-none">[{formatTimestamp(log.timestamp)}]</span>
                      <span className={`font-bold ${colorClass}`}>[{log.level.padEnd(7)}]</span>
                      <span className="text-[#BF40FF]">[{log.category}]</span>
                      <span className="text-[#9499B3]">@{log.actor}:</span>
                      <span className="text-white font-bold">{log.action}</span>
                      {log.latency_ms > 0 && (
                        <span className="text-[10px] text-[#FFB800]">({log.latency_ms}ms)</span>
                      )}
                      {log.details && (
                        <span className="text-[#00F0FF] opacity-80 truncate max-w-xl">
                          {log.details}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div ref={rawStreamEndRef} />
              </div>
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: ANALYTICS & STATS VIEW */}
      {subTab === "analytics" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Operations Breakdown Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Level Distribution Card */}
            <div className="cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#00FF41]" />
                  <h3 className="text-sm font-bold text-white">LOG SEVERITY RATIOS</h3>
                </div>
                <span className="text-xs text-[#00FF41] font-bold">{totalEvents} Total</span>
              </div>

              <div className="space-y-3 text-xs">
                {(["INFO", "SUCCESS", "WARN", "ERROR", "AUDIT", "DEBUG"] as const).map((lvl) => {
                  const count = stats.levelCounts[lvl] || 0;
                  const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
                  return (
                    <div key={lvl} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-[#F1F3F9]">{lvl}</span>
                        <span className="text-[#9499B3]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            background:
                              lvl === "ERROR"
                                ? "#FF003C"
                                : lvl === "WARN"
                                ? "#FFB800"
                                : lvl === "SUCCESS"
                                ? "#00FF41"
                                : lvl === "AUDIT"
                                ? "#BF40FF"
                                : lvl === "INFO"
                                ? "#00F0FF"
                                : "#4F536E",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown Card */}
            <div className="cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-[#00F0FF]" />
                  <h3 className="text-sm font-bold text-white">SUBSYSTEM ACTIVITY</h3>
                </div>
                <span className="text-xs text-[#00F0FF] font-bold">8 Categories</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {stats.categoryCounts.map((cat) => {
                  const pct = totalEvents > 0 ? Math.round((cat.count / totalEvents) * 100) : 0;
                  return (
                    <div key={cat.category} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat.category as LogCategory)}
                        <span className="font-bold text-[#F1F3F9]">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#9499B3]">{cat.count} ops</span>
                        <span className="text-[11px] font-bold text-[#00FF41]">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA & Health Diagnostics Card */}
            <div className="cyber-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#BF40FF]" />
                  <h3 className="text-sm font-bold text-white">RELIABILITY INDEX</h3>
                </div>
                <span className="text-xs text-[#BF40FF] font-bold">NODE 01</span>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Operational Uptime SLA</div>
                    <div className="text-[10px] text-[#4F536E]">Target threshold: 99.9%</div>
                  </div>
                  <span className="text-sm font-bold text-[#00FF41]">99.98%</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Error Rate Index</div>
                    <div className="text-[10px] text-[#4F536E]">Total failure incidents</div>
                  </div>
                  <span className="text-sm font-bold text-[#FF003C]">
                    {totalEvents > 0 ? ((errorCount / totalEvents) * 100).toFixed(2) : 0}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Throughput Rate</div>
                    <div className="text-[10px] text-[#4F536E]">Operations per minute</div>
                  </div>
                  <span className="text-sm font-bold text-[#00F0FF]">~42 ops / min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TRACE INSPECTOR VIEW */}
      {subTab === "traces" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* Left Column: Trace List */}
          <div className="lg:col-span-5 cyber-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-white">
              <span>ACTIVE EVENT TRACES</span>
              <span className="text-[#00FF41]">{logs.length} Traces</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[500px] scrollbar-none">
              {logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedLog(log);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00FF41]/15 border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                        : "bg-black/40 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getLevelBadge(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-[#4F536E]">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <div className="font-bold text-xs text-white truncate">{log.action}</div>
                    <div className="flex items-center justify-between text-[10px] text-[#9499B3] mt-1">
                      <span>@{log.actor}</span>
                      <span className="text-[#00F0FF]">{log.latency_ms}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed JSON Payload & Inspector */}
          <div className="lg:col-span-7 cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-[#00FF41]" />
                <h3 className="text-sm font-bold text-white">DEEP TRACE PAYLOAD VIEWER</h3>
              </div>
              {selectedLog && (
                <button
                  onClick={() => handleCopyLog(selectedLog)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#00FF41] text-xs font-bold transition-all cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{copiedId === selectedLog.id ? "COPIED" : "COPY RAW JSON"}</span>
                </button>
              )}
            </div>

            {selectedLog ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[9px] text-[#4F536E] uppercase block">Event ID</span>
                    <strong className="text-white font-mono">#{selectedLog.id}</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[9px] text-[#4F536E] uppercase block">Subsystem</span>
                    <strong className="text-[#00F0FF] font-mono">{selectedLog.category}</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[9px] text-[#4F536E] uppercase block">Status</span>
                    <strong className="text-[#00FF41] font-mono">{selectedLog.status_code}</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[9px] text-[#4F536E] uppercase block">Signature Hash</span>
                    <strong className="text-[#BF40FF] font-mono">{selectedLog.hash_sig || "0xNIL"}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#4F536E] uppercase block mb-1">JSON Execution Context & Metadata</span>
                  <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-[#00FF41] font-mono text-xs overflow-x-auto max-h-[380px] scrollbar-none whitespace-pre-wrap">
                    {JSON.stringify(
                      {
                        id: selectedLog.id,
                        timestamp: selectedLog.timestamp,
                        level: selectedLog.level,
                        category: selectedLog.category,
                        action: selectedLog.action,
                        actor: selectedLog.actor,
                        latency_ms: selectedLog.latency_ms,
                        status_code: selectedLog.status_code,
                        ip_origin: selectedLog.ip_origin,
                        hash_signature: selectedLog.hash_sig,
                        parsed_payload: (() => {
                          try {
                            return selectedLog.details ? JSON.parse(selectedLog.details) : null;
                          } catch {
                            return selectedLog.details;
                          }
                        })(),
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-[#4F536E] text-xs">
                SELECT A TRACE ENTRY FROM THE LEFT LIST TO INSPECT FULL EXECUTION CONTEXT
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SECURITY AUDIT VIEW */}
      {subTab === "security" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#BF40FF]" />
              <div>
                <h3 className="text-sm font-bold text-white">SECURITY AUDIT LEDGER</h3>
                <span className="text-xs text-[#9499B3]">
                  Identity tokens, clearance grants, permission checks & security warnings
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#BF40FF] px-2.5 py-1 rounded-full bg-[#BF40FF]/15 border border-[#BF40FF]/30">
              {securityLogs.length} AUDIT ENTRIES
            </span>
          </div>

          <div className="space-y-2.5">
            {securityLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-3.5 rounded-xl bg-black/40 border border-[#BF40FF]/20 hover:border-[#BF40FF]/50 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#BF40FF]/10 text-[#BF40FF]">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{log.action}</span>
                      <span className={`text-[9px] px-1.5 rounded border ${getLevelBadge(log.level)}`}>
                        {log.level}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9499B3] mt-0.5 block">
                      Actor: <strong className="text-white">@{log.actor}</strong> · IP: {log.ip_origin || "127.0.0.1"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#4F536E]">{formatTimestamp(log.timestamp)}</span>
                  <button
                    onClick={(e) => handleCopyLog(log, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            ))}

            {securityLogs.length === 0 && (
              <div className="py-12 text-center text-[#4F536E] text-xs">
                NO SECURITY VIOLATIONS OR AUDIT ALERTS LOGGED
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK LOG INSPECTOR MODAL */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-2xl cyber-card p-5 flex flex-col gap-4 border border-[#00FF41]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getLevelBadge(selectedLog.level)}`}>
                  {selectedLog.level}
                </span>
                <span className="text-sm font-bold text-white">{selectedLog.action}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#9499B3] hover:text-white text-sm font-bold px-2 py-1 rounded bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#4F536E] uppercase">Timestamp</span>
                <div className="text-white font-mono mt-0.5">{selectedLog.timestamp}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#4F536E] uppercase">Actor</span>
                <div className="text-[#00FF41] font-mono mt-0.5">{selectedLog.actor}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#4F536E] uppercase">Subsystem</span>
                <div className="text-[#00F0FF] font-mono mt-0.5">{selectedLog.category}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#4F536E] uppercase">Latency</span>
                <div className="text-[#FFB800] font-mono mt-0.5">{selectedLog.latency_ms}ms</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">RAW JSON CONTEXT</span>
                <button
                  onClick={() => handleCopyLog(selectedLog)}
                  className="flex items-center gap-1 text-[#00FF41] hover:underline"
                >
                  <Copy size={12} />
                  <span>{copiedId === selectedLog.id ? "COPIED" : "COPY"}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/90 border border-white/10 text-xs font-mono text-[#00FF41] overflow-x-auto max-h-64 scrollbar-none whitespace-pre-wrap">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AI LOG ROOT-CAUSE & FIX EXPLAIN MODAL */}
      {aiExplainingLog && (
        <LogAiExplainModal
          log={aiExplainingLog}
          onClose={() => setAiExplainingLog(null)}
        />
      )}
    </div>
  );
}
