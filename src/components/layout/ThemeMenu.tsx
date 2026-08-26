"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, SlidersHorizontal } from "lucide-react";
import { getAllThemes, applyThemePreset, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";

interface ThemeMenuProps {
  onOpenCustomizer?: () => void;
}

export default function ThemeMenu({ onOpenCustomizer }: ThemeMenuProps) {
  const [open, setOpen] = useState(false);
  const [themes, setThemes] = useState<ThemePreset[]>([]);
  const [currentTheme, setCurrentTheme] = useState("matrix");
  const menuRef = useRef<HTMLDivElement>(null);

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

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
    window.addEventListener("dirtynest-themes-list-updated" as any, handleListUpdated);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
      window.removeEventListener("dirtynest-themes-list-updated" as any, handleListUpdated);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectTheme = (id: string) => {
    cyberAudio.play("click");
    setCurrentTheme(id);
    applyThemePreset(id);
    setOpen(false);
  };

  return (
    <div className="relative shrink-0 flex items-center h-9" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Palette Profile Customizer"
        className={`h-9 w-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          open
            ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.25)]"
            : "bg-white/[0.03] border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41]"
        }`}
      >
        <Palette size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 p-3 z-50 animate-fade-in rounded-2xl flex flex-col font-mono border border-[#00FF41]/40"
          style={{
            background: "rgba(10, 11, 20, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 255, 65, 0.15)",
          }}
        >
          {/* Header - Fixed & Always Visible */}
          <div className="flex items-center justify-between px-1.5 pb-2 mb-2 border-b border-white/10 shrink-0">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
              Cyber Colorways
            </span>
            <span className="text-[9px] text-[#00FF41] font-bold px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
              {themes.length} Presets
            </span>
          </div>

          {/* Preset list */}
          <div className="space-y-1 overflow-y-auto max-h-60 pr-0.5 scrollbar-none flex-1">
            {themes.map((preset) => {
              const isSelected = currentTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectTheme(preset.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all text-xs group cursor-pointer border border-transparent hover:border-white/10"
                  style={{
                    background: isSelected ? "rgba(255, 255, 255, 0.06)" : "transparent",
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
                    <span className="truncate text-[11px] font-bold">{preset.name}</span>
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
            <div className="pt-2 mt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenCustomizer();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 text-xs font-bold transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,65,0.15)]"
              >
                <SlidersHorizontal size={12} />
                <span>Theme Studio & Editor</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
