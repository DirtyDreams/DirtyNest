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
import { cyberAudio } from "@/lib/cyberAudio";

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
  { icon: Settings, label: "Settings", id: "settings" as NavViewId, tag: "SYS", isPrimaryView: true },
  { icon: Wifi, label: "API Health", id: "api" as NavViewId, tag: "01", isPrimaryView: false },
  { icon: Rss, label: "Intel Feed", id: "rss" as NavViewId, tag: "02", isPrimaryView: false },
  { icon: Calendar, label: "Schedule", id: "calendar" as NavViewId, tag: "03", isPrimaryView: false },
];

export default function Sidebar({ activeView, onSelectView, onOpenSettingsModal }: SidebarProps) {
  const handleNavClick = (item: (typeof navItems)[0]) => {
    cyberAudio.play("click");
    onSelectView(item.id);
  };

  const primaryItems = navItems.filter((i) => i.isPrimaryView);
  const secondaryItems = navItems.filter((i) => !i.isPrimaryView);

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full z-40 group flex-col transition-all duration-300 select-none"
      style={{
        width: "68px",
        background: "rgba(8, 9, 15, 0.94)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.width = "230px";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.width = "68px";
      }}
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
              className="text-xs font-black tracking-tighter"
              style={{
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                color: "#00FF41",
                textShadow: "0 0 8px rgba(0,255,65,0.8)",
              }}
            >
              DN
            </span>
          </div>
        </div>

        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
          <span
            className="text-sm font-extrabold tracking-wider"
            style={{
              fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
              color: "#00FF41",
              textShadow: "0 0 10px rgba(0,255,65,0.5)",
            }}
          >
            DIRTYNEST
          </span>
          <span
            className="text-[10px] tracking-widest text-[#4F536E] uppercase"
            style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}
          >
            Tactical Node v2.5
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* Primary View Decks */}
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleNavClick(item)}
              className="relative flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 w-full text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00FF41] focus:outline-none"
              style={{
                background: isActive ? "rgba(0,255,65,0.09)" : "transparent",
                color: isActive ? "#00FF41" : "#9499B3",
                border: isActive
                  ? "1px solid rgba(0,255,65,0.25)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#F1F3F9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#9499B3";
                }
              }}
            >
              <Icon
                size={18}
                className="shrink-0 transition-transform group-hover/btn:scale-110"
                style={{
                  color: isActive ? "#00FF41" : undefined,
                  filter: isActive
                    ? "drop-shadow(0 0 6px rgba(0,255,65,0.6))"
                    : "none",
                }}
              />
              <span
                className="text-xs font-medium whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1"
                style={{
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                }}
              >
                {item.label}
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {item.tag}
              </span>

              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r"
                  style={{
                    background: "#00FF41",
                    boxShadow: "0 0 10px rgba(0,255,65,0.8)",
                  }}
                />
              )}
            </button>
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
            <button
              key={item.id}
              type="button"
              aria-label={`Open telemetry view ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleNavClick(item)}
              className="relative flex items-center gap-3.5 px-3 py-1.5 rounded-xl transition-all duration-200 w-full text-left cursor-pointer touch-manipulation group/btn focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus:outline-none"
              style={{
                background: isActive ? "rgba(0,240,255,0.08)" : "transparent",
                color: isActive ? "#00F0FF" : "#9499B3",
                border: isActive
                  ? "1px solid rgba(0,240,255,0.2)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#F1F3F9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#9499B3";
                }
              }}
            >
              <Icon
                size={16}
                className="shrink-0 transition-transform group-hover/btn:scale-110"
              />
              <span
                className="text-xs font-normal whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1"
                style={{
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                }}
              >
                {item.label}
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {item.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Settings Action Footer */}
      <div className="p-3 border-t border-white/5 flex items-center justify-center shrink-0">
        <button
          onClick={() => {
            cyberAudio.play("click");
            if (onOpenSettingsModal) onOpenSettingsModal();
            else onSelectView("settings");
          }}
          className="w-full flex items-center justify-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer border border-white/5"
          title="Open System Settings"
        >
          <Settings size={17} />
          <span className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
            SETTINGS
          </span>
        </button>
      </div>
    </aside>
  );
}
