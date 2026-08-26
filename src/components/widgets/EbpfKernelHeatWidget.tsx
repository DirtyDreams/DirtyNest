"use client";

import { useState } from "react";
import {
  Activity,
  Cpu,
  Layers,
  Zap,
  Terminal,
  Shield,
  RotateCcw,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SyscallStat {
  name: string;
  countPerSec: number;
  avgLatencyUs: number;
  category: "PROCESS" | "NETWORK" | "FS";
}

const INITIAL_SYSCALLS: SyscallStat[] = [
  { name: "sys_enter_execve", countPerSec: 14, avgLatencyUs: 120, category: "PROCESS" },
  { name: "sys_enter_socket", countPerSec: 284, avgLatencyUs: 18, category: "NETWORK" },
  { name: "sys_enter_connect", countPerSec: 192, avgLatencyUs: 85, category: "NETWORK" },
  { name: "sys_enter_vfs_read", countPerSec: 1420, avgLatencyUs: 6, category: "FS" },
  { name: "sys_enter_bpf", countPerSec: 32, avgLatencyUs: 4, category: "PROCESS" },
];

export default function EbpfKernelHeatWidget() {
  const [syscalls, setSyscalls] = useState<SyscallStat[]>(INITIAL_SYSCALLS);
  const [kernelOverhead] = useState(0.38);

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Activity size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              eBPF KERNEL OBSERVABILITY
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Real-time Syscall Probes & Kernel Overhead
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-bold">
          <span>OVERHEAD: {kernelOverhead}%</span>
        </div>
      </div>

      {/* Syscall Heat Rows */}
      <div className="space-y-1.5 pt-1">
        {syscalls.map((sc) => {
          const isHigh = sc.countPerSec > 500;
          return (
            <div
              key={sc.name}
              className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHigh ? "bg-[#00FF41] animate-ping" : "bg-[#00F0FF]"
                  }`}
                />
                <span className="font-bold text-[#F1F3F9] text-[11px] font-mono">
                  {sc.name}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#00FF41] font-bold" suppressHydrationWarning>
                  {sc.countPerSec} /s
                </span>
                <span className="text-[#4F536E]" suppressHydrationWarning>{sc.avgLatencyUs} µs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
