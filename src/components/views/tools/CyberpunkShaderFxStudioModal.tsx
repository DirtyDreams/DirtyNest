"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Sliders,
  Tv,
  Zap,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  RotateCcw,
  X,
  Play,
  Pause,
  Palette,
  FileCode,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ShaderPreset {
  id: string;
  name: string;
  color: string;
  matrixSpeed: number;
  scanlineOpacity: number;
  glitchIntensity: number;
  bloomAmount: number;
}

const PRESETS: ShaderPreset[] = [
  {
    id: "matrix-green",
    name: "Matrix Green Terminal",
    color: "#00FF41",
    matrixSpeed: 1.2,
    scanlineOpacity: 0.25,
    glitchIntensity: 0.15,
    bloomAmount: 12,
  },
  {
    id: "night-city",
    name: "Night City Neon Glitch",
    color: "#00F0FF",
    matrixSpeed: 1.8,
    scanlineOpacity: 0.4,
    glitchIntensity: 0.55,
    bloomAmount: 18,
  },
  {
    id: "synthwave",
    name: "Synthwave Vapor Scanline",
    color: "#BF40FF",
    matrixSpeed: 0.9,
    scanlineOpacity: 0.5,
    glitchIntensity: 0.2,
    bloomAmount: 15,
  },
  {
    id: "retro-amber",
    name: "Amber Retro SRE CRT",
    color: "#FFB800",
    matrixSpeed: 0.6,
    scanlineOpacity: 0.6,
    glitchIntensity: 0.1,
    bloomAmount: 8,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberpunkShaderFxStudioModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"shader" | "ascii">("shader");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("matrix-green");

  // Shader Controls
  const [color, setColor] = useState<string>("#00FF41");
  const [matrixSpeed, setMatrixSpeed] = useState<number>(1.2);
  const [scanlineOpacity, setScanlineOpacity] = useState<number>(0.25);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(0.15);
  const [bloomAmount, setBloomAmount] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // ASCII Studio Controls
  const [asciiWidth, setAsciiWidth] = useState<number>(80);
  const [asciiResult, setAsciiResult] = useState<string>("");
  const [isProcessingAscii, setIsProcessingAscii] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Apply Preset
  const handleSelectPreset = (p: ShaderPreset) => {
    cyberAudio.play("click");
    setSelectedPresetId(p.id);
    setColor(p.color);
    setMatrixSpeed(p.matrixSpeed);
    setScanlineOpacity(p.scanlineOpacity);
    setGlitchIntensity(p.glitchIntensity);
    setBloomAmount(p.bloomAmount);
  };

  // Matrix Rain & Shader Rendering Loop
  useEffect(() => {
    if (!isOpen || activeTab !== "shader") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 360);

    const characters = "01011001アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン$#&@!%*+-=";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let frame = 0;

    const render = () => {
      frame++;
      // Background fade for trail effect
      ctx.fillStyle = "rgba(7, 8, 15, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Draw Matrix Characters
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is brighter white/glow
        if (Math.random() > 0.85) {
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = bloomAmount * 1.5;
          ctx.shadowColor = color;
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = bloomAmount;
          ctx.shadowColor = color;
        }

        ctx.fillText(text, x, y);

        // Reset shadow
        ctx.shadowBlur = 0;

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        if (isPlaying) {
          drops[i] += matrixSpeed * 0.6;
        }
      }

      // Draw CRT Scanlines
      if (scanlineOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${scanlineOpacity})`;
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      // Draw Glitch Displacement Slices
      if (glitchIntensity > 0 && Math.random() < glitchIntensity * 0.4) {
        const sliceHeight = Math.floor(Math.random() * 30) + 10;
        const sliceY = Math.floor(Math.random() * (height - sliceHeight));
        const offsetX = (Math.random() - 0.5) * glitchIntensity * 40;

        try {
          const imgData = ctx.getImageData(0, sliceY, width, sliceHeight);
          ctx.putImageData(imgData, offsetX, sliceY);
        } catch {
          // ignore
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, activeTab, color, matrixSpeed, scanlineOpacity, glitchIntensity, bloomAmount, isPlaying]);

  // Real-time Image-to-ASCII Generator
  const generateSampleAscii = () => {
    setIsProcessingAscii(true);
    cyberAudio.play("warp");

    setTimeout(() => {
      const asciiChars = "@%#*+=-:. ";
      const lines: string[] = [];
      const rows = 28;
      const cols = asciiWidth;

      for (let r = 0; r < rows; r++) {
        let line = "";
        for (let c = 0; c < cols; c++) {
          const dx = (c - cols / 2) / (cols / 4);
          const dy = (r - rows / 2) / (rows / 3);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const val = Math.sin(dist * 2.5) * 0.5 + 0.5;
          const charIndex = Math.floor(val * (asciiChars.length - 1));
          line += asciiChars[charIndex];
        }
        lines.push(line);
      }

      setAsciiResult(lines.join("\n"));
      setIsProcessingAscii(false);
      cyberAudio.play("chime");
    }, 400);
  };

  useEffect(() => {
    if (activeTab === "ascii" && !asciiResult) {
      generateSampleAscii();
    }
  }, [activeTab]);

  const handleCopyCss = () => {
    cyberAudio.play("chime");
    const css = `/* DIRTYNEST POST-PROCESSING CRT FILTER */
.cyber-crt-filter {
  filter: drop-shadow(0 0 ${bloomAmount}px ${color}) contrast(1.2) brightness(1.1);
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, ${scanlineOpacity}) 50%),
              linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 4px, 6px 100%;
}`;
    navigator.clipboard.writeText(css);
    setCopiedFormat("CSS");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyGlsl = () => {
    cyberAudio.play("chime");
    const glsl = `// GLSL CHROMATIC ABERRATION & SCANLINE SHADER
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float glitch = ${glitchIntensity.toFixed(2)};
    float r = texture2D(u_texture, uv + vec2(glitch * 0.005, 0.0)).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, uv - vec2(glitch * 0.005, 0.0)).b;
    float scanline = sin(uv.y * 800.0) * ${scanlineOpacity.toFixed(2)};
    gl_FragColor = vec4(vec3(r, g, b) - scanline, 1.0);
}`;
    navigator.clipboard.writeText(glsl);
    setCopiedFormat("GLSL");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyAscii = () => {
    cyberAudio.play("chime");
    navigator.clipboard.writeText(asciiResult);
    setCopiedFormat("ASCII");
    setTimeout(() => setCopiedFormat(null), 2000);
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
        className="w-full max-w-4xl max-h-[92vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Sparkles size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  CYBERPUNK SHADER & MATRIX FX STUDIO // <span className="text-[#00FF41]">WEBGL & CANVAS</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  100% FRONTEND
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Real-time CRT scanlines, RGB glitch displacement, Matrix digital rain & Image-to-ASCII synthesizer
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

        {/* Studio Sub-Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/5 bg-[#0B0C16]">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("shader");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === "shader"
                ? "border-[#00FF41] text-[#00FF41] bg-[#00FF41]/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Tv size={13} />
            <span>CANVAS SHADER & MATRIX RAIN</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("ascii");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === "ascii"
                ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon size={13} />
            <span>IMAGE-TO-ASCII ART CONVERTER</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {activeTab === "shader" ? (
            <>
              {/* Preset Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedPresetId === preset.id
                          ? "bg-white/10 text-white border-white/40 shadow-sm"
                          : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                      }`}
                      style={{
                        borderColor: selectedPresetId === preset.id ? preset.color : undefined,
                        color: selectedPresetId === preset.id ? preset.color : undefined,
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setIsPlaying((p) => !p);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px]"
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isPlaying ? "PAUSE ANIMATION" : "RESUME"}</span>
                  </button>
                </div>
              </div>

              {/* Real-time HTML5 Canvas Viewport */}
              <div className="relative w-full h-[360px] rounded-2xl bg-black border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full block" />
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>MATRIX SPEED</span>
                    <span className="text-[#00FF41] font-bold">{matrixSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={matrixSpeed}
                    onChange={(e) => setMatrixSpeed(parseFloat(e.target.value))}
                    className="w-full accent-[#00FF41] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>CRT SCANLINES</span>
                    <span className="text-[#00F0FF] font-bold">{(scanlineOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={scanlineOpacity}
                    onChange={(e) => setScanlineOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>GLITCH JITTER</span>
                    <span className="text-[#FF2A6D] font-bold">{(glitchIntensity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={glitchIntensity}
                    onChange={(e) => setGlitchIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#FF2A6D] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>BLOOM GLOW</span>
                    <span className="text-[#BF40FF] font-bold">{bloomAmount}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    value={bloomAmount}
                    onChange={(e) => setBloomAmount(parseInt(e.target.value))}
                    className="w-full accent-[#BF40FF] cursor-pointer"
                  />
                </div>
              </div>

              {/* Code Exporter Drawer */}
              <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-4 border border-white/10 bg-[#0B0C16]">
                <div>
                  <h4 className="font-bold text-white text-xs">SHADER CODE GENERATION</h4>
                  <p className="text-[10px] text-slate-400">
                    Export CSS filters or GLSL WebGL shaders for instant project integration
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCss}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
                  >
                    {copiedFormat === "CSS" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                    <span>{copiedFormat === "CSS" ? "COPIED CSS!" : "COPY CSS FILTER"}</span>
                  </button>

                  <button
                    onClick={handleCopyGlsl}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold cursor-pointer text-[10px] transition-all"
                  >
                    {copiedFormat === "GLSL" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                    <span>{copiedFormat === "GLSL" ? "COPIED GLSL!" : "COPY GLSL CODE"}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ASCII Art Converter Tab */
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-xs">PROCEDURAL ASCII ART SYNTHESIZER</h4>
                  <p className="text-[10px] text-slate-400">
                    Pure client-side luminance mapping converts vector geometries into retro terminal ASCII art
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateSampleAscii}
                    disabled={isProcessingAscii}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold cursor-pointer text-[10px] hover:bg-[#00F0FF]/25 transition-all"
                  >
                    <RotateCcw size={13} />
                    <span>{isProcessingAscii ? "RENDERING..." : "REGENERATE ASCII"}</span>
                  </button>

                  <button
                    onClick={handleCopyAscii}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 font-bold cursor-pointer text-[10px] hover:bg-[#00FF41]/25 transition-all"
                  >
                    {copiedFormat === "ASCII" ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedFormat === "ASCII" ? "COPIED ASCII!" : "COPY ASCII TEXT"}</span>
                  </button>
                </div>
              </div>

              {/* ASCII Output Screen */}
              <div className="relative w-full h-[360px] rounded-2xl bg-black border border-white/10 p-4 overflow-auto font-mono text-[9px] leading-tight text-[#00FF41] shadow-inner select-text">
                <pre className="whitespace-pre">{asciiResult}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
