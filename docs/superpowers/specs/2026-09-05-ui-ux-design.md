# Design Specification: DirtyNest UI/UX — Cyber Craft & Luxury Cyber Chrome

**Date**: 2026-09-05  
**Topic**: UI/UX Architecture & Design System Standard (`DESIGN.md`)  
**Status**: Validated & Approved  
**Aesthetic Foundation**: Cyber Craft / Luxury Cyber Chrome (Raycast + Linear precision with DirtyNest Cyberpunk soul)

---

## 1. Executive Summary & Problem Statement

DirtyNest is a cyberpunk-themed, single-page operations hub and AI command center. While functionally rich (Control Room, ACP Agent Swarm, Docker manager, PKM Knowledge Vault, and Zbiornik HITL automation), the UI previously relied on saturated drop shadows, uncalibrated border glows, and inconsistent card background opacities.

This specification elevates DirtyNest into an institutional-grade developer operations interface following the **Google Stitch `DESIGN.md`** specification. It introduces a structured **4-step dark surface ladder**, **directional top-lit 1px hairlines**, **negative tracking on headings**, **monospace precision for metrics/telemetry**, and establishes seamless interoperability with the dynamic theme engine (`theme.ts`).

---

## 2. Architecture: Dual-Layer Token System

The architecture separates static geometric craft from dynamic brand voltage:

```
┌────────────────────────────────────────────────────────┐
│                   DIRTYNEST UI                         │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│  STATIC CRAFT LAYER       │ │  DYNAMIC VOLTAGE LAYER   │
│  (Google Stitch DESIGN.md)│ │  (src/lib/theme.ts)      │
│  - 4-step surface ladder  │ │  - Primary Accent Hex    │
│  - Ink contrast hierarchy │ │  - Secondary Accent Hex  │
│  - 1px hairline borders   │ │  - Accent Voltage Hex    │
│  - Negative tracking font │ │  - Dynamic RGB channels  │
│  - Radii & spatial rhythm │ │  - Active theme presets  │
└─────────────┬─────────────┘ └───────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │   globals.css (@theme inline)   │
           │   - CSS variables mapped to DOM │
           │   - Tailwind utility classes    │
           │   - shadcn/ui components        │
           └─────────────────────────────────┘
```

---

## 3. Token Specifications

### 3.1 Surface Ladder (Obsidian Glass)
* `--color-canvas`: `#07070B` — The cosmic void ground. Fixed at 100vh with subtle radial ambient gradients.
* `--color-surface-1`: `#0D0E17` (`rgba(13, 14, 23, 0.75)`) — Base deck container, navigation sidebar, terminal dock background.
* `--color-surface-2`: `#131522` (`rgba(19, 21, 34, 0.85)`) — Primary interactive card surface (`.cyber-card`), telemetry panels, message containers.
* `--color-surface-3`: `#1A1D2E` — Hover highlights, selected row states, active tabs, dropdown menus.
* `--color-surface-overlay`: `#1F2338` (`rgba(26, 29, 46, 0.95)`) — Modal dialogs, command palettes, floating tooltips.

### 3.2 Ink Hierarchy (Contrast & Legibility)
* `--color-ink-primary`: `#F1F3F9` (17.5:1 AAA contrast) — Display titles, user prompts, key metrics.
* `--color-ink-secondary`: `#9499B3` (6.8:1 AA contrast) — Explanatory text, agent summaries, inactive tabs.
* `--color-ink-muted`: `#5A5E78` (3.5:1 contrast) — Timestamps, hotkey badges, metadata labels.
* `--color-ink-faint`: `#35384B` (2.1:1 contrast) — Disabled controls, subtle grid lines, hairline dividers.

### 3.3 Hairline Borders & Edge Lighting
* `--color-hairline`: `rgba(255, 255, 255, 0.08)` — Standard component borders.
* `--color-hairline-hover`: `rgba(255, 255, 255, 0.16)` — Hover state borders.
* `--hairline-top`: `inset 0 1px 0 0 rgba(255, 255, 255, 0.10)` — Top directional light reflection simulating physical edge precision.
* `--color-hairline-accent`: `color-mix(in srgb, var(--color-primary) 30%, transparent)` — Active focus borders.

