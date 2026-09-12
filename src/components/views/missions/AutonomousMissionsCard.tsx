"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Sparkles,
  Radio,
  Play,
  Pause,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { toast } from "sonner";
import type { MissionMetadata } from "@/lib/missions/sidecar";

interface Props {
  className?: string;
  onMissionTriggered?: (missionId: string) => void;
}

export default function AutonomousMissionsCard({ className, onMissionTriggered }: Props) {
  const [missions, setMissions] = useState<MissionMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const fetchMissionsData = useCallback(async () => {
    try {
      const res = await fetch("/api/missions");
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissionsData();
    const interval = setInterval(fetchMissionsData, 5000);
    return () => clearInterval(interval);
  }, [fetchMissionsData]);

  const handleTrigger = async (id: string, name: string) => {
    cyberAudio.play("click");
    setTriggeringId(id);
    try {
      const res = await fetch(`/api/missions/${encodeURIComponent(id)}/trigger`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`Mission Initiated: ${name}`, {
          description: "Agent execution dispatched asynchronously into swarm queue.",
        });
        if (onMissionTriggered) onMissionTriggered(id);
        fetchMissionsData();
      } else {
        toast.error(`Trigger Failed: ${name}`, {
          description: data.message || "Unable to dispatch mission.",
        });
      }
    } catch {
      toast.error(`Trigger Failed: ${name}`);
    } finally {
      setTimeout(() => setTriggeringId(null), 1200);
    }
  };

  const handleToggle = async (id: string, currentlyEnabled: boolean) => {
    cyberAudio.play("click");
    try {
      const res = await fetch(`/api/missions/${encodeURIComponent(id)}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        toast.info(currentlyEnabled ? "Mission Schedule Paused" : "Mission Schedule Resumed");
        fetchMissionsData();
      }
    } catch {
      toast.error("Failed to toggle mission schedule");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SECURITY":
        return <ShieldAlert size={16} className="text-[#FF2A6D]" />;
      case "CREATIVE":
        return <Sparkles size={16} className="text-[#BF40FF]" />;
      case "PORTAL":
        return <Radio size={16} className="text-[#00F0FF]" />;
      default:
        return <Flame size={16} className="text-[#00FF41]" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "SECURITY":
        return "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30";
      case "CREATIVE":
        return "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30";
      case "PORTAL":
        return "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30";
      default:
        return "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30";
    }
  };

  const formatRelativeTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const diff = Math.round((Date.now() / 1000) - timestamp);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const armedCount = missions.filter((m) => m.enabled).length;

  return (
    <div
      className={`cyber-card relative overflow-hidden rounded-2xl bg-[#090A14]/90 border border-white/10 p-4 md:p-5 shadow-2xl ${
        className || ""
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]">
            <Flame size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wider flex items-center gap-2">
              <span>HERMES AUTO-OPS // TRI-MISSION LOOP</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                {armedCount}/{missions.length || 3} ARMED
              </span>
            </div>
            <p className="text-[11px] text-[#9499B3] mt-0.5">
              Autonomous background workers proposing actions with Human-In-The-Loop (HITL) gate clearance.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            cyberAudio.play("click");
            setLoading(true);
            fetchMissionsData();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-bold transition-all cursor-pointer"
        >
          <RotateCw size={11} className={loading ? "animate-spin" : ""} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mt-4">
        {missions.map((m) => {
          const isTriggering = triggeringId === m.id || m.status === "RUNNING";
          const latestRun = m.history && m.history.length > 0 ? m.history[0] : null;

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                m.enabled
                  ? "bg-black/40 border-white/10 hover:border-[#00FF41]/40"
                  : "bg-black/20 border-white/5 opacity-60"
              }`}
            >
              {/* Mission Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getCategoryIcon(m.category)}
                    <span className="text-xs font-black text-white truncate">{m.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getCategoryBadgeColor(
                      m.category
                    )}`}
                  >
                    {m.category}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-mono leading-relaxed line-clamp-2">
                  {m.description}
                </p>
              </div>

              {/* Schedule & Telemetry State */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/5 space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>Interval:</span>
                  </span>
                  <span className="text-white font-bold">{m.cron}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Last Executed:</span>
                  <span className="text-slate-200">{formatRelativeTime(m.last_run)}</span>
                </div>
                {latestRun && (
                  <div className="pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[9px]">
                      {latestRun.status === "SUCCESS" ? (
                        <CheckCircle2 size={10} className="text-[#00FF41] shrink-0" />
                      ) : (
                        <AlertTriangle size={10} className="text-[#FF2A6D] shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">{latestRun.summary}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggle(m.id, m.enabled)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                    m.enabled
                      ? "bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                  title={m.enabled ? "Pause autonomous cron" : "Resume autonomous cron"}
                >
                  {m.enabled ? <Pause size={10} /> : <Play size={10} />}
                  <span>{m.enabled ? "PAUSE" : "RESUME"}</span>
                </button>

                <button
                  type="button"
                  disabled={isTriggering}
                  onClick={() => handleTrigger(m.id, m.name)}
                  className={`flex-1 py-1 px-2 rounded text-[10px] font-black tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isTriggering
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 animate-pulse"
                      : "bg-[#00FF41] text-black hover:bg-[#00cc34] shadow-[0_0_12px_rgba(0,255,65,0.25)]"
                  }`}
                >
                  <Play size={10} className={isTriggering ? "animate-spin" : ""} />
                  <span>{isTriggering ? "RUNNING..." : "RUN NOW"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
