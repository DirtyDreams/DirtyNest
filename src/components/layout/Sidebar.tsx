"use client";

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

interface SidebarProps {
  activeView: string;
  onSelectView: (view: NavViewId) => void;
  onOpenSettingsModal?: () => void;
}

export const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "dashboard" as NavViewId, tag: "MAIN", isPrimaryView: true },
  { icon: ImageIcon, label: "Image Studio", id: "image_studio" as NavViewId, tag: "IMG", isPrimaryView: true },
  { icon: Mic, label: "Sound Studio", id: "sound_studio" as NavViewId, tag: "VOX", isPrimaryView: true },
  { icon: Share2, label: "Social Media", id: "social_media" as NavViewId, tag: "SOC", isPrimaryView: true },
  { icon: Bot, label: "Chatbot AI", id: "chatbot" as NavViewId, tag: "AI", isPrimaryView: true },
  { icon: Users, label: "Persona Nexus", id: "nexus" as NavViewId, tag: "RP", isPrimaryView: true },
  { icon: Radio, label: "Control Room", id: "control_room" as NavViewId, tag: "CTRL", isPrimaryView: true },
  { icon: Cpu, label: "AI Agents", id: "agents" as NavViewId, tag: "AGY", isPrimaryView: true },
  { icon: Database, label: "Knowledge", id: "knowledge" as NavViewId, tag: "DATA", isPrimaryView: true },
  { icon: Container, label: "Docker Hub", id: "docker" as NavViewId, tag: "DOCK", isPrimaryView: true },
  { icon: Wrench, label: "Tools Matrix", id: "tools" as NavViewId, tag: "DEV", isPrimaryView: true },
  { icon: Activity, label: "Stats & Metrics", id: "stats" as NavViewId, tag: "STAT", isPrimaryView: true },
  { icon: ScrollText, label: "System Logs", id: "logs" as NavViewId, tag: "LOGS", isPrimaryView: true },
  { icon: Wifi, label: "API Health", id: "api" as NavViewId, tag: "01", isPrimaryView: false },
  { icon: Rss, label: "Intel Feed", id: "rss" as NavViewId, tag: "02", isPrimaryView: false },
  { icon: Calendar, label: "Schedule", id: "calendar" as NavViewId, tag: "03", isPrimaryView: false },
];

export default function Sidebar({ activeView, onSelectView }: SidebarProps) {
  const handleNavClick = (item: (typeof navItems)[0]) => {
    cyberAudio.play("click");
    onSelectView(item.id);
  };

  const primaryItems = navItems.filter((i) => i.isPrimaryView);
  const secondaryItems = navItems.filter((i) => !i.isPrimaryView);

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full z-40 group flex-col transition-all duration-300 select-none bg-[#08090F]/95 border-r border-white/[0.07] backdrop-blur-2xl w-[68px] hover:w-[230px]"
    >
      {/* Brand Header */}
      <div
        onClick={() => handleNavClick(navItems[0])}
        className="flex items-center h-18 px-4 gap-3.5 border-b border-white/5 shrink-0 overflow-hidden cursor-pointer"
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

      {/* Nav List */}
      <div className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-none font-mono">
        {/* Primary View Decks */}
        {primaryItems.map((item) => {
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
                  className={cn(
                    "relative flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 w-full text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00FF41] focus:outline-none",
                    isActive
                      ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
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

                  {/* Active Glow Pill Indicator */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.8)]"
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#090B14] border-white/10 text-xs font-mono text-[#F1F3F9] md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Separator */}
        <div className="my-2 border-t border-white/5 mx-2" />

        <div className="text-[9px] font-mono tracking-widest uppercase text-[#4F536E] px-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Telemetry & Intel
        </div>

        {/* Telemetry sub-widgets: API Health, Intel Feed, Schedule */}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <Tooltip key={item.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Open telemetry view ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "relative flex items-center gap-3.5 px-3 py-1.5 rounded-xl transition-all duration-200 w-full text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus:outline-none",
                    isActive
                      ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30"
                      : "text-[#9499B3] hover:bg-white/[0.04] hover:text-[#F1F3F9] border border-transparent"
                  )}
                >
                  <Icon
                    size={16}
                    className="shrink-0 transition-transform group-hover/btn:scale-110"
                  />
                  <span className="text-xs font-normal whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1">
                    {item.label}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-mono px-1 py-0 bg-white/5 text-[#4F536E] border-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {item.tag}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#090B14] border-white/10 text-xs font-mono text-[#F1F3F9] md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Footer Area: Operator Identity & System Settings */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2 shrink-0 font-mono">
        <UserStatusPill inSidebar={true} />

        <button
          onClick={() => {
            cyberAudio.play("click");
            onSelectView("settings");
          }}
          className={cn(
            "relative w-full flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00FF41] focus:outline-none",
            activeView === "settings"
              ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)] font-bold"
              : "bg-white/[0.03] hover:bg-white/[0.08] text-[#9499B3] hover:text-[#00FF41] border border-white/5"
          )}
          title="Open System Settings"
          aria-label="Open System Settings"
          aria-current={activeView === "settings" ? "page" : undefined}
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
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.8)]" />
          )}
        </button>
      </div>
    </aside>
  );
}
