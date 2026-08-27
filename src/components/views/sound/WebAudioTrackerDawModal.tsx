"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Music,
  Play,
  Square,
  Volume2,
  VolumeX,
  Sliders,
  Download,
  RotateCcw,
  X,
  Sparkles,
  Zap,
  Activity,
  Radio,
  FileCode,
  Check,
  Disc,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface DawTrack {
  id: string;
  name: string;
  type: "kick" | "snare" | "hihat" | "clap" | "bass";
  color: string;
  isMuted: boolean;
  steps: boolean[];
  notes?: string[]; // for bassline
}

export interface DawPreset {
  id: string;
  name: string;
  bpm: number;
  description: string;
  filterCutoff: number;
  tracks: DawTrack[];
}

const DEFAULT_TRACKS: DawTrack[] = [
  {
    id: "tr-kick",
    name: "CYBER KICK 909",
    type: "kick",
    color: "#00FF41",
    isMuted: false,
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  {
    id: "tr-snare",
    name: "NOISE SNARE 808",
    type: "snare",
    color: "#FF2A6D",
    isMuted: false,
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  },
  {
    id: "tr-hihat",
    name: "METALLIC HI-HAT",
    type: "hihat",
    color: "#00F0FF",
    isMuted: false,
    steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: "tr-clap",
    name: "SYNTH CLAP / GLITCH",
    type: "clap",
    color: "#BF40FF",
    isMuted: false,
    steps: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
  },
  {
    id: "tr-bass",
    name: "SAW SUB-BASS",
    type: "bass",
    color: "#FFB800",
    isMuted: false,
    steps: [true, false, true, false, false, true, false, false, true, false, true, false, false, false, true, false],
    notes: ["C2", "C2", "D#2", "D#2", "F2", "F2", "G2", "G2", "C2", "C2", "D#2", "D#2", "F2", "F2", "G2", "G2"],
  },
];

const PRESETS: DawPreset[] = [
  {
    id: "preset-darksynth",
    name: "Night City Darksynth",
    bpm: 124,
    description: "Driving 4-on-the-floor synthwave bassline with sharp 909 kicks.",
    filterCutoff: 3200,
    tracks: DEFAULT_TRACKS,
  },
  {
    id: "preset-techno",
    name: "Industrial eBPF Techno",
    bpm: 138,
    description: "Fast-paced underground acid rhythm with resonant low-pass sweep.",
    filterCutoff: 4800,
    tracks: [
      {
        id: "tr-kick",
        name: "CYBER KICK 909",
        type: "kick",
        color: "#00FF41",
        isMuted: false,
        steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      },
      {
        id: "tr-snare",
        name: "NOISE SNARE 808",
        type: "snare",
        color: "#FF2A6D",
        isMuted: false,
        steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      },
      {
        id: "tr-hihat",
        name: "METALLIC HI-HAT",
        type: "hihat",
        color: "#00F0FF",
        isMuted: false,
        steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      },
      {
        id: "tr-clap",
        name: "SYNTH CLAP / GLITCH",
        type: "clap",
        color: "#BF40FF",
        isMuted: false,
        steps: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, true],
      },
      {
        id: "tr-bass",
        name: "SAW SUB-BASS",
        type: "bass",
        color: "#FFB800",
        isMuted: false,
        steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
        notes: ["C2", "G1", "C2", "G1", "D#2", "G1", "F2", "G1", "C2", "G1", "C2", "G1", "D#2", "G1", "F2", "G1"],
      },
    ],
  },
  {
    id: "preset-ambient",
    name: "Lo-Fi Terminal Ambient",
    bpm: 86,
    description: "Relaxed chillhop cadence for late night code reviews and terminal introspection.",
    filterCutoff: 1800,
    tracks: [
      {
        id: "tr-kick",
        name: "CYBER KICK 909",
        type: "kick",
        color: "#00FF41",
        isMuted: false,
        steps: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      },
      {
        id: "tr-snare",
        name: "NOISE SNARE 808",
        type: "snare",
        color: "#FF2A6D",
        isMuted: false,
        steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      },
      {
        id: "tr-hihat",
        name: "METALLIC HI-HAT",
        type: "hihat",
        color: "#00F0FF",
        isMuted: false,
        steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      },
      {
        id: "tr-clap",
        name: "SYNTH CLAP / GLITCH",
        type: "clap",
        color: "#BF40FF",
        isMuted: false,
        steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
      },
      {
        id: "tr-bass",
        name: "SAW SUB-BASS",
        type: "bass",
        color: "#FFB800",
        isMuted: false,
        steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        notes: ["C2", "C2", "C2", "C2", "F2", "F2", "F2", "F2", "G2", "G2", "G2", "G2", "D#2", "D#2", "D#2", "D#2"],
      },
    ],
  },
];

