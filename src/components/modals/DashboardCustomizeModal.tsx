"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Sliders,
  Check,
  RotateCcw,
  LayoutDashboard,
  Cpu,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Calendar,
  Rss,
  Wifi,
  GitBranch,
  Rocket,
  Zap,
  Server,
  GitPullRequest,
  TrendingUp,
  ShieldAlert,
  Database,
  Lock,
  Globe,
  ClipboardList,
  Headphones,
  Palette,
  Terminal,
  Droplets,
  Clock,
  Brain,
} from "lucide-react";
=======
import { Sliders, Check, RotateCcw, LayoutDashboard, Cpu, Sparkles, ShieldCheck, DollarSign, Calendar, Rss, Wifi, GitBranch, Rocket, Zap, Server, GitPullRequest, TrendingUp, ShieldAlert, Database, Lock, Globe, ClipboardList, Headphones, Palette, Terminal, Droplets, Clock, Brain } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  gridSpan: "full" | "half" | "third";
  category: "SYSTEM" | "AI & AGENTS" | "NETWORK & DEV";
}

export type DashboardPreset =
  | "tactical_sre"
  | "ai_researcher"
  | "cyber_ops"
  | "developer_docker"
  | "minimalist"
  | "all_widgets"
  | "custom";

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: "dora_metrics", name: "DORA Engineering Health Metrics", description: "Deployment frequency, lead time, failure rate, and MTTR", icon: TrendingUp, enabled: true, gridSpan: "full", category: "SYSTEM" },
  { id: "ai_insight", name: "Tactical AI Operations Briefing", description: "Natural language cluster synthesis & autonomous recommendations", icon: Sparkles, enabled: true, gridSpan: "full", category: "AI & AGENTS" },
  { id: "hermes_brain", name: "Hermes Master Brain & Skills HUD", description: "Live cognitive activity, active memory count, and running skills", icon: Brain, enabled: true, gridSpan: "half", category: "AI & AGENTS" },
  { id: "ai_quota", name: "AI Model Quotas & Burndown", description: "Multi-LLM rate limits (TPM/RPM) and token cost telemetry", icon: Zap, enabled: true, gridSpan: "half", category: "AI & AGENTS" },
  { id: "aws_cloud_burn", name: "FinOps Cloud Spend & Burn", description: "AWS & GCP monthly forecast, circular burn rate & idle termination", icon: DollarSign, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "agent_security_beacon", name: "Agent Security Beacon & Audit", description: "Zero-trust local audit logging for AI agent shell/file mutations", icon: ShieldCheck, enabled: true, gridSpan: "half", category: "AI & AGENTS" },
  { id: "quick_actions", name: "Tactical Action Hub & Quick Dispatch", description: "1-click triggers for canary deploy, CVE scan, and cache purge", icon: Rocket, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "service_status", name: "Service Radar Status Matrix", description: "High-density status & latency pills of all 8 core services", icon: Server, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "pipeline_queue", name: "CI/CD & Swarm Workflow Queue", description: "Live progress of running builds and background agent jobs", icon: GitPullRequest, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "git_pr_velocity", name: "Pull Requests & Velocity", description: "Active PR reviews, GitHub Actions check status & branch divergence", icon: GitBranch, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "sql_slow_queries", name: "SQL & Slow Query Forensics", description: "P99 latency distribution & lock contention diagnostics", icon: Database, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "ebpf_kernel_heat", name: "eBPF Kernel Observability", description: "Real-time syscall probes and kernel probe CPU overhead", icon: Cpu, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "cve_radar", name: "CVE & Zero-Day Radar", description: "Actionable vulnerability scoring with MTTR and 1-click patch actions", icon: ShieldAlert, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "crypto_hash_verifier", name: "Crypto Hash & Integrity Check", description: "Live SHA-256 computation and digest verification probe", icon: Lock, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "global_dns_ssl", name: "Global DNS & SSL Radar", description: "Multi-region DNS propagation latency & TLS certificate expiration", icon: Globe, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "clipboard_manager", name: "Clipboard Buffer & Snippets", description: "Fast code, token & URL scratchpad with pinning and 1-click copy", icon: ClipboardList, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "github_trending", name: "GitHub Trending Radar", description: "High-velocity open source repositories and daily star growth", icon: TrendingUp, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "cyber_soundscape", name: "Cyber Focus Soundscape", description: "Focus ambient generators: Cyberpunk Rain, Server Hum, Binaural", icon: Headphones, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "color_palette", name: "Cyber Palette Generator", description: "Neon and obsidian harmonic palettes with 1-click CSS token export", icon: Palette, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "matrix_rain", name: "Matrix Digital Rain // Zen", description: "Lightweight HTML5 2D canvas falling katakana digital rain", icon: Terminal, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "dev_hydration", name: "Operator Bio-Rhythm & Streak", description: "Espresso vs water hydration goals and Pomodoro deep work streak", icon: Droplets, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "global_timezones", name: "Global Command Timezones", description: "Parallel live chronometers across Warsaw, London, SF, NYC, Tokyo", icon: Clock, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "system_stats", name: "System Telemetry & Resource Monitor", description: "CPU, Memory, Disk, and eBPF Daemon load metrics", icon: Cpu, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "github_activity", name: "GitHub Repository Commit Matrix", description: "Recent commits, PRs, and branch activities", icon: GitBranch, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "api_health", name: "API & Microservice Health Probes", description: "Status of SQLite-Vec, Auth Proxy, and Redis mesh", icon: Wifi, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "rss_feed", name: "Cyber Threat & Intel RSS Feed", description: "Real-time vulnerability advisories & CVE updates", icon: Rss, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "calendar", name: "Operations & Deployment Calendar", description: "Scheduled cron jobs, maintenance windows, and sprints", icon: Calendar, enabled: true, gridSpan: "full", category: "SYSTEM" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLayoutChange?: (widgets: DashboardWidgetConfig[]) => void;
}

