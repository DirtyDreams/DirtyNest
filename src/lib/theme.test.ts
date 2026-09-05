<<<<<<< HEAD
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
=======
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
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
