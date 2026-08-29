"use client";

import { useState, useEffect, useMemo } from "react";
import { Cpu } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface CoreStats {
  id: number;
  utilization: number; // 0 - 100%
  tempC: number;       // 35 - 85 C
  clockGhz: number;    // 2.4 - 5.4 GHz
  voltageV: number;    // 0.95 - 1.35 V
}

export default function CpuCoreHeatmap() {
  const [cores, setCores] = useState<CoreStats[]>([]);
  const [selectedCoreId, setSelectedCoreId] = useState<number | null>(0);
  const [governor, setGovernor] = useState<"performance" | "powersave" | "schedutil">("performance");

  // Initialize 16 physical cores (32 logical threads)
  useEffect(() => {
    const initial: CoreStats[] = Array.from({ length: 16 }, (_, idx) => {
      const isEfficiencyCore = idx >= 8;
      const baseUtil = isEfficiencyCore ? 20 + Math.random() * 30 : 45 + Math.random() * 40;
      return {
        id: idx,
        utilization: Math.round(baseUtil),
        tempC: Math.round(42 + (baseUtil / 100) * 35),
        clockGhz: parseFloat((isEfficiencyCore ? 2.8 + (baseUtil / 100) * 1.1 : 4.2 + (baseUtil / 100) * 1.3).toFixed(2)),
        voltageV: parseFloat((1.05 + (baseUtil / 100) * 0.25).toFixed(2)),
      };
    });
    setCores(initial);
  }, []);

  // Real-time thermal & load fluctuation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCores((prev) =>
        prev.map((core) => {
          const delta = (Math.random() * 14 - 7);
          const newUtil = Math.min(100, Math.max(8, Math.round(core.utilization + delta)));
          const newTemp = Math.round(38 + (newUtil / 100) * 38);
          const isECore = core.id >= 8;
          const newClock = parseFloat(
            (isECore ? 2.8 + (newUtil / 100) * 1.1 : 4.2 + (newUtil / 100) * 1.3).toFixed(2)
          );
          return {
            ...core,
            utilization: newUtil,
            tempC: newTemp,
            clockGhz: newClock,
            voltageV: parseFloat((1.05 + (newUtil / 100) * 0.25).toFixed(2)),
          };
        })
      );
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const selectedCore = useMemo(() => {
    return cores.find((c) => c.id === selectedCoreId) || cores[0];
  }, [cores, selectedCoreId]);

  const avgTemp = useMemo(() => {
    if (!cores.length) return 0;
    return Math.round(cores.reduce((acc, c) => acc + c.tempC, 0) / cores.length);
  }, [cores]);

  const avgUtil = useMemo(() => {
    if (!cores.length) return 0;
    return Math.round(cores.reduce((acc, c) => acc + c.utilization, 0) / cores.length);
  }, [cores]);

  const getHeatmapColor = (util: number) => {
    if (util < 35) return { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", glow: "rgba(0,255,65,0.2)" };
    if (util < 65) return { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-400", glow: "rgba(0,240,255,0.2)" };
    if (util < 85) return { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", glow: "rgba(255,184,0,0.2)" };
    return { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400", glow: "rgba(255,42,109,0.3)" };
  };

  return (
    <div className="cyber-card p-5 flex flex-col gap-4 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              PER-CORE THERMAL & FREQUENCY MATRIX // <span className="text-cyan-400">16-CORE HYBRID DIE</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Intel Core i9 / AMD Ryzen 9 microarchitectural thermal telemetry & scaling governor
            </span>
          </div>
        </div>

        {/* Governors */}
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
          <span className="text-slate-500 px-1.5 select-none">GOVERNOR:</span>
          {(["performance", "powersave", "schedutil"] as const).map((gov) => (
            <button
              key={gov}
              onClick={() => {
                cyberAudio.play("click");
                setGovernor(gov);
              }}
              className={`px-2 py-0.5 rounded-lg uppercase transition-colors cursor-pointer ${
                governor === gov
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {gov}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 16 Core Heatmap (8 cols) + Core Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Heatmap Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CORE TOPOLOGY (P0–P7 PERFORMANCE · E8–E15 EFFICIENCY)</span>
            <span>
              AVG DIE TEMP: <strong className="text-amber-400">{avgTemp}°C</strong> · AVG LOAD:{" "}
              <strong className="text-cyan-400">{avgUtil}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {cores.map((core) => {
              const theme = getHeatmapColor(core.utilization);
              const isSelected = selectedCoreId === core.id;
              const isECore = core.id >= 8;

              return (
                <div
                  key={core.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCoreId(core.id);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    theme.bg
                  } ${theme.border} ${
                    isSelected ? "ring-2 ring-white shadow-lg" : "hover:brightness-125"
                  }`}
                  style={{ minHeight: "84px" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white">
                      {isECore ? `E${core.id}` : `P${core.id}`}
                    </span>
                    <span className={`text-[9px] font-bold ${theme.text}`}>
                      {core.tempC}°C
                    </span>
                  </div>

                  <div className="my-1">
                    <div className="text-base font-black leading-none text-white">
                      {core.utilization}%
                    </div>
                  </div>

                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${core.utilization}%`,
                        backgroundColor:
                          core.utilization > 80
                            ? "#FF2A6D"
                            : core.utilization > 60
                            ? "#FFB800"
                            : "#00F0FF",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Core Telemetry Detail (4 cols) */}
        {selectedCore && (
          <div className="lg:col-span-4 bg-black/50 p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white">
                CORE #{selectedCore.id} TELEMETRY (
                {selectedCore.id >= 8 ? "Efficiency / Gracemont" : "Performance / Raptor Cove"})
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">ONLINE</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                <span className="text-slate-400">Clock Frequency</span>
                <span className="font-bold text-cyan-300">{selectedCore.clockGhz} GHz</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                <span className="text-slate-400">Core Junction Temp</span>
                <span className="font-bold text-amber-400">{selectedCore.tempC} °C</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                <span className="text-slate-400">VCore Voltage</span>
                <span className="font-bold text-emerald-400">{selectedCore.voltageV} V</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                <span className="text-slate-400">Instruction Cache</span>
                <span className="font-bold text-purple-400">
                  {selectedCore.id >= 8 ? "64 KB L1 + 4MB L2" : "80 KB L1 + 2MB L2"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
