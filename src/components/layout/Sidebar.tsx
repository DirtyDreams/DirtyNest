"use client";

import React from "react";
import {
  LayoutDashboard,
  Bot,
  Cpu,
  Database,
  Wrench,
  Activity,
  Rss,
  Wifi,
  Calendar,
  Settings,
  Container,
  Radio,
  Waves,
  ScrollText,
  Users,
  Image as ImageIcon,
  Mic,
  Share2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";
import UserStatusPill from "@/components/auth/UserStatusPill";
import { cn } from "@/lib/utils";

export type NavViewId =
  | "dashboard"
  | "image_studio"
  | "sound_studio"
  | "social_media"
  | "zbiornik_ops"
  | "chatbot"
  | "nexus"
  | "control_room"
  | "agents"
  | "knowledge"
  | "docker"
  | "tools"
  | "stats"
  | "logs"
  | "settings"
  | "api"
  | "rss"
  | "calendar";

export interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  id: NavViewId;
  tag: string;
  isPrimaryView: boolean;
}

export interface NavCluster {
  id: string;
  label: string;
  code: string;
  items: NavItem[];
}

export interface SidebarProps {
  activeView: string;
  onSelectView: (view: NavViewId) => void;
  onOpenSettingsModal?: () => void;
}

export const navClusters: NavCluster[] = [
  {
    id: "ops",
    label: "Command & Ops",
    code: "OPS // 01",
    items: [
      { icon: LayoutDashboard, label: "Overview", id: "dashboard", tag: "MAIN", isPrimaryView: true },
      { icon: Radio, label: "Control Room", id: "control_room", tag: "CTRL", isPrimaryView: true },
      { icon: Waves, label: "Zbiornik Ops", id: "zbiornik_ops", tag: "ZB", isPrimaryView: true },
      { icon: Cpu, label: "AI Agents", id: "agents", tag: "AGY", isPrimaryView: true },
    ],
  },
  {
    id: "creative",
    label: "Creative Studio",
    code: "CREATIVE // 02",
    items: [
      { icon: ImageIcon, label: "Image Studio", id: "image_studio", tag: "IMG", isPrimaryView: true },
      { icon: Mic, label: "Sound Studio", id: "sound_studio", tag: "VOX", isPrimaryView: true },
      { icon: Share2, label: "Social Media", id: "social_media", tag: "SOC", isPrimaryView: true },
    ],
  },
  {
    id: "intel",
    label: "Vault & Intel",
    code: "INTEL // 03",
    items: [
      { icon: Bot, label: "Chatbot AI", id: "chatbot", tag: "AI", isPrimaryView: true },
      { icon: Users, label: "Persona Nexus", id: "nexus", tag: "RP", isPrimaryView: true },
      { icon: Database, label: "Knowledge Vault", id: "knowledge", tag: "DATA", isPrimaryView: true },
      { icon: Rss, label: "Cyber Intel Wire", id: "rss", tag: "02", isPrimaryView: false },
    ],
  },
  {
    id: "system",
    label: "System & Health",
    code: "SYSTEM // 04",
    items: [
      { icon: Container, label: "Docker Hub", id: "docker", tag: "DOCK", isPrimaryView: true },
      { icon: Wrench, label: "Tools Matrix", id: "tools", tag: "DEV", isPrimaryView: true },
      { icon: Activity, label: "Stats & Metrics", id: "stats", tag: "STAT", isPrimaryView: true },
      { icon: ScrollText, label: "System Logs", id: "logs", tag: "LOGS", isPrimaryView: true },
      { icon: Wifi, label: "API Health", id: "api", tag: "01", isPrimaryView: false },
      { icon: Calendar, label: "Schedule", id: "calendar", tag: "03", isPrimaryView: false },
    ],
  },
];

export const navItems: NavItem[] = navClusters.flatMap((cluster) => cluster.items);

