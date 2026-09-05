# Design Specification: Luminous Cyber-Industrial UI Modernization

**Date:** 2026-09-05  
**Topic:** UI / UX Modernization — Approach A (Luminous Cyber-Industrial)  
**Status:** Approved by User  
**Target Codebase:** DirtyNest (`src/`, Tailwind CSS v4, Next.js 16.3.2, React 19)

---

## 1. Overview & Vision

DirtyNest is a high-performance cyberpunk command center. This design elevates its aesthetic from standard neon borders and flat cards to a **Luminous Cyber-Industrial** interface inspired by Linear Dark, Raycast, and AAA sci-fi consoles (Star Citizen MFDs, Cyberpunk 2077 HUD 2.0). 

The goal is to maintain 100% of DirtyNest's distinct cyberpunk identity while vastly improving readability, visual hierarchy, information density, and ergonomic navigation.

---

## 2. Core Architecture & Design System Tokens

### 2.1 4-Tier Surface Elevation Hierarchy
Replace uniform 1px solid borders and flat card backgrounds with layered luminous glass surfaces:

| Elevation Level | Purpose | Background & Materials | Borders & Lighting |
|---|---|---|---|
| **L0 (Void Canvas)** | Root application backdrop | `#040407` to `#07070B` deep obsidian space + subtle micro-noise SVG grain | None |
| **L1 (Structural Panels)** | Sidebar, Top HUD bar, Bottom dock | `rgba(8, 9, 15, 0.88)` + `backdrop-blur-xl` | 1px gradient border: `linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))` |
| **L2 (Bento Cards)** | Dashboard widgets, Deck sub-panels | `rgba(13, 14, 24, 0.65)` + `backdrop-blur-md` | Mouse-following spotlight gradient (`CyberCardSpotlight`), delicate corner brackets |
| **L3 (Floating Elements)** | Modals, Popovers, Tooltips, Command Palette | `rgba(18, 20, 34, 0.95)` + `shadow-[0_16px_50px_rgba(0,0,0,0.8)]` | Crisp neon rim reflection (`border-white/10`) |

### 2.2 Tokens & CSS Variables
Add standard CSS helper classes in `globals.css` and ensure compatibility with `src/lib/theme.ts`:
- Spotlight radial coordinates: `--mouse-x`, `--mouse-y`.
- Restrained glow utility: `.neon-rim-glow` (`box-shadow: 0 0 1px 1px var(--color-neon-green-15)`).
- Tactical micro-typography: `.tactical-badge` (`font-mono text-[10px] tracking-widest uppercase`).

---

## 3. Navigation & Ergonomics (Sidebar Overhaul)

### 3.1 4 Tactical Clusters in `Sidebar.tsx`
Group the 17 navigation views into clear operational sections with micro-headers:

1. **⚡ Ops & Command** (`OPS // 01`):
   - `Overview` (`dashboard`)
   - `Control Room` (`control_room`)
   - `Zbiornik Ops` (`zbiornik_ops`)
   - `AI Agents Swarm` (`agents`)
2. **🎨 Creative & Media** (`CREATIVE // 02`):
   - `Image Studio` (`image_studio`)
   - `Sound Studio` (`sound_studio`)
   - `Social Media Hub` (`social_media`)
3. **🧠 Vault & Intelligence** (`INTEL // 03`):
   - `Chatbot AI` (`chatbot`)
   - `Persona Nexus` (`nexus`)
   - `Knowledge Vault` (`knowledge`)
   - `Cyber Intel Wire` (`rss`)
4. **🛠️ System & Telemetry** (`SYSTEM // 04`):
   - `Docker Matrix` (`docker`)
   - `Tools Matrix` (`tools`)
   - `Stats & Metrics` (`stats`)
   - `System Logs` (`logs`)
   - `API Health` (`api`)
   - `Schedule` (`calendar`)

### 3.2 Visual & Interactive Enhancements
- **Collapsed Rail (68px)**: Active item shows a high-visibility glowing vertical notch (`w-1 h-6 bg-neon-green rounded-r-full shadow-[0_0_8px_var(--color-neon-green)]`).
- **Expanded Drawer (240px)**: Section cluster separators with subtle monospace labels (`font-mono text-[9px] text-muted-foreground/60 tracking-wider`).
- **Active State**: Ambient linear gradient (`linear-gradient(90deg, rgba(0,255,65,0.12) 0%, transparent 100%)`).
- **Quick Switcher Trigger**: Prominent `⌘K` / `Ctrl+K` trigger pill in the sidebar header to open the Command Palette.

---

## 4. Bento Dashboard & Component Spotlights

### 4.1 Reusable `CyberCardSpotlight`
Create a high-performance wrapper component `src/components/common/CyberCardSpotlight.tsx`:
- Tracks local mouse position on mousemove without heavy re-renders (using CSS variables).
- Displays an ambient radial glow on hover (`radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(var(--spotlight-color), 0.08), transparent 80%)`).
- Renders tactical corner bracket accents (`border-t border-l border-neon-green/40 w-2 h-2`).

### 4.2 Standardized Widget Header & Metrics
- Status beacon pulse (green/amber/cyan/red).
- Monospace category indicator: `[TELEMETRY]`, `[SYSTEM]`, `[SECURITY]`.
- Action buttons styled with refined luminous ghost buttons (`bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]`).

---

## 5. Control Room, Chatbot & Terminal Modernization

### 5.1 Chatbot & Thought Streaming
- **Thinking Blocks**: Collapsible accordion with smooth glowing indicator (`THINKING // 1.8s`) and token counter.
- **Tool Call Badges**: High-clarity badge with risk level (`[LOW]` green, `[MEDIUM]` amber, `[CRITICAL]` red).
- **HITL Approvals**: Distinct high-visibility action bar for approval gates with hotkeys (`[Y] Approve`, `[N] Reject`).
- **Floating Capsule Composer**: Refined floating prompt bar at the bottom with model switcher badge and audio input button.

### 5.2 Terminal Dock Polish
- Tab switcher for terminal sessions (`BASH :8000`, `DOCKER LOGS`, `ACP TELEMETRY`).
- Minimized ticker pill in the bottom bar displaying live one-line status updates (`LAST LOG: [INFO] ACP heartbeat ok`).

---

## 6. Verification & Quality Safeguards

- **TypeScript Strict Compliance**: `npm run typecheck` must pass with 0 errors.
- **Linting Standard**: `npm run lint` must pass with 0 errors and 0 warnings.
- **Vitest Suites**: `npm test` must continue passing.
- **Theme Reactivity**: All dynamic styles must react instantly to theme changes from `theme.ts`.
