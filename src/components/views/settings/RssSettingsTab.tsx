"use client";

import { useState, useEffect } from "react";
import {
  Rss,
  Sparkles,
  Plus,
  Trash2,
  Globe,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

interface RssFeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

const DEFAULT_FEEDS: RssFeedSource[] = [
  { id: "cisa", name: "CISA Cybersecurity Alerts", url: "https://www.cisa.gov/uscert/ncas/all.xml", category: "SECOPS", enabled: true },
  { id: "hn", name: "Hacker News Frontpage", url: "https://news.ycombinator.com/rss", category: "TECH", enabled: true },
  { id: "bleeping", name: "BleepingComputer News", url: "https://www.bleepingcomputer.com/feed/", category: "SECOPS", enabled: true },
  { id: "github", name: "GitHub Engineering Blog", url: "https://github.blog/feed/", category: "DEV", enabled: true },
];

export default function RssSettingsTab() {
  const toast = useToast();
  const [feeds, setFeeds] = useState<RssFeedSource[]>(DEFAULT_FEEDS);
  const [pollCadence, setPollCadence] = useState("15m");
  const [cveHighlight, setCveHighlight] = useState(true);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");

  useEffect(() => {
    try {
      const savedFeeds = localStorage.getItem("dirtynest_rss_feeds");
      if (savedFeeds) setFeeds(JSON.parse(savedFeeds));
      const savedPoll = localStorage.getItem("dirtynest_rss_poll");
      if (savedPoll) setPollCadence(savedPoll);
      const savedCve = localStorage.getItem("dirtynest_rss_cvehighlight");
      if (savedCve) setCveHighlight(savedCve !== "false");
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_rss_feeds", JSON.stringify(feeds));
      localStorage.setItem("dirtynest_rss_poll", pollCadence);
      localStorage.setItem("dirtynest_rss_cvehighlight", String(cveHighlight));
    } catch {}
    toast.success("RSS Intel Config Saved", "Feed sources and security alerts updated.");
  };

  const toggleFeed = (id: string) => {
    cyberAudio.play("click");
    setFeeds((p) => p.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const deleteFeed = (id: string) => {
    cyberAudio.play("click");
    setFeeds((p) => p.filter((f) => f.id !== id));
  };

  const addCustomFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;
    cyberAudio.play("chime");
    const newEntry: RssFeedSource = {
      id: "feed_" + Date.now(),
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      category: "CUSTOM",
      enabled: true,
    };
    setFeeds((p) => [...p, newEntry]);
    setNewFeedName("");
    setNewFeedUrl("");
    toast.success("Feed Added", `Subscribed to ${newEntry.name}`);
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#FF8800] uppercase tracking-wider flex items-center gap-2">
            <Rss size={16} />
            <span>Cyber Threat Intel & RSS Feed Sources</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure threat advisory feeds, auto-poll frequency, and critical 0-day keyword highlighters
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF8800] text-black font-black text-xs hover:bg-[#e07700] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,136,0,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE RSS CONFIG</span>
        </button>
      </div>

      {/* Cadence and Security Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Clock size={13} className="text-[#FF8800]" />
            <span>Feed Auto-Fetch Frequency</span>
          </label>
          <select
            value={pollCadence}
            onChange={(e) => setPollCadence(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#FF8800] outline-none font-bold"
          >
            <option value="5m">Every 5 Minutes (Real-Time Flash)</option>
            <option value="15m">Every 15 Minutes (Recommended)</option>
            <option value="1h">Every 1 Hour (Standard)</option>
            <option value="manual">Manual Fetch Only</option>
          </select>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-[#F1F3F9] uppercase flex items-center gap-2">
              <ShieldAlert size={13} className="text-red-400" />
              <span>Critical CVE Highlighting</span>
            </div>
            <p className="text-[10px] text-[#4F536E] mt-0.5">
              Highlight items containing CVE, 0-day, or RCE keywords
            </p>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setCveHighlight(!cveHighlight);
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
              cveHighlight ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-white/5 text-[#4F536E]"
            }`}
          >
            {cveHighlight ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>

      {/* Add Custom Feed */}
      <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <Plus size={14} className="text-[#00FF41]" />
          <span>Add Custom RSS Feed Subscription</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <input
            type="text"
            placeholder="Feed Title (e.g. Krebs on Security)"
            value={newFeedName}
            onChange={(e) => setNewFeedName(e.target.value)}
            className="p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none"
          />
          <input
            type="text"
            placeholder="Feed XML/RSS URL (https://...)"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            className="p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none"
          />
          <button
            onClick={addCustomFeed}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold text-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>ADD FEED</span>
          </button>
        </div>
      </div>

      {/* Feeds List */}
      <div className="space-y-2">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              feed.enabled
                ? "bg-[#090A14] border-white/10"
                : "bg-black/30 border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Globe size={15} className={feed.enabled ? "text-[#FF8800]" : "text-[#4F536E]"} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#F1F3F9] truncate">{feed.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E] font-bold uppercase">
                    {feed.category}
                  </span>
                </div>
                <span className="text-[10px] text-[#4F536E] truncate">{feed.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleFeed(feed.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  feed.enabled
                    ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30"
                    : "bg-white/5 text-[#4F536E] border-white/10"
                }`}
              >
                {feed.enabled ? "ACTIVE" : "PAUSED"}
              </button>

              <button
                onClick={() => deleteFeed(feed.id)}
                className="p-1 text-[#4F536E] hover:text-red-400 cursor-pointer"
                title="Delete Feed"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
