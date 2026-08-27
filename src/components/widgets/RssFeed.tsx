"use client";

import { useState } from "react";
import {
  Rss,
  Terminal,
  Cpu,
  Brain,
  Clock,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface FeedArticle {
  id: number;
  title: string;
  category: "AI" | "DEV" | "SYS";
  source: string;
  time: string;
  readTime: string;
  url: string;
  snippet: string;
  unread: boolean;
}

const mockFeedItems: FeedArticle[] = [
  {
    id: 1,
    title: "Next.js 16.3 Unveils Instant Edge Routing & Turbopack v2",
    category: "DEV",
    source: "Vercel Lab",
    time: "18m ago",
    readTime: "3 min read",
    url: "https://nextjs.org",
    snippet: "Major runtime optimizations yield 40% faster cold starts, zero-config streaming Server Actions, and integrated Turbopack bundler.",
    unread: true,
  },
  {
    id: 2,
    title: "Autonomous Agent Orchestration: Multi-Thread State Engines",
    category: "AI",
    source: "DeepMind Papers",
    time: "1h ago",
    readTime: "5 min read",
    url: "https://deepmind.google",
    snippet: "A new architectural framework for deterministic agent coordination, dynamic checkpointing, and tool sandboxing.",
    unread: true,
  },
  {
    id: 3,
    title: "The 2026 WebAssembly Hardware Acceleration Standard",
    category: "SYS",
    source: "Hacker News",
    time: "2h ago",
    readTime: "4 min read",
    url: "https://news.ycombinator.com",
    snippet: "Wasm Component Model 3.0 delivers direct SIMD & GPU execution pathways with zero boundary marshaling penalties.",
    unread: false,
  },
  {
    id: 4,
    title: "PostgreSQL 18 Release: Autonomous Vector Query Re-Indexing",
    category: "DEV",
    source: "pganalyze",
    time: "4h ago",
    readTime: "3 min read",
    url: "https://pganalyze.com",
    snippet: "Native HNSW indexes now auto-calibrate clustering parameters based on live operational query heatmaps and memory limits.",
    unread: false,
  },
  {
    id: 5,
    title: "Zero-Trust Mesh Networks for Self-Hosted Developer Stacks",
    category: "SYS",
    source: "WireGuard Weekly",
    time: "6h ago",
    readTime: "6 min read",
    url: "https://wireguard.com",
    snippet: "A practical blueprint for federated personal command centers with cryptographic mutual authentication and eBPF packet filters.",
    unread: false,
  },
  {
    id: 6,
    title: "Claude 3.7 Reasoning Core: Hybrid Thinking & Sub-agent Forking",
    category: "AI",
    source: "Anthropic Engineering",
    time: "7h ago",
    readTime: "4 min read",
    url: "https://anthropic.com",
    snippet: "Deep dive into dynamic budget allocation for extended test-time compute in complex multi-step coding architectures.",
    unread: true,
  },
  {
    id: 7,
    title: "Rust 2026 Edition: Compile-Time SIMD Intrinsics & Safe eBPF",
    category: "DEV",
    source: "Rust Core Team",
    time: "9h ago",
    readTime: "5 min read",
    url: "https://blog.rust-lang.org",
    snippet: "Zero-overhead abstractions for kernel-level byte filters and asynchronous zero-copy buffer pipelines.",
    unread: false,
  },
  {
    id: 8,
    title: "Hardware Security: Post-Quantum Enclaves in ARM Cortex-M85",
    category: "SYS",
    source: "IEEE Security",
    time: "12h ago",
    readTime: "4 min read",
    url: "https://ieee.org",
    snippet: "Lattice-based cryptographic primitives integrated directly into hardware root of trust microcontrollers.",
    unread: false,
  },
];

// Stonowana, elegancka paleta (Muted Slate / Lavender / Sage / Sky)
const DEPARTMENT_SPECS = {
  AI: {
    label: "AI CORE",
    accent: "#A78BFA", // Stonowana lawenda
    badgeBg: "rgba(167, 139, 250, 0.08)",
    badgeBorder: "rgba(167, 139, 250, 0.22)",
    cardBg: "bg-gradient-to-br from-[#13101E]/90 via-[#0D0B15]/90 to-[#07060B]/95",
    borderClass: "border-purple-500/20 hover:border-purple-400/40 hover:shadow-[0_4px_20px_rgba(167,139,250,0.08)]",
    glowLight: "rgba(167, 139, 250, 0.06)",
    icon: Brain,
  },
  DEV: {
    label: "DEV RUNTIME",
    accent: "#34D399", // Stonowana szałwia / mięta
    badgeBg: "rgba(52, 211, 153, 0.08)",
    badgeBorder: "rgba(52, 211, 153, 0.22)",
    cardBg: "bg-gradient-to-br from-[#0B1813]/90 via-[#08120E]/90 to-[#050A08]/95",
    borderClass: "border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_4px_20px_rgba(52,211,153,0.08)]",
    glowLight: "rgba(52, 211, 153, 0.06)",
    icon: Terminal,
  },
  SYS: {
    label: "SYSTEM & SEC",
    accent: "#38BDF8", // Stonowany błękit nieba
    badgeBg: "rgba(56, 189, 248, 0.08)",
    badgeBorder: "rgba(56, 189, 248, 0.22)",
    cardBg: "bg-gradient-to-br from-[#0B151F]/90 via-[#070F16]/90 to-[#04080D]/95",
    borderClass: "border-sky-500/20 hover:border-sky-400/40 hover:shadow-[0_4px_20px_rgba(56,189,248,0.08)]",
    glowLight: "rgba(56, 189, 248, 0.06)",
    icon: Cpu,
  },
};

export default function RssFeed() {
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [articles, setArticles] = useState<FeedArticle[]>(mockFeedItems);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleRead = (id: number, url: string) => {
    cyberAudio.play("click");
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
    window.open(url, "_blank");
  };

  const handleRefresh = () => {
    cyberAudio.play("warp");
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      cyberAudio.play("chime");
    }, 600);
  };

  const filtered = articles.filter(
    (a) => selectedCat === "ALL" || a.category === selectedCat
  );

  const countFor = (cat: string) => {
    if (cat === "ALL") return articles.length;
    return articles.filter((a) => a.category === cat).length;
  };

  return (
    <div className="cyber-card p-4 sm:p-6 relative flex flex-col gap-4 font-sans select-none bg-[#07080F]/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl">
      <div className="hud-corner hud-corner-tl opacity-40" />
      <div className="hud-corner hud-corner-tr opacity-40" />
      <div className="hud-corner hud-corner-bl opacity-40" />
      <div className="hud-corner hud-corner-br opacity-40" />

      {/* Widget Header with Subdued Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E2E8F0] shadow-sm">
            <Rss size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                INTELLIGENCE STREAM
              </h3>
              <span className="text-[10px] font-medium text-[#94A3B8] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                LIVE RSS
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Stonowana i czytelna telemetria: Lawenda (AI), Szałwia (Dev), Błękit (Systemy).
            </p>
          </div>
        </div>

        {/* Filter Pills with Counter Badges & Refresh Button */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
            {["ALL", "AI", "DEV", "SYS"].map((cat) => {
              const isActive = selectedCat === cat;
              const count = countFor(cat);

              let activeAccent = "#E2E8F0";
              if (cat === "AI") activeAccent = "#A78BFA";
              if (cat === "DEV") activeAccent = "#34D399";
              if (cat === "SYS") activeAccent = "#38BDF8";

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCat(cat);
                  }}
                  className="px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 font-medium text-[11px]"
                  style={{
                    background: isActive ? `${activeAccent}18` : "transparent",
                    color: isActive ? activeAccent : "#94A3B8",
                    border: isActive ? `1px solid ${activeAccent}35` : "1px solid transparent",
                  }}
                >
                  <span>{cat}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded-full font-mono"
                    style={{
                      background: isActive ? `${activeAccent}25` : "rgba(255,255,255,0.06)",
                      color: isActive ? "#FFFFFF" : "#64748B",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#9499B3] hover:text-white transition-all cursor-pointer shadow-sm ${
              isRefreshing ? "animate-spin text-slate-200" : "hover:scale-105 active:scale-95"
            }`}
            title="Refresh Feed"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Feed Grid with Subdued Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 overflow-y-auto pr-1 -mr-1">
        {filtered.map((item) => {
          const dept = DEPARTMENT_SPECS[item.category];
          const CategoryIcon = dept.icon;
          const accent = dept.accent;

          return (
            <article
              key={item.id}
              onClick={() => toggleRead(item.id, item.url)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group relative flex flex-col justify-between gap-3 ${dept.cardBg} border ${dept.borderClass} hover:-translate-y-0.5 active:translate-y-0 animate-slide-up-fade shadow-sm overflow-hidden`}
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: accent,
                backgroundImage: `radial-gradient(circle at 10% 20%, ${dept.glowLight} 0%, transparent 60%)`,
              }}
            >
              {/* Subtle Unread Indicator */}
              {item.unread && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-mono font-medium tracking-wider hidden group-hover:inline-block animate-fade-in"
                    style={{ color: accent }}
                  >
                    NEW
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 0 6px ${accent}`,
                    }}
                  />
                </div>
              )}

              <div className="space-y-2 relative z-10">
                {/* Meta Header */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase flex items-center gap-1.5"
                    style={{
                      color: accent,
                      backgroundColor: dept.badgeBg,
                      border: `1px solid ${dept.badgeBorder}`,
                    }}
                  >
                    <CategoryIcon size={11} />
                    <span>{item.category}</span>
                  </span>

                  <span className="text-[11px] text-[#CBD5E1] font-medium">
                    {item.source}
                  </span>

                  <span className="text-[10px] text-[#64748B]">
                    • {item.time}
                  </span>
                </div>

                {/* Article Title in Crisp Muted White */}
                <h4
                  className="text-sm font-semibold text-[#F1F5F9] transition-colors leading-snug tracking-tight group-hover:text-white"
                >
                  {item.title}
                </h4>

                {/* Subdued Description Snippet */}
                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 select-text font-normal">
                  {item.snippet}
                </p>
              </div>

              {/* Bottom Quick Link Info & Reading Time */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] font-mono text-[#64748B] group-hover:text-[#94A3B8] transition-colors relative z-10">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#64748B]" />
                  <span>{item.readTime}</span>
                </div>

                <span
                  className="flex items-center gap-1 font-medium transition-all group-hover:brightness-110"
                  style={{ color: accent }}
                >
                  <span>READ ARTICLE</span>
                  <ArrowUpRight
                    size={12}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Feed Status Summary Strip with Subdued Legend */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#64748B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
            <span className="text-[11px] text-[#A78BFA]">AI Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span className="text-[11px] text-[#34D399]">Dev Runtime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span className="text-[11px] text-[#38BDF8]">System & Sec</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#94A3B8] shrink-0 ml-auto text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          <span>FEED ENGINE STANDBY (60s)</span>
        </div>
      </div>
    </div>
  );
}
