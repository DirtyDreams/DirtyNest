"use client";

import { useState, useEffect } from "react";
import { Terminal, Shield, Activity, Radio, Cpu, Headphones } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";

export default function StatusBar({
  onToggleTerminal,
  isTerminalOpen,
}: {
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
}) {
  const { isRightPanelOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [isDroneOn, setIsDroneOn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 12);
      setFps(Math.floor(Math.random() * 3) + 59);
      setIsDroneOn(cyberAudio.getIsPlaying());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`hidden md:flex fixed bottom-0 left-[68px] ${isRightPanelOpen ? "xl:right-[340px]" : "xl:right-[52px]"} right-0 h-7 bg-[#07070B]/90 backdrop-blur-xl border-t border-white/5 z-20 px-4 items-center justify-between font-mono text-[10px] text-[#9499B3] transition-all duration-300`}>
      {/* Left: Node & Socket Telemetry */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41]" />
          <span className="text-[#F1F3F9] font-bold">DIRTYNEST MESH</span>
          <span className="text-[#4F536E]">::</span>
          <span className="text-[#4F536E]">127.0.0.1:3000</span>
        </div>

        <span className="text-[#4F536E] hidden md:inline">|</span>

        <div className="hidden md:flex items-center gap-1.5">
          <Radio size={11} className="text-[#00F0FF]" />
          <span>
            LATENCY: <span className="text-[#00F0FF]">{latency}ms</span>
          </span>
        </div>

        <span className="text-[#4F536E] hidden lg:inline">|</span>

        <div className="hidden lg:flex items-center gap-1.5">
          <Activity size={11} className="text-[#00FF41]" />
          <span>
            RENDER: <span className="text-[#00FF41]">{fps} FPS</span>
          </span>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-3">
        {/* Audio Drone Pill */}
        <button
          onClick={() => {
            const state = cyberAudio.toggleDrone();
            setIsDroneOn(state);
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
            isDroneOn
              ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40"
              : "hover:bg-white/5 text-[#9499B3]"
          }`}
        >
          <Headphones size={11} />
          <span>{isDroneOn ? "DRONE: ON" : "DRONE: OFF"}</span>
        </button>

        {/* Terminal Toggle Pill */}
        <button
          onClick={onToggleTerminal}
          className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
            isTerminalOpen
              ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
              : "hover:bg-white/5 text-[#9499B3] hover:text-[#00FF41]"
          }`}
        >
          <Terminal size={11} />
          <span>CLI [`]</span>
        </button>

        <span className="text-[#4F536E] hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-1 text-[#4F536E]">
          <Shield size={11} className="text-[#00FF41]" />
          <span>AIRGAP: SECURE</span>
        </div>
      </div>
    </footer>
  );
}
