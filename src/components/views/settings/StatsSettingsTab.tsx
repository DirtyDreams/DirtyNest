"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function StatsSettingsTab() {
  const toast = useToast();
  const [pollInterval, setPollInterval] = useState("2.5");
  const [historyRetention, setHistoryRetention] = useState("24h");
  const [cpuThreshold, setCpuThreshold] = useState("85");
  const [ramThreshold, setRamThreshold] = useState("90");
  const [chartStyle, setChartStyle] = useState("area");

  useEffect(() => {
    try {
      const savedPoll = localStorage.getItem("dirtynest_poll_interval");
      if (savedPoll) setPollInterval(savedPoll);
      const savedRet = localStorage.getItem("dirtynest_stats_retention");
      if (savedRet) setHistoryRetention(savedRet);
      const savedCpu = localStorage.getItem("dirtynest_stats_cputhresh");
      if (savedCpu) setCpuThreshold(savedCpu);
      const savedRam = localStorage.getItem("dirtynest_stats_ramthresh");
      if (savedRam) setRamThreshold(savedRam);
      const savedStyle = localStorage.getItem("dirtynest_stats_chartstyle");
      if (savedStyle) setChartStyle(savedStyle);
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_poll_interval", pollInterval);
      localStorage.setItem("dirtynest_stats_retention", historyRetention);
      localStorage.setItem("dirtynest_stats_cputhresh", cpuThreshold);
      localStorage.setItem("dirtynest_stats_ramthresh", ramThreshold);
      localStorage.setItem("dirtynest_stats_chartstyle", chartStyle);
    } catch {}
    toast.success("Metrics & Stats Saved", "Telemetry refresh cadence and alert thresholds updated.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} />
            <span>Hardware Telemetry & Metrics Analytics Parameters</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure telemetry polling rates, time-series retention windows, alert thresholds and chart visualizers
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE STATS CONFIG</span>
        </button>
      </div>

      {/* Polling & Retention */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Polling Interval */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
              <Clock size={13} className="text-[#00FF41]" />
              <span>Background Refresh Rate</span>
            </label>
            <span className="font-bold text-xs text-[#00FF41]">{pollInterval}s</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={pollInterval}
            onChange={(e) => setPollInterval(e.target.value)}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>1.0s (High Precision)</span>
            <span>2.5s (Default)</span>
            <span>10.0s (Eco Mode)</span>
          </div>
        </div>

        {/* Retention */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <TrendingUp size={13} className="text-[#00F0FF]" />
            <span>Time-Series Metric Retention</span>
          </label>
          <select
            value={historyRetention}
            onChange={(e) => setHistoryRetention(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="1h">1 Hour (High-Density Resolution)</option>
            <option value="6h">6 Hours (Mid-Term Ops)</option>
            <option value="24h">24 Hours (Daily Aggregate)</option>
            <option value="7d">7 Days (Full Sprint Telemetry)</option>
          </select>
          <div className="text-[9px] text-[#4F536E]">Duration of in-memory trend data</div>
        </div>
      </div>

      {/* Threshold Alerts */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span>Operational Threshold Alerts (Visual Warning Trigger)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#F1F3F9]">CPU Core Saturation Warning</span>
              <span className="text-xs font-bold text-yellow-400">&gt; {cpuThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              step="2"
              value={cpuThreshold}
              onChange={(e) => setCpuThreshold(e.target.value)}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#F1F3F9]">RAM Heap Saturation Warning</span>
              <span className="text-xs font-bold text-red-400">&gt; {ramThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="98"
              step="2"
              value={ramThreshold}
              onChange={(e) => setRamThreshold(e.target.value)}
              className="w-full accent-red-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
