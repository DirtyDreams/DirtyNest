"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Radio,
  Zap,
  Activity,
  Tv,
  ShieldAlert,
} from "lucide-react";
=======
import { Radio, Zap, Activity, Tv, ShieldAlert } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

export default function MultiFeedCyberStreamGrid() {
  const [activeFeed, setActiveFeed] = useState<number | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [tickerMessage, setTickerMessage] = useState(
    "LIVE TELEMETRY // EDGE NODE RECONNAISSANCE PROTOCOL 0x4B ACTIVE // LATENCY 14MS // ALL MESH CITADELS OPERATIONAL"
  );
  const [isRecording, setIsRecording] = useState(true);

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              TACTICAL BROADCAST COCKPIT // <span className="text-rose-400">4-CHANNEL CYBER STREAM</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Live multi-angle telemetry matrix, satellite mesh reconnaissance & broadcast overlays
            </span>
          </div>
        </div>

        {/* Overlay Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowWatermark(!showWatermark);
            }}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
              showWatermark
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(255,42,109,0.2)]"
                : "bg-white/5 text-slate-400 border-white/10"
            }`}
          >
            WATERMARK
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowScanlines(!showScanlines);
            }}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
              showScanlines
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                : "bg-white/5 text-slate-400 border-white/10"
            }`}
          >
            SCANLINES
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsRecording(!isRecording);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
              isRecording
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                : "bg-white/5 text-slate-400 border-white/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isRecording ? "REC [LIVE]" : "STANDBY"}</span>
          </button>
        </div>
      </div>

      {/* 4-Channel Stream Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Feed 1: Satellite Mesh Recon */}
        <div className="relative h-44 bg-black/80 rounded-xl border border-cyan-500/30 overflow-hidden flex flex-col justify-between p-3 group">
          {showScanlines && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
          )}

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9px] font-bold">
              <Radio className="w-3 h-3 animate-spin" />
              <span>FEED 01 // SAT-MESH UPLINK</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">1080p 60FPS</span>
          </div>

          {/* Animated Radar Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-32 h-32 rounded-full border border-cyan-400/50 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full border border-cyan-400/80" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-400" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 z-10">
            <span className="text-cyan-400 font-bold">ORBIT: 48.8566° N, 2.3522° E</span>
            <span className="text-emerald-400">SIG 99.4%</span>
          </div>
        </div>

        {/* Feed 2: Neural Heatmap Stream */}
        <div className="relative h-44 bg-black/80 rounded-xl border border-purple-500/30 overflow-hidden flex flex-col justify-between p-3 group">
          {showScanlines && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
          )}

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-bold">
              <Zap className="w-3 h-3" />
              <span>FEED 02 // NEURAL INFERENCE DYNAMICS</span>
            </div>
            <span className="text-[9px] text-purple-400 font-bold">RTX 4090 (68°C)</span>
          </div>

          {/* Neural Gradient Waves */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-full h-16 bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 blur-xl animate-pulse" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 z-10">
            <span className="text-purple-400 font-bold">BATCH SIZE: 64 · FP16 KV-CACHE</span>
            <span className="text-emerald-400">112 TOK/S</span>
          </div>
        </div>

        {/* Feed 3: Edge Container Oscilloscope */}
        <div className="relative h-44 bg-black/80 rounded-xl border border-emerald-500/30 overflow-hidden flex flex-col justify-between p-3 group">
          {showScanlines && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
          )}

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
              <Activity className="w-3 h-3" />
              <span>FEED 03 // DOCKER DAEMON WAVEFORM</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-bold">7 CONTAINERS</span>
          </div>

          {/* Simulated Waveform SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 opacity-40">
            <svg className="w-full h-16" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M0,12 Q10,2 20,12 T40,12 T60,20 T80,5 T100,12"
                fill="none"
                stroke="#00FF41"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 z-10">
            <span className="text-emerald-400 font-bold">RAM: 4.8 / 32 GB (15%)</span>
            <span className="text-[#00FF41]">ALL HEALTHY</span>
          </div>
        </div>

        {/* Feed 4: Threat Intercept Hex Ticker */}
        <div className="relative h-44 bg-black/80 rounded-xl border border-amber-500/30 overflow-hidden flex flex-col justify-between p-3 group">
          {showScanlines && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
          )}

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
              <ShieldAlert className="w-3 h-3" />
              <span>FEED 04 // PACKET HEURISTICS</span>
            </div>
            <span className="text-[9px] text-amber-400 font-bold">SURICATA IDS</span>
          </div>

          <div className="text-[10px] font-mono text-amber-300/80 leading-relaxed overflow-hidden">
            0x7FFF8A42: 48 89 E5 48 83 EC 20 48 8D 05 32 0F 00 00 [TLS 1.3 CLIENT HELLO]<br />
            0x7FFF8A50: B8 01 00 00 00 0F 05 48 3D 00 F0 FF FF 77 [PASS: ED25519 VERIFIED]<br />
            0x7FFF8A60: 48 8B 45 F8 48 89 C7 E8 94 FE FF FF C9 C3 [ZERO LEAKS DETECTED]
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 z-10">
            <span className="text-amber-400 font-bold">DROP RATE: 0.00%</span>
            <span className="text-emerald-400">CLEAR</span>
          </div>
        </div>
      </div>

      {/* Cyber Broadcast News Ticker */}
      <div className="p-2.5 bg-black/90 rounded-xl border border-white/10 flex items-center space-x-2 overflow-hidden">
        <div className="px-2 py-0.5 rounded bg-rose-500 text-black font-black text-[9px] shrink-0 uppercase tracking-wider">
          LIVE TICKER
        </div>
        <div className="text-[11px] text-slate-300 font-mono whitespace-nowrap animate-marquee">
          {tickerMessage}
        </div>
      </div>
    </div>
  );
}
