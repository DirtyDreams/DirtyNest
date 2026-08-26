# DirtyNest — System Scan Report

- **Generated:** 2026-08-26 (CEST) — by `dirtydaily`
- **Host:** DirtyNest (Windows 11 / MINGW64 MSYS)
- **Target:** `C:\Users\coyot\workspace\dirty-test` (git repo `DirtyNest`)
- **Overall health:** 🔴 **DEGRADED — build is broken**

---

## 1. Executive Summary

| Area | Status | Note |
|------|--------|------|
| Build (`next build`) | 🔴 FAIL | TypeScript type-check gate fails with 6 errors |
| Typecheck (`tsc --noEmit`) | 🔴 FAIL | 6 type errors in 2 files |
| Lint (`eslint`) | 🟠 FAIL | 77 errors + 254 warnings (331 total) |
| Git working tree | 🟠 DIRTY | 5 modified + 2 untracked (snapshot said "clean" — it is **not**) |
| Secrets / credentials | 🟢 OK | No hardcoded secrets found in `src` |
| Runtime / deps | 🟢 OK | `node_modules` present, lockfile in sync, Node v22 |

**Headline findings**
1. **The project does not build.** `npm run build` compiles but fails the TypeScript gate. Two committed-reachable files have real type errors (untracked `tools/` dir + an uncommitted `ToolsView.tsx`).
2. **`ToolsView.tsx` references state that does not exist** — `activePluginId` / `setActivePluginId` are used (6 sites) but never declared as `useState`, and a `<Radio>` element is rendered but `Radio` is not imported (should be `Radar`). This file is currently **modified and uncommitted**, i.e. it was left mid-edit by a previous session.
3. **`JwtDebugger.tsx`** (untracked new file) passes `parsed.signature` (typed `string | undefined`) where `string` is required — TS can't narrow the array index from a `parts.length === 3` check.
4. **Working tree is dirty with significant in-progress work** (5 modified files, 2 untracked dirs/files) — the session-start "clean" snapshot was stale. This looks like abandoned mid-task changes from an earlier agent run.
5. **Repo hygiene:** 10 PNG screenshots (~4.6 MB) are committed and **not** git-ignored; `data/` and `.next/` are correctly ignored.

---

## 2. Environment

| Item | Value |
|------|-------|
| OS | MINGW64_NT-10.0-26200 (Windows 11) |
| Host | DirtyNest |
| User | coyot |
| Shell | `/usr/bin/bash` (git-bash / MSYS) |
| Node | v22.23.2 (Hermes-managed: `AppData\Local\hermes\node`) |
| npm | 12.0.2 |
| Disk (C:) | 481 GB free / 953 GB total (50% used) |
| `package-lock.json` | present, in sync |

> Note: `node` resolves only via the Hermes-managed path on `PATH`. A bare `node -v` in a fresh shell can intermittently report "missing" if that path is not on `PATH`; verify `PATH` includes `AppData\Local\hermes\node` before running `next` commands in a plain terminal.

---

## 3. Git State

- **Branch:** `main` @ `b7c8803` — "feat(dashboard): enhance layout responsiveness…"
- **Remote:** `origin` → `https://github.com/DirtyDreams/DirtyNest.git`
- **Ahead/Behind vs `origin/main`:** 0 / 0 (branch is in sync with remote by commit)
- **Working tree:** ⚠️ **NOT clean** (session-start snapshot claimed clean — inaccurate)

### Uncommitted changes

| Status | Path | Risk |
|--------|------|------|
| M | `src/app/page.tsx` | modified view entry |
| M | `src/components/layout/StatusBar.tsx` | modified component |
| M | `src/components/views/ToolsView.tsx` | **contains build-breaking type errors** |
| M | `src/lib/cyberAudio.ts` | modified util |
| M | `src/stores/useAppStore.ts` | modified Zustand store |
| ?? | `src/components/modals/AudioMixerModal.tsx` | new untracked file |
| ?? | `src/components/tools/` | **new untracked dir — 10 tool components** |

