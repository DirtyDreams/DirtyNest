"use client";

import { useState } from "react";
import {
  Radio,
  TrendingUp,
  Activity,
  Sparkles,
  Link,
  Copy,
  Check,
  Flame,
  Globe,
  Share2,
  BarChart3,
  Search,
  ExternalLink,
  ArrowUpRight,
  Shield,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface KeywordMention {
  id: string;
  keyword: string;
  source: string;
  author: string;
  sentiment: "positive" | "neutral" | "negative";
  text: string;
  time: string;
  reach: string;
}

const SAMPLE_MENTIONS: KeywordMention[] = [
  {
    id: "men-01",
    keyword: "DirtyNest",
    source: "X / Twitter",
    author: "@tech_futurist",
    sentiment: "positive",
    text: "The new DirtyNest v3.5 is the slickest agentic command center I've seen. Local diffusion + Web Audio DSP in one dashboard is wild.",
    time: "8m ago",
    reach: "45.2K",
  },
  {
    id: "men-02",
    keyword: "Hermes AI",
    source: "Reddit r/LocalLLaMA",
    author: "u/matrix_dev",
    sentiment: "positive",
    text: "How Hermes Master Brain handles autonomous background tasks without crashing Turbopack is impressive. Architecture breakdown?",
    time: "24m ago",
    reach: "18.4K",
  },
  {
    id: "men-03",
    keyword: "Agentic IDE",
    source: "Hacker News",
    author: "cyber_sec",
    sentiment: "neutral",
    text: "Agentic interfaces need strict zero-trust audit logging to prevent rogue tool calls. DirtyNest seems to have implemented socket interceptors.",
    time: "1h ago",
    reach: "62.0K",
  },
  {
    id: "men-04",
    keyword: "Next.js 16",
    source: "LinkedIn Tech",
    author: "Sarah Lin · Staff Eng",
    sentiment: "positive",
    text: "DirtyNest demonstrates the true power of Next.js 16 Turbopack with real-time HUD telemetry and responsive cyber cards.",
    time: "2h ago",
    reach: "12.8K",
  },
];

const COMPETITOR_POSTS = [
  {
    id: "comp-01",
    brand: "CyberGrid OS",
    platform: "X / Twitter",
    handle: "@cybergrid_app",
    content: "We just launched our basic terminal emulator with static sound files.",
    engagement: "420 Likes · 32 Reposts",
    velocity: "+12%/hr",
    threatLevel: "LOW",
  },
  {
    id: "comp-02",
    brand: "NeuroDeck",
    platform: "Reddit",
    handle: "r/cybernetics",
    content: "Showcase: Real-time telemetry dashboard with WebSocket streaming.",
    engagement: "1.2K Upvotes · 140 Comments",
    velocity: "+45%/hr (Viral)",
    threatLevel: "MEDIUM",
  },
];

export default function SocialListeningIntel() {
  const [mentions, setMentions] = useState<KeywordMention[]>(SAMPLE_MENTIONS);
  const [copiedLink, setCopiedLink] = useState(false);

  // UTM Generator State
  const [targetUrl, setTargetUrl] = useState("https://dirtynest.systems");
  const [utmSource, setUtmSource] = useState("twitter");
  const [utmMedium, setUtmMedium] = useState("thread");
  const [utmCampaign, setUtmCampaign] = useState("v35_launch");
  const [generatedShortLink, setGeneratedShortLink] = useState("https://dnst.ai/r/v35-cyber");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const fullUtmUrl = `${targetUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

  const handleGenerateShortLink = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("warp");
    setIsGeneratingLink(true);

    setTimeout(() => {
      cyberAudio.play("chime");
      setIsGeneratingLink(false);
      setGeneratedShortLink(`https://dnst.ai/r/${utmCampaign}-${Math.floor(Math.random() * 899 + 100)}`);
    }, 800);
  };

  const handleCopyLink = () => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(generatedShortLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Top Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Radio size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                SOCIAL LISTENING & COMPETITOR INTEL // <span className="text-[#00F0FF]">RADAR</span>
              </h3>
              <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                LIVE KEYWORD INTERCEPTOR
              </span>
            </div>
            <p className="text-[10px] text-[#4F536E]">
              Track brand citations, competitive viral telemetry & generate tracked campaign shortlinks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30">
            MARKET SENTIMENT: 84% POSITIVE
          </span>
        </div>
      </div>

      {/* Sentiment & Keyword Velocity Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">TOTAL CITATIONS (24H)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-white">1,482</span>
            <span className="text-[10px] font-bold text-[#00FF41]">+38.4%</span>
          </div>
          <span className="text-[8px] text-[#9499B3] mt-1">Aggregated across 5 networks</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">VIRAL ENGAGEMENT VELOCITY</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-[#00F0FF]">184.2</span>
            <span className="text-[10px] text-[#4F536E]">pts/hr</span>
          </div>
          <span className="text-[8px] text-[#00FF41] mt-1">High organic amplification</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">COMPETITOR BENCHMARK</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-purple-400">+3.2x</span>
            <span className="text-[10px] text-[#4F536E]">vs Rivals</span>
          </div>
          <span className="text-[8px] text-[#9499B3] mt-1">Lead in technical engagement</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">TRACKED UTM CLICKS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-amber-400">8,290</span>
            <span className="text-[10px] font-bold text-[#00FF41]">14.2% CTR</span>
          </div>
          <span className="text-[8px] text-[#9499B3] mt-1">Direct conversion to dashboard</span>
        </div>
      </div>

      {/* Main 2-Column Grid: Left Live Mention Stream (7 cols) | Right UTM Generator & Competitors (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Live Social Mentions Stream (7 cols) */}
        <div className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#00FF41]" />
              <span className="text-xs font-black text-[#F1F3F9] uppercase">
                LIVE KEYWORD RADAR FEED
              </span>
            </div>
            <span className="text-[9px] text-[#4F536E]">TRACKING: DIRTYNEST, HERMES, AGENTIC IDE</span>
          </div>

          <div className="space-y-2.5">
            {mentions.map((men) => (
              <div
                key={men.id}
                className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{men.author}</span>
                    <span className="text-[9px] text-[#9499B3] bg-white/5 px-1.5 py-0.2 rounded">{men.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-[#00FF41] font-bold bg-[#00FF41]/10 px-1.5 py-0.2 rounded border border-[#00FF41]/30">
                      REACH: {men.reach}
                    </span>
                    <span className="text-[8px] text-[#4F536E]">{men.time}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {men.text}
                </p>

                <div className="flex items-center justify-between pt-1 text-[9px] text-[#4F536E]">
                  <span className="text-[#00F0FF] font-bold">KEYWORD: #{men.keyword}</span>
                  <span className="text-[#00FF41]">SENTIMENT: POSITIVE (+92%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: UTM Campaign Link Generator & Competitor Tracker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* UTM Campaign Link Generator */}
          <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00FF41]">
                <Link size={15} />
                <span>CYBERLINK UTM SHORTENER</span>
              </div>
              <span className="text-[9px] text-[#4F536E]">CAMPAIGN TRACKER</span>
            </div>

            <form onSubmit={handleGenerateShortLink} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-[9px] text-[#9499B3] font-bold block mb-1">Target URL:</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#00FF41] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[#9499B3] font-bold block mb-0.5">UTM Source:</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-[#00F0FF] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#9499B3] font-bold block mb-0.5">UTM Medium:</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-purple-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#9499B3] font-bold block mb-0.5">UTM Campaign:</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-[#00FF41] font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingLink}
                className="w-full py-2 rounded-xl bg-[#00FF41]/20 hover:bg-[#00FF41]/30 border border-[#00FF41]/50 text-[#00FF41] font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>GENERATE TRACKED SHORTLINK</span>
              </button>

              {/* Result Shortlink Box */}
              <div className="p-2.5 rounded-xl bg-black/80 border border-white/15 flex items-center justify-between gap-2 mt-1">
                <span className="text-xs text-[#00FF41] font-bold truncate">
                  {generatedShortLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {copiedLink ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
                  <span>{copiedLink ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Competitor Watcher */}
          <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF4500]">
                <Flame size={15} />
                <span>COMPETITOR INTEL RADAR</span>
              </div>
              <span className="text-[9px] text-[#4F536E]">VIRAL BENCHMARK</span>
            </div>

            <div className="space-y-2">
              {COMPETITOR_POSTS.map((comp) => (
                <div
                  key={comp.id}
                  className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-1 text-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{comp.brand} ({comp.platform})</span>
                    <span className="text-[8px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                      {comp.velocity}
                    </span>
                  </div>
                  <p className="text-[#9499B3] line-clamp-2">{comp.content}</p>
                  <span className="text-[8px] text-[#4F536E]">{comp.engagement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
