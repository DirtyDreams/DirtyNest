"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, Square, X, Activity } from "lucide-react";
import { cyberSpeech, AGENT_VOICE_PROFILES } from "@/lib/cyberSpeech";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TACTICAL_SCRIPTS = [
  "All 16 operational decks are online with zero unhandled errors. Ready for mission directives.",
  "AST compilation complete. Zero memory contention leaks detected across the kernel.",
  "Security threat radar: Port 3000 boundary isolation verified. Zero open CVE vulnerabilities.",
  "Autonomous SRE: Service mesh canary rollout staged to Kubernetes cluster at 10% traffic.",
  "Paperclip Heartbeat pulse cycle acknowledged. Monthly spend within dual-threshold bounds.",
];

export default function AgentVoiceSynthesizerModal({ isOpen, onClose }: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("tech-lead");
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(1.05);
  const [customText, setCustomText] = useState<string>(TACTICAL_SCRIPTS[0]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const selectedProfile =
    AGENT_VOICE_PROFILES.find((p) => p.id === selectedProfileId) || AGENT_VOICE_PROFILES[0];

  useEffect(() => {
    setPitch(selectedProfile.pitch);
    setRate(selectedProfile.rate);
  }, [selectedProfile]);

  // Speech event listeners
  useEffect(() => {
    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => setIsSpeaking(false);

    window.addEventListener("dirtynest-speech-start", handleStart);
    window.addEventListener("dirtynest-speech-end", handleEnd);
    return () => {
      window.removeEventListener("dirtynest-speech-start", handleStart);
      window.removeEventListener("dirtynest-speech-end", handleEnd);
      cyberSpeech.stop();
    };
  }, []);

  // HTML5 Canvas Waveform Oscilloscope Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let y = 10; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw primary voice wave
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSpeaking ? selectedProfile.color : "rgba(255, 255, 255, 0.2)";

      const amplitude = isSpeaking ? 28 : 3;
      const frequency = isSpeaking ? 0.04 * rate : 0.01;

      for (let x = 0; x < width; x++) {
        const y =
          centerY +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI) +
          (isSpeaking ? Math.sin(x * 0.08 - phase * 1.5) * 6 : 0);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary harmonic glow wave
      if (isSpeaking) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        for (let x = 0; x < width; x++) {
          const y =
            centerY +
            Math.sin(x * (frequency * 1.5) - phase) * (amplitude * 0.6) * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += isSpeaking ? 0.12 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking, selectedProfile.color, rate]);

  const handleSpeak = (textToSpeak?: string) => {
    const text = textToSpeak || customText;
    if (!text.trim()) return;
    cyberAudio.play("warp");
    cyberSpeech.speak(text, {
      pitch,
      rate,
    });
  };

  const handleStop = () => {
    cyberAudio.play("click");
    cyberSpeech.stop();
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
        className="w-full max-w-3xl max-h-[90vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Mic size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  AGENT VOICE TTS SYNTHESIZER STUDIO // <span className="text-[#00FF41]">WEB SPEECH API</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  100% FRONTEND
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Procedural vocal synthesis, pitch/rate modulation & real-time canvas waveform oscilloscope
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberSpeech.stop();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Agent Persona Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {AGENT_VOICE_PROFILES.map((prof) => (
              <button
                key={prof.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedProfileId(prof.id);
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  selectedProfileId === prof.id
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                }`}
                style={{
                  borderColor: selectedProfileId === prof.id ? prof.color : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{prof.avatar}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: prof.color }}
                  />
                </div>
                <div className="font-bold text-[11px] truncate">{prof.name}</div>
                <div className="text-[8px] text-slate-500 truncate">{prof.role}</div>
              </button>
            ))}
          </div>

          {/* Waveform Oscilloscope Screen */}
          <div className="rounded-xl border border-white/10 bg-black/90 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
              <div className="flex items-center gap-1.5">
                <Activity size={13} className={isSpeaking ? "text-[#00FF41] animate-pulse" : "text-slate-600"} />
                <span>VOCAL_FREQUENCY_OSCILLOSCOPE</span>
              </div>
              <span className={isSpeaking ? "text-[#00FF41]" : "text-slate-600"}>
                {isSpeaking ? "SYNTHESIZING AUDIO..." : "STANDBY"}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={650}
              height={90}
              className="w-full h-[90px] rounded-lg bg-black/60 border border-white/5"
            />
          </div>

          {/* Formant Modulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 cyber-card p-3 border border-white/10 bg-[#0B0C16]">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">PITCH (Tonacja):</span>
                <span className="text-white font-mono">{pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">RATE (Tempo):</span>
                <span className="text-white font-mono">{rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41]"
              />
            </div>
          </div>

          {/* Quick Script Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Quick Mission Reports:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TACTICAL_SCRIPTS.map((script, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomText(script);
                    handleSpeak(script);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 text-left cursor-pointer transition-all hover:text-white"
                >
                  &quot;{script.substring(0, 48)}...&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Custom Textarea & Speak Trigger */}
          <div className="space-y-2">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={2}
              placeholder="Type any custom directive for the agent to vocalize..."
              className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none font-mono focus:border-[#00FF41]/50"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all"
                >
                  <Volume2 size={15} />
                  <span>VOCALIZE AS {selectedProfile.name}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 cursor-pointer font-bold"
                  >
                    <Square size={13} />
                    <span>STOP</span>
                  </button>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {customText.length} CHARS • NATIVE WEB SPEECH
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
