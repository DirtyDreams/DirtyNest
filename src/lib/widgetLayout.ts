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
  // ROW 1: System Telemetry & Service Radar Matrix
  { id: "service_status", name: "Service Radar Status Matrix", category: "CORE", description: "High-density status & latency pills of all 8 core services", defaultSpan: "1-col" },
  { id: "system_stats", name: "System Telemetry & Resource Monitor", category: "CORE", description: "CPU, Memory, Disk, and eBPF Daemon load metrics", defaultSpan: "1-col" },

  // ROW 2: Threat Intel Stream
  { id: "rss_feed", name: "Cyber Threat & Intel RSS Feed", category: "CORE", description: "Real-time vulnerability advisories & CVE updates", defaultSpan: "2-col" },

  // ROW 3: AI Quotas & Security Audit
  { id: "ai_quota", name: "AI Model Quotas & Burndown", category: "AI & TOKENS", description: "Multi-LLM rate limits (TPM/RPM) and token cost telemetry", defaultSpan: "1-col" },
  { id: "agent_security_beacon", name: "Agent Security Beacon & Audit", category: "AI & TOKENS", description: "Zero-trust local audit logging for AI agent shell/file mutations", defaultSpan: "1-col" },

  // ROW 4: FinOps Cloud Spend & Git PR Velocity
  { id: "aws_cloud_burn", name: "FinOps Cloud Spend & Burn", category: "CLOUD & GIT", description: "AWS & GCP monthly forecast, circular burn rate & idle termination", defaultSpan: "1-col" },
  { id: "git_pr_velocity", name: "Pull Requests & Velocity", category: "CLOUD & GIT", description: "Active PR reviews, GitHub Actions check status & branch divergence", defaultSpan: "1-col" },

  // ROW 5: Quick Actions & Pipeline Queue
  { id: "quick_actions", name: "Tactical Action Hub & Quick Dispatch", category: "CORE", description: "1-click triggers for canary deploy, CVE scan, and cache purge", defaultSpan: "1-col" },
  { id: "pipeline_queue", name: "CI/CD & Swarm Workflow Queue", category: "CORE", description: "Live progress of running builds and background agent jobs", defaultSpan: "1-col" },

  // ROW 6: SQL Query Diagnostics & eBPF Kernel Observability
  { id: "sql_slow_queries", name: "SQL & Slow Query Forensics", category: "SECURITY & SRE", description: "P99 latency distribution & lock contention diagnostics", defaultSpan: "1-col" },
  { id: "ebpf_kernel_heat", name: "eBPF Kernel Observability", category: "SECURITY & SRE", description: "Real-time syscall probes and kernel probe CPU overhead", defaultSpan: "1-col" },

  // ROW 7: CVE Radar & Crypto Hash Verifier
  { id: "cve_radar", name: "CVE & Zero-Day Radar", category: "SECURITY & SRE", description: "Actionable vulnerability scoring with MTTR and 1-click patch actions", defaultSpan: "1-col" },
  { id: "crypto_hash_verifier", name: "Crypto Hash & Integrity Check", category: "SECURITY & SRE", description: "Live SHA-256 computation and digest verification probe", defaultSpan: "1-col" },

  // ROW 8: Global DNS & GitHub Trending
  { id: "global_dns_ssl", name: "Global DNS & SSL Radar", category: "SECURITY & SRE", description: "Multi-region DNS propagation latency & TLS certificate expiration", defaultSpan: "1-col" },
  { id: "github_trending", name: "GitHub Trending Repos", category: "CLOUD & GIT", description: "High-velocity open source repositories and daily star growth", defaultSpan: "1-col" },

  // ROW 9: API Health & GitHub Activity
  { id: "api_health", name: "API & Microservice Health Probes", category: "CORE", description: "Status of SQLite-Vec, Auth Proxy, and Redis mesh", defaultSpan: "1-col" },
  { id: "github_activity", name: "GitHub Repository Activity", category: "CLOUD & GIT", description: "Recent commits, PRs, and branch activities", defaultSpan: "1-col" },

  // ROW 10: Clipboard Manager & Global Timezones
  { id: "clipboard_manager", name: "Clipboard Buffer & Snippets", category: "UTILITIES & ZEN", description: "Fast code, token & URL scratchpad with pinning and 1-click copy", defaultSpan: "1-col" },
  { id: "global_timezones", name: "Global Command Timezones", category: "UTILITIES & ZEN", description: "Parallel live chronometers across Warsaw, London, SF, NYC, Tokyo", defaultSpan: "1-col" },

  // ROW 11: Cyber Soundscape & Bio-Rhythm Streak
  { id: "cyber_soundscape", name: "Cyber Focus Soundscape", category: "UTILITIES & ZEN", description: "Focus ambient generators: Cyberpunk Rain, Server Hum, Binaural", defaultSpan: "1-col" },
  { id: "dev_hydration", name: "Operator Bio-Rhythm & Streak", category: "UTILITIES & ZEN", description: "Espresso vs water hydration goals and Pomodoro deep work streak", defaultSpan: "1-col" },

  // ROW 12: Color Palette & Matrix Zen
  { id: "color_palette", name: "Cyber Palette Generator", category: "UTILITIES & ZEN", description: "Neon and obsidian harmonic palettes with 1-click CSS token export", defaultSpan: "1-col" },
  { id: "matrix_rain", name: "Matrix Digital Rain // Zen", category: "UTILITIES & ZEN", description: "Lightweight HTML5 2D canvas falling katakana digital rain", defaultSpan: "1-col" },

  // ROW 13: Operations & Deployment Calendar (Wide 2-col)
  { id: "calendar", name: "Operations & Deployment Calendar", category: "CORE", description: "Scheduled cron jobs, maintenance windows, and sprints", defaultSpan: "2-col" },
];

