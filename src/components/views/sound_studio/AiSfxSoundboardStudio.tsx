"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Zap,
  Volume2,
  Sliders,
  Sparkles,
  Play,
  Square,
  RefreshCw,
  Download,
  Flame,
  Radio,
  AudioLines,
  Activity,
  Layers,
  CheckCircle2,
  Disc,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SoundPad {
  id: number;
  name: string;
  category: string;
  color: string;
  hotkey: string;
  type: "laser" | "hydraulic" | "ui_beep" | "drone" | "glitch" | "explosion" | "warp" | "chime";
  freq: number;
  duration: number;
  decay: number;
}

const INITIAL_PADS: SoundPad[] = [
  { id: 1, name: "Plasma Railgun Blast", category: "Weapons", color: "#FF0055", hotkey: "1", type: "laser", freq: 880, duration: 0.6, decay: 0.4 },
  { id: 2, name: "Hydraulic Pneumatic Lock", category: "Mechanical", color: "#FFB800", hotkey: "2", type: "hydraulic", freq: 120, duration: 0.8, decay: 0.5 },
  { id: 3, name: "Neural Terminal Chime", category: "UI Cyber", color: "#00FF41", hotkey: "3", type: "chime", freq: 1200, duration: 0.5, decay: 0.3 },
  { id: 4, name: "Sub-Bass Warp Drop", category: "Bass & Drone", color: "#BF40FF", hotkey: "4", type: "warp", freq: 65, duration: 1.2, decay: 0.8 },
  { id: 5, name: "Matrix Digital Glitch", category: "Glitch & FX", color: "#00F0FF", hotkey: "5", type: "glitch", freq: 440, duration: 0.4, decay: 0.2 },
  { id: 6, name: "Shield EMP Discharge", category: "Weapons", color: "#3B82F6", hotkey: "6", type: "explosion", freq: 220, duration: 1.0, decay: 0.7 },
  { id: 7, name: "Quantum Data Stream", category: "UI Cyber", color: "#00FF41", hotkey: "7", type: "ui_beep", freq: 1600, duration: 0.3, decay: 0.15 },
  { id: 8, name: "Dark Ambience Drone", category: "Bass & Drone", color: "#BF40FF", hotkey: "8", type: "drone", freq: 85, duration: 2.0, decay: 1.5 },
];

const SFX_PROMPT_PRESETS = [
  { id: "railgun", label: "Plasma Railgun Shot", prompt: "Heavy electromagnetic kinetic railgun blast with ionized plasma trail discharge" },
  { id: "hologram", label: "Hologram Bootup", prompt: "High-frequency crystalline boot chime with cascading holographic particle resonance" },
  { id: "servo", label: "Mecha Servo Stride", prompt: "Titanium combat walker leg joint servo with pneumatic compression release" },
  { id: "scan", label: "Biometric Sentinel Scan", prompt: "Tri-tone tactical ocular laser scanner sweeping target with confirmation chirp" },
  { id: "emp", label: "Cybernetic EMP Detonation", prompt: "Deep sub-atomic compression pulse followed by high-voltage electrical crackle" },
];

