# DirtyNest Command Center // System Documentation & Architecture Guide

**Version**: 0.02  
**Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4, SQLite (`sql.js`), Web Audio API, Web Speech API  
**Design System**: Cyberpunk HUD // Matrix Green (`#00FF41`), Cyber Purple (`#BF40FF`), Neon Cyan (`#00F0FF`), Deep Abyss (`#07070B`), Amber Alert (`#FFB000`)

---

## 1. Executive Overview

**DirtyNest** is an enterprise-grade tactical command center, developer cockpit, and autonomous AI operations hub. It unifies system observability, multi-agent LLM orchestration (Hermes Master Brain & Swarm Matrix), container management, knowledge graphs, latent media studios, real-time cyber security logs, and developer utilities into a single high-performance cyberpunk interface optimized for desktop multi-monitor workflows, floating window overlays, and mobile touch devices.

---

## 2. System Architecture & Directory Map

```
dirty-test/
├── src/
│   ├── app/
│   │   ├── api/                          # RESTful Backend API Endpoints (SQLite-backed)
│   │   │   ├── todos/                    # Todo & task state CRUD
│   │   │   ├── notes/                    # Notes & research dossiers CRUD
│   │   │   ├── quick-links/              # Warp Gate navigation bookmarks
│   │   │   ├── calendar/                 # Operations schedule & cron events
│   │   │   ├── chat/                     # LLM Streaming & Hermes Agent endpoint
│   │   │   ├── focus/                    # Pomodoro focus session analytics
│   │   │   ├── import/                   # Configuration import/export hub
│   │   │   └── logs/                     # Operations & security audit logs CRUD + stats
│   │   ├── layout.tsx                    # Root HTML layout, viewport & theme metadata
│   │   ├── page.tsx                      # Main tactical cockpit & modular layout manager
│   │   └── globals.css                   # Cyberpunk theme variables, glassmorphism, scrollbars
│   │
│   ├── components/
│   │   ├── views/                        # Primary Tactical Workspaces (Decks)
│   │   │   ├── AiAgentsView.tsx          # Swarm Task Matrix & Execution Monitor
│   │   │   ├── ApiHealthView.tsx         # Dedicated API Health & Endpoint Probes Hub
│   │   │   ├── ChatbotView.tsx           # Deep Research LLM Chat & Hermes XML Parser
│   │   │   ├── ControlRoomView.tsx       # Autonomous AI Cockpit & HITL Gateways
│   │   │   ├── DockerView.tsx            # Container, Image & Compose Orchestrator
│   │   │   ├── ImageStudioView.tsx       # Latent Diffusion AI Image Synthesis Studio
│   │   │   ├── IntelFeedView.tsx         # Cyber Threat Intel & CVE Radar
│   │   │   ├── KnowledgeView.tsx         # 2D/3D Knowledge Graph & Obsidian Markdown Vault
│   │   │   ├── LogsView.tsx              # Real-time Operations Log & Audit Telemetry Hub
│   │   │   ├── PersonaNexusView.tsx      # Persona Avatar Studio & Viseme Speech Engine
│   │   │   ├── ScheduleView.tsx          # Operations Calendar & Cron Event Scheduler
│   │   │   ├── SettingsView.tsx          # Universal Multi-Tab Settings Engine
│   │   │   ├── SocialMediaView.tsx       # Multi-Network Social Command (X, Discord, Reddit)
│   │   │   ├── SoundStudioView.tsx       # Web Audio Synthesizer, Soundscape & FX Studio
│   │   │   ├── StatsView.tsx             # Hardware Telemetry & Prometheus Metrics
│   │   │   ├── ToolsView.tsx             # 15+ Cyber Developer Utility Suite
│   │   │   └── ... (view sub-modules)
│   │   │
│   │   ├── widgets/                      # 32+ Modular Tactical Bento Widgets
│   │   │   ├── HermesStatusWidget.tsx    # Hermes AI Brain live state & tool execution HUD
│   │   │   ├── SystemStats.tsx           # Live CPU, RAM, Disk, Network Gauges & Sparklines
│   │   │   ├── GitHubActivity.tsx        # Branch commits & PR feed
│   │   │   ├── ApiHealth.tsx             # Endpoint latency & health probes
│   │   │   ├── RssFeed.tsx               # Threat intel & CVE advisory feed
│   │   │   ├── Calendar.tsx              # Operations timeline widget
│   │   │   ├── TodoList.tsx              # Interactive task checklist
│   │   │   ├── Notes.tsx                 # Obsidian-compatible quick notes
│   │   │   ├── FocusTimer.tsx            # Pomodoro focus interval timer & chimes
│   │   │   ├── EbpfKernelHeatWidget.tsx  # eBPF Kernel CPU/Syscall thermal telemetry
│   │   │   ├── CveVulnerabilityRadar.tsx # Real-time vulnerability radar
│   │   │   ├── MatrixRainZenCanvas.tsx   # Matrix code rain focus canvas
│   │   │   └── ... (30+ tactical widgets)
│   │   │
│   │   ├── tools/                        # Interactive Cyber Developer Tools
│   │   │   ├── DiffViewer.tsx            # Side-by-side / inline syntax diff analyzer
│   │   │   ├── JwtDebugger.tsx           # JWT decoder, signature verifier & claim inspector
│   │   │   ├── CyberColorPaletteConverter.tsx # Cyberpunk color hex/rgb/hsl/oklch converter
│   │   │   ├── BpeTokenCounter.tsx       # Tokenizer & context window estimator
│   │   │   ├── ZodSchemaSynthesizer.tsx  # Interactive TypeScript/Zod schema generator
│   │   │   ├── CronBuilder.tsx           # Human-to-cron expression compiler
│   │   │   ├── RegexTester.tsx           # Real-time regex validator & flag tester
│   │   │   ├── EnvEditor.tsx             # .env parser, validator & secret masker
│   │   │   ├── UuidUlidGenerator.tsx     # UUID v4/v7 and ULID batch generator
│   │   │   ├── UnixEpochConverter.tsx    # Timestamp converter with timezone radar
│   │   │   ├── HashGenerator.tsx         # SHA-256, MD5, Keccak & cryptographic hashes
│   │   │   └── SqlFormatter.tsx          # SQL query sanitizer & beautifier
│   │   │
│   │   ├── desktop/                      # Cyber Window Management & Multi-tasking
│   │   │   └── CyberWindowManager.tsx    # Floating, draggable & resizable window stack
│   │   │
│   │   ├── layout/                       # Shell & Navigation Architecture
│   │   │   ├── Sidebar.tsx               # Collapsible desktop left rail navigation (16 Decks)
│   │   │   ├── MobileNavBar.tsx          # Fixed bottom mobile HUD navigation bar
│   │   │   ├── MobileDrawer.tsx          # Slide-over full mobile navigation drawer
│   │   │   ├── MobileDeckSheet.tsx       # Slide-up bottom sheet for tactical widgets
│   │   │   ├── RightPanel.tsx            # Tabbed right tactical widget sidebar (desktop)
│   │   │   ├── StatusBar.tsx             # Bottom telemetry & FPS/latency status bar
│   │   │   ├── CommandPalette.tsx        # Global Ctrl+K command modal & spotlight
│   │   │   └── ThemeMenu.tsx             # Colorway preset picker (Matrix, Cyber, Synth, Amber)
│   │   │
│   │   ├── modals/                       # Tactical Modals & Overlays
│   │   │   ├── DashboardCustomizeModal.tsx # Widget toggle & layout preset manager
│   │   │   ├── ThemeCustomizerModal.tsx  # Dynamic CSS color token customizer
│   │   │   ├── HermesQuickCommandModal.tsx # Rapid Hermes AI tool & task trigger
│   │   │   ├── DevToolsModal.tsx         # Rapid developer utilities overlay
│   │   │   └── AudioMixerModal.tsx       # Live cyber audio channel mixer
│   │   │
│   │   └── terminal/
│   │       ├── TerminalDock.tsx          # Cyberpunk interactive CLI terminal (Hotkey: `)
│   │       └── CliSessionPlayerModal.tsx # Asciinema-style CLI session recorder & playback
│   │
│   ├── types/
│   │   ├── paperclip.ts                  # Paperclip Company autonomous multi-agent schema
│   │   └── auth.ts                       # RBAC, user roles & API token interfaces
│   │
│   └── lib/
│       ├── db/index.ts                   # SQLite in-memory database with disk persistence
│       ├── logger.ts                     # Client & server unified operations log dispatcher
│       ├── cyberAudio.ts                 # Web Audio API ambient theta drone & sound effects
│       ├── cyberSpeech.ts                # Web Speech API synthesized audio & viseme stream
│       ├── theme.ts                      # Dynamic CSS variable injection for colorways
│       ├── aiModels.ts                   # Model registry (Gemini, Claude, GPT, DeepSeek, Local)
│       └── widgetLayout.ts               # Layout presets & grid persistence logic
│
├── next.config.ts                        # Turbopack & Cloudflare tunnel configuration
└── package.json                          # Dependencies & scripts
```

---

## 3. Primary Workspaces (Decks)

DirtyNest provides **16 specialized command workspaces**:

| Deck | ID | Hotkey / Route | Core Capabilities |
| :--- | :--- | :--- | :--- |
| **Overview** | `dashboard` | `#dashboard` | Dynamic Bento grid with 32+ widgets, telemetry gauges, GitHub commits, API health, RSS, calendar. |
| **Neural Chatbot** | `chatbot` | `#chatbot` | Multi-phase deep research reasoning, multi-model selection (Gemini, Claude, GPT, DeepSeek, Local Ollama), Hermes XML Tool-Call parser, code execution preview. |
| **Control Room** | `control_room` | `#control_room` | Hermes Master Brain AI Cockpit, MultiFeed Cyber Stream Grid, HITL (Human-in-the-Loop) Approval Modal, Thought Stream, clearance gates. |
| **AI Agents Swarm** | `agents` | `#agents` | Paperclip Company Autonomous Control Plane, Swarm DAG Pipeline modal, Agent Detail Drawer, CPU/Memory quotas, autonomous execution matrix. |
| **Knowledge Vault** | `knowledge` | `#knowledge` | Interactive 2D/3D Knowledge Graph Canvas, Cyber Markdown Viewer, Obsidian Vault integration, Karpathy AI Skills index, embeddings visualizer. |
| **Docker Hub** | `docker` | `#docker` | Local daemon bridge, container lifecycle controls (Start/Stop/Restart), cached images, Docker Compose Designer Modal, live Docker Logs Stream. |
| **Image Studio** | `image_studio` | `#image_studio` | Latent Diffusion Studio Modal, prompt synthesis, style presets (Cyberpunk, Anime, Retro, Photoreal), aspect ratio control, negative prompts. |
| **Sound Studio** | `sound_studio` | `#sound_studio` | Web Audio synthesizer, Theta wave ambient generator, audio FX generators, soundscape presets, interactive spectrum analyzer. |
| **Persona Nexus** | `nexus` | `#nexus` | Persona Viseme Avatar Studio, dynamic speech synthesis (`cyberSpeech.ts`), real-time mouth/eye viseme animations, AI personality switcher. |
| **Social Media Hub** | `social_media` | `#social_media` | Multi-network hub (X/Twitter, Discord, Telegram, LinkedIn, Reddit), live subscriber counters, engagement analytics, post scheduler. |
| **Threat Intel** | `intel` | `#intel` | Real-time CVE vulnerability radar, security advisory stream, CVSS score distribution, threat advisory detail drawer. |
| **Operations Schedule** | `schedule` | `#schedule` | Sprint timeline, automated cron job schedules, maintenance windows, recurring task execution triggers. |
| **API Health** | `api_health` | `#api_health` | Deep endpoint latency probes, SQLite-Vec / Redis / Auth proxy uptime, HTTP response status tracker, incident log. |
| **Dev Tools Suite** | `tools` | `#tools` | 15+ developer utilities: Diff Viewer, JWT Debugger, Cyber Color Palette Converter, BPE Tokenizer, Zod Synthesizer, Cron Builder, Regex Tester, Env Editor, UUID/ULID, SQL Formatter. |
| **Hardware Stats** | `stats` | `#stats` | Prometheus-style charts, CPU core breakdown, GPU memory allocation, eBPF Kernel Heat telemetry, Network I/O throughput. |
| **System Logs** | `logs` | `#logs` (G L) | Live real-time operations console, structured cyber table, latency percentiles, Log Histogram Bar Chart, security audit ledger, JSON/CSV/TXT export. |
| **Settings** | `settings` | `#settings` | Multi-tab settings for all 16 decks + Core Platform, Hermes Agent configuration, Cyber Audio Mixer, API key vault, theme customizer. |

