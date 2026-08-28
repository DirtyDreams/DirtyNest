"use client";

import { useState, useEffect } from "react";
import { Terminal, Shield, Activity, Radio, Headphones, Keyboard, Atom } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import { Marquee } from "@/components/ui/animated/marquee";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function StatusBar({
  onToggleTerminal,
  isTerminalOpen,
}: {
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
}) {
  const { isRightPanelOpen, isDronePlaying, toggleAudioMixer, fxConfig, setFxConfig } = useAppStore();
  const [_mounted, setMounted] = useState(false);
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [isFxPopoverOpen, setIsFxPopoverOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 12);
      setFps(Math.floor(Math.random() * 3) + 59);
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

      {/* Center: Live Telemetry Marquee */}
      <div className="hidden xl:flex items-center flex-1 max-w-md mx-4 overflow-hidden border-x border-white/5 px-2">
        <Marquee duration={35} pauseOnHover className="py-0 text-[10px] text-[#4F536E]">
          <span className="flex items-center gap-2 mr-6 text-[#9499B3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
            HERMES AI CORE: <strong className="text-[#00FF41]">ONLINE</strong>
          </span>
          <span className="flex items-center gap-2 mr-6 text-[#9499B3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            TURBOPACK v2: <strong className="text-[#00F0FF]">ACTIVE</strong>
          </span>
          <span className="flex items-center gap-2 mr-6 text-[#9499B3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BF40FF]" />
            VECTOR RAG VAULT: <strong className="text-[#BF40FF]">SYNCED</strong>
          </span>
        </Marquee>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-3">
        {/* FX Canvas Controller Popover */}
        <Popover open={isFxPopoverOpen} onOpenChange={setIsFxPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={() => cyberAudio.play("click")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                fxConfig.backgroundFx !== "none"
                  ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)] font-bold"
                  : "hover:bg-white/5 text-[#9499B3]"
              }`}
              title="Interactive Canvas FX & Particle Mesh Controller"
            >
              <Atom size={11} className={fxConfig.backgroundFx !== "none" ? "animate-spin text-[#00FF41]" : ""} style={{ animationDuration: "8s" }} />
              <span>FX: {fxConfig.backgroundFx === "none" ? "OFF" : fxConfig.backgroundFx === "tunnel" ? "3D TUNNEL" : "PARTICLES"}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-72 bg-[#090A14] border-white/10 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F1F3F9]">
                  <Atom size={13} className="text-[#00FF41]" />
                  <span>CANVAS FX & 3D TUNNEL</span>
                </div>
                <Badge
                  variant={fxConfig.backgroundFx !== "none" ? "default" : "secondary"}
                  className={fxConfig.backgroundFx !== "none" ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30" : ""}
                >
                  {fxConfig.backgroundFx === "tunnel" ? "3D TUNNEL" : fxConfig.backgroundFx === "particles" ? "PARTICLES" : "OFF"}
                </Badge>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#4F536E] font-bold uppercase">FX Engine Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "particles", label: "Particles" },
                    { id: "tunnel", label: "3D Tunnel" },
                    { id: "none", label: "Disabled" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        cyberAudio.play("click");
                        setFxConfig({ backgroundFx: mode.id as any });
                      }}
                      className={`py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        fxConfig.backgroundFx === mode.id
                          ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                          : "bg-white/5 text-[#9499B3] border-white/5 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#4F536E] font-bold uppercase">Color Spectrum</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "adaptive", label: "Auto", color: "text-[#00FF41]" },
                    { id: "green", label: "Green", color: "text-[#00FF41]" },
                    { id: "cyan", label: "Cyan", color: "text-[#00F0FF]" },
                    { id: "purple", label: "Purple", color: "text-[#BF40FF]" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        cyberAudio.play("click");
                        setFxConfig({ particleColorMode: m.id as any });
                      }}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                        fxConfig.particleColorMode === m.id
                          ? "bg-white/10 border-[#00FF41] text-white"
                          : "bg-black/40 border-white/5 text-[#9499B3] hover:text-white"
                      }`}
                    >
                      <span className={m.color}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interaction Mode */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#4F536E] font-bold uppercase">Mouse Interaction</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "repulse", label: "Repulse" },
                    { id: "attract", label: "Attract" },
                    { id: "none", label: "Off" },
                  ].map((im) => (
                    <button
                      key={im.id}
                      onClick={() => {
                        cyberAudio.play("click");
                        setFxConfig({ particleInteraction: im.id as any });
                      }}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                        fxConfig.particleInteraction === im.id
                          ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]"
                          : "bg-black/40 border-white/5 text-[#9499B3] hover:text-white"
                      }`}
                    >
                      {im.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Count Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#9499B3]">Particle Count</span>
                  <span className="text-[#00FF41] font-bold">{fxConfig.particleCount}</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={120}
                  step={5}
                  value={fxConfig.particleCount}
                  onChange={(e) => setFxConfig({ particleCount: Number(e.target.value) })}
                  className="accent-[#00FF41] cursor-pointer h-1.5 bg-black rounded-lg"
                />
              </div>

              {/* Speed Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#9499B3]">Drift Speed</span>
                  <span className="text-[#00F0FF] font-bold">{fxConfig.particleSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  value={fxConfig.particleSpeed}
                  onChange={(e) => setFxConfig({ particleSpeed: Number(e.target.value) })}
                  className="accent-[#00F0FF] cursor-pointer h-1.5 bg-black rounded-lg"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Audio Ambient Pill */}
        <button
          onClick={() => {
            cyberAudio.play("click");
            toggleAudioMixer();
          }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
            isDronePlaying
              ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.3)]"
              : "hover:bg-white/5 text-[#9499B3]"
          }`}
          title="Open Cyber Audio Matrix & Ambient Soundboard"
        >
          <Headphones size={11} className={isDronePlaying ? "animate-pulse" : ""} />
          <span>{isDronePlaying ? "AUDIO: ACTIVE" : "AUDIO: MUTE"}</span>
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

        {/* Keyboard Hotkey HUD Pill */}
        <button
          onClick={() => {
            cyberAudio.play("warp");
            window.dispatchEvent(new CustomEvent("dirtynest-toggle-hotkeys"));
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer hover:bg-white/5 text-[#9499B3] hover:text-[#00F0FF] transition-colors"
          title="Open Keyboard Macro & Hotkey Studio HUD (? / Shift+?)"
        >
          <Keyboard size={11} />
          <span>KEYS [?]</span>
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
