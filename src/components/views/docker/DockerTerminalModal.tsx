"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, Trash2, CornerDownLeft } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  containerName: string;
  containerId: string;
  onClose: () => void;
}

export default function DockerTerminalModal({ containerName, containerId, onClose }: Props) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    `[INFO] Connected to docker socket: /var/run/docker.sock`,
    `[INFO] Executed: /bin/sh inside container ${containerName} (${containerId})`,
    `[INFO] Linux 6.8.0-dirtynest x86_64 · Node.js v22.1.0 · SQLite-Vec v0.1.4`,
    `root@${containerId.slice(0, 8)}:/app# `,
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    cyberAudio.play("click");
    const cmd = input.trim();
    const promptLine = `root@${containerId.slice(0, 8)}:/app# ${cmd}`;

    let responseLines: string[] = [];
    if (cmd === "ls" || cmd === "ls -la") {
      responseLines = [
        "drwxr-xr-x 12 root root 4096 Aug 26 04:12 .",
        "drwxr-xr-x  3 root root 4096 Aug 26 04:10 ..",
        "-rw-r--r--  1 root root  820 Aug 26 04:11 package.json",
        "drwxr-xr-x  8 root root 4096 Aug 26 04:12 src",
        "drwxr-xr-x 98 root root 4096 Aug 26 04:12 node_modules",
        "-rw-r--r--  1 root root  142 Aug 26 04:10 Dockerfile",
      ];
    } else if (cmd === "ps" || cmd === "top") {
      responseLines = [
        "PID  USER  %CPU %MEM   VSZ   RSS TTY  STAT START   TIME COMMAND",
        "  1  root   1.2  1.8 14200 48200 ?    Ssl  04:12   0:42 node server.js",
        " 42  root   0.0  0.1  2400  1800 ?    S    04:15   0:00 /bin/sh",
      ];
    } else if (cmd === "env") {
      responseLines = [
        "NODE_ENV=production",
        "PORT=3000",
        "SQLITE_VEC_ENABLED=true",
        "SWARM_BRIDGE_IP=172.18.0.4",
      ];
    } else if (cmd === "clear") {
      setHistory([`root@${containerId.slice(0, 8)}:/app# `]);
      setInput("");
      return;
    } else {
      responseLines = [`executing: ${cmd} · returncode=0 · OK`];
    }

    setHistory((prev) => [...prev, promptLine, ...responseLines, `root@${containerId.slice(0, 8)}:/app# `]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-3xl cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0C14] border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-bold text-[#F1F3F9] ml-2">
              CONTAINER EXEC // <span className="text-[#00FF41]">{containerName}</span>
            </span>
          </div>

          <button onClick={onClose} className="text-[#4F536E] hover:text-[#F1F3F9] p-1 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Stream Area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-black/80 text-[#00FF41] select-text">
          {history.map((line, idx) => (
            <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
              {line.startsWith("[INFO]") ? (
                <span className="text-[#9499B3]">{line}</span>
              ) : line.includes("root@") ? (
                <span className="text-[#00F0FF]">{line}</span>
              ) : (
                <span className="text-[#F1F3F9]">{line}</span>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#0A0C14] border-t border-white/10 flex items-center gap-2">
          <span className="text-xs text-[#00FF41] font-bold">$</span>
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type container command (ls, top, env, clear, ps)..."
            className="flex-1 bg-transparent text-xs text-[#F1F3F9] font-mono outline-none placeholder:text-[#4F536E]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#00FF41]/20 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <CornerDownLeft size={12} />
            <span>RUN</span>
          </button>
        </form>
      </div>
    </div>
  );
}