---

## 4. Hermes Master Brain & Swarm Architecture

DirtyNest integrates **Hermes Agent** as the central autonomous engine:
1. **Global Hermes HUD**: Real-time status badge and execution indicator in the top header and bottom status bar.
2. **Hermes Status Widget**: High-density Bento tile displaying active memory context, tool execution counters, and LLM latency.
3. **XML Tool-Call Parser (`ChatbotView.tsx`)**: Transparent parsing of `<invoke_tool>`, `<thought>`, and `<execution_result>` tags with cyber UI badges and expandable JSON details.
4. **Paperclip Company Autonomous Control Plane (`PaperclipCompanyControlPlane.tsx`)**: High-level multi-agent enterprise hierarchy (CEO, Architect, SecOps, QA, SRE) with task delegation, budgeting, and audit verification.
5. **Swarm DAG Pipeline (`SwarmDagPipelineModal.tsx`)**: Visual Directed Acyclic Graph execution pipeline for multi-step agent workflows.

---

## 5. Knowledge Graph & Obsidian Engine (`KnowledgeView.tsx`)

1. **Interactive Knowledge Graph Canvas (`KnowledgeGraphCanvas.tsx`)**: 
   - Force-directed 2D/3D node graph mapping concepts, skills, and documentation files.
   - Node search, cluster grouping, depth filtering, and click-to-preview dossier mechanics.
