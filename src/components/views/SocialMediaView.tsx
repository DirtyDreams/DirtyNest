"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  Calendar,
  TrendingUp,
  Radio,
  Share2,
  CalendarDays,
  Repeat,
  Inbox,
} from "lucide-react";
import MultiPlatformComposer, { SocialPlatform } from "./social_media/MultiPlatformComposer";
import HermesAiCopywriter from "./social_media/HermesAiCopywriter";
import SocialScheduledQueue, { ScheduledPost, INITIAL_SCHEDULE } from "./social_media/SocialScheduledQueue";
import EngagementRadar from "./social_media/EngagementRadar";
import SocialContentCalendar from "./social_media/SocialContentCalendar";
import ThreadHookArchitect from "./social_media/ThreadHookArchitect";
import UnifiedSocialInbox from "./social_media/UnifiedSocialInbox";
import SocialListeningIntel from "./social_media/SocialListeningIntel";
import AutomationsMatrix from "./social_media/AutomationsMatrix";
import { cyberAudio } from "@/lib/cyberAudio";
import { Bot } from "lucide-react";
interface ApiSocialPost {
  id: number;
  platform: string;
  text: string;
  media_urls: string[];
  status: string;
  scheduled_time: string | null;
  published_time: string | null;
  platform_post_id: string | null;
  created_at: string | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#00F0FF",
  reddit: "#FF4500",
  discord: "#5865F2",
  telegram: "#0088CC",
  linkedin: "#0A66C2",
};

function mapApiPostToScheduledPost(p: ApiSocialPost): ScheduledPost {
  const status: ScheduledPost["status"] =
    p.status === "published"
      ? "published"
      : p.status === "failed"
      ? "failed"
      : p.status === "draft"
      ? "draft"
      : p.status === "awaiting_hitl"
      ? "awaiting_hitl"
      : p.status === "approved"
      ? "approved"
      : "scheduled";
  const when = p.scheduled_time ?? p.published_time ?? p.created_at;
  return {
    id: String(p.id),
    platform: p.platform.toUpperCase(),
    platformColor: PLATFORM_COLORS[p.platform] ?? "#00F0FF",
    scheduledTime: when ? when.replace("T", " ").slice(0, 16) : "now",
    copy: p.text,
    status,
    hasMedia: (p.media_urls ?? []).length > 0,
  };
}

