"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Terminal } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function MatrixRainZenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 140;

    const characters = "01010101アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF";
    const fontSize = 11;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columns }).fill(1) as number[];

    let animationId: number;

    const draw = () => {
      if (!isRunning) return;

      ctx.fillStyle = "rgba(8, 9, 18, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00FF41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    if (isRunning) {
      animationId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRunning]);

  const toggleRunning = () => {
    cyberAudio.play("click");
    setIsRunning(!isRunning);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-3 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Terminal size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              MATRIX DIGITAL RAIN // ZEN
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              HTML5 High-Performance Glyphs
            </span>
          </div>
        </div>

        <button
          onClick={toggleRunning}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00FF41] font-bold cursor-pointer transition-all"
        >
          {isRunning ? <Pause size={11} /> : <Play size={11} />}
          <span>{isRunning ? "PAUSE" : "RESUME"}</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="w-full h-36 rounded-xl overflow-hidden bg-[#05060A] border border-white/5 relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
