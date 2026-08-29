"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Paintbrush,
  Eraser,
  Sparkles,
  Sliders,
  Type,
  Download,
  Upload,
  Layers,
  Wand2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Plus,
  Crosshair,
  Square,
  Circle,
  MoveRight,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { AssetItem, SAMPLE_ASSETS } from "./GeneratedAssetsGallery";

interface Props {
  initialAsset?: AssetItem;
  onSaveToGallery?: (asset: AssetItem) => void;
}

export type BlendMode = "source-over" | "screen" | "multiply" | "overlay" | "color-dodge" | "difference" | "hard-light";

export interface CanvasLayer {
  id: string;
  name: string;
  type: "image" | "paint" | "shapes" | "text" | "decal";
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 100
  blendMode: BlendMode;
  canvas: HTMLCanvasElement;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  invert: number;
  sepia: number;
  lutPreset: string;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
  blur: 0,
  invert: 0,
  sepia: 0,
  lutPreset: "none",
};

const HUD_STAMPS = [
  { id: "crosshair", label: "TARGET_LOCK", text: "🎯 [TARGET_ACQUIRED]" },
  { id: "classified", label: "RESTRICTED", text: "⚠️ RESTRICTED // CLEARANCE-5" },
  { id: "telemetry", label: "TELEMETRY", text: "📡 LAT: 18ms • FPS: 120 • 4K" },
  { id: "hermes", label: "HERMES_AI", text: "⚡ HERMES NEURAL SYNTHESIS" },
  { id: "cybereye", label: "OPTICAL_SYS", text: "👁️ CYBER_OPTIC // 100x ZOOM" },
];

