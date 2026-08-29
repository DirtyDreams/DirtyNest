"use client";

import { useEffect, useRef, useState } from "react";
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { cyberAudio } from "@/lib/cyberAudio";
import { hermesSocket } from "@/lib/hermes/hermesSocket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COMMANDS = [
  { label: "🐳 Docker PS", cmd: "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'\r" },
  { label: "🌿 Git Status", cmd: "git status -s\r" },
  { label: "🛡️ Netstat Ports", cmd: "netstat -ano | findstr '3000 8000 30000 6333 5432 6379'\r" },
  { label: "🗄️ Qdrant Test", cmd: "curl http://localhost:6333/collections\r" },
  { label: "🧹 Clear Screen", cmd: "Clear-Host\r" },
];

export default function CyberpunkTerminalModal({ isOpen, onClose }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    // Initialize Xterm instance
    const term = new Terminal({
      theme: {
        background: "#06070E",
        foreground: "#00FF41",
        cursor: "#00FF41",
        cursorAccent: "#000000",
        selectionBackground: "rgba(0, 255, 65, 0.3)",
        black: "#0D0E18",
        red: "#FF2A6D",
        green: "#00FF41",
        yellow: "#FFB800",
        blue: "#00F0FF",
        magenta: "#BF40FF",
        cyan: "#00F0FF",
        white: "#F1F3F9",
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.25,
      cursorBlink: true,
      cursorStyle: "block",
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    termInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to Sidecar Terminal WebSocket
    const wsUrl = "ws://127.0.0.1:8000/ws/terminal";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      term.focus();
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      term.write("\r\n\x1b[31m[SESSION CLOSED: Disconnected from Sidecar Terminal]\x1b[0m\r\n");
    };

    ws.onerror = () => {
      setIsConnected(false);
      term.write("\r\n\x1b[31m[ERROR: Could not connect to ws://127.0.0.1:8000/ws/terminal]\x1b[0m\r\n");
    };

    // Forward terminal input to WebSocket
    term.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });


    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ws.close();
      term.dispose();
      termInstanceRef.current = null;
    };
  }, [isOpen]);

  const sendCommand = (cmd: string) => {
    cyberAudio.play("click");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd);
      termInstanceRef.current?.focus();
    }
  };

  const handleReconnect = () => {
    cyberAudio.play("warp");
    if (wsRef.current) wsRef.current.close();
    if (termInstanceRef.current) {
      termInstanceRef.current.clear();
      termInstanceRef.current.write("\x1b[33mReconnecting to terminal...\x1b[0m\r\n");
    }
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/terminal");
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (e) => termInstanceRef.current?.write(e.data);
    ws.onclose = () => setIsConnected(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono select-none"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className={`w-full flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_25px_80px_rgba(0,0,0,0.95)] rounded-2xl border border-emerald-500/40 bg-[#06070E] transition-all ${
          isMaximized ? "h-[96vh] max-w-[98vw]" : "h-[75vh] max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TerminalIcon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-[#F1F3F9] text-xs tracking-wider uppercase">
                  CYBERPUNK LIVE SHELL // <span className="text-emerald-400">PTY SANDBOX</span>
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-bold ${
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {isConnected ? "SHELL PTY ONLINE" : "OFFLINE"}
                </Badge>
              </div>
              <span className="text-[10px] text-[#4F536E]">
                Direct interactive terminal stream to local host via Python Sidecar (:8000)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              className="h-8 px-2 bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
              title="Reconnect Terminal"
            >
              <RefreshCw size={13} className={isConnected ? "" : "animate-spin text-red-400"} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMaximized(!isMaximized);
                setTimeout(() => fitAddonRef.current?.fit(), 100);
              }}
              className="h-8 px-2 bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
            >
              {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2 text-[#9499B3] hover:text-white"
            >
              <X size={15} />
            </Button>
          </div>
        </div>

        {/* Quick Command Chips */}
        <div className="flex items-center gap-1.5 p-2.5 bg-black/60 border-b border-white/5 flex-wrap">
          <span className="text-[10px] text-[#4F536E] font-bold uppercase mr-1">QUICK COMMANDS:</span>
          {PRESET_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendCommand(item.cmd)}
              className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/5 text-[10px] text-[#9499B3] hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer font-mono"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* XTerm Container */}
        <div
          ref={terminalRef}
          className="flex-1 p-3 bg-[#06070E] overflow-hidden select-text cursor-text"
        />
      </div>
    </div>
  );
}
