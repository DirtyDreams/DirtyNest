"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Activity, Volume2, Sparkles, Play, Square } from "lucide-react";
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

export default function LiveWaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [visualMode, setVisualMode] = useState<"wave" | "bars">("wave");
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const seqIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio context on demand
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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

  // Play synthesized tone with Web Audio API
  const playSynthTone = (preset: SynthPreset) => {
    try {
      const { ctx, analyser } = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = preset.type;
      osc.frequency.setValueAtTime(preset.freq, ctx.currentTime);

      // Pitch glide for zap
      if (preset.id === "zap") {
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + preset.decay);
      }

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, ctx.currentTime);

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
        const pad = SYNTH_PADS[step % SYNTH_PADS.length];
        playSynthTone(pad);
        step++;
      }, 350);
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

      // Subtle background grid
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
              <span>LIVE WAVEFORM VISUALIZER & SYNTH</span>
              <Badge variant="outline" className="text-[9px] bg-[#BF40FF]/15 text-[#BF40FF] border-[#BF40FF]/30">
                WEB AUDIO DSP
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
          <span>SCOPE://REALTIME_256_FFT</span>
        </div>
      </div>

      {/* Interactive Cyber Synth Pads */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold">Interactive Synth Trigger Pads:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SYNTH_PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                type="button"
                onClick={() => playSynthTone(pad)}
                className={cn(
                  "p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center",
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
