# Task 5 Brief: Chatbot & Control Room Streamline Polish

**Files:**
- Modify: `src/components/views/chatbot/HermesMessageBlock.tsx`
- Modify: `src/components/ui/assistant/ReasoningAccordion.tsx`
- Modify: `src/components/ui/assistant/ToolCallCard.tsx`
- Modify: `src/components/views/ControlRoomView.tsx`
- Test: Vitest suites

**Requirements:**
1. In `src/components/ui/assistant/ReasoningAccordion.tsx`:
   - Upgrade to Raycast / Linear modern styling with luminous surface elevation (`.luminous-surface-l2`).
   - Add pulsating status beacon dot, monospace status `THINKING // ACTIVE` or `COGNITIVE TRACE // RESOLVED`.
   - Subtle glowing border accent (`border-[#BF40FF]/30` when active).

2. In `src/components/ui/assistant/ToolCallCard.tsx`:
   - Add high-visibility risk level badges (`[LOW]`, `[MEDIUM]`, `[CRITICAL]`) or status badges with tactical badge styling.
   - Refine the container with `.luminous-surface-l2` and tactical HUD corner brackets (`.hud-corner-bracket tl`, `.hud-corner-bracket br`).

3. In `src/components/views/chatbot/HermesMessageBlock.tsx`:
   - Refine message bubbles: luminous surface elevation (`.luminous-surface-l1` / `.luminous-surface-l2`), refined borders with subtle glow.
   - Operator directives: sleek neon rim glow (`border-[#00FF41]/40` + subtle shadow).
   - Hermes Neural Synapse: tactical category badge `[HERMES ACP]` and active pulsating neural beacon.

4. In `src/components/views/ControlRoomView.tsx`:
   - Refine the active sessions and cognitive trace containers with `.luminous-surface-l2` and `.hud-corner-bracket` accents.
   - Standardize streaming thought trace with tactical monospace badge `[THOUGHT TRACE // ACTIVE]`.

5. Verification:
   - `npm test` passes
   - `npm run typecheck` (0 errors)
   - `npm run lint` (0 errors, 0 warnings)

6. Commit:
   `git add src/components/views/chatbot/HermesMessageBlock.tsx src/components/ui/assistant/ReasoningAccordion.tsx src/components/ui/assistant/ToolCallCard.tsx src/components/views/ControlRoomView.tsx`
   `git commit -m "feat(ui): streamline agent reasoning stream and HITL gate badges"`

**Report file:** `.superpowers/sdd/2026-09-05-luminous-cyber-industrial-ui-plan/task-5-report.md`
