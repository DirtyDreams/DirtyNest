"use client";

import { useState } from "react";
import {
  Wand2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Grid,
  Wrench,
  Flame,
  Activity,
} from "lucide-react";
import PromptMatrixGenerator, { GenerationParams } from "./image_studio/PromptMatrixGenerator";
import ImageCanvasPreview from "./image_studio/ImageCanvasPreview";
import GeneratedAssetsGallery, { AssetItem, SAMPLE_ASSETS } from "./image_studio/GeneratedAssetsGallery";
import ImageToolboxDrawer from "./image_studio/ImageToolboxDrawer";
import { cyberAudio } from "@/lib/cyberAudio";

export default function ImageStudioView() {
  const [activeAsset, setActiveAsset] = useState<AssetItem>(SAMPLE_ASSETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"generator" | "gallery" | "toolbox">("generator");

  const handleGenerate = (params: GenerationParams) => {
    setIsGenerating(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsGenerating(false);
      const newAsset: AssetItem = {
        id: `img-${Date.now()}`,
        title: params.prompt.substring(0, 36) + "...",
        url: SAMPLE_ASSETS[Math.floor(Math.random() * SAMPLE_ASSETS.length)].url,
        prompt: params.prompt,
        style: params.stylePreset,
        aspectRatio: params.aspectRatio,
        seed: params.seed,
        steps: params.steps,
        created: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      setActiveAsset(newAsset);
    }, 2400);
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Top Studio HUD Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <ImageIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                IMAGE STUDIO // <span className="text-[#00FF41]">NEURAL DIFFUSION CANVAS</span>
              </h2>
              <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                SDXL TURBO + HERMES PROMPT V2
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Tactical image synthesis, style matrix, real-time latent sampling & 4K AI upscaling
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          RTX 4090 VRAM: 18.2 GB FREE
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "generator" as const, label: "Prompt Matrix & Live Canvas", icon: Wand2 },
          { id: "gallery" as const, label: "Generated Assets Vault", icon: Grid },
          { id: "toolbox" as const, label: "Neural Post-Processing Toolbox", icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveSubTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                  : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {activeSubTab === "generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in">
          {/* Left Prompt Matrix (6 cols) */}
          <div className="lg:col-span-6">
            <PromptMatrixGenerator
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Live Canvas (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <ImageCanvasPreview
              imageUrl={activeAsset.url}
              title={activeAsset.title}
              aspectRatio={activeAsset.aspectRatio}
              isGenerating={isGenerating}
              onOpenToolbox={() => setActiveSubTab("toolbox")}
            />
          </div>
        </div>
      )}

      {activeSubTab === "gallery" && (
        <div className="animate-fade-in">
          <GeneratedAssetsGallery
            onSelectAsset={(asset) => {
              setActiveAsset(asset);
              setActiveSubTab("generator");
            }}
            selectedAssetId={activeAsset.id}
          />
        </div>
      )}

      {activeSubTab === "toolbox" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <ImageToolboxDrawer activeImageUrl={activeAsset.url} />
          <ImageCanvasPreview
            imageUrl={activeAsset.url}
            title={activeAsset.title}
            aspectRatio={activeAsset.aspectRatio}
            isGenerating={false}
          />
        </div>
      )}
    </div>
  );
}
