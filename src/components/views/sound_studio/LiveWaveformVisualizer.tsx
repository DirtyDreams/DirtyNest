"use client";

import { useEffect, useRef, useState, useCallback } from "react";
<<<<<<< HEAD
import {
  AudioLines,
  Activity,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
=======
import { AudioLines, Activity, Play, Square, ChevronLeft, ChevronRight } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SynthPreset {
  id: string;
  name: string;
  type: OscillatorType;
  freq: number;
  decay: number;
  color: string;
}

const SYNTH_PADS: SynthPreset[] = [
  { id: "lead", name: "Cyber Lead", type: "sawtooth", freq: 440, decay: 0.4, color: "#BF40FF" },
  { id: "bass", name: "Sub Bass 808", type: "triangle", freq: 110, decay: 0.8, color: "#00F0FF" },
  { id: "drone", name: "Warp Drone", type: "sine", freq: 220, decay: 1.2, color: "#00FF41" },
  { id: "zap", name: "Laser Zap", type: "sawtooth", freq: 880, decay: 0.2, color: "#FF0055" },
  { id: "bell", name: "Neon Bell", type: "sine", freq: 659.25, decay: 0.6, color: "#FFE600" },
  { id: "pulse", name: "Pulse Beep", type: "square", freq: 523.25, decay: 0.25, color: "#00F0FF" },
];

interface PianoKey {
  note: string;
  keyChar: string;
  semitones: number; // relative to C4 (0)
  isBlack: boolean;
}

const PIANO_KEYS: PianoKey[] = [
  { note: "C", keyChar: "A", semitones: 0, isBlack: false },
  { note: "C#", keyChar: "W", semitones: 1, isBlack: true },
  { note: "D", keyChar: "S", semitones: 2, isBlack: false },
  { note: "D#", keyChar: "E", semitones: 3, isBlack: true },
  { note: "E", keyChar: "D", semitones: 4, isBlack: false },
  { note: "F", keyChar: "F", semitones: 5, isBlack: false },
  { note: "F#", keyChar: "T", semitones: 6, isBlack: true },
  { note: "G", keyChar: "G", semitones: 7, isBlack: false },
  { note: "G#", keyChar: "Y", semitones: 8, isBlack: true },
  { note: "A", keyChar: "H", semitones: 9, isBlack: false },
  { note: "A#", keyChar: "U", semitones: 10, isBlack: true },
  { note: "B", keyChar: "J", semitones: 11, isBlack: false },
  { note: "C", keyChar: "K", semitones: 12, isBlack: false },
];

export default function LiveWaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [visualMode, setVisualMode] = useState<"wave" | "bars">("wave");
  const [activePad, setActivePad] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [octave, setOctave] = useState<number>(4);
  const [oscType, setOscType] = useState<OscillatorType>("sawtooth");
  const [filterCutoff, setFilterCutoff] = useState<number>(3200);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const seqIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio context on demand
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, analyser: analyserRef.current! };
  };

  // Play synthesized note with frequency
  const playNoteFrequency = useCallback(
    (frequency: number, duration = 0.4) => {
      try {
        const { ctx, analyser } = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = oscType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);
        filter.Q.setValueAtTime(4, ctx.currentTime);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(analyser);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // AudioContext policy
      }
    },
    [oscType, filterCutoff]
  );

  // Calculate note frequency from semitones and octave
  const getFrequency = useCallback(
    (semitones: number) => {
      // C4 = 261.63 Hz (semitones = 0 at octave 4)
      const baseC = 261.6255653005986;
      const octaveMultiplier = Math.pow(2, octave - 4);
      return baseC * octaveMultiplier * Math.pow(2, semitones / 12);
    },
    [octave]
  );

  const triggerKeyNote = useCallback(
    (keyChar: string) => {
      const pk = PIANO_KEYS.find((k) => k.keyChar.toLowerCase() === keyChar.toLowerCase());
      if (!pk) return;

      const freq = getFrequency(pk.semitones);
      playNoteFrequency(freq, 0.45);

      setPressedKeys((prev) => ({ ...prev, [pk.keyChar]: true }));
      setTimeout(() => {
        setPressedKeys((prev) => ({ ...prev, [pk.keyChar]: false }));
      }, 300);
    },
    [getFrequency, playNoteFrequency]
  );

  // Global physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "z" || e.key === "Z") {
        setOctave((prev) => Math.max(2, prev - 1));
        return;
      }
      if (e.key === "x" || e.key === "X") {
        setOctave((prev) => Math.min(6, prev + 1));
        return;
      }

      const match = PIANO_KEYS.find((k) => k.keyChar.toLowerCase() === e.key.toLowerCase());
      if (match && !e.repeat) {
        triggerKeyNote(match.keyChar);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerKeyNote]);

  // Play synthesized preset tone
  const playSynthTone = (preset: SynthPreset) => {
    try {
      const { ctx, analyser } = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = preset.type;
      osc.frequency.setValueAtTime(preset.freq, ctx.currentTime);

      if (preset.id === "zap") {
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + preset.decay);
      }

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + preset.decay);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyser);

      osc.start();
      osc.stop(ctx.currentTime + preset.decay);

      setActivePad(preset.id);
      setTimeout(() => setActivePad(null), preset.decay * 1000);
    } catch {
      // AudioContext policy
    }
  };

  // Toggle cyber arpeggio demo sequence
  const toggleSequence = () => {
    if (isPlayingSeq) {
      if (seqIntervalRef.current) clearInterval(seqIntervalRef.current);
      setIsPlayingSeq(false);
    } else {
      setIsPlayingSeq(true);
      let step = 0;
      seqIntervalRef.current = setInterval(() => {
        const key = PIANO_KEYS[step % PIANO_KEYS.length];
        triggerKeyNote(key.keyChar);
        step++;
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (seqIntervalRef.current) clearInterval(seqIntervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Canvas visualizer render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (visualMode === "wave") {
          analyserRef.current.getByteTimeDomainData(dataArray);

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "#BF40FF";
          ctx.shadowColor = "#BF40FF";
          ctx.shadowBlur = 12;
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          analyserRef.current.getByteFrequencyData(dataArray);

          const barWidth = (width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.85;

            const grad = ctx.createLinearGradient(0, height - barHeight, 0, height);
            grad.addColorStop(0, "#00F0FF");
            grad.addColorStop(1, "#BF40FF");

            ctx.fillStyle = grad;
            ctx.shadowColor = "#00F0FF";
            ctx.shadowBlur = 8;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
          }
          ctx.shadowBlur = 0;
        }
      } else {
        // Idle ambient oscilloscope wave
        const time = Date.now() * 0.003;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(191, 64, 255, 0.4)";
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.03 + time) * 12 + Math.cos(x * 0.015 - time) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [visualMode]);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 bg-[#080914] border border-[#BF40FF]/30 rounded-2xl shadow-xl font-mono">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#BF40FF]/15 border border-[#BF40FF]/30 text-[#BF40FF]">
            <AudioLines size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider flex items-center gap-2">
              <span>QWERTY CYBER SYNTHESIZER & SCOPE</span>
              <Badge variant="outline" className="text-[9px] bg-[#BF40FF]/15 text-[#BF40FF] border-[#BF40FF]/30">
                DSP WORKBENCH
              </Badge>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setVisualMode("wave")}
              className={cn(
                "px-2.5 py-1 rounded font-bold transition-all cursor-pointer",
                visualMode === "wave"
                  ? "bg-[#BF40FF]/25 text-[#BF40FF] border border-[#BF40FF]/40"
                  : "text-[#9499B3] hover:text-white"
              )}
            >
              Waveform
            </button>
            <button
              type="button"
              onClick={() => setVisualMode("bars")}
              className={cn(
                "px-2.5 py-1 rounded font-bold transition-all cursor-pointer",
                visualMode === "bars"
                  ? "bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40"
                  : "text-[#9499B3] hover:text-white"
              )}
            >
              Spectrum
            </button>
          </div>

          {/* Arp demo toggle */}
          <Button
            size="sm"
            onClick={toggleSequence}
            className={cn(
              "h-7 text-xs font-bold transition-all",
              isPlayingSeq
                ? "bg-[#FF0055] text-white hover:bg-[#FF0055]/80 animate-pulse shadow-[0_0_10px_rgba(255,0,85,0.4)]"
                : "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40 hover:bg-[#BF40FF]/30"
            )}
          >
            {isPlayingSeq ? <Square size={11} className="mr-1.5" /> : <Play size={11} className="mr-1.5" />}
            <span>{isPlayingSeq ? "STOP ARP" : "PLAY ARP"}</span>
          </Button>
        </div>
      </div>

      {/* Canvas Scope Stage */}
      <div className="relative w-full h-36 bg-black/80 rounded-xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-2 left-2.5 flex items-center gap-2 pointer-events-none text-[9px] text-[#4F536E]">
          <Activity size={11} className="text-[#BF40FF]" />
          <span>SCOPE://REALTIME_256_FFT • OCTAVE: {octave} • WAVE: {oscType.toUpperCase()}</span>
        </div>
      </div>

      {/* Synthesizer Modulation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        {/* Waveform Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#4F536E] font-bold uppercase">Wave:</span>
          {(["sawtooth", "square", "sine", "triangle"] as OscillatorType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOscType(type)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                oscType === type
                  ? "bg-[#BF40FF]/25 text-[#BF40FF] border border-[#BF40FF]/50"
                  : "bg-white/5 text-[#9499B3] hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Octave Shifter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#4F536E] font-bold uppercase">Octave ({octave}):</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOctave((prev) => Math.max(2, prev - 1))}
              className="h-6 w-6 p-0 text-xs"
              title="Lower Octave (Z)"
            >
              <ChevronLeft size={12} />
            </Button>
            <span className="px-2 text-xs font-bold text-[#00F0FF]">C{octave}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOctave((prev) => Math.min(6, prev + 1))}
              className="h-6 w-6 p-0 text-xs"
              title="Higher Octave (X)"
            >
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>

        {/* Filter Cutoff Slider */}
        <div className="flex items-center gap-2 min-w-[160px]">
          <span className="text-[10px] text-[#4F536E] font-bold uppercase">Cutoff:</span>
          <input
            type="range"
            min={400}
            max={7000}
            step={100}
            value={filterCutoff}
            onChange={(e) => setFilterCutoff(Number(e.target.value))}
            className="flex-1 accent-[#BF40FF] h-1.5 bg-black rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-bold text-[#BF40FF]">{filterCutoff}Hz</span>
        </div>
      </div>

      {/* Interactive QWERTY Virtual Piano Keyboard */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
          <span className="uppercase font-bold">Physical Keyboard: Press [A] to [K] keys (or click piano tiles)</span>
          <span>Shift Octave: [Z] / [X]</span>
        </div>

        {/* Piano Keys Strip */}
        <div className="relative flex items-stretch h-28 bg-black/90 p-1 rounded-xl border border-white/10 select-none overflow-hidden">
          {PIANO_KEYS.map((k) => {
            const isPressed = pressedKeys[k.keyChar];
            const freq = Math.round(getFrequency(k.semitones));

            if (k.isBlack) {
              return (
                <button
                  key={`${k.note}-${k.keyChar}`}
                  type="button"
                  onClick={() => triggerKeyNote(k.keyChar)}
                  className={cn(
                    "absolute z-10 w-8 sm:w-10 h-16 -ml-4 sm:-ml-5 top-1 rounded-b-lg border border-white/20 transition-all flex flex-col justify-between items-center pb-1 text-[9px] font-mono cursor-pointer shadow-lg",
                    isPressed
                      ? "bg-[#BF40FF] text-white border-[#BF40FF] shadow-[0_0_15px_#BF40FF] translate-y-1"
                      : "bg-[#101222] text-[#9499B3] hover:bg-[#181B34] hover:text-white"
                  )}
                  style={{
                    left: `${(PIANO_KEYS.filter((pk, idx) => !pk.isBlack && idx < PIANO_KEYS.indexOf(k)).length / 8) * 100}%`,
                  }}
                >
                  <span className="font-bold text-[8px]">{k.note}</span>
                  <span className="px-1 py-0.5 rounded bg-black/60 font-black text-[#00F0FF]">{k.keyChar}</span>
                </button>
              );
            }

            return (
              <button
                key={`${k.note}-${k.keyChar}`}
                type="button"
                onClick={() => triggerKeyNote(k.keyChar)}
                className={cn(
                  "flex-1 h-full rounded-b-lg border border-white/10 transition-all flex flex-col justify-between items-center pb-2 text-[10px] font-mono cursor-pointer relative",
                  isPressed
                    ? "bg-[#00FF41]/30 text-[#00FF41] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] scale-[0.98]"
                    : "bg-white/[0.04] text-[#9499B3] hover:bg-white/[0.08] hover:text-white"
                )}
              >
                <div className="pt-2 flex flex-col items-center">
                  <span className="font-bold text-[10px]">{k.note}</span>
                  <span className="text-[8px] text-[#4F536E]">{freq}Hz</span>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-black/70 border border-white/10 font-black text-[#00FF41]">
                  {k.keyChar}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Quick Trigger Pads */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold">Quick SFX Synth Trigger Pads:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SYNTH_PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                type="button"
                onClick={() => playSynthTone(pad)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none text-center",
                  isActive
                    ? "scale-95 shadow-[0_0_15px_rgba(191,64,255,0.4)]"
                    : "hover:scale-[1.02]"
                )}
                style={{
                  background: isActive ? `${pad.color}30` : "rgba(255, 255, 255, 0.03)",
                  borderColor: isActive ? pad.color : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <span className="text-xs font-bold" style={{ color: pad.color }}>
                  {pad.name}
                </span>
                <span className="text-[9px] text-[#9499B3] font-mono">{pad.freq} Hz</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
