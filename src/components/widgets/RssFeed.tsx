"use client";

import { useState } from "react";
import {
  Rss,
  ExternalLink,
  Sparkles,
  Terminal,
  Cpu,
  Brain,
  Clock,
  RotateCcw,
  CheckCircle2,
  Globe,
  ArrowUpRight,
  Shield,
  Layers,
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

const CATEGORY_PALETTES = {
  AI: {
    name: "AI & Neural Core",
    cardBg: "bg-gradient-to-br from-[#1A1033]/90 via-[#100B22]/90 to-[#090714]/95",
    border: "border-purple-500/30",
    hoverBorder: "hover:border-purple-400 hover:shadow-[0_0_25px_rgba(191,64,255,0.2)]",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-[#D8B4FE]",
    badgeBorder: "border-purple-500/40",
    glowColor: "#BF40FF",
    titleHover: "group-hover:text-purple-300",
    icon: Brain,
    accentGlow: "rgba(191,64,255,0.4)",
  },
  DEV: {
    name: "Dev & Frameworks",
    cardBg: "bg-gradient-to-br from-[#0B2516]/90 via-[#06180E]/90 to-[#040E08]/95",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(0,255,65,0.2)]",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-[#6EE7B7]",
    badgeBorder: "border-emerald-500/40",
    glowColor: "#00FF41",
    titleHover: "group-hover:text-emerald-300",
    icon: Terminal,
    accentGlow: "rgba(0,255,65,0.4)",
  },
  SYS: {
    name: "Systems & Security",
    cardBg: "bg-gradient-to-br from-[#092238]/90 via-[#061625]/90 to-[#030D17]/95",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-[#7DD3FC]",
    badgeBorder: "border-cyan-500/40",
    glowColor: "#00F0FF",
    titleHover: "group-hover:text-cyan-300",
    icon: Cpu,
    accentGlow: "rgba(0,240,255,0.4)",
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
    <div className="cyber-card p-4 sm:p-6 relative flex flex-col gap-4 font-sans select-none bg-[#070913]/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Widget Header with Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)]">
            <Rss size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-mono">
                INTELLIGENCE STREAM
              </h3>
              <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded-md bg-[#00FF41]/10 border border-[#00FF41]/30 font-mono">
                LIVE RSS
              </span>
            </div>
            <p className="text-[11px] text-[#9499B3] mt-0.5">
              Multi-shade categorized telemetry across AI, developer runtimes, and system security.
            </p>
          </div>
        </div>

        {/* Filter Pills with Counter Badges & Refresh Button */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-1 bg-black/50 rounded-xl p-1 border border-white/10 text-xs">
            {["ALL", "AI", "DEV", "SYS"].map((cat) => {
              const isActive = selectedCat === cat;
              const count = countFor(cat);

              let activeCatClass = "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.2)]";
              if (cat === "AI") activeCatClass = "bg-[#BF40FF]/20 text-[#D8B4FE] border border-[#BF40FF]/40 shadow-[0_0_12px_rgba(191,64,255,0.2)]";
              if (cat === "SYS") activeCatClass = "bg-[#00F0FF]/20 text-[#7DD3FC] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]";

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCat(cat);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 font-bold text-[11px] ${
                    isActive ? activeCatClass : "text-[#9499B3] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-white/10 text-[#717798]"
                    }`}
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
              isRefreshing ? "animate-spin text-[#00FF41]" : "hover:scale-105 active:scale-95"
            }`}
            title="Refresh Feed"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2-Column Multi-Shade Responsive Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 -mr-1">
        {filtered.map((item) => {
          const palette = CATEGORY_PALETTES[item.category];
          const CategoryIcon = palette.icon;

          return (
            <article
              key={item.id}
              onClick={() => toggleRead(item.id, item.url)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group relative flex flex-col justify-between gap-3 ${palette.cardBg} border ${palette.border} ${palette.hoverBorder} hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 animate-slide-up-fade shadow-md`}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: palette.glowColor,
              }}
            >
              {/* Unread Glow Pulse Dot */}
              {item.unread && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold tracking-wider hidden group-hover:inline-block animate-fade-in text-white/90">
                    NEW
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-neural-pulse"
                    style={{
                      backgroundColor: palette.glowColor,
                      boxShadow: `0 0 10px ${palette.glowColor}`,
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {/* Meta Header */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1.5 shadow-sm ${palette.badgeBg} ${palette.badgeText} border ${palette.badgeBorder}`}
                  >
                    <CategoryIcon size={11} />
                    <span>{item.category}</span>
                  </span>

                  <span className="text-[11px] text-[#E2E8F0] font-semibold">
                    {item.source}
                  </span>

                  <span className="text-[10px] text-[#94A3B8]">
                    • {item.time}
                  </span>
                </div>

                {/* Article Title in Crisp High-Contrast White with Category Hover Glow */}
                <h4
                  className={`text-sm font-bold text-slate-100 ${palette.titleHover} transition-colors leading-snug tracking-tight`}
                >
                  {item.title}
                </h4>

                {/* High-Contrast Description Snippet */}
                <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-2 select-text font-normal">
                  {item.snippet}
                </p>
              </div>

              {/* Bottom Quick Link Info & Reading Time */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] font-mono text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#94A3B8]" />
                  <span>{item.readTime}</span>
                </div>

                <span
                  className={`flex items-center gap-1 font-bold ${palette.badgeText} group-hover:brightness-125 transition-all`}
                >
                  <span>READ ARTICLE</span>
                  <ArrowUpRight
                    size={13}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Feed Status Summary Strip with Multi-Shade Legend */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#BF40FF]" />
            <span className="text-[11px] text-[#D8B4FE]">AI Research</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
            <span className="text-[11px] text-[#6EE7B7]">Dev Runtimes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
            <span className="text-[11px] text-[#7DD3FC]">Systems & Sec</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#00FF41] shrink-0 ml-auto font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-neural-pulse" />
          <span>AUTO-POLL: 60s</span>
        </div>
      </div>
    </div>
  );
}
