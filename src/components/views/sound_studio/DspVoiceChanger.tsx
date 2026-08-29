"use client";

import { useState } from "react";
import { Sliders, Play, Pause } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface DspParams {
  pitchShift: number;
  formantShift: number;
  vocoderWet: number;
  bitcrushDepth: number;
  reverbWet: number;
  chorusDepth: number;
}

export default function DspVoiceChanger() {
  const [params, setParams] = useState<DspParams>({
    pitchShift: 0,
    formantShift: 0,
    vocoderWet: 30,
    bitcrushDepth: 0,
    reverbWet: 25,
    chorusDepth: 20,
  });

  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleTestDsp = () => {
    if (isPlayingTest) {
      setIsPlayingTest(false);
    } else {
      cyberAudio.play("chime");
      setIsPlayingTest(true);
      setTimeout(() => setIsPlayingTest(false), 2500);
    }
  };

  const handlePreset = (presetName: string, values: DspParams) => {
    cyberAudio.play("click");
    setParams(values);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              DSP VOICE MODULATOR RACK // <span className="text-[#00F0FF]">WEB AUDIO API</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Real-time formant resonance, robotic vocoder carrier & spatial reverb
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestDsp}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isPlayingTest
              ? "bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)] animate-pulse"
              : "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30 hover:bg-[#00F0FF]/25"
          }`}
        >
          {isPlayingTest ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlayingTest ? "PLAYING DSP PASS..." : "TEST DSP RACK"}</span>
        </button>
      </div>

      {/* DSP Presets Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold mr-1">Presets:</span>
        {[
          {
            name: "Anime VTuber",
            values: { pitchShift: 4, formantShift: 3, vocoderWet: 0, bitcrushDepth: 0, reverbWet: 20, chorusDepth: 35 },
          },
          {
            name: "Robotic Vocoder",
            values: { pitchShift: -2, formantShift: 0, vocoderWet: 80, bitcrushDepth: 12, reverbWet: 15, chorusDepth: 40 },
          },
          {
            name: "Tactical Radio Comms",
            values: { pitchShift: -4, formantShift: -2, vocoderWet: 10, bitcrushDepth: 45, reverbWet: 5, chorusDepth: 0 },
          },
          {
            name: "Holographic Cyber Idol",
            values: { pitchShift: 2, formantShift: 2, vocoderWet: 40, bitcrushDepth: 0, reverbWet: 50, chorusDepth: 60 },
          },
        ].map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handlePreset(preset.name, preset.values)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#9499B3] hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* DSP Sliders Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Pitch Shift */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Pitch Shift</span>
            <span className="text-[#00FF41] font-mono font-bold">
              {params.pitchShift > 0 ? `+${params.pitchShift}` : params.pitchShift} ST
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={params.pitchShift}
            onChange={(e) => setParams({ ...params, pitchShift: parseInt(e.target.value) })}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
        </div>

        {/* Formant Shift */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Formant Resonator</span>
            <span className="text-[#00F0FF] font-mono font-bold">
              {params.formantShift > 0 ? `+${params.formantShift}` : params.formantShift}
            </span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="1"
            value={params.formantShift}
            onChange={(e) => setParams({ ...params, formantShift: parseInt(e.target.value) })}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
        </div>

        {/* Vocoder Wet */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Robotic Vocoder</span>
            <span className="text-[#BF40FF] font-mono font-bold">{params.vocoderWet}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.vocoderWet}
            onChange={(e) => setParams({ ...params, vocoderWet: parseInt(e.target.value) })}
            className="w-full accent-[#BF40FF] cursor-pointer"
          />
        </div>

        {/* Bitcrusher */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Lo-Fi Bitcrusher</span>
            <span className="text-[#FFB800] font-mono font-bold">{params.bitcrushDepth}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.bitcrushDepth}
            onChange={(e) => setParams({ ...params, bitcrushDepth: parseInt(e.target.value) })}
            className="w-full accent-[#FFB800] cursor-pointer"
          />
        </div>

        {/* Reverb Wet */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Spatial Holographic Reverb</span>
            <span className="text-[#00F0FF] font-mono font-bold">{params.reverbWet}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.reverbWet}
            onChange={(e) => setParams({ ...params, reverbWet: parseInt(e.target.value) })}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
        </div>

        {/* Chorus */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F1F3F9] font-bold">Stereo Chorus Shimmer</span>
            <span className="text-[#00FF41] font-mono font-bold">{params.chorusDepth}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.chorusDepth}
            onChange={(e) => setParams({ ...params, chorusDepth: parseInt(e.target.value) })}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
