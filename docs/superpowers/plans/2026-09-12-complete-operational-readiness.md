# Complete Operational Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all remaining functional gaps across DirtyNest: implement bidirectional real-time voice operations (STT/TTS) in Chat and Control Room, wire the Social Media deck to live automation schedules, connect the Knowledge Graph to live Qdrant vector similarity edges, and verify the hermetic Playwright E2E suite.

**Architecture:** 
- Frontend voice operations use Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) via [`src/lib/cyberSpeech.ts`](file:///c:/Users/coyot/workspace/dirty-test/src/lib/cyberSpeech.ts) with reactive waveform badges.
- Social media publishing wires `SocialMediaView` to `POST /api/social` and the sidecar `social_scheduler`.
- Knowledge Graph canvas dynamically consumes semantic edges from Qdrant vector points.
- Full quality gates (`pytest`, `vitest`, `tsc`, `eslint`, Playwright) executed before declaring goal completion.

**Tech Stack:** Next.js 16 (App Router, React 19), Tailwind CSS v4, Web Speech API, Canvas 2D / Three, FastAPI, Qdrant, Playwright, Vitest.

---

## Global Constraints
- TypeScript strict mode with 0 errors (`npm run typecheck`).
- ESLint strict mode with 0 errors and 0 warnings (`npm run lint` with `--max-warnings 0`).
- Strict HITL safety: all external publishing and mutating tool calls remain guarded by operator confirmation.
- No dummy/mock regressions: preserve all live database and ACP integrations.

---

### Task 1: CyberVoice Bidirectional Audio Engine (STT & TTS)
**Files:**
- Modify: `src/lib/cyberSpeech.ts`
- Test: `src/lib/cyberSpeech.test.ts`

- [ ] **Step 1: Write test for CyberVoice STT and TTS engine**
- [ ] **Step 2: Run test and verify missing STT functions**
- [ ] **Step 3: Implement `CyberSpeechRecognition` in `src/lib/cyberSpeech.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit `feat(voice): implement bidirectional cyberSpeech engine with speech recognition`**

---

### Task 2: Hands-Free Voice Operations in Chatbot & Control Room
**Files:**
- Modify: `src/components/views/ChatbotView.tsx`
- Create: `src/components/views/control_room/VoiceOpsBar.tsx`
- Modify: `src/components/views/ControlRoomView.tsx`
- Test: `src/components/views/control_room/VoiceOpsBar.test.tsx`

- [ ] **Step 1: Create failing component test for `VoiceOpsBar`**
- [ ] **Step 2: Implement `VoiceOpsBar.tsx` with live mic listening and TTS readback**
- [ ] **Step 3: Wire mic input button into `ChatbotView.tsx` input toolbar**
- [ ] **Step 4: Embed `VoiceOpsBar` into `ControlRoomView.tsx`**
- [ ] **Step 5: Run vitest and commit `feat(voice): wire hands-free voice operations into chat and control room`**

---

### Task 3: Social Media Deck Live Scheduling & CDP Runner Integration
**Files:**
- Modify: `src/components/views/SocialMediaView.tsx`
- Test: `src/components/views/social_media/EngagementRadar.test.tsx`

- [ ] **Step 1: Verify `SocialMediaView.tsx` fetches from `/api/social`**
- [ ] **Step 2: Connect real post trigger and queue actions**
- [ ] **Step 3: Run vitest test suite**
- [ ] **Step 4: Commit `feat(social): connect live scheduler actions to SocialMediaView`**

---

### Task 4: Interactive Knowledge Graph Live Semantic Edges
**Files:**
- Modify: `src/components/views/knowledge/KnowledgeGraphView.tsx` (or canvas component)
- Test: `src/app/api/knowledge/search/route.test.ts`

- [ ] **Step 1: Verify semantic edge query from Qdrant vectors**
- [ ] **Step 2: Wire real similarity edges to graph renderer**
- [ ] **Step 3: Verify with vitest test suite**
- [ ] **Step 4: Commit `feat(knowledge): connect live qdrant similarity edges to interactive graph`**

---

### Task 5: End-to-End Playwright Verification & Full QA Gates
**Files:**
- Run: `e2e/` Playwright test suite or add hermetic smoke tests
- Run: `npm run typecheck`, `npm run lint`, `npm test`, `pytest sidecar/tests/`

- [ ] **Step 1: Run sidecar pytest suite (138+ tests)**
- [ ] **Step 2: Run frontend vitest suite (177+ tests)**
- [ ] **Step 3: Run TypeScript typecheck (0 errors)**
- [ ] **Step 4: Run ESLint (0 errors, 0 warnings)**
- [ ] **Step 5: Run Playwright test suite**
- [ ] **Step 6: Push all commits to GitHub remote `origin/main`**
- [ ] **Step 7: Update documentation walkthrough and output `<!-- GOAL_COMPLETE -->`**
