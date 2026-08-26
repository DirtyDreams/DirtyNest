"use client";

import { useState } from "react";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Sparkles,
  Layers,
  Split,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  imageUrl: string;
  title: string;
  aspectRatio: string;
  isGenerating: boolean;
  onOpenToolbox?: () => void;
}

export default function ImageCanvasPreview({
  imageUrl,
  title,
  aspectRatio,
  isGenerating,
  onOpenToolbox,
}: Props) {
  const [zoom, setZoom] = useState(100);
  const [showSplit, setShowSplit] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    cyberAudio.play("chime");
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `dirtynest-${Date.now()}.png`;
    a.click();
  };

  const ratioClass =
    aspectRatio === "16:9"
      ? "aspect-video"
      : aspectRatio === "9:16"
      ? "aspect-[9/16] max-h-[500px]"
      : aspectRatio === "4:5"
      ? "aspect-[4/5] max-h-[500px]"
      : "aspect-square";

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3 font-mono select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-[#00FF41]" />
          <span className="font-black text-[#F1F3F9] truncate max-w-xs">{title}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#00F0FF] border border-white/10 font-bold">
            {aspectRatio} · 2048x1152 (2K)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSplit(!showSplit)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
              showSplit
                ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40"
                : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
            }`}
            title="Toggle Raw Latent vs Refined Split View"
          >
            <Split size={13} />
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/5 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] text-[#4F536E] px-1">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/5 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/5 cursor-pointer ml-1"
            title="Copy URL"
          >
            {copied ? <Check size={13} className="text-[#00FF41]" /> : <Share2 size={13} />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00FF41] text-black font-bold text-xs hover:bg-[#00cc34] cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.3)] ml-1"
          >
            <Download size={12} />
            <span>EXPORT PNG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full rounded-2xl bg-black/90 border border-white/10 overflow-hidden flex items-center justify-center p-2 min-h-[380px]">
        {isGenerating && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl border-2 border-[#00FF41] border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_20px_#00FF41]" />
            <span className="text-xs font-bold text-[#00FF41] tracking-wider animate-pulse">
              SAMPLING DIFFUSION LATENTS (STEP 24/30)...
            </span>
          </div>
        )}

        {/* Viewport Frame */}
        <div
          className={`relative w-full ${ratioClass} rounded-xl overflow-hidden shadow-2xl border border-white/5 transition-transform`}
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Main Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* Before/After Split Line if enabled */}
          {showSplit && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${splitPos}%` }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 brightness-75"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  width: `${(100 / splitPos) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Split Handle */}
          {showSplit && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#00FF41] cursor-ew-resize shadow-[0_0_10px_#00FF41]"
              style={{ left: `${splitPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#00FF41] text-black text-[9px] font-black flex items-center justify-center">
                ⇄
              </div>
            </div>
          )}

          {/* Overlay CRT Grid Scanlines */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />
        </div>
      </div>
    </div>
  );
}
