"use client";

import { useState, useEffect } from "react";
import { Globe, Camera, RefreshCw, ArrowRight, Code, Eye } from "lucide-react";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
import { cyberAudio } from "@/lib/cyberAudio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUICK_URLS = [
  { label: "DirtyNest Local", url: "http://localhost:3000" },
  { label: "Sidecar Swagger", url: "http://localhost:8000/docs" },
  { label: "Qdrant Dashboard", url: "http://localhost:6333/dashboard" },
];

export default function AcpBrowserHud() {
  const {
    browserState,
    fetchBrowserStatus,
    navigateBrowser,
    captureBrowserScreenshot,
    extractBrowserDom,
  } = useHermesAcpStore();

  const [inputUrl, setInputUrl] = useState(browserState.url || "http://localhost:3000");
  const [showDomText, setShowDomText] = useState(false);

  useEffect(() => {
    fetchBrowserStatus();
  }, [fetchBrowserStatus]);

  useEffect(() => {
    if (browserState.url && browserState.url !== "about:blank") {
      setInputUrl(browserState.url);
    }
  }, [browserState.url]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    cyberAudio.play("toggle");
    navigateBrowser(inputUrl.trim());
  };

  const handleCapture = async () => {
    cyberAudio.play("click");
    await captureBrowserScreenshot();
  };

  const handleExtract = async () => {
    cyberAudio.play("click");
    await extractBrowserDom();
    setShowDomText(true);
  };

  return (
    <div className="cyber-card p-4 flex flex-col gap-4 font-mono select-none border-emerald-500/20 bg-black/50 animate-fade-in">
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
            <Globe size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider">
                CHROME CDP BROWSER HARNESS
              </h3>
              <Badge
                variant="outline"
                className={`text-[9px] font-bold ${
                  browserState.isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-white/5 text-[#9499B3] border-white/10"
                }`}
              >
                {browserState.isConnected ? `CDP :${browserState.port} ONLINE` : `CDP :${browserState.port} READY (AUTO-CONNECT)`}
              </Badge>
            </div>
            <span className="text-[10px] text-[#4F536E] truncate block max-w-md">
              {browserState.title || "Autonomous Chrome Browser Control"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCapture}
            disabled={browserState.isLoading}
            className="h-8 px-2.5 bg-white/5 border-white/10 text-[10px] text-[#9499B3] hover:text-white"
          >
            <Camera size={12} className="mr-1 text-emerald-400" />
            <span>CAPTURE</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExtract}
            disabled={browserState.isLoading}
            className="h-8 px-2.5 bg-white/5 border-white/10 text-[10px] text-[#9499B3] hover:text-white"
          >
            <Code size={12} className="mr-1 text-cyan-400" />
            <span>EXTRACT DOM</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBrowserStatus()}
            className="h-8 px-2 bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
          >
            <RefreshCw size={12} className={browserState.isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* URL Address Bar */}
      <form onSubmit={handleNavigate} className="flex gap-2">
        <div className="relative flex-1">
          <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <Input
            type="text"
            placeholder="Enter URL to navigate (e.g. http://localhost:3000)..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="pl-8 bg-black/60 border-white/10 text-xs text-[#F1F3F9] font-mono h-9"
          />
        </div>
        <Button
          type="submit"
          disabled={browserState.isLoading}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs h-9 px-4 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
        >
          <span>NAVIGATE</span>
          <ArrowRight size={13} className="ml-1" />
        </Button>
      </form>

      {/* Quick Navigation Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold mr-1">PRESETS:</span>
        {QUICK_URLS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputUrl(item.url);
              navigateBrowser(item.url);
            }}
            className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-[#9499B3] hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live Viewport Screenshot Window */}
      <div className="relative rounded-xl border border-white/10 bg-black/80 overflow-hidden flex flex-col items-center justify-center min-h-[220px] max-h-[340px]">
        {browserState.screenshotB64 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <img
              src={`data:image/png;base64,${browserState.screenshotB64}`}
              alt="Chrome CDP Live Viewport"
              className="max-h-[280px] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-[#4F536E]">
            <Eye size={24} className="text-emerald-500/40 animate-pulse" />
            <span className="text-xs font-bold text-[#9499B3]">Chrome Viewport Standby</span>
            <span className="text-[10px] max-w-xs">
              Dispatch a browser directive (e.g. &apos;Inspect http://localhost:3000&apos;) or click CAPTURE to stream live pixels.
            </span>
          </div>
        )}

        {/* Viewport Overlay Footer */}
        <div className="w-full bg-black/80 px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#9499B3]">
          <span className="truncate max-w-[70%]">URL: {browserState.url}</span>
          <span className="text-emerald-400 font-bold shrink-0">VIEWPORT 1280x800</span>
        </div>
      </div>

      {/* Extracted DOM Text (Collapsible) */}
      {showDomText && browserState.extractedText && (
        <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/30 flex flex-col gap-1.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-cyan-400 flex items-center gap-1">
              <Code size={11} />
              <span>EXTRACTED DOM CONTENT</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDomText(false)}
              className="text-[10px] text-[#4F536E] hover:text-white"
            >
              CLOSE
            </button>
          </div>
          <pre className="text-[10px] text-[#9499B3] max-h-24 overflow-y-auto whitespace-pre-wrap font-mono p-1 rounded bg-black/40">
            {browserState.extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
