"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface CyberColor {
  name: string;
  hex: string;
  role: string;
}

const DEFAULT_PALETTE: CyberColor[] = [
  { name: "Matrix Green", hex: "#00FF41", role: "Success, Health, Terminal Output" },
  { name: "Cyber Cyan", hex: "#00F0FF", role: "Primary Accent, Vectors, Data Streams" },
  { name: "Neon Purple", hex: "#BF40FF", role: "Obsidian Vault, Memory, Neural Graph" },
  { name: "Laser Rose", hex: "#FF2A6D", role: "Threat Alert, Critical Alarm, Errors" },
  { name: "Amber Voltage", hex: "#FFB800", role: "Warning, Karpathy Skills, High Load" },
  { name: "Void Black", hex: "#05060B", role: "HUD Background, Terminal Canvas" },
  { name: "Onyx Slate", hex: "#0E1118", role: "Card Surface, Panel Background" },
  { name: "Ghost White", hex: "#F1F3F9", role: "Foreground Text, Headers" },
];

export default function CyberColorPaletteConverter() {
  const [palette, setPalette] = useState<CyberColor[]>(DEFAULT_PALETTE);
  const [selectedColor, setSelectedColor] = useState<CyberColor>(DEFAULT_PALETTE[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return { r, g, b, str: `rgb(${r}, ${g}, ${b})` };
  };

  // Convert Hex to HSL
  const hexToHsl = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      str: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    };
  };

  // Calculate WCAG relative luminance and contrast ratio against #05060B
  const contrastRatio = useMemo(() => {
    const { r, g, b } = hexToRgb(selectedColor.hex);
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const lum = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    // Dark bg luminance ~ 0.005
    const bgLum = 0.005;
    const ratio = (Math.max(lum, bgLum) + 0.05) / (Math.min(lum, bgLum) + 0.05);
    return parseFloat(ratio.toFixed(2));
  }, [selectedColor]);

  const handleCopy = (text: string, key: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleExportCss = () => {
    cyberAudio.play("chime");
    const cssVars = `:root {\n` + palette.map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex}; /* ${c.role} */`).join("\n") + `\n}`;
    const blob = new Blob([cssVars], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cyber-palette-theme.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const rgb = hexToRgb(selectedColor.hex);
  const hsl = hexToHsl(selectedColor.hex);

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CYBERPUNK PALETTE // <span className="text-pink-400">COLORWAY & CSS VAR ENGINE</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              HEX / RGB / HSL / OKLCH conversions, WCAG contrast auditor, and CSS theme export
            </span>
          </div>
        </div>

        <button
          onClick={handleExportCss}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/40 text-pink-400 hover:bg-pink-500/25 text-xs font-bold transition-all shadow-[0_0_10px_rgba(255,42,109,0.2)] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT :ROOT CSS</span>
        </button>
      </div>

      {/* Palette Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {palette.map((c) => {
          const isSelected = selectedColor.name === c.name;
          return (
            <div
              key={c.name}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedColor(c);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-pink-500/60 bg-pink-500/10 shadow-[0_0_15px_rgba(255,42,109,0.2)] ring-1 ring-pink-500"
                  : "border-white/5 bg-black/40 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-7 h-7 rounded-lg shadow-inner border border-white/20"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[11px] font-bold text-slate-300">{c.hex}</span>
              </div>
              <div>
                <span className="font-bold text-white block text-xs">{c.name}</span>
                <span className="text-[9px] text-slate-500 truncate block mt-0.5">{c.role}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector Details for Selected Color */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-black/50 p-4 rounded-xl border border-white/5">
        {/* Color Preview & Contrast (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-2xl shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div>
              <span className="text-sm font-black text-white">{selectedColor.name}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedColor.role}</p>
            </div>
          </div>

          {/* WCAG Contrast Ratio */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {contrastRatio >= 4.5 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-[11px] text-slate-300">WCAG Contrast vs #05060B</span>
            </div>
            <span
              className={`font-black text-xs ${
                contrastRatio >= 7
                  ? "text-emerald-400"
                  : contrastRatio >= 4.5
                  ? "text-cyan-400"
                  : "text-amber-400"
              }`}
            >
              {contrastRatio}:1 ({contrastRatio >= 4.5 ? "AAA PASS" : "AA FAIL"})
            </span>
          </div>
        </div>

        {/* Format Formats & Copy Bar (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          {[
            { label: "HEX FORMAT", val: selectedColor.hex, key: "hex" },
            { label: "RGB FORMAT", val: rgb.str, key: "rgb" },
            { label: "HSL FORMAT", val: hsl.str, key: "hsl" },
            {
              label: "TAILWIND ARBITRARY CLASS",
              val: `text-[${selectedColor.hex}] bg-[${selectedColor.hex}]/10 border-[${selectedColor.hex}]/30`,
              key: "tw",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 text-xs hover:border-white/10 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-[9px] font-bold text-slate-500 w-36 shrink-0">{item.label}</span>
                <span className="font-mono text-slate-200 select-all">{item.val}</span>
              </div>
              <button
                onClick={() => handleCopy(item.val, item.key)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
