# DirtyNest Command Center // System Documentation & Architecture Guide

**Version**: 0.01  
**Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4, SQLite (`sql.js`), Web Audio API  
**Design System**: Cyberpunk HUD // Matrix Green (`#00FF41`), Cyber Purple (`#BF40FF`), Neon Cyan (`#00F0FF`), Deep Abyss (`#07070B`)

---

## 1. Executive Overview

**DirtyNest** is a tactical command center, developer workspace, and AI operations hub. It merges system observability, multi-agent LLM orchestration, container management, knowledge retrieval, and productivity telemetry into a unified cyberpunk dashboard optimized for both desktop multi-monitor workflows and mobile devices.

---

## 2. System Architecture & Directory Map

```
dirty-test/
├── src/
│   ├── app/
│   │   ├── api/                    # RESTful Backend API Endpoints (SQLite-backed)
│   │   │   ├── todos/              # Todo & task state CRUD
│   │   │   ├── notes/              # Notes & research dossiers CRUD
│   │   │   ├── quick-links/        # Warp Gate navigation bookmarks
│   │   │   ├── calendar/           # Operations schedule & cron events
│   │   │   └── logs/               # Operations & security audit logs CRUD + stats
│   │   ├── layout.tsx              # Root HTML layout, viewport & theme metadata
│   │   ├── page.tsx                # Main tactical cockpit & modular layout manager
│   │   └── globals.css             # Cyberpunk theme variables, glassmorphism, scrollbars
│   │
│   ├── components/
│   │   ├── views/                  # Primary Workspaces (Decks)
│   │   │   ├── ChatbotView.tsx     # Deep Research LLM Chat & Grounding Core
│   │   │   ├── ControlRoomView.tsx # Autonomous Agent Cockpit (Hermes, Pi, Codex)
│   │   │   ├── AiAgentsView.tsx    # Swarm Task Matrix & Execution Monitor
│   │   │   ├── KnowledgeView.tsx   # Obsidian Vault & Karpathy Skills Matrix
│   │   │   ├── DockerView.tsx      # Container, Image & Compose Orchestrator
│   │   │   ├── ToolsView.tsx       # Developer utilities, regex, diff, encoder
│   │   │   ├── StatsView.tsx       # Hardware telemetry & Prometheus metrics
│   │   │   ├── LogsView.tsx        # Real-time Operations Log & Audit Telemetry Hub
│   │   │   └── SettingsView.tsx    # Swarm config, API keys & theme profiles
│   │   │
│   │   ├── widgets/                # Modular Dashboard & Tactical Deck Widgets
│   │   │   ├── SystemStats.tsx     # Live CPU, RAM, Disk, Network Gauges & Sparklines
│   │   │   ├── GitHubActivity.tsx  # Branch commits & pull request feed
│   │   │   ├── ApiHealth.tsx       # SQLite-Vec, Auth Proxy, Redis health probes
│   │   │   ├── RssFeed.tsx         # Cyber threat intel & CVE advisory feed
│   │   │   ├── Calendar.tsx        # Sprint, deployment & maintenance timeline
│   │   │   ├── TodoList.tsx        # Interactive task checklist
│   │   │   ├── Notes.tsx           # Obsidian-compatible quick notes & tags
│   │   │   ├── QuickLinks.tsx      # Bookmark launcher & quick warp routes
│   │   │   ├── FocusTimer.tsx      # Pomodoro focus interval timer & chimes
│   │   │   └── Clock.tsx           # Military UTC & Local time HUD
│   │   │
│   │   ├── layout/                 # Shell & Navigation Architecture
│   │   │   ├── Sidebar.tsx         # Collapsible desktop left rail navigation
│   │   │   ├── MobileNavBar.tsx    # Fixed bottom mobile HUD navigation bar
│   │   │   ├── MobileDrawer.tsx    # Slide-over full mobile navigation drawer
│   │   │   ├── MobileDeckSheet.tsx # Slide-up bottom sheet for tactical widgets
│   │   │   ├── RightPanel.tsx      # Tabbed right tactical widget sidebar (desktop)
│   │   │   ├── StatusBar.tsx       # Bottom telemetry & FPS/latency status bar
│   │   │   ├── CommandPalette.tsx  # Global Ctrl+K command modal & spotlight
│   │   │   └── ThemeMenu.tsx       # Colorway preset picker (Matrix, Cyber, Synth, Amber)
│   │   │
│   │   ├── modals/                 # Floating Overlays & Utilities
│   │   │   ├── DashboardCustomizeModal.tsx # Widget toggle & layout preset manager
│   │   │   ├── DevToolsModal.tsx           # Base64, UUID, Epoch, Hash & JSON tools
│   │   │   └── SettingsModal.tsx           # Quick settings modal
│   │   │
│   │   └── terminal/
│   │       └── TerminalDock.tsx    # Cyberpunk interactive CLI terminal (Hotkey: `)
│   │
│   └── lib/
│       ├── db/index.ts             # SQLite in-memory database with disk persistence (`system_logs`)
│       ├── logger.ts               # Client & server unified operations log dispatcher
│       ├── theme.ts                # Dynamic CSS variable injection for colorways
│       └── cyberAudio.ts           # Web Audio API ambient theta drone & sound effects
│
├── next.config.ts                  # Turbopack & allowed dev origins for tunnels
└── package.json                    # Project scripts & dependencies
```

---

## 3. Primary Workspaces (Decks)

| Deck | ID | Hotkey / Hash | Core Capabilities |
| :--- | :--- | :--- | :--- |
| **Overview** | `dashboard` | `#dashboard` | Modular grid with telemetry gauges, GitHub commits, API health, RSS feeds, calendar. |
| **Chatbot** | `chatbot` | `#chatbot` | Multi-phase deep research reasoning, multi-model selection (Gemini, Claude, GPT, DeepSeek, Local Ollama), Obsidian vector grounding, code attachments. |
| **Control Room** | `control_room` | `#control_room` | Hermes / Agent runtime harness selector, tool clearance gates, thought streams, approval toggles. |
| **AI Agents** | `agents` | `#agents` | Autonomous agent swarm matrix, CPU/memory per agent, task queues, success rates. |
| **Knowledge** | `knowledge` | `#knowledge` | Obsidian Vault integration, Karpathy AI Skills index, vector embeddings visualizer, Markdown preview. |
| **Docker Hub** | `docker` | `#docker` | Local daemon bridge, container lifecycle controls (Start/Stop/Restart), cached images, Compose stacks. |
| **Dev Tools** | `tools` | `#tools` | Base64 encoder/decoder, UUID generator, Unix epoch converter, JSON formatter, hash calculators. |
| **Stats Matrix** | `stats` | `#stats` | Prometheus-style charts, CPU breakdown per core, memory allocation, network I/O throughput. |
| **System Logs** | `logs` | `#logs` (G L) | Live real-time operations stream, dual table & raw monospace console, telemetry analytics, trace inspector, security ledger, JSON/CSV/TXT export. |
| **Settings** | `settings` | `#settings` | API key vault (Gemini, OpenAI, Anthropic, DeepSeek, GitHub), swarm parameters, scanline overlays. |

