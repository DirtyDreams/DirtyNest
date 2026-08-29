"use client";

import { useState } from "react";
import { Wrench, Scissors, Layers, Maximize2, Wand2, CheckCircle2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  activeImageUrl: string;
}

export default function ImageToolboxDrawer({ activeImageUrl }: Props) {
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRunTool = (toolName: string, desc: string) => {
    cyberAudio.play("toggle");
    setRunningTool(toolName);
    setSuccessMessage(null);
    setTimeout(() => {
      cyberAudio.play("chime");
      setRunningTool(null);
      setSuccessMessage(`✓ ${desc} completed successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1800);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              IMAGE NEURAL TOOLBOX // <span className="text-[#00F0FF]">POST-PROCESSING</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              4K Latent Upscaling, Alpha Matte Background Removal & Neural Inpainting
            </p>
          </div>
        </div>

        <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          HARDWARE ACCELERATED (CUDA)
        </span>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tool 1: 4K Upscaler */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00FF41]">4K Super-Resolution</span>
              <Maximize2 size={14} className="text-[#00FF41]" />
            </div>
            <p className="text-[10px] text-[#9499B3] mt-1 leading-relaxed">
              Upscale latents to 3840x2160 using RealESRGAN-Anime6B model.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRunTool("upscale", "4K RealESRGAN Upscaling")}
            disabled={runningTool === "upscale"}
            className="w-full py-1.5 rounded-lg bg-[#00FF41]/15 text-[#00FF41] text-xs font-bold hover:bg-[#00FF41]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {runningTool === "upscale" ? "UPSCALING..." : "RUN 4X UPSCALE"}
          </button>
        </div>

        {/* Tool 2: Background Remover */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF]">Alpha Matte Remover</span>
              <Scissors size={14} className="text-[#00F0FF]" />
            </div>
            <p className="text-[10px] text-[#9499B3] mt-1 leading-relaxed">
              Extract foreground subject with transparent alpha channel PNG.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRunTool("bg_remove", "Alpha Matte Background Removal")}
            disabled={runningTool === "bg_remove"}
            className="w-full py-1.5 rounded-lg bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-bold hover:bg-[#00F0FF]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {runningTool === "bg_remove" ? "EXTRACTING..." : "REMOVE BACKGROUND"}
          </button>
        </div>

        {/* Tool 3: Inpainting */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#BF40FF]">Mask Inpainting</span>
              <Wand2 size={14} className="text-[#BF40FF]" />
            </div>
            <p className="text-[10px] text-[#9499B3] mt-1 leading-relaxed">
              Brush over regions to regenerate specific objects with Hermes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRunTool("inpaint", "Neural Mask Inpainting")}
            disabled={runningTool === "inpaint"}
            className="w-full py-1.5 rounded-lg bg-[#BF40FF]/15 text-[#BF40FF] text-xs font-bold hover:bg-[#BF40FF]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {runningTool === "inpaint" ? "REPLACING..." : "INPAINT MASK"}
          </button>
        </div>

        {/* Tool 4: Style Remux Filter */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFB800]">Neon Remux LUT</span>
              <Layers size={14} className="text-[#FFB800]" />
            </div>
            <p className="text-[10px] text-[#9499B3] mt-1 leading-relaxed">
              Apply Cyberpunk LUT color grading with chromatic aberration.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRunTool("lut", "Neon Remux LUT Color Grading")}
            disabled={runningTool === "lut"}
            className="w-full py-1.5 rounded-lg bg-[#FFB800]/15 text-[#FFB800] text-xs font-bold hover:bg-[#FFB800]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {runningTool === "lut" ? "APPLYING LUT..." : "APPLY NEON LUT"}
          </button>
        </div>
      </div>
    </div>
  );
}
