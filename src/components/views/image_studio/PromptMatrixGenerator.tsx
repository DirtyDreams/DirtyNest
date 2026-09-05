"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Sparkles,
  Sliders,
  Wand2,
  RefreshCw,
  Flame,
  ChevronDown,
  Cpu,
} from "lucide-react";
=======
import { Sparkles, Sliders, Wand2, RefreshCw, Flame, ChevronDown, Cpu } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

interface StylePreset {
  id: string;
  name: string;
  color: string;
  promptSuffix: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    color: "#00FF41",
    promptSuffix: "cyberpunk aesthetic, neon lighting, volumetric fog, high-tech obsidian architecture, 8k resolution, octane render",
  },
  {
    id: "synthwave",
    name: "Outrun Synthwave",
    color: "#BF40FF",
    promptSuffix: "synthwave outrun, retro 80s grid, neon magenta and cyan sunset, chrome reflections, vaporwave VHS grain",
  },
  {
    id: "mecha",
    name: "Anime Mecha Sci-Fi",
    color: "#00F0FF",
    promptSuffix: "detailed anime mecha design, dynamic combat pose, mechanical joints, glowing energy conduits, Studio Trigger style",
  },
  {
    id: "dark_voxel",
    name: "Dark Military Voxel",
    color: "#FFB800",
    promptSuffix: "tactical military operative, night vision goggles, ballistic armor, rain-slicked concrete, cinematic Unreal Engine 5 lighting",
  },
];

const MODELS = [
  { id: "sdxl_turbo", name: "SDXL 1.0 Turbo", desc: "Real-time 1-step sampling (2.4s)", vram: "6.2 GB" },
  { id: "flux_schnell", name: "FLUX.1 Schnell", desc: "Ultra-Fidelity 12B DiT Architecture", vram: "14.8 GB" },
  { id: "sd35_medium", name: "Stable Diffusion 3.5 Medium", desc: "Multimodal MMDiT & High Text Adherence", vram: "9.5 GB" },
  { id: "midjourney_synth", name: "Midjourney v6.1 Synth", desc: "Photorealistic cinematic lighting & textures", vram: "11.2 GB" },
  { id: "anime_mecha_xl", name: "Anime Mecha XL", desc: "Japanese anime cel-shading & mechanical detail", vram: "7.8 GB" },
];

const SAMPLERS = [
  { id: "dpmpp_2m_karras", name: "DPM++ 2M Karras (Recommended)" },
  { id: "euler_a", name: "Euler Ancestral (Euler A)" },
  { id: "unipc", name: "UniPC Fast Convergence" },
  { id: "ddim", name: "DDIM High Determinism" },
  { id: "dpmpp_sde_karras", name: "DPM++ SDE Karras (High Detail)" },
];

const VAES = [
  { id: "auto", name: "SDXL Auto-Baked VAE" },
  { id: "kl_f8_anime", name: "kl-f8-anime2 (High Vibrancy)" },
  { id: "fp16_colorfix", name: "Color-Fix FP16 Clean VAE" },
];

const PRO_PRESETS = [
  {
    id: "turbo",
    label: "⚡ ULTRA FAST TURBO",
    model: "sdxl_turbo",
    sampler: "euler_a",
    steps: 18,
    cfg: 5.5,
    hiresFix: false,
    batchCount: 1,
  },
  {
    id: "cinematic",
    label: "💎 4K CINEMATIC MASTER",
    model: "flux_schnell",
    sampler: "dpmpp_2m_karras",
    steps: 35,
    cfg: 7.5,
    hiresFix: true,
    batchCount: 1,
  },
  {
    id: "anime",
    label: "🎨 ANIME MECHA 8K",
    model: "anime_mecha_xl",
    sampler: "dpmpp_sde_karras",
    steps: 32,
    cfg: 8.0,
    hiresFix: true,
    batchCount: 1,
  },
  {
    id: "noir",
    label: "🎞️ NOIR ANALOG 35MM",
    model: "midjourney_synth",
    sampler: "dpmpp_2m_karras",
    steps: 28,
    cfg: 6.8,
    hiresFix: false,
    batchCount: 2,
  },
];

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  stylePreset: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:5";
  steps: number;
  cfgScale: number;
  seed: number;
  model?: string;
  sampler?: string;
  clipSkip?: number;
  vae?: string;
  hiresFix?: boolean;
  hiresUpscaler?: string;
  hiresDenoising?: number;
  batchCount?: number;
}

