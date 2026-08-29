import { describe, it, expect } from "vitest";
import { isValidHex, sanitizeColor, generateThemeCss } from "./theme";

describe("isValidHex", () => {
  it("accepts valid 6-digit hex with #", () => {
    expect(isValidHex("#00FF41")).toBe(true);
    expect(isValidHex("#BF40FF")).toBe(true);
  });

  it("rejects hex missing the leading #", () => {
    expect(isValidHex("00FF41")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidHex("#zzz")).toBe(false);
  });
});

describe("sanitizeColor", () => {
  it("returns the fallback for invalid input", () => {
    expect(sanitizeColor("nope", "#07070B")).toBe("#07070B");
  });
});

describe("generateThemeCss", () => {
  it("embeds the preset colors and emits !important declarations", () => {
    const css = generateThemeCss({
      id: "x",
      name: "x",
      primary: "#00FF41",
      secondary: "#BF40FF",
      accent: "#00F0FF",
      bgDeep: "#07070B",
      isCustom: false,
    });
    expect(css).toContain("#00FF41");
    expect(css).toContain("!important");
  });
});