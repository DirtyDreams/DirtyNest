import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System Tokens in globals.css", () => {
  it("defines the 4-tier surface ladder and ink tokens", () => {
    const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(globalsCss).toContain("--color-canvas: #07070B");
    expect(globalsCss).toContain("--color-surface-1: #0D0E17");
    expect(globalsCss).toContain("--color-surface-2: #131522");
    expect(globalsCss).toContain("--color-surface-3: #1A1D2E");
    expect(globalsCss).toContain("--color-surface-overlay: #1F2338");
    expect(globalsCss).toContain("--color-ink-primary: #F1F3F9");
    expect(globalsCss).toContain("--color-ink-secondary: #9499B3");
    expect(globalsCss).toContain("--color-hairline:");
    expect(globalsCss).toContain("--hairline-top:");
  });

  it("defines top-lit edge highlight on .cyber-card", () => {
    const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(globalsCss).toContain("inset 0 1px 0 0 rgba(255, 255, 255,");
    expect(globalsCss).toContain("background: rgba(19, 21, 34,");
  });
});
