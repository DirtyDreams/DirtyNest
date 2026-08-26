"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  LayoutGrid,
  Bot,
  Cpu,
  Puzzle,
  Key,
  Database,
  Activity,
  Sparkles,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

// 8 Dedicated Modular Settings Tabs
import GeneralSettingsTab from "./settings/GeneralSettingsTab";
import WidgetsLayoutSettingsTab from "./settings/WidgetsLayoutSettingsTab";
import AiSettingsTab from "./settings/AiSettingsTab";
import AgentsSettingsTab from "./settings/AgentsSettingsTab";
import PluginsSettingsTab from "./settings/PluginsSettingsTab";
import ApiKeysSettingsTab from "./settings/ApiKeysSettingsTab";
import StorageSettingsTab from "./settings/StorageSettingsTab";
import SystemDiagnosticsTab from "./settings/SystemDiagnosticsTab";

export type SettingsSection =
  | "general"
  | "widgets"
  | "ai"
  | "agents"
  | "plugins"
  | "apikeys"
  | "storage"
  | "diagnostics";

interface TabItem {
  id: SettingsSection;
  label: string;
  icon: any;
  tag: string;
}

const TABS: TabItem[] = [
  { id: "general", label: "General & HUD", icon: Sliders, tag: "CORE" },
  { id: "widgets", label: "Widgets & HUD Layout", icon: LayoutGrid, tag: "BENTO" },
  { id: "ai", label: "AI & Chatbot", icon: Bot, tag: "NEURAL" },
  { id: "agents", label: "Agent Swarm", icon: Cpu, tag: "SWARM" },
  { id: "plugins", label: "Plugins & Extensions", icon: Puzzle, tag: "MCP" },
  { id: "apikeys", label: "API Keys & Mesh", icon: Key, tag: "AUTH" },
  { id: "storage", label: "Storage & Backup", icon: Database, tag: "SQL" },
  { id: "diagnostics", label: "Self-Diagnostics", icon: Activity, tag: "BENCH" },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsSection>("general");
  const toast = useToast();

  const handleTabChange = (tabId: SettingsSection) => {
    cyberAudio.play("click");
    setActiveTab(tabId);
  };

  const handleSaveAll = () => {
    cyberAudio.play("chime");
    toast.success("Settings Saved", "All system and subsystem parameters applied.");
  };

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
                System Configuration & Parameters
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                PROPER CONFIG MATRIX
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              DIRTYNEST v2.4.0 // MODULAR HARDWARE, AI, AGENT & STORAGE PREFERENCES
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)]"
          >
            <Sparkles size={14} />
            <span>SAVE ALL PARAMETERS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Vertical Sidebar + Right Dedicated Tab Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Left Vertical Section Selector */}
        <div className="lg:col-span-1 flex flex-col gap-1.5 p-2 rounded-2xl cyber-card bg-[#07070B]/90 border border-white/10">
          <div className="text-[10px] uppercase font-bold text-[#4F536E] px-3 py-2">
            Settings Categories (8 Modules)
          </div>

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] font-bold">
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Container */}
        <div className="lg:col-span-3 p-5 sm:p-6 rounded-2xl cyber-card bg-[#07070B]/90 border border-white/10">
          {activeTab === "general" && <GeneralSettingsTab />}
          {activeTab === "widgets" && <WidgetsLayoutSettingsTab />}
          {activeTab === "ai" && <AiSettingsTab />}
          {activeTab === "agents" && <AgentsSettingsTab />}
          {activeTab === "plugins" && <PluginsSettingsTab />}
          {activeTab === "apikeys" && <ApiKeysSettingsTab />}
          {activeTab === "storage" && <StorageSettingsTab />}
          {activeTab === "diagnostics" && <SystemDiagnosticsTab />}
        </div>
      </div>
    </div>
  );
}
