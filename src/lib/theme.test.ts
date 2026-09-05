import { describe, expect, it } from "vitest";
import { generateThemeCss, isValidHex, sanitizeColor } from "./theme";

describe("theme helpers", () => {
  it("validates hex values", () => {
    expect(isValidHex("#00FF41")).toBe(true);
    expect(isValidHex("#abc")).toBe(true);
    expect(isValidHex("rgb(0,0,0)")).toBe(false);
  });

  it("falls back when the color is invalid", () => {
    expect(sanitizeColor("not-a-color", "#00FF41")).toBe("#00FF41");
  });

  it("generates css using sanitized values", () => {
    const css = generateThemeCss({
      id: "custom",
      name: "Custom",
      primary: "#11AA22",
      secondary: "#2222FF",
      accent: "#33FFFF",
      bgDeep: "#050505",
    });

    expect(css).toContain("--color-neon-green: #11AA22");
    expect(css).toContain("background-color: #050505 !important");
  });
});
