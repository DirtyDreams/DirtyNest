"use client";

import { useState, useEffect } from "react";
import { Headphones, Volume2, VolumeX, X, Play, Square, Sparkles, Radio, CloudRain, Server, Zap } from "lucide-react";
import { cyberAudio, AmbientTrackType } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";

interface AudioMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AMBIENT_TRACKS: { id: AmbientTrackType; label: string; sub: string; icon: any; color: string }[] = [
  { id: "drone", label: "Theta Binaural Drone", sub: "55Hz / 58Hz focus neural hum", icon: Zap, color: "#00FF41" },
  { id: "server", label: "Server Room Fan Hum", sub: "110Hz bandpass data center air", icon: Server, color: "#00F0FF" },
  { id: "rain", label: "Cyberpunk Acid Rain", sub: "Analog filtered pink noise generator", icon: CloudRain, color: "#BF40FF" },
  { id: "synth", label: "Deep Space Synth Haze", sub: "82.4Hz warm harmonic pad", icon: Sparkles, color: "#FFB800" },
];

export default function AudioMixerModal({ isOpen, onClose }: AudioMixerModalProps) {
  const { isDronePlaying, setDronePlaying } = useAppStore();
  const [currentTrack, setCurrentTrack] = useState<AmbientTrackType>("drone");
  const [volume, setVolume] = useState(50);
  const [activeTab, setActiveTab] = useState<"ambient" | "sfx">("ambient");

  useEffect(() => {
    setCurrentTrack(cyberAudio.getCurrentTrack());
    setVolume(Math.round(cyberAudio.getVolume() * 100));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAmbient = (trackId?: AmbientTrackType) => {
    cyberAudio.play("click");
    const target = trackId || currentTrack;
    const isNowPlaying = cyberAudio.toggleAmbient(target);
    setCurrentTrack(target);
    setDronePlaying(isNowPlaying);
  };

  const handleTrackSelect = (trackId: AmbientTrackType) => {
    cyberAudio.play("click");
    setCurrentTrack(trackId);
    if (isDronePlaying) {
      cyberAudio.setTrack(trackId);
    } else {
      cyberAudio.toggleAmbient(trackId);
      setDronePlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    cyberAudio.setVolume(newVol / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="cyber-card p-6 w-full max-w-lg relative flex flex-col gap-5 border border-white/10 shadow-[0_0_30px_rgba(0,255,65,0.15)]">
        {/* HUD Corners */}
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
              <Headphones size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
                Cyber Audio Matrix & Soundboard
              </h3>
              <p className="text-[10px] text-[#9499B3]">
                Pure Web Audio API real-time synthesis engine
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Equalizer Visualizer & Master Power */}
        <div className="p-4 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleAmbient()}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isDronePlaying
                  ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)]"
                  : "bg-white/5 border-white/10 text-[#9499B3] hover:text-[#F1F3F9]"
              }`}
            >
              {isDronePlaying ? <Square size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F1F3F9]">
                {isDronePlaying ? "AMBIENT GENERATOR ACTIVE" : "GENERATOR STANDBY"}
              </span>
              <span className="text-[10px] text-[#4F536E]">
                {isDronePlaying ? "Synthesizing real-time wave frequencies" : "Click play to activate focus sound"}
              </span>
            </div>
          </div>

          {/* Equalizer Bars */}
          <div className="flex items-end gap-1 h-6">
            {[40, 75, 55, 90, 65, 80].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isDronePlaying
                    ? "bg-[#00FF41] animate-pulse shadow-[0_0_6px_#00FF41]"
                    : "bg-white/10 h-1.5"
                }`}
                style={{
                  height: isDronePlaying ? `${h}%` : "4px",
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Master Volume Slider */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold flex items-center gap-1.5">
              {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} className="text-[#00FF41]" />}
              MASTER AMBIENT VOLUME
            </span>
            <span className="font-bold text-[#00FF41] text-xs">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-[#00FF41] cursor-pointer h-1.5 bg-black/60 rounded-lg outline-none"
          />
        </div>

        {/* Ambient Channels Preset Selector */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
            AMBIENT FREQUENCY CHANNELS
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AMBIENT_TRACKS.map((t) => {
              const Icon = t.icon;
              const isSelected = currentTrack === t.id && isDronePlaying;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTrackSelect(t.id)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-black/60 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20"
                  }`}
                  style={{
                    borderColor: isSelected ? t.color : undefined,
                  }}
                >
                  <div
                    className="p-1.5 rounded-lg shrink-0 mt-0.5"
                    style={{
                      background: `${t.color}15`,
                      color: t.color,
                      border: `1px solid ${t.color}30`,
                    }}
                  >
                    <Icon size={14} />
                  </div>

                  <div className="flex flex-col">
                    <span
                      className="text-xs font-bold font-mono tracking-tight"
                      style={{ color: isSelected ? t.color : "#F1F3F9" }}
                    >
                      {t.label}
                    </span>
                    <span className="text-[10px] text-[#4F536E] mt-0.5 leading-tight">{t.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SFX Quick Test Matrix */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <label className="text-[10px] text-[#4F536E] uppercase tracking-wider font-bold">
            TACTICAL SFX TEST BOARD
          </label>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <button
              onClick={() => cyberAudio.play("click")}
              className="py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] border border-white/5 hover:border-[#00FF41]/30 transition-all cursor-pointer text-[10px] font-bold"
            >
              CLICK
            </button>
            <button
              onClick={() => cyberAudio.play("chime")}
              className="py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00F0FF] border border-white/5 hover:border-[#00F0FF]/30 transition-all cursor-pointer text-[10px] font-bold"
            >
              CHIME
            </button>
            <button
              onClick={() => cyberAudio.play("warp")}
              className="py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#BF40FF] border border-white/5 hover:border-[#BF40FF]/30 transition-all cursor-pointer text-[10px] font-bold"
            >
              WARP
            </button>
            <button
              onClick={() => cyberAudio.play("error")}
              className="py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#FF2A6D] border border-white/5 hover:border-[#FF2A6D]/30 transition-all cursor-pointer text-[10px] font-bold"
            >
              ERROR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
