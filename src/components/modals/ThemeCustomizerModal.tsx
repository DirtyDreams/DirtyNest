"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Palette,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Sliders,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Layers,
  X,
} from "lucide-react";
import {
  ThemePreset,
  DEFAULT_THEMES,
  getAllThemes,
  saveCustomTheme,
  deleteCustomTheme,
  applyThemePreset,
} from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = "all" | "editor" | "json";

const QUICK_COLORS = [
  "#00FF41", // Matrix Green
  "#00F0FF", // Electric Cyan
  "#BF40FF", // Cyber Purple
  "#FF0055", // Neon Magenta
  "#FF1493", // Deep Pink
  "#FF003C", // Crimson Red
  "#FFB000", // Amber Gold
  "#FFE600", // Laser Yellow
  "#7000FF", // Deep Violet
  "#00FF88", // Mint
  "#FFFFFF", // Pure White
  "#07070B", // Deep Abyss
  "#0A080E", // Cyber Dark
  "#040811", // Arctic Dark
  "#0C0407", // Crimson Dark
];

export default function ThemeCustomizerModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<ModalTab>("all");
  const [themes, setThemes] = useState<ThemePreset[]>(DEFAULT_THEMES);
  const [currentThemeId, setCurrentThemeId] = useState("matrix");
  
  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00FF41");
  const [secondaryColor, setSecondaryColor] = useState("#BF40FF");
  const [accentColor, setAccentColor] = useState("#00F0FF");
  const [bgDeepColor, setBgDeepColor] = useState("#07070B");

  // JSON Import / Export
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const refreshThemes = () => {
    try {
      const all = getAllThemes();
      setThemes(all);
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("dirtynest_theme");
        if (saved) setCurrentThemeId(saved);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshThemes();

    const handleThemeApplied = (e: CustomEvent<ThemePreset>) => {
      if (e.detail?.id) setCurrentThemeId(e.detail.id);
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: ThemePreset) => {
    cyberAudio.play("click");
    setCurrentThemeId(theme.id);
    applyThemePreset(theme);
  };

  const handleStartCreate = () => {
    cyberAudio.play("click");
    setEditingId(null);
    setThemeName("Custom Cyber Glow");
    setPrimaryColor("#00FF41");
    setSecondaryColor("#BF40FF");
    setAccentColor("#00F0FF");
    setBgDeepColor("#07070B");
    setActiveTab("editor");
  };

  const handleStartEdit = (theme: ThemePreset) => {
    cyberAudio.play("click");
    setEditingId(theme.id);
    setThemeName(theme.name);
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setAccentColor(theme.accent);
    setBgDeepColor(theme.bgDeep);
    setActiveTab("editor");
  };

  const handleDuplicate = (theme: ThemePreset) => {
    cyberAudio.play("click");
    setEditingId(null);
    setThemeName(`${theme.name} (Clone)`);
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setAccentColor(theme.accent);
    setBgDeepColor(theme.bgDeep);
    setActiveTab("editor");
  };

  const handleSaveTheme = () => {
    cyberAudio.play("chime");
    const newTheme = saveCustomTheme({
      id: editingId || `custom-${Date.now()}`,
      name: themeName.trim() || "Untitled Cyber Theme",
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      bgDeep: bgDeepColor,
    });
    applyThemePreset(newTheme);
    refreshThemes();
    setActiveTab("all");
  };

  const handleDeleteTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberAudio.play("click");
    if (confirm("Are you sure you want to delete this custom theme?")) {
      deleteCustomTheme(id);
      refreshThemes();
    }
  };

  const handleExportJson = () => {
    cyberAudio.play("click");
    const current = themes.find((t) => t.id === currentThemeId) || themes[0];
    const exportPayload = {
      app: "DirtyNest",
      type: "theme-preset",
      version: "0.01",
      theme: current,
    };
    setJsonText(JSON.stringify(exportPayload, null, 2));
    setActiveTab("json");
  };

  const handleImportJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonText);
      const importedTheme = parsed.theme || parsed;
      if (!importedTheme.name || !importedTheme.primary) {
        throw new Error("Invalid theme payload: missing name or primary color.");
      }
      const saved = saveCustomTheme({
        name: importedTheme.name,
        primary: importedTheme.primary,
        secondary: importedTheme.secondary || "#BF40FF",
        accent: importedTheme.accent || "#00F0FF",
        bgDeep: importedTheme.bgDeep || "#07070B",
      });
      applyThemePreset(saved);
      refreshThemes();
      setActiveTab("all");
      cyberAudio.play("chime");
    } catch (err: any) {
      setJsonError(err.message || "Failed to parse JSON.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col cyber-card p-4 sm:p-6 gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95)] border border-[#00FF41]/40 overflow-hidden"
        style={{ background: "rgba(10, 11, 20, 0.98)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider flex items-center gap-2">
                <span>CYBERPUNK THEME ENGINE</span>
                <span className="text-[10px] text-[#00FF41] font-bold px-1.5 py-0.5 rounded bg-[#00FF41]/15 border border-[#00FF41]/30">
                  LIVE COLORWAYS
                </span>
              </h3>
              <p className="text-[10px] text-[#4F536E] uppercase">
                Create, customize, preview, and manage system palettes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartCreate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>NEW THEME</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TOP TABS */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              All Themes ({themes.length})
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeTab !== "editor") handleStartCreate();
                setActiveTab("editor");
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "editor"
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              <Sliders size={12} />
              <span>{editingId ? "Edit Theme" : "Theme Creator"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "json"
                  ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              <Copy size={12} />
              <span>Import / Export</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="sm:hidden flex items-center gap-1 p-1.5 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] text-xs font-bold"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* TAB 1: ALL THEMES BROWSER */}
        {activeTab === "all" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {themes.map((theme) => {
                const isActive = currentThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isActive
                        ? "border-[#00FF41] bg-white/[0.06] shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.bgDeep} 0%, rgba(20,20,35,0.7) 100%)`,
                    }}
                  >
                    {/* Header with Title and Type Tag */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-black tracking-wide"
                            style={{ color: theme.primary }}
                          >
                            {theme.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#4F536E] uppercase">
                          {theme.isCustom ? "Custom User Preset" : "Built-in Core"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {theme.isCustom && (
                          <button
                            type="button"
                            title="Edit this theme"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(theme);
                            }}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-[#9499B3] hover:text-[#00F0FF] transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Clone & customize"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(theme);
                          }}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-[#9499B3] hover:text-[#BF40FF] transition-colors"
                        >
                          <Copy size={12} />
                        </button>
                        {theme.isCustom && (
                          <button
                            type="button"
                            title="Delete theme"
                            onClick={(e) => handleDeleteTheme(theme.id, e)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#9499B3] hover:text-[#FF2A6D] transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-black/50 border border-white/5">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-4 rounded-md shadow-sm"
                          style={{ background: theme.primary }}
                        />
                        <span className="text-[8px] text-[#4F536E]">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-4 rounded-md shadow-sm"
                          style={{ background: theme.secondary }}
                        />
                        <span className="text-[8px] text-[#4F536E]">Secondary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-4 rounded-md shadow-sm"
                          style={{ background: theme.accent }}
                        />
                        <span className="text-[8px] text-[#4F536E]">Accent</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-4 rounded-md border border-white/10"
                          style={{ background: theme.bgDeep }}
                        />
                        <span className="text-[8px] text-[#4F536E]">Abyss</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE THEME CREATOR & EDITOR */}
        {activeTab === "editor" && (
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 lg:grid-cols-2 gap-5 scrollbar-none">
            {/* Left: Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2 mb-1.5">
                  <Edit2 size={13} className="text-[#00FF41]" />
                  <span>Theme Name</span>
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="e.g. Neon Horizon, Cyber Gold..."
                  className="w-full bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary Color */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Primary Neon</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: primaryColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Secondary Glow</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: secondaryColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Accent Cyan</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: accentColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Background Abyss Color */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Background Abyss</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: bgDeepColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgDeepColor}
                      onChange={(e) => setBgDeepColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgDeepColor}
                      onChange={(e) => setBgDeepColor(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Color Swatches */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">Quick Neon Palette:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPrimaryColor(c)}
                      className="w-6 h-6 rounded-lg border border-white/15 hover:scale-110 transition-transform cursor-pointer"
                      style={{ background: c }}
                      title={`Pick ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Interactive HUD Preview */}
            <div className="flex flex-col justify-between p-4 rounded-2xl border border-white/10 space-y-3" style={{ background: bgDeepColor }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase" style={{ color: primaryColor }}>
                  LIVE HUD PREVIEW
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ background: `${primaryColor}25`, color: primaryColor, border: `1px solid ${primaryColor}50` }}>
                  ONLINE
                </span>
              </div>

              {/* Sample Card */}
              <div
                className="p-3.5 rounded-xl border space-y-2.5"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderColor: `${primaryColor}40`,
                  boxShadow: `0 0 15px ${primaryColor}20`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: primaryColor }}>
                    // TELEMETRY PROBE
                  </span>
                  <span className="text-[10px]" style={{ color: accentColor }}>
                    LATENCY: 12ms
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: "68%",
                      background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}60`,
                    }}
                  >
                    EXECUTE
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: `${secondaryColor}20`,
                      color: secondaryColor,
                      border: `1px solid ${secondaryColor}60`,
                    }}
                  >
                    REVERT
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-3 py-2 rounded-xl text-xs text-[#9499B3] hover:text-white bg-white/5 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black cursor-pointer shadow-lg hover:scale-[1.02] transition-transform"
                  style={{ background: primaryColor }}
                >
                  <Sparkles size={14} />
                  <span>{editingId ? "UPDATE THEME" : "SAVE & APPLY"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JSON IMPORT / EXPORT */}
        {activeTab === "json" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-none flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9499B3] uppercase font-bold">
                Theme Preset JSON Format
              </span>
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(jsonText);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 1500);
                  } catch {}
                }}
                className="flex items-center gap-1 text-xs text-[#00FF41] hover:underline"
              >
                <Copy size={12} />
                <span>{copiedNotification ? "COPIED!" : "Copy JSON"}</span>
              </button>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={9}
              placeholder="Paste theme JSON here to import..."
              className="w-full bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl p-3 text-xs text-white font-mono focus:outline-none flex-1"
            />

            {jsonError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-[#FF2A6D]">
                {jsonError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleImportJson}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#BF40FF] text-white hover:bg-[#BF40FF]/80 transition-all cursor-pointer"
              >
                <Upload size={14} />
                <span>IMPORT & APPLY THEME</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
