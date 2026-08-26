"use client";

import { useState } from "react";
import { Sparkles, Sliders, Volume2, Play, AudioLines, Flame, Radio } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { VoiceModel } from "./VoiceCloningMatrix";

export interface VocalSynthesisParams {
  script: string;
  voiceId: string;
  speedWpm: number;
  pitchSemitones: number;
  emotion: {
    confidence: number;
    excitement: number;
    robotic: number;
    whisper: number;
  };
  exportPhonemes: boolean;
}

interface Props {
  selectedVoice: VoiceModel;
  onSynthesize: (params: VocalSynthesisParams) => void;
  isSynthesizing: boolean;
}

export default function TtsScriptEditor({
  selectedVoice,
  onSynthesize,
  isSynthesizing,
}: Props) {
  const [script, setScript] = useState(
    "Welcome to the midnight stream, Operatives. We are scanning live subnets across the dark matrix. Keep your firewalls up and stay calibrated."
  );
  const [speedWpm, setSpeedWpm] = useState(165);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [excitement, setExcitement] = useState(70);
  const [robotic, setRobotic] = useState(15);
  const [whisper, setWhisper] = useState(10);
  const [exportPhonemes, setExportPhonemes] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim() || isSynthesizing) return;

    cyberAudio.play("toggle");
    onSynthesize({
      script,
      voiceId: selectedVoice.id,
      speedWpm,
      pitchSemitones,
      emotion: {
        confidence,
        excitement,
        robotic,
        whisper,
      },
      exportPhonemes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <AudioLines size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              TTS SCRIPT & EMOTION SYNTHESIZER // <span className="text-[#00FF41]">{selectedVoice.name}</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Phoneme timing, emotion vectoring & neural voice synthesis for Virtual Influencers
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#00F0FF]">
          VISEME LIP-SYNC READY
        </span>
      </div>

      {/* Script Input */}
      <div>
        <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
          Spoken Script & Dialogue Text
        </label>
        <textarea
          rows={3}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter dialogue for the virtual influencer..."
          className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed shadow-inner"
        />
      </div>

      {/* Emotion Modulation Dials */}
      <div>
        <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-2">
          Neural Emotion Vectoring (%)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Confidence */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#9499B3]">Confidence</span>
              <span className="text-[#00FF41] font-bold">{confidence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full accent-[#00FF41] cursor-pointer"
            />
          </div>

          {/* Excitement */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#9499B3]">Excitement</span>
              <span className="text-[#00F0FF] font-bold">{excitement}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={excitement}
              onChange={(e) => setExcitement(parseInt(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          {/* Cold Robotic */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#9499B3]">Robotic</span>
              <span className="text-[#BF40FF] font-bold">{robotic}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={robotic}
              onChange={(e) => setRobotic(parseInt(e.target.value))}
              className="w-full accent-[#BF40FF] cursor-pointer"
            />
          </div>

          {/* Whisper */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#9499B3]">Whisper</span>
              <span className="text-[#FFB800] font-bold">{whisper}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={whisper}
              onChange={(e) => setWhisper(parseInt(e.target.value))}
              className="w-full accent-[#FFB800] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Pacing & Lip-Sync Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-[#9499B3]">Speech Pacing</span>
            <span className="text-[#00FF41] font-bold">{speedWpm} WPM</span>
          </div>
          <input
            type="range"
            min="100"
            max="240"
            step="5"
            value={speedWpm}
            onChange={(e) => setSpeedWpm(parseInt(e.target.value))}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-[#9499B3]">Pitch Shift</span>
            <span className="text-[#00F0FF] font-bold">{pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} ST</span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitchSemitones}
            onChange={(e) => setPitchSemitones(parseInt(e.target.value))}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
          <div>
            <span className="text-xs font-bold text-[#F1F3F9] block">Phoneme Visemes</span>
            <span className="text-[9px] text-[#4F536E]">JSON Lip-Sync Export</span>
          </div>
          <input
            type="checkbox"
            checked={exportPhonemes}
            onChange={(e) => setExportPhonemes(e.target.checked)}
            className="w-4 h-4 accent-[#00FF41] cursor-pointer"
          />
        </div>
      </div>

      {/* Synthesize Button */}
      <button
        type="submit"
        disabled={isSynthesizing}
        className="w-full py-3 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flame size={15} />
        <span>{isSynthesizing ? "NEURAL VOCAL SYNTHESIS IN PROGRESS..." : "SYNTHESIZE VOCAL TRACK // RUN NEURAL TTS"}</span>
      </button>
    </form>
  );
}
