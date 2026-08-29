import { describe, it, expect, beforeEach } from "vitest";
import {
  ALL_WIDGETS_METADATA,
  DEFAULT_LAYOUT,
  LAYOUT_PRESETS,
  loadWidgetLayout,
  saveWidgetLayout,
} from "./widgetLayout";

const STORAGE_KEY = "dirtynest_widget_layout";
const LEGACY_KEY = "dirtynest_custom_widgets";

describe("widget layout structural invariants", () => {
  it("DEFAULT_LAYOUT covers every widget exactly once with sane spans", () => {
    expect(DEFAULT_LAYOUT.length).toBe(ALL_WIDGETS_METADATA.length);
    for (const item of DEFAULT_LAYOUT) {
      const meta = ALL_WIDGETS_METADATA.find((w) => w.id === item.id)!;
      expect(meta).toBeDefined();
      expect(item.enabled).toBe(true);
      expect(item.span).toBe(meta.defaultSpan);
    }
  });

  it("every preset id (including all) exists in widget metadata", () => {
    for (const [preset, { ids }] of Object.entries(LAYOUT_PRESETS)) {
      for (const id of ids) {
        expect(
          ALL_WIDGETS_METADATA.some((w) => w.id === id),
          `${preset} references unknown widget "${id}"`
        ).toBe(true);
      }
    }
    expect(LAYOUT_PRESETS.all.ids).toHaveLength(ALL_WIDGETS_METADATA.length);
  });
});

describe("loadWidgetLayout round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("backfills metadata widgets missing from a saved layout", () => {
    const removed = ["matrix_rain", "github_trending"];
    const reduced = ALL_WIDGETS_METADATA.filter((w) => !removed.includes(w.id)).map((w) => ({
      id: w.id,
      enabled: true,
      span: w.defaultSpan,
    }));
    saveWidgetLayout(reduced);

    const loaded = loadWidgetLayout();
    const ids = loaded.map((item) => item.id);
    expect(loaded.length).toBe(ALL_WIDGETS_METADATA.length);
    expect(ids).toEqual(expect.arrayContaining(ALL_WIDGETS_METADATA.map((w) => w.id)));
    for (const id of removed) {
      const backfilled = loaded.find((item) => item.id === id)!;
      expect(backfilled.enabled).toBe(true);
      const meta = ALL_WIDGETS_METADATA.find((w) => w.id === id)!;
      expect(backfilled.span).toBe(meta.defaultSpan);
    }
  });

  it("recovers to a fully-enabled DEFAULT_LAYOUT when fewer than 6 widgets are enabled", () => {
    const broken = ALL_WIDGETS_METADATA.map((w, i) => ({
      id: w.id,
      enabled: i < 5,
      span: w.defaultSpan,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(broken));

    const loaded = loadWidgetLayout();
    expect(loaded).toEqual(DEFAULT_LAYOUT);
    expect(loaded.every((item) => item.enabled)).toBe(true);
    // recovery re-saves the default
    const reSaved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(reSaved).toEqual(DEFAULT_LAYOUT);
  });

  it("falls back to DEFAULT_LAYOUT on corrupt storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadWidgetLayout()).toEqual(DEFAULT_LAYOUT);
  });
});

describe("saveWidgetLayout dual-key write", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writes the id->enabled legacy map alongside the layout", () => {
    const layout = ALL_WIDGETS_METADATA.map((w) => ({
      id: w.id,
      enabled: w.id !== "matrix_rain",
      span: w.defaultSpan,
    }));
    saveWidgetLayout(layout);

    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY)!);
    expect(Object.keys(legacy)).toHaveLength(ALL_WIDGETS_METADATA.length);
    for (const item of layout) {
      expect(legacy[item.id]).toBe(item.enabled);
    }
  });
});