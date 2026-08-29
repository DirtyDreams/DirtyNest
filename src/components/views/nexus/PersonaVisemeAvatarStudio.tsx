"use client";

import { useState } from "react";
import { Volume2, Smile } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

type VisemeMouthShape = "NEUTRAL" | "AA" | "EE" | "OH" | "OO" | "CH";

export default function PersonaVisemeAvatarStudio() {
  const [activeViseme, setActiveViseme] = useState<VisemeMouthShape>("NEUTRAL");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState(
    "Synthesizing neural metahuman voice clone with real-time phoneme visemes and zero-latency audio dispatch."
  );
  const [selectedEmotion, setSelectedEmotion] = useState<"ENIGMATIC" | "PLAYFUL" | "TACTICAL" | "CHIC">("CHIC");
  const [pitch, setPitch] = useState(1.1);
  const [speakingRate, setSpeakingRate] = useState(1.0);

  const handleTestVisemes = () => {
    cyberAudio.play("chime");
    setIsSpeaking(true);

    const sequence: VisemeMouthShape[] = ["AA", "EE", "OH", "OO", "CH", "AA", "EE", "NEUTRAL"];
    let step = 0;

    const interval = setInterval(() => {
      if (step < sequence.length) {
        setActiveViseme(sequence[step]);
        step++;
      } else {
        clearInterval(interval);
        setActiveViseme("NEUTRAL");
        setIsSpeaking(false);
        cyberAudio.play("click");
      }
    }, 240);
  };

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/15 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              METAHUMAN VISEME STUDIO // <span className="text-[#BF40FF]">2D/3D AVATAR SYNC</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Live phoneme viseme lip-sync generator, emotion presets & Web Audio vocal formants
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isSpeaking
                ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/40 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isSpeaking ? `VOICE ACTIVE [${activeViseme}]` : "AVATAR IDLE"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Avatar Face Canvas Simulator (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-black/80 border border-[#BF40FF]/30 flex flex-col items-center justify-center gap-4 relative overflow-hidden min-h-[260px]">
          {/* Neon Glow Aura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#BF40FF]/10 via-transparent to-[#00F0FF]/10 pointer-events-none" />

          {/* Stylized Holographic Face Representation */}
          <div className="w-32 h-32 rounded-full border-2 border-[#BF40FF]/60 flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(191,64,255,0.25)] bg-[#05060B]">
            {/* Eyes */}
            <div className="flex space-x-8 mb-4">
              <div
                className={`w-3.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] transition-all ${
                  isSpeaking ? "scale-y-125" : ""
                }`}
              />
              <div
                className={`w-3.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] transition-all ${
                  isSpeaking ? "scale-y-125" : ""
                }`}
              />
            </div>

            {/* Reactive Mouth Viseme Shape */}
            <div className="transition-all duration-150 flex items-center justify-center">
              {activeViseme === "NEUTRAL" && (
                <div className="w-6 h-1 rounded-full bg-[#BF40FF] shadow-[0_0_8px_#BF40FF]" />
              )}
              {activeViseme === "AA" && (
                <div className="w-7 h-5 rounded-full border-2 border-[#BF40FF] bg-[#BF40FF]/20 shadow-[0_0_12px_#BF40FF]" />
              )}
              {activeViseme === "EE" && (
                <div className="w-8 h-2 rounded-full border-2 border-[#BF40FF] bg-[#BF40FF]/30 shadow-[0_0_12px_#BF40FF]" />
              )}
              {activeViseme === "OH" && (
                <div className="w-5 h-6 rounded-full border-2 border-[#BF40FF] bg-[#BF40FF]/30 shadow-[0_0_12px_#BF40FF]" />
              )}
              {activeViseme === "OO" && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#BF40FF] bg-[#BF40FF]/40 shadow-[0_0_12px_#BF40FF]" />
              )}
              {activeViseme === "CH" && (
                <div className="w-7 h-3 rounded-lg border-2 border-[#BF40FF] bg-[#BF40FF]/20 shadow-[0_0_12px_#BF40FF]" />
              )}
            </div>

            {/* Target Viseme Label */}
            <div className="absolute -bottom-3 px-2 py-0.5 rounded-md bg-black/90 border border-white/10 text-[9px] font-bold text-slate-300">
              VISEME: <span className="text-[#00F0FF]">{activeViseme}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 z-10 pt-2">
            <span>EMOTION: <strong className="text-[#BF40FF]">{selectedEmotion}</strong></span>
            <span>·</span>
            <span>FPS: <strong className="text-emerald-400">60.0</strong></span>
          </div>
        </div>

        {/* Viseme Formant Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {/* Speech Text Input Bar */}
          <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">TTS SPEECH PROMPT:</span>
            <textarea
              rows={2}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 outline-none resize-none font-mono placeholder:text-slate-600"
            />
          </div>

          {/* Emotion & Modulation Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">EMOTION PRESET</span>
              <div className="grid grid-cols-2 gap-1">
                {(["CHIC", "ENIGMATIC", "PLAYFUL", "TACTICAL"] as const).map((emo) => (
                  <button
                    key={emo}
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedEmotion(emo);
                    }}
                    className={`py-1 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      selectedEmotion === emo
                        ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold">PITCH / RATE</span>
                <span className="text-cyan-400 font-bold">{pitch}x / {speakingRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-[#BF40FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              {(["NEUTRAL", "AA", "EE", "OH", "OO", "CH"] as VisemeMouthShape[]).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    cyberAudio.play("click");
                    setActiveViseme(v);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                    activeViseme === v
                      ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                      : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={handleTestVisemes}
              disabled={isSpeaking}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#BF40FF] text-white font-bold hover:bg-[#a832e6] transition-all shadow-[0_0_12px_rgba(191,64,255,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? "SPEAKING..." : "TEST VISEMES"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
