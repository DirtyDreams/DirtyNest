"use client";

import {
  Terminal,
  Headphones,
  Wrench,
  Sliders,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { navItems, NavViewId } from "./Sidebar";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  onOpenSettingsModal: () => void;
  onOpenDevTools: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  isDronePlaying: boolean;
  onToggleDrone: () => void;
  uptimeText: string;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onOpenDevTools,
  onToggleTerminal,
  isTerminalOpen,
  isDronePlaying,
  onToggleDrone,
  uptimeText,
}: MobileDrawerProps) {
  const handleItemClick = (item: (typeof navItems)[0]) => {
    onSelectView(item.id);
    onClose();
    try {
      cyberAudio.play("click");
    } catch {
      // ignore
    }
  };

  const primaryItems = navItems.filter((i) => i.isPrimaryView);
  const secondaryItems = navItems.filter((i) => !i.isPrimaryView);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-4/5 max-w-xs bg-[#08090F] border-r border-white/10 p-0 flex flex-col font-mono text-xs shadow-[0_0_50px_rgba(0,0,0,0.9)]"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10 space-y-0 text-left">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #00FF41 0%, #BF40FF 100%)",
                boxShadow: "0 0 12px rgba(0,255,65,0.4)",
              }}
            >
              <div className="w-7 h-7 bg-[#07070B] rounded-md flex items-center justify-center">
                <span className="text-xs font-mono font-black text-[#00FF41]">DN</span>
              </div>
            </div>
            <div>
              <SheetTitle className="text-sm font-extrabold font-mono text-[#00FF41] tracking-wider text-left">
                DIRTYNEST
              </SheetTitle>
              <div className="text-[9px] font-mono text-[#4F536E] uppercase">
                Mobile Node v0.01
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Tools Bar */}
        <div className="p-3 border-b border-white/5 grid grid-cols-4 gap-1.5 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              onToggleTerminal();
              onClose();
            }}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer touch-manipulation",
              isTerminalOpen
                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#00FF41]"
            )}
          >
            <Terminal size={13} className="mb-1" />
            <span>CLI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              onToggleDrone();
            }}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer touch-manipulation",
              isDronePlaying
                ? "bg-[#BF40FF]/25 text-[#BF40FF] border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.3)]"
                : "bg-white/[0.03] border-white/10 text-[#9499B3] hover:text-[#BF40FF]"
            )}
          >
            <Headphones size={13} className="mb-1" />
            <span>{isDronePlaying ? "Drone" : "Mute"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              onOpenDevTools();
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#9499B3] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all cursor-pointer touch-manipulation"
          >
            <Wrench size={13} className="mb-1" />
            <span>DevTools</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              window.dispatchEvent(new CustomEvent("dirtynest-open-theme-studio"));
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-all cursor-pointer touch-manipulation"
          >
            <Sliders size={13} className="mb-1" />
            <span>Themes</span>
          </button>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none font-mono">
          <div className="text-[10px] tracking-wider uppercase text-[#4F536E] px-2 py-1">
            Primary Decks
          </div>
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer touch-manipulation",
                  isActive
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/5 text-[#4F536E] border-transparent">
                  {item.tag}
                </Badge>
              </button>
            );
          })}

          <div className="pt-2 pb-1 text-[10px] tracking-wider uppercase text-[#4F536E] px-2">
            Telemetry & Feeds
          </div>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer touch-manipulation",
                  isActive
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={15} />
                  <span>{item.label}</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/5 text-[#4F536E] border-transparent">
                  {item.tag}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-black/40 font-mono text-[10px] text-[#4F536E] flex items-center justify-between">
          <span>UPTIME: <span className="text-[#00F0FF]">{uptimeText}</span></span>
          <span className="text-[#00FF41]">● SECURE</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
