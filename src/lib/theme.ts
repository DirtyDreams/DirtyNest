"use client";

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgDeep: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: "matrix",
    name: "Matrix Core",
    primary: "#00FF41",
    secondary: "#BF40FF",
    accent: "#00F0FF",
    bgDeep: "#07070B",
  },
  {
    id: "cyber2077",
    name: "Night City 2077",
    primary: "#FFE600",
    secondary: "#FF0055",
    accent: "#00F0FF",
    bgDeep: "#0A080E",
  },
  {
    id: "synthwave",
    name: "Synthwave Outrun",
    primary: "#FF1493",
    secondary: "#9D00FF",
    accent: "#00F0FF",
    bgDeep: "#090614",
  },
  {
    id: "amber",
    name: "Amber Phosphor",
    primary: "#FFB000",
    secondary: "#FF5500",
    accent: "#00FF88",
    bgDeep: "#0A0804",
  },
];

export function applyThemePreset(presetId: string) {
  try {
    const preset = themePresets.find((p) => p.id === presetId) || themePresets[0];
    if (typeof document !== "undefined" && document.documentElement) {
      const root = document.documentElement;
      root.style.setProperty("--color-neon-green", preset.primary);
      root.style.setProperty("--color-neon-purple", preset.secondary);
      root.style.setProperty("--color-neon-cyan", preset.accent);
      root.style.setProperty("--bg-deep", preset.bgDeep);
    }
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("dirtynest_theme", presetId);
      } catch {
        // ignore storage errors
      }
    }
  } catch {
    // ignore
  }
}
