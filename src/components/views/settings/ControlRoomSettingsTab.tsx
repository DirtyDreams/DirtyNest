"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Radio,
  Sparkles,
  Tv,
  Volume2,
  Layers,
  Activity,
  HardDrive,
} from "lucide-react";
=======
import { Radio, Sparkles, Tv, Volume2, Layers, Activity, HardDrive } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function ControlRoomSettingsTab() {
  const toast = useToast();
  const [streamBitrate, setStreamBitrate] = useState("6000");
  const [latencyBuffer, setLatencyBuffer] = useState("ultra-low");
  const [hudDensity, setHudDensity] = useState("tactical");
  const [autoRecordSession, setAutoRecordSession] = useState(false);
  const [audioRouting, setAudioRouting] = useState({
    master: true,
    agentTts: true,
    synthBgm: true,
    sfx: true,
  });

  useEffect(() => {
    try {
      const savedBitrate = localStorage.getItem("dirtynest_ctrl_bitrate");
      if (savedBitrate) setStreamBitrate(savedBitrate);
      const savedLatency = localStorage.getItem("dirtynest_ctrl_latency");
      if (savedLatency) setLatencyBuffer(savedLatency);
      const savedHud = localStorage.getItem("dirtynest_ctrl_hud");
      if (savedHud) setHudDensity(savedHud);
      const savedRec = localStorage.getItem("dirtynest_ctrl_autorecord");
      if (savedRec) setAutoRecordSession(savedRec === "true");
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_ctrl_bitrate", streamBitrate);
      localStorage.setItem("dirtynest_ctrl_latency", latencyBuffer);
      localStorage.setItem("dirtynest_ctrl_hud", hudDensity);
      localStorage.setItem("dirtynest_ctrl_autorecord", String(autoRecordSession));
    } catch {}
    toast.success("Control Room Parameters Saved", "Broadcast and audio matrix configured.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
            <Radio size={16} />
            <span>Control Room & Broadcast Production Matrix</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure stream bitrates, multi-track audio routing, telemetry HUD overlays & session recorders
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00c8d6] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE CONTROL ROOM</span>
        </button>
      </div>

      {/* Bitrate & Latency Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Tv size={13} className="text-[#00F0FF]" />
            <span>Target Broadcast Bitrate</span>
          </label>
          <select
            value={streamBitrate}
            onChange={(e) => setStreamBitrate(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="3500">3,500 kbps (1080p 30fps Standard)</option>
            <option value="6000">6,000 kbps (1080p 60fps High)</option>
            <option value="8500">8,500 kbps (1440p 60fps Ultra)</option>
            <option value="15000">15,000 kbps (4K 60fps Master)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Target streaming encoder bitrate</span>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Activity size={13} className="text-[#00FF41]" />
            <span>Telemetry Latency Mode</span>
          </label>
          <select
            value={latencyBuffer}
            onChange={(e) => setLatencyBuffer(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="ultra-low">Ultra-Low (~50ms Real-Time)</option>
            <option value="balanced">Balanced (~250ms Smooth)</option>
            <option value="deep-buffer">Deep Buffer (~1.5s High Stability)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Buffer window for agent telemetry</span>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Layers size={13} className="text-[#BF40FF]" />
            <span>HUD Overlay Density</span>
          </label>
          <select
            value={hudDensity}
            onChange={(e) => setHudDensity(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="minimal">Minimalist (Clean Screen)</option>
            <option value="tactical">Tactical (Essential Telemetry)</option>
            <option value="cyberdeck">Cyberdeck Overload (All Telemetry)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Broadcast viewport overlay density</span>
        </div>
      </div>

      {/* Multi-Channel Audio Matrix */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <Volume2 size={14} className="text-[#00FF41]" />
          <span>4-Channel Broadcast Audio Mixing Bus</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {([
            { id: "master", name: "CH 1: Master Mix", color: "#00FF41" },
            { id: "agentTts", name: "CH 2: Agent TTS Voice", color: "#00F0FF" },
            { id: "synthBgm", name: "CH 3: Synthwave BGM", color: "#BF40FF" },
            { id: "sfx", name: "CH 4: Cyber SFX & Clues", color: "#FFE600" },
          ] as const).map((ch) => {
            const isEnabled = audioRouting[ch.id];
            return (
              <div
                key={ch.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setAudioRouting((p) => ({ ...p, [ch.id]: !p[ch.id] }));
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isEnabled
                    ? "bg-[#090A14] border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                    : "bg-black/40 border-white/5 opacity-50"
                }`}
              >
                <span className="font-bold text-[11px] text-[#F1F3F9] truncate">{ch.name}</span>
                <span
                  className="text-[9px] font-bold uppercase"
                  style={{ color: isEnabled ? ch.color : "#4F536E" }}
                >
                  {isEnabled ? "ACTIVE ROUTE" : "MUTED"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Record Session */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs text-[#F1F3F9] uppercase">
            <HardDrive size={14} className="text-[#00FF41]" />
            <span>Automatic Session Dump Recorder</span>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Auto-export timestamped broadcast audio and telemetry metrics to local disk
          </p>
        </div>

        <button
          onClick={() => {
            cyberAudio.play("click");
            setAutoRecordSession(!autoRecordSession);
          }}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            autoRecordSession
              ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
              : "bg-white/5 text-[#9499B3] border border-white/10"
          }`}
        >
          {autoRecordSession ? "ENABLED" : "DISABLED"}
        </button>
      </div>
    </div>
  );
}
