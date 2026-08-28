"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Database,
  Brain,
  Wifi,
  Loader2,
  Server,
  Zap,
} from "lucide-react";
import { hermesSocket } from "@/lib/hermes/hermesSocket";
import { cyberAudio } from "@/lib/cyberAudio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CronJobItem {
  id: string;
  name: string;
  schedule: string;
  interval_seconds: number;
  category: "security" | "database" | "ai-memory" | "network";
  last_run: number | null;
  next_run: number | null;
  status: "SCHEDULED" | "RUNNING" | "SUCCESS" | "ERROR";
  runs_count: number;
  last_duration_ms: number;
  last_result: string;
}

const CATEGORY_ICONS = {
  security: <ShieldAlert size={14} className="text-red-400" />,
  database: <Database size={14} className="text-cyan-400" />,
  "ai-memory": <Brain size={14} className="text-purple-400" />,
  network: <Wifi size={14} className="text-emerald-400" />,
};

export default function AcpCronHub() {
  const [jobs, setJobs] = useState<CronJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      const res = await fetch(`${sidecarUrl}/api/hermes/cron`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.cron_jobs || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Listen for WebSocket cron updates
    const handleWsEvent = (event: Event) => {
      const customEvt = event as CustomEvent<{ type: string; job?: CronJobItem; job_id?: string }>;
      if (customEvt.detail?.type === "CRON_JOB_COMPLETED" && customEvt.detail.job) {
        const updatedJob = customEvt.detail.job;
        setJobs((prev) =>
          prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        );
      }
    };

    window.addEventListener("hermes-socket-event", handleWsEvent);
    return () => window.removeEventListener("hermes-socket-event", handleWsEvent);
  }, []);

  const handleRunNow = async (jobId: string) => {
    try {
      cyberAudio.play("warp");
      setTriggeringJobId(jobId);
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      const res = await fetch(`${sidecarUrl}/api/hermes/cron/${jobId}/run`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setJobs((prev) => prev.map((j) => (j.id === jobId ? data.job : j)));
        }
      }
    } catch {
      // ignore
    } finally {
      setTriggeringJobId(null);
    }
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return "NEVER";
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  const formatCountdown = (nextRun: number | null) => {
    if (!nextRun) return "PAUSED";
    const diff = Math.round(nextRun - Date.now() / 1000);
    if (diff <= 0) return "DUE NOW";
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="cyber-card p-4 flex flex-col gap-4 font-mono select-none border-amber-500/20 bg-black/50 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider">
                REDIS CRON SCHEDULER & TASK QUEUE
              </h3>
              <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/30 font-bold">
                REDIS :6379 QUEUE ACTIVE
              </Badge>
            </div>
            <span className="text-[10px] text-[#4F536E]">
              Autonomous background workers: CVE reconnaissance, vector maintenance, and DB telemetry
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchJobs}
          className="h-8 px-2.5 bg-white/5 border-white/10 text-[10px] text-[#9499B3] hover:text-white"
        >
          <RotateCw size={12} className={`mr-1 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>REFRESH JOBS</span>
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {jobs.map((job) => {
          const isTriggering = triggeringJobId === job.id || job.status === "RUNNING";
          return (
            <div
              key={job.id}
              className="p-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#F1F3F9]">
                    {CATEGORY_ICONS[job.category] || <Clock size={14} />}
                    <span className="truncate">{job.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-bold ${
                      job.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : job.status === "RUNNING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                        : "bg-white/5 text-[#9499B3] border-white/10"
                    }`}
                  >
                    {job.status}
                  </Badge>
                </div>

                <div className="text-[10px] text-[#9499B3] bg-black/40 p-2 rounded-lg border border-white/5 line-clamp-2">
                  {job.last_result || "No execution result recorded yet."}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-[#4F536E]">
                <div className="flex flex-col">
                  <span>LAST: {formatTimestamp(job.last_run)} ({job.last_duration_ms}ms)</span>
                  <span className="text-amber-400/80 font-bold">NEXT IN: {formatCountdown(job.next_run)}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRunNow(job.id)}
                  disabled={isTriggering}
                  className="h-7 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-bold"
                >
                  {isTriggering ? (
                    <Loader2 size={11} className="mr-1 animate-spin" />
                  ) : (
                    <Play size={11} className="mr-1 fill-amber-400" />
                  )}
                  <span>RUN NOW</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
