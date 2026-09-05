# Task 3 Brief: Sidebar Tactical Clustering & Navigation Ergonomics

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Test: Create or update unit test for Sidebar in `src/components/layout/Sidebar.test.tsx`

**Requirements:**
1. In `src/components/layout/Sidebar.tsx`, reorganize navigation items into 4 distinct operational clusters:
   - **Cluster 1: Command & Ops** (`OPS // 01`):
     - `Overview` (`dashboard`)
     - `Control Room` (`control_room`)
     - `Zbiornik Ops` (`zbiornik_ops`)
     - `AI Agents` (`agents`)
   - **Cluster 2: Creative Studio** (`CREATIVE // 02`):
     - `Image Studio` (`image_studio`)
     - `Sound Studio` (`sound_studio`)
     - `Social Media` (`social_media`)
   - **Cluster 3: Vault & Intel** (`INTEL // 03`):
     - `Chatbot AI` (`chatbot`)
     - `Persona Nexus` (`nexus`)
     - `Knowledge Vault` (`knowledge`)
     - `Cyber Intel Wire` (`rss`)
   - **Cluster 4: System & Health** (`SYSTEM // 04`):
     - `Docker Hub` (`docker`)
     - `Tools Matrix` (`tools`)
     - `Stats & Metrics` (`stats`)
     - `System Logs` (`logs`)
     - `API Health` (`api`)
     - `Schedule` (`calendar`)
2. Maintain `navItems` export compatibility so other files referencing `navItems` (e.g. `MobileNavBar`, `CommandPalette`, `page.tsx`) continue to function without breaking.
3. Visual & Ergonomic Enhancements:
   - Collapsed rail (68px) and expanded state (230px/240px) on hover with smooth transition.
   - Distinct glowing active indicator notch: a glowing vertical bar on the left edge (`w-1 h-5 rounded-r-full bg-neon-green shadow-[0_0_10px_var(--color-neon-green)]`).
   - Active item ambient gradient background: `linear-gradient(90deg, rgba(0,255,65,0.12) 0%, transparent 100%)`.
   - In expanded state, render subtle monospace cluster headers (`font-mono text-[9px] text-muted-foreground/60 tracking-wider`).
   - Quick Command trigger (`⌘K` / `Ctrl+K`) micro badge in the sidebar header to easily invoke the command palette.
4. Write unit tests in `src/components/layout/Sidebar.test.tsx` verifying:
   - All 17 navigation view IDs are present in the clusters.
   - Calling `onSelectView` when clicking an item triggers the correct view ID.
   - Active state renders correctly for the selected view.
5. Verification:
   - `npm test -- src/components/layout/Sidebar.test.tsx`
   - `npm test`
   - `npm run typecheck`
   - `npm run lint`
6. Commit: `git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx; git commit -m "feat(ui): organize sidebar navigation into tactical clusters"`

**Report file:** `.superpowers/sdd/2026-09-05-luminous-cyber-industrial-ui-plan/task-3-report.md`
