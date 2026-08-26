"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  LayoutDashboard,
  Brain,
  Bot,
  Users,
  Radio,
  Cpu,
  Database,
  Container,
  Wrench,
  Activity,
  ScrollText,
  Wifi,
  Rss,
  Calendar,
  Sliders,
  Puzzle,
  Sparkles,
  Search,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

// Dedicated Settings Tab Components
import DashboardSettingsTab from "./settings/DashboardSettingsTab";
import HermesSettingsTab from "./settings/HermesSettingsTab";
import ChatbotSettingsTab from "./settings/ChatbotSettingsTab";
import NexusSettingsTab from "./settings/NexusSettingsTab";
import ControlRoomSettingsTab from "./settings/ControlRoomSettingsTab";
import AgentsSettingsTab from "./settings/AgentsSettingsTab";
import KnowledgeSettingsTab from "./settings/KnowledgeSettingsTab";
import DockerSettingsTab from "./settings/DockerSettingsTab";
import ToolsSettingsTab from "./settings/ToolsSettingsTab";
import StatsSettingsTab from "./settings/StatsSettingsTab";
import LogsSettingsTab from "./settings/LogsSettingsTab";
import ApiHealthSettingsTab from "./settings/ApiHealthSettingsTab";
import RssSettingsTab from "./settings/RssSettingsTab";
import CalendarSettingsTab from "./settings/CalendarSettingsTab";
import CoreSystemSettingsTab from "./settings/CoreSystemSettingsTab";
import PluginsSettingsTab from "./settings/PluginsSettingsTab";
import SystemDiagnosticsTab from "./settings/SystemDiagnosticsTab";

export type SettingsTabId =
  | "dashboard"
  | "hermes"
  | "chatbot"
  | "nexus"
  | "control_room"
  | "agents"
  | "knowledge"
  | "docker"
  | "tools"
  | "stats"
  | "logs"
  | "api"
  | "rss"
  | "calendar"
  | "core"
  | "plugins"
  | "diagnostics";

interface SettingsTabDef {
  id: SettingsTabId;
  label: string;
  icon: any;
  tag: string;
  group: "PRIMARY VIEWS" | "TACTICAL FEEDS" | "CORE & PLATFORM";
}

