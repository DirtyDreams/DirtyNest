"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, Download, X, Terminal } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

// Asciinema v2 Frame: [timeOffsetInSeconds, "o", "text\n"]
export type CastFrame = [number, "o", string];

export interface CastSession {
  id: string;
  title: string;
  author: string;
  durationSec: number;
  description: string;
  frames: CastFrame[];
}

const PRESET_SESSIONS: CastSession[] = [
  {
    id: "session-core-eng",
    title: "Core Engineering // Heartbeat & AST Compiler Run",
    author: "TECH-LEAD-01 (Claude 3.7)",
    durationSec: 12.5,
    description: "Autonomous compiler loop optimizing WebAssembly kernel bindings with zero AST leaks.",
    frames: [
      [0.0, "o", "\x1b[32m[00:00:00]\x1b[0m \x1b[1mTECH-LEAD-01 initialized with runtime adapter: Claude Code CLI\x1b[0m\n"],
      [1.0, "o", "\x1b[36m[00:00:01]\x1b[0m $ cargo build --target wasm32-unknown-unknown --release\n"],
      [2.2, "o", "   \x1b[33mCompiling\x1b[0m dirtynest-kernel v0.0.1 (/workspace/core/kernel)\n"],
      [3.8, "o", "   \x1b[33mCompiling\x1b[0m ebpf-ast-scanner v0.4.2\n"],
      [5.4, "o", "   \x1b[33mCompiling\x1b[0m hnsw-sqlite-vec v1.2.0\n"],
      [7.1, "o", "    \x1b[32mFinished\x1b[0m release [optimized] target(s) in 5.82s\n"],
      [8.5, "o", "\x1b[32m[00:00:08]\x1b[0m Running AST compliance verification on 24 modules...\n"],
      [10.0, "o", "\x1b[32m[00:00:10]\x1b[0m AST CHECK: \x1b[1;32m100% PASS\x1b[0m. 0 memory contention flags detected.\n"],
      [11.5, "o", "\x1b[36m[00:00:11]\x1b[0m Heartbeat token burn: \x1b[1m4,210 tokens ($0.012)\x1b[0m. Next pulse in 30s.\n"],
      [12.5, "o", "\x1b[32m[00:00:12]\x1b[0m \x1b[1;32m✓ SESSION COMPLETED SUCCESSFULLY\x1b[0m\n"],
    ],
  },
  {
    id: "session-zero-trust",
    title: "Zero-Trust AppSec // CVE-2026-3849 & AST Secrets Scan",
    author: "SENTINEL-LEAD (Nous-Hermes-3)",
    durationSec: 14.0,
    description: "Deep vulnerability sweep checking socket buffers, token limits, and open ports.",
    frames: [
      [0.0, "o", "\x1b[31m[00:00:00]\x1b[0m \x1b[1mSENTINEL-LEAD: Starting Zero-Trust Threat Surface Audit\x1b[0m\n"],
      [1.2, "o", "\x1b[36m[00:00:01]\x1b[0m $ dirtynest-sec scan --all-ports --check-cve 2026-3849\n"],
      [2.5, "o", "[*] Inspecting eBPF ringbuffer on interface eth0 (Port: 3000)...\n"],
      [4.2, "o", "[*] Verifying OpenSSH daemon socket isolation against RegreSSHion...\n"],
      [6.0, "o", "    \x1b[32m[OK]\x1b[0m Port 3000 bound to local loopback (127.0.0.1)\n"],
      [7.8, "o", "    \x1b[32m[OK]\x1b[0m JWT ED25519 asymmetric signature verified.\n"],
      [9.5, "o", "[*] Scanning AST repositories for hardcoded API keys...\n"],
      [11.2, "o", "    \x1b[32m[OK]\x1b[0m Scanned 14,820 AST nodes. 0 secrets leaked.\n"],
      [12.8, "o", "\x1b[32m[00:00:12]\x1b[0m \x1b[1;32mTHREAT LEVEL: ZERO (ALL GATES SECURED)\x1b[0m\n"],
      [14.0, "o", "\x1b[36m[00:00:14]\x1b[0m Heartbeat token burn: \x1b[1m8,400 tokens ($0.024)\x1b[0m. Next pulse in 60s.\n"],
    ],
  },
  {
    id: "session-docker-sre",
    title: "Autonomous SRE // Docker Compose Mesh Orchestration",
    author: "KUBE-COMMANDER (OpenAI Codex)",
    durationSec: 11.0,
    description: "Automated scaling and canary rollouts of PostgreSQL Vector and Redis Mesh clusters.",
    frames: [
      [0.0, "o", "\x1b[34m[00:00:00]\x1b[0m \x1b[1mKUBE-COMMANDER: Initiating Service Mesh Canary Rollout\x1b[0m\n"],
      [1.0, "o", "\x1b[36m[00:00:01]\x1b[0m $ docker compose -f docker-compose.prod.yml up -d --scale vector=3\n"],
      [2.8, "o", "[+] Running 4/4\n"],
      [4.0, "o", " ✔ Container dirtynest-postgres-vector-1 \x1b[32mStarted\x1b[0m (0.4s)\n"],
      [5.2, "o", " ✔ Container dirtynest-redis-mesh-1       \x1b[32mStarted\x1b[0m (0.3s)\n"],
      [6.5, "o", " ✔ Container dirtynest-auth-proxy-1       \x1b[32mStarted\x1b[0m (0.4s)\n"],
      [8.0, "o", " ✔ Container dirtynest-mesh-balancer-1    \x1b[32mStarted\x1b[0m (0.2s)\n"],
      [9.5, "o", "\x1b[32m[00:00:09]\x1b[0m Performing health probes on http://localhost:5432 and :6379...\n"],
      [10.2, "o", "\x1b[32m[00:00:10]\x1b[0m Health status: \x1b[1;32m200 OK (Latency: 2.1ms)\x1b[0m\n"],
      [11.0, "o", "\x1b[1;32m✓ MESH DEPLOYMENT 100% OPERATIONAL\x1b[0m\n"],
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CliSessionPlayerModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"player" | "recorder">("player");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("session-core-eng");
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Recorder State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [recordedFrames, setRecordedFrames] = useState<CastFrame[]>([]);
  const [recordInput, setRecordInput] = useState<string>("");
  const recordStartTimeRef = useRef<number>(0);

  const selectedSession = useMemo(() => {
    return PRESET_SESSIONS.find((s) => s.id === selectedSessionId) || PRESET_SESSIONS[0];
  }, [selectedSessionId]);

  // Terminal Playback Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= selectedSession.durationSec) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return selectedSession.durationSec;
            }
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, isLooping, selectedSession.durationSec]);

  // Live Recorder Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((Date.now() - recordStartTimeRef.current) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleTogglePlay = () => {
    cyberAudio.play("click");
    if (currentTimeSec >= selectedSession.durationSec) {
      setCurrentTimeSec(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    cyberAudio.play("click");
    setCurrentTimeSec(0);
    setIsPlaying(false);
  };

  const handleStartRecording = () => {
    cyberAudio.play("warp");
    setIsRecording(true);
    setRecordedFrames([
      [0.0, "o", "\x1b[32m[00:00:00]\x1b[0m \x1b[1mDIRTYNEST TERMINAL RECORDER STARTED\x1b[0m\n"],
    ]);
    recordStartTimeRef.current = Date.now();
    setRecordDuration(0);
  };

  const handleStopRecording = () => {
    cyberAudio.play("click");
    setIsRecording(false);
  };

  const handleRecordCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordInput.trim() || !isRecording) return;
    cyberAudio.play("click");
    const delta = (Date.now() - recordStartTimeRef.current) / 1000;
    setRecordedFrames((prev) => [
      ...prev,
      [Number(delta.toFixed(2)), "o", `\x1b[36m$ ${recordInput}\x1b[0m\n`],
      [
        Number((delta + 0.3).toFixed(2)),
        "o",
        `[exec] ${recordInput}: executed with code 0 (delta: ${delta.toFixed(2)}s)\n`,
      ],
    ]);
    setRecordInput("");
  };

  const handleExportCast = () => {
    cyberAudio.play("chime");
    const exportData = {
      version: 2,
      width: 100,
      height: 30,
      timestamp: Math.floor(Date.now() / 1000),
      title: "DirtyNest Recorded CLI Session",
      env: { SHELL: "/bin/zsh", TERM: "xterm-256color" },
      frames: isRecording || recordedFrames.length > 0 ? recordedFrames : selectedSession.frames,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dirtynest-session-${Date.now()}.cast`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ANSI color parsing to HTML elements
  const renderedOutput = useMemo(() => {
    const visibleFrames = selectedSession.frames.filter(
      (f) => f[0] <= currentTimeSec
    );

    return visibleFrames.map((frame, idx) => {
      const text = frame[2];
      // Convert basic ANSI colors to stylized spans
      const formatted = text
        .replace(/\x1b\[32m/g, '<span style="color: #00FF41;">')
        .replace(/\x1b\[1;32m/g, '<span style="color: #00FF41; font-weight: bold;">')
        .replace(/\x1b\[36m/g, '<span style="color: #00F0FF;">')
        .replace(/\x1b\[33m/g, '<span style="color: #FFB800;">')
        .replace(/\x1b\[31m/g, '<span style="color: #FF2A6D;">')
        .replace(/\x1b\[34m/g, '<span style="color: #60A5FA;">')
        .replace(/\x1b\[1m/g, '<span style="font-weight: bold; color: #FFFFFF;">')
        .replace(/\x1b\[0m/g, "</span>");

      return (
        <div
          key={idx}
          className="leading-relaxed whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  }, [selectedSession, currentTimeSec]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs select-none"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_70px_rgba(0,0,0,0.95)] rounded-2xl border border-[#00FF41]/40 bg-[#080912]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E101F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Terminal size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm tracking-wide uppercase">
                  CLI SESSION RECORDER & REPLAYER // <span className="text-[#00FF41]">ASCIINEMA v2</span>
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  100% FRONTEND
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Frame-by-frame terminal playback, live command delta recording & pure-client .cast exporter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 text-[10px]">
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveTab("player");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "player"
                    ? "bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                REPLAY STUDIO
              </button>
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveTab("recorder");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "recorder"
                    ? "bg-red-500 text-white shadow-[0_0_10px_rgba(255,0,60,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                LIVE RECORDER
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === "player" ? (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Session Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_SESSIONS.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedSessionId(sess.id);
                    setCurrentTimeSec(0);
                    setIsPlaying(true);
                  }}
                  className={`px-3 py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                    selectedSessionId === sess.id
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-[11px]">{sess.title}</div>
                  <div className="text-[9px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{sess.author}</span>
                    <span>•</span>
                    <span>{sess.durationSec}s</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Terminal Screen Canvas Frame */}
            <div className="rounded-xl border border-white/10 bg-black/90 p-4 min-h-[260px] max-h-[360px] overflow-y-auto font-mono text-[11px] shadow-inner text-slate-200">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-[10px] text-slate-500">
                <span>TERMINAL_OUTPUT // TTY: /dev/pts/1</span>
                <span>
                  OFFSET: {currentTimeSec.toFixed(1)}s / {selectedSession.durationSec.toFixed(1)}s
                </span>
              </div>

              <div className="space-y-1">{renderedOutput}</div>

              {renderedOutput.length === 0 && (
                <div className="text-slate-600 text-center py-16">PRESS PLAY TO BEGIN PLAYBACK STREAM</div>
              )}
            </div>

            {/* Scrubber Timeline & Playback Controls */}
            <div className="cyber-card p-4 flex flex-col gap-3 border border-white/10 bg-[#0B0C16]">
              {/* Timeline Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>00:00</span>
                  <span className="text-[#00FF41] font-mono">
                    {currentTimeSec.toFixed(1)}s / {selectedSession.durationSec.toFixed(1)}s
                  </span>
                  <span>{selectedSession.durationSec.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={selectedSession.durationSec}
                  step="0.1"
                  value={currentTimeSec}
                  onChange={(e) => {
                    setCurrentTimeSec(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41]"
                />
              </div>

              {/* Action Buttons Cluster */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] cursor-pointer transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    title="Reset to 00:00"
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* Speed Multipliers */}
                  <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/10 text-[10px]">
                    {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          cyberAudio.play("click");
                          setPlaybackSpeed(spd);
                        }}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          playbackSpeed === spd
                            ? "bg-white/20 text-white"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setIsLooping((p) => !p);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                      isLooping
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-white/5 text-slate-500 border-white/10"
                    }`}
                  >
                    LOOP
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCast}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold cursor-pointer text-[10px]"
                  >
                    <Download size={13} />
                    <span>EXPORT (.cast)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Terminal Recorder Tab */
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording ? "bg-red-500 animate-ping" : "bg-slate-600"
                  }`}
                />
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {isRecording ? "RECORDING IN PROGRESS..." : "RECORDER STANDBY"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Capturing keystrokes and shell responses with microsecond timestamps in browser memory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-red-400 font-bold">
                  {recordDuration.toFixed(1)}s • {recordedFrames.length} frames
                </span>
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 cursor-pointer shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                  >
                    START RECORDING
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-black hover:bg-slate-700 cursor-pointer"
                  >
                    STOP RECORDING
                  </button>
                )}
              </div>
            </div>

            {/* Recorder Terminal Console */}
            <div className="rounded-xl border border-white/10 bg-black/90 p-4 min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-1">
              {recordedFrames.map((f, i) => (
                <div key={i}>{f[2]}</div>
              ))}
              {recordedFrames.length === 0 && (
                <div className="text-slate-600 text-center py-12">
                  CLICK &quot;START RECORDING&quot; AND TYPE DIRECTIVES BELOW
                </div>
              )}
            </div>

            {/* Recorder Input Line */}
            <form onSubmit={handleRecordCommandSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-[#00FF41] font-bold">&gt;</span>
                <input
                  type="text"
                  disabled={!isRecording}
                  value={recordInput}
                  onChange={(e) => setRecordInput(e.target.value)}
                  placeholder={
                    isRecording
                      ? "Type shell directive and press Enter..."
                      : "Start recording above to enable input..."
                  }
                  className="flex-1 bg-transparent text-white outline-none text-xs disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!isRecording || !recordInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#00FF41] text-black font-black hover:bg-[#00cc34] disabled:opacity-30 cursor-pointer"
              >
                EXECUTE
              </button>

              <button
                type="button"
                onClick={handleExportCast}
                disabled={recordedFrames.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 cursor-pointer"
              >
                <Download size={13} />
                <span>SAVE .CAST</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
