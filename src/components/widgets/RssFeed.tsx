"use client";

import { useState } from "react";
import {
  Rss,
  ExternalLink,
  Terminal,
  Cpu,
  Brain,
  Clock,
  RotateCcw,
  Globe,
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

// 1 Dedykowany Odcień na Dział / Department
const DEPARTMENT_SPECS = {
  AI: {
    label: "AI CORE",
    color: "#2DD4BF", // Teal
    icon: Brain,
  },
  DEV: {
    label: "DEV RUNTIME",
    color: "#10B981", // Emerald
    icon: Terminal,
  },
  SYS: {
    label: "SYSTEM & SEC",
    color: "#06B6D4", // Cyan
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
    <div className="cyber-card p-4 sm:p-6 relative flex flex-col gap-4 font-sans select-none bg-[#070913]/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Widget Header with Consistent Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.25)]">
            <Rss size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-mono">
                INTELLIGENCE STREAM
              </h3>
              <span className="text-[10px] font-bold text-[#2DD4BF] px-2 py-0.5 rounded-md bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 font-mono">
                LIVE RSS
              </span>
            </div>
            <p className="text-[11px] text-[#9499B3] mt-0.5">
              Jednolita telemetria z dedykowanym odcieniem dla każdego działu technicznego.
            </p>
          </div>
        </div>

        {/* Filter Pills with Counter Badges & Refresh Button */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-1 bg-black/50 rounded-xl p-1 border border-white/10 text-xs">
            {["ALL", "AI", "DEV", "SYS"].map((cat) => {
              const isActive = selectedCat === cat;
              const count = countFor(cat);

              let activeColor = "#2DD4BF";
              if (cat === "DEV") activeColor = "#10B981";
              if (cat === "SYS") activeColor = "#06B6D4";

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedCat(cat);
                  }}
                  className="px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
                  style={{
                    background: isActive ? `${activeColor}20` : "transparent",
                    color: isActive ? activeColor : "#9499B3",
                    border: isActive ? `1px solid ${activeColor}50` : "1px solid transparent",
                    boxShadow: isActive ? `0 0 12px ${activeColor}30` : "none",
                  }}
                >
                  <span>{cat}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded-full font-mono"
                    style={{
                      background: isActive ? `${activeColor}35` : "rgba(255,255,255,0.08)",
                      color: isActive ? "#FFFFFF" : "#717798",
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
              isRefreshing ? "animate-spin text-[#2DD4BF]" : "hover:scale-105 active:scale-95"
            }`}
            title="Refresh Feed"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2-Column Consistent Single-Shade-Per-Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 -mr-1">
        {filtered.map((item) => {
          const dept = DEPARTMENT_SPECS[item.category];
          const CategoryIcon = dept.icon;
          const color = dept.color;

          return (
            <article
              key={item.id}
              onClick={() => toggleRead(item.id, item.url)}
              className="p-4 rounded-2xl cursor-pointer transition-all duration-200 group relative flex flex-col justify-between gap-3 bg-[#090C18]/90 hover:bg-[#0E1326] border border-white/10 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 animate-slide-up-fade shadow-md"
              style={{
                borderLeftWidth: "3.5px",
                borderLeftColor: color,
              }}
            >
              {/* Unread Glow Pulse Dot */}
              {item.unread && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-mono font-bold tracking-wider hidden group-hover:inline-block animate-fade-in"
                    style={{ color: color }}
                  >
                    NEW
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-neural-pulse"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {/* Meta Header */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1.5 shadow-sm"
                    style={{
                      color: color,
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}35`,
                    }}
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

                {/* Article Title in Crisp High-Contrast White with Department Color on Hover */}
                <h4
                  className="text-sm font-bold text-slate-100 transition-colors leading-snug tracking-tight group-hover:text-white"
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
                  className="flex items-center gap-1 font-bold transition-all group-hover:brightness-125"
                  style={{ color: color }}
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

      {/* Feed Status Summary Strip with Department Legend */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
            <span className="text-[11px] text-[#2DD4BF]">AI (Teal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] text-[#10B981]">DEV (Emerald)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span className="text-[11px] text-[#06B6D4]">SYS (Cyan)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#2DD4BF] shrink-0 ml-auto font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-neural-pulse" />
          <span>SINGLE-SHADE DEPARTMENTS ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