export const DEFAULT_LAYOUT: WidgetLayoutItem[] = ALL_WIDGETS_METADATA.map((w) => ({
  id: w.id,
  enabled: true,
  span: w.defaultSpan,
}));

export const LAYOUT_PRESETS: Record<string, { name: string; ids: string[] }> = {
  all: {
    name: "Full Tactical Workstation (All 24)",
    ids: ALL_WIDGETS_METADATA.map((w) => w.id),
  },
  sre: {
    name: "SRE & SecOps Operations",
    ids: ["service_status", "system_stats", "rss_feed", "cve_radar", "sql_slow_queries", "ebpf_kernel_heat", "global_dns_ssl", "crypto_hash_verifier", "api_health", "calendar"],
  },
  ai: {
    name: "AI Swarm & Neural Studio",
    ids: ["service_status", "system_stats", "ai_quota", "agent_security_beacon", "pipeline_queue", "clipboard_manager", "global_timezones", "calendar"],
  },
  devops: {
    name: "DevOps & Cloud Fleet",
    ids: ["service_status", "system_stats", "aws_cloud_burn", "git_pr_velocity", "github_trending", "global_dns_ssl", "pipeline_queue", "github_activity", "calendar"],
  },
  zen: {
    name: "Ergonomics & Focus Zen",
    ids: ["service_status", "system_stats", "cyber_soundscape", "matrix_rain", "dev_hydration", "color_palette", "clipboard_manager", "global_timezones"],
  },
  minimal: {
    name: "Clean Minimalist Core (Top 6)",
    ids: ["service_status", "system_stats", "rss_feed", "quick_actions", "ai_quota", "calendar"],
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
    const legacyMap: Record<string, boolean> = {};
    layout.forEach((item) => {
      legacyMap[item.id] = item.enabled;
    });
    localStorage.setItem("dirtynest_custom_widgets", JSON.stringify(legacyMap));
  } catch {
    // ignore
  }
}
