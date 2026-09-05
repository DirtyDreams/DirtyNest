---
version: alpha
name: DirtyNest-design-system
description: "Institutional Cyber Craft & Luxury Cyber Chrome — Raycast and Linear dark craftsmanship infused with DirtyNest Cyberpunk soul."

colors:
  canvas: "#07070B"
  surface-1: "#0D0E17"
  surface-2: "#131522"
  surface-3: "#1A1D2E"
  surface-overlay: "#1F2338"
  primary: "#00FF41"
  on-primary: "#07070B"
  primary-hover: "#26ff5c"
  primary-focus: "#00FF41"
  secondary: "#BF40FF"
  accent: "#00F0FF"
  ink: "#F1F3F9"
  ink-muted: "#9499B3"
  ink-subtle: "#5A5E78"
  ink-faint: "#35384B"
  hairline: "rgba(255, 255, 255, 0.08)"
  hairline-hover: "rgba(255, 255, 255, 0.16)"
  semantic-success: "#00FF41"
  semantic-error: "#FF2A6D"
  semantic-warning: "#FFB800"
  semantic-info: "#00F0FF"

typography:
  display-xl:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.03em
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  subhead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.01em
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  mono:
    fontFamily: "JetBrains Mono, Menlo, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
  micro:
    fontFamily: "JetBrains Mono, Menlo, monospace"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.04em

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  section: 64px

elevation:
  level-1:
    background: "{colors.surface-1}"
    border: "1px solid {colors.hairline}"
  level-2:
    background: "{colors.surface-2}"
    border: "1px solid {colors.hairline}"
    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.10), 0 12px 32px -8px rgba(0, 0, 0, 0.65)"
  level-3:
    background: "{colors.surface-3}"
    border: "1px solid {colors.hairline-hover}"
    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 16px 40px -10px rgba(0, 0, 0, 0.75)"
  level-overlay:
    background: "{colors.surface-overlay}"
    border: "1px solid rgba(255, 255, 255, 0.15)"
    boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.subhead}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-destructive:
    backgroundColor: "rgba(255, 42, 109, 0.12)"
    textColor: "{colors.semantic-error}"
    border: "1px solid rgba(255, 42, 109, 0.32)"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card-cyber:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
    padding: "16px"
---

# DirtyNest Design System — Cyber Craft & Luxury Cyber Chrome

An institutional-grade dark interface standard combining the craftsmanship of Linear and Raycast with DirtyNest's cyberpunk soul.

---

## 1. Visual Theme & Atmosphere
DirtyNest is an operator's command console. Rather than chaotic, garish neon washes or muddy box-shadow glows, the aesthetic is anchored in **controlled physical precision**:
* **The Void Canvas**: A deep obsidian ground (`#07070B`) with subtle, surgical radial illumination.
* **Top-Lit Hairlines**: Cards and panels feature an inset 1px physical top highlight (`rgba(255, 255, 255, 0.10)`), giving components real architectural presence without heavy drop shadows.
* **Surgical Brand Voltage**: High-voltage neon green (`#00FF41`), cyber purple (`#BF40FF`), and cyan (`#00F0FF`) are reserved strictly for active execution states, agent cognition pills, and telemetry pulses.
* **Density with Restraint**: High information density without visual noise.

---

## 2. Color Palette & Roles

### 2.1 The 4-Tier Surface Ladder
1. **Canvas (`#07070B`)**: Base viewport ground. Never used for cards or buttons.
2. **Surface 1 (`#0D0E17`)**: Base deck container panels, sidebar shell, and terminal backdrop.
3. **Surface 2 (`#131522`)**: The workhorse card surface (`.cyber-card`), telemetry modules, chat bubbles.
4. **Surface 3 (`#1A1D2E`)**: Hover states, active row selections, active tabs.
5. **Surface Overlay (`#1F2338`)**: Modals, command palettes, context menus, tooltips.

### 2.2 Ink Hierarchy
* **Primary Ink (`#F1F3F9`)**: Main headlines, active labels, user input text. 17.5:1 AAA contrast.
* **Secondary Ink (`#9499B3`)**: Descriptive body copy, agent status messages, inactive tabs. 6.8:1 AA contrast.
* **Muted Ink (`#5A5E78`)**: Timestamps, shortcuts, telemetry units, secondary metrics.
* **Faint Ink (`#35384B`)**: Inactive borders, placeholder text, disabled actions.