---

## 4. Modular Dashboard & Widget System

The dashboard is built as an **extensible widget grid**:

### One-Click Presets
- **Tactical SRE**: Telemetry + API Health + Docker Quick + Calendar.
- **AI Researcher**: Hermes Stream + Cost Tracker + RSS Feed + Telemetry.
- **Cyber Ops**: RSS Feed + API Probes + Hardware Telemetry + Thought Stream.
- **Docker Dev**: Docker Quick + GitHub Commits + Telemetry + API Health.
- **Minimalist**: Telemetry + API Probes.

### Customizing Widgets at Runtime
Users can click **`CUSTOMIZE`** in the top HUD on the Overview deck to toggle individual widgets, reorder them, or apply presets. Widget configurations are automatically persisted to local storage.

---

## 5. Mobile & Touch Engine

DirtyNest features a dedicated mobile architecture:

1. **Fixed Bottom Navigation Bar (`MobileNavBar.tsx`)**:
   - Touch-manipulated buttons for `Overview`, `Chatbot`, `Control`, `Docker`, `Tactical Deck`, and `More`.
   - Native safe-area inset padding (`pb-safe`) for notched displays.
2. **Tactical Deck Bottom Sheet (`MobileDeckSheet.tsx`)**:
   - Provides full access to `Tasks`, `Notes`, `Focus Timer`, and `Warp Gate` on mobile screens.
