"use client";

import { useState } from "react";
import { Image as ImageIcon, Save } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function ImageStudioSettingsTab() {
  const [model, setModel] = useState("SDXL-Turbo-V2.1");
  const [defaultAspect, setDefaultAspect] = useState("16:9");
  const [defaultSteps, setDefaultSteps] = useState(30);
  const [defaultCfg, setDefaultCfg] = useState(7.5);
  const [enableUpscaling, setEnableUpscaling] = useState(true);
  const [enableSafetyFilter, setEnableSafetyFilter] = useState(false);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    cyberAudio.play("chime");
    setSaved(true);
    toast.success("Image Studio Settings Saved", "Diffusion engine parameters updated.");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono select-none animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#00FF41]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
              IMAGE STUDIO CONFIGURATION // <span className="text-[#00FF41]">DIFFUSION ENGINE</span>
            </h3>
            <p className="text-xs text-[#9499B3]">
              Default aspect ratios, sampling steps, RealESRGAN 4K upscaler and Hermes prompt expansion
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Save size={13} />
          <span>{saved ? "SAVED!" : "SAVE SETTINGS"}</span>
        </button>
      </div>

      <div className="cyber-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Diffusion Model Engine
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
            >
              <option value="SDXL-Turbo-V2.1">SDXL Turbo V2.1 (Fast 1-step)</option>
              <option value="Flux-1-Dev-Q8">Flux.1 Dev Q8 (High Fidelity)</option>
              <option value="Midjourney-V6-Bridge">Midjourney V6 Cloud Bridge</option>
              <option value="DALL-E-3-HD">OpenAI DALL-E 3 HD</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Default Aspect Ratio
            </label>
            <select
              value={defaultAspect}
              onChange={(e) => setDefaultAspect(e.target.value)}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
            >
              <option value="16:9">16:9 Cinematic Landscape</option>
              <option value="1:1">1:1 Square</option>
              <option value="9:16">9:16 Mobile Vertical</option>
              <option value="4:5">4:5 Social Portrait</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9499B3]">Default Sampling Steps</span>
              <span className="text-[#00FF41] font-bold">{defaultSteps}</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={defaultSteps}
              onChange={(e) => setDefaultSteps(parseInt(e.target.value))}
              className="w-full accent-[#00FF41] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9499B3]">Default CFG Prompt Scale</span>
              <span className="text-[#00F0FF] font-bold">{defaultCfg.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="15.0"
              step="0.5"
              value={defaultCfg}
              onChange={(e) => setDefaultCfg(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">RealESRGAN 4K Super-Resolution</span>
              <span className="text-[10px] text-[#4F536E]">Automatic post-generation upscale</span>
            </div>
            <input
              type="checkbox"
              checked={enableUpscaling}
              onChange={(e) => setEnableUpscaling(e.target.checked)}
              className="w-4 h-4 accent-[#00FF41] cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">Strict Safety Watermark Filter</span>
              <span className="text-[10px] text-[#4F536E]">Enforce SynthID cryptographic watermark</span>
            </div>
            <input
              type="checkbox"
              checked={enableSafetyFilter}
              onChange={(e) => setEnableSafetyFilter(e.target.checked)}
              className="w-4 h-4 accent-[#BF40FF] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
