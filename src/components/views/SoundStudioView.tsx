"use client";

import { useState } from "react";
import { Mic, Sliders, AudioLines, Radio, Zap, Music } from "lucide-react";
import VoiceCloningMatrix, { VOICE_MODELS, VoiceModel } from "./sound_studio/VoiceCloningMatrix";
import TtsScriptEditor, { VocalSynthesisParams } from "./sound_studio/TtsScriptEditor";
import DspVoiceChanger from "./sound_studio/DspVoiceChanger";
import AudioTakesVault, { AudioTake, SAMPLE_TAKES } from "./sound_studio/AudioTakesVault";
import AiSfxSoundboardStudio from "./sound_studio/AiSfxSoundboardStudio";
import LiveWaveformVisualizer from "./sound_studio/LiveWaveformVisualizer";
import AgentVoiceSynthesizerModal from "./sound/AgentVoiceSynthesizerModal";
import WebAudioTrackerDawModal from "./sound/WebAudioTrackerDawModal";
import { cyberAudio } from "@/lib/cyberAudio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
              <Badge variant="outline" className="text-[10px] bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30">
                NEURAL AUDIO WORKBENCH
              </Badge>
            </div>
            <p className="text-xs text-[#9499B3]">
              Zero-shot neural voice cloning, AI sound effects generator, 8-pad soundboard & real-time DSP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              cyberAudio.play("warp");
              setIsDawModalOpen(true);
            }}
            className="bg-[#BF40FF]/15 text-[#BF40FF] border-[#BF40FF]/40 font-bold hover:bg-[#BF40FF]/25 shadow-[0_0_15px_rgba(191,64,255,0.2)] text-xs h-9"
          >
            <Music size={14} className="mr-1.5" />
            <span>CYBER DAW TRACKER</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              cyberAudio.play("warp");
              setIsTtsModalOpen(true);
            }}
            className="bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold hover:bg-[#00FF41]/25 shadow-[0_0_15px_rgba(0,255,65,0.2)] text-xs h-9"
          >
            <Radio size={14} className="mr-1.5" />
            <span>AGENT VOICE TTS STUDIO</span>
          </Button>
        </div>
      </div>

      {/* Realtime Waveform Canvas Analyzer & Synthesizer Stage */}
      <LiveWaveformVisualizer />

      {/* Sub-Navigation Tabs */}
      <Tabs value={activeSubTab} onValueChange={(val) => setActiveSubTab(val as any)} className="w-full flex flex-col gap-4">
        <TabsList className="bg-black/50 border border-white/10 p-1 flex items-center gap-1 overflow-x-auto justify-start h-auto">
          <TabsTrigger value="tts" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Mic size={14} />
            <span>Voice Matrix & TTS</span>
          </TabsTrigger>
          <TabsTrigger value="sfx" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Zap size={14} />
            <span>AI SFX Soundboard</span>
          </TabsTrigger>
          <TabsTrigger value="dsp" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Sliders size={14} />
            <span>DSP Voice Changer</span>
          </TabsTrigger>
          <TabsTrigger value="takes" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <AudioLines size={14} />
            <span>Vocal Takes Vault ({takes.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tts" className="flex flex-col gap-5 mt-0 animate-fade-in">
          <VoiceCloningMatrix
            selectedVoiceId={selectedVoice.id}
            onSelectVoice={(v) => setSelectedVoice(v)}
          />
          <TtsScriptEditor
            selectedVoice={selectedVoice}
            onSynthesize={handleSynthesize}
            isSynthesizing={isSynthesizing}
          />
        </TabsContent>

        <TabsContent value="sfx" className="mt-0 animate-fade-in">
          <AiSfxSoundboardStudio />
        </TabsContent>

        <TabsContent value="dsp" className="mt-0 animate-fade-in">
          <DspVoiceChanger />
        </TabsContent>

        <TabsContent value="takes" className="mt-0 animate-fade-in">
          <AudioTakesVault takes={takes} />
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
