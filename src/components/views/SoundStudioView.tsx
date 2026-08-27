"use client";

import { useState } from "react";
import { Mic, Sliders, AudioLines, Sparkles, Volume2, Radio, Zap, VolumeX, Music } from "lucide-react";
import VoiceCloningMatrix, { VOICE_MODELS, VoiceModel } from "./sound_studio/VoiceCloningMatrix";
import TtsScriptEditor, { VocalSynthesisParams } from "./sound_studio/TtsScriptEditor";
import DspVoiceChanger from "./sound_studio/DspVoiceChanger";
import AudioTakesVault, { AudioTake, SAMPLE_TAKES } from "./sound_studio/AudioTakesVault";
import AiSfxSoundboardStudio from "./sound_studio/AiSfxSoundboardStudio";
import AgentVoiceSynthesizerModal from "./sound/AgentVoiceSynthesizerModal";
import WebAudioTrackerDawModal from "./sound/WebAudioTrackerDawModal";
import { cyberAudio } from "@/lib/cyberAudio";

export default function SoundStudioView() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel>(VOICE_MODELS[0]);
  const [takes, setTakes] = useState<AudioTake[]>(SAMPLE_TAKES);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isTtsModalOpen, setIsTtsModalOpen] = useState(false);
  const [isDawModalOpen, setIsDawModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"tts" | "sfx" | "dsp" | "takes">("tts");

  const handleSynthesize = (params: VocalSynthesisParams) => {
    setIsSynthesizing(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsSynthesizing(false);
      const newTake: AudioTake = {
        id: `take-${Date.now()}`,
        title: `${selectedVoice.name.split("//")[0].trim()} - Dialogue Take #${takes.length + 1}`,
        voiceName: selectedVoice.name,
        durationSec: +(params.script.split(" ").length * 0.35 + 1.2).toFixed(1),
        scriptSnippet: params.script,
        visemeJson: JSON.stringify({
          visemes: [
            ["w", 0.1],
            ["eh", 0.25],
            ["l", 0.45],
            ["k", 0.65],
            ["ah", 0.85],
            ["m", 1.05],
          ],
        }),
        created: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      setTakes((prev) => [newTake, ...prev]);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Top Sound Studio Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF] shadow-[0_0_15px_rgba(191,64,255,0.2)]">
            <Mic size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                SOUND STUDIO // <span className="text-[#BF40FF]">VOICE CLONING, SFX & DSP</span>
              </h2>
              <span className="text-[10px] font-bold text-[#BF40FF] px-2 py-0.5 rounded bg-[#BF40FF]/10 border border-[#BF40FF]/30">
                NEURAL AUDIO WORKBENCH
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Zero-shot neural voice cloning, AI sound effects generator, 8-pad soundboard & real-time DSP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cyberAudio.play("warp");
              setIsDawModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/40 font-bold hover:bg-[#BF40FF]/25 cursor-pointer shadow-[0_0_15px_rgba(191,64,255,0.2)] text-xs transition-all"
          >
            <Music size={14} />
            <span>CYBER DAW TRACKER</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("warp");
              setIsTtsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 font-bold hover:bg-[#00FF41]/25 cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)] text-xs transition-all"
          >
            <Radio size={14} />
            <span>AGENT VOICE TTS STUDIO</span>
          </button>
        </div>
      </div>

      {/* Agent Voice TTS Modal */}
      <AgentVoiceSynthesizerModal
        isOpen={isTtsModalOpen}
        onClose={() => setIsTtsModalOpen(false)}
      />

      {/* Web Audio Tracker DAW Modal */}
      <WebAudioTrackerDawModal
        isOpen={isDawModalOpen}
        onClose={() => setIsDawModalOpen(false)}
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "tts" as const, label: "Voice Matrix & TTS Script Editor", icon: Mic },
          { id: "sfx" as const, label: "AI SFX & Cyber Soundboard", icon: Zap },
          { id: "dsp" as const, label: "Real-Time DSP Voice Changer Rack", icon: Sliders },
          { id: "takes" as const, label: "Vocal Takes Vault & Visemes", icon: AudioLines },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveSubTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#BF40FF] text-white shadow-[0_0_12px_rgba(191,64,255,0.3)]"
                  : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Areas */}
      {activeSubTab === "tts" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <VoiceCloningMatrix
            selectedVoiceId={selectedVoice.id}
            onSelectVoice={(v) => setSelectedVoice(v)}
          />
          <TtsScriptEditor
            selectedVoice={selectedVoice}
            onSynthesize={handleSynthesize}
            isSynthesizing={isSynthesizing}
          />
        </div>
      )}

      {activeSubTab === "sfx" && (
        <div className="animate-fade-in">
          <AiSfxSoundboardStudio />
        </div>
      )}

      {activeSubTab === "dsp" && (
        <div className="animate-fade-in">
          <DspVoiceChanger />
        </div>
      )}

      {activeSubTab === "takes" && (
        <div className="animate-fade-in">
          <AudioTakesVault takes={takes} />
        </div>
      )}
    </div>
  );
}
