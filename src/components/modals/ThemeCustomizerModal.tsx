"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Sliders,
  Copy,
  Upload,
  Atom,
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
import CyberpunkShaderFxStudioModal from "@/components/views/tools/CyberpunkShaderFxStudioModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const [isShaderModalOpen, setIsShaderModalOpen] = useState(false);

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

  const handleSelectTheme = (theme: ThemePreset) => {
    cyberAudio.play("click");
    setCurrentThemeId(theme.id);
    applyThemePreset(theme);
    toast.success(`Active theme switched to: ${theme.name}`);
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
    toast.success(`Theme "${newTheme.name}" saved & applied!`);
  };

  const handleDeleteTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberAudio.play("click");
    if (confirm("Are you sure you want to delete this custom theme?")) {
      deleteCustomTheme(id);
      refreshThemes();
      toast.info("Custom theme deleted");
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
      toast.success(`Theme "${saved.name}" successfully imported!`);
    } catch (err: any) {
      setJsonError(err.message || "Failed to parse JSON.");
      toast.error("Invalid JSON format");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-4 sm:p-6 gap-4 bg-[#090A14] border-[#00FF41]/40 font-mono shadow-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]">
              <Palette size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider flex items-center gap-2">
                <span>CYBERPUNK THEME ENGINE</span>
                <Badge variant="outline" className="text-[10px] bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30">
                  LIVE COLORWAYS
                </Badge>
              </DialogTitle>
              <p className="text-[10px] text-[#4F536E] uppercase">
                Create, customize, preview, and manage system palettes
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleStartCreate}
            className="hidden sm:flex items-center gap-1.5 bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 font-bold h-8"
          >
            <Plus size={14} />
            <span>NEW THEME</span>
          </Button>
        </DialogHeader>

        {/* Tab Strip */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ModalTab)} className="w-full flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0 gap-2 flex-wrap">
            <TabsList className="bg-black/50 border border-white/10 p-0.5">
              <TabsTrigger value="all" className="text-xs">
                All Themes ({themes.length})
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                onClick={() => {
                  if (activeTab !== "editor") handleStartCreate();
                }}
                className="text-xs flex items-center gap-1.5"
              >
                <Sliders size={12} />
                <span>{editingId ? "Edit Theme" : "Theme Creator"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="json"
                onClick={handleExportJson}
                className="text-xs flex items-center gap-1.5"
              >
                <Copy size={12} />
                <span>Import / Export</span>
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cyberAudio.play("warp");
                setIsShaderModalOpen(true);
              }}
              className="bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold hover:bg-[#00FF41]/25 text-xs h-8 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
            >
              <Sparkles size={13} className="mr-1.5" />
              <span>SHADER & MATRIX FX</span>
            </Button>
          </div>

          {/* TAB 1: ALL THEMES */}
          <TabsContent value="all" className="flex-1 overflow-y-auto pr-1 space-y-3 mt-3">
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
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-wide" style={{ color: theme.primary }}>
                            {theme.name}
                          </span>
                          {isActive && (
                            <Badge variant="outline" className="text-[9px] bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40">
                              ACTIVE
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-[#4F536E] uppercase">
                          {theme.isCustom ? "Custom User Preset" : "Built-in Core"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {theme.isCustom && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit this theme"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(theme);
                            }}
                            className="h-7 w-7 text-[#9499B3] hover:text-[#00F0FF]"
                          >
                            <Edit2 size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Clone & customize"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(theme);
                          }}
                          className="h-7 w-7 text-[#9499B3] hover:text-[#BF40FF]"
                        >
                          <Copy size={12} />
                        </Button>
                        {theme.isCustom && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete theme"
                            onClick={(e) => handleDeleteTheme(theme.id, e)}
                            className="h-7 w-7 text-[#9499B3] hover:text-[#FF2A6D]"
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-black/50 border border-white/5">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-4 rounded-md shadow-sm" style={{ background: theme.primary }} />
                        <span className="text-[8px] text-[#4F536E]">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-4 rounded-md shadow-sm" style={{ background: theme.secondary }} />
                        <span className="text-[8px] text-[#4F536E]">Secondary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-4 rounded-md shadow-sm" style={{ background: theme.accent }} />
                        <span className="text-[8px] text-[#4F536E]">Accent</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-4 rounded-md border border-white/10" style={{ background: theme.bgDeep }} />
                        <span className="text-[8px] text-[#4F536E]">Abyss</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: LIVE CREATOR & EDITOR */}
          <TabsContent value="editor" className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2 mb-1.5">
                  <Edit2 size={13} className="text-[#00FF41]" />
                  <span>Theme Name</span>
                </label>
                <Input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="e.g. Neon Horizon, Cyber Gold..."
                  className="bg-black/60 border-white/10"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Primary Neon</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: primaryColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 bg-black/50 border-white/10 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Secondary Glow</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: secondaryColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-8 bg-black/50 border-white/10 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Accent Cyan</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: accentColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 bg-black/50 border-white/10 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1F3F9]">Background Abyss</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: bgDeepColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgDeepColor}
                      onChange={(e) => setBgDeepColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgDeepColor}
                      onChange={(e) => setBgDeepColor(e.target.value)}
                      className="h-8 bg-black/50 border-white/10 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Swatches */}
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
                  <Button
                    size="sm"
                    className="h-7 text-xs font-bold"
                    style={{
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}60`,
                    }}
                  >
                    EXECUTE
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-bold"
                    style={{
                      background: `${secondaryColor}20`,
                      color: secondaryColor,
                      border: `1px solid ${secondaryColor}60`,
                    }}
                  >
                    REVERT
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className="text-xs text-[#9499B3] hover:text-white"
                >
                  CANCEL
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveTheme}
                  className="flex items-center gap-1.5 text-xs font-bold text-black shadow-lg"
                  style={{ background: primaryColor }}
                >
                  <Sparkles size={14} />
                  <span>{editingId ? "UPDATE THEME" : "SAVE & APPLY"}</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: JSON */}
          <TabsContent value="json" className="flex-1 overflow-y-auto pr-1 space-y-3 mt-3 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9499B3] uppercase font-bold">
                Theme Preset JSON Format
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(jsonText);
                    toast.success("JSON copied to clipboard!");
                  } catch {}
                }}
                className="text-xs text-[#00FF41] hover:text-[#00FF41]/80 h-7"
              >
                <Copy size={12} className="mr-1" />
                <span>Copy JSON</span>
              </Button>
            </div>

            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={9}
              placeholder="Paste theme JSON here to import..."
              className="bg-black/60 border-white/10 font-mono text-xs flex-1"
            />

            {jsonError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-[#FF2A6D]">
                {jsonError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={handleImportJson}
                className="flex items-center gap-1.5 bg-[#BF40FF] text-white hover:bg-[#BF40FF]/80 font-bold text-xs h-9"
              >
                <Upload size={14} />
                <span>IMPORT & APPLY THEME</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Shader & Matrix FX Studio Modal */}
      <CyberpunkShaderFxStudioModal
        isOpen={isShaderModalOpen}
        onClose={() => setIsShaderModalOpen(false)}
      />
    </Dialog>
  );
}
