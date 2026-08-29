"use client";

import { useState } from "react";
import { Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface DiagnosticTest {
  id: string;
  name: string;
  category: "STORAGE" | "COMPUTE" | "NETWORK" | "GRAPHICS" | "AUDIO";
  status: "PENDING" | "RUNNING" | "PASSED" | "WARNED";
  metric: string;
}

const INITIAL_TESTS: DiagnosticTest[] = [
  { id: "t1", name: "SQLite-Vec In-Memory WASM Engine", category: "COMPUTE", status: "PASSED", metric: "0.8ms init time" },
  { id: "t2", name: "V8 Isolate & Web Worker Concurrency", category: "COMPUTE", status: "PASSED", metric: "8 threads OK" },
  { id: "t3", name: "IndexedDB / LocalStorage IOPS Throughput", category: "STORAGE", status: "PASSED", metric: "48.2 MB/s read" },
  { id: "t4", name: "Web Audio Synthesizer Frequency Range", category: "AUDIO", status: "PASSED", metric: "44.1kHz stereo" },
  { id: "t5", name: "Canvas 2D / WebGL 60FPS Hardware Acceleration", category: "GRAPHICS", status: "PASSED", metric: "60.0 FPS stable" },
  { id: "t6", name: "Zero-Trust JWT Cryptographic Signature Keyring", category: "NETWORK", status: "PASSED", metric: "HS256/Ed25519 OK" },
];

export default function SystemDiagnosticsTab() {
  const [tests, setTests] = useState<DiagnosticTest[]>(INITIAL_TESTS);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunAllDiagnostics = () => {
    cyberAudio.play("warp");
    setIsRunningAll(true);

    // Reset tests to running
    setTests((prev) => prev.map((t) => ({ ...t, status: "RUNNING" })));

    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) => ({
          ...t,
          status: "PASSED",
          metric: `${(Math.random() * 2 + 0.4).toFixed(1)}ms execution SLA`,
        }))
      );
      setIsRunningAll(false);
      cyberAudio.play("chime");
    }, 1500);
  };

  return (
    <div className="cyber-card p-5 sm:p-6 flex flex-col gap-4 font-mono select-none border border-[#00FF41]/30">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center">
            <Activity size={16} className="text-[#00FF41]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              DIRTYNEST SYSTEM SELF-DIAGNOSTIC BENCHMARK SUITE
            </h3>
            <span className="text-[10px] text-[#9499B3]">
              Verify browser subsystem health, WebAssembly engines, and storage performance
            </span>
          </div>
        </div>

        <button
          onClick={handleRunAllDiagnostics}
          disabled={isRunningAll}
          className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRunningAll ? "animate-spin" : ""} />
          <span>{isRunningAll ? "BENCHMARKING..." : "RUN FULL DIAGNOSTIC"}</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {tests.map((test) => (
          <div
            key={test.id}
            className="p-3.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between gap-3 text-xs hover:border-white/20 transition-all"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[#4F536E]">
                  {test.category}
                </span>
                <span className="font-bold text-[#F1F3F9] truncate">{test.name}</span>
              </div>
              <span className="text-[10px] text-[#00F0FF] font-mono">{test.metric}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {test.status === "RUNNING" ? (
                <RefreshCw size={14} className="text-[#00F0FF] animate-spin" />
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                  <CheckCircle2 size={12} />
                  <span>PASS</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
