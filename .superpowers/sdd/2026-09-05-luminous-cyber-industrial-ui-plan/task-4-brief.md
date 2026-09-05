# Task 4 Brief: Bento Dashboard & Widget Frame Uplift

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/widgets/SystemStats.tsx`
- Modify: `src/components/widgets/HermesStatusWidget.tsx`
- Test: Vitest suites

**Requirements:**
1. In `src/app/page.tsx`:
   - Import and apply `CyberCardSpotlight` or modern `.luminous-surface-l2` and `.cyber-spotlight-card` classes to the main dashboard widgets and deck containers.
   - Enhance the dashboard header HUD bar (time/date, quick search trigger, status badges) with refined luminous glass styling (`luminous-surface-l1`) and clean border gradients.
   - Standardize deck transitions so navigating to views has smooth entrance animations (`animate-in fade-in-50 duration-200`).
2. In `src/components/widgets/SystemStats.tsx` and `src/components/widgets/HermesStatusWidget.tsx`:
   - Integrate `CyberCardSpotlight` or `.luminous-surface-l2` container with tactical corner brackets.
   - Standardize widget header with tactical badge (`[TELEMETRY]`, `[HERMES ACP]`), status beacon dot pulse, and monospace micro typography.
3. Verify that all existing unit tests pass (`npm test`).
4. Quality Gates:
   - `npm run typecheck` (0 errors)
   - `npm run lint` (0 errors, 0 warnings)
5. Commit: `git add src/app/page.tsx src/components/widgets/SystemStats.tsx src/components/widgets/HermesStatusWidget.tsx; git commit -m "feat(ui): apply luminous spotlight cards to dashboard bento widgets"`

**Report file:** `.superpowers/sdd/2026-09-05-luminous-cyber-industrial-ui-plan/task-4-report.md`
