"use client";

import { useState } from "react";
import { Mic, Play, Pause, Sparkles, Volume2, ShieldCheck, UserCheck } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface VoiceModel {
  id: string;
  name: string;
  codename: string;
  archetype: "Virtual Influencer" | "AI VTuber" | "Military Commander" | "Cyber Idol" | "Noir Detective" | "Android Agent";
  color: string;
  pitch: string;
  timbre: string;
  samplePhrase: string;
  cloningAccuracy: number;
  tags: string[];
}

export const VOICE_MODELS: VoiceModel[] = [
  {
    id: "voice-kira",
    name: "KIRA // Neon VTuber",
    codename: "VTUBER-KIRA-V3",
    archetype: "AI VTuber",
    color: "#00FF41",
    pitch: "High (F4)",
    timbre: "Bright, energetic, bubbly with playful anime inflection",
    samplePhrase: "Hey chat! Welcome back to the stream! Let's hack some firewalls today!",
    cloningAccuracy: 99.8,
    tags: ["Anime", "High Energy", "Streamer"],
  },
  {
    id: "voice-aoa",
    name: "AOA-01 // Cyber Idol",
    codename: "CYBER-IDOL-AOA",
    archetype: "Virtual Influencer",
    color: "#BF40FF",
    pitch: "Mid-High (D4)",
    timbre: "Melodic, smooth autotuned vocal with subtle shimmer reverb",
    samplePhrase: "Synchronizing heartbeat with the neon pulse of Neo-Warsaw. Listen closely.",
    cloningAccuracy: 99.4,
    tags: ["Idol", "Melodic", "Vocoder"],
  },
  {
    id: "voice-titan",
    name: "TITAN // Strike Commander",
    codename: "COMMANDER-TITAN-7",
    archetype: "Military Commander",
    color: "#FFB800",
    pitch: "Deep (A1)",
    timbre: "Resonant, authoritative, gravelly tactical radio comms",
    samplePhrase: "All units, hold perimeter. DirtyNest defense matrix is fully operational.",
    cloningAccuracy: 99.6,
    tags: ["Radio Comms", "Deep", "Tactical"],
  },
  {
    id: "voice-zero",
    name: "ZERO // Ghost Operative",
    codename: "OPERATIVE-ZERO-9",
    archetype: "Android Agent",
    color: "#00F0FF",
    pitch: "Neutral (C3)",
    timbre: "Whispered, precise, cold synthetic cadence with zero breath jitter",
    samplePhrase: "Bypassing biometric authorization. Target mainframe located in sector 4.",
    cloningAccuracy: 99.9,
    tags: ["Whisper", "Synthetic", "Infiltration"],
  },
  {
    id: "voice-shadow",
    name: "SHADOW // Noir Detective",
    codename: "NOIR-SHADOW-X",
    archetype: "Noir Detective",
    color: "#FF2A6D",
    pitch: "Low-Mid (E2)",
    timbre: "Smoky, slow, cynical jazz radio monologue style",
    samplePhrase: "It was raining code in the underbelly of the net. And everyone had a secret.",
    cloningAccuracy: 98.7,
    tags: ["Smoky", "Cinematic", "Storytelling"],
  },
  {
    id: "voice-echo",
    name: "ECHO // Hermes AI Companion",
    codename: "HERMES-VOICE-CORE",
    archetype: "Virtual Influencer",
    color: "#00FF41",
    pitch: "Balanced (G3)",
    timbre: "Crisp, reassuring, empathetic neural assistant",
    samplePhrase: "Master Brain online. I've prepared your morning telemetry briefing, Operator.",
    cloningAccuracy: 100.0,
    tags: ["Assistant", "Hermes Core", "Crisp"],
  },
];

interface Props {
  selectedVoiceId: string;
  onSelectVoice: (voice: VoiceModel) => void;
}

export default function VoiceCloningMatrix({ selectedVoiceId, onSelectVoice }: Props) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handlePlaySample = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      cyberAudio.play("chime");
      setPlayingVoiceId(id);
      setTimeout(() => setPlayingVoiceId(null), 3000);
    }
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Mic size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              VOICE CLONING MATRIX // <span className="text-[#BF40FF]">VIRTUAL INFLUENCER PROFILES</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Neural voice timbres, pitch anchors & zero-shot voice cloning models
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          6 VOICES READY
        </span>
      </div>

      {/* Voice Models Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {VOICE_MODELS.map((vm) => {
          const isSelected = selectedVoiceId === vm.id;
          const isPlaying = playingVoiceId === vm.id;

          return (
            <div
              key={vm.id}
              onClick={() => {
                cyberAudio.play("click");
                onSelectVoice(vm);
              }}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                isSelected
                  ? "bg-black/80 border-[#BF40FF] shadow-[0_0_15px_rgba(191,64,255,0.25)]"
                  : "bg-black/40 border-white/5 hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                    style={{
                      color: vm.color,
                      background: `${vm.color}15`,
                      borderColor: `${vm.color}30`,
                    }}
                  >
                    {vm.archetype}
                  </span>
                  <span className="text-[9px] text-[#00FF41] font-bold">
                    {vm.cloningAccuracy}% MATCH
                  </span>
                </div>

                <h4 className="text-xs font-black text-[#F1F3F9] mt-2">
                  {vm.name}
                </h4>

                <p className="text-[10px] text-[#9499B3] mt-1 leading-relaxed">
                  {vm.timbre}
                </p>

                {/* Sample Quote Box */}
                <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-white/5 text-[10px] text-[#F1F3F9] italic">
                  &quot;{vm.samplePhrase}&quot;
                </div>
              </div>

              <div>
                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {vm.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-black/80 border border-white/5 text-[#4F536E]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Footer and Play Sample Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[9px] text-[#4F536E]">
                    Pitch: {vm.pitch}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handlePlaySample(e, vm.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isPlaying
                        ? "bg-[#BF40FF] text-white shadow-[0_0_10px_rgba(191,64,255,0.4)] animate-pulse"
                        : "bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30 hover:bg-[#BF40FF]/25"
                    }`}
                  >
                    {isPlaying ? <Pause size={11} /> : <Play size={11} />}
                    <span>{isPlaying ? "PLAYING..." : "TEST VOICE"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
