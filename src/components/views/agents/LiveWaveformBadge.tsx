"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Square, Play } from "lucide-react";
import { cyberSpeech } from "@/lib/cyberSpeech";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  textToSpeak: string;
  autoPlay?: boolean;
  color?: string;
}

export default function LiveWaveformBadge({
  textToSpeak,
  autoPlay = false,
  color = "#00F0FF",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const handleStart = () => setIsPlaying(true);
    const handleEnd = () => setIsPlaying(false);

    window.addEventListener("dirtynest-speech-start", handleStart);
    window.addEventListener("dirtynest-speech-end", handleEnd);

    if (autoPlay && textToSpeak) {
      cyberSpeech.speak(textToSpeak, { pitch: 1.0, rate: 1.05 });
    }

    return () => {
      window.removeEventListener("dirtynest-speech-start", handleStart);
      window.removeEventListener("dirtynest-speech-end", handleEnd);
    };
  }, [autoPlay, textToSpeak]);

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

      ctx.beginPath();
      ctx.lineWidth = isPlaying ? 2 : 1;
      ctx.strokeStyle = isPlaying ? color : "rgba(255, 255, 255, 0.2)";

      const amplitude = isPlaying ? 10 : 2;
      const frequency = isPlaying ? 0.08 : 0.03;

      for (let x = 0; x < width; x++) {
        const y =
          centerY +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI) +
          (isPlaying ? Math.sin(x * 0.15 - phase * 2) * 3 : 0);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isPlaying ? 0.15 : 0.03;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, color]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      cyberAudio.play("click");
      cyberSpeech.stop();
      setIsPlaying(false);
    } else {
      cyberAudio.play("warp");
      cyberSpeech.speak(textToSpeak, { pitch: 1.0, rate: 1.05 });
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 select-none">
      <button
        type="button"
        onClick={handleTogglePlay}
        className="text-[#00FF41] hover:text-[#00cc34] transition-colors p-0.5"
        title={isPlaying ? "Stop Voice Playback" : "Vocalize Message"}
      >
        {isPlaying ? (
          <Square size={12} className="text-red-400 fill-red-400" />
        ) : (
          <Volume2 size={13} className="text-cyan-400 hover:text-cyan-300" />
        )}
      </button>

      <canvas
        ref={canvasRef}
        width={100}
        height={24}
        className="w-[100px] h-[24px] rounded bg-black/40"
      />

      <span className="text-[9px] font-mono font-bold text-[#9499B3] uppercase">
        {isPlaying ? "VOCALIZING" : "VOICE"}
      </span>
    </div>
  );
}
