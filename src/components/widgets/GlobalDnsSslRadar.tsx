"use client";

import { useState } from "react";
import { Globe, ShieldCheck, RotateCcw, Clock } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface RegionLatency {
  region: string;
  flag: string;
  dnsMs: number;
  status: "OPTIMAL" | "NOMINAL";
}

const REGIONS: RegionLatency[] = [
  { region: "Frankfurt (eu-central-1)", flag: "🇪🇺", dnsMs: 14, status: "OPTIMAL" },
  { region: "Virginia (us-east-1)", flag: "🇺🇸", dnsMs: 42, status: "OPTIMAL" },
  { region: "Tokyo (ap-northeast-1)", flag: "🇯🇵", dnsMs: 138, status: "NOMINAL" },
  { region: "Singapore (ap-southeast-1)", flag: "🇸🇬", dnsMs: 165, status: "NOMINAL" },
];

export default function GlobalDnsSslRadar() {
  const [regions, setRegions] = useState<RegionLatency[]>(REGIONS);
  const [sslDays] = useState(54);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    cyberAudio.play("click");
    setIsRefreshing(true);
    setTimeout(() => {
      setRegions((prev) =>
        prev.map((r) => ({
          ...r,
          dnsMs: Math.max(8, r.dnsMs + Math.floor(Math.random() * 8) - 4),
        }))
      );
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Globe size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              GLOBAL DNS & SSL RADAR
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Multi-Region Edge Propagation & TLS Probe
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
          title="Refresh Global Probes"
        >
          <RotateCcw size={13} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* SSL Status Strip */}
      <div className="p-3 rounded-xl bg-black/40 border border-[#00FF41]/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#00FF41]" />
          <div className="flex flex-col">
            <span className="font-bold text-[#F1F3F9] text-[11px]">TLS 1.3 / Let's Encrypt</span>
            <span className="text-[9px] text-[#4F536E]">ECC 256-bit Key / OCSP Stapling</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#00FF41] font-bold">
          <Clock size={11} />
          <span>{sslDays} DAYS REMAINING</span>
        </div>
      </div>

      {/* Global Regional Latencies Grid */}
      <div className="grid grid-cols-2 gap-2">
        {regions.map((reg) => (
          <div
            key={reg.region}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm">{reg.flag}</span>
              <span className="text-[10px] text-[#9499B3] font-bold truncate">
                {reg.region.split(" ")[0]}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#00FF41]">{reg.dnsMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
