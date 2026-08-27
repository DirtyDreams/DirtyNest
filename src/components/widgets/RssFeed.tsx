"use client";

import { useState } from "react";
import { Rss, ExternalLink, Sparkles, Terminal, Cpu, Brain, Shield, Layers } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface FeedArticle {
  id: number;
  title: string;
  category: "AI" | "DEV" | "SYS";
  source: string;
  time: string;
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
    url: "https://nextjs.org",
    snippet: "Major runtime optimizations yield 40% faster cold starts and zero-config streaming Server Actions.",
    unread: true,
  },
  {
    id: 2,
    title: "Autonomous Agent Orchestration: Multi-Thread State Engines",
    category: "AI",
    source: "DeepMind Papers",
    time: "1h ago",
    url: "https://deepmind.google",
    snippet: "New architectural framework for deterministic agent coordination across distributed tool protocols.",
    unread: true,
  },
  {
    id: 3,
    title: "The 2026 WebAssembly Hardware Acceleration Standard",
    category: "SYS",
    source: "Hacker News",
    time: "2h ago",
    url: "https://news.ycombinator.com",
    snippet: "Wasm Component Model 3.0 delivers direct SIMD & GPU execution pathways from client-side sandboxes.",
    unread: false,
  },
  {
    id: 4,
    title: "PostgreSQL 18 Release: Autonomous Vector Query Re-Indexing",
    category: "DEV",
    source: "pganalyze",
    time: "4h ago",
    url: "https://pganalyze.com",
    snippet: "Native HNSW indexes now auto-calibrate clustering parameters based on live operational query heatmaps.",
    unread: false,
  },
  {
    id: 5,
    title: "Zero-Trust Mesh Networks for Self-Hosted Developer Stacks",
    category: "SYS",
    source: "WireGuard Weekly",
    time: "6h ago",
    url: "https://wireguard.com",
    snippet: "A practical blueprint for federated personal command centers with cryptographic mutual authentication.",
    unread: false,
  },
  {
    id: 6,
    title: "Claude 3.7 Reasoning Core: Hybrid Thinking & Sub-agent Forking",
    category: "AI",
    source: "Anthropic Engineering",
    time: "7h ago",
    url: "https://anthropic.com",
    snippet: "Deep dive into dynamic budget allocation for extended test-time compute in complex multi-step coding.",
    unread: true,
  },
  {
    id: 7,
    title: "Rust 2026 Edition: Compile-Time SIMD Intrinsics & Safe eBPF",
    category: "DEV",
    source: "Rust Core Team",
    time: "9h ago",
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
    url: "https://ieee.org",
    snippet: "Lattice-based cryptographic primitives integrated directly into hardware root of trust microcontrollers.",
    unread: false,
  },
];

export default function RssFeed() {
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [articles, setArticles] = useState<FeedArticle[]>(mockFeedItems);

  const toggleRead = (id: number, url: string) => {
    cyberAudio.play("click");
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
    window.open(url, "_blank");
  };

  const filtered = articles.filter(
    (a) => selectedCat === "ALL" || a.category === selectedCat
  );

  return (
    <div className="cyber-card p-4 sm:p-5 relative flex flex-col gap-3.5 font-mono select-none">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Widget Header with Cyber HUD Badge & Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.2)]">
            <Rss size={14} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#F1F3F9] uppercase flex items-center gap-2">
              <span>INTELLIGENCE STREAM</span>
              <span className="text-[9px] text-[#00FF41] font-normal px-1.5 py-0.2 rounded bg-[#00FF41]/10 border border-[#00FF41]/20">
                LIVE RSS
              </span>
            </h3>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-black/60 rounded-xl p-1 border border-white/10 text-[10px]">
          {["ALL", "AI", "DEV", "SYS"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setSelectedCat(cat);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer font-bold ${
                selectedCat === cat
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "text-[#9499B3] hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 overflow-y-auto pr-1 -mr-1">
        {filtered.map((item) => {
          const badgeColor =
            item.category === "AI"
              ? "#BF40FF"
              : item.category === "DEV"
              ? "#00FF41"
              : "#00F0FF";

          const CategoryIcon =
            item.category === "AI"
              ? Brain
              : item.category === "DEV"
              ? Terminal
              : Cpu;

          return (
            <article
              key={item.id}
              onClick={() => toggleRead(item.id, item.url)}
              className="p-3.5 rounded-2xl cursor-pointer transition-all duration-200 group relative flex flex-col justify-between gap-2.5 bg-[#080A16]/90 border border-white/10 hover:border-[#00FF41]/40 hover:bg-[#0D1022] hover:shadow-[0_0_20px_rgba(0,255,65,0.1)] hover:scale-[1.01] active:scale-[0.99] animate-slide-up-fade"
            >
              {/* Unread Glow Dot */}
              {item.unread && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41] animate-neural-pulse" />
                </div>
              )}

              <div>
                {/* Meta Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-sm"
                    style={{
                      color: badgeColor,
                      background: `${badgeColor}18`,
                      border: `1px solid ${badgeColor}40`,
                    }}
                  >
                    <CategoryIcon size={10} />
                    <span>{item.category}</span>
                  </span>
                  <span className="text-[10px] text-[#A1A7C4] font-medium">
                    {item.source}
                  </span>
                  <span className="text-[10px] text-[#4F536E]">
                    • {item.time}
                  </span>
                </div>

                {/* Article Title */}
                <h4 className="text-xs font-bold text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h4>

                {/* Snippet */}
                <p className="text-[11px] text-[#9499B3] mt-1.5 line-clamp-2 leading-relaxed font-sans select-text">
                  {item.snippet}
                </p>
              </div>

              {/* Bottom Quick Link Info */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-[#4F536E] group-hover:text-[#9499B3] transition-colors">
                <span className="truncate max-w-[200px]">{item.url.replace(/^https?:\/\//, "")}</span>
                <span className="flex items-center gap-1 group-hover:text-[#00FF41] transition-colors">
                  <span>OPEN BRIEF</span>
                  <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Feed Status Summary Strip */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#4F536E]">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#9499B3]">INTELLIGENCE AGGREGATOR:</span>
          <span className="text-[#00F0FF] font-bold">8 FEEDS ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#00FF41] shrink-0 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
          <span>AUTO-POLL: 60s</span>
        </div>
      </div>
    </div>
  );
}
