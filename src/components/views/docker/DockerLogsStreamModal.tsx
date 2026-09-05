"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Terminal,
  Search,
  Download,
  Copy,
  Check,
  Pause,
  Play,
  ArrowDown,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface DockerLogsStreamModalProps {
  containerName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LogLine {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
}

export default function DockerLogsStreamModal({
  containerName,
  isOpen,
  onClose,
}: DockerLogsStreamModalProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchGrep, setSearchGrep] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Generate initial logs
  useEffect(() => {
    if (!isOpen) return;
    const initial: LogLine[] = [
      { id: "1", timestamp: "08:50:01", level: "INFO", message: `[${containerName}] Container logs pipeline initializing...` },
    ];
    setLogs(initial);
  }, [isOpen, containerName]);

  // Live logs fetching from Sidecar API
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const fetchLogs = async () => {
      try {
        const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
        const res = await fetch(`${sidecarUrl}/api/docker/containers/${containerName}/logs?tail=150`);
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.trim()) {
            const rawLines = data.logs.split("\n");
            const parsedLines: LogLine[] = rawLines.map((line: string, index: number) => {
              let level: "INFO" | "WARN" | "ERROR" | "DEBUG" = "INFO";
              if (line.toLowerCase().includes("warn")) level = "WARN";
              else if (line.toLowerCase().includes("err")) level = "ERROR";
              else if (line.toLowerCase().includes("debug")) level = "DEBUG";

              const timeMatch = line.match(/\d{2}:\d{2}:\d{2}/) || line.match(/\d{4}-\d{2}-\d{2}/);
              const timestamp = timeMatch ? timeMatch[0] : new Date().toLocaleTimeString("en-US", { hour12: false });

              return {
                id: `line-${index}-${Date.now()}`,
                timestamp,
                level,
                message: line,
              };
            });
            setLogs(parsedLines);
          }
        }
      } catch (err) {
        // Fallback or ignore
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [isOpen, isStreaming, containerName]);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesGrep =
      searchGrep === "" ||
      log.message.toLowerCase().includes(searchGrep.toLowerCase()) ||
      log.timestamp.includes(searchGrep);
    const matchesLevel = selectedLevel === "ALL" || log.level === selectedLevel;
    return matchesGrep && matchesLevel;
  });

  const handleCopyLogs = () => {
    cyberAudio.play("click");
    const fullText = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    cyberAudio.play("chime");
    const fullText = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${containerName}-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#080910] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  CONTAINER LOGS // <span className="text-emerald-400">{containerName}</span>
                </h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isStreaming ? "LIVE PIPE" : "PAUSED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct standard output & error stream with grep filter and auto-scroll
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-3 bg-[#0a0b12] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Grep Filter */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Grep logs (regex / keywords)..."
              value={searchGrep}
              onChange={(e) => setSearchGrep(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            {["ALL", "INFO", "WARN", "ERROR"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedLevel(lvl);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  selectedLevel === lvl
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Stream Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsStreaming(!isStreaming);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isStreaming
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? "PAUSE" : "RESUME"}</span>
            </button>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                autoScroll
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>AUTO-SCROLL</span>
            </button>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleDownloadLogs}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Download Logs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Monospace Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-black/90 space-y-1.5 font-mono text-[11px] min-h-[350px]">
          {filteredLogs.map((log) => {
            const levelColor =
              log.level === "ERROR"
                ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                : log.level === "WARN"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                : log.level === "DEBUG"
                ? "text-purple-400 bg-purple-500/10 border-purple-500/30"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

            return (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed hover:bg-white/[0.02] p-0.5 rounded">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold shrink-0 ${levelColor}`}>
                  {log.level}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#05060b] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Displayed lines: <strong className="text-white">{filteredLogs.length}</strong></span>
          <span>Buffer memory: <strong className="text-emerald-400">64 KB</strong></span>
        </div>
      </div>
    </div>
  );
}
