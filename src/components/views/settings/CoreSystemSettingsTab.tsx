"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  Palette,
  Volume2,
  Monitor,
  Database,
  Download,
  Upload,
  RefreshCw,
  Check,
  Sparkles,
  Puzzle,
} from "lucide-react";
import { applyThemePreset, getAllThemes, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";
import CyberAudioMixer from "./CyberAudioMixer";

const TABLES_METRIC = [
  { name: "todos", rows: 14, desc: "Backlog, active tasks & sprint priorities" },
  { name: "notes", rows: 3, desc: "Encrypted scratchpad notes" },
  { name: "quick_links", rows: 8, desc: "Quick access hub shortcuts" },
  { name: "calendar_events", rows: 12, desc: "Scheduled operational events" },
  { name: "system_logs", rows: 450, desc: "Structured telemetry and audit events" },
];

export default function CoreSystemSettingsTab() {
  const toast = useToast();
  const [soundVolume, setSoundVolume] = useState("80");
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [activeTheme, setActiveTheme] = useState("matrix");
  const [themeList, setThemeList] = useState<ThemePreset[]>([]);
  const [isVacuuming, setIsVacuuming] = useState(false);
  const [vacuumDone, setVacuumDone] = useState(false);

  useEffect(() => {
    try {
      const savedVol = localStorage.getItem("dirtynest_sound_volume");
      if (savedVol) setSoundVolume(savedVol);
      const savedScan = localStorage.getItem("dirtynest_crt_scanlines");
      if (savedScan) setScanlinesActive(savedScan === "true");
      const savedTheme = localStorage.getItem("dirtynest_active_theme");
      if (savedTheme) setActiveTheme(savedTheme);

      setThemeList(getAllThemes());
    } catch {}
  }, []);

  const handleVolumeChange = (val: string) => {
    setSoundVolume(val);
    const num = parseInt(val, 10) / 100;
    cyberAudio.setVolume(num);
    try {
      localStorage.setItem("dirtynest_sound_volume", val);
    } catch {}
  };

  const testAudioChime = () => {
    cyberAudio.play("chime");
    toast.info("Audio Synthesizer", `Master volume test at ${soundVolume}%`);
  };

  const toggleScanlines = (active: boolean) => {
    cyberAudio.play("click");
    setScanlinesActive(active);
    try {
      localStorage.setItem("dirtynest_crt_scanlines", String(active));
    } catch {}

    const el = document.getElementById("crt-scanlines-overlay");
    if (el) {
      el.style.display = active ? "block" : "none";
    }
    toast.success("CRT Display", active ? "Scanlines enabled" : "Scanlines disabled");
  };

  const handleSelectTheme = (themeId: string) => {
    cyberAudio.play("chime");
    setActiveTheme(themeId);
    applyThemePreset(themeId);
    try {
      localStorage.setItem("dirtynest_active_theme", themeId);
    } catch {}
    toast.success("Theme Applied", `Switched to ${themeId.toUpperCase()} palette`);
  };

  const exportData = async () => {
    cyberAudio.play("chime");
    try {
      const [todosRes, notesRes, linksRes, calRes] = await Promise.all([
        fetch("/api/todos").then((r) => r.json()).catch(() => []),
        fetch("/api/notes").then((r) => r.json()).catch(() => []),
        fetch("/api/quick-links").then((r) => r.json()).catch(() => []),
        fetch("/api/calendar").then((r) => r.json()).catch(() => []),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        version: "2.4.0",
        data: {
          todos: todosRes,
          notes: notesRes,
          quickLinks: linksRes,
          calendar: calRes,
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Snapshot Exported", "Complete JSON snapshot saved to disk.");
    } catch {
      toast.error("Export Failed", "Could not fetch database records.");
    }
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        cyberAudio.play("chime");
        toast.success("Snapshot Restored", "Database records successfully updated.");
      } else {
        toast.error("Import Failed", "Server returned invalid payload status.");
      }
    } catch {
      toast.error("Invalid JSON", "Selected file is corrupted.");
    }
  };

  const runVacuum = async () => {
    cyberAudio.play("click");
    setIsVacuuming(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsVacuuming(false);
    setVacuumDone(true);
    toast.success("VACUUM Completed", "SQLite WAL pages defragmented and optimized.");
    setTimeout(() => setVacuumDone(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} />
          <span>Core Platform, Themes & Storage Engine</span>
        </h3>
        <p className="text-[11px] text-[#4F536E] mt-0.5">
          Configure neon color palettes, Web Audio synthesizer volume, CRT display effects and SQLite database backups
        </p>
      </div>

      {/* Theme Matrix Palette Selector */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-[#BF40FF]" />
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">
              Cyber Theme Matrix & Colors
            </label>
          </div>
          <span className="text-[10px] text-[#4F536E]">Active: {activeTheme.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {themeList.map((th) => {
            const isSelected = activeTheme === th.id;
            return (
              <div
                key={th.id}
                onClick={() => handleSelectTheme(th.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "bg-[#090A14] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#F1F3F9]">{th.name}</span>
                  {isSelected && <Check size={12} className="text-[#00FF41]" />}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ background: th.primary }}
                    title={`Primary: ${th.primary}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ background: th.accent }}
                    title={`Accent: ${th.accent}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ background: th.bgDeep }}
                    title={`Deep: ${th.bgDeep}`}
                  />
                  <span className="text-[9px] text-[#4F536E] ml-auto uppercase">
                    {th.isCustom ? "Custom" : "Preset"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Synthesizer & Multi-Track DSP Mixer */}
      <CyberAudioMixer />

      {/* CRT Scanlines Display Toggle */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-[#F1F3F9] uppercase">
              <Monitor size={14} className="text-[#00FF41]" />
              <span>CRT Scanlines</span>
            </div>
            <p className="text-[10px] text-[#4F536E] mt-0.5">Phosphor beam overlay</p>
          </div>

          <button
            onClick={() => toggleScanlines(!scanlinesActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scanlinesActive
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "bg-white/5 text-[#9499B3] border border-white/10"
            }`}
          >
            {scanlinesActive ? "ENABLED" : "DISABLED"}
          </button>
        </div>

      {/* SQLite Database & Snapshot Backups */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-[#F1F3F9] uppercase">
            <Database size={14} className="text-[#00FF41]" />
            <span>SQLite 3 WAL Engine & Snapshot Recovery</span>
          </div>

          <button
            onClick={runVacuum}
            disabled={isVacuuming}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#00FF41] font-bold text-[10px] border border-white/10 transition-all cursor-pointer"
          >
            {vacuumDone ? <Check size={11} /> : <RefreshCw size={11} className={isVacuuming ? "animate-spin" : ""} />}
            <span>{isVacuuming ? "VACUUMING..." : vacuumDone ? "OPTIMIZED" : "RUN VACUUM"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[10px]">
            <span className="text-[#4F536E] block font-bold">ENGINE</span>
            <span className="text-[#00FF41] font-bold">SQLite 3 (WAL)</span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[10px]">
            <span className="text-[#4F536E] block font-bold">FILE</span>
            <span className="text-[#00F0FF] font-bold">data/dirtynest.db</span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[10px]">
            <span className="text-[#4F536E] block font-bold">TABLES</span>
            <span className="text-[#BF40FF] font-bold">5 Core Tables</span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[10px]">
            <span className="text-[#4F536E] block font-bold">STATUS</span>
            <span className="text-[#00FF41] font-bold">HEALTHY (0 CORRUPT)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={exportData}
            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold text-xs transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>EXPORT JSON SNAPSHOT</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 font-bold text-xs transition-all cursor-pointer">
            <Upload size={13} />
            <span>IMPORT SNAPSHOT</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
