"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Sliders, Download, RotateCcw, Zap, Eye, Flame, Wand2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cyberAudio } from "@/lib/cyberAudio";
import { toast } from "sonner";

interface FilterParams {
  rgbShift: number; // 0 - 20
  scanlines: number; // 0 - 100
  noise: number; // 0 - 50
  invert: boolean;
  neonGlow: boolean;
  contrast: number; // 50 - 200
  hueRotate: number; // 0 - 360
}

const DEFAULT_PARAMS: FilterParams = {
  rgbShift: 6,
  scanlines: 40,
  noise: 15,
  invert: false,
  neonGlow: true,
  contrast: 120,
  hueRotate: 0,
};

export default function CyberGlitchFilterStage({ initialImageUrl }: { initialImageUrl?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<FilterParams>(DEFAULT_PARAMS);
  const [activePreset, setActivePreset] = useState<string>("cyber");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(
    initialImageUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"
  );

  const PRESETS: Record<string, { name: string; params: FilterParams }> = {
    cyber: {
      name: "Cyber Neon Matrix",
      params: { rgbShift: 8, scanlines: 35, noise: 12, invert: false, neonGlow: true, contrast: 130, hueRotate: 0 },
    },
    anaglyph: {
      name: "3D RGB Displace",
      params: { rgbShift: 16, scanlines: 0, noise: 5, invert: false, neonGlow: false, contrast: 110, hueRotate: 45 },
    },
    vhs: {
      name: "Retro CRT VHS Tape",
      params: { rgbShift: 5, scanlines: 70, noise: 35, invert: false, neonGlow: false, contrast: 90, hueRotate: 180 },
    },
    abyss: {
      name: "Ghost In The Shell",
      params: { rgbShift: 12, scanlines: 50, noise: 20, invert: true, neonGlow: true, contrast: 150, hueRotate: 270 },
    },
  };

  const applyPreset = (key: string) => {
    cyberAudio.play("click");
    setActivePreset(key);
    setParams(PRESETS[key].params);
  };

  // Render canvas filter pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;

      // Base draw
      ctx.filter = `contrast(${params.contrast}%) hue-rotate(${params.hueRotate}deg) ${params.invert ? "invert(100%)" : ""}`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      const w = canvas.width;
      const h = canvas.height;

      // RGB Shift Effect
      if (params.rgbShift > 0) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const shift = Math.floor(params.rgbShift);

        const copyData = new Uint8ClampedArray(data);

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const rOffset = (y * w + Math.min(w - 1, x + shift)) * 4;
            const bOffset = (y * w + Math.max(0, x - shift)) * 4;

            data[i] = copyData[rOffset]; // Red from right
            data[i + 2] = copyData[bOffset + 2]; // Blue from left
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Scanlines
      if (params.scanlines > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${params.scanlines / 140})`;
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 2);
        }
      }

      // Noise Overlay
      if (params.noise > 0) {
        const noiseData = ctx.getImageData(0, 0, w, h);
        const nd = noiseData.data;
        const amount = params.noise * 2.5;

        for (let i = 0; i < nd.length; i += 4) {
          const rand = (Math.random() - 0.5) * amount;
          nd[i] += rand;
          nd[i + 1] += rand;
          nd[i + 2] += rand;
        }
        ctx.putImageData(noiseData, 0, 0);
      }

      // Neon Border Glow
      if (params.neonGlow) {
        ctx.strokeStyle = "#00FF41";
        ctx.lineWidth = 6;
        ctx.shadowColor = "#00FF41";
        ctx.shadowBlur = 20;
        ctx.strokeRect(3, 3, w - 6, h - 6);
        ctx.shadowBlur = 0;
      }
    };
  }, [imageUrl, params]);

  const handleDownload = () => {
    cyberAudio.play("chime");
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `cyber-glitch-${Date.now()}.png`;
      a.click();
      toast.success("Processed glitch image exported!");
    } catch {
      toast.error("Failed to export image.");
    }
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 bg-[#080914] border border-[#00FF41]/30 rounded-2xl shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41]">
            <Wand2 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider flex items-center gap-2">
              <span>CYBER GLITCH & NEON FILTER LAB</span>
              <Badge variant="outline" className="text-[9px] bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30">
                GPU POST-PROCESSING
              </Badge>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="h-8 text-xs font-bold text-[#9499B3] hover:text-white"
          >
            <RotateCcw size={12} className="mr-1.5" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
          >
            <Download size={12} className="mr-1.5" />
            <span>Export PNG</span>
          </Button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold shrink-0">Presets:</span>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap",
              activePreset === key
                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : "bg-black/50 border-white/10 text-[#9499B3] hover:text-white"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Stage (7 cols) + Right Controls (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Display Stage */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="relative w-full aspect-video bg-black/80 rounded-xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain block" />
            <div className="absolute top-2 left-2.5 flex items-center gap-2 pointer-events-none text-[9px] text-[#4F536E]">
              <Eye size={11} className="text-[#00FF41]" />
              <span>LIVE_SHADER_GLITCH_BUFFER</span>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-5 flex flex-col gap-3 p-3.5 rounded-xl bg-black/40 border border-white/10">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Shader Modulation Parameters:</span>

          {/* RGB Shift */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9499B3]">RGB Channel Shift</span>
              <span className="text-[#00F0FF] font-bold">{params.rgbShift} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={params.rgbShift}
              onChange={(e) => setParams({ ...params, rgbShift: Number(e.target.value) })}
              className="accent-[#00F0FF] cursor-pointer h-1.5 bg-black rounded-lg"
            />
          </div>

          {/* CRT Scanlines */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9499B3]">CRT Scanlines Density</span>
              <span className="text-[#00FF41] font-bold">{params.scanlines}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={params.scanlines}
              onChange={(e) => setParams({ ...params, scanlines: Number(e.target.value) })}
              className="accent-[#00FF41] cursor-pointer h-1.5 bg-black rounded-lg"
            />
          </div>

          {/* Noise Static */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9499B3]">VHS Static Noise</span>
              <span className="text-[#BF40FF] font-bold">{params.noise}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={2}
              value={params.noise}
              onChange={(e) => setParams({ ...params, noise: Number(e.target.value) })}
              className="accent-[#BF40FF] cursor-pointer h-1.5 bg-black rounded-lg"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9499B3]">Dynamic Contrast</span>
              <span className="text-white font-bold">{params.contrast}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              step={5}
              value={params.contrast}
              onChange={(e) => setParams({ ...params, contrast: Number(e.target.value) })}
              className="accent-white cursor-pointer h-1.5 bg-black rounded-lg"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ ...params, neonGlow: !params.neonGlow })}
              className={cn(
                "text-xs font-bold h-8",
                params.neonGlow ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40" : "text-[#9499B3]"
              )}
            >
              Neon Frame Glow
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ ...params, invert: !params.invert })}
              className={cn(
                "text-xs font-bold h-8",
                params.invert ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/40" : "text-[#9499B3]"
              )}
            >
              Invert Spectrum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
