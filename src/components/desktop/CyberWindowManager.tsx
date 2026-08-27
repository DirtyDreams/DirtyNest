"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Minus,
  Square,
  X,
  Terminal,
  Activity,
  Server,
  Bot,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Plus,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export type FloatingWindowType =
  | "terminal"
  | "paperclip"
  | "docker"
  | "promql"
  | "chatbot"
  | "mitre";

export interface FloatingWindow {
  id: string;
  type: FloatingWindowType;
  title: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

const DEFAULT_WINDOWS: FloatingWindow[] = [
  {
    id: "win-terminal",
    type: "terminal",
    title: "CYBER TERMINAL CORE // eBPF PROBE",
    icon: "💻",
    color: "#00FF41",
    x: 80,
    y: 100,
    width: 540,
    height: 360,
    minimized: false,
    maximized: false,
    zIndex: 10,
  },
  {
    id: "win-paperclip",
    type: "paperclip",
    title: "PAPERCLIP AI // HEARTBEATS TELEMETRY",
    icon: "🤖",
    color: "#00F0FF",
    x: 420,
    y: 180,
    width: 500,
    height: 380,
    minimized: false,
    maximized: false,
    zIndex: 11,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberWindowManager({ isOpen, onClose }: Props) {
  const [windows, setWindows] = useState<FloatingWindow[]>(DEFAULT_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string>("win-terminal");
  const [topZ, setTopZ] = useState(20);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // Drag state
  const dragRef = useRef<{
    isDragging: boolean;
    windowId: string | null;
    startX: number;
    startY: number;
    startWinX: number;
    startWinY: number;
  }>({
    isDragging: false,
    windowId: null,
    startX: 0,
    startY: 0,
    startWinX: 0,
    startWinY: 0,
  });

  // Resize state
  const resizeRef = useRef<{
    isResizing: boolean;
    windowId: string | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    isResizing: false,
    windowId: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const bringToFront = useCallback(
    (id: string) => {
      setActiveWindowId(id);
      setTopZ((prev) => {
        const nextZ = prev + 1;
        setWindows((wins) =>
          wins.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w))
        );
        return nextZ;
      });
    },
    []
  );

  const handleMouseDownHeader = (e: React.MouseEvent, id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win || win.maximized) return;
    bringToFront(id);
    dragRef.current = {
      isDragging: true,
      windowId: id,
      startX: e.clientX,
      startY: e.clientY,
      startWinX: win.x,
      startWinY: win.y,
    };
  };

  const handleMouseDownResize = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const win = windows.find((w) => w.id === id);
    if (!win || win.maximized) return;
    bringToFront(id);
    resizeRef.current = {
      isResizing: true,
      windowId: id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: win.width,
      startHeight: win.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current.isDragging && dragRef.current.windowId) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const id = dragRef.current.windowId;
        setWindows((wins) =>
          wins.map((w) =>
            w.id === id
              ? {
                  ...w,
                  x: Math.max(10, Math.min(window.innerWidth - 100, dragRef.current.startWinX + dx)),
                  y: Math.max(60, Math.min(window.innerHeight - 100, dragRef.current.startWinY + dy)),
                }
              : w
          )
        );
      } else if (resizeRef.current.isResizing && resizeRef.current.windowId) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const id = resizeRef.current.windowId;
        setWindows((wins) =>
          wins.map((w) =>
            w.id === id
              ? {
                  ...w,
                  width: Math.max(340, resizeRef.current.startWidth + dx),
                  height: Math.max(220, resizeRef.current.startHeight + dy),
                }
              : w
          )
        );
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging || resizeRef.current.isResizing) {
        dragRef.current.isDragging = false;
        resizeRef.current.isResizing = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const toggleMinimize = (id: string) => {
    cyberAudio.play("click");
    setWindows((wins) =>
      wins.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const toggleMaximize = (id: string) => {
    cyberAudio.play("click");
    setWindows((wins) =>
      wins.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  };

  const closeWindow = (id: string) => {
    cyberAudio.play("click");
    setWindows((wins) => wins.filter((w) => w.id !== id));
  };

  const spawnWindow = (type: FloatingWindowType) => {
    cyberAudio.play("warp");
    const id = `win-${type}-${Date.now()}`;
    let title = "NEW WINDOW";
    let icon = "⚡";
    let color = "#00FF41";

    if (type === "terminal") {
      title = "CYBER TERMINAL CORE";
      icon = "💻";
      color = "#00FF41";
    } else if (type === "paperclip") {
      title = "PAPERCLIP HEARTBEAT HUD";
      icon = "🤖";
      color = "#00F0FF";
    } else if (type === "docker") {
      title = "DOCKER CONTAINER MONITOR";
      icon = "🐳";
      color = "#BF40FF";
    } else if (type === "promql") {
      title = "PROMQL HEATMAP & SPARKLINE";
      icon = "📈";
      color = "#FFB800";
    } else if (type === "chatbot") {
      title = "CYBER AI REASONING CORE";
      icon = "💬";
      color = "#00FF41";
    } else if (type === "mitre") {
      title = "MITRE ATT&CK THREAT RADAR";
      icon = "🛡️";
      color = "#FF2A6D";
    }

    const newWin: FloatingWindow = {
      id,
      type,
      title,
      icon,
      color,
      x: 120 + (windows.length * 30) % 300,
      y: 120 + (windows.length * 30) % 200,
      width: 500,
      height: 360,
      minimized: false,
      maximized: false,
      zIndex: topZ + 1,
    };

    setTopZ((z) => z + 1);
    setWindows((wins) => [...wins, newWin]);
    setActiveWindowId(id);
    setIsLauncherOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 font-mono text-xs select-none">
      {/* Floating Windows Stage */}
      {windows.map((win) => {
        if (win.minimized) return null;
        const isActive = win.id === activeWindowId;

        return (
          <div
            key={win.id}
            onClick={() => bringToFront(win.id)}
            style={{
              position: "fixed",
              left: win.maximized ? 0 : win.x,
              top: win.maximized ? 48 : win.y,
              width: win.maximized ? "100vw" : win.width,
              height: win.maximized ? "calc(100vh - 96px)" : win.height,
              zIndex: win.zIndex,
              borderColor: isActive ? win.color : "rgba(255, 255, 255, 0.15)",
              boxShadow: isActive
                ? `0 15px 50px rgba(0,0,0,0.85), 0 0 25px ${win.color}25`
                : "0 10px 30px rgba(0,0,0,0.7)",
            }}
            className="pointer-events-auto flex flex-col rounded-xl bg-[#090A14]/95 backdrop-blur-md border shadow-2xl overflow-hidden animate-fade-in"
          >
            {/* Titlebar Header */}
            <div
              onMouseDown={(e) => handleMouseDownHeader(e, win.id)}
              className="px-3 py-2 bg-[#0E101F] border-b border-white/10 flex items-center justify-between cursor-move shrink-0"
              style={{
                borderTop: `2px solid ${win.color}`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{win.icon}</span>
                <span className="font-black text-white text-[11px] truncate uppercase tracking-wider">
                  {win.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize(win.id);
                  }}
                  className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  title="Minimize"
                  aria-label="Minimize Window"
                >
                  <Minus size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMaximize(win.id);
                  }}
                  className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  title={win.maximized ? "Restore" : "Maximize"}
                  aria-label="Maximize Window"
                >
                  {win.maximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  className="w-5 h-5 rounded bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center cursor-pointer"
                  title="Close"
                  aria-label="Close Window"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="flex-1 overflow-auto p-3 text-slate-300 bg-black/40">
              {win.type === "terminal" && <FloatingTerminalContent />}
              {win.type === "paperclip" && <FloatingPaperclipContent />}
              {win.type === "docker" && <FloatingDockerContent />}
              {win.type === "promql" && <FloatingPromQlContent />}
              {win.type === "chatbot" && <FloatingChatContent />}
              {win.type === "mitre" && <FloatingMitreContent />}
            </div>

            {/* Resize Corner Handle */}
            {!win.maximized && (
              <div
                onMouseDown={(e) => handleMouseDownResize(e, win.id)}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5"
                title="Resize"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-slate-500" />
              </div>
            )}
          </div>
        );
      })}

      {/* Cyber Taskbar at Bottom */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#090A14]/90 backdrop-blur-xl border border-[#00FF41]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50">
        {/* Launcher Button */}
        <div className="relative">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsLauncherOpen((p) => !p);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-[10px] hover:bg-[#00cc34] cursor-pointer transition-all shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            <Plus size={13} />
            <span>APPS</span>
          </button>

          {/* Launcher Popout */}
          {isLauncherOpen && (
            <div className="absolute bottom-11 left-0 w-56 rounded-xl bg-[#0E101F] border border-white/15 p-1.5 shadow-2xl flex flex-col gap-1 animate-fade-in text-[10px]">
              <button
                onClick={() => spawnWindow("terminal")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>💻</span> Cyber Terminal
              </button>
              <button
                onClick={() => spawnWindow("paperclip")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>🤖</span> Paperclip Heartbeats
              </button>
              <button
                onClick={() => spawnWindow("docker")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>🐳</span> Docker Watcher
              </button>
              <button
                onClick={() => spawnWindow("promql")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>📈</span> PromQL Sparkline
              </button>
              <button
                onClick={() => spawnWindow("chatbot")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>💬</span> Cyber AI Core
              </button>
              <button
                onClick={() => spawnWindow("mitre")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
              >
                <span>🛡️</span> MITRE Threat Radar
              </button>
            </div>
          )}
        </div>

        {/* Running Window Chips */}
        <div className="flex items-center gap-1 max-w-[60vw] overflow-x-auto scrollbar-none px-1">
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => {
                if (win.minimized) {
                  toggleMinimize(win.id);
                  bringToFront(win.id);
                } else if (win.id === activeWindowId) {
                  toggleMinimize(win.id);
                } else {
                  bringToFront(win.id);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                !win.minimized && win.id === activeWindowId
                  ? "bg-white/15 text-white border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : win.minimized
                  ? "bg-black/40 text-slate-500 border-white/5"
                  : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
              }`}
            >
              <span>{win.icon}</span>
              <span className="max-w-[90px] truncate">{win.title.split(" // ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Exit Floating Desktop Button */}
        <button
          onClick={() => {
            cyberAudio.play("click");
            onClose();
          }}
          className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/30 cursor-pointer"
        >
          EXIT OS
        </button>
      </div>
    </div>
  );
}

// Subcomponents for Window Content

function FloatingTerminalContent() {
  const [lines, setLines] = useState<string[]>([
    "[00:00:01] kernel: eBPF probe socket watcher loaded on eth0",
    "[00:00:04] auth: JWT public key ED25519 rotated cleanly",
    "[00:00:08] swarm: mesh health 100% - 4 agent teams online",
    "[00:00:12] ready: listening for operator commands...",
  ]);
  const [cmd, setCmd] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    cyberAudio.play("click");
    setLines((prev) => [...prev, `$ ${cmd}`, `[exec] ${cmd}: 0 errors returned (latency 4ms)`]);
    setCmd("");
  };

  return (
    <div className="flex flex-col h-full font-mono text-[11px] gap-2">
      <div className="flex-1 overflow-y-auto space-y-1 text-emerald-400/90 pr-1">
        {lines.map((l, i) => (
          <div key={i} className="leading-tight">
            {l}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-white/10">
        <span className="text-[#00FF41] font-bold">&gt;</span>
        <input
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="Execute shell directive..."
          className="flex-1 bg-transparent text-white outline-none text-[11px]"
        />
      </form>
    </div>
  );
}

function FloatingPaperclipContent() {
  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
        <span className="text-slate-400">Core Engineering:</span>
        <span className="text-[#00FF41] font-bold">PULSE IN 18s (Claude Code CLI)</span>
      </div>
      <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
        <span className="text-slate-400">Zero-Trust AppSec:</span>
        <span className="text-cyan-400 font-bold">PULSE IN 44s (Hermes Local)</span>
      </div>
      <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
        <span className="text-slate-400">Autonomous SRE:</span>
        <span className="text-emerald-400 font-bold">PULSE IN 08s (Codex API)</span>
      </div>
      <div className="p-2.5 rounded-xl bg-black/60 border border-[#00FF41]/20 flex items-center justify-between">
        <span className="text-slate-300">Monthly Cap: $42.50 / $100.00</span>
        <span className="text-[10px] text-[#00FF41] font-bold">SOFT ALERT: OK</span>
      </div>
    </div>
  );
}

function FloatingDockerContent() {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="p-2 rounded bg-black/40 border border-white/5 flex justify-between">
        <span className="text-white font-bold">postgres-vector:16</span>
        <span className="text-[#00FF41]">HEALTHY (:5432)</span>
      </div>
      <div className="p-2 rounded bg-black/40 border border-white/5 flex justify-between">
        <span className="text-white font-bold">redis-mesh:7.4</span>
        <span className="text-[#00FF41]">HEALTHY (:6379)</span>
      </div>
      <div className="p-2 rounded bg-black/40 border border-white/5 flex justify-between">
        <span className="text-white font-bold">auth-proxy-go:2.1</span>
        <span className="text-cyan-400">RUNNING (:8080)</span>
      </div>
    </div>
  );
}

function FloatingPromQlContent() {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="text-slate-400">Query: rate(http_requests_total[5m])</div>
      <div className="h-20 bg-black/50 rounded-lg border border-white/5 flex items-center justify-center text-amber-400">
        <Activity size={28} className="animate-pulse" />
        <span className="ml-2 font-bold">1,842 req/sec • 99.98% SLA</span>
      </div>
    </div>
  );
}

function FloatingChatContent() {
  return (
    <div className="flex flex-col h-full justify-between font-mono text-[11px]">
      <div className="p-2 rounded bg-black/50 border border-white/5 text-slate-300">
        <strong className="text-[#00FF41]">DIRTYNEST AI:</strong> System is operating at peak efficiency. All 16 decks are online with zero unhandled errors.
      </div>
      <div className="pt-2">
        <input
          type="text"
          placeholder="Ask Cyber Core AI..."
          className="w-full p-2 bg-black/60 rounded-lg border border-white/10 text-white text-[11px] outline-none"
        />
      </div>
    </div>
  );
}

function FloatingMitreContent() {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300">
        <strong>TA0001 INITIAL ACCESS:</strong> 0 active intrusions
      </div>
      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
        <strong>TA0006 CREDENTIAL ACCESS:</strong> AST scan passed cleanly
      </div>
    </div>
  );
}
