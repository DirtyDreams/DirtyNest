"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Paintbrush,
  Eraser,
  Sparkles,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Type,
  Sticker,
  Undo,
  Redo,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Wand2,
  Trash2,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Scissors,
  Crosshair,
  Shield,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { AssetItem, SAMPLE_ASSETS } from "./GeneratedAssetsGallery";

interface Props {
  initialAsset?: AssetItem;
  onSaveToGallery?: (asset: AssetItem) => void;
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
  const [activeTool, setActiveTool] = useState<"brush" | "eraser" | "fill" | "filters" | "text" | "stamps" | "crop">("brush");
  const [brushSize, setBrushSize] = useState(24);
  const [brushColor, setBrushColor] = useState("#FF0055");
  const [fillPrompt, setFillPrompt] = useState("");
  const [fillMode, setFillMode] = useState<"inpaint" | "replace" | "erase">("inpaint");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  // Text / Stamp Overlays State
  const [customText, setCustomText] = useState("DIRTYNEST // CYBER_CORE");
  const [textColor, setTextColor] = useState("#00FF41");
  const [textSize, setTextSize] = useState(24);

  // Canvas Refs & State
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Zoom & Pan
  const [zoom, setZoom] = useState(100);

  // Load Image onto base canvas
  const renderImageToCanvas = useCallback((imgSrc: string, applyFilters?: FilterSettings) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 576;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const f = applyFilters || filters;
      let filterString = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) hue-rotate(${f.hueRotate}deg) blur(${f.blur}px) invert(${f.invert}%) sepia(${f.sepia}%)`;

      if (f.lutPreset === "cyberpunk") {
        filterString += " hue-rotate(180deg) saturate(180%) contrast(120%)";
      } else if (f.lutPreset === "matrix") {
        filterString += " sepia(80%) hue-rotate(85deg) saturate(250%) contrast(140%)";
      } else if (f.lutPreset === "noir") {
        filterString += " grayscale(100%) contrast(180%) brightness(85%)";
      } else if (f.lutPreset === "amber") {
        filterString += " sepia(90%) hue-rotate(350deg) saturate(160%)";
      }

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    };
    img.src = imgSrc;
  }, [filters]);

  useEffect(() => {
    renderImageToCanvas(currentImage);
    setHistory([currentImage]);
    setHistoryIndex(0);
  }, [currentImage, renderImageToCanvas]);

  // Save State to History
  const pushHistoryState = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const nextHistory = [...history.slice(0, historyIndex + 1), dataUrl];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      cyberAudio.play("click");
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      renderImageToCanvas(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      cyberAudio.play("click");
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      renderImageToCanvas(next);
    }
  };

  // Canvas Drawing for Inpainting Mask
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "brush" && activeTool !== "eraser") return;
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    setLastPoint(pos);
    drawSegment(pos, pos);
  };

  const drawSegment = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255, 0, 85, 0.65)";
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (activeTool !== "brush" && activeTool !== "eraser")) return;
    const pos = getCanvasCoords(e);
    if (lastPoint) {
      drawSegment(lastPoint, pos);
    }
    setLastPoint(pos);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
    }
  };

  const handleClearMask = () => {
    cyberAudio.play("click");
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  // Stamp Custom Text onto Image Canvas
  const handleStampText = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cyberAudio.play("warp");
    ctx.font = `bold ${textSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = textColor;
    ctx.shadowBlur = 10;
    ctx.fillText(customText, 40, canvas.height - 40);
    ctx.shadowBlur = 0;
    pushHistoryState();
    setProcessStatus("✓ Text stamped onto canvas!");
    setTimeout(() => setProcessStatus(null), 2500);
  };

