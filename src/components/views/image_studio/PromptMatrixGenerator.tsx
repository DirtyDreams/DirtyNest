"use client";

import { useState } from "react";
import { Sparkles, Sliders, Wand2, RefreshCw, Layers, ShieldCheck, Flame } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface StylePreset {
  id: string;
  name: string;
  color: string;
  promptSuffix: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: "cyberpunk", name: "Cyberpunk 2077", color: "#00FF41", promptSuffix: "cyberpunk aesthetic, neon lighting, volumetric fog, high-tech obsidian architecture, 8k resolution, octane render" },
  { id: "synthwave", name: "Outrun Synthwave", color: "#BF40FF", promptSuffix: "synthwave outrun, retro 80s grid, neon magenta and cyan sunset, chrome reflections, vaporwave VHS grain" },
  { id: "mecha", name: "Anime Mecha Sci-Fi", color: "#00F0FF", promptSuffix: "detailed anime mecha design, dynamic combat pose, mechanical joints, glowing energy conduits, Studio Trigger style" },
  { id: "dark_voxel", name: "Dark Military Voxel", color: "#FFB800", promptSuffix: "tactical military operative, night vision goggles, ballistic armor, rain-slicked concrete, cinematic Unreal Engine 5 lighting" },
];

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  stylePreset: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:5";
  steps: number;
  cfgScale: number;
  seed: number;
}

interface Props {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

export default function PromptMatrixGenerator({ onGenerate, isGenerating }: Props) {
  const [prompt, setPrompt] = useState(
    "Cinematic shot of an autonomous AI sentinel patrolling a neon-lit cyberpunk metropolis, rain reflections, volumetric laser fog"
  );
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, deformed, artifacts, text watermark, oversaturated");
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:5">("16:9");
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(8492041);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = () => {
    cyberAudio.play("toggle");
    setIsEnhancing(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsEnhancing(false);
      setPrompt((prev) => `${prev}, highly detailed, raytraced reflections, unreal engine 5 render, global illumination, trending on artstation`);
    }, 1200);
  };

  const handleRandomSeed = () => {
    cyberAudio.play("click");
    setSeed(Math.floor(Math.random() * 9000000 + 1000000));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    cyberAudio.play("toggle");
    onGenerate({
      prompt,
      negativePrompt,
      stylePreset: selectedStyle,
      aspectRatio,
      steps,
      cfgScale,
      seed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Wand2 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              PROMPT MATRIX GENERATOR // <span className="text-[#00FF41]">HERMES ENHANCED</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Text-to-Image neural synthesis with Hermes prompt expansion & style tokens
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnhancePrompt}
          disabled={isEnhancing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#BF40FF]/15 border border-[#BF40FF]/30 hover:bg-[#BF40FF]/25 text-[#BF40FF] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={13} className={isEnhancing ? "animate-spin" : ""} />
          <span>{isEnhancing ? "HERMES OPTIMIZING..." : "HERMES ENHANCE"}</span>
        </button>
      </div>

      {/* Main Prompt Input */}
      <div>
        <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
          Master Prompt Input
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your tactical imagery in vivid detail..."
          className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed shadow-inner"
        />
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
          Negative Exclusion Prompt
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#9499B3] font-mono outline-none"
        />
      </div>

      {/* Style Presets */}
      <div>
        <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1.5">
          Tactical Style Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedStyle(preset.id);
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black/80 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                    : "bg-black/30 border-white/5 opacity-70 hover:opacity-100"
                }`}
                style={{ borderColor: isSelected ? preset.color : undefined }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold" style={{ color: isSelected ? preset.color : "#F1F3F9" }}>
                    {preset.name}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: preset.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio & Tuning Dials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
        {/* Aspect Ratio */}
        <div>
          <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-2 gap-1">
            {(["1:1", "16:9", "9:16", "4:5"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  setAspectRatio(ratio);
                }}
                className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? "bg-[#00FF41] text-black border-[#00FF41]"
                    : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#9499B3] text-[10px]">Sampling Steps</span>
            <span className="text-[#00FF41] font-bold text-[10px]">{steps}</span>
          </div>
          <input
            type="range"
            min="15"
            max="50"
            step="1"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
        </div>

        {/* CFG Scale */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#9499B3] text-[10px]">CFG Prompt Scale</span>
            <span className="text-[#00F0FF] font-bold text-[10px]">{cfgScale.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="4.0"
            max="15.0"
            step="0.5"
            value={cfgScale}
            onChange={(e) => setCfgScale(parseFloat(e.target.value))}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
        </div>

        {/* Seed */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-[#9499B3]">Random Seed</span>
            <button
              type="button"
              onClick={handleRandomSeed}
              className="text-[#00FF41] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw size={10} />
              <span>RAND</span>
            </button>
          </div>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-[#F1F3F9] font-mono outline-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-3 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flame size={15} />
        <span>{isGenerating ? "SYNTHESIZING NEURAL LATENTS (DIFFUSION RUNNING)..." : "SYNTHESIZE IMAGE // RUN DIFFUSION ENGINE"}</span>
      </button>
    </form>
  );
}
