# DirtyNest UI/UX Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Cyber Craft & Luxury Cyber Chrome design system across DirtyNest based on the Google Stitch `DESIGN.md` specification, upgrading the 4-step surface ladder, top-lit hairlines, typography tracking, and theme engine bridge with zero regressions.

**Architecture:** Dual-layer token architecture separating static geometric craft (surface ladder, inks, hairlines, typography in `globals.css` and Tailwind v4 `@theme inline`) from dynamic brand voltage (`src/lib/theme.ts` preset injector). Standardize `.cyber-card`, buttons, inputs, and telemetry badges.

**Tech Stack:** Next.js 16.3.2 App Router, React 19, Tailwind CSS v4 (`@theme inline`), CSS Custom Properties, Vitest, TypeScript.

**Spec:** [`docs/superpowers/specs/2026-09-05-ui-ux-design.md`](file:///c:/Users/coyot/workspace/dirty-test/docs/superpowers/specs/2026-09-05-ui-ux-design.md) & [`DESIGN.md`](file:///c:/Users/coyot/workspace/dirty-test/DESIGN.md)

## Global Constraints

- Tailwind CSS v4 CSS-first configuration (`@theme inline` in `src/app/globals.css`).
- Zero ESLint errors or warnings (`--max-warnings 0` enforced in CI).
- Zero TypeScript errors (`npm run typecheck`).
- All existing Vitest suites must pass (`npm test`).
- Preserve dynamic multi-theme customization (`Matrix Core`, `Night City 2077`, `Synthwave`, custom themes).

---

### Task 1: Surface Ladder, Inks, and Hairline Tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css:12-120`
- Test: `src/lib/themeTokens.test.ts` (new)

**Interfaces:**
- Consumes: Google Stitch tokens defined in `DESIGN.md`
- Produces: CSS variables `--color-canvas`, `--color-surface-1`, `--color-surface-2`, `--color-surface-3`, `--color-surface-overlay`, `--color-ink-primary`, `--color-ink-secondary`, `--color-ink-muted`, `--color-ink-faint`, `--color-hairline`, `--hairline-top`, exposed via Tailwind `@theme inline`.

- [ ] **Step 1: Write test verifying token definitions and contract**

Create `src/lib/themeTokens.test.ts`:
```typescript
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
    expect(globalsCss).toContain("--color-ink-primary: #F1F3F9");
    expect(globalsCss).toContain("--color-ink-secondary: #9499B3");
    expect(globalsCss).toContain("--color-hairline:");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/themeTokens.test.ts`  
Expected: FAIL (missing tokens)

- [ ] **Step 3: Update `src/app/globals.css` with surface and ink tokens**

Add the semantic surface ladder, ink contrast hierarchy, and hairlines to `@theme inline` and `:root` in `src/app/globals.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/themeTokens.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/lib/themeTokens.test.ts
git commit -m "feat(design): implement surface ladder and ink contrast tokens in globals.css"
```

---

### Task 2: Elevated `.cyber-card`, Button, Input, and Telemetry Component Classes

**Files:**
- Modify: `src/app/globals.css:170-230`
- Test: `src/lib/themeTokens.test.ts`

**Interfaces:**
- Consumes: `--color-surface-2`, `--color-hairline`, `--hairline-top`
- Produces: Enhanced `.cyber-card`, `.cyber-card:hover`, `.hud-corner`, and scrollbar styles with top-lit inset edge lighting.

- [ ] **Step 1: Add card styling assertion to `src/lib/themeTokens.test.ts`**

Add test case checking `.cyber-card` uses inset top-lit edge highlight:
```typescript
it("defines top-lit edge highlight on .cyber-card", () => {
  const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
  expect(globalsCss).toContain("inset 0 1px 0 0 rgba(255, 255, 255,");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/themeTokens.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement top-lit edge lighting and surface tuning in `src/app/globals.css`**

Replace old `.cyber-card` drop shadow and border styling with the calibrated Stitch specifications:
```css
.cyber-card {
  position: relative;
  background: rgba(19, 21, 34, 0.78);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.10),
    0 12px 32px -8px rgba(0, 0, 0, 0.65);
  transition: border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.cyber-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/themeTokens.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/lib/themeTokens.test.ts
git commit -m "feat(design): upgrade .cyber-card with top-lit edge reflection and precision surface"
```

---

### Task 3: Dual-Layer Theme Engine Bridge in `src/lib/theme.ts`

**Files:**
- Modify: `src/lib/theme.ts:184-250`
- Test: `src/lib/theme.test.ts` (new)

**Interfaces:**
- Consumes: `ThemePreset` objects (`DEFAULT_THEMES`, custom themes)
- Produces: `generateThemeCss(preset)` returning valid CSS variable declarations mapped to `--color-primary`, `--color-secondary`, `--color-accent`, RGB channels, and radial ambient background without overriding the 4-step surface ladder.

- [ ] **Step 1: Write unit tests in `src/lib/theme.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { generateThemeCss, DEFAULT_THEMES } from "./theme";

describe("generateThemeCss", () => {
  it("injects primary, secondary, and accent variables for Matrix preset", () => {
    const matrix = DEFAULT_THEMES.find(t => t.id === "matrix")!;
    const css = generateThemeCss(matrix);
    expect(css).toContain("--color-primary: #00FF41");
    expect(css).toContain("--color-secondary: #BF40FF");
    expect(css).toContain("--color-accent: #00F0FF");
    expect(css).toContain("--color-primary-rgb:");
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
  });
});
```

- [ ] **Step 2: Run test to verify it passes or fails**

Run: `npx vitest run src/lib/theme.test.ts`  
Expected: PASS / verify current behavior

- [ ] **Step 3: Refine `generateThemeCss` in `src/lib/theme.ts`**

Ensure `generateThemeCss` injects semantic variables cleanly, updates ambient background lighting to subtle opacities (0.04 - 0.08), and preserves the base surface hierarchy.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/theme.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/lib/theme.test.ts
git commit -m "feat(design): bridge theme.ts dynamic voltage with Stitch token architecture"
```

---

### Task 4: Full Codebase Quality Gate & Visual Build Verification

**Files:**
- Project-wide verification

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npm run typecheck`  
Expected: 0 errors

- [ ] **Step 2: Run ESLint check**

Run: `npm run lint`  
Expected: 0 errors, 0 warnings

- [ ] **Step 3: Run Vitest unit tests**

Run: `npm test`  
Expected: All test suites pass

- [ ] **Step 4: Run Next.js production build check**

Run: `npm run build`  
Expected: Next.js builds successfully with zero build errors

- [ ] **Step 5: Commit any final polish**

```bash
git commit -m "chore(design): complete UI/UX design system verification"
```