**Implication:** the dirty tree is the source of the build break. `ToolsView.tsx` (modified) and the entire `tools/` directory (untracked, including `JwtDebugger.tsx`) introduce the 6 type errors. This pattern — several interrelated modified files plus a batch of new untracked files — is consistent with an earlier agent session that edited but never committed (or abandoned) a feature. Recommend reconciling before any further work to avoid mixing concerns.

---

## 4. Build & Code Quality

### 4.1 TypeScript — 🔴 FAIL

`npm run typecheck` (and the build's type gate) report **6 errors**:

| # | File | Line | Error |
|---|------|------|-------|
| 1 | `src/components/tools/JwtDebugger.tsx` | 176 | `TS2345`: `parsed.signature` is `string \| undefined`, not assignable to `string` |
| 2 | `src/components/views/ToolsView.tsx` | 378 | `TS2552`: Cannot find name `activePluginId` (used in `useMemo` deps) |
| 3 | `src/components/views/ToolsView.tsx` | 379 | `TS2552`: Cannot find name `activePluginId` |
| 4 | `src/components/views/ToolsView.tsx` | 680 | `TS2552`: Cannot find name `Radio` (component not imported) |
| 5 | `src/components/views/ToolsView.tsx` | 832 | `TS2552`: Cannot find name `activePluginId` |
| 6 | `src/components/views/ToolsView.tsx` | 838 | `TS2552`: Cannot find name `setActivePluginId` |

### 4.2 Build — 🔴 FAIL

`npm run build` → "Compiled successfully in 8.9s" then **"Failed to type check."** The type errors above block production builds. (If Next's built-in ESLint-on-build step is active — the default — the 77 lint errors below would independently fail the build as well.)

### 4.3 Lint (ESLint / `eslint-config-next` v16) — 🟠 331 problems

- **77 errors**, **254 warnings** (331 total)
- **2 errors are auto-fixable** (`--fix`)
- Breakdown by error rule:

| Count | Rule |
|-------|------|
| 44 | `@typescript-eslint/no-explicit-any` |
| 21 | `react-hooks/set-state-in-effect` |
| 5 | `react-hooks/purity` |
| 2 | `@typescript-eslint/no-require-imports` (in `api/focus/route.ts` — uses `require("fs")` instead of ESM `import`) |
| 2 | `react-hooks/exhaustive-deps` |
| 2 | `react/jsx-no-comment-textnodes` |
| 2 | `prefer-const` |
| 2 | `react/no-unescaped-entities` |
| 1 | `react/jsx-no-undef` |

- The **254 warnings** are dominated by `@typescript-eslint/no-unused-vars` (234) — mostly unused imports/vars across the large view files.
- Notable runtime smell: `api/focus/route.ts` uses `require()` for `fs`/`path` inside an async route (also flagged by `no-explicit-any` on the catch). Should be top-level ESM `import`.

---

## 5. Project Structure

- **Framework:** Next.js 16.3.2 (App Router) + React 19.2.8 + TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **State:** Zustand 5
- **DB:** `sql.js` (in-browser SQLite, marked `serverExternalPackages`)
- **AI SDK:** `@google/genai` (Gemini chat route at `api/chat`)
- **Source files:** 66 `.ts`/`.tsx`, **~20,515 LOC**
- **API routes:** 13 (`calendar`, `chat`, `focus`, `import`, `logs`, `notes`, `quick-links`, `todos`)
- **Largest components (>1k LOC):** `KnowledgeView.tsx` (1512), `ToolsView.tsx` (1494), `LogsView.tsx` (1213), `ChatbotView.tsx` (1158), `DockerView.tsx` (764), `SettingsView.tsx` (738), `app/page.tsx` (722)
- **Dependencies:** 7 runtime + 8 dev (lean, all explicit)

---

## 6. Repository Hygiene

- **Committed screenshots (not git-ignored):** `dashboard_clean.png`, `dashboard_polished.png`, `dashboard_screenshot.png`, `dashboard_v3.png`, `dashboard_wide.png`, `features_preview.png`, `scrolled_calendar.png`, `settings_open.png`, `tab_api_health.png`, `tab_system_monitor.png` — **10 files ≈ 4.6 MB**. These bloat the repo and should be moved to a `docs/` asset location or git-ignored (add `*.png` / a `screenshots/` rule to `.gitignore`).
- **Correctly ignored:** `/.next/`, `/data` (contains `dirtynest.db` runtime DB), `*.tsbuildinfo`, `next-env.d.ts`, `.env*`.
- **`CLAUDE.md`** is a 1-line redirect to `AGENTS.md` — fine.
- **`AGENTS.md`** carries the Next.js breaking-changes notice (auto-managed by `next dev`).

---

## 7. Security Observations

- ✅ **No hardcoded secrets/API keys** found in `src` (searched for `api_key|secret|token|password|bearer` assignment patterns → 0 hits).
- ✅ `.env*` is git-ignored.
- ⚠️ API key for Gemini is accepted via **request body** in `api/chat/route.ts` (`{ apiKey, messages, model }`). This is a runtime/design concern, not a repo leak — but it means callers must supply the key each request; ensure TLS in production.
- ⚠️ Several `catch (error: any)` blocks (e.g. `api/chat`, `api/focus`) log via `console.error` — acceptable, but the `any` typing is what trips `no-explicit-any`.

---

## 8. Prioritized Recommendations

### P0 — Unblock the build (required before any deploy)
1. **`ToolsView.tsx`:** add the missing state — `const [activePluginId, setActivePluginId] = useState(plugins[0]?.id ?? "");` near the other `useState` declarations (around line 254). Then either keep `activePlugin` derived from it or simplify.
2. **`ToolsView.tsx` line 680:** import `Radar` from `lucide-react` (or remove the icon) — `Radio` is not a valid import and appears to be a typo for the "NETWORK RADAR" tab.
3. **`JwtDebugger.tsx` line 176:** guard the possibly-undefined signature before passing to `copyToClipboard` (e.g. `parsed.signature ?? ""`), or type `signature` as `string` with a fallback when `parts[2]` is missing.

### P1 — Reconcile the dirty working tree
4. Decide the fate of the 5 modified + 2 untracked items. If they are the in-progress feature, **commit them together with a clear message once the build passes**; if abandoned, `git stash`/`git restore` to return to a known-good commit.

### P2 — Reduce lint noise
5. Run `npx eslint --fix` to auto-resolve the 2 fixable errors + many `prefer-const`/format issues.
6. Address the 44 `no-explicit-any` (replace with `unknown` + guards, or a typed interface) and the `require()`→`import` in `api/focus/route.ts`.
7. Prune the 234 unused-vars warnings (mostly unused imports in the large view files).

### P3 — Repo hygiene
8. Add screenshot assets to `.gitignore` (or move them out of the repo root) to shrink the working tree.

---

## 9. Verification Log (commands executed)

| Check | Command | Result |
|-------|---------|--------|
| Environment | `node -v`, `npm -v`, `uname -a`, `df -h` | Node 22.23.2, npm 12.0.2, 481G free |
| Git | `git status`, `git branch -vv`, `git log`, `git remote -v`, `rev-list --left-right --count` | in sync, but tree dirty (5M+2??) |
| Typecheck | `npm run typecheck` | 🔴 6 errors |
| Build | `npm run build` | 🔴 "Failed to type check" |
| Lint | `npm run lint` | 🟠 77 errors / 254 warnings (331) |
| Secrets | `search_files` (api_key/secret/token/password/bearer) | ✅ 0 hits |
| Console logs | `search_files` (`console.*`) | ✅ 0 hits |
| TODO/FIXME | `search_files` (`TODO|FIXME|HACK|BUG`) | ✅ 0 (only `DEBUG` log-level strings) |
| Structure | `find src`, `wc -l`, route count, dep count | 66 files / 20.5k LOC / 13 routes |

> Report generated by `dirtydaily`. No files were modified during this scan except this report.