const SETTINGS_TABS: SettingsTabDef[] = [
  // PRIMARY VIEWS
  { id: "dashboard", label: "Dashboard / Overview", icon: LayoutDashboard, tag: "BENTO", group: "PRIMARY VIEWS" },
  { id: "hermes", label: "Hermes Agent Engine", icon: Brain, tag: "100% BRAIN", group: "PRIMARY VIEWS" },
  { id: "chatbot", label: "Chatbot AI & Persona", icon: Bot, tag: "NEURAL", group: "PRIMARY VIEWS" },
  { id: "nexus", label: "Persona Nexus Studio", icon: Users, tag: "RP", group: "PRIMARY VIEWS" },
  { id: "control_room", label: "Control Room & Broadcast", icon: Radio, tag: "STREAM", group: "PRIMARY VIEWS" },
  { id: "agents", label: "AI Agents & Swarm", icon: Cpu, tag: "SWARM", group: "PRIMARY VIEWS" },
  { id: "knowledge", label: "Knowledge & Vector RAG", icon: Database, tag: "RAG", group: "PRIMARY VIEWS" },
  { id: "docker", label: "Docker Hub Daemon", icon: Container, tag: "CONTAINER", group: "PRIMARY VIEWS" },
  { id: "tools", label: "Tools Matrix & Syntax", icon: Wrench, tag: "WORKBENCH", group: "PRIMARY VIEWS" },
  { id: "stats", label: "Stats & Metrics Analytics", icon: Activity, tag: "TELEMETRY", group: "PRIMARY VIEWS" },
  { id: "logs", label: "System Logs & Audit", icon: ScrollText, tag: "AUDIT", group: "PRIMARY VIEWS" },

  // TACTICAL FEEDS
  { id: "api", label: "API Health & Vault", icon: Wifi, tag: "KEYS", group: "TACTICAL FEEDS" },
  { id: "rss", label: "Intel & Threat RSS Feeds", icon: Rss, tag: "INTEL", group: "TACTICAL FEEDS" },
  { id: "calendar", label: "Schedule & Calendar", icon: Calendar, tag: "CRON", group: "TACTICAL FEEDS" },

  // CORE & PLATFORM
  { id: "core", label: "Core HUD, Themes & Storage", icon: Sliders, tag: "SYSTEM", group: "CORE & PLATFORM" },
  { id: "plugins", label: "Plugins & MCP Marketplace", icon: Puzzle, tag: "EXTENSIONS", group: "CORE & PLATFORM" },
  { id: "diagnostics", label: "System Diagnostics & Bench", icon: Activity, tag: "HARDWARE", group: "CORE & PLATFORM" },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const handleTabChange = (tabId: SettingsTabId) => {
    cyberAudio.play("click");
    setActiveTab(tabId);
  };

  const handleSaveAll = () => {
    cyberAudio.play("chime");
    toast.success("Settings Saved", "All application view configurations synchronized.");
  };

  const filteredTabs = SETTINGS_TABS.filter((t) =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups: Array<"PRIMARY VIEWS" | "TACTICAL FEEDS" | "CORE & PLATFORM"> = [
    "PRIMARY VIEWS",
    "TACTICAL FEEDS",
    "CORE & PLATFORM",
  ];

  return (
    <div className="flex flex-col gap-5 font-mono animate-fade-in pb-12 select-none text-xs">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 cyber-card bg-[#07070B]/90 border border-white/10 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <SettingsIcon size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                Application & Tab Views Configuration
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                14 DEDICATED TAB SETTINGS
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              DIRTYNEST v2.4.0 // COMPLETE CONTROL OVER EVERY PRIMARY VIEW, FEED & CORE ENGINE
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)]"
        >
          <Sparkles size={14} />
          <span>SAVE ALL CONFIGURATIONS</span>
        </button>
      </div>

      {/* Main Grid: Left Settings Sidebar + Right Dedicated Tab View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-3 p-3 rounded-2xl cyber-card bg-[#07070B]/90 border border-white/10">
          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              name="settings_tab_search_query_no_autofill"
              id="settings_tab_search_query_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              placeholder="Filter tab settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4F536E] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grouped Tabs List */}
          <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {filteredTabs.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-black/30 border border-white/5 space-y-2">
                <div className="text-[11px] text-[#9499B3]">No matching tabs found</div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-bold cursor-pointer hover:bg-[#00FF41]/20"
                >
                  CLEAR SEARCH
                </button>
              </div>
            ) : (
              groups.map((grp) => {
                const groupTabs = filteredTabs.filter((t) => t.group === grp);
                if (groupTabs.length === 0) return null;

                return (
                  <div key={grp} className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-[#4F536E] px-2 py-1 tracking-wider">
                      {grp} ({groupTabs.length})
                    </div>

                    {groupTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                            isActive
                              ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                              : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={15} className="shrink-0" />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] font-bold uppercase shrink-0">
                            {tab.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Tab Content */}
        <div className="lg:col-span-3 p-5 sm:p-6 rounded-2xl cyber-card bg-[#07070B]/90 border border-white/10">
          {activeTab === "dashboard" && <DashboardSettingsTab />}
          {activeTab === "hermes" && <HermesSettingsTab />}
          {activeTab === "chatbot" && <ChatbotSettingsTab />}
          {activeTab === "nexus" && <NexusSettingsTab />}
          {activeTab === "control_room" && <ControlRoomSettingsTab />}
          {activeTab === "agents" && <AgentsSettingsTab />}
          {activeTab === "knowledge" && <KnowledgeSettingsTab />}
          {activeTab === "docker" && <DockerSettingsTab />}
          {activeTab === "tools" && <ToolsSettingsTab />}
          {activeTab === "stats" && <StatsSettingsTab />}
          {activeTab === "logs" && <LogsSettingsTab />}
          {activeTab === "api" && <ApiHealthSettingsTab />}
          {activeTab === "rss" && <RssSettingsTab />}
          {activeTab === "calendar" && <CalendarSettingsTab />}
          {activeTab === "core" && <CoreSystemSettingsTab />}
          {activeTab === "plugins" && <PluginsSettingsTab />}
          {activeTab === "diagnostics" && <SystemDiagnosticsTab />}
        </div>
      </div>
    </div>
  );
}
