"use client";

import { useState, useEffect } from "react";
import {
  X,
  Layers,
  Timer,
  CheckSquare,
  FileText,
  Compass,
} from "lucide-react";
import Clock from "@/components/widgets/Clock";
import FocusTimer from "@/components/widgets/FocusTimer";
import TodoList from "@/components/widgets/TodoList";
import Notes from "@/components/widgets/Notes";
import QuickLinks from "@/components/widgets/QuickLinks";
import { cyberAudio } from "@/lib/cyberAudio";

interface MobileDeckSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "focus" | "tasks" | "notes" | "warp";

export default function MobileDeckSheet({ isOpen, onClose }: MobileDeckSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.body) {
        if (isOpen) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      }
    } catch {
      // ignore
    }
    return () => {
      try {
        if (typeof document !== "undefined" && document.body) {
          document.body.style.overflow = "auto";
        }
      } catch {
        // ignore
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: "tasks" as TabType, label: "TASKS", icon: CheckSquare },
    { id: "notes" as TabType, label: "NOTES", icon: FileText },
    { id: "focus" as TabType, label: "FOCUS", icon: Timer },
    { id: "warp" as TabType, label: "WARP", icon: Compass },
    { id: "all" as TabType, label: "ALL", icon: Layers },
  ];

  return (
    <div className="fixed inset-0 z-[55] md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={() => {
          cyberAudio.play("click");
          onClose();
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md z-0"
      />

      {/* Bottom Sheet Modal */}
      <div
        className="relative w-full max-h-[85vh] bg-[#0A0B14] border-t border-white/15 rounded-t-3xl flex flex-col z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] animate-fade-in"
        style={{
          boxShadow: "0 -8px 32px rgba(0,255,65,0.15)",
        }}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <span className="text-sm font-mono font-black text-[#F1F3F9] tracking-wider">
              TACTICAL DECK // WIDGETS
            </span>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

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
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00FF41]/20 text-[#00FF41] font-bold border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                    : "text-[#9499B3] hover:text-white bg-white/[0.02] border border-transparent"
                }`}
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
      </div>
    </div>
  );
}
