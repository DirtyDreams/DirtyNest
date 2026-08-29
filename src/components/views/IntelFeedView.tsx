"use client";

import { useState, useEffect } from "react";
import {
  Rss,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  ShieldAlert,
  RefreshCw,
  Radio,
  Settings,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import MitreAttackMatrixModal from "./intel/MitreAttackMatrixModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IntelItem {
  id: string;
  title: string;
  source: string;
  channel: "AI" | "SECURITY" | "DEVOPS" | "HARDWARE";
  snippet: string;
  timestamp: string;
  url: string;
  score: number;
  tags: string[];
  isSaved?: boolean;
}

const INITIAL_INTEL: IntelItem[] = [
  {
    id: "intel-1",
    title: "Next.js 16.3 Unveils Instant Edge Routing & Turbopack v2 Engine",
    source: "Vercel Engineering",
    channel: "DEVOPS",
    snippet: "Major runtime optimizations yield 40% faster cold starts and zero-config streaming Server Actions across distributed edge worker nodes.",
    timestamp: "14m ago",
    url: "https://vercel.com/blog",
    score: 342,
    tags: ["nextjs", "turbopack", "edge"],
  },
  {
    id: "intel-2",
    title: "Autonomous Multi-Thread Agent Orchestration: The 2026 Consensus",
    source: "DeepMind Research",
    channel: "AI",
    snippet: "New architectural framework for deterministic agent coordination across distributed tool protocols with verifiable cryptographic proofs.",
    timestamp: "1h ago",
    url: "https://arxiv.org",
    score: 512,
    tags: ["agents", "mcp", "llm"],
  },
  {
    id: "intel-3",
    title: "Critical Zero-Day in OpenSSH (RegreSSHion CVE-2026) Mitigation Guide",
    source: "Cyber Threat Intel",
    channel: "SECURITY",
    snippet: "Remote unauthenticated code execution vulnerability identified in default PAM configurations. Immediate patch directive issued.",
    timestamp: "2h ago",
    url: "https://cve.mitre.org",
    score: 890,
    tags: ["cve", "openssh", "zero-day"],
  },
  {
    id: "intel-4",
    title: "NVIDIA Rubin Architecture Delivers 3.2x Tensor FLOPS & HBM4 Memory",
    source: "Hardware Matrix",
    channel: "HARDWARE",
    snippet: "Next-generation data center GPUs introduce native FP4 quantization and 288GB ultra-bandwidth unified memory for local 70B parameter models.",
    timestamp: "4h ago",
    url: "https://nvidia.com",
    score: 420,
    tags: ["gpu", "cuda", "hardware"],
  },
  {
    id: "intel-5",
    title: "PostgreSQL 18 Release: Autonomous Vector Query Re-Indexing Engine",
    source: "Hacker News",
    channel: "DEVOPS",
    snippet: "Native HNSW indexes now auto-calibrate clustering parameters based on live operational query heatmaps without table locks.",
    timestamp: "5h ago",
    url: "https://news.ycombinator.com",
    score: 610,
    tags: ["postgres", "vector", "database"],
  },
  {
    id: "intel-6",
    title: "Claude 3.7 Sonnet Hybrid Reasoning: Real-Time Thinking Benchmarks",
    source: "Anthropic Research",
    channel: "AI",
    snippet: "Detailed analysis of dynamic reasoning token allocation and test-time compute scaling across software architecture and formal verification tasks.",
    timestamp: "7h ago",
    url: "https://anthropic.com/research",
    score: 780,
    tags: ["claude", "reasoning", "benchmark"],
  },
];