export default function SocialMediaView() {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULE);
  const [activeSubTab, setActiveSubTab] = useState<
    "composer" | "automations" | "calendar" | "thread" | "inbox" | "listening" | "copywriter" | "queue" | "radar"
  >("automations");
  const [injectedText, setInjectedText] = useState<string | null>(null);
  const [cdpConnected, setCdpConnected] = useState<boolean>(false);
  const [isLaunchingCdp, setIsLaunchingCdp] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/social/posts");
      if (res.ok) {
        const data = (await res.json()) as { posts?: ApiSocialPost[] };
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts.map(mapApiPostToScheduledPost));
          return;
        }
      }
    } catch {
      // fall back to mock schedule
    }
  }, []);

  const fetchCdpStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/social/cdp");
      if (res.ok) {
        const data = (await res.json()) as { connected?: boolean };
        setCdpConnected(Boolean(data.connected));
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCdpStatus();
    const iv = setInterval(fetchCdpStatus, 15000);
    return () => clearInterval(iv);
  }, [fetchPosts, fetchCdpStatus]);

  const handleLaunchCdp = async () => {
    cyberAudio.play("click");
    setIsLaunchingCdp(true);
    try {
      await fetch("/api/social/cdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "launch", port: 9333 }),
      });
      setTimeout(fetchCdpStatus, 2000);
    } catch {
      // ignored
    } finally {
      setIsLaunchingCdp(false);
    }
  };

  const handleSchedulePost = (newPost: {
    platform: SocialPlatform;
    text: string;
    hasMedia: boolean;
    mediaUrls?: string[];
    status?: "approved" | "awaiting_hitl" | "scheduled" | "draft";
  }) => {
    const status = newPost.status ?? "scheduled";
    const postItem: ScheduledPost = {
      id: `post-${Date.now()}`,
      platform: newPost.platform.toUpperCase(),
      platformColor: PLATFORM_COLORS[newPost.platform] ?? "#00F0FF",
      scheduledTime: "Today in 15 mins",
      copy: newPost.text,
      status,
      hasMedia: newPost.hasMedia,
    };
    setPosts((prev) => [postItem, ...prev]);

    fetch("/api/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: newPost.platform,
        text: newPost.text,
        status,
        media_urls: newPost.mediaUrls ?? [],
      }),
    })
      .then((res) => (res.ok ? fetchPosts() : undefined))
      .catch(() => undefined);
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Top Omnichannel Network Status Bar */}
      <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Share2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  SOCIAL MEDIA COMMAND // <span className="text-[#00F0FF]">OMNICHANNEL BROADCAST HUB</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  HERMES AUTONOMOUS COPYWRITER
                </span>
              </div>
              <p className="text-xs text-[#9499B3]">
                Synchronized publication matrix across X, Instagram, TikTok, Facebook & Reddit via CDP automation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cdpConnected ? (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                CDP CHROME :9333 ONLINE
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLaunchCdp}
                disabled={isLaunchingCdp}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#FFB800] px-2.5 py-1 rounded bg-[#FFB800]/10 border border-[#FFB800]/30 hover:bg-[#FFB800]/20 transition-all cursor-pointer disabled:opacity-50"
                title="Launch headless/interactive Chrome with remote CDP port 9333"
              >
                <Radio size={11} className={isLaunchingCdp ? "animate-pulse" : ""} />
                {isLaunchingCdp ? "LAUNCHING CDP..." : "LAUNCH CDP CHROME"}
              </button>
            )}
            <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
              TOTAL REACH: 49,630 OPERATIVES
            </span>
          </div>
        </div>

        {/* Live Channel Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-white/5">
          {[
            { name: "X / Twitter", handle: "@DirtyNestAI", count: "18.4K", color: "#1DA1F2", status: "ONLINE" },
            { name: "Instagram", handle: "@dirtynest_cyber", count: "12.5K", color: "#E1306C", status: "ONLINE" },
            { name: "TikTok", handle: "@dirtynest_ops", count: "8.4K", color: "#00F0FF", status: "ONLINE" },
            { name: "Facebook", handle: "DirtyNest Ops", count: "6.1K", color: "#1877F2", status: "ONLINE" },
            { name: "Reddit", handle: "r/Cyberpunk", count: "4.2K", color: "#FF4500", status: "ONLINE" },
          ].map((ch) => (
            <div
              key={ch.name}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ch.color }} />
                  <span className="text-xs font-bold text-[#F1F3F9] truncate">{ch.name}</span>
                </div>
                <span className="text-[9px] text-[#4F536E] block truncate">{ch.handle}</span>
              </div>
              <span className="text-xs font-mono font-black" style={{ color: ch.color }}>
                {ch.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "automations" as const, label: "Automations Matrix", icon: Bot },
          { id: "composer" as const, label: "Omnichannel Composer", icon: Send },
          { id: "calendar" as const, label: "Visual Content Calendar", icon: CalendarDays },
          { id: "thread" as const, label: "Viral Thread Architect", icon: Repeat },
          { id: "inbox" as const, label: "Unified Community Inbox", icon: Inbox },
          { id: "listening" as const, label: "Social Listening & Intel", icon: Radio },
          { id: "copywriter" as const, label: "Hermes Viral Copywriter", icon: Sparkles },
          { id: "queue" as const, label: "Scheduled Dispatch Queue", icon: Calendar },
          { id: "radar" as const, label: "Audience & Engagement Radar", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveSubTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.3)] font-black"
                  : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Areas */}
      {activeSubTab === "automations" && (
        <div className="animate-fade-in">
          <AutomationsMatrix />
        </div>
      )}

      {activeSubTab === "composer" && (
        <div className="animate-fade-in">
          <MultiPlatformComposer
            onSchedulePost={handleSchedulePost}
            initialText={injectedText ?? undefined}
          />
        </div>
      )}

      {activeSubTab === "calendar" && (
        <div className="animate-fade-in">
          <SocialContentCalendar />
        </div>
      )}

      {activeSubTab === "thread" && (
        <div className="animate-fade-in">
          <ThreadHookArchitect />
        </div>
      )}

      {activeSubTab === "inbox" && (
        <div className="animate-fade-in">
          <UnifiedSocialInbox />
        </div>
      )}

      {activeSubTab === "listening" && (
        <div className="animate-fade-in">
          <SocialListeningIntel />
        </div>
      )}

      {activeSubTab === "copywriter" && (
        <div className="animate-fade-in">
          <HermesAiCopywriter
            onApplyCopy={(text) => {
              setInjectedText(text);
              setActiveSubTab("composer");
            }}
          />
        </div>
      )}

      {activeSubTab === "queue" && (
        <div className="animate-fade-in">
          <SocialScheduledQueue posts={posts} onRefresh={fetchPosts} />
        </div>
      )}

      {activeSubTab === "radar" && (
        <div className="animate-fade-in">
          <EngagementRadar />
        </div>
      )}
    </div>
  );
}