2. **Cyber Markdown Viewer (`CyberMarkdownViewer.tsx`)**:
   - Monospace cyberpunk styling, table formatting, syntax-highlighted code blocks, and copy-to-clipboard actions.
3. **Karpathy AI Skills Matrix**:
   - Categorized skills directory for prompt engineering, RLHF, multi-agent coordination, and fine-tuning.

---

## 6. Cyber Developer Tools Suite (`src/components/tools/`)

All utilities operate 100% clientside with zero data leaks:
- **Diff Viewer (`DiffViewer.tsx`)**: Side-by-side & unified diff viewer with addition/deletion line highlighting and syntax recognition.
- **JWT Debugger (`JwtDebugger.tsx`)**: Token decoder, signature validation status, expiry countdown, and header/payload JSON tree.
- **Cyber Color Converter (`CyberColorPaletteConverter.tsx`)**: Live conversion between HEX, RGB, HSL, and OKLCH, with cyberpunk accent palette generators.
- **BPE Token Counter (`BpeTokenCounter.tsx`)**: Calculates GPT/Claude/Gemini tokens, cost estimators, and context-window percentage bars.
- **Zod Schema Synthesizer (`ZodSchemaSynthesizer.tsx`)**: Converts raw JSON samples into typed TypeScript interfaces and Zod validation schemas.
- **Cron Builder (`CronBuilder.tsx`)**: Interactive GUI for generating, explaining, and testing 5-field/6-field cron expressions.

