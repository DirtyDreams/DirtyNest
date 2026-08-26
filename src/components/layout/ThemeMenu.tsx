"use client";

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { themePresets, applyThemePreset, type ThemePreset } from "@/lib/theme";

export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("matrix");

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("dirtynest_theme");
        if (saved) {
          setCurrentTheme(saved);
          applyThemePreset(saved);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const selectTheme = (id: string) => {
    setCurrentTheme(id);
    applyThemePreset(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Palette Profile Customizer"
        className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Palette size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-52 cyber-card p-2 z-50 animate-fade-in shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00FF41]/30"
            style={{ background: "rgba(11, 12, 20, 0.96)" }}
          >
          <div className="text-[10px] font-mono text-[#4F536E] uppercase px-2 py-1 mb-1">
            Cyberpunk Colorway
          </div>

          <div className="space-y-1">
            {themePresets.map((preset) => {
              const isSelected = currentTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => selectTheme(preset.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all text-xs font-mono group cursor-pointer"
                  style={{
                    background: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
                    color: isSelected ? "#00FF41" : "#F1F3F9",
                  }}
                >
                  <div className="flex items-center gap-2">
                    {/* Multi-color pip */}
                    <div className="flex gap-0.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: preset.primary }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: preset.secondary }}
                      />
                    </div>
                    <span>{preset.name}</span>
                  </div>

                  {isSelected && <Check size={12} className="text-[#00FF41]" />}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
