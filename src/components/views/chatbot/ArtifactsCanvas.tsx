"use client";

import { useState } from "react";
import {
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  X,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ArtifactsCanvasProps {
  code: string;
  language: string;
  title: string;
  onClose: () => void;
}

export default function ArtifactsCanvas({
  code,
  language,
  title,
  onClose,
}: ArtifactsCanvasProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCopy = () => {
    cyberAudio.play("chime");
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    cyberAudio.play("click");
    const ext = language === "html" ? "html" : language === "jsx" || language === "tsx" ? "tsx" : "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artifact-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe HTML template for the preview iframe
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            background-color: #07070B;
            color: #F1F3F9;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 16px;
          }
        </style>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;

  return (
    <div
      className={`cyber-card flex flex-col font-mono select-none transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
          : "h-full min-h-[500px] border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
      }`}
    >
      {/* HEADER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between p-3.5 border-b border-white/10 gap-2 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center">
            <Sparkles size={14} className="text-[#00F0FF]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-[#F1F3F9] truncate max-w-[200px] sm:max-w-xs">
              {title || "Generated Interactive Artifact"}
            </span>
            <span className="text-[9px] text-[#00F0FF] uppercase font-bold">
              LIVE ARTIFACT CANVAS ({language.toUpperCase()})
            </span>
          </div>
        </div>

        {/* View mode toggle (Preview / Code) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-black/60 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveTab("preview");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] font-bold border border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                  : "text-[#9499B3] hover:text-[#F1F3F9]"
              }`}
            >
              <Eye size={12} />
              <span>PREVIEW</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveTab("code");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "code"
                  ? "bg-[#BF40FF]/20 text-[#BF40FF] font-bold border border-[#BF40FF]/40 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                  : "text-[#9499B3] hover:text-[#F1F3F9]"
              }`}
            >
              <Code2 size={12} />
              <span>CODE</span>
            </button>
          </div>

          {/* Viewport size controls for preview */}
          {activeTab === "preview" && (
            <div className="hidden sm:flex items-center p-1 bg-black/60 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded-lg ${viewport === "desktop" ? "text-[#00FF41]" : "text-[#4F536E] hover:text-[#9499B3]"}`}
                title="Desktop (100%)"
              >
                <Monitor size={13} />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded-lg ${viewport === "tablet" ? "text-[#00FF41]" : "text-[#4F536E] hover:text-[#9499B3]"}`}
                title="Tablet (768px)"
              >
                <Tablet size={13} />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded-lg ${viewport === "mobile" ? "text-[#00FF41]" : "text-[#4F536E] hover:text-[#9499B3]"}`}
                title="Mobile (375px)"
              >
                <Smartphone size={13} />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00F0FF] cursor-pointer"
            title="Reload Preview"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
            title="Copy Source"
          >
            {copied ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#BF40FF] cursor-pointer"
            title="Download File"
          >
            <Download size={13} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-red-400 cursor-pointer"
            title="Close Canvas"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* CANVAS CONTENT BODY */}
      <div className="flex-1 p-3 bg-[#07070B] overflow-auto flex items-center justify-center relative">
        {activeTab === "preview" ? (
          <div
            className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner flex flex-col ${
              viewport === "mobile"
                ? "w-[375px]"
                : viewport === "tablet"
                ? "w-[768px]"
                : "w-full"
            }`}
          >
            <iframe
              key={refreshKey}
              srcDoc={srcDoc}
              title="Artifact Preview Sandbox"
              sandbox="allow-scripts"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <pre className="w-full h-full p-4 rounded-xl bg-black/80 border border-white/5 text-xs font-mono text-[#00FF41] overflow-auto select-text leading-relaxed">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
