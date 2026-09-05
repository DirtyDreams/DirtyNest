# Task 2 Brief: Reusable CyberCardSpotlight Component

**Files:**
- Create: `src/components/common/CyberCardSpotlight.tsx`
- Create: `src/components/common/CyberCardSpotlight.test.tsx`

**Requirements:**
1. Implement `<CyberCardSpotlight>` in `src/components/common/CyberCardSpotlight.tsx`:
   - Must be `"use client"` component.
   - Props interface: `CyberCardSpotlightProps extends React.HTMLAttributes<HTMLDivElement>` with optional:
     - `children: React.ReactNode`
     - `spotlightColor?: string` (default: `"rgba(0, 255, 65, 0.08)"`)
     - `showBrackets?: boolean` (default: `true`)
   - Tracks mouse coordinate locally on `onMouseMove` without component re-renders (sets CSS properties `--mouse-x` and `--mouse-y` directly on the card ref).
   - Card container has `.luminous-surface-l2`, `.relative`, `.rounded-xl`, `.transition-all`, and hover states.
   - Ambient hover spotlight rendered in a pseudo/child layer with `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color), transparent 60%)` transitioning on hover.
   - When `showBrackets` is true, renders tactical corner brackets (`.hud-corner-bracket.tl` and `.hud-corner-bracket.br`).
2. Write unit tests in `src/components/common/CyberCardSpotlight.test.tsx`:
   - Renders children.
   - Updates CSS custom properties on `mouseMove`.
   - Passes custom spotlightColor and toggles brackets.
3. Verify test: `npm test -- src/components/common/CyberCardSpotlight.test.tsx`.
4. Verify full quality gates: `npm test`, `npm run typecheck`, `npm run lint`.
5. Commit: `git add src/components/common/CyberCardSpotlight.tsx src/components/common/CyberCardSpotlight.test.tsx; git commit -m "feat(ui): add reusable CyberCardSpotlight component"`.

**Report file:** `.superpowers/sdd/2026-09-05-luminous-cyber-industrial-ui-plan/task-2-report.md`
