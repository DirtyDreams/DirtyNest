"use client";

import { useState } from "react";
import { X, Wand2, Copy, Check } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface LatentDiffusionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LatentDiffusionStudioModal({
  isOpen,
  onClose,
}: LatentDiffusionStudioModalProps) {
  const [prompt, setPrompt] = useState(
    "cyberpunk neural citadel, neon glowing conduits, metahuman operator, octane render, 8k resolution, cinematic lighting"
  );
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, deformed, artifacts, text watermark");
  const [sampler, setSampler] = useState("DPM++ 2M Karras");
  const [steps, setSteps] = useState(28);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [loraWeight, setLoraWeight] = useState(0.85);
  const [seed, setSeed] = useState(84920194);
  const [isSampling, setIsSampling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRandomizeSeed = () => {
    cyberAudio.play("click");
    setSeed(Math.floor(Math.random() * 99999999));
  };

  const handleRunSampling = () => {
    cyberAudio.play("warp");
    setIsSampling(true);
    setTimeout(() => {
      setIsSampling(false);
      cyberAudio.play("chime");
    }, 1200);
  };

  const handleCopyParams = () => {
    cyberAudio.play("click");
    const json = JSON.stringify(
      {
        prompt,
        negativePrompt,
        sampler,
        steps,
        cfgScale,
        loraWeight,
        seed,
        engine: "SDXL-Turbo-v2.6",
      },
      null,
      2
    );
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs text-white">
      <div className="relative w-full max-w-4xl bg-[#080910] border border-[#00FF41]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-[#00FF41]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                LATENT DIFFUSION WORKBENCH // <span className="text-[#00FF41]">SDXL SAMPLING MATRIX</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct latent tensor control, LoRA weight multipliers, Perlin noise seed exploration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyParams}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED JSON" : "COPY PARAMS"}</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Prompts */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">POSITIVE LATENT PROMPT</label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none resize-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">NEGATIVE PROMPT EMBEDDING</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-rose-300 outline-none font-mono"
              />
            </div>
          </div>

          {/* Hyperparameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold">SAMPLER METHOD</span>
              <select
                value={sampler}
                onChange={(e) => setSampler(e.target.value)}
                className="bg-black/80 text-cyan-400 font-bold p-1.5 rounded-lg border border-white/10 outline-none text-xs"
              >
                <option value="DPM++ 2M Karras">DPM++ 2M Karras</option>
                <option value="Euler Ancestral">Euler Ancestral</option>
                <option value="DDIM">DDIM (Fast)</option>
                <option value="UniPC">UniPC (High Guidance)</option>
              </select>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold">STEPS / CFG</span>
                <span className="text-purple-400 font-bold">{steps} steps / {cfgScale} CFG</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer mt-1"
              />
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold">LORA WEIGHT</span>
                <span className="text-emerald-400 font-bold">{loraWeight.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={loraWeight}
                onChange={(e) => setLoraWeight(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Seed Bar */}
          <div className="p-3.5 bg-black/50 rounded-xl border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">NOISE SEED:</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{seed}</span>
            </div>

            <button
              onClick={handleRandomizeSeed}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold"
            >
              🎲 RANDOMIZE SEED
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05060b] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            VRAM Footprint: <strong className="text-emerald-400">4.2 GB FP16</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                cyberAudio.play("click");
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleRunSampling}
              disabled={isSampling}
              className="px-5 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)] cursor-pointer disabled:opacity-50"
            >
              {isSampling ? "SAMPLING LATENT..." : "DISPATCH INFERENCE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
