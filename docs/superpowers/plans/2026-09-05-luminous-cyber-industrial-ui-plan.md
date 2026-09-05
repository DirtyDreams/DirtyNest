# Luminous Cyber-Industrial UI Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate DirtyNest's interface to a state-of-the-art Luminous Cyber-Industrial design system featuring 4-tier surface elevations, spotlight mouse tracking, grouped tactical navigation, standardized HUD framing, and refined chatbot/control room telemetry.

**Architecture:** Extend Tailwind v4 design tokens and CSS variables in `globals.css` to support luminous ambient lighting and elevation levels. Introduce a lightweight, zero-re-render `CyberCardSpotlight` component and overhaul `Sidebar.tsx` into 4 tactical operational clusters. Standardize widget headers and view transitions.

**Tech Stack:** Next.js 16.3.2 (App Router), React 19, Tailwind CSS v4, Lucide React, Zustand, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-05-luminous-cyber-industrial-ui-design.md`

## Global Constraints

- Tailwind CSS v4 token compatibility with runtime CSS variables from `src/lib/theme.ts`.
- Zero build or lint errors: `npm run typecheck` (0 errors) and `npm run lint` (0 errors, 0 warnings).
- Maintain all existing dynamic routes, hash routing (`#view`), and client component performance (`use client` boundary).
- Vitest unit tests must pass: `npm test`.

---

### Task 1: Surface Tokens & Luminous CSS Utilities

**Files:**
- Modify: `src/app/globals.css:1-120`
- Test: `src/lib/theme.test.ts`

**Interfaces:**
- Consumes: CSS variables `--bg-deep`, `--color-neon-*` from `src/lib/theme.ts`.
- Produces: `.cyber-spotlight-card`, `.tactical-badge`, `.hud-corner-bracket`, `.luminous-glass` utility classes and coordinates `--mouse-x`, `--mouse-y`.

- [ ] **Step 1: Write test for theme tokens and CSS variables**

Verify that `src/lib/theme.test.ts` validates that the default theme presets and custom theme generators include all required base colors and that `generateThemeCss` emits valid variables.

- [ ] **Step 2: Run test to verify current state**

Run: `npm test -- src/lib/theme.test.ts`
Expected: PASS

- [ ] **Step 3: Implement luminous CSS utilities in `globals.css`**

Add the 4-tier surface elevation classes, spotlight radial gradient helper, and tactical HUD micro-brackets to `src/app/globals.css`:
```css
/* Luminous Cyber-Industrial Elevation Layers */
.luminous-surface-l1 {
  background: rgba(8, 9, 15, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.luminous-surface-l2 {
  background: rgba(13, 14, 24, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}

.luminous-surface-l2:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

/* Dynamic Spotlight Hover Effect */
.spotlight-radial-glow {
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 255, 65, 0.08),
    transparent 60%
  );
}

/* Tactical HUD Corner Brackets */
.hud-corner-bracket {
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
}
.hud-corner-bracket.tl { top: 0; left: 0; border-top: 1.5px solid var(--color-neon-green); border-left: 1.5px solid var(--color-neon-green); opacity: 0.4; }
.hud-corner-bracket.br { bottom: 0; right: 0; border-bottom: 1.5px solid var(--color-neon-green); border-right: 1.5px solid var(--color-neon-green); opacity: 0.4; }
```

- [ ] **Step 4: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/lib/theme.test.ts
git commit -m "style: add luminous cyber-industrial tokens and elevation utilities"
```

---

### Task 2: Reusable `CyberCardSpotlight` Component

**Files:**
- Create: `src/components/common/CyberCardSpotlight.tsx`
- Create: `src/components/common/CyberCardSpotlight.test.tsx`

**Interfaces:**
- Consumes: React props (`children`, `className`, `spotlightColor`, `showBrackets`).
- Produces: `<CyberCardSpotlight>` reusable wrapper tracking mouse coordinates via CSS custom properties.

- [ ] **Step 1: Write test for `CyberCardSpotlight`**

Create `src/components/common/CyberCardSpotlight.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CyberCardSpotlight from "./CyberCardSpotlight";