---

## 7. Cyber Audio & Ambience Engine (`cyberAudio.ts` & `cyberSpeech.ts`)

Built using the native Web Audio API & Web Speech API (zero external sound assets):
- **Click & Interaction Feedback**: High-frequency dual-oscillator micro-clicks on UI clicks and keypresses.
- **Interval Chimes**: 4-note ascending frequency chime for completed timers and saved states.
- **Theta Drone Engine**: Dual harmonic oscillator with binaural detuning for cognitive focus states.
- **Speech & Viseme Synthesis (`cyberSpeech.ts`)**: Browser-native text-to-speech engine coupled with real-time viseme mouth mapping for the Persona Nexus avatar.

---

## 8. Backend API & Storage Architecture

All data widgets and operations logs connect to Next.js route handlers backed by an embedded SQLite database (`src/lib/db/index.ts`):

| Endpoint | Methods | Description |
| :--- | :--- | :--- |
| `/api/chat` | `POST` | Multi-model chat & Hermes agent streaming endpoint |
| `/api/logs` | `GET`, `POST`, `DELETE` | Query logs with search/filters, ingest new logs, or purge log entries |
| `/api/logs/stats` | `GET` | Aggregated metrics: total operations, error rates, throughput, category distribution |
| `/api/todos` | `GET`, `POST` | List all tasks or create a new todo (auto-audited to `system_logs`) |
| `/api/todos/[id]` | `PATCH`, `DELETE` | Toggle completion status or delete task (auto-audited) |
| `/api/notes` | `GET`, `PUT` | Fetch all notes or save research notes (auto-audited) |
| `/api/quick-links` | `GET`, `POST` | List bookmarks or add new quick links |
| `/api/quick-links/[id]` | `DELETE` | Remove a bookmark |
| `/api/calendar` | `GET`, `POST` | List operations events or schedule a cron item |
| `/api/calendar/[id]` | `DELETE` | Cancel / remove a scheduled event |
| `/api/focus` | `GET`, `POST` | Log and retrieve Pomodoro focus session intervals |
| `/api/focus/total` | `GET` | Aggregate daily/weekly focus time metrics |
| `/api/import` | `POST` | Bulk import / restore system configuration |

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