export default function Sidebar({ activeView, onSelectView, onOpenSettingsModal }: SidebarProps) {
  const handleNavClick = (item: NavItem) => {
    try {
      cyberAudio.play("click");
    } catch {
      // Audio fallback
    }
    onSelectView(item.id);
  };

  const handleCommandTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      cyberAudio.play("warp");
    } catch {
      // Audio fallback
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-open-palette"));
    }
  };

  const handleSettingsClick = () => {
    try {
      cyberAudio.play("click");
    } catch {
      // Audio fallback
    }
    if (onOpenSettingsModal) {
      onOpenSettingsModal();
    }
    onSelectView("settings");
  };

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full z-40 group flex-col transition-all duration-300 select-none bg-[#08090F]/95 border-r border-white/[0.07] backdrop-blur-2xl w-[68px] hover:w-[240px]"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-white/5 shrink-0 overflow-hidden">
        <div
          onClick={() => handleNavClick(navItems[0])}
          className="flex items-center gap-3.5 cursor-pointer min-w-0"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(135deg, #00FF41 0%, #00cc34 60%, #BF40FF 100%)",
              boxShadow: "0 0 16px rgba(0,255,65,0.4)",
            }}
          >
            <div className="absolute inset-[1px] bg-[#07070B] rounded-[10px] flex items-center justify-center">
              <span
                className="text-xs font-black tracking-tighter font-mono text-[#00FF41]"
                style={{ textShadow: "0 0 8px rgba(0,255,65,0.8)" }}
              >
                DN
              </span>
            </div>
          </div>

          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden font-mono">
            <span
              className="text-sm font-extrabold tracking-wider text-[#00FF41]"
              style={{ textShadow: "0 0 10px rgba(0,255,65,0.5)" }}
            >
              DIRTYNEST
            </span>
            <span className="text-[10px] tracking-widest text-[#4F536E] uppercase">
              Tactical Node v2.5
            </span>
          </div>
        </div>

        {/* Quick Command trigger micro badge */}
        <button
          type="button"
          onClick={handleCommandTrigger}
          aria-label="Open Command Palette (⌘K / Ctrl+K)"
          title="Open Command Palette (⌘K / Ctrl+K)"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-1.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 hover:bg-[#00FF41]/15 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] text-[9px] font-mono cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>⌘K</span>
        </button>
      </div>

      {/* Nav List with Tactical Operational Clusters */}
      <div className="flex-1 py-2 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-none font-mono">
        {navClusters.map((cluster, clusterIdx) => (
          <div key={cluster.id} className="flex flex-col gap-0.5">
            {clusterIdx > 0 && <div className="my-1.5 border-t border-white/5 mx-2" />}

            {/* Subtle monospace cluster header (visible when expanded) */}
            <div className="font-mono text-[9px] text-muted-foreground/60 tracking-wider px-3 pt-1.5 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden select-none uppercase">
              {cluster.code}
            </div>

            {/* Cluster Items */}
            {cluster.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <Tooltip key={item.id} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Navigate to ${item.label}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleNavClick(item)}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(90deg, rgba(0,255,65,0.12) 0%, transparent 100%)",
                            }
                          : undefined
                      }
                      className={cn(
                        "relative flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 w-full text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00FF41] focus:outline-none",
                        isActive
                          ? "text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                          : "text-[#9499B3] hover:bg-white/[0.04] hover:text-[#F1F3F9] border border-transparent"
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          "shrink-0 transition-transform duration-200 group-hover/btn:scale-110",
                          isActive && "text-[#00FF41] drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]"
                        )}
                      />
                      <span className="text-xs font-semibold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1">
                        {item.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-mono px-1 py-0 bg-white/5 text-[#4F536E] border-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {item.tag}
                      </Badge>

                      {/* Distinct glowing active indicator notch */}
                      {isActive && (
                        <div
                          data-testid="active-notch"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-green shadow-[0_0_10px_var(--color-neon-green)]"
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[#090B14] border-white/10 text-xs font-mono text-[#F1F3F9] md:hidden"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Area: Operator Identity & System Settings */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2 shrink-0 font-mono">
        <UserStatusPill inSidebar={true} />

        <button
          onClick={handleSettingsClick}
          className={cn(
            "relative w-full flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00FF41] focus:outline-none",
            activeView === "settings"
              ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)] font-bold"
              : "bg-white/[0.03] hover:bg-white/[0.08] text-[#9499B3] hover:text-[#00FF41] border border-white/5"
          )}
          title="Open System Settings"
          aria-label="Open System Settings"
          aria-current={activeView === "settings" ? "page" : undefined}
          style={
            activeView === "settings"
              ? {
                  background:
                    "linear-gradient(90deg, rgba(0,255,65,0.12) 0%, transparent 100%)",
                }
              : undefined
          }
        >
          <Settings
            size={18}
            className={cn(
              "shrink-0 transition-transform group-hover/btn:scale-110",
              activeView === "settings" && "text-[#00FF41] drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]"
            )}
          />
          <span className="text-xs font-medium whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1">
            Settings
          </span>
          <Badge
            variant="outline"
            className="text-[8px] font-mono px-1 py-0 bg-white/5 text-[#4F536E] border-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          >
            SYS
          </Badge>

          {activeView === "settings" && (
            <div
              data-testid="active-notch"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-green shadow-[0_0_10px_var(--color-neon-green)]"
            />
          )}
        </button>
      </div>
    </aside>
  );
}
