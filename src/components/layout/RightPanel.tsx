"use client";

import { useState } from "react";
import Clock from "@/components/widgets/Clock";
import FocusTimer from "@/components/widgets/FocusTimer";
import TodoList from "@/components/widgets/TodoList";
import Notes from "@/components/widgets/Notes";
import QuickLinks from "@/components/widgets/QuickLinks";
import {
  Layers,
  Timer,
  CheckSquare,
  FileText,
  Compass,
  Clock as ClockIcon,
} from "lucide-react";

type RightPanelTab = "all" | "focus" | "tasks" | "notes" | "warp";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("all");

  const tabs = [
    { id: "all", label: "DECK", icon: Layers },
    { id: "focus", label: "FOCUS", icon: Timer },
    { id: "tasks", label: "TASKS", icon: CheckSquare },
    { id: "notes", label: "NOTES", icon: FileText },
    { id: "warp", label: "WARP", icon: Compass },
  ];

  return (
    <aside
      className="hidden xl:flex flex-col p-4 overflow-y-auto shrink-0 transition-all border-l border-white/5"
      style={{
        width: "350px",
        background: "rgba(8, 9, 15, 0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top Panel Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 mb-3.5 shrink-0 text-[10px] font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RightPanelTab)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Widget Container */}
      <div className="flex flex-col gap-3.5 flex-1">
        {activeTab === "all" && (
          <>
            <Clock />
            <FocusTimer />
            <TodoList />
            <Notes />
            <QuickLinks />
          </>
        )}

        {activeTab === "focus" && (
          <div className="space-y-3.5 animate-fade-in">
            <Clock />
            <FocusTimer />
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-3.5 animate-fade-in">
            <TodoList />
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3.5 animate-fade-in">
            <Notes />
          </div>
        )}

        {activeTab === "warp" && (
          <div className="space-y-3.5 animate-fade-in">
            <QuickLinks />
          </div>
        )}
      </div>
    </aside>
  );
}
