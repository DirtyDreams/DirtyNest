"use client";

import { useState, useEffect } from "react";
import { Palette, Check, SlidersHorizontal, Plus } from "lucide-react";
import { getAllThemes, applyThemePreset, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";

interface ThemeMenuProps {
  onOpenCustomizer?: () => void;
}

export default function ThemeMenu({ onOpenCustomizer }: ThemeMenuProps) {
  const [open, setOpen] = useState(false);
  const [themes, setThemes] = useState<ThemePreset[]>([]);
  const [currentTheme, setCurrentTheme] = useState("matrix");

  const refreshThemes = () => {
    try {
      const all = getAllThemes();
      setThemes(all);
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("dirtynest_theme");
        if (saved) {
          setCurrentTheme(saved);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshThemes();

    const handleThemeApplied = (e: CustomEvent<ThemePreset>) => {
      if (e.detail?.id) setCurrentTheme(e.detail.id);
    };

    const handleListUpdated = () => {
      refreshThemes();
    };

    window.addEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
    window.addEventListener("dirtynest-themes-list-updated" as any, handleListUpdated);

    return () => {
      window.removeEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
      window.removeEventListener("dirtynest-themes-list-updated" as any, handleListUpdated);
    };
  }, []);

  const selectTheme = (id: string) => {
    cyberAudio.play("click");
    setCurrentTheme(id);
    applyThemePreset(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Palette Profile Customizer"
        className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation"
      >
        <Palette size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-60 cyber-card p-2 z-50 animate-fade-in shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00FF41]/30 max-h-[80vh] flex flex-col"
            style={{ background: "rgba(11, 12, 20, 0.96)" }}
          >
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/5">
              <span className="text-[10px] font-mono text-[#4F536E] uppercase font-bold">
                Cyber Colorways
              </span>
              <span className="text-[9px] font-mono text-[#00FF41]">
                {themes.length} Presets
              </span>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-64 pr-0.5 scrollbar-none font-mono">
              {themes.map((preset) => {
                const isSelected = currentTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectTheme(preset.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all text-xs group cursor-pointer"
                    style={{
                      background: isSelected ? "rgba(255, 255, 255, 0.07)" : "transparent",
                      color: isSelected ? preset.primary : "#F1F3F9",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Multi-color pip */}
                      <div className="flex gap-0.5 shrink-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: preset.primary }}
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: preset.secondary }}
                        />
                      </div>
                      <span className="truncate">{preset.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {preset.isCustom && (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-white/10 text-[#00F0FF]">
                          CUSTOM
                        </span>
                      )}
                      {isSelected && <Check size={12} style={{ color: preset.primary }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Customizer Modal Trigger */}
            {onOpenCustomizer && (
              <div className="pt-2 mt-1 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenCustomizer();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <SlidersHorizontal size={12} />
                  <span>Theme Studio & Editor</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
