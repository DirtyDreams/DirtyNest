"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Radio, Sliders, CheckCircle2, Sparkles, Activity } from "lucide-react";
import { cyberAudio, type AmbientTrackType } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function CyberAudioMixer() {
  const toast = useToast();
  const [masterVolume, setMasterVolume] = useState(80);
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [activeTrack, setActiveTrack] = useState<AmbientTrackType>("drone");
  const [sfxVolume, setSfxVolume] = useState(85);
  const [ambientVolume, setAmbientVolume] = useState(60);

  useEffect(() => {
    try {
      const savedVol = localStorage.getItem("dirtynest_sound_volume");
      if (savedVol) {
        setMasterVolume(parseInt(savedVol, 10));
      }
    } catch {}
  }, []);

  const handleMasterVolumeChange = (val: number) => {
    setMasterVolume(val);
    cyberAudio.setVolume(val / 100);
    try {
      localStorage.setItem("dirtynest_sound_volume", String(val));
    } catch {}
  };

  const handleToggleAmbient = (track: AmbientTrackType) => {
    setActiveTrack(track);
    const isNowPlaying = cyberAudio.toggleAmbient(track);
    setIsPlayingAmbient(isNowPlaying);
    if (isNowPlaying) {
      toast.info("Ambient Generator Active", `Playing procedural ${track.toUpperCase()} audio.`);
    } else {
      toast.info("Ambient Generator Muted", "Stopped ambient focus audio.");
    }
  };

  const testSound = (sound: "click" | "chime" | "warp" | "error") => {
    cyberAudio.play(sound);
  };

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AUDIO SYNTHESIZER // <span className="text-emerald-400">WEB AUDIO DSP MIXER</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Procedural Web Audio API frequency generator, ambient focus drones, and tactical sound FX
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isPlayingAmbient
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isPlayingAmbient ? `AMBIENT ON (${activeTrack.toUpperCase()})` : "AMBIENT MUTED"}
          </span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Master Volume */}
        <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-bold">MASTER VOLUME</span>
            <span className="text-emerald-400 font-bold">{masterVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* SFX Channel */}
        <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-bold">TACTICAL SFX CHANNEL</span>
            <span className="text-cyan-400 font-bold">{sfxVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Ambient Generator Channel */}
        <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-bold">AMBIENT GENERATOR</span>
            <span className="text-purple-400 font-bold">{ambientVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseInt(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Procedural Ambient Generators */}
      <div className="p-4 bg-black/60 rounded-xl border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-bold uppercase">PROCEDURAL AMBIENT SOUNDSCAPES</span>
          <span className="text-[10px] text-slate-500">Real-time oscillator synthesis · 0kb streaming</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["drone", "server", "rain", "synth"] as AmbientTrackType[]).map((track) => {
            const isCurrent = activeTrack === track && isPlayingAmbient;
            return (
              <button
                key={track}
                onClick={() => handleToggleAmbient(track)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(191,64,255,0.2)] font-bold"
                    : "bg-black/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="capitalize">{track} Ambience</span>
                </div>
                {isCurrent ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound Effect Test Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
        <span className="text-[10px] text-slate-500 font-bold uppercase">TEST SOUND EFFECTS:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testSound("click")}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors"
          >
            🔊 Click Trigger
          </button>
          <button
            onClick={() => testSound("chime")}
            className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-colors"
          >
            🔔 Chime / Clearance
          </button>
          <button
            onClick={() => testSound("warp")}
            className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold transition-colors"
          >
            ⚡ Warp Jump
          </button>
          <button
            onClick={() => testSound("error")}
            className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-bold transition-colors"
          >
            ⚠️ Alert / Denial
          </button>
        </div>
      </div>
    </div>
  );
}