export default function IntelFeedView() {
  const { setActiveView } = useAppStore();
  const [intelList, setIntelList] = useState<IntelItem[]>(INITIAL_INTEL);
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMitreModal, setShowMitreModal] = useState(false);
  const [syncedFeeds, setSyncedFeeds] = useState<Array<{ name: string; url: string; enabled: boolean }>>([
    { name: "CISA Cybersecurity Alerts", url: "https://www.cisa.gov/uscert/ncas/all.xml", enabled: true },
    { name: "Hacker News Frontpage", url: "https://news.ycombinator.com/rss", enabled: true },
    { name: "BleepingComputer News", url: "https://www.bleepingcomputer.com/feed/", enabled: true },
    { name: "GitHub Engineering Blog", url: "https://github.blog/feed/", enabled: true },
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_rss_feeds");
      if (saved) {
        setSyncedFeeds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleToggleSave = (id: string) => {
    cyberAudio.play("chime");
    setIntelList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item))
    );
  };

  const handleRefresh = () => {
    cyberAudio.play("warp");
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      cyberAudio.play("chime");
    }, 800);
  };

  const filteredItems = intelList.filter((item) => {
    const matchesChannel = channelFilter === "ALL" || item.channel === channelFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
      <div className="cyber-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(191,64,255,0.2) 100%)",
                border: "1px solid rgba(0,240,255,0.4)",
                boxShadow: "0 0 16px rgba(0,240,255,0.3)",
              }}
            >
              <Rss size={22} className="text-[#00F0FF]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#F1F3F9]">
                  CYBER INTEL FEED // <span className="text-[#00F0FF]">LIVE STREAM MATRIX</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                  FEED SYNCED
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                AI developments · Zero-day CVE bulletins · High-performance cloud infrastructure & arXiv preprints
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="h-9 px-3.5 bg-[#FF8800]/15 border-[#FF8800]/40 text-[#FF8800] hover:bg-[#FF8800]/25 text-xs font-bold shadow-[0_0_12px_rgba(255,136,0,0.2)]"
              title="Configure RSS sources and alert filters in Settings"
            >
              <Settings size={14} className="mr-1.5" />
              <span>MANAGE WIRE FEEDS</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                cyberAudio.play("click");
                setShowMitreModal(true);
              }}
              className="h-9 px-3.5 bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 text-xs font-bold shadow-[0_0_12px_rgba(255,0,60,0.2)]"
            >
              <ShieldAlert size={14} className="mr-1.5" />
              <span>MITRE ATT&CK MATRIX</span>
            </Button>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3.5 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn("mr-1.5", isRefreshing ? "animate-spin" : "")} />
              <span>{isRefreshing ? "SYNCING..." : "FETCH LATEST"}</span>
            </Button>
          </div>
        </div>

        {/* Breaking News Ticker */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3 text-xs overflow-hidden">
          <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold shrink-0 animate-pulse text-[10px]">
            BREAKING INTEL
          </span>
          <span className="text-[#F1F3F9] truncate font-sans">
            DeepMind releases agent consensus architecture · OpenSSH RegreSSHion patches deployed globally · Vercel Turbopack v2 in production.
          </span>
        </div>
      </div>

      {/* SEARCH, CHANNELS & FEED SUBSCRIPTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Feed Content (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="cyber-card p-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search intel keywords, CVEs, tags..."
                className="pl-9 bg-black/50 border-white/10 text-xs font-mono"
              />
            </div>

            {/* Channel Pills */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
              {["ALL", "AI", "SECURITY", "DEVOPS", "HARDWARE"].map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    cyberAudio.play("click");
                    setChannelFilter(ch);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    channelFilter === ch
                      ? "bg-[#00F0FF]/20 text-[#00F0FF] font-bold border border-[#00F0FF]/40"
                      : "text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Intel Articles List */}
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const channelColor =
                item.channel === "AI"
                  ? "#BF40FF"
                  : item.channel === "SECURITY"
                  ? "#FF003C"
                  : item.channel === "DEVOPS"
                  ? "#00FF41"
                  : "#00F0FF";

              return (
                <div
                  key={item.id}
                  className="cyber-card p-4 sm:p-5 flex flex-col gap-2.5 border hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                        style={{
                          color: channelColor,
                          background: `${channelColor}15`,
                          borderColor: `${channelColor}40`,
                        }}
                      >
                        {item.channel}
                      </span>
                      <span className="text-[#4F536E]">•</span>
                      <span className="text-[#9499B3] font-bold">{item.source}</span>
                      <span className="text-[#4F536E]">•</span>
                      <span className="text-[#4F536E]">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(item.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          item.isSaved
                            ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                            : "bg-white/[0.03] border-white/10 text-[#4F536E] hover:text-[#F1F3F9]"
                        }`}
                        title={item.isSaved ? "Saved in Knowledge Vault" : "Save to Knowledge Vault"}
                      >
                        {item.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#4F536E] hover:text-[#00F0FF] transition-all"
                        title="Open Source Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#F1F3F9] group-hover:text-[#00F0FF] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#9499B3] leading-relaxed font-sans">
                    {item.snippet}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-[#4F536E]">
                    <div className="flex items-center gap-1.5">
                      {item.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <span className="font-mono text-[#00FF41]">+{item.score} AGENT VOTES</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed Channels & Synced Wire Feeds Hub (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Synced Wire Feeds */}
          <div className="cyber-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Active Wire Feeds
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF41] font-bold">
                {syncedFeeds.filter((f) => f.enabled !== false).length} ACTIVE
              </span>
            </div>

            <p className="text-[10px] text-[#9499B3] leading-relaxed">
              Real-time cyber telemetry and preprints auto-polled across registered sources.
            </p>

            <div className="space-y-2 text-xs font-mono">
              {syncedFeeds.map((feed) => (
                <div
                  key={feed.name}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    feed.enabled !== false
                      ? "bg-black/30 border-white/5"
                      : "bg-black/20 border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-bold text-[#F1F3F9] truncate text-xs">{feed.name}</span>
                    <span className="text-[9px] text-[#4F536E] truncate font-mono">{feed.url}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      feed.enabled !== false
                        ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30"
                        : "bg-white/5 text-[#4F536E]"
                    }`}
                  >
                    {feed.enabled !== false ? "SYNCED" : "PAUSED"}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#FF8800]/15 border border-[#FF8800]/40 text-[#FF8800] hover:bg-[#FF8800]/25 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,136,0,0.15)]"
            >
              <Settings size={14} />
              <span>CONFIGURE FEEDS IN SETTINGS</span>
            </button>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Modal */}
      {showMitreModal && (
        <MitreAttackMatrixModal
          isOpen={showMitreModal}
          onClose={() => setShowMitreModal(false)}
        />
      )}
    </div>
  );
}
