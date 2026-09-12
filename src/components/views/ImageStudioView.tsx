"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Sparkles,
  Image as ImageIcon,
  Grid,
  Wrench,
  Paintbrush,
  Zap,
  AlertCircle,
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
  const [comfyStatus, setComfyStatus] = useState<{
    online: boolean;
    device?: string;
    vramFreeGb?: number;
    vramTotalGb?: number;
  }>({ online: false });
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchComfyTelemetry() {
      try {
        const statsRes = await fetch("/api/comfyui?action=stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (mounted && statsData.online) {
            setComfyStatus({
              online: true,
              device: statsData.device_name || "NVIDIA GPU",
              vramFreeGb: statsData.vram_free_gb,
              vramTotalGb: statsData.vram_total_gb,
            });
          }
        }
        const ckptRes = await fetch("/api/comfyui?action=checkpoints");
        if (ckptRes.ok) {
          const ckptData = await ckptRes.json();
          if (mounted && ckptData.checkpoints && Array.isArray(ckptData.checkpoints)) {
            setCheckpoints(ckptData.checkpoints);
          }
        }
      } catch {
        // Keep offline fallback state
      }
    }
    fetchComfyTelemetry();
    const interval = setInterval(fetchComfyTelemetry, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleGenerate = async (params: GenerationParams) => {
    setIsGenerating(true);
    setGenerationNotice(null);
    cyberAudio.play("toggle");

    // Dimension calculation from ratio
    let width = 768;
    let height = 768;
    if (params.aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (params.aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (params.aspectRatio === "4:5") {
      width = 768;
      height = 960;
    }

    try {
      const res = await fetch("/api/comfyui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          checkpoint: params.model,
          steps: params.steps,
          cfg: params.cfgScale,
          seed: params.seed,
          width,
          height,
          sampler_name: params.sampler?.includes("euler") ? "euler" : "dpmpp_2m",
          scheduler: params.sampler?.includes("karras") ? "karras" : "normal",
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok && data.images && data.images.length > 0) {
        const img = data.images[0];
        const newAsset: AssetItem = {
          id: `comfy-${data.prompt_id || Date.now()}`,
          title: params.prompt.substring(0, 36) + "...",
          url: `/api/comfyui/image/${img.filename}?subfolder=${encodeURIComponent(img.subfolder || "")}&type=${encodeURIComponent(img.type || "output")}`,
          prompt: params.prompt,
          negativePrompt: params.negativePrompt,
          style: params.stylePreset,
          aspectRatio: params.aspectRatio,
          seed: params.seed,
          steps: params.steps,
          cfgScale: params.cfgScale,
          model: data.checkpoint || params.model,
          created: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
        setActiveAsset(newAsset);
        setGenerationNotice(`Neural generation rendered via ComfyUI in ${data.duration ?? 0}s`);
        cyberAudio.play("chime");
      } else {
        // Fallback preview
        const fallbackAsset: AssetItem = {
          id: `img-${Date.now()}`,
          title: params.prompt.substring(0, 36) + "...",
          url: SAMPLE_ASSETS[Math.floor(Math.random() * SAMPLE_ASSETS.length)].url,
          prompt: params.prompt,
          negativePrompt: params.negativePrompt,
          style: params.stylePreset,
          aspectRatio: params.aspectRatio,
          seed: params.seed,
          steps: params.steps,
          created: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
        setActiveAsset(fallbackAsset);
        if (data.error) {
          setGenerationNotice(`ComfyUI Notice: ${data.error} (Simulator preview loaded)`);
        }
        cyberAudio.play("chime");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setGenerationNotice(`ComfyUI Notice: ${msg} (Simulator preview loaded)`);
      const fallbackAsset: AssetItem = {
        id: `img-${Date.now()}`,
        title: params.prompt.substring(0, 36) + "...",
        url: SAMPLE_ASSETS[Math.floor(Math.random() * SAMPLE_ASSETS.length)].url,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        style: params.stylePreset,
        aspectRatio: params.aspectRatio,
        seed: params.seed,
        steps: params.steps,
        created: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      setActiveAsset(fallbackAsset);
      cyberAudio.play("chime");
    } finally {
      setIsGenerating(false);
    }
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
                IMAGE STUDIO PRO // <span className="text-[#00FF41]">NEURAL CANVAS & COMFYUI</span>
              </h2>
              <Badge variant="outline" className="text-[10px] bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30">
                {comfyStatus.online ? "COMFYUI // ONLINE" : "COMFYUI // OFFLINE"}
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

          <Badge
            variant="outline"
            className={`text-[10px] font-bold h-9 px-2.5 ${
              comfyStatus.online
                ? "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30"
                : "text-amber-400 bg-amber-500/10 border-amber-500/30"
            }`}
          >
            {comfyStatus.online
              ? `${comfyStatus.device?.toUpperCase() || "GPU"} // ${comfyStatus.vramFreeGb ?? 0}GB FREE`
              : "COMFYUI // SIMULATOR MODE"}
          </Badge>
        </div>
      </div>

      {generationNotice && (
        <div className="cyber-card p-3 border-[#00FF41]/30 bg-[#00FF41]/5 flex items-center justify-between text-xs text-[#00FF41]">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{generationNotice}</span>
          </div>
          <button
            onClick={() => setGenerationNotice(null)}
            className="text-[10px] text-zinc-400 hover:text-white uppercase"
          >
            DISMISS
          </button>
        </div>
      )}

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
                checkpoints={checkpoints}
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
