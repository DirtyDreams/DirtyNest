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
  Paintbrush,
  Zap,
} from "lucide-react";
import PromptMatrixGenerator, { GenerationParams } from "./image_studio/PromptMatrixGenerator";
import ImageCanvasPreview from "./image_studio/ImageCanvasPreview";
import GeneratedAssetsGallery, { AssetItem, SAMPLE_ASSETS } from "./image_studio/GeneratedAssetsGallery";
import ImageToolboxDrawer from "./image_studio/ImageToolboxDrawer";
import InteractiveCanvasEditor from "./image_studio/InteractiveCanvasEditor";
import CyberGlitchFilterStage from "./image_studio/CyberGlitchFilterStage";
import LatentDiffusionStudioModal from "./image_studio/LatentDiffusionStudioModal";
import CyberpunkShaderFxStudioModal from "./tools/CyberpunkShaderFxStudioModal";
import { cyberAudio } from "@/lib/cyberAudio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ImageStudioView() {
  const [activeAsset, setActiveAsset] = useState<AssetItem>(SAMPLE_ASSETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLatentModal, setShowLatentModal] = useState(false);
  const [showShaderModal, setShowShaderModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"generator" | "editor" | "glitch" | "gallery" | "toolbox">("generator");

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
                IMAGE STUDIO PRO // <span className="text-[#00FF41]">NEURAL CANVAS & INPAINT</span>
              </h2>
              <Badge variant="outline" className="text-[10px] bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30">
                SDXL TURBO + INPAINT V2
              </Badge>
            </div>
            <p className="text-xs text-[#9499B3]">
              Photo editing, generative fill, mask inpainting, object erasing, color grading & HUD overlays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              cyberAudio.play("warp");
              setShowShaderModal(true);
            }}
            className="bg-[#00FF41]/15 border-[#00FF41]/40 text-[#00FF41] font-bold text-xs hover:bg-[#00FF41]/25 shadow-[0_0_12px_rgba(0,255,65,0.2)] h-9"
          >
            <Sparkles size={14} className="mr-1.5" />
            <span>SHADER & ASCII FX</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              cyberAudio.play("click");
              setShowLatentModal(true);
            }}
            className="bg-cyan-500/20 border-cyan-500/40 text-cyan-400 font-bold text-xs hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)] h-9"
          >
            <Sparkles size={14} className="mr-1.5" />
            <span>LATENT WORKBENCH</span>
          </Button>

          <Badge variant="outline" className="text-[10px] font-bold text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30 h-9 px-2.5">
            RTX 4090 VRAM: 18.2 GB FREE
          </Badge>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <Tabs value={activeSubTab} onValueChange={(val) => setActiveSubTab(val as any)} className="w-full flex flex-col gap-4">
        <TabsList className="bg-black/50 border border-white/10 p-1 flex items-center gap-1 overflow-x-auto justify-start h-auto">
          <TabsTrigger value="generator" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Wand2 size={14} />
            <span>Prompt Matrix & Live Canvas</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Paintbrush size={14} />
            <span>Canvas Studio Pro</span>
          </TabsTrigger>
          <TabsTrigger value="glitch" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Zap size={14} />
            <span>Cyber Glitch & Filter Lab</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Grid size={14} />
            <span>Generated Assets Vault</span>
          </TabsTrigger>
          <TabsTrigger value="toolbox" className="text-xs font-bold flex items-center gap-1.5 py-2 px-3">
            <Wrench size={14} />
            <span>Neural Post-Processing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-0 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="mt-0 animate-fade-in">
          <InteractiveCanvasEditor initialAsset={activeAsset} />
        </TabsContent>

        <TabsContent value="glitch" className="mt-0 animate-fade-in">
          <CyberGlitchFilterStage initialImageUrl={activeAsset.url} />
        </TabsContent>

        <TabsContent value="gallery" className="mt-0 animate-fade-in">
          <GeneratedAssetsGallery
            onSelectAsset={(asset) => {
              setActiveAsset(asset);
              setActiveSubTab("editor");
            }}
          />
        </TabsContent>

        <TabsContent value="toolbox" className="mt-0 animate-fade-in">
          <ImageToolboxDrawer activeImageUrl={activeAsset.url} />
        </TabsContent>
      </Tabs>

      {/* Latent Diffusion Studio Modal */}
      <LatentDiffusionStudioModal
        isOpen={showLatentModal}
        onClose={() => setShowLatentModal(false)}
      />

      {/* Cyberpunk Shader & ASCII FX Modal */}
      <CyberpunkShaderFxStudioModal
        isOpen={showShaderModal}
        onClose={() => setShowShaderModal(false)}
      />
    </div>
  );
}
