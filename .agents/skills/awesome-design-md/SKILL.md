---
name: awesome-design-md
description: Use when designing, styling, or generating web/mobile UI components, creating design systems, selecting visual aesthetic tokens (colors, typography, surfaces, spacing, border radii, shadows), or applying curated real-world brand design guidelines (e.g., Linear, Vercel, Stripe, Raycast, Supabase, Apple, Tailwind/CSS variables) using the Google Stitch DESIGN.md specification.
---

# awesome-design-md

## Overview

`DESIGN.md` is a plain-text design system document (standardized by Google Stitch) that AI coding and design agents read to generate consistent, aesthetically rigorous user interfaces without Figma exports or complex JSON schemas.

While `AGENTS.md` specifies **how to build** a project, `DESIGN.md` specifies **how the project should look and feel**. The `awesome-design-md` collection provides 74 real-world design systems extracted directly from leading developer and tech websites (Linear, Vercel, Stripe, Raycast, Supabase, Apple, Claude, etc.).

## When to Use

### Triggering Conditions & Symptoms
- Building or styling a new frontend component, deck, or page and needing a cohesive design language.
- User asks for a specific visual style (e.g., "make it look like Linear", "give it a Vercel aesthetic", "Stripe-like elegance", "Raycast dark chrome").
- Agent output looks like generic "AI-generated" UI (saturated purple gradients, round floating cards, uncontrolled border radii).
- Creating or updating a `DESIGN.md` design system file for an application.
- Translating brand design tokens into CSS Custom Properties (`:root`), Tailwind CSS v4 (`@theme`), or shadcn/ui components.

### When NOT to Use
- Pure backend, CLI, database schema, or infrastructure tasks with no frontend UI.
- Low-level logic, algorithmic code, or unit tests unrelated to design tokens or styling.

## Quick Reference: Top Brands by Aesthetic

For the complete catalog of all 74 brands, see [brands-catalog.md](./references/brands-catalog.md).

| Category | Recommended Brand | Key Canvas / Accent | Visual Atmosphere |
|---|---|---|---|
| **Dark Craft / Luxury** | `linear.app` | `#010102` / `#5e6ad2` | Deep near-black, lavender CTA, 4-step surface ladder, negative tracking |
| **Monochrome Precision** | `vercel` | `#000000` / `#ffffff` | Stark black-and-white, Geist font, geometric borders, ultra-minimal |
| **Warm Editorial** | `claude` | `#fbf9f4` / `#cc785c` | Tinted cream canvas, terracotta accent, editorial serif headlines |
| **High Voltage DevTools** | `supabase` | `#1c1c1c` / `#3ecf8e` | Dark emerald green, code-first layout, subtle grid lines |
| **Fintech Elegance** | `stripe` | `#0a2540` / `#635bff` | Slate navy, signature purple gradients, weight-300 light display type |
| **Cyber Chrome** | `raycast` | `#0e0e10` / `#ff6363` | Sleek dark chrome, keyboard-first, vibrant gradient accents |
| **Terminal / Local LLM** | `ollama` | `#ffffff` / `#111111` | Monochrome simplicity, monospace accents, minimal distraction |
| **Productivity Docs** | `notion` | `#ffffff` / `#2eaadc` | Warm minimalism, soft surfaces, serif headings |
| **Retro Web** | `dell-1996` | `#000000` / `#e91d2a` | Ribbons, chunky Helvetica-Black, vintage catalog grid |

## Core Pattern

### 1. Token & Section Structure of DESIGN.md

A standard DESIGN.md file follows the Google Stitch specification (see [stitch-spec.md](./references/stitch-spec.md)):
1. **YAML Frontmatter**: Structured tokens for `colors`, `typography`, `rounded`, `spacing`, `elevation`, and `components`.
2. **Markdown Body (9 Standard Sections)**:
   - § 1. Visual Theme & Atmosphere
   - § 2. Color Palette & Roles (Canvas, Surface ladder, Ink hierarchy, Accents)
   - § 3. Typography Rules (Display, Headline, Body, Mono with exact tracking)
   - § 4. Component Stylings (Buttons, Cards, Inputs, Badges, Navigation)
   - § 5. Layout Principles (Margins, Grids, Spacing)
   - § 6. Depth & Elevation (Border hairlines vs shadow system)
   - § 7. Do's and Don'ts (Strict visual guardrails)
   - § 8. Responsive Behavior (Breakpoints, font scaling)
   - § 9. Agent Prompt Guide (Copy-paste prompts for LLM code generation)

### 2. Inspecting & Applying a Design System

Use the included helper script `fetch-design.js`:

```bash
# List all 74 brands or filter by keyword
node scripts/fetch-design.js list dev

# Inspect brand tokens and aesthetic summary
node scripts/fetch-design.js info linear.app

# Export tokens directly as CSS variables
node scripts/fetch-design.js css linear.app

# Copy DESIGN.md directly to project root
node scripts/fetch-design.js apply linear.app
```

### 3. Mapping Tokens to Tailwind & CSS

When implementing UI based on a DESIGN.md:

#### CSS Variables (`globals.css`):
```css
:root {
  --color-canvas: #010102;
  --color-surface-1: #0f1011;
  --color-surface-2: #141516;
  --color-primary: #5e6ad2;
  --color-primary-hover: #828fff;
  --color-ink: #f7f8f8;
  --color-ink-muted: #8a8f98;
  --color-hairline: #23252a;
}
```

#### Tailwind CSS (v4 `@theme` or v3 `tailwind.config.js`):
```css
@theme {
  --color-canvas: var(--color-canvas);
  --color-surface-1: var(--color-surface-1);
  --color-surface-2: var(--color-surface-2);
  --color-primary: var(--color-primary);
  --color-ink: var(--color-ink);
  --color-hairline: var(--color-hairline);
  --radius-card: 12px;
  --radius-btn: 8px;
}
```

#### Component Implementation (React + Tailwind):
```tsx
// Follows DESIGN.md: button-primary (rounded-md, 8px 14px, lavender #5e6ad2)
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-3.5 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
    >
      {children}
    </button>
  );
}

// Follows DESIGN.md: feature-card (surface-1, hairline border, rounded-lg, 24px padding)
export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-hairline)] rounded-xl p-6 text-[var(--color-ink)]">
      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{description}</p>
    </div>
  );
}
```

## Common Mistakes & Anti-Patterns

| Mistake | Why it Fails | Fix |
|---|---|---|
| **Violating "Don'ts"** | Overriding brand rules (e.g. adding pill radius to Linear buttons) ruins brand identity | Check section 7 (Do's & Don'ts) before writing any CSS |
| **Pure black #000000 assumption** | Many dark systems use subtle tinted black (#010102 for Linear, #0a0a0a for Vercel, #121212 for Material) | Always use the exact `{colors.canvas}` hex token |
| **Accent overuse** | Scattering primary color across backgrounds, badges, and icons dilutes visual hierarchy | Reserve chromatic accents strictly for primary CTAs and active focus |
| **Ignoring tracking** | Standard web fonts without negative letter-spacing look loose on bold display headings | Apply `tracking-tight` or negative px tracking on headlines ≥24px |
| **Heavy drop shadows on dark mode** | Drop shadows are invisible or muddy on dark backgrounds | Use a 4-step surface ladder with 1px `hairline` borders instead of shadows |

## Validation

After creating or modifying a DESIGN.md file, validate syntax:
```bash
npx @google/design.md lint DESIGN.md
```
