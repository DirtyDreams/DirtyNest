import { describe, expect, it } from "vitest";
import { DEFAULT_THEMES, generateThemeCss, isValidHex, sanitizeColor } from "./theme";

describe("theme helpers", () => {
  it("validates hex values", () => {
    expect(isValidHex("#00FF41")).toBe(true);
    expect(isValidHex("#abc")).toBe(true);
    expect(isValidHex("#123456")).toBe(true);
    expect(isValidHex("#12345678")).toBe(true);
    expect(isValidHex("rgb(0,0,0)")).toBe(false);
    expect(isValidHex("not-hex")).toBe(false);
    expect(isValidHex("")).toBe(false);
  });

  it("falls back when the color is invalid", () => {
    expect(sanitizeColor("not-a-color", "#00FF41")).toBe("#00FF41");
    expect(sanitizeColor("#00F0FF", "#00FF41")).toBe("#00F0FF");
  });

  it("validates that all DEFAULT_THEMES contain valid color definitions", () => {
    expect(DEFAULT_THEMES.length).toBeGreaterThan(0);
    for (const preset of DEFAULT_THEMES) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(isValidHex(preset.primary)).toBe(true);
      expect(isValidHex(preset.secondary)).toBe(true);
      expect(isValidHex(preset.accent)).toBe(true);
      expect(isValidHex(preset.bgDeep)).toBe(true);
    }
  });

  it("generates css using sanitized values and exposes required tokens", () => {
    const css = generateThemeCss({
      id: "custom",
      name: "Custom",
      primary: "#11AA22",
      secondary: "#2222FF",
      accent: "#33FFFF",
      bgDeep: "#050505",
    });

    expect(css).toContain("--color-neon-green: #11AA22");
    expect(css).toContain("--color-neon-purple: #2222FF");
    expect(css).toContain("--color-neon-cyan: #33FFFF");
    expect(css).toContain("--bg-deep: #050505");
    expect(css).toContain("--color-primary: #11AA22");
    expect(css).toContain("--color-primary-rgb: 17, 170, 34");
    expect(css).toContain("background-color: #050505 !important");
  });
});

describe("generateThemeCss", () => {
  it("injects primary, secondary, and accent variables for Matrix preset", () => {
    const matrix = DEFAULT_THEMES.find((t) => t.id === "matrix")!;
    const css = generateThemeCss(matrix);
    expect(css).toContain("--color-primary: #00FF41");
    expect(css).toContain("--color-secondary: #BF40FF");
    expect(css).toContain("--color-accent: #00F0FF");
    expect(css).toContain("--color-primary-rgb: 0, 255, 65");
    expect(css).toContain("--color-canvas: #07070B");
  });

  it("handles custom presets with fallback sanitization", () => {
    const css = generateThemeCss({
      id: "test",
      name: "Test",
      primary: "invalid-color",
      secondary: "#123456",
      accent: "#654321",
      bgDeep: "#000000",
    });
    expect(css).toContain("--color-primary: #00FF41");
    expect(css).toContain("--color-secondary: #123456");
    expect(css).toContain("--color-canvas: #000000");
    expect(css).not.toContain("invalid-color");
  });

  it("aligns .cyber-card:hover with Stitch top-lit hairline without ::before", () => {
    const matrix = DEFAULT_THEMES.find((t) => t.id === "matrix")!;
    const css = generateThemeCss(matrix);
    expect(css).not.toContain(".cyber-card:hover::before");
    expect(css).toContain("inset 0 1px 0 0 rgba(255, 255, 255,");
  });
});

