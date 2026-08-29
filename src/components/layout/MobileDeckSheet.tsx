"use client";

import { useState } from "react";
import {
  Layers,
  Timer,
  CheckSquare,
  FileText,
  Compass,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Clock from "@/components/widgets/Clock";
import FocusTimer from "@/components/widgets/FocusTimer";
import TodoList from "@/components/widgets/TodoList";
import Notes from "@/components/widgets/Notes";
import QuickLinks from "@/components/widgets/QuickLinks";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

interface MobileDeckSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "focus" | "tasks" | "notes" | "warp";

export default function MobileDeckSheet({ isOpen, onClose }: MobileDeckSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");

  const tabs = [
    { id: "tasks" as TabType, label: "TASKS", icon: CheckSquare },
    { id: "notes" as TabType, label: "NOTES", icon: FileText },
    { id: "focus" as TabType, label: "FOCUS", icon: Timer },
    { id: "warp" as TabType, label: "WARP", icon: Compass },
    { id: "all" as TabType, label: "ALL", icon: Layers },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] bg-[#0A0B14] border-t border-white/15 rounded-t-3xl p-0 flex flex-col font-mono text-xs shadow-[0_-10px_40px_rgba(0,0,0,0.9)]"
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 shrink-0" />

        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <SheetTitle className="text-sm font-mono font-black text-[#F1F3F9] tracking-wider text-left">
              TACTICAL DECK // WIDGETS
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Deck Tab Bar */}
        <div className="flex items-center gap-1 p-2 bg-black/50 border-b border-white/5 font-mono text-[11px] overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all cursor-pointer",
                  isActive
                    ? "bg-[#00FF41]/20 text-[#00FF41] font-bold border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                    : "text-[#9499B3] hover:text-white bg-white/[0.02] border border-transparent"
                )}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Widget Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          {activeTab === "tasks" && (
            <div className="animate-fade-in">
              <TodoList />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="animate-fade-in">
              <Notes />
            </div>
          )}

          {activeTab === "focus" && (
            <div className="space-y-4 animate-fade-in">
              <Clock />
              <FocusTimer />
            </div>
          )}

          {activeTab === "warp" && (
            <div className="animate-fade-in">
              <QuickLinks />
            </div>
          )}

          {activeTab === "all" && (
            <div className="space-y-4 animate-fade-in">
              <Clock />
              <FocusTimer />
              <TodoList />
              <Notes />
              <QuickLinks />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
