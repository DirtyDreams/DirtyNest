"use client";

import { LayoutDashboard, Bot, Radio, Container, Layers, Menu } from "lucide-react";
import { NavViewId } from "./Sidebar";
import { cyberAudio } from "@/lib/cyberAudio";

interface MobileNavBarProps {
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  onOpenDeckSheet: () => void;
  onOpenDrawer: () => void;
}

export default function MobileNavBar({
  activeView,
  onSelectView,
  onOpenDeckSheet,
  onOpenDrawer,
}: MobileNavBarProps) {
  const handleNav = (view: NavViewId) => {
    onSelectView(view);
    try {
      cyberAudio.play("click");
    } catch {
      // ignore
    }
  };

  const navButtons = [
    { id: "dashboard" as NavViewId, label: "Overview", icon: LayoutDashboard },
    { id: "chatbot" as NavViewId, label: "Chatbot", icon: Bot },
    { id: "control_room" as NavViewId, label: "Control", icon: Radio },
    { id: "docker" as NavViewId, label: "Docker", icon: Container },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090F]/95 border-t border-white/10 backdrop-blur-2xl px-2 py-1.5 pb-safe flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
      aria-label="Mobile Navigation"
    >
      {navButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = activeView === btn.id;
        return (
          <button
            key={btn.id}
            type="button"
            onClick={() => handleNav(btn.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer touch-manipulation select-none ${
              isActive
                ? "text-[#00FF41]"
                : "text-[#9499B3] hover:text-[#F1F3F9] active:scale-95"
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all ${
                isActive
                  ? "bg-[#00FF41]/15 shadow-[0_0_12px_rgba(0,255,65,0.35)] border border-[#00FF41]/30"
                  : ""
              }`}
            >
              <Icon size={18} />
            </div>
            <span
              className={`text-[10px] font-mono mt-0.5 tracking-tight ${
                isActive ? "font-bold" : "font-normal"
              }`}
            >
              {btn.label}
            </span>
          </button>
        );
      })}

      {/* Tactical Deck Quick Trigger */}
      <button
        type="button"
        onClick={() => {
          cyberAudio.play("click");
          onOpenDeckSheet();
        }}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[#00F0FF] hover:text-white transition-all cursor-pointer touch-manipulation select-none active:scale-95"
        title="Open Tactical Deck (Tasks, Notes, Timer)"
      >
        <div className="p-1 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30">
          <Layers size={18} />
        </div>
        <span className="text-[10px] font-mono mt-0.5 tracking-tight font-medium">
          Deck
        </span>
      </button>

      {/* Full Menu / Drawer Trigger */}
      <button
        type="button"
        onClick={() => {
          cyberAudio.play("click");
          onOpenDrawer();
        }}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[#BF40FF] hover:text-white transition-all cursor-pointer touch-manipulation select-none active:scale-95"
        title="Open Full Navigation Menu"
      >
        <div className="p-1 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30">
          <Menu size={18} />
        </div>
        <span className="text-[10px] font-mono mt-0.5 tracking-tight font-medium">
          More
        </span>
      </button>
    </nav>
  );
}
