"use client";

import { useState } from "react";
import {
  Headphones,
  Play,
  Pause,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SoundTrack {
  id: string;
  name: string;
  type: string;
  icon: string;
  active: boolean;
  volume: number;
}

const INITIAL_TRACKS: SoundTrack[] = [
  { id: "rain", name: "Cyberpunk Rain", type: "44.1kHz Pink Noise", icon: "🌧️", active: true, volume: 60 },
  { id: "server", name: "Server Room Hum", type: "60Hz Low Drone", icon: "🖥️", active: false, volume: 40 },
  { id: "binaural", name: "Binaural 432Hz", type: "Theta Brainwave", icon: "🧘", active: false, volume: 50 },
  { id: "matrix", name: "Matrix Synths", type: "Vapor Arp Wave", icon: "👾", active: false, volume: 45 },
];

export default function CyberSoundscapeWidget() {
  const [tracks, setTracks] = useState<SoundTrack[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMaster = () => {
    cyberAudio.play("click");
    setIsPlaying(!isPlaying);
  };

  const toggleTrack = (id: string) => {
    cyberAudio.play("click");
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const updateVolume = (id: string, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume: vol } : t))
    );
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#BF40FF]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Headphones size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              CYBER FOCUS SOUNDSCAPE
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Ambient Generator for Deep Work
            </span>
          </div>
        </div>

        <button
          onClick={toggleMaster}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            isPlaying
              ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40 shadow-[0_0_10px_rgba(191,64,255,0.3)] animate-pulse"
              : "bg-white/5 text-[#9499B3] hover:text-white"
          }`}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} />}
          <span>{isPlaying ? "PLAYING" : "START SOUNDS"}</span>
        </button>
      </div>

      {/* Track Faders */}
      <div className="space-y-2 pt-1">
        {tracks.map((tr) => (
          <div
            key={tr.id}
            className={`p-2.5 rounded-xl bg-black/40 border transition-all space-y-1.5 ${
              tr.active && isPlaying ? "border-[#BF40FF]/40" : "border-white/5"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => toggleTrack(tr.id)}
                className="flex items-center gap-2 font-bold cursor-pointer text-left truncate"
              >
                <span>{tr.icon}</span>
                <span className={tr.active ? "text-[#F1F3F9]" : "text-[#4F536E]"}>
                  {tr.name}
                </span>
              </button>

              <span className="text-[10px] text-[#BF40FF] font-bold">
                {tr.active ? `${tr.volume}%` : "OFF"}
              </span>
            </div>

            {tr.active && (
              <input
                type="range"
                min="0"
                max="100"
                value={tr.volume}
                onChange={(e) => updateVolume(tr.id, parseInt(e.target.value, 10))}
                className="w-full accent-[#BF40FF] h-1"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