describe("CyberCardSpotlight", () => {
  it("renders children correctly", () => {
    render(<CyberCardSpotlight><div>Test Content</div></CyberCardSpotlight>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("updates mouse position style variables on mousemove", () => {
    const { container } = render(<CyberCardSpotlight><div>Content</div></CyberCardSpotlight>);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseMove(card, { clientX: 100, clientY: 150 });
    expect(card).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npm test -- src/components/common/CyberCardSpotlight.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `CyberCardSpotlight.tsx`**

```tsx
"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CyberCardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  showBrackets?: boolean;
}

export default function CyberCardSpotlight({
  children,
  className,
  spotlightColor = "rgba(0, 255, 65, 0.08)",
  showBrackets = true,
  ...props
}: CyberCardSpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "luminous-surface-l2 group relative rounded-xl transition-all duration-200",
        className
      )}
      style={{
        ["--spotlight-color" as string]: spotlightColor,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color), transparent 60%)`,
        }}
      />
      {showBrackets && (
        <>
          <span className="hud-corner-bracket tl transition-opacity duration-200 group-hover:opacity-90" />
          <span className="hud-corner-bracket br transition-opacity duration-200 group-hover:opacity-90" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/common/CyberCardSpotlight.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/common/CyberCardSpotlight.tsx src/components/common/CyberCardSpotlight.test.tsx
git commit -m "feat(ui): add reusable CyberCardSpotlight component"
```

---

### Task 3: Sidebar Tactical Clustering & Navigation Ergonomics

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Sidebar.test.tsx` (or add test if missing)

**Interfaces:**
- Consumes: `NavViewId`, `onSelectView`, `activeView`.
- Produces: Grouped sidebar rendering 4 operational clusters (`OPS`, `CREATIVE`, `INTEL`, `SYSTEM`) with glowing active indicator notches and quick search badge.

- [ ] **Step 1: Write test for clustered navigation items**

Verify that `Sidebar` properly groups items into the 4 clusters and exposes all 17 navigation views without missing IDs.

- [ ] **Step 2: Run test to verify failure/baseline**

Run: `npm test -- src/components/layout/Sidebar`
Expected: PASS or verify existing tests.

- [ ] **Step 3: Implement Tactical Clusters in `Sidebar.tsx`**

Reorganize navigation items into:
```tsx
export interface NavCluster {
  id: string;
  label: string;
  tag: string;
  items: Array<{
    icon: LucideIcon;
    label: string;
    id: NavViewId;
    tag: string;
  }>;
}

export const navClusters: NavCluster[] = [
  {
    id: "ops",
    label: "Command & Ops",
    tag: "OPS // 01",
    items: [
      { icon: LayoutDashboard, label: "Overview", id: "dashboard", tag: "MAIN" },
      { icon: Radio, label: "Control Room", id: "control_room", tag: "CTRL" },
      { icon: Waves, label: "Zbiornik Ops", id: "zbiornik_ops", tag: "ZB" },
      { icon: Cpu, label: "AI Agents", id: "agents", tag: "AGY" },
    ],
  },
  {
    id: "creative",
    label: "Creative Studio",
    tag: "CREATIVE // 02",
    items: [
      { icon: ImageIcon, label: "Image Studio", id: "image_studio", tag: "IMG" },
      { icon: Mic, label: "Sound Studio", id: "sound_studio", tag: "VOX" },
      { icon: Share2, label: "Social Media", id: "social_media", tag: "SOC" },
    ],
  },
  {
    id: "intel",
    label: "Vault & Intel",
    tag: "INTEL // 03",
    items: [
      { icon: Bot, label: "Chatbot AI", id: "chatbot", tag: "AI" },
      { icon: Users, label: "Persona Nexus", id: "nexus", tag: "RP" },
      { icon: Database, label: "Knowledge Vault", id: "knowledge", tag: "DATA" },
      { icon: Rss, label: "Cyber Intel Wire", id: "rss", tag: "02" },
    ],
  },
  {
    id: "system",
    label: "System & Health",
    tag: "SYSTEM // 04",
    items: [
      { icon: Container, label: "Docker Hub", id: "docker", tag: "DOCK" },
      { icon: Wrench, label: "Tools Matrix", id: "tools", tag: "DEV" },
      { icon: Activity, label: "Stats & Metrics", id: "stats", tag: "STAT" },
      { icon: ScrollText, label: "System Logs", id: "logs", tag: "LOGS" },
      { icon: Wifi, label: "API Health", id: "api", tag: "01" },
      { icon: Calendar, label: "Schedule", id: "calendar", tag: "03" },
    ],
  },
];
```
Add the glowing active notch indicator:
```tsx
{isActive && (
  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-green shadow-[0_0_10px_var(--color-neon-green)]" />
)}
```

- [ ] **Step 4: Run test and typecheck**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat(ui): organize sidebar navigation into tactical clusters"
```

---

### Task 4: Bento Dashboard & Widget Frame Uplift

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/widgets/SystemStats.tsx`
- Modify: `src/components/widgets/HermesStatusWidget.tsx`

**Interfaces:**
- Consumes: `<CyberCardSpotlight>` from Task 2.
- Produces: Enhanced bento widgets equipped with dynamic spotlights, tactical corner brackets, and standardized HUD headers.

- [ ] **Step 1: Check existing dashboard widget rendering in `page.tsx`**

Verify widget grid layout and styles.

- [ ] **Step 2: Update Widget Containers to use `CyberCardSpotlight`**

Wrap core dashboard widgets in `<CyberCardSpotlight>` or equip the widget cards with `.luminous-surface-l2` and standardized tactical header bars.

- [ ] **Step 3: Run test, typecheck, and lint**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/widgets/SystemStats.tsx src/components/widgets/HermesStatusWidget.tsx
git commit -m "feat(ui): apply luminous spotlight cards to dashboard bento widgets"
```

---

### Task 5: Chatbot & Control Room Streamline Polish

**Files:**
- Modify: `src/components/views/chatbot/HermesMessageBlock.tsx`
- Modify: `src/components/views/ControlRoomView.tsx`

**Interfaces:**
- Consumes: ACP streaming events and agent reasoning states.
- Produces: Streamlined Raycast-style thinking accordions, clear HITL risk badges, and polished execution telemetry.

- [ ] **Step 1: Inspect `HermesMessageBlock.tsx` reasoning display**

Check current implementation of reasoning trace and tool logs.

- [ ] **Step 2: Enhance Thinking Accordion and Tool Call Badges**

Refine the reasoning container with a soft glowing indicator and monospace status (`THINKING // ACTIVE`), and style tool calls with clean risk tags (`[LOW]`, `[MEDIUM]`, `[CRITICAL]`).

- [ ] **Step 3: Run tests and quality gates**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS with 0 errors and 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/views/chatbot/HermesMessageBlock.tsx src/components/views/ControlRoomView.tsx
git commit -m "feat(ui): streamline agent reasoning stream and HITL gate badges"
```

---

### Task 6: Final End-to-End Verification & Walkthrough

**Files:**
- Create: `walkthrough.md` in artifact brain.

- [ ] **Step 1: Full verification suite**

Run:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`

- [ ] **Step 2: Create Walkthrough summary**

Summarize all implemented UI modernization changes, design tokens, and components for the user.