interface Props {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

export default function PromptMatrixGenerator({ onGenerate, isGenerating }: Props) {
  const [prompt, setPrompt] = useState(
    "Cinematic shot of an autonomous AI sentinel patrolling a neon-lit cyberpunk metropolis, rain reflections, volumetric laser fog"
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, deformed, artifacts, text watermark, oversaturated"
  );
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:5">("16:9");
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(8492041);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Pro Mode Advanced Settings
  const [showProMode, setShowProMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("sdxl_turbo");
  const [selectedSampler, setSelectedSampler] = useState("dpmpp_2m_karras");
  const [clipSkip, setClipSkip] = useState<1 | 2>(1);
  const [selectedVae, setSelectedVae] = useState("auto");
  const [hiresFix, setHiresFix] = useState(false);
  const [hiresUpscaler, setHiresUpscaler] = useState("R-ESRGAN 4x+");
  const [hiresDenoising, setHiresDenoising] = useState(0.35);
  const [batchCount, setBatchCount] = useState<1 | 2 | 4>(1);

  const handleEnhancePrompt = () => {
    cyberAudio.play("toggle");
    setIsEnhancing(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsEnhancing(false);
      setPrompt(
        (prev) =>
          `${prev}, highly detailed, raytraced reflections, unreal engine 5 render, global illumination, trending on artstation`
      );
    }, 1200);
  };

  const handleRandomSeed = () => {
    cyberAudio.play("click");
    setSeed(Math.floor(Math.random() * 9000000 + 1000000));
  };

  const applyProPreset = (preset: (typeof PRO_PRESETS)[0]) => {
    cyberAudio.play("warp");
    setSelectedModel(preset.model);
    setSelectedSampler(preset.sampler);
    setSteps(preset.steps);
    setCfgScale(preset.cfg);
    setHiresFix(preset.hiresFix);
    setBatchCount(preset.batchCount as 1 | 2 | 4);
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
      model: selectedModel,
      sampler: selectedSampler,
      clipSkip,
      vae: selectedVae,
      hiresFix,
      hiresUpscaler,
      hiresDenoising,
      batchCount,
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
              PROMPT MATRIX GENERATOR // <span className="text-[#00FF41]">PRO ENGINE</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Multi-model neural diffusion, latent schedulers & high-res upscale pipeline
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

      {/* Aspect Ratio & Basic Tuning Dials */}
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
            max="60"
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

      {/* Advanced Pro Mode Accordion Toggle */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("toggle");
            setShowProMode(!showProMode);
          }}
          className="w-full p-3 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[#00F0FF]" />
            <span className="text-xs font-black tracking-wider text-[#F1F3F9] uppercase">
              ADVANCED NEURAL PARAMETERS // <span className="text-[#00F0FF]">PRO MODE</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
              {MODELS.find((m) => m.id === selectedModel)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#4F536E] hidden sm:inline">
              Samplers, VAE, High-Res Fix, Batch
            </span>
            <ChevronDown
              size={15}
              className={`text-[#00F0FF] transition-transform duration-200 ${showProMode ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {showProMode && (
          <div className="p-4 border-t border-white/10 flex flex-col gap-4 animate-fade-in bg-black/60">
            {/* Quick Pro Presets */}
            <div>
              <span className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1.5">
                Quick Configuration Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyProPreset(p)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41]/40 text-left transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-[#00FF41] block">{p.label}</span>
                    <span className="text-[8px] text-[#9499B3] block">{p.steps} steps • {p.model}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Architecture & Sampler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Model Engine Selector */}
              <div>
                <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1 flex items-center justify-between">
                  <span>Base Neural Model</span>
                  <span className="text-[#00FF41] font-bold text-[9px]">CUDA ACCELERATED</span>
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/80 border border-white/15 text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00FF41] cursor-pointer"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-black text-white">
                      {m.name} ({m.vram})
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-[#4F536E] mt-1 block">
                  {MODELS.find((m) => m.id === selectedModel)?.desc}
                </span>
              </div>

              {/* Sampler Selector */}
              <div>
                <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                  Sampling Method (Scheduler)
                </label>
                <select
                  value={selectedSampler}
                  onChange={(e) => setSelectedSampler(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/80 border border-white/15 text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00F0FF] cursor-pointer"
                >
                  {SAMPLERS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-black text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-[#4F536E] mt-1 block">
                  Adaptive step decay & high-frequency noise removal
                </span>
              </div>
            </div>

            {/* Clip Skip, VAE, and Batch Multiplier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              {/* Clip Skip */}
              <div>
                <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                  CLIP Skip Layer
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[1, 2].map((cs) => (
                    <button
                      key={cs}
                      type="button"
                      onClick={() => setClipSkip(cs as 1 | 2)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        clipSkip === cs
                          ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]"
                          : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                      }`}
                    >
                      Layer {cs} {cs === 1 ? "(Default)" : "(Anime)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* VAE Selector */}
              <div>
                <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                  Color VAE Decoder
                </label>
                <select
                  value={selectedVae}
                  onChange={(e) => setSelectedVae(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-black/80 border border-white/15 text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00FF41] cursor-pointer"
                >
                  {VAES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-black text-white">
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Count */}
              <div>
                <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                  Batch Multiplier
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchCount(count as 1 | 2 | 4)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        batchCount === count
                          ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                          : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                      }`}
                    >
                      {count}x {count === 1 ? "Single" : "Batch"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High-Res Fix (2-Pass Latent Upscale) */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hires-fix-toggle"
                    checked={hiresFix}
                    onChange={(e) => setHiresFix(e.target.checked)}
                    className="accent-[#00FF41] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="hires-fix-toggle" className="text-xs font-bold text-[#F1F3F9] cursor-pointer">
                    Enable High-Res Fix (2-Pass Super-Resolution Pipeline)
                  </label>
                </div>
                <span className="text-[9px] font-bold text-[#00FF41]">4K ULTRA CRISP</span>
              </div>

              {hiresFix && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 animate-fade-in">
                  <div>
                    <span className="text-[10px] text-[#9499B3] block mb-1">Latent Upscaler Model:</span>
                    <select
                      value={hiresUpscaler}
                      onChange={(e) => setHiresUpscaler(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-black/80 border border-white/15 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="R-ESRGAN 4x+">R-ESRGAN 4x+ (Photorealism)</option>
                      <option value="Latent (nearest-exact)">Latent Nearest-Exact (Sharp Textures)</option>
                      <option value="Anime6B">Anime6B 4x (Cel-Shaded & Lines)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-[#9499B3] mb-1">
                      <span>2nd Pass Denoising Strength</span>
                      <span className="text-[#00FF41] font-bold">{hiresDenoising.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="0.70"
                      step="0.05"
                      value={hiresDenoising}
                      onChange={(e) => setHiresDenoising(parseFloat(e.target.value))}
                      className="w-full accent-[#00FF41] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* VRAM & Telemetry Budget Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 text-[10px]">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-[#00FF41]" />
                <span className="text-slate-400">ESTIMATED RTX 4090 VRAM:</span>
                <span className="font-bold text-[#00FF41]">
                  {hiresFix ? "12.4 GB / 24 GB" : MODELS.find((m) => m.id === selectedModel)?.vram}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">EST. TIME:</span>
                <span className="font-bold text-[#00F0FF]">{hiresFix ? "~4.8s (2-Pass)" : "~2.4s (1-Pass)"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-3.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flame size={16} />
        <span>
          {isGenerating
            ? "SYNTHESIZING NEURAL LATENTS (DIFFUSION RUNNING)..."
            : `RUN DIFFUSION PIPELINE // ${MODELS.find((m) => m.id === selectedModel)?.name.toUpperCase()} (${batchCount}x)`}
        </span>
      </button>
    </form>
  );
}
