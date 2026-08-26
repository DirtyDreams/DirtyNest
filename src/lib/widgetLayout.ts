export interface WidgetMetadata {
  id: string;
  name: string;
  category: "CORE" | "AI & TOKENS" | "SECURITY & SRE" | "CLOUD & GIT" | "UTILITIES & ZEN";
  description: string;
  defaultSpan: "1-col" | "2-col";
}

export interface WidgetLayoutItem {
  id: string;
  enabled: boolean;
  span: "1-col" | "2-col";
}

export const ALL_WIDGETS_METADATA: WidgetMetadata[] = [
  // CORE
  { id: "clock", name: "Cyber Chrono Clock", category: "CORE", description: "POSIX time, Warsaw GMT+1 & UTC-0 clocks", defaultSpan: "1-col" },
  { id: "system", name: "System Node Metrics", category: "CORE", description: "Node.js v20, Next.js Turbopack & RAM load", defaultSpan: "1-col" },
  { id: "api_health", name: "Mesh API Latency Radar", category: "CORE", description: "Gemini, HuggingFace, Supabase & AWS health", defaultSpan: "1-col" },
  { id: "network", name: "Network I/O Telemetry", category: "CORE", description: "Real-time ingress/egress bandwidth", defaultSpan: "1-col" },
  { id: "security", name: "Zero-Trust SecOps Sentinel", category: "CORE", description: "WAF, TLS 1.3, DDoS shield & audit events", defaultSpan: "1-col" },
  { id: "quick_links", name: "Quick Access Matrix", category: "CORE", description: "Fast launchers for console & telemetry", defaultSpan: "1-col" },
  { id: "notes", name: "Encrypted Scratchpad", category: "CORE", description: "Auto-saving persistent developer notes", defaultSpan: "1-col" },
  { id: "tasks", name: "Tactical Task Matrix", category: "CORE", description: "Priority-ranked backlog and sprint tasks", defaultSpan: "1-col" },
  { id: "logs", name: "Live Terminal Syslog", category: "CORE", description: "Structured real-time system event telemetry", defaultSpan: "1-col" },
  { id: "docker", name: "Docker Daemon Fleet", category: "CORE", description: "Containerized service status & resource load", defaultSpan: "1-col" },

  // AI & TOKENS
  { id: "ai_quota", name: "AI Rate Limits & Burndown", category: "AI & TOKENS", description: "Gemini 2.5, Claude 3.7 & GPT-4o TPM/RPM limits", defaultSpan: "1-col" },
  { id: "agent_beacon", name: "Agent Security Audit", category: "AI & TOKENS", description: "Zero-trust autonomous agent execution monitor", defaultSpan: "1-col" },

  // SECURITY & SRE
  { id: "sql_radar", name: "SQL Slow Query Radar", category: "SECURITY & SRE", description: "P95/P99 latency percentiles & slow query explain", defaultSpan: "1-col" },
  { id: "ebpf_heat", name: "eBPF Kernel Heat Probe", category: "SECURITY & SRE", description: "Real-time syscall frequency and kernel CPU load", defaultSpan: "1-col" },
  { id: "cve_radar", name: "CVE Vulnerability Feed", category: "SECURITY & SRE", description: "Active vulnerability tracker and 1-click patcher", defaultSpan: "1-col" },
  { id: "crypto_hash", name: "WebCrypto Hash Verifier", category: "SECURITY & SRE", description: "SHA-256 live computation and digest probe", defaultSpan: "1-col" },

  // CLOUD & GIT
  { id: "aws_burn", name: "Cloud FinOps Burn Rate", category: "CLOUD & GIT", description: "AWS/GCP monthly budget burndown & idle reaper", defaultSpan: "1-col" },
  { id: "git_velocity", name: "Git PR & CI Velocity", category: "CLOUD & GIT", description: "Active pull requests, CI checks & divergence", defaultSpan: "1-col" },
  { id: "dns_ssl", name: "Global DNS & SSL Monitor", category: "CLOUD & GIT", description: "TLS 1.3 cert expiration & 4-continent DNS latency", defaultSpan: "1-col" },
  { id: "github_trending", name: "GitHub Trending Repos", category: "CLOUD & GIT", description: "High-velocity open source repos & star tracker", defaultSpan: "1-col" },

  // UTILITIES & ZEN
  { id: "clipboard_mgr", name: "Clipboard Scratch Vault", category: "UTILITIES & ZEN", description: "Multi-entry code & token scratchpad with copy", defaultSpan: "1-col" },
  { id: "cyber_soundscape", name: "Focus Cyber Soundscape", category: "UTILITIES & ZEN", description: "Rain, Server Hum & 432Hz ambient audio generator", defaultSpan: "1-col" },
  { id: "palette_gen", name: "Cyber Palette Studio", category: "UTILITIES & ZEN", description: "Neon/vapor color generator with CSS variable copy", defaultSpan: "1-col" },
  { id: "matrix_zen", name: "Matrix Rain Zen Canvas", category: "UTILITIES & ZEN", description: "HTML5 2D green digital rain screensaver", defaultSpan: "1-col" },
  { id: "hydration_streak", name: "Hydration & Focus Streak", category: "UTILITIES & ZEN", description: "Water vs Espresso intake and Pomodoro streaks", defaultSpan: "1-col" },
  { id: "global_timezones", name: "Global Chronometer Radar", category: "UTILITIES & ZEN", description: "World clocks across Warsaw, London, SF, Tokyo", defaultSpan: "1-col" },
];

