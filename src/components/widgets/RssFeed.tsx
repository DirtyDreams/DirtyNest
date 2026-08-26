"use client";

import { useState } from "react";
import { Rss, ExternalLink, Sparkles, Terminal, Cpu } from "lucide-react";

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
];

export default function RssFeed() {
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [articles, setArticles] = useState(mockFeedItems);

  const toggleRead = (id: number, url: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
    window.open(url, "_blank");
  };

  const filtered = articles.filter(
    (a) => selectedCat === "ALL" || a.category === selectedCat
  );

  return (
    <div className="cyber-card p-5 relative flex flex-col" style={{ minHeight: "380px" }}>
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Rss size={15} className="icon" />
        <h3>Intelligence Stream</h3>

        {/* Filter Pills */}
        <div className="ml-auto flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5 text-[10px] font-mono">
          {["ALL", "AI", "DEV", "SYS"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedCat === cat
                  ? "bg-[#00FF41]/20 text-[#00FF41] font-bold"
                  : "text-[#9499B3]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
        {filtered.map((item) => {
          const badgeColor =
            item.category === "AI"
              ? "#BF40FF"
              : item.category === "DEV"
              ? "#00FF41"
              : "#00F0FF";

          return (
            <article
              key={item.id}
              onClick={() => toggleRead(item.id, item.url)}
              className="p-3 rounded-xl cursor-pointer transition-all duration-200 group relative"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 255, 255, 0.05)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(0, 255, 65, 0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 255, 255, 0.02)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255, 255, 255, 0.04)";
              }}
            >
              {item.unread && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41]" />
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase"
                  style={{
                    color: badgeColor,
                    background: `${badgeColor}15`,
                    border: `1px solid ${badgeColor}30`,
                  }}
                >
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-[#9499B3]">
                  {item.source}
                </span>
                <span className="text-[10px] text-[#4F536E] font-mono">
                  • {item.time}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors leading-snug line-clamp-1">
                {item.title}
              </h4>

              <p className="text-[11px] text-[#9499B3] mt-1 line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