export default function DashboardCustomizeModal({
  isOpen,
  onClose,
  onLayoutChange,
}: Props) {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [selectedPreset, setSelectedPreset] = useState<DashboardPreset>("all_widgets");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_dashboard_layout");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = DEFAULT_WIDGETS.map((def) => {
            const match = parsed.find((p: any) => p.id === def.id);
            return match ? { ...def, ...match } : def;
          });
          setWidgets(merged);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveLayout = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem("dirtynest_dashboard_layout", JSON.stringify(newWidgets));
      const layoutItems = newWidgets.map((w) => ({
        id: w.id,
        enabled: w.enabled,
        span: w.gridSpan === "full" ? ("2-col" as const) : ("1-col" as const),
      }));
      localStorage.setItem("dirtynest_widget_layout", JSON.stringify(layoutItems));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
      }
    } catch {
      // ignore
    }
    if (onLayoutChange) onLayoutChange(newWidgets);
  };

  const toggleWidget = (id: string) => {
    cyberAudio.play("click");
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setSelectedPreset("custom");
    saveLayout(updated);
  };

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    cyberAudio.play("click");
    const updated = [...widgets];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSelectedPreset("custom");
    saveLayout(updated);
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === widgets.length - 1) return;
    cyberAudio.play("click");
    const updated = [...widgets];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSelectedPreset("custom");
    saveLayout(updated);
  };

  const handleToggleSpan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberAudio.play("click");
    const updated = widgets.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          gridSpan: (w.gridSpan === "full" ? "half" : "full") as "full" | "half",
        };
      }
      return w;
    });
    setSelectedPreset("custom");
    saveLayout(updated);
  };

  const applyPreset = (preset: DashboardPreset) => {
    cyberAudio.play("chime");
    setSelectedPreset(preset);
    let updated = [...DEFAULT_WIDGETS];

    if (preset === "all_widgets") {
      updated = updated.map((w) => ({ ...w, enabled: true }));
    } else if (preset === "tactical_sre") {
      updated = updated.map((w) => ({
        ...w,
        enabled: [
          "dora_metrics",
          "service_status",
          "sql_slow_queries",
          "ebpf_kernel_heat",
          "system_stats",
          "api_health",
          "aws_cloud_burn",
          "pipeline_queue",
        ].includes(w.id),
      }));
    } else if (preset === "ai_researcher") {
      updated = updated.map((w) => ({
        ...w,
        enabled: [
          "ai_insight",
          "hermes_brain",
          "ai_quota",
          "agent_security_beacon",
          "clipboard_manager",
          "cyber_soundscape",
        ].includes(w.id),
      }));
    } else if (preset === "cyber_ops") {
      updated = updated.map((w) => ({
        ...w,
        enabled: [
          "cve_radar",
          "crypto_hash_verifier",
          "agent_security_beacon",
          "rss_feed",
          "global_dns_ssl",
          "matrix_rain",
        ].includes(w.id),
      }));
    } else if (preset === "developer_docker") {
      updated = updated.map((w) => ({
        ...w,
        enabled: [
          "git_pr_velocity",
          "pipeline_queue",
          "github_activity",
          "github_trending",
          "quick_actions",
          "dev_hydration",
          "system_stats",
        ].includes(w.id),
      }));
    } else if (preset === "minimalist") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["dora_metrics", "ai_insight", "service_status"].includes(w.id),
      }));
    }

    saveLayout(updated);
    toast.success("PRESET APPLIED", { description: `Applied ${preset.toUpperCase()} layout.` });
  };

  const handleResetDefaults = () => {
    cyberAudio.play("click");
    setSelectedPreset("all_widgets");
    saveLayout(DEFAULT_WIDGETS);
    toast.info("LAYOUT RESET", { description: "Reset to default widgets." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-[#090B14] border-[#00FF41]/40 text-[#F1F3F9] font-mono p-0 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              <Sliders size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
                Tactical Matrix Configurator // Dashboard Layout
              </DialogTitle>
              <p className="text-[10px] text-[#9499B3]">
                Toggle, reorder, span, or apply role-based neural presets
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Presets Bar */}
        <div className="px-5 py-2.5 border-b border-white/5 bg-black/30 flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span className="text-[#4F536E] font-bold mr-2 uppercase">Presets:</span>
          {[
            { id: "all_widgets", label: "ALL WIDGETS" },
            { id: "tactical_sre", label: "TACTICAL SRE" },
            { id: "ai_researcher", label: "AI RESEARCHER" },
            { id: "cyber_ops", label: "CYBER OPS" },
            { id: "developer_docker", label: "DEVELOPER" },
            { id: "minimalist", label: "MINIMALIST" },
          ].map((pr) => (
            <Button
              key={pr.id}
              variant={selectedPreset === pr.id ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(pr.id as DashboardPreset)}
              className="text-[10px] h-7 px-3"
            >
              {pr.label}
            </Button>
          ))}
        </div>

        {/* Widget Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {widgets.map((w) => {
            const Icon = w.icon || LayoutDashboard;
            return (
              <div
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer select-none",
                  w.enabled
                    ? "bg-black/60 border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.08)]"
                    : "bg-black/20 border-white/5 opacity-50 hover:opacity-80"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      w.enabled
                        ? "bg-[#00FF41]/10 text-[#00FF41]"
                        : "bg-white/5 text-[#4F536E]"
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[#F1F3F9] text-xs truncate">
                      {w.name}
                    </span>
                    <span className="text-[10px] text-[#9499B3] line-clamp-2 mt-0.5">
                      {w.description}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[8px] font-mono text-[#4F536E] border-white/10 px-1 py-0">
                        {w.category}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] font-mono text-[#00F0FF] border-[#00F0FF]/30 px-1 py-0">
                        {w.gridSpan.toUpperCase()}
                      </Badge>
                    </div>

                    {/* In-Card Quick Controls */}
                    <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleToggleSpan(w.id, e)}
                        className={cn(
                          "h-5 text-[9px] px-1.5 border-white/10 font-bold",
                          w.gridSpan === "full" ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" : "text-[#9499B3]"
                        )}
                        title="Toggle 1-Column vs Full 2-Column Span"
                      >
                        {w.gridSpan === "full" ? "SPAN: 2-COL" : "SPAN: 1-COL"}
                      </Button>

                      <div className="flex items-center gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleMoveUp(widgets.indexOf(w), e)}
                          disabled={widgets.indexOf(w) === 0}
                          className="h-5 w-5 text-slate-300 text-[9px]"
                          title="Move Widget Higher"
                        >
                          ▲
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleMoveDown(widgets.indexOf(w), e)}
                          disabled={widgets.indexOf(w) === widgets.length - 1}
                          className="h-5 w-5 text-slate-300 text-[9px]"
                          title="Move Widget Lower"
                        >
                          ▼
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  {w.enabled ? (
                    <div className="w-5 h-5 rounded bg-[#00FF41] text-black flex items-center justify-center font-bold">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border border-white/20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A0C16] border-t border-white/10 flex items-center justify-between text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-[#9499B3] hover:text-white"
          >
            <RotateCcw size={13} />
            <span>RESET TO DEFAULT</span>
          </Button>

          <Button
            onClick={onClose}
            className="font-bold bg-[#00FF41] text-black hover:bg-[#00cc34] shadow-[0_0_15px_rgba(0,255,65,0.4)]"
          >
            SAVE CONFIGURATION
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
