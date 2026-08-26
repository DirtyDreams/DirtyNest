"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  Check,
  RotateCcw,
  LayoutDashboard,
  Cpu,
  Boxes,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  Rss,
  Wifi,
  GitBranch,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  gridSpan: "full" | "half" | "third";
  category: "SYSTEM" | "AI & AGENTS" | "NETWORK & DEV";
}

export type DashboardPreset = "tactical_sre" | "ai_researcher" | "cyber_ops" | "developer_docker" | "minimalist" | "custom";

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: "system_stats", name: "System Telemetry & Resource Monitor", description: "CPU, Memory, Disk, and eBPF Daemon load metrics", icon: Cpu, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "github_activity", name: "GitHub Repository Commit Matrix", description: "Recent commits, PRs, and branch activities", icon: GitBranch, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "api_health", name: "API & Microservice Health Probes", description: "Status of SQLite-Vec, Auth Proxy, and Redis mesh", icon: Wifi, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "rss_feed", name: "Cyber Threat & Intel RSS Feed", description: "Real-time vulnerability advisories & CVE updates", icon: Rss, enabled: true, gridSpan: "half", category: "NETWORK & DEV" },
  { id: "calendar", name: "Operations & Deployment Calendar", description: "Scheduled cron jobs, maintenance windows, and sprints", icon: Calendar, enabled: true, gridSpan: "full", category: "SYSTEM" },
  { id: "docker_quick", name: "Docker Container Quick Status", description: "Active container lifecycle & memory pulse", icon: Boxes, enabled: true, gridSpan: "half", category: "SYSTEM" },
  { id: "hermes_quick", name: "Hermes Agent Live Cognitive Feed", description: "Real-time thought stream & tool clearance alerts", icon: Radio, enabled: true, gridSpan: "half", category: "AI & AGENTS" },
  { id: "cost_tracker", name: "AI Swarm Inference Cost Matrix", description: "Real-time token burn and provider spend meter", icon: DollarSign, enabled: true, gridSpan: "half", category: "AI & AGENTS" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLayoutChange?: (widgets: DashboardWidgetConfig[]) => void;
}

export default function DashboardCustomizeModal({ isOpen, onClose, onLayoutChange }: Props) {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [selectedPreset, setSelectedPreset] = useState<DashboardPreset>("tactical_sre");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_dashboard_layout");
      if (saved) {
        setWidgets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const saveLayout = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem("dirtynest_dashboard_layout", JSON.stringify(newWidgets));
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

  const applyPreset = (preset: DashboardPreset) => {
    cyberAudio.play("chime");
    setSelectedPreset(preset);
    let updated = [...DEFAULT_WIDGETS];

    if (preset === "tactical_sre") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["system_stats", "api_health", "docker_quick", "calendar"].includes(w.id),
      }));
    } else if (preset === "ai_researcher") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["hermes_quick", "cost_tracker", "rss_feed", "system_stats"].includes(w.id),
      }));
    } else if (preset === "cyber_ops") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["rss_feed", "api_health", "system_stats", "hermes_quick"].includes(w.id),
      }));
    } else if (preset === "developer_docker") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["docker_quick", "github_activity", "system_stats", "api_health"].includes(w.id),
      }));
    } else if (preset === "minimalist") {
      updated = updated.map((w) => ({
        ...w,
        enabled: ["system_stats", "api_health"].includes(w.id),
      }));
    }

    saveLayout(updated);
  };

  const handleResetDefaults = () => {
    cyberAudio.play("click");
    setSelectedPreset("tactical_sre");
    saveLayout(DEFAULT_WIDGETS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col cyber-card p-4 sm:p-6 gap-4 sm:gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-[#00FF41]/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders size={20} className="text-[#00FF41]" />
            <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
              CUSTOMIZE DASHBOARD // <span className="text-[#00FF41]">MODULAR LAYOUT</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-xs text-[#4F536E] hover:text-[#F1F3F9] px-2 py-1 rounded bg-white/5 cursor-pointer">
            ESC
          </button>
        </div>

        {/* PRESET TEMPLATES */}
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">One-Click Layout Presets:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "tactical_sre" as DashboardPreset, label: "TACTICAL SRE" },
              { id: "ai_researcher" as DashboardPreset, label: "AI RESEARCHER" },
              { id: "cyber_ops" as DashboardPreset, label: "CYBER OPS" },
              { id: "developer_docker" as DashboardPreset, label: "DOCKER DEV" },
              { id: "minimalist" as DashboardPreset, label: "MINIMALIST" },
              { id: "custom" as DashboardPreset, label: "CUSTOM GRID" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border ${
                  selectedPreset === p.id
                    ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 border-white/5 text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* WIDGET TOGGLES LIST */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold shrink-0">Dashboard Widgets Matrix ({widgets.filter((w) => w.enabled).length} Active):</span>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    widget.enabled
                      ? "bg-[#00FF41]/[0.06] border-[#00FF41]/40"
                      : "bg-black/30 border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${widget.enabled ? "bg-[#00FF41]/20 text-[#00FF41]" : "bg-white/5 text-[#9499B3]"}`}>
                      <Icon size={16} />
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${widget.enabled ? "text-[#F1F3F9]" : "text-[#9499B3]"}`}>
                        {widget.name}
                      </span>
                      <span className="text-[10px] text-[#4F536E]">{widget.description}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {widget.enabled ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#00FF41] font-bold">
                        <Eye size={14} />
                        VISIBLE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-[#4F536E]">
                        <EyeOff size={14} />
                        HIDDEN
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#9499B3] hover:text-[#FF2A6D] transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>RESET DEFAULTS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("chime");
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
