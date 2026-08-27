"use client";

import { useState, useEffect } from "react";
import { Palette, Check, SlidersHorizontal } from "lucide-react";
import { getAllThemes, applyThemePreset, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={() => cyberAudio.play("click")}
          title="Palette Profile Customizer"
          className={`h-9 w-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            open
              ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.25)]"
              : "bg-white/[0.03] border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41]"
          }`}
        >
          <Palette size={15} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 font-mono bg-[#090A14] border-white/10 shadow-2xl backdrop-blur-2xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between pb-1 text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
          <span>Cyber Colorways</span>
          <Badge variant="outline" className="text-[9px] bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30">
            {themes.length} Presets
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <div className="space-y-0.5 max-h-60 overflow-y-auto pr-0.5">
          {themes.map((preset) => {
            const isSelected = currentTheme === preset.id;
            return (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => selectTheme(preset.id)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer focus:bg-white/10"
                style={{
                  color: isSelected ? preset.primary : "#F1F3F9",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Multi-color pip */}
                  <div className="flex gap-0.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.primary }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.secondary }} />
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
              </DropdownMenuItem>
            );
          })}
        </div>

        {onOpenCustomizer && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  onOpenCustomizer();
                }}
                className="w-full bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30 font-bold text-xs h-8 shadow-[0_0_8px_rgba(0,255,65,0.15)]"
              >
                <SlidersHorizontal size={12} className="mr-1.5" />
                <span>Theme Studio & Editor</span>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
