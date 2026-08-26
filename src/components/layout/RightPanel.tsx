"use client";

import { useState, useEffect } from "react";
import Clock from "@/components/widgets/Clock";
import FocusTimer from "@/components/widgets/FocusTimer";
import TodoList from "@/components/widgets/TodoList";
import Notes from "@/components/widgets/Notes";
import QuickLinks from "@/components/widgets/QuickLinks";
import { useAppStore } from "@/stores/useAppStore";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  Layers,
  Timer,
  CheckSquare,
  FileText,
  Compass,
  ChevronRight,
  ChevronLeft,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";

export type RightPanelTab = "all" | "focus" | "tasks" | "notes" | "warp";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("all");
  const { isRightPanelOpen, toggleRightPanel, setRightPanelOpen } = useAppStore();

  const tabs = [
    { id: "all", label: "DECK", icon: Layers, tooltip: "All Tactical Widgets" },
    { id: "focus", label: "FOCUS", icon: Timer, tooltip: "Chronometer & Focus Timer" },
    { id: "tasks", label: "TASKS", icon: CheckSquare, tooltip: "Action Directives" },
    { id: "notes", label: "NOTES", icon: FileText, tooltip: "Scratchpad Buffer" },
    { id: "warp", label: "WARP", icon: Compass, tooltip: "Quick Warp Links" },
  ];

  const handleTabClick = (tabId: RightPanelTab) => {
    cyberAudio.play("click");
    setActiveTab(tabId);
    if (!isRightPanelOpen) {
      setRightPanelOpen(true);
    }
  };

  const handleToggle = () => {
    cyberAudio.play("click");
    toggleRightPanel();
  };

  // If collapsed: Render sleek, compact vertical HUD rail (52px)
  if (!isRightPanelOpen) {
    return (
      <aside
        className="hidden xl:flex flex-col items-center py-4 px-1.5 overflow-y-auto shrink-0 transition-all duration-300 border-l border-white/10 fixed right-0 top-0 h-full z-30 select-none pb-10"
        style={{
          width: "52px",
          background: "rgba(8, 9, 15, 0.96)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Expand Trigger Button */}
        <button
          onClick={handleToggle}
          title="Expand Tactical Deck (Hotkey: Ctrl + \\)"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer mb-4 group shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="w-6 h-[1px] bg-white/10 mb-4" />

        {/* Mini Vertical Icon Tabs */}
        <div className="flex flex-col gap-2.5 w-full items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as RightPanelTab)}
                title={`${tab.label} — ${tab.tooltip}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={16} />
                {/* Floating tooltip */}
                <div className="absolute right-full mr-2.5 px-2 py-1 bg-[#0c0d18] border border-white/10 rounded-lg text-[10px] font-mono text-[#F1F3F9] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2">
          <span
            className="text-[9px] font-mono font-bold text-[#4F536E] uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            TACTICAL DECK
          </span>
        </div>
      </aside>
    );
  }

  // Expanded View (340px)
  return (
    <aside
      className="hidden xl:flex flex-col p-3.5 overflow-y-auto overscroll-contain shrink-0 transition-all duration-300 border-l border-white/10 fixed right-0 top-0 h-full z-30 box-border"
      style={{
        width: "340px",
        background: "rgba(8, 9, 15, 0.96)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top Header & Collapse Toggle */}
      <div className="flex items-center gap-1.5 mb-3 shrink-0">
        {/* Tab selector */}
        <div className="flex-1 flex items-center gap-1 p-1 bg-black/50 rounded-xl border border-white/5 text-[10px] font-mono">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as RightPanelTab)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                }`}
                title={tab.tooltip}
              >
                <Icon size={12} />
                <span className="hidden 2xl:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapse Button */}
        <button
          onClick={handleToggle}
          title="Collapse Tactical Deck (Hotkey: Ctrl + \\)"
          className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer shrink-0"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Widget Container — Full width, plenty of bottom padding for scroll clearance */}
      <div className="flex flex-col gap-3 w-full pb-24">
        {activeTab === "all" && (
          <>
            <div className="w-full"><Clock /></div>
            <div className="w-full"><FocusTimer /></div>
            <div className="w-full"><TodoList /></div>
            <div className="w-full"><Notes /></div>
            <div className="w-full"><QuickLinks /></div>
          </>
        )}

        {activeTab === "focus" && (
          <div className="space-y-3 animate-fade-in w-full">
            <Clock />
            <FocusTimer />
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-3 animate-fade-in w-full">
            <TodoList />
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3 animate-fade-in w-full">
            <Notes />
          </div>
        )}

        {activeTab === "warp" && (
          <div className="space-y-3 animate-fade-in w-full">
            <QuickLinks />
          </div>
        )}
      </div>
    </aside>
  );
}
