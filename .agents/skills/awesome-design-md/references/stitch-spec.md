# Google Stitch DESIGN.md Specification

[DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview/) is a plain-text design system document standard introduced by Google Stitch. AI agents (Google Stitch, Claude, Antigravity, Cursor, etc.) read it to produce visually consistent, high-fidelity UI without needing Figma exports or JSON schemas.

## AGENTS.md vs DESIGN.md

| File | Read By | Governs |
|---|---|---|
| `AGENTS.md` | Coding agents | Build process, architecture, test commands, code rules |
| `DESIGN.md` | Design & UI agents | Visual aesthetics, tokens, layout, typography, components |

## Token Frontmatter (YAML)

A valid DESIGN.md begins with a YAML frontmatter block containing structured tokens:

```yaml
---
version: alpha
name: Brand-design-analysis
description: "High-level summary of aesthetic, atmosphere, density, and color accents."

colors:
  primary: "#5e6ad2"
  on-primary: "#ffffff"
  primary-hover: "#828fff"
  primary-focus: "#5e69d1"
  ink: "#f7f8f8"
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  canvas: "#010102"
  surface-1: "#0f1011"
  surface-2: "#141516"
  surface-3: "#18191a"
  hairline: "#23252a"
  semantic-success: "#27a644"
  semantic-error: "#e5484d"

typography:
  display-xl:
    fontFamily: Inter, sans-serif
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -2.5px
  headline:
    fontFamily: Inter, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  body:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.05px
  mono:
    fontFamily: "JetBrains Mono", monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 16px
  card-default:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
---
```

## Core Markdown Sections

1. **Visual Theme & Atmosphere**: Philosophy, lighting, density, core emotion.
2. **Color Palette & Roles**: Exact semantic roles for every token (canvas, surfaces, ink, accents).
3. **Typography Rules**: Display, headline, body, caption hierarchies with letter-spacing guidance.
4. **Component Stylings**: Explicit button, card, input, tab, nav, and badge styles.
5. **Layout Principles**: Grid structures, margins, whitespace rhythm.
6. **Depth & Elevation**: Border hairllines vs shadow systems (or shadowless surface ladders).
7. **Do's and Don'ts**: Explicit negative constraints (e.g., "Don't pill-round buttons", "Don't use pure white canvas").
8. **Responsive Behavior**: Breakpoints, mobile font scaling, navigation collapse strategies.
9. **Agent Prompt Guide**: Ready-to-use prompt snippets for directing agents.

## Validation & Linting

Verify token syntax and reference integrity:
```bash
npx @google/design.md lint DESIGN.md
```
