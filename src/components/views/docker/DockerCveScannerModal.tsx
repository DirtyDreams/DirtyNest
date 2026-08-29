"use client";

import { useState } from "react";
import { ShieldAlert, X, RefreshCw } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  imageName: string;
  onClose: () => void;
}

interface CveEntry {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  pkgName: string;
  installedVersion: string;
  fixedVersion: string;
  description: string;
}

const SAMPLE_CVES: CveEntry[] = [
  {
    id: "CVE-2026-1049",
    severity: "HIGH",
    pkgName: "openssl",
    installedVersion: "3.1.2-r0",
    fixedVersion: "3.1.2-r1",
    description: "Memory corruption in ASN.1 decoding sequence during TLS handshake verification.",
  },
  {
    id: "CVE-2026-0812",
    severity: "MEDIUM",
    pkgName: "libcrypto3",
    installedVersion: "3.1.2-r0",
    fixedVersion: "3.1.2-r1",
    description: "Timing side-channel vulnerability in modular exponentiation routine.",
  },
  {
    id: "CVE-2025-4491",
    severity: "LOW",
    pkgName: "busybox",
    installedVersion: "1.36.1-r4",
    fixedVersion: "1.36.1-r5",
    description: "Heap out-of-bounds read in decompress_gunzip parser.",
  },
];

export default function DockerCveScannerModal({ imageName, onClose }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [cves, setCves] = useState<CveEntry[]>(SAMPLE_CVES);

  const handleRescan = () => {
    cyberAudio.play("warp");
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      cyberAudio.play("chime");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-2xl cyber-card p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-amber-500/40">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldAlert size={16} className="text-amber-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
                TRIVY CVE SCANNER // <span className="text-amber-400">{imageName}</span>
              </h3>
              <span className="text-[10px] text-[#9499B3]">
                Static binary & dependency vulnerability audit
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-[#4F536E] hover:text-[#F1F3F9] text-xs cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* Severity Summary Bar */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col">
            <span className="text-[10px] text-red-400 font-bold">CRITICAL</span>
            <span className="text-lg font-black text-red-400">0</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold">HIGH</span>
            <span className="text-lg font-black text-amber-400">1</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col">
            <span className="text-[10px] text-cyan-400 font-bold">MEDIUM</span>
            <span className="text-lg font-black text-cyan-400">1</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] text-[#9499B3] font-bold">LOW</span>
            <span className="text-lg font-black text-[#9499B3]">1</span>
          </div>
        </div>

        {/* Vulnerabilities List */}
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
          {cves.map((cve) => {
            const sevColor =
              cve.severity === "CRITICAL"
                ? "#FF003C"
                : cve.severity === "HIGH"
                ? "#FFB800"
                : cve.severity === "MEDIUM"
                ? "#00F0FF"
                : "#9499B3";
            return (
              <div
                key={cve.id}
                className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col gap-1.5 text-xs hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: sevColor,
                        background: `${sevColor}15`,
                        borderColor: `${sevColor}40`,
                      }}
                    >
                      {cve.severity}
                    </span>
                    <span className="font-bold text-[#F1F3F9]">{cve.id}</span>
                    <span className="text-[10px] text-[#4F536E]">({cve.pkgName})</span>
                  </div>
                  <span className="text-[10px] text-[#00FF41]">Fix: {cve.fixedVersion}</span>
                </div>
                <p className="text-[11px] text-[#9499B3] font-sans leading-tight">{cve.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#F1F3F9] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? "SCANNING LAYERS..." : "RE-SCAN IMAGE"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
