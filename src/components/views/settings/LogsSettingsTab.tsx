"use client";

import { useState, useEffect } from "react";
import {
  ScrollText,
  Sparkles,
  Sliders,
  Filter,
  HardDrive,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function LogsSettingsTab() {
  const toast = useToast();
  const [defaultLogLevel, setDefaultLogLevel] = useState("ALL");
  const [bufferCapacity, setBufferCapacity] = useState("1000");
  const [persistToDisk, setPersistToDisk] = useState(true);
  const [exportFormat, setExportFormat] = useState("json");

  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem("dirtynest_logs_level");
      if (savedLevel) setDefaultLogLevel(savedLevel);
      const savedCap = localStorage.getItem("dirtynest_logs_capacity");
      if (savedCap) setBufferCapacity(savedCap);
      const savedPersist = localStorage.getItem("dirtynest_logs_persist");
      if (savedPersist) setPersistToDisk(savedPersist !== "false");
      const savedFmt = localStorage.getItem("dirtynest_logs_format");
      if (savedFmt) setExportFormat(savedFmt);
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_logs_level", defaultLogLevel);
      localStorage.setItem("dirtynest_logs_capacity", bufferCapacity);
      localStorage.setItem("dirtynest_logs_persist", String(persistToDisk));
      localStorage.setItem("dirtynest_logs_format", exportFormat);
    } catch {}
    toast.success("Logs Engine Saved", "System logging and retention preferences updated.");
  };

  const handleClearBuffer = () => {
    cyberAudio.play("alarm");
    toast.info("Buffer Cleared", "In-memory circular event buffer flushed.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <ScrollText size={16} />
            <span>System Logs & Telemetry Audit Parameters</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure log level filters, circular ring-memory buffers, disk write sinks and export formats
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE LOGS CONFIG</span>
        </button>
      </div>

      {/* Filter and Buffer Size */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Log Level */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Filter size={13} className="text-[#00FF41]" />
            <span>Default Severity Level</span>
          </label>
          <select
            value={defaultLogLevel}
            onChange={(e) => setDefaultLogLevel(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="ALL">ALL (Debug + Info + Warn + Error)</option>
            <option value="INFO">INFO & Higher (Standard)</option>
            <option value="WARN">WARN & Higher (Anomalies Only)</option>
            <option value="ERROR">ERROR Only (Failures)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Default view filter on boot</span>
        </div>

        {/* Buffer Capacity */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Sliders size={13} className="text-[#00F0FF]" />
            <span>Ring Buffer Event Limit</span>
          </label>
          <select
            value={bufferCapacity}
            onChange={(e) => setBufferCapacity(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="500">500 Events (Low Memory)</option>
            <option value="1000">1,000 Events (Recommended)</option>
            <option value="5000">5,000 Events (Deep Forensic)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Max entries kept in browser RAM</span>
        </div>

        {/* Export Format */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Download size={13} className="text-[#BF40FF]" />
            <span>Default Log Export Format</span>
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="json">Structured JSON (.json)</option>
            <option value="ndjson">Newline-Delimited JSON (.ndjson)</option>
            <option value="csv">Standard CSV Table (.csv)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Used when downloading log dumps</span>
        </div>
      </div>

      {/* Disk Persistence & Buffer Flush */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs text-[#F1F3F9] uppercase">
            <HardDrive size={14} className="text-[#00FF41]" />
            <span>Filesystem Disk Persistence (data/dirtynest.log)</span>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Continuously append all structured events to persistent storage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setPersistToDisk(!persistToDisk);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              persistToDisk
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "bg-white/5 text-[#9499B3] border border-white/10"
            }`}
          >
            {persistToDisk ? "ENABLED" : "DISABLED"}
          </button>

          <button
            onClick={handleClearBuffer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 size={13} />
            <span>FLUSH BUFFER</span>
          </button>
        </div>
      </div>
    </div>
  );
}