### 2.3 Semantic Voltage
* **Success / Online (`#00FF41`)**: Live agent status, healthy services, approved actions.
* **Error / Critical (`#FF2A6D`)**: HITL critical gates, failed Docker containers, rate-limit halts.
* **Warning / Gate (`#FFB800`)**: Pending approvals, threshold cautions, degraded connections.
* **Info / Cognition (`#00F0FF`)**: Agent thinking logs, vector memory lookups, active stream tokens.

---

## 3. Typography Rules

### 3.1 Proportional vs Monospace Roles
* **Inter (`--font-sans`)**: All primary UI interaction, navigation headers, dialog text, and conversational chat text.
* **JetBrains Mono (`--font-mono`)**: Docker IDs, memory addresses, latency counters, telemetry graphs, and terminal outputs.

### 3.2 Negative Tracking Rules
* Display headers (≥ 28px): `letter-spacing: -0.03em` (`tracking-tight`).
* Headlines (18px – 20px): `letter-spacing: -0.02em`.
* Subheads (14px – 15px): `letter-spacing: -0.01em`.
* Micro Badges (10px – 11px): `letter-spacing: 0.04em; text-transform: uppercase`.

---

## 4. Component Stylings

### 4.1 `.cyber-card`
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

### 4.2 Buttons
* **Primary**: `bg-[#00FF41] text-[#07070B] font-semibold rounded-lg px-3.5 py-2 hover:brightness-105 active:scale-[0.98]`.
* **Secondary**: `bg-surface-2 border border-hairline text-ink rounded-lg px-3.5 py-2 hover:bg-surface-3 hover:border-white/20`.
* **Destructive**: `bg-red-500/15 border border-red-500/30 text-neon-red rounded-lg px-3.5 py-2 hover:bg-red-500/25`.

### 4.3 Telemetry Badges
* Monospace pill: `font-mono text-[11px] px-2 py-0.5 rounded-md border tracking-wider uppercase inline-flex items-center gap-1.5`.

---

## 5. Layout Principles
* **4px Spatial Rhythm**: Standard margins and paddings adhere strictly to multiples of 4 (`8px`, `12px`, `16px`, `24px`).
* **Deck Container Integrity**: Maximum viewport utilization with independent internal scrolling regions.
* **Visual Dividers**: Avoid thick or opaque lines; dividers use `1px solid rgba(255, 255, 255, 0.06)`.

---

## 6. Depth & Elevation
* **Layer 0 (Canvas)**: Background viewport.
* **Layer 1 (Panels)**: Surface-1 with 1px hairline border.
* **Layer 2 (Cards & Widgets)**: Surface-2 with top-lit edge highlight and soft ambient shadow.
* **Layer 3 (Overlays & Modals)**: Surface-Overlay with high blur (24px) and prominent edge reflection.

---

## 7. Do's and Don'ts

### Do's:
* **Do** use top-lit inset highlights (`inset 0 1px 0 0 rgba(255, 255, 255, 0.10)`) for card definition.
* **Do** apply negative tracking (`tracking-tight`) to headlines.
* **Do** use `font-mono` for all numerical telemetry, timestamps, and hash identifiers.
* **Do** keep chromatic neon green/purple/cyan accents for interactive feedback and live statuses.

### Don'ts:
* **Don't** use solid saturated neon colors for entire card or panel backgrounds.
* **Don't** use pure `#000000` black for cards — preserve the 4-step surface ladder.
* **Don't** use heavy, muddy multi-layered drop shadows.
* **Don't** use inconsistent border radii (cards must be 12px, inputs/buttons 8px, badges 6px).

---

## 8. Responsive Behavior
* **Desktop (≥ 1280px)**: Multi-column operator layout with active sidecar telemetry and docked command terminal.
* **Tablet / Medium (768px – 1279px)**: Collapsible sidebar, single or 2-column widget grid.
* **Mobile (< 768px)**: Bottom safe-area bar (`pb-safe`), swipeable deck navigation, full-width card containers.

---

## 9. Agent Prompt Guide
When generating new components or styling existing views:
> "Implement this component following DirtyNest's `DESIGN.md` Cyber Craft specification. Use `bg-[var(--color-surface-2)]`, border `border-[var(--color-hairline)]`, inset top-lit edge highlight, Inter typography with negative tracking on headlines, and JetBrains Mono for metrics and timestamps. Reserve neon primary accents strictly for active interactive states and live telemetry."