export const DEFAULT_LAYOUT: WidgetLayoutItem[] = ALL_WIDGETS_METADATA.map((w) => ({
  id: w.id,
  enabled: true,
  span: w.defaultSpan,
}));

export const LAYOUT_PRESETS: Record<string, { name: string; ids: string[] }> = {
  all: {
    name: "Full Tactical Workstation (All 26)",
    ids: ALL_WIDGETS_METADATA.map((w) => w.id),
  },
  sre: {
    name: "SRE & SecOps Operations",
    ids: ["security", "sql_radar", "ebpf_heat", "cve_radar", "crypto_hash", "dns_ssl", "api_health", "system", "logs", "docker"],
  },
  ai: {
    name: "AI Swarm & Neural Studio",
    ids: ["ai_quota", "agent_beacon", "system", "api_health", "notes", "tasks", "clipboard_mgr", "global_timezones"],
  },
  devops: {
    name: "DevOps & Cloud Fleet",
    ids: ["docker", "aws_burn", "git_velocity", "github_trending", "dns_ssl", "system", "logs", "tasks"],
  },
  zen: {
    name: "Ergonomics & Focus Zen",
    ids: ["cyber_soundscape", "matrix_zen", "hydration_streak", "palette_gen", "clock", "notes", "clipboard_mgr", "global_timezones"],
  },
  minimal: {
    name: "Clean Minimalist Core (Top 6)",
    ids: ["clock", "system", "tasks", "notes", "ai_quota", "quick_links"],
  },
};

const STORAGE_KEY = "dirtynest_widget_layout";

export function loadWidgetLayout(): WidgetLayoutItem[] {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: WidgetLayoutItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all registered widgets exist in the loaded layout
        const existingIds = new Set(parsed.map((item) => item.id));
        const missing = ALL_WIDGETS_METADATA.filter((w) => !existingIds.has(w.id)).map((w) => ({
          id: w.id,
          enabled: true,
          span: w.defaultSpan,
        }));
        return [...parsed, ...missing];
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_LAYOUT;
}

export function saveWidgetLayout(layout: WidgetLayoutItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    // Also sync with legacy map for backwards compatibility
    const legacyMap: Record<string, boolean> = {};
    layout.forEach((item) => {
      legacyMap[item.id] = item.enabled;
    });
    localStorage.setItem("dirtynest_custom_widgets", JSON.stringify(legacyMap));
  } catch {
    // ignore
  }
}
