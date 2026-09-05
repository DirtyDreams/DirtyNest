# Task 1 Brief: Surface Tokens & Luminous CSS Utilities

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/lib/theme.test.ts`

**Requirements:**
1. Implement the 4-tier surface elevation model in `src/app/globals.css`:
   - `.luminous-surface-l1`: `rgba(8, 9, 15, 0.88)` + `backdrop-filter: blur(16px)` + 1px border `rgba(255, 255, 255, 0.07)`
   - `.luminous-surface-l2`: `rgba(13, 14, 24, 0.65)` + `backdrop-filter: blur(12px)` + 1px border `rgba(255, 255, 255, 0.06)` + hover border `rgba(255, 255, 255, 0.12)`
   - `.spotlight-radial-glow`: radial gradient based on `--mouse-x` and `--mouse-y`
   - `.hud-corner-bracket`: micro tactical corner brackets with `.tl` and `.br` positions
   - `.tactical-badge`: monospace uppercase micro-badges (`font-mono text-[10px] tracking-widest uppercase`)
   - `.neon-rim-glow`: box-shadow rim glow utility
2. Ensure full compatibility with CSS variables from `src/lib/theme.ts` (`--bg-deep`, `--color-neon-*`).
3. Verify `src/lib/theme.test.ts` passes: `npm test -- src/lib/theme.test.ts`.
4. Verify TypeScript and ESLint: `npm run typecheck` and `npm run lint`.
5. Commit with message: `style: add luminous cyber-industrial tokens and elevation utilities`.

**Report file:** `.superpowers/sdd/2026-09-05-luminous-cyber-industrial-ui-plan/task-1-report.md`
