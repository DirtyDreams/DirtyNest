"use client";

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgDeep: string;
  isCustom?: boolean;
}

export const DEFAULT_THEMES: ThemePreset[] = [
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
  {
    id: "crimson",
    name: "Blood Moon Protocol",
    primary: "#FF003C",
    secondary: "#9D00FF",
    accent: "#FF6B00",
    bgDeep: "#0C0407",
  },
  {
    id: "arctic",
    name: "Ghost Ice Glitch",
    primary: "#00F0FF",
    secondary: "#FFFFFF",
    accent: "#7000FF",
    bgDeep: "#040811",
  },
  {
    id: "tokyo_midnight",
    name: "Tokyo Midnight",
    primary: "#B026FF",
    secondary: "#00F0FF",
    accent: "#FF007F",
    bgDeep: "#080414",
  },
];

export const themePresets = DEFAULT_THEMES;

export function getCustomThemes(): ThemePreset[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [];
  }
  try {
    const saved = localStorage.getItem("dirtynest_custom_themes");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => ({ ...t, isCustom: true }));
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function getAllThemes(): ThemePreset[] {
  const custom = getCustomThemes();
  return [...DEFAULT_THEMES, ...custom];
}

export function saveCustomTheme(theme: Omit<ThemePreset, "isCustom" | "id"> & { id?: string; isCustom?: boolean }): ThemePreset {
  const customTheme: ThemePreset = {
    ...theme,
    id: theme.id || `custom-${Date.now()}`,
    isCustom: true,
  };

  try {
    const existing = getCustomThemes();
    const index = existing.findIndex((t) => t.id === customTheme.id);
    let updated: ThemePreset[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = customTheme;
    } else {
      updated = [...existing, customTheme];
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("dirtynest_custom_themes", JSON.stringify(updated));
    }
    dispatchThemeUpdated();
  } catch {
    // ignore
  }

  return customTheme;
}

export function deleteCustomTheme(themeId: string): boolean {
  try {
    const existing = getCustomThemes();
    const filtered = existing.filter((t) => t.id !== themeId);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("dirtynest_custom_themes", JSON.stringify(filtered));
    }
    // If the currently active theme was deleted, fallback to matrix
    if (typeof localStorage !== "undefined" && localStorage.getItem("dirtynest_theme") === themeId) {
      applyThemePreset("matrix");
    }
    dispatchThemeUpdated();
    return true;
  } catch {
    return false;
  }
}

export function applyThemePreset(presetOrId: string | ThemePreset) {
  try {
    let preset: ThemePreset | undefined;
    if (typeof presetOrId === "string") {
      const all = getAllThemes();
      preset = all.find((p) => p.id === presetOrId) || DEFAULT_THEMES[0];
    } else {
      preset = presetOrId;
    }

    if (typeof document !== "undefined" && document.documentElement && preset) {
      const root = document.documentElement;
      root.style.setProperty("--color-neon-green", preset.primary);
      root.style.setProperty("--color-neon-purple", preset.secondary);
      root.style.setProperty("--color-neon-cyan", preset.accent);
      root.style.setProperty("--bg-deep", preset.bgDeep);
    }
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && preset) {
      try {
        localStorage.setItem("dirtynest_theme", preset.id);
      } catch {
        // ignore storage errors
      }
      window.dispatchEvent(
        new CustomEvent("dirtynest-theme-applied", { detail: preset })
      );
    }
  } catch {
    // ignore
  }
}

function dispatchThemeUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dirtynest-themes-list-updated"));
  }
}