export default function AiSfxSoundboardStudio() {
  const [pads, setPads] = useState<SoundPad[]>(INITIAL_PADS);
  const [activePadId, setActivePadId] = useState<number | null>(null);

  // Generator Prompt
  const [sfxPrompt, setSfxPrompt] = useState(SFX_PROMPT_PRESETS[0].prompt);
  const [sfxDuration, setSfxDuration] = useState(1.2);
  const [sfxPitch, setSfxPitch] = useState(0); // -12 to +12 semitones
  const [isGenerating, setIsGenerating] = useState(false);
  const [assignTargetPad, setAssignTargetPad] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // DSP Master Effects Rack
  const [reverbLevel, setReverbLevel] = useState(30); // 0 to 100%
  const [delayTime, setDelayTime] = useState(250); // ms
  const [delayFeedback, setDelayFeedback] = useState(40); // 0 to 90%
  const [distortionDrive, setDistortionDrive] = useState(15); // 0 to 100%
  const [filterCutoff, setFilterCutoff] = useState(12000); // 200 to 20000 Hz

  // Web Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play Procedural Sound via Web Audio API Synthesis
  const triggerSound = useCallback((pad: SoundPad) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      setActivePadId(pad.id);
      setTimeout(() => setActivePadId(null), pad.duration * 1000);

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);

      // Lowpass Filter
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.setValueAtTime(filterCutoff, now);

      // Delay Node
      const delayNode = ctx.createDelay();
      delayNode.delayTime.setValueAtTime(delayTime / 1000, now);
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime((delayFeedback / 100) * 0.7, now);

      // Reverb / Simple convolver simulation via delay feedback
      const reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(reverbLevel / 200, now);

      // Waveform generator based on sound type
      if (pad.type === "laser" || pad.type === "warp") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        const startFreq = pad.freq * Math.pow(2, sfxPitch / 12);
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + pad.duration);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + pad.duration);

        osc.connect(gain);
        gain.connect(biquadFilter);
        osc.start(now);
        osc.stop(now + pad.duration);
      } else if (pad.type === "glitch" || pad.type === "hydraulic" || pad.type === "explosion") {
        // Noise buffer generator
        const bufferSize = ctx.sampleRate * pad.duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + pad.duration);

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = pad.type === "hydraulic" ? "bandpass" : "lowpass";
        noiseFilter.frequency.setValueAtTime(pad.freq, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(biquadFilter);
        noise.start(now);
      } else {
        // Chime & UI Beeps
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        const startFreq = pad.freq * Math.pow(2, sfxPitch / 12);
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.setValueAtTime(startFreq * 1.5, now + 0.08);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + pad.duration);

        osc.connect(gain);
        gain.connect(biquadFilter);
        osc.start(now);
        osc.stop(now + pad.duration);
      }

      // Chain Filter -> Master -> Delay Loop -> Output
      biquadFilter.connect(masterGain);
      masterGain.connect(ctx.destination);

      if (delayFeedback > 0) {
        masterGain.connect(delayNode);
        delayNode.connect(delayGain);
        delayGain.connect(delayNode);
        delayGain.connect(ctx.destination);
      }
    } catch (e) {
      console.warn("Web Audio playback exception:", e);
    }
  }, [delayTime, delayFeedback, filterCutoff, reverbLevel, sfxPitch]);

  // Keyboard Hotkeys Listener (1 - 8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user typing in input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        const pad = pads.find((p) => p.id === num);
        if (pad) triggerSound(pad);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pads, triggerSound]);

  // Generate New Sound from Prompt
  const handleGenerateSfx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sfxPrompt.trim() || isGenerating) return;

    cyberAudio.play("warp");
    setIsGenerating(true);
    setStatusMessage(`⚡ Neural SFX Synthesizer: Synthesizing "${sfxPrompt.substring(0, 32)}..."`);

    setTimeout(() => {
      cyberAudio.play("chime");
      setIsGenerating(false);

      // Create new sound profile for assigned pad
      const targetPad = pads.find((p) => p.id === assignTargetPad) || pads[0];
      const updatedPad: SoundPad = {
        ...targetPad,
        name: sfxPrompt.split(" ").slice(0, 4).join(" "),
        duration: sfxDuration,
        freq: Math.floor(Math.random() * 800 + 200),
        decay: +(sfxDuration * 0.7).toFixed(2),
      };

      const newPads = pads.map((p) => (p.id === assignTargetPad ? updatedPad : p));
      setPads(newPads);
      setStatusMessage(`✓ Generated new sound & assigned to Pad #${assignTargetPad} [${updatedPad.name}]`);
      triggerSound(updatedPad);

      setTimeout(() => setStatusMessage(null), 4000);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Top Banner HUD */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-[#F1F3F9] uppercase">
                AI SFX & CYBER SOUNDBOARD // <span className="text-[#00F0FF]">NEURAL FOLEY</span>
              </h2>
              <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                WEB AUDIO 96kHz DSP
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Procedural sci-fi sound effects, 8-pad keyboard trigger matrix & real-time DSP effects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#00F0FF] px-2.5 py-1 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-bold">
            HOTKEYS: PRESS [1] TO [8]
          </span>
        </div>
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Left Soundboard Pads (7 cols) | Right Text-to-SFX Generator & DSP Rack (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: 8-Pad Cyber Soundboard Grid (7 cols) */}
        <div className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Disc size={15} className="text-[#00FF41]" />
              <span className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                8-PAD TRIGGER MATRIX
              </span>
            </div>
            <span className="text-[9px] text-[#4F536E]">CLICK OR PRESS 1-8 ON KEYBOARD</span>
          </div>

          {/* 8 Pads Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pads.map((pad) => {
              const isActive = activePadId === pad.id;
              return (
                <button
                  key={pad.id}
                  type="button"
                  onClick={() => triggerSound(pad)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer relative overflow-hidden h-32 ${
                    isActive
                      ? "bg-white/10 scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      : "bg-black/60 border-white/10 hover:border-white/30 hover:bg-black/80"
                  }`}
                  style={{
                    borderColor: isActive ? pad.color : undefined,
                    boxShadow: isActive ? `0 0 25px ${pad.color}80` : undefined,
                  }}
                >
                  {/* Top Pad Header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border"
                      style={{
                        backgroundColor: `${pad.color}20`,
                        borderColor: `${pad.color}50`,
                        color: pad.color,
                      }}
                    >
                      {pad.hotkey}
                    </span>
                    <span className="text-[8px] font-bold text-[#4F536E] uppercase">{pad.category}</span>
                  </div>

                  {/* Pad Title */}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate leading-tight">
                      {pad.name}
                    </span>
                    <span className="text-[9px] text-[#9499B3] block mt-0.5">
                      {pad.duration}s • {pad.freq}Hz
                    </span>
                  </div>

                  {/* Live Waveform Indicator Bar */}
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? "100%" : "20%",
                        backgroundColor: pad.color,
                        boxShadow: isActive ? `0 0 8px ${pad.color}` : "none",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Real-Time DSP Master Effects Rack */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[11px] font-black text-[#00F0FF] uppercase flex items-center gap-1.5">
                <Sliders size={13} />
                <span>DSP MASTER EFFECTS RACK</span>
              </span>
              <span className="text-[9px] text-[#4F536E]">REAL-TIME WEB AUDIO</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
              {/* Reverb Slider */}
              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Cyber Reverb</span>
                  <span className="text-[#00FF41] font-bold">{reverbLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reverbLevel}
                  onChange={(e) => setReverbLevel(Number(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>

              {/* Delay Feedback Slider */}
              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Ping-Pong Delay</span>
                  <span className="text-[#00F0FF] font-bold">{delayFeedback}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={delayFeedback}
                  onChange={(e) => setDelayFeedback(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>

              {/* Filter Cutoff Slider */}
              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Filter Cutoff</span>
                  <span className="text-purple-400 font-bold">{filterCutoff} Hz</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={filterCutoff}
                  onChange={(e) => setFilterCutoff(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Text-to-SFX Neural Generator (5 cols) */}
        <div className="lg:col-span-5 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#00F0FF]" />
              <span className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                TEXT-TO-SFX GENERATOR
              </span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
              HERMES FOLEY AI
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1.5">
              Quick Foley Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SFX_PROMPT_PRESETS.map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => setSfxPrompt(pr.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00F0FF]/40 text-[9px] text-[#9499B3] hover:text-white transition-all cursor-pointer font-bold"
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerateSfx} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Describe Sound Effect / Foley:
              </label>
              <textarea
                rows={3}
                value={sfxPrompt}
                onChange={(e) => setSfxPrompt(e.target.value)}
                placeholder="e.g. Plasma beam rifle charging and firing, robotic hydraulic footsteps, dark cyber drone..."
                className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00F0FF] outline-none resize-none font-mono"
              />
            </div>

            {/* Duration & Pitch Sliders */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Duration</span>
                  <span className="text-[#00FF41] font-bold">{sfxDuration}s</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="4.0"
                  step="0.1"
                  value={sfxDuration}
                  onChange={(e) => setSfxDuration(Number(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Pitch Shift</span>
                  <span className="text-[#00F0FF] font-bold">{sfxPitch > 0 ? `+${sfxPitch}` : sfxPitch} st</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={sfxPitch}
                  onChange={(e) => setSfxPitch(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>
            </div>

            {/* Target Pad Selector */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
              <span className="text-[11px] text-[#9499B3] font-bold">Assign Output To:</span>
              <select
                value={assignTargetPad}
                onChange={(e) => setAssignTargetPad(Number(e.target.value))}
                className="p-1.5 rounded-lg bg-black border border-white/15 text-xs text-[#00F0FF] font-mono outline-none cursor-pointer"
              >
                {pads.map((p) => (
                  <option key={p.id} value={p.id}>
                    Pad #{p.id} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Generate & Assign Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-[#00F0FF] hover:bg-[#00c5d3] text-black font-black text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Flame size={15} />
              <span>{isGenerating ? "SYNTHESIZING FOLEY SOUND..." : "GENERATE SFX & ASSIGN TO PAD"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
