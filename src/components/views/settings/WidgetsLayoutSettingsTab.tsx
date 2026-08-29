"use client";

import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, ArrowUp, ArrowDown, RotateCcw, Search, Maximize2, Minimize2 } from "lucide-react";
import { ALL_WIDGETS_METADATA, DEFAULT_LAYOUT, LAYOUT_PRESETS, loadWidgetLayout, saveWidgetLayout, type WidgetLayoutItem } from "@/lib/widgetLayout";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

const CATEGORIES = [
  "ALL CATEGORIES",
  "CORE",
  "AI & TOKENS",
  "SECURITY & SRE",
  "CLOUD & GIT",
  "UTILITIES & ZEN",
];

export default function WidgetsLayoutSettingsTab() {
  const toast = useToast();
  const [layout, setLayout] = useState<WidgetLayoutItem[]>(DEFAULT_LAYOUT);
  const [selectedCategory, setSelectedCategory] = useState("ALL CATEGORIES");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLayout(loadWidgetLayout());
  }, []);

  const handleSave = (newLayout: WidgetLayoutItem[]) => {
    setLayout(newLayout);
    saveWidgetLayout(newLayout);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
  };

  const toggleWidget = (id: string) => {
    cyberAudio.play("click");
    const updated = layout.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    handleSave(updated);
    toast.success("Widget Updated", `Widget state toggled.`);
  };

  const toggleSpan = (id: string) => {
    cyberAudio.play("click");
    const updated = layout.map((item) =>
      item.id === id
        ? { ...item, span: item.span === "1-col" ? ("2-col" as const) : ("1-col" as const) }
        : item
    );
    handleSave(updated);
    toast.success("Grid Span Updated", "Widget width configuration adjusted.");
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    cyberAudio.play("click");
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.length) return;

    const newLayout = [...layout];
    const temp = newLayout[index]!;
    newLayout[index] = newLayout[targetIndex]!;
    newLayout[targetIndex] = temp;

    handleSave(newLayout);
  };

  const applyPreset = (presetKey: string) => {
    cyberAudio.play("chime");
    const preset = LAYOUT_PRESETS[presetKey];
    if (!preset) return;

    const activeSet = new Set(preset.ids);
    const updated = layout.map((item) => ({
      ...item,
      enabled: activeSet.has(item.id),
    }));
    handleSave(updated);
    toast.success("Preset Applied", `${preset.name} is now active.`);
  };

  const handleEnableAll = () => {
    cyberAudio.play("chime");
    const updated = layout.map((item) => ({ ...item, enabled: true }));
    handleSave(updated);
    toast.success("All Enabled", "All 26 tactical widgets are now active.");
  };

  const handleDisableAll = () => {
    cyberAudio.play("click");
    const updated = layout.map((item) => ({ ...item, enabled: false }));
    handleSave(updated);
    toast.info("All Disabled", "All widgets deactivated.");
  };

  const handleResetDefault = () => {
    cyberAudio.play("chime");
    handleSave(DEFAULT_LAYOUT);
    toast.success("Layout Reset", "Default layout sequence restored.");
  };

  const activeCount = layout.filter((i) => i.enabled).length;

  const filteredItems = useMemo(() => {
    return layout
      .map((item, index) => {
        const meta = ALL_WIDGETS_METADATA.find((m) => m.id === item.id);
        return { item, meta, originalIndex: index };
      })
      .filter(({ meta }) => {
        if (!meta) return false;
        if (selectedCategory !== "ALL CATEGORIES" && meta.category !== selectedCategory)
          return false;
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchesName = meta.name.toLowerCase().includes(q);
          const matchesId = meta.id.toLowerCase().includes(q);
          const matchesDesc = meta.description.toLowerCase().includes(q);
          if (!matchesName && !matchesId && !matchesDesc) return false;
        }
        return true;
      });
  }, [layout, selectedCategory, searchQuery]);

  return (
    <div className="space-y-5 animate-fade-in font-mono select-none text-xs">
      {/* Top Banner */}
      <div className="cyber-card p-5 bg-[#07070B]/95 border border-[#00FF41]/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <LayoutGrid size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                DASHBOARD WIDGETS & HUD LAYOUT MATRIX
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                {activeCount} / {layout.length} ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              Toggle visibility, reorder flow sequence & configure column spans for all 26 tactical Bento widgets
            </p>
          </div>
        </div>

        {/* Global Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEnableAll}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00FF41] font-bold border border-white/10 transition-all cursor-pointer"
          >
            ENABLE ALL
          </button>
          <button
            onClick={handleDisableAll}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#9499B3] hover:text-white font-bold border border-white/10 transition-all cursor-pointer"
          >
            DISABLE ALL
          </button>
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00F0FF] font-bold border border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>RESET DEFAULT</span>
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-col gap-2">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold">
          Quick Preset Blueprints
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(LAYOUT_PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-col gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "bg-white/5 text-[#9499B3] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets by title, ID, or description..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
          />
        </div>
      </div>

      {/* Interactive Ordered Widgets Stream */}
      <div className="space-y-2.5">
        {filteredItems.map(({ item, meta, originalIndex }) => {
          if (!meta) return null;
          const isFirst = originalIndex === 0;
          const isLast = originalIndex === layout.length - 1;

          return (
            <div
              key={item.id}
              className={`cyber-card p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                item.enabled
                  ? "bg-[#090A14] border-white/10 hover:border-[#00FF41]/40"
                  : "bg-black/20 border-white/5 opacity-50 hover:opacity-80"
              }`}
            >
              {/* Left Info & Reorder */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Position Index Badge */}
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-[#4F536E] font-bold shrink-0">
                  #{originalIndex + 1}
                </span>

                {/* Move Up/Down Controls */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={isFirst}
                    onClick={() => moveItem(originalIndex, "up")}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                    title="Move Up"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => moveItem(originalIndex, "down")}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                    title="Move Down"
                  >
                    <ArrowDown size={11} />
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-xs text-[#F1F3F9] truncate">
                      {meta.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#4F536E] font-bold shrink-0">
                      {meta.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9499B3] truncate mt-0.5">
                    {meta.description}
                  </span>
                </div>
              </div>

              {/* Right Controls: Span & Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Span Switcher */}
                <button
                  onClick={() => toggleSpan(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    item.span === "2-col"
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-white/5 text-[#9499B3] border-white/10"
                  }`}
                  title="Toggle 1-Column vs 2-Column Full Width Span"
                >
                  {item.span === "2-col" ? (
                    <>
                      <Maximize2 size={11} />
                      <span>2-COL (FULL)</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 size={11} />
                      <span>1-COL (HALF)</span>
                    </>
                  )}
                </button>

                {/* ON / OFF Switch */}
                <button
                  onClick={() => toggleWidget(item.id)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer relative shrink-0 p-0.5 border ${
                    item.enabled
                      ? "bg-[#00FF41]/20 border-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                      : "bg-black border-white/20"
                  }`}
                  title={item.enabled ? "Disable Widget" : "Enable Widget"}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      item.enabled
                        ? "translate-x-6 bg-[#00FF41]"
                        : "translate-x-0 bg-[#4F536E]"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
