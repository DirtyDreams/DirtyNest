"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  Volume2,
  Palette,
  Monitor,
  Activity,
  Check,
} from "lucide-react";
import { applyThemePreset, getAllThemes, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function GeneralSettingsTab() {
  const toast = useToast();
  const [pollInterval, setPollInterval] = useState("2.5");
  const [soundVolume, setSoundVolume] = useState("80");
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [activeTheme, setActiveTheme] = useState("matrix");
  const [themeList, setThemeList] = useState<ThemePreset[]>([]);

  useEffect(() => {
    try {
      const savedPoll = localStorage.getItem("dirtynest_poll_interval");
      if (savedPoll) setPollInterval(savedPoll);
      const savedVol = localStorage.getItem("dirtynest_sound_volume");
      if (savedVol) setSoundVolume(savedVol);
      const savedScan = localStorage.getItem("dirtynest_crt_scanlines");
      if (savedScan) setScanlinesActive(savedScan === "true");
      const savedTheme = localStorage.getItem("dirtynest_active_theme");
      if (savedTheme) setActiveTheme(savedTheme);

      setThemeList(getAllThemes());
    } catch {
      // ignore
    }
  }, []);

  const handlePollChange = (val: string) => {
    setPollInterval(val);
    try {
      localStorage.setItem("dirtynest_poll_interval", val);
    } catch {}
  };

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

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} />
          <span>General System & UI Parameters</span>
        </h3>
        <p className="text-[11px] text-[#4F536E] mt-0.5">
          Configure telemetry polling rate, audio synthesizer volume, themes and display effects
        </p>
      </div>

      {/* Telemetry Polling Rate */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#00FF41]" />
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">
              Background Telemetry Refresh Rate
            </label>
          </div>
          <span className="text-xs font-bold text-[#00FF41] font-mono">{pollInterval}s</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={pollInterval}
          onChange={(e) => handlePollChange(e.target.value)}
          className="w-full accent-[#00FF41] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#4F536E]">
          <span>1.0s (High Precision)</span>
          <span>5.0s (Balanced)</span>
          <span>10.0s (Low Power)</span>
        </div>
      </div>

      {/* Audio Synthesizer Volume */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-[#00F0FF]" />
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">
              Cyber Web Audio Volume
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#00F0FF] font-mono">{soundVolume}%</span>
            <button
              onClick={testAudioChime}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-[#00F0FF] border border-white/10 cursor-pointer"
            >
              TEST SOUND
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={soundVolume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          className="w-full accent-[#00F0FF] cursor-pointer"
        />
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

      {/* CRT Scanlines Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-[#00FF41]" />
            <div className="text-xs font-bold text-[#F1F3F9] uppercase">
              CRT Phosphor Raster Scanlines
            </div>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Overlay retro CRT beam lines across the HUD viewport
          </p>
        </div>
        <button
          onClick={() => toggleScanlines(!scanlinesActive)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            scanlinesActive
              ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
              : "bg-white/5 text-[#9499B3] border border-white/10"
          }`}
        >
          {scanlinesActive ? "ENABLED" : "DISABLED"}
        </button>
      </div>
    </div>
  );
}
