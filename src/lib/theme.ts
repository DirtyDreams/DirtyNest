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
        return parsed
          .filter((t) => t && typeof t === "object")
          .map((t) => ({
            id: String(t.id || `custom-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, ""),
            name: String(t.name || "Custom Theme").slice(0, 32),
            primary: sanitizeColor(t.primary, "#00FF41"),
            secondary: sanitizeColor(t.secondary, "#BF40FF"),
            accent: sanitizeColor(t.accent, "#00F0FF"),
            bgDeep: sanitizeColor(t.bgDeep, "#07070B"),
            isCustom: true,
          }));
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
  const cleanId = (theme.id || `custom-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "");
  const customTheme: ThemePreset = {
    id: cleanId,
    name: String(theme.name || "Custom Theme").slice(0, 32),
    primary: sanitizeColor(theme.primary, "#00FF41"),
    secondary: sanitizeColor(theme.secondary, "#BF40FF"),
    accent: sanitizeColor(theme.accent, "#00F0FF"),
    bgDeep: sanitizeColor(theme.bgDeep, "#07070B"),
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

const HEX_REGEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isValidHex(color: string): boolean {
  return typeof color === "string" && HEX_REGEX.test(color.trim());
}

export function sanitizeColor(color: string, fallback: string): string {
  if (isValidHex(color)) {
    return color.trim();
  }
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = sanitizeColor(hex, "#00FF41").replace("#", "").trim();
  if (c.length === 3 || c.length === 4) {
    c = c.slice(0, 3).split("").map((x) => x + x).join("");
  }
  const n = parseInt(c.slice(0, 6), 16) || 0;
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function generateThemeCss(preset: ThemePreset): string {
  const safePrimary = sanitizeColor(preset.primary, "#00FF41");
  const safeSecondary = sanitizeColor(preset.secondary, "#BF40FF");
  const safeAccent = sanitizeColor(preset.accent, "#00F0FF");
  const safeBg = sanitizeColor(preset.bgDeep, "#07070B");

  const p = hexToRgb(safePrimary);
  const s = hexToRgb(safeSecondary);
  const a = hexToRgb(safeAccent);
  const bg = hexToRgb(safeBg);

  return `
    :root {
      --color-neon-green: ${safePrimary};
      --color-neon-purple: ${safeSecondary};
      --color-neon-cyan: ${safeAccent};
      --bg-deep: ${safeBg};
      --color-primary: ${safePrimary};
      --color-secondary: ${safeSecondary};
      --color-accent: ${safeAccent};
      --color-primary: ${preset.primary};
      --color-secondary: ${preset.secondary};
      --color-accent: ${preset.accent};
      --color-primary-rgb: ${p.r}, ${p.g}, ${p.b};
      --color-secondary-rgb: ${s.r}, ${s.g}, ${s.b};
      --color-accent-rgb: ${a.r}, ${a.g}, ${a.b};
      --color-bg-deep-rgb: ${bg.r}, ${bg.g}, ${bg.b};
    }

    body {
      background-color: ${preset.bgDeep} !important;
      background-image: 
        radial-gradient(circle at 12% 18%, rgba(${p.r}, ${p.g}, ${p.b}, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 88% 50%, rgba(${s.r}, ${s.g}, ${s.b}, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 50% 92%, rgba(${a.r}, ${a.g}, ${a.b}, 0.06) 0%, transparent 50%),
        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px) !important;
    }

    /* Primary text and hover */
    [class*="text-[#00FF41]"], [class*="text-[#00ff41]"], .text-neon-green {
      color: ${preset.primary} !important;
    }
    [class*="hover:text-[#00FF41]"]:hover, [class*="hover:text-[#00ff41]"]:hover {
      color: ${preset.primary} !important;
    }
    [class*="group-hover:text-[#00FF41]"]:is(:hover, :focus, .group:hover *), [class*="group-hover:text-[#00ff41]"]:is(:hover, :focus, .group:hover *) {
      color: ${preset.primary} !important;
    }

    /* Primary borders */
    [class*="border-[#00FF41]"], [class*="border-[#00ff41]"], .border-neon-green {
      border-color: ${preset.primary} !important;
    }
    [class*="border-[#00FF41]/10"], [class*="border-[#00ff41]/10"] { border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.1) !important; }
    [class*="border-[#00FF41]/20"], [class*="border-[#00ff41]/20"] { border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.2) !important; }
    [class*="border-[#00FF41]/30"], [class*="border-[#00ff41]/30"] { border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.3) !important; }
    [class*="border-[#00FF41]/40"], [class*="border-[#00ff41]/40"] { border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.4) !important; }
    [class*="border-[#00FF41]/50"], [class*="border-[#00ff41]/50"] { border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.5) !important; }
    [class*="hover:border-[#00FF41]/40"]:hover, [class*="hover:border-[#00ff41]/40"]:hover {
      border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.5) !important;
    }

    /* Primary backgrounds */
    [class*="bg-[#00FF41]"], [class*="bg-[#00ff41]"], .bg-neon-green {
      background-color: ${preset.primary} !important;
    }
    [class*="bg-[#00FF41]/5"], [class*="bg-[#00ff41]/5"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.05) !important; }
    [class*="bg-[#00FF41]/10"], [class*="bg-[#00ff41]/10"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.1) !important; }
    [class*="bg-[#00FF41]/15"], [class*="bg-[#00ff41]/15"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.15) !important; }
    [class*="bg-[#00FF41]/20"], [class*="bg-[#00ff41]/20"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.2) !important; }
    [class*="bg-[#00FF41]/25"], [class*="bg-[#00ff41]/25"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.25) !important; }
    [class*="bg-[#00FF41]/30"], [class*="bg-[#00ff41]/30"] { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.3) !important; }
    [class*="hover:bg-[#00FF41]/10"]:hover { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.1) !important; }
    [class*="hover:bg-[#00FF41]/20"]:hover { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.2) !important; }
    [class*="hover:bg-[#00FF41]/25"]:hover { background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.25) !important; }

    /* Primary glow shadows */
    [class*="shadow-[0_0_10px_rgba(0,255,65"], [class*="shadow-[0_0_15px_rgba(0,255,65"], [class*="shadow-[0_0_12px_rgba(0,255,65"] {
      box-shadow: 0 0 14px rgba(${p.r}, ${p.g}, ${p.b}, 0.35) !important;
    }
    .neon-glow-green {
      text-shadow: 0 0 10px rgba(${p.r}, ${p.g}, ${p.b}, 0.6), 0 0 20px rgba(${p.r}, ${p.g}, ${p.b}, 0.3) !important;
    }

    /* Secondary (#BF40FF) text, background, border, glow */
    [class*="text-[#BF40FF]"], [class*="text-[#bf40ff]"], .text-neon-purple {
      color: ${preset.secondary} !important;
    }
    [class*="hover:text-[#BF40FF]"]:hover, [class*="hover:text-[#bf40ff]"]:hover {
      color: ${preset.secondary} !important;
    }
    [class*="border-[#BF40FF]"], [class*="border-[#bf40ff]"], .border-neon-purple {
      border-color: ${preset.secondary} !important;
    }
    [class*="border-[#BF40FF]/30"] { border-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.3) !important; }
    [class*="border-[#BF40FF]/40"] { border-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.4) !important; }
    [class*="bg-[#BF40FF]"], [class*="bg-[#bf40ff]"], .bg-neon-purple {
      background-color: ${preset.secondary} !important;
    }
    [class*="bg-[#BF40FF]/10"] { background-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.1) !important; }
    [class*="bg-[#BF40FF]/15"] { background-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.15) !important; }
    [class*="bg-[#BF40FF]/20"] { background-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.2) !important; }
    [class*="bg-[#BF40FF]/25"] { background-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.25) !important; }
    [class*="hover:bg-[#BF40FF]/20"]:hover { background-color: rgba(${s.r}, ${s.g}, ${s.b}, 0.2) !important; }
    [class*="shadow-[0_0_10px_rgba(191,64,255"] {
      box-shadow: 0 0 14px rgba(${s.r}, ${s.g}, ${s.b}, 0.35) !important;
    }
    .neon-glow-purple {
      text-shadow: 0 0 10px rgba(${s.r}, ${s.g}, ${s.b}, 0.6), 0 0 20px rgba(${s.r}, ${s.g}, ${s.b}, 0.3) !important;
    }

    /* Accent (#00F0FF) text, background, border, glow */
    [class*="text-[#00F0FF]"], [class*="text-[#00f0ff]"], [class*="text-[#00E5FF]"], .text-neon-cyan {
      color: ${preset.accent} !important;
    }
    [class*="hover:text-[#00F0FF]"]:hover, [class*="hover:text-[#00f0ff]"]:hover {
      color: ${preset.accent} !important;
    }
    [class*="border-[#00F0FF]"], [class*="border-[#00f0ff]"], .border-neon-cyan {
      border-color: ${preset.accent} !important;
    }
    [class*="border-[#00F0FF]/30"] { border-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.3) !important; }
    [class*="border-[#00F0FF]/40"] { border-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.4) !important; }
    [class*="bg-[#00F0FF]"], [class*="bg-[#00f0ff]"], .bg-neon-cyan {
      background-color: ${preset.accent} !important;
    }
    [class*="bg-[#00F0FF]/10"] { background-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.1) !important; }
    [class*="bg-[#00F0FF]/15"] { background-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.15) !important; }
    [class*="bg-[#00F0FF]/20"] { background-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.2) !important; }
    [class*="bg-[#00F0FF]/25"] { background-color: rgba(${a.r}, ${a.g}, ${a.b}, 0.25) !important; }
    [class*="shadow-[0_0_8px_rgba(0,240,255"] {
      box-shadow: 0 0 12px rgba(${a.r}, ${a.g}, ${a.b}, 0.3) !important;
    }
    .neon-glow-cyan {
      text-shadow: 0 0 10px rgba(${a.r}, ${a.g}, ${a.b}, 0.6), 0 0 20px rgba(${a.r}, ${a.g}, ${a.b}, 0.3) !important;
    }

    /* Backgrounds & Cards */
    [class*="bg-[#07070B]"], [class*="bg-[#07070b]"], [class*="bg-[#0A080E]"] {
      background-color: ${preset.bgDeep} !important;
    }
    [class*="bg-[#07070B]/90"], [class*="bg-[#07070b]/90"] {
      background-color: rgba(${bg.r}, ${bg.g}, ${bg.b}, 0.9) !important;
    }
    [class*="bg-[#07070B]/95"], [class*="bg-[#07070b]/95"] {
      background-color: rgba(${bg.r}, ${bg.g}, ${bg.b}, 0.95) !important;
    }

    /* Cyber Card Hover */
    .cyber-card:hover {
      border-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.4) !important;
      box-shadow: 
        0 20px 48px -12px rgba(0, 0, 0, 0.85),
        0 0 24px rgba(${p.r}, ${p.g}, ${p.b}, 0.15),
        0 0 0 1px rgba(${p.r}, ${p.g}, ${p.b}, 0.2) inset !important;
    }
    .cyber-card:hover::before {
      background: linear-gradient(90deg, transparent 0%, ${preset.primary} 50%, transparent 100%) !important;
    }
    .hud-corner {
      border-color: ${preset.primary} !important;
    }

    /* Selection Colors */
    ::selection, [class*="selection:bg-[#00FF41]/20"]::selection {
      background-color: rgba(${p.r}, ${p.g}, ${p.b}, 0.25) !important;
      color: ${preset.primary} !important;
    }

    /* Scrollbars */
    ::-webkit-scrollbar-thumb {
      background: rgba(${p.r}, ${p.g}, ${p.b}, 0.3) !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${preset.primary} !important;
      box-shadow: 0 0 10px ${preset.primary} !important;
    }
  `;
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

    if (preset) {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.style.setProperty("--color-neon-green", preset.primary);
        root.style.setProperty("--color-neon-purple", preset.secondary);
        root.style.setProperty("--color-neon-cyan", preset.accent);
        root.style.setProperty("--bg-deep", preset.bgDeep);

        let styleTag = document.getElementById("dirtynest-dynamic-theme") as HTMLStyleElement | null;
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "dirtynest-dynamic-theme";
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = generateThemeCss(preset);
      }

      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("dirtynest_theme", preset.id);
        } catch {
          // ignore storage errors
        }
        window.dispatchEvent(
          new CustomEvent("dirtynest-theme-applied", { detail: preset })
        );
      }
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