export default function InteractiveCanvasEditor({ initialAsset, onSaveToGallery }: Props) {
  const [currentImage, setCurrentImage] = useState<string>(initialAsset?.url || SAMPLE_ASSETS[0].url);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser" | "shapes" | "fill" | "filters" | "text" | "stamps">("brush");

  // Layers Stack
  const [layers, setLayers] = useState<CanvasLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>("");
  const [activeRightTab, setActiveRightTab] = useState<"layers" | "properties">("layers");

  // Tool Properties
  const [brushSize, setBrushSize] = useState(24);
  const [brushColor, setBrushColor] = useState("#00FF41");
  const [brushOpacity, setBrushOpacity] = useState(100);

  // Shape Properties
  const [shapeType, setShapeType] = useState<"frame" | "reticle" | "arrow" | "rect" | "circle" | "laser">("frame");
  const [strokeColor, setStrokeColor] = useState("#00F0FF");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeStyle, setStrokeStyle] = useState<"solid" | "dashed" | "dotted">("solid");

  // Generative Fill
  const [fillPrompt, setFillPrompt] = useState("");
  const [fillMode, setFillMode] = useState<"inpaint" | "replace" | "erase">("inpaint");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  // Text State
  const [customText, setCustomText] = useState("DIRTYNEST // CYBER_CORE");
  const [textColor, setTextColor] = useState("#00FF41");
  const [textSize, setTextSize] = useState(28);

  // Master Render Canvas Ref
  const masterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasResolution, setCanvasResolution] = useState<{ width: number; height: number }>({ width: 1024, height: 576 });

  // Zoom
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  // Helper: Create offscreen canvas for a layer
  const createLayerCanvas = (width: number, height: number): HTMLCanvasElement => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  };

  // Initialize Layers on mount / image change
  const initializeLayers = useCallback((imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const width = img.naturalWidth || 1024;
      const height = img.naturalHeight || 576;
      setCanvasResolution({ width, height });

      // Layer 0: Base Image
      const baseCanvas = createLayerCanvas(width, height);
      const baseCtx = baseCanvas.getContext("2d");
      if (baseCtx) baseCtx.drawImage(img, 0, 0, width, height);

      // Layer 1: Inpainting / Paint Mask
      const paintCanvas = createLayerCanvas(width, height);

      // Layer 2: Vector Shapes & HUD
      const shapesCanvas = createLayerCanvas(width, height);

      // Layer 3: Typography & Decals
      const textCanvas = createLayerCanvas(width, height);

      const initialLayers: CanvasLayer[] = [
        { id: "layer-bg", name: "01. Base Image (Background)", type: "image", visible: true, locked: false, opacity: 100, blendMode: "source-over", canvas: baseCanvas },
        { id: "layer-paint", name: "02. Inpaint & Paint Mask", type: "paint", visible: true, locked: false, opacity: 100, blendMode: "source-over", canvas: paintCanvas },
        { id: "layer-shapes", name: "03. Vector Shapes & HUD", type: "shapes", visible: true, locked: false, opacity: 100, blendMode: "source-over", canvas: shapesCanvas },
        { id: "layer-text", name: "04. Typography & Decals", type: "text", visible: true, locked: false, opacity: 100, blendMode: "source-over", canvas: textCanvas },
      ];

      setLayers(initialLayers);
      setActiveLayerId("layer-paint");
    };
    img.src = imgSrc;
  }, []);

  useEffect(() => {
    initializeLayers(currentImage);
  }, [currentImage, initializeLayers]);

  // Master Render Loop: Composite all visible layers onto the master display canvas
  const redrawMasterCanvas = useCallback(() => {
    const master = masterCanvasRef.current;
    if (!master || layers.length === 0) return;

    master.width = canvasResolution.width;
    master.height = canvasResolution.height;
    const ctx = master.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, master.width, master.height);

    // Apply Global Filter Shader string to master
    let filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px) invert(${filters.invert}%) sepia(${filters.sepia}%)`;
    if (filters.lutPreset === "cyberpunk") {
      filterString += " hue-rotate(180deg) saturate(180%) contrast(120%)";
    } else if (filters.lutPreset === "matrix") {
      filterString += " sepia(80%) hue-rotate(85deg) saturate(250%) contrast(140%)";
    } else if (filters.lutPreset === "noir") {
      filterString += " grayscale(100%) contrast(180%) brightness(85%)";
    } else if (filters.lutPreset === "amber") {
      filterString += " sepia(90%) hue-rotate(350deg) saturate(160%)";
    }

    ctx.filter = filterString;

    // Draw layers from bottom to top
    layers.forEach((layer) => {
      if (!layer.visible) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blendMode;
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    });

    ctx.filter = "none";
  }, [layers, canvasResolution, filters]);

  useEffect(() => {
    redrawMasterCanvas();
  }, [redrawMasterCanvas]);

  // Get coordinates relative to master canvas resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = masterCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  // Get active layer canvas
  const getActiveLayer = (): CanvasLayer | undefined => {
    return layers.find((l) => l.id === activeLayerId);
  };

  // Drawing Brush / Eraser on Active Layer
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

    const pos = getCanvasCoords(e);
    setLastPoint(pos);
    setIsDrawing(true);

    if (activeTool === "brush" || activeTool === "eraser") {
      drawSegment(activeLayer, pos, pos);
    }
  };

  const drawSegment = (layer: CanvasLayer, p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const ctx = layer.canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = brushColor;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    redrawMasterCanvas();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    setCursorPos(pos);

    if (!isDrawing) return;
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    if (activeTool === "brush" || activeTool === "eraser") {
      if (lastPoint) drawSegment(activeLayer, lastPoint, pos);
      setLastPoint(pos);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
    }
  };

  // Draw Vector Shape or HUD Element on Active Layer at click pos
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

    const pos = getCanvasCoords(e);

    if (activeTool === "shapes") {
      cyberAudio.play("warp");
      const ctx = activeLayer.canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      if (strokeStyle === "dashed") ctx.setLineDash([8, 6]);
      else if (strokeStyle === "dotted") ctx.setLineDash([3, 3]);
      else ctx.setLineDash([]);

      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 8;

      if (shapeType === "frame") {
        // Draw Cyberpunk Technical Frame with Corner Brackets
        const w = 180;
        const h = 120;
        const x = pos.x - w / 2;
        const y = pos.y - h / 2;
        const corner = 20;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(x, y + corner);
        ctx.lineTo(x, y);
        ctx.lineTo(x + corner, y);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(x + w - corner, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + corner);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(x + w, y + h - corner);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w - corner, y + h);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(x + corner, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + h - corner);
        ctx.stroke();

        // Center Tech Crosshair
        ctx.strokeRect(pos.x - 4, pos.y - 4, 8, 8);
      } else if (shapeType === "reticle") {
        // Draw Circular Target Reticle
        const r = 50;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pos.x - r - 15, pos.y);
        ctx.lineTo(pos.x + r + 15, pos.y);
        ctx.moveTo(pos.x, pos.y - r - 15);
        ctx.lineTo(pos.x, pos.y + r + 15);
        ctx.stroke();
      } else if (shapeType === "arrow") {
        // Draw Metric Pointer Arrow
        ctx.beginPath();
        ctx.moveTo(pos.x - 60, pos.y);
        ctx.lineTo(pos.x + 60, pos.y);
        ctx.lineTo(pos.x + 45, pos.y - 12);
        ctx.moveTo(pos.x + 60, pos.y);
        ctx.lineTo(pos.x + 45, pos.y + 12);
        ctx.stroke();
      } else if (shapeType === "laser") {
        // Draw Full-Width Laser Beam Line
        ctx.beginPath();
        ctx.moveTo(0, pos.y);
        ctx.lineTo(activeLayer.canvas.width, pos.y);
        ctx.stroke();
      } else if (shapeType === "rect") {
        ctx.strokeRect(pos.x - 75, pos.y - 50, 150, 100);
      } else if (shapeType === "circle") {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
      redrawMasterCanvas();
      setProcessStatus(`✓ Stamped ${shapeType.toUpperCase()} onto ${activeLayer.name}`);
      setTimeout(() => setProcessStatus(null), 2500);
    } else if (activeTool === "text") {
      cyberAudio.play("warp");
      const ctx = activeLayer.canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.font = `bold ${textSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = textColor;
      ctx.shadowColor = textColor;
      ctx.shadowBlur = 10;
      ctx.fillText(customText, pos.x, pos.y);
      ctx.restore();

      redrawMasterCanvas();
      setProcessStatus(`✓ Text placed onto ${activeLayer.name}`);
      setTimeout(() => setProcessStatus(null), 2500);
    }
  };

  // Stamp HUD Decal directly
  const handleStampHud = (stampText: string) => {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    cyberAudio.play("warp");
    const ctx = activeLayer.canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.font = `bold 16px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#00F0FF";
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 8;
    ctx.fillText(stampText, 40, 60);
    ctx.restore();

    redrawMasterCanvas();
    setProcessStatus(`✓ Stamped ${stampText} onto ${activeLayer.name}`);
    setTimeout(() => setProcessStatus(null), 2500);
  };

  // Layer Management Functions
  const handleAddLayer = () => {
    cyberAudio.play("click");
    const newCanvas = createLayerCanvas(canvasResolution.width, canvasResolution.height);
    const newId = `layer-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      name: `0${layers.length + 1}. Custom Layer`,
      type: "paint",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "source-over",
      canvas: newCanvas,
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    cyberAudio.play("click");
    const filtered = layers.filter((l) => l.id !== id);
    setLayers(filtered);
    if (activeLayerId === id) setActiveLayerId(filtered[0].id);
  };

  const handleToggleLayerVisible = (id: string) => {
    cyberAudio.play("toggle");
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleToggleLayerLock = (id: string) => {
    cyberAudio.play("toggle");
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  };

  const handleLayerOpacityChange = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  };

  const handleLayerBlendModeChange = (id: string, blendMode: BlendMode) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, blendMode } : l))
    );
  };

  const handleMoveLayer = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === layers.length - 1)
    )
      return;

    cyberAudio.play("click");
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newLayers = [...layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIdx];
    newLayers[targetIdx] = temp;
    setLayers(newLayers);
  };

  const handleClearActiveLayer = () => {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;
    cyberAudio.play("click");
    const ctx = activeLayer.canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
    redrawMasterCanvas();
  };

  // Inpainting & Generative Fill Execution
  const handleExecuteGenerativeFill = () => {
    if (!fillPrompt.trim() && fillMode !== "erase") {
      alert("Proszę podać prompt dla Generative Fill!");
      return;
    }

    cyberAudio.play("warp");
    setIsProcessing(true);
    setProcessStatus(
      fillMode === "erase"
        ? "🧼 Neural Inpainting: Wymazywanie i rekonstrukcja tła..."
        : `🪄 Generative Fill: Synteza obiektu "${fillPrompt}"...`
    );

    setTimeout(() => {
      cyberAudio.play("chime");
      setIsProcessing(false);
      handleClearActiveLayer();

      const randomRefined = SAMPLE_ASSETS[Math.floor(Math.random() * SAMPLE_ASSETS.length)].url;
      setCurrentImage(randomRefined);
      setProcessStatus("✓ Generative Fill zakończony sukcesem!");
      setTimeout(() => setProcessStatus(null), 3500);
    }, 2800);
  };

  // Upload Local Image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      cyberAudio.play("chime");
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          setCurrentImage(url);
          setProcessStatus("✓ Wczytano obraz z dysku do nowej sesji!");
          setTimeout(() => setProcessStatus(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Merged PNG Render
  const handleDownload = () => {
    cyberAudio.play("chime");
    const master = masterCanvasRef.current;
    if (!master) return;
    const a = document.createElement("a");
    a.href = master.toDataURL("image/png");
    a.download = `dirtynest-canva-pro-${Date.now()}.png`;
    a.click();
  };

  const activeLayer = getActiveLayer();

  return (
    <div className="flex flex-col gap-4 font-mono select-none">
      {/* Top Action Toolbar */}
      <div className="cyber-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left Tool Palette Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("brush");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "brush"
                ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Paintbrush size={14} />
            <span>PAINT & MASK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("eraser");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "eraser"
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Eraser size={14} />
            <span>ERASER</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("shapes");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "shapes"
                ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Square size={14} />
            <span>VECTOR SHAPES & HUD</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("fill");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "fill"
                ? "bg-[#BF40FF] text-white shadow-[0_0_12px_rgba(191,64,255,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Wand2 size={14} />
            <span>GEN FILL & ERASE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("filters");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "filters"
                ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Sliders size={14} />
            <span>COLOR LUTS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("text");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "text"
                ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Type size={14} />
            <span>TEXT & STAMPS</span>
          </button>
        </div>

        {/* Right Actions & Export */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/10 text-xs font-bold cursor-pointer transition-all">
            <Upload size={14} />
            <span>UPLOAD</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Download Merged Image */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          >
            <Download size={14} />
            <span>EXPORT PNG</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {processStatus && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="animate-spin" />
            <span>{processStatus}</span>
          </div>
          {isProcessing && <span className="text-[10px] text-white/50">NEURAL CUDA WORKER</span>}
        </div>
      )}

      {/* Main 3-Column Studio Workstation: Left Tool Inspector (3 cols) | Center Interactive Canvas (6 cols) | Right Layers Panel (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Tool Parameters Inspector (3 cols) */}
        <div className="lg:col-span-3 cyber-card p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              TOOL PROPERTIES
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              {activeTool.toUpperCase()}
            </span>
          </div>

          {/* Brush / Eraser Inspector */}
          {(activeTool === "brush" || activeTool === "eraser") && (
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Brush Diameter</span>
                  <span className="text-[#00FF41] font-bold">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>

              {activeTool === "brush" && (
                <div>
                  <label className="text-[#9499B3] block mb-1">Brush Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded-lg shrink-0"
                    />
                    <div className="flex gap-1 flex-1">
                      {["#00FF41", "#00F0FF", "#BF40FF", "#FF0055", "#FFB800", "#FFFFFF"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBrushColor(c)}
                          className="w-5 h-5 rounded border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleClearActiveLayer}
                className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>CLEAR ACTIVE LAYER</span>
              </button>
            </div>
          )}

          {/* Vector Shapes Inspector */}
          {activeTool === "shapes" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9499B3] block mb-1 font-bold">Shape / HUD Type:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "frame", label: "HUD FRAME", icon: Square },
                    { id: "reticle", label: "RETICLE", icon: Crosshair },
                    { id: "arrow", label: "ARROW", icon: MoveRight },
                    { id: "laser", label: "LASER BEAM", icon: Zap },
                    { id: "rect", label: "RECTANGLE", icon: Square },
                    { id: "circle", label: "CIRCLE", icon: Circle },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShapeType(s.id as any)}
                      className={`p-2 rounded-lg border text-[10px] font-bold text-left flex items-center gap-1.5 transition-all ${
                        shapeType === s.id
                          ? "bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                      }`}
                    >
                      <s.icon size={12} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#9499B3] mb-1">
                  <span>Stroke Width</span>
                  <span className="text-[#00F0FF] font-bold">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[#9499B3] block mb-1">Stroke Color:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 bg-transparent cursor-pointer rounded-lg shrink-0"
                  />
                  <div className="flex gap-1 flex-1">
                    {["#00F0FF", "#00FF41", "#BF40FF", "#FFB800", "#FF0055"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setStrokeColor(c)}
                        className="w-5 h-5 rounded border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#9499B3] leading-relaxed">
                💡 <b className="text-white">Wskazówka:</b> Kliknij dowolne miejsce na płótnie, aby umieścić wybrany kształt wektorowy na aktywnej warstwie.
              </div>
            </div>
          )}

          {/* Generative Fill & Inpaint Inspector */}
          {activeTool === "fill" && (
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFillMode("inpaint")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fillMode === "inpaint" ? "bg-[#BF40FF] text-white" : "bg-white/5 text-[#9499B3]"
                  }`}
                >
                  ADD OBJECT
                </button>
                <button
                  type="button"
                  onClick={() => setFillMode("erase")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fillMode === "erase" ? "bg-rose-500 text-white" : "bg-white/5 text-[#9499B3]"
                  }`}
                >
                  ERASE OBJECT
                </button>
              </div>

              {fillMode !== "erase" ? (
                <div>
                  <label className="text-[#9499B3] block mb-1 font-bold">Prompt:</label>
                  <textarea
                    rows={3}
                    value={fillPrompt}
                    onChange={(e) => setFillPrompt(e.target.value)}
                    placeholder="e.g. glowing cyberpunk neon visor, holographic companion drone..."
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#BF40FF] focus:outline-none resize-none font-mono"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                  Zamalowany obszar zostanie usunięty, a tło zrekonstruowane przez model Inpaintingu.
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteGenerativeFill}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-[#BF40FF] hover:bg-[#a833e4] text-white font-black text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(191,64,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Wand2 size={15} />
                <span>{fillMode === "erase" ? "ERASE MASKED AREA" : "GENERATE FILL"}</span>
              </button>
            </div>
          )}

          {/* Color Grading Inspector */}
          {activeTool === "filters" && (
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: "none", label: "NATURAL" },
                  { id: "cyberpunk", label: "NEON CYBER" },
                  { id: "matrix", label: "MATRIX GREEN" },
                  { id: "noir", label: "DARK NOIR" },
                  { id: "amber", label: "AMBER VINTAGE" },
                ].map((lut) => (
                  <button
                    key={lut.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, lutPreset: lut.id }));
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      filters.lutPreset === lut.id
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                    }`}
                  >
                    {lut.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div>
                  <div className="flex justify-between text-[#9499B3]">
                    <span>Brightness</span>
                    <span className="text-white font-bold">{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={filters.brightness}
                    onChange={(e) => setFilters({ ...filters, brightness: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#9499B3]">
                    <span>Contrast</span>
                    <span className="text-white font-bold">{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#9499B3]">
                    <span>Saturation</span>
                    <span className="text-white font-bold">{filters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    value={filters.saturate}
                    onChange={(e) => setFilters({ ...filters, saturate: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text & Stamps Inspector */}
          {activeTool === "text" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9499B3] block mb-1">Custom Text:</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-[10px] text-[#9499B3] block mb-0.5">Color:</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-7 bg-transparent cursor-pointer rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#9499B3] block mb-0.5">Size: {textSize}px</label>
                  <input
                    type="range"
                    min="14"
                    max="72"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#9499B3]">
                💡 Kliknij dowolne miejsce na płótnie, aby osadzić tekst.
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-[#9499B3] block">Quick Decals:</span>
                {HUD_STAMPS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStampHud(st.text)}
                    className="w-full p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-left text-[#00F0FF] hover:border-[#00F0FF]/40 border border-white/5 transition-all cursor-pointer font-bold"
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Multi-Layer Interactive Canvas Viewport (6 cols) */}
        <div className="lg:col-span-6 cyber-card p-3 flex flex-col items-center justify-center relative overflow-hidden min-h-[540px] bg-black/80">
          {/* Header Info Bar: Coordinates & Resolution */}
          <div className="w-full flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10 text-[10px] text-[#4F536E]">
            <div className="flex items-center gap-2">
              <span className="text-[#00FF41] font-bold">CANVAS PRO</span>
              <span>•</span>
              <span>{canvasResolution.width} x {canvasResolution.height} PX</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span>X: {cursorPos.x}</span>
              <span>Y: {cursorPos.y}</span>
            </div>
          </div>

          {/* Canvas Wrapper with Zoom Transform */}
          <div
            className="relative border border-white/15 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center max-w-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Master Display Canvas */}
            <canvas
              ref={masterCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onClick={handleCanvasClick}
              className="max-w-full h-auto block cursor-crosshair"
            />
          </div>

          {/* Bottom Zoom & View Controls Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur border border-white/15 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(40, z - 15))}
              className="p-1.5 text-[#9499B3] hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-bold px-1 text-[#00FF41]">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 15))}
              className="p-1.5 text-[#9499B3] hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1.5 text-[#9499B3] hover:text-white cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* Right: Layers Stack & Blend Modes Panel (3 cols) */}
        <div className="lg:col-span-3 cyber-card p-4 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-[#00FF41] font-bold text-xs">
              <Layers size={15} />
              <span>LAYERS STACK ({layers.length})</span>
            </div>
            <button
              type="button"
              onClick={handleAddLayer}
              className="p-1 px-2 rounded-lg bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 border border-[#00FF41]/40 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={11} />
              <span>NEW</span>
            </button>
          </div>

          {/* Active Layer Inspector: Opacity & Blend Mode */}
          {activeLayer && (
            <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-2 text-[10px]">
              <div className="flex items-center justify-between font-bold text-[#F1F3F9]">
                <span className="truncate max-w-[120px]">{activeLayer.name}</span>
                <span className="text-[#00FF41]">{activeLayer.opacity}%</span>
              </div>

              {/* Opacity Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeLayer.opacity}
                  onChange={(e) => handleLayerOpacityChange(activeLayer.id, Number(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>

              {/* Blend Mode Select */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[#9499B3]">Blend:</span>
                <select
                  value={activeLayer.blendMode}
                  onChange={(e) => handleLayerBlendModeChange(activeLayer.id, e.target.value as BlendMode)}
                  className="p-1 rounded bg-black/80 border border-white/15 text-white font-mono text-[9px] outline-none"
                >
                  <option value="source-over">Normal</option>
                  <option value="screen">Screen (Lighten)</option>
                  <option value="multiply">Multiply (Darken)</option>
                  <option value="overlay">Overlay</option>
                  <option value="color-dodge">Color Dodge (Neon)</option>
                  <option value="difference">Difference</option>
                  <option value="hard-light">Hard Light</option>
                </select>
              </div>
            </div>
          )}

          {/* Layers List */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {layers.map((l, index) => {
              const isSelected = l.id === activeLayerId;
              return (
                <div
                  key={l.id}
                  onClick={() => setActiveLayerId(l.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] border-[#00FF41]/50 text-white shadow-[0_0_10px_rgba(0,255,65,0.15)] font-bold"
                      : "bg-black/30 border-white/5 text-[#9499B3] hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Left: Visibility & Name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLayerVisible(l.id);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {l.visible ? <Eye size={13} className="text-[#00FF41]" /> : <EyeOff size={13} className="text-slate-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLayerLock(l.id);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {l.locked ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} className="opacity-40" />}
                    </button>

                    <span className="text-[11px] truncate">{l.name}</span>
                  </div>

                  {/* Right: Reorder & Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveLayer(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-1 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveLayer(index, "down");
                      }}
                      disabled={index === layers.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown size={11} />
                    </button>
                    {layers.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(l.id);
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300 ml-0.5"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
