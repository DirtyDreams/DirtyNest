"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sliders,
  Check,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  ALL_WIDGETS_METADATA,
  WidgetLayoutItem,
  loadWidgetLayout,
  saveWidgetLayout,
  LAYOUT_PRESETS,
} from "@/lib/widgetLayout";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function DashboardSettingsTab() {
  const toast = useToast();
  const [layout, setLayout] = useState<WidgetLayoutItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState("2.5");
  const [northStarMetricsEnabled, setNorthStarMetricsEnabled] = useState(true);
  const [aiBriefingEnabled, setAiBriefingEnabled] = useState(true);

  useEffect(() => {
    setLayout(loadWidgetLayout());
    try {
      const savedPoll = localStorage.getItem("dirtynest_poll_interval");
      if (savedPoll) setAutoRefreshInterval(savedPoll);
      const savedDora = localStorage.getItem("dirtynest_show_dora");
      if (savedDora) setNorthStarMetricsEnabled(savedDora !== "false");
      const savedBrief = localStorage.getItem("dirtynest_show_ai_brief");
      if (savedBrief) setAiBriefingEnabled(savedBrief !== "false");
    } catch {}
  }, []);

  const handleToggle = (id: string) => {
    cyberAudio.play("click");
    const updated = layout.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setLayout(updated);
    saveWidgetLayout(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
  };

  const handleToggleSpan = (id: string) => {
    cyberAudio.play("click");
    const updated = layout.map((item) =>
      item.id === id
        ? {
            ...item,
            span: item.span === "2-col" ? ("1-col" as const) : ("2-col" as const),
          }
        : item
    );
    setLayout(updated);
    saveWidgetLayout(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
    toast.success("Widget Span Updated", `Changed grid width for ${id}`);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    cyberAudio.play("click");
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.length) return;

    const newLayout = [...layout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;

    setLayout(newLayout);
    saveWidgetLayout(newLayout);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    cyberAudio.play("chime");
    const preset = LAYOUT_PRESETS[presetKey];
    if (!preset) return;

    const updated = layout.map((item) => ({
      ...item,
      enabled: preset.ids.includes(item.id),
    }));

    setLayout(updated);
    saveWidgetLayout(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
    toast.success("Preset Applied", `Activated ${preset.name}`);
  };

  const handleReset = () => {
    cyberAudio.play("click");
    const reset = ALL_WIDGETS_METADATA.map((w) => ({
      id: w.id,
      enabled: true,
      span: w.defaultSpan,
    }));
    setLayout(reset);
    saveWidgetLayout(reset);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
    }
    toast.info("Dashboard Reset", "Default layout sequence restored.");
  };

  const categories = ["ALL", "CORE", "AI & TOKENS", "SECURITY & SRE", "CLOUD & GIT", "UTILITIES & ZEN"];

  const filteredWidgets = layout.map((item, index) => {
    const meta = ALL_WIDGETS_METADATA.find((m) => m.id === item.id);
    return { item, meta, originalIndex: index };
  }).filter(({ meta }) => {
    if (!meta) return true;
    if (activeCategory === "ALL") return true;
    return meta.category === activeCategory;
  });

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <LayoutDashboard size={16} />
            <span>Dashboard & Tactical HUD Parameters</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure Bento grid sequence, 1-col / 2-col spans, telemetry banners and layout blueprints
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/10 transition-all cursor-pointer text-xs"
        >
          <RotateCcw size={13} />
          <span>RESET TO DEFAULT</span>
        </button>
      </div>

      {/* Top Banner Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-[#F1F3F9] uppercase">DORA North Star Health Bar</div>
            <div className="text-[10px] text-[#4F536E]">Deployment frequency, lead time and MTTR bar</div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              const val = !northStarMetricsEnabled;
              setNorthStarMetricsEnabled(val);
              try { localStorage.setItem("dirtynest_show_dora", String(val)); } catch {}
              if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
            }}
            className={`px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
              northStarMetricsEnabled ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40" : "bg-white/5 text-[#4F536E]"
            }`}
          >
            {northStarMetricsEnabled ? "SHOWN" : "HIDDEN"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-[#F1F3F9] uppercase">AI Operations Briefing</div>
            <div className="text-[10px] text-[#4F536E]">Natural language cluster synthesis header</div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              const val = !aiBriefingEnabled;
              setAiBriefingEnabled(val);
              try { localStorage.setItem("dirtynest_show_ai_brief", String(val)); } catch {}
              if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("dirtynest-layout-updated"));
            }}
            className={`px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
              aiBriefingEnabled ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40" : "bg-white/5 text-[#4F536E]"
            }`}
          >
            {aiBriefingEnabled ? "SHOWN" : "HIDDEN"}
          </button>
        </div>
      </div>

      {/* Preset Blueprints */}
      <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <Sparkles size={14} className="text-[#00FF41]" />
          <span>Quick Layout Blueprints</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {Object.entries(LAYOUT_PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handleApplyPreset(key)}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF41]/40 text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-[11px] text-[#F1F3F9] group-hover:text-[#00FF41] truncate">
                {p.name.split(" ")[0]}
              </div>
              <div className="text-[9px] text-[#4F536E] mt-0.5">
                {p.ids.length} widgets
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              cyberAudio.play("click");
              setActiveCategory(cat);
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "bg-white/5 text-[#9499B3] hover:text-white border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Widget Grid Sequence */}
      <div className="space-y-2">
        {filteredWidgets.map(({ item, meta, originalIndex }) => {
          const isFirst = originalIndex === 0;
          const isLast = originalIndex === layout.length - 1;
          const isWide = item.span === "2-col";

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                item.enabled
                  ? "bg-[#090A14] border-white/10 hover:border-white/25"
                  : "bg-black/30 border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px] text-[#4F536E] w-6 shrink-0 font-bold">
                  #{originalIndex + 1}
                </span>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#F1F3F9] truncate">
                      {meta?.name || item.id}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] font-bold uppercase shrink-0">
                      {meta?.category || "WIDGET"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9499B3] truncate">
                    {meta?.description || "Tactical HUD Component"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Span Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleSpan(item.id)}
                  title={isWide ? "Switch to 1-Column" : "Switch to 2-Column (Wide)"}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    isWide
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40"
                      : "bg-white/5 text-[#9499B3] border-white/10"
                  }`}
                >
                  {isWide ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                  <span>{isWide ? "2-COL" : "1-COL"}</span>
                </button>

                {/* Move Up/Down */}
                <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/5">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMove(originalIndex, "up")}
                    className="p-1 text-[#9499B3] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMove(originalIndex, "down")}
                    className="p-1 text-[#9499B3] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    item.enabled
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30"
                      : "bg-white/5 text-[#4F536E] border-white/10"
                  }`}
                >
                  {item.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{item.enabled ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
