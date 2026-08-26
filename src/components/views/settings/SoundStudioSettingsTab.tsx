"use client";

import { useState } from "react";
import { Mic, Sliders, Volume2, Save, RotateCcw, CheckCircle2, AudioLines } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function SoundStudioSettingsTab() {
  const [sampleRate, setSampleRate] = useState("48000");
  const [defaultSpeedWpm, setDefaultSpeedWpm] = useState(160);
  const [enableVisemesExport, setEnableVisemesExport] = useState(true);
  const [enableDspBuffer, setEnableDspBuffer] = useState(true);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    cyberAudio.play("chime");
    setSaved(true);
    toast.success("Sound Studio Settings Saved", "Audio DSP parameters updated.");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono select-none animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#BF40FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BF40FF]/10 border border-[#BF40FF]/40 flex items-center justify-center text-[#BF40FF]">
            <Mic size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
              SOUND STUDIO CONFIGURATION // <span className="text-[#BF40FF]">VOICE CLONING</span>
            </h3>
            <p className="text-xs text-[#9499B3]">
              Sample rates, default speaking pacing, 3D VTuber viseme export & Web Audio DSP buffer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#BF40FF] text-white font-black text-xs hover:bg-[#a832e6] transition-all cursor-pointer shadow-[0_0_12px_rgba(191,64,255,0.3)]"
        >
          <Save size={13} />
          <span>{saved ? "SAVED!" : "SAVE SETTINGS"}</span>
        </button>
      </div>

      <div className="cyber-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Audio Master Sample Rate
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] font-bold outline-none"
            >
              <option value="48000">48,000 Hz (Broadcast Quality)</option>
              <option value="44100">44,100 Hz (Standard CD Audio)</option>
              <option value="96000">96,000 Hz (Hi-Res Audio Stems)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9499B3]">Default Speaking Pacing</span>
              <span className="text-[#00FF41] font-bold">{defaultSpeedWpm} WPM</span>
            </div>
            <input
              type="range"
              min="110"
              max="220"
              value={defaultSpeedWpm}
              onChange={(e) => setDefaultSpeedWpm(parseInt(e.target.value))}
              className="w-full accent-[#00FF41] cursor-pointer mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">Auto-Export Phoneme Visemes</span>
              <span className="text-[10px] text-[#4F536E]">Generate JSON timeline for 3D VTuber lip sync</span>
            </div>
            <input
              type="checkbox"
              checked={enableVisemesExport}
              onChange={(e) => setEnableVisemesExport(e.target.checked)}
              className="w-4 h-4 accent-[#00FF41] cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">Real-Time DSP Buffer Hardware Lock</span>
              <span className="text-[10px] text-[#4F536E]">Low-latency 128 samples audio buffer</span>
            </div>
            <input
              type="checkbox"
              checked={enableDspBuffer}
              onChange={(e) => setEnableDspBuffer(e.target.checked)}
              className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