// Helper to convert note name to frequency
const NOTE_FREQS: Record<string, number> = {
  G1: 49.0,
  A1: 55.0,
  B1: 61.74,
  C2: 65.41,
  "C#2": 69.3,
  D2: 73.42,
  "D#2": 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  "G#2": 103.83,
  A2: 110.0,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebAudioTrackerDawModal({ isOpen, onClose }: Props) {
  const [tracks, setTracks] = useState<DawTrack[]>(DEFAULT_TRACKS);
  const [bpm, setBpm] = useState<number>(124);
  const [filterCutoff, setFilterCutoff] = useState<number>(3200);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-darksynth");
  const [isExportingWav, setIsExportingWav] = useState<boolean>(false);
  const [isCopiedJson, setIsCopiedJson] = useState<boolean>(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  // Initialize Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Synthesize Procedural Drum Sounds
  const playSound = useCallback(
    (type: DawTrack["type"], note?: string) => {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (type === "kick") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
          gain.gain.setValueAtTime(1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === "snare") {
          // Noise component
          const bufferSize = ctx.sampleRate * 0.15;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.value = 1000;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.7, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);

          // Tone component
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === "hihat") {
          const bufferSize = ctx.sampleRate * 0.05;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.value = 7000;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
        } else if (type === "clap") {
          const bufferSize = ctx.sampleRate * 0.18;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1200;
          filter.Q.value = 3;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
        } else if (type === "bass") {
          const freq = (note && NOTE_FREQS[note]) || 65.41;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = "sawtooth";
          osc1.frequency.setValueAtTime(freq, now);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(freq * 0.5, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(filterCutoff, now);
          filter.Q.setValueAtTime(4.0, now);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.22);
          osc2.stop(now + 0.22);
        }
      } catch {
        // audio context blocked or not ready
      }
    },
    [getAudioContext, filterCutoff]
  );

  // Playhead Step Sequencer Timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = (60 / bpm / 4) * 1000;

    timerRef.current = window.setInterval(() => {
      const step = stepRef.current;
      setCurrentStep(step);

      // Trigger active notes on this step
      tracks.forEach((track) => {
        if (!track.isMuted && track.steps[step]) {
          const note = track.notes ? track.notes[step] : undefined;
          playSound(track.type, note);
        }
      });

      stepRef.current = (step + 1) % 16;
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, tracks, playSound]);

  const handleTogglePlay = () => {
    cyberAudio.play("click");
    if (!isPlaying) {
      getAudioContext();
      stepRef.current = 0;
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleToggleStep = (trackId: string, stepIndex: number) => {
    cyberAudio.play("click");
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const nextSteps = [...t.steps];
          nextSteps[stepIndex] = !nextSteps[stepIndex];
          return { ...t, steps: nextSteps };
        }
        return t;
      })
    );
  };

  const handleToggleMute = (trackId: string) => {
    cyberAudio.play("click");
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t))
    );
  };

  const handleSelectPreset = (p: DawPreset) => {
    cyberAudio.play("warp");
    setSelectedPresetId(p.id);
    setBpm(p.bpm);
    setFilterCutoff(p.filterCutoff);
    setTracks(p.tracks);
  };

  // Pure Client-side WAV Exporter using OfflineAudioContext
  const handleExportWav = async () => {
    setIsExportingWav(true);
    cyberAudio.play("warp");

    try {
      const sampleRate = 44100;
      const stepDuration = 60 / bpm / 4;
      const totalDuration = stepDuration * 32; // 2 full bars
      const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

      // Render 2 bars of sequencer
      for (let bar = 0; bar < 2; bar++) {
        for (let s = 0; s < 16; s++) {
          const time = (bar * 16 + s) * stepDuration;

          tracks.forEach((track) => {
            if (!track.isMuted && track.steps[s]) {
              if (track.type === "kick") {
                const osc = offlineCtx.createOscillator();
                const gain = offlineCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(150, time);
                osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
                gain.gain.setValueAtTime(1, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                osc.connect(gain);
                gain.connect(offlineCtx.destination);
                osc.start(time);
                osc.stop(time + 0.25);
              } else if (track.type === "snare") {
                const osc = offlineCtx.createOscillator();
                const gain = offlineCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(180, time);
                osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
                gain.gain.setValueAtTime(0.6, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
                osc.connect(gain);
                gain.connect(offlineCtx.destination);
                osc.start(time);
                osc.stop(time + 0.1);
              } else if (track.type === "bass") {
                const note = track.notes ? track.notes[s] : "C2";
                const freq = NOTE_FREQS[note] || 65.41;
                const osc = offlineCtx.createOscillator();
                const filter = offlineCtx.createBiquadFilter();
                const gain = offlineCtx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq, time);
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(filterCutoff, time);
                gain.gain.setValueAtTime(0.7, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(offlineCtx.destination);
                osc.start(time);
                osc.stop(time + 0.22);
              }
            }
          });
        }
      }

      const renderedBuffer = await offlineCtx.startRendering();

      // Convert AudioBuffer to WAV Blob
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest_tracker_${bpm}bpm_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);

      cyberAudio.play("chime");
    } catch {
      cyberAudio.play("error");
    } finally {
      setIsExportingWav(false);
    }
  };

  const handleExportJson = () => {
    cyberAudio.play("chime");
    const json = JSON.stringify({ bpm, filterCutoff, tracks }, null, 2);
    navigator.clipboard.writeText(json);
    setIsCopiedJson(true);
    setTimeout(() => setIsCopiedJson(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs select-none"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Music size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  WEB AUDIO 16-STEP TRACKER // <span className="text-[#00FF41]">CYBER BEAT DAW</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  PROCEDURAL SYNTHESIS
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                100% frontend Web Audio oscillator engine, 16-step grid sequencer & client-side WAV rendering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Master Transport & Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-3 bg-[#0B0C16] border border-white/10">
            {/* Play/Stop & BPM */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all shadow-md ${
                  isPlaying
                    ? "bg-[#FF2A6D] text-white hover:bg-rose-600 shadow-[0_0_15px_rgba(255,42,109,0.3)] animate-pulse"
                    : "bg-[#00FF41] text-black hover:bg-[#00cc34] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                }`}
              >
                {isPlaying ? <Square size={14} /> : <Play size={14} />}
                <span>{isPlaying ? "STOP SEQUENCER" : "START PLAYBACK"}</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold">TEMPO:</span>
                <input
                  type="number"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                  className="w-12 bg-transparent text-white font-bold text-xs outline-none text-center"
                />
                <span className="text-[10px] text-[#00FF41] font-bold">BPM</span>
              </div>
            </div>

            {/* Presets Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPresetId === preset.id
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-sm"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Filter Slider */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold">FILTER:</span>
              <input
                type="range"
                min="400"
                max="8000"
                step="100"
                value={filterCutoff}
                onChange={(e) => setFilterCutoff(parseInt(e.target.value))}
                className="w-24 accent-[#FFB800] cursor-pointer"
              />
              <span className="text-[10px] text-[#FFB800] font-bold">{filterCutoff}Hz</span>
            </div>
          </div>

          {/* 16-Step Sequencer Matrix Grid */}
          <div className="p-4 rounded-2xl bg-black/90 border border-white/15 flex flex-col gap-3 shadow-inner">
            {/* Step Numbers & LED Playhead Header */}
            <div className="flex items-center gap-2">
              <div className="w-36 shrink-0 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                TRACK NAME
              </div>
              <div className="flex-1 grid grid-cols-16 gap-1.5">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-5 rounded flex items-center justify-center font-bold text-[9px] transition-all ${
                      currentStep === idx && isPlaying
                        ? "bg-[#00FF41] text-black shadow-[0_0_10px_#00FF41]"
                        : (idx % 4 === 0)
                        ? "bg-white/10 text-white"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Sequencer Track Rows */}
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-2">
                {/* Track Controls */}
                <div className="w-36 shrink-0 flex items-center justify-between p-2 rounded-xl bg-[#0B0C16] border border-white/5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-[10px] truncate" style={{ color: track.color }}>
                      {track.name}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase">{track.type}</span>
                  </div>

                  <button
                    onClick={() => handleToggleMute(track.id)}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      track.isMuted ? "text-red-400 bg-red-500/10" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {track.isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                </div>

                {/* 16 Step Buttons */}
                <div className="flex-1 grid grid-cols-16 gap-1.5">
                  {track.steps.map((isActive, stepIdx) => {
                    const isCurrent = currentStep === stepIdx && isPlaying;
                    const isBarStart = stepIdx % 4 === 0;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => handleToggleStep(track.id, stepIdx)}
                        style={{
                          backgroundColor: isActive ? track.color : undefined,
                          borderColor: isCurrent ? "#FFFFFF" : isBarStart ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                          boxShadow: isActive ? `0 0 10px ${track.color}60` : undefined,
                        }}
                        className={`h-10 rounded-lg border flex items-center justify-center font-bold text-[9px] transition-all cursor-pointer ${
                          isActive
                            ? "text-black scale-95"
                            : isCurrent
                            ? "bg-white/20 text-white"
                            : isBarStart
                            ? "bg-white/5 hover:bg-white/10 text-slate-500"
                            : "bg-black/40 hover:bg-white/5 text-slate-600"
                        }`}
                      >
                        {track.notes ? track.notes[stepIdx] : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Export Code & Audio Drawer */}
          <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-4 border border-white/10 bg-[#0B0C16]">
            <div>
              <h4 className="font-bold text-white text-xs">CLIENT-SIDE AUDIO EXPORTER</h4>
              <p className="text-[10px] text-slate-400">
                Render 2-bar WAV audio loop or export tracker pattern JSON directly in your browser
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
              >
                {isCopiedJson ? <Check size={13} className="text-[#00FF41]" /> : <FileCode size={13} />}
                <span>{isCopiedJson ? "COPIED JSON!" : "EXPORT PATTERN (.json)"}</span>
              </button>

              <button
                onClick={handleExportWav}
                disabled={isExportingWav}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] cursor-pointer text-[10px] shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50"
              >
                <Download size={13} />
                <span>{isExportingWav ? "RENDERING WAV..." : "DOWNLOAD LOOP (.wav)"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pure Client-Side AudioBuffer to WAV Blob encoder
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(dataView, 0, "RIFF");
  dataView.setUint32(4, 36 + dataSize, true);
  writeString(dataView, 8, "WAVE");

  // fmt chunk
  writeString(dataView, 12, "fmt ");
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, format, true);
  dataView.setUint16(22, numChannels, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, sampleRate * blockAlign, true);
  dataView.setUint16(32, blockAlign, true);
  dataView.setUint16(34, bitDepth, true);

  // data chunk
  writeString(dataView, 36, "data");
  dataView.setUint32(40, dataSize, true);

  // Write Interleaved PCM samples
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dataView.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(dataView: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i));
  }
}