  // Stamp HUD Cyber Decal onto Image Canvas
  const handleStampHud = (stampText: string) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cyberAudio.play("warp");
    ctx.font = `bold 16px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#00F0FF";
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 8;
    ctx.fillText(stampText, 30, 45);
    ctx.shadowBlur = 0;
    pushHistoryState();
    setProcessStatus(`✓ ${stampText} stamped!`);
    setTimeout(() => setProcessStatus(null), 2500);
  };

  // Inpainting / Generative Fill Simulation
  const handleExecuteGenerativeFill = () => {
    if (!fillPrompt.trim() && fillMode !== "erase") {
      alert("Proszę wpisać prompt dla Generative Fill!");
      return;
    }

    cyberAudio.play("warp");
    setIsProcessing(true);
    setProcessStatus(
      fillMode === "erase"
        ? "🧼 Neural Inpainting: Wymazywanie i regeneracja tła..."
        : `🪄 Generative Fill: Synteza obiektu "${fillPrompt}"...`
    );

    setTimeout(() => {
      cyberAudio.play("chime");
      setIsProcessing(false);
      handleClearMask();

      // Pick a refined variant from sample assets or apply inpaint blend
      const randomRefined = SAMPLE_ASSETS[Math.floor(Math.random() * SAMPLE_ASSETS.length)].url;
      setCurrentImage(randomRefined);
      renderImageToCanvas(randomRefined);
      pushHistoryState();
      setProcessStatus("✓ Generative Fill zakończony sukcesem!");
      setTimeout(() => setProcessStatus(null), 3500);
    }, 2800);
  };

  // Flip Horizontal
  const handleFlipHorizontal = () => {
    cyberAudio.play("toggle");
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    pushHistoryState();
  };

  // Rotate 90 Deg
  const handleRotate90 = () => {
    cyberAudio.play("toggle");
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0);
    const newWidth = canvas.height;
    const newHeight = canvas.width;

    canvas.width = newWidth;
    canvas.height = newHeight;
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      maskCanvas.width = newWidth;
      maskCanvas.height = newHeight;
    }

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctx.restore();
    pushHistoryState();
  };

  // Upload Local File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      cyberAudio.play("chime");
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          setCurrentImage(url);
          renderImageToCanvas(url);
          setProcessStatus("✓ Wczytano obraz z dysku!");
          setTimeout(() => setProcessStatus(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Final Render
  const handleDownload = () => {
    cyberAudio.play("chime");
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `dirtynest-studio-pro-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none">
      {/* Top Action Toolbar */}
      <div className="cyber-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Tools Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("brush");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "brush"
                ? "bg-[#FF0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Paintbrush size={14} />
            <span>INPAINT MASK</span>
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
            <span>MASK ERASER</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveTool("fill");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "fill"
                ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
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
                ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.4)]"
                : "bg-white/5 text-[#9499B3] hover:text-white hover:bg-white/10"
            }`}
          >
            <Sliders size={14} />
            <span>COLOR & LUTS</span>
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

        {/* Right: History & Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo size={14} />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo size={14} />
          </button>

          <button
            type="button"
            onClick={handleFlipHorizontal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white cursor-pointer"
            title="Flip Horizontal"
          >
            <FlipHorizontal size={14} />
          </button>

          <button
            type="button"
            onClick={handleRotate90}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>

          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/10 text-xs font-bold cursor-pointer transition-all">
            <Upload size={14} />
            <span>UPLOAD</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
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

      {/* Main Workspace: Left Controls (4 cols) & Right Interactive Canvas (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Sub-Tool Controls Panel */}
        <div className="lg:col-span-4 cyber-card p-4 flex flex-col gap-4">
          {/* Tool 1: Inpaint & Brush Controls */}
          {(activeTool === "brush" || activeTool === "eraser") && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#F1F3F9]">BRUSH SETTINGS</span>
                <button
                  type="button"
                  onClick={handleClearMask}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} />
                  <span>CLEAR MASK</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#9499B3] mb-1">
                  <span>Brush Diameter</span>
                  <span className="text-[#00FF41] font-bold">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="120"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#9499B3] leading-relaxed">
                💡 <b className="text-white">Instrukcja:</b> Zamaluj obszar na płótnie czerwonym pędzlem. Następnie przejdź do <b className="text-[#00F0FF]">GEN FILL & ERASE</b>, aby wymazać obiekt lub zastąpić go nowym elementem AI.
              </div>
            </div>
          )}

          {/* Tool 2: Generative Fill & Object Eraser */}
          {activeTool === "fill" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#00F0FF]">GENERATIVE FILL & ERASE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  SDXL INPAINT
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFillMode("inpaint")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fillMode === "inpaint"
                      ? "bg-[#00F0FF] text-black"
                      : "bg-white/5 text-[#9499B3] hover:text-white"
                  }`}
                >
                  ADD OBJECT
                </button>
                <button
                  type="button"
                  onClick={() => setFillMode("erase")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fillMode === "erase"
                      ? "bg-rose-500 text-white"
                      : "bg-white/5 text-[#9499B3] hover:text-white"
                  }`}
                >
                  ERASE OBJECT
                </button>
              </div>

              {fillMode !== "erase" ? (
                <div>
                  <label className="text-[11px] text-[#9499B3] font-bold block mb-1">
                    Describe what to add in the masked area:
                  </label>
                  <textarea
                    rows={3}
                    value={fillPrompt}
                    onChange={(e) => setFillPrompt(e.target.value)}
                    placeholder="e.g. glowing cyberpunk neon goggles, laser katana, holographic drone..."
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00F0FF] focus:outline-none resize-none font-mono"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  🧼 Zamalowany obiekt zostanie usunięty ze zdjęcia, a tło zrekonstruowane bez śladu.
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteGenerativeFill}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00ccdc] text-black font-black text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Wand2 size={15} />
                <span>{fillMode === "erase" ? "ERASE MASKED OBJECT" : "GENERATE FILL"}</span>
              </button>
            </div>
          )}

          {/* Tool 3: Color Grading & Filters */}
          {activeTool === "filters" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#00FF41]">COLOR GRADING & LUTS</span>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    renderImageToCanvas(currentImage, DEFAULT_FILTERS);
                  }}
                  className="text-[10px] text-[#00F0FF] hover:underline"
                >
                  RESET
                </button>
              </div>

              {/* LUT Presets */}
              <div className="grid grid-cols-2 gap-1.5">
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
                      const next = { ...filters, lutPreset: lut.id };
                      setFilters(next);
                      renderImageToCanvas(currentImage, next);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all ${
                      filters.lutPreset === lut.id
                        ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]"
                        : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
                    }`}
                  >
                    {lut.label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className="space-y-2 text-[11px]">
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
                    onChange={(e) => {
                      const next = { ...filters, brightness: Number(e.target.value) };
                      setFilters(next);
                      renderImageToCanvas(currentImage, next);
                    }}
                    className="w-full accent-[#00FF41] cursor-pointer"
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
                    onChange={(e) => {
                      const next = { ...filters, contrast: Number(e.target.value) };
                      setFilters(next);
                      renderImageToCanvas(currentImage, next);
                    }}
                    className="w-full accent-[#00FF41] cursor-pointer"
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
                    onChange={(e) => {
                      const next = { ...filters, saturate: Number(e.target.value) };
                      setFilters(next);
                      renderImageToCanvas(currentImage, next);
                    }}
                    className="w-full accent-[#00FF41] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#9499B3]">
                    <span>Hue Shift</span>
                    <span className="text-white font-bold">{filters.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={filters.hueRotate}
                    onChange={(e) => {
                      const next = { ...filters, hueRotate: Number(e.target.value) };
                      setFilters(next);
                      renderImageToCanvas(currentImage, next);
                    }}
                    className="w-full accent-[#00FF41] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tool 4: Text & Cyber HUD Decals */}
          {activeTool === "text" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-purple-400">TEXT & HUD OVERLAYS</span>
              </div>

              <div>
                <label className="text-[11px] text-[#9499B3] font-bold block mb-1">Custom Text:</label>
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
                    className="w-full h-8 bg-transparent cursor-pointer rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#9499B3] block mb-0.5">Size: {textSize}px</label>
                  <input
                    type="range"
                    min="14"
                    max="64"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleStampText}
                className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              >
                STAMP TEXT TO CANVAS
              </button>

              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-[#9499B3] font-bold block mb-1.5">
                  Quick Cyber HUD Decals:
                </span>
                <div className="space-y-1.5">
                  {HUD_STAMPS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStampHud(st.text)}
                      className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-left text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all cursor-pointer font-bold flex items-center justify-between"
                    >
                      <span>{st.label}</span>
                      <Crosshair size={12} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Interactive Canvas Viewport */}
        <div className="lg:col-span-8 cyber-card p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[520px] bg-black/60">
          <div
            ref={containerRef}
            className="relative border border-white/15 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center max-w-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Base Image Canvas */}
            <canvas ref={imageCanvasRef} className="max-w-full h-auto block" />

            {/* Inpainting Mask Canvas Overlay */}
            <canvas
              ref={maskCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`absolute inset-0 w-full h-full ${
                activeTool === "brush" || activeTool === "eraser"
                  ? "cursor-crosshair pointer-events-auto"
                  : "pointer-events-none"
              }`}
            />
          </div>

          {/* Bottom Zoom & View Controls Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur border border-white/15 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="p-1.5 text-[#9499B3] hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-bold px-1 text-[#00FF41]">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
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
      </div>
    </div>
  );
}