### 3.4 Dynamic Voltage Layer (Theme Presets)
* `--color-primary`: Injected dynamically from active theme preset (`#00FF41` for Matrix Core, `#FFE600` for Night City, `#FF1493` for Synthwave, etc.).
* `--color-secondary`: Injected dynamically (`#BF40FF`, `#FF0055`, `#9D00FF`, etc.).
* `--color-accent`: Injected dynamically (`#00F0FF`, etc.).
* `--color-destructive`: `#FF2A6D` (Neon Red) — HITL critical gates, abort signals, deletion triggers.
* `--color-warning`: `#FFB800` (Cyber Amber) — Rate-limits, pending approvals, resource warnings.

---

## 4. Typography & Geometry Standards

### 4.1 Typography Scale & Letter Spacing
* **Display (`text-2xl` to `text-3xl`, 28-32px)**: Bold (700), `letter-spacing: -0.03em` (`tracking-tight`), line-height `1.2`. Used for deck headers and prominent hero stats.
* **Headline (`text-lg` to `text-xl`, 18-20px)**: SemiBold (600), `letter-spacing: -0.02em`, line-height `1.3`. Used for widget titles, modal headers, card section titles.
* **Subhead (`text-sm` to `text-base`, 14-15px)**: Medium (500), `letter-spacing: -0.01em`, line-height `1.4`. Group titles, active items, user names.
* **Body (`text-xs` to `text-sm`, 13-14px)**: Regular (400), `letter-spacing: normal`, line-height `1.5`. Chat messages, agent reasoning notes, vault descriptions.
* **Mono Metrics (`font-mono text-xs`, 12-13px)**: JetBrains Mono / Geist Mono, tabular figures, line-height `1.4`. CPU/RAM counters, port numbers, Docker container IDs, timestamps.
* **Micro Badge (`font-mono text-[10px]`, 10-11px)**: SemiBold (600), `tracking-wider uppercase`. Status badges (`ONLINE`, `CRITICAL`, `HITL`).

### 4.2 Border Radii & Geometry
* Decks & Window Frames: `16px` (`rounded-2xl`)
* Cards (`.cyber-card`) & Tables: `12px` (`rounded-xl`)
* Buttons, Inputs, Dropdowns: `8px` (`rounded-lg`)
* Badges, Chips, Tooltips: `6px` (`rounded-md`)
* Status Indicators, Avatars: `9999px` (`rounded-full`)

---

## 5. Component Patterns & Elevation

### 5.1 `.cyber-card`
Upgraded from muddy opacity to top-lit obsidian glass:
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

### 5.2 Button System
1. **Primary Action**:
   - `background: var(--color-primary)`
   - `color: #07070B`
   - `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.25)`
   - Hover: brightness 1.08, active: scale 0.98.
2. **Secondary / Neutral**:
   - `background: var(--color-surface-2)`
   - `border: 1px solid var(--color-hairline)`
   - `color: var(--color-ink-primary)`
   - Hover: `background: var(--color-surface-3)`, `border: rgba(255, 255, 255, 0.18)`.
3. **Destructive / HITL Critical**:
   - `background: rgba(255, 42, 109, 0.12)`
   - `border: 1px solid rgba(255, 42, 109, 0.32)`
   - `color: #FF2A6D`
   - Hover: `background: rgba(255, 42, 109, 0.22)`.

### 5.3 Input Fields
* Background: `var(--color-surface-1)`
* Border: `1px solid var(--color-hairline)`
* Focus: `border-color: var(--color-primary)`, ring 1px `var(--color-primary)` without blur
* Text: `var(--color-ink-primary)`, placeholder: `var(--color-ink-muted)`

---

## 6. Implementation & Verification Plan

### 6.1 Files Modified
1. `DESIGN.md` [NEW] — Canonical Google Stitch specification file at repo root.
2. `src/app/globals.css` [MODIFY] — Expose 4-step surface ladder, ink contrast tokens, hairline borders, and map to Tailwind v4 `@theme inline`.
3. `src/lib/theme.ts` [MODIFY] — Ensure `generateThemeCss` cleanly drives dynamic accents and binds to the semantic variable layer.

### 6.2 QA Gates
* Automated Linting: `npm run lint` (0 errors, 0 warnings)
* Type Checking: `npm run typecheck` (0 errors)
* Unit Testing: `npm test` (vitest orchestrator test suite)