3. **Full Slide-Out Drawer (`MobileDrawer.tsx`)**:
   - Complete navigation tree, CLI trigger, drone audio toggle, and devtools.
4. **Cloudflare Tunnel Support (`next.config.ts`)**:
   - Configured with `allowedDevOrigins` to authorize `*.trycloudflare.com` and avoid 403 chunk blocks during remote mobile testing.

---

## 6. Operations Log & Audit Telemetry Engine (`LogsView.tsx`)

A full-spectrum operations hub covering real-time events, error diagnostics, and audit traces:

### Core Capabilities:
- **Dual Operations Stream**:
  - **Structured Cyber Table**: Expandable rows, millisecond latency badges, signature hashes, and severity chips (`INFO`, `SUCCESS`, `WARN`, `ERROR`, `AUDIT`, `DEBUG`).
  - **Cyber Monospace Console Pipe**: Raw streaming output with auto-scrolling, level color-coding, and rapid log dump.
- **Analytics & Metrics Deck**:
  - Throughput (operations/min), error/warning breakdown, subsystem activity charts, and latency percentiles.
- **Deep Trace Inspector**:
  - Split-pane interface to inspect structured JSON payloads, execution parameters, and stack contexts.
- **Security Audit Ledger**:
  - Filtered specifically for RBAC authorizations, security clearance issuances, token refreshes, and rate-limit violations.
- **Live Stream & Event Simulation**:
  - Pulsating active stream indicator with 2.5s polling, pause/resume toggle, and a **`SIMULATE EVENT`** button to inject live operational events.
- **Multi-Format Export**:
  - Instant export to `JSON`, `CSV`, or raw `TXT/LOG` format.

---

## 7. Backend API & Storage Architecture

All data widgets and operations logs connect to Next.js route handlers backed by an embedded SQLite database (`src/lib/db/index.ts`):

| Endpoint | Methods | Description |
| :--- | :--- | :--- |
| `/api/logs` | `GET`, `POST`, `DELETE` | Query logs with search/filters, ingest new logs, or purge log entries |
| `/api/logs/stats` | `GET` | Aggregated metrics: total operations, error rates, throughput, category distribution |
| `/api/todos` | `GET`, `POST` | List all tasks or create a new todo (auto-audited to `system_logs`) |
| `/api/todos/[id]` | `PATCH`, `DELETE` | Toggle completion status or delete task (auto-audited) |
| `/api/notes` | `GET`, `PUT` | Fetch all notes or save research notes (auto-audited) |
| `/api/quick-links` | `GET`, `POST` | List bookmarks or add new quick links |
| `/api/quick-links/[id]` | `DELETE` | Remove a bookmark |
| `/api/calendar` | `GET`, `POST` | List operations events or schedule a cron item |
| `/api/calendar/[id]` | `DELETE` | Cancel / remove a scheduled event |

---

## 7. Cyber Audio & Ambience Engine (`cyberAudio.ts`)

Built using the native Web Audio API (zero external sound files):
- **Click Sound**: High-frequency dual-oscillator click on user interaction.
- **Chime Sound**: 4-note ascending frequency chime for completed timer intervals and saves.
- **Theta Drone**: Dual harmonic oscillator with binaural detuning for focus states.

---

## 8. Developer Guide: Adding a New Module

### Adding a New Full View
1. Create `src/components/views/YourNewView.tsx`.
2. Add your view's ID to `NavViewId` in `src/components/layout/Sidebar.tsx`.
3. Add the conditional render in `src/app/page.tsx`:
   `{activeView === "your_view" && <YourNewView />}`
4. Add the navigation item in `Sidebar.tsx`, `MobileNavBar.tsx`, and `MobileDrawer.tsx`.

### Adding a New Dashboard Widget
1. Create `src/components/widgets/YourWidget.tsx`.
2. Add its metadata to `DEFAULT_WIDGETS` in `src/components/modals/DashboardCustomizeModal.tsx`.
3. Render it conditionally in `src/app/page.tsx`:
   `{customWidgets.your_widget && <YourWidget />}`

---

## 9. Build, Run & Development

```bash
# Install dependencies
npm install

# Run local development server (Turbopack)
npm run dev

# Run production build & verify TypeScript compilation
npm run build

# Start production server
npm run start
```
