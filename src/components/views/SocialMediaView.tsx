"use client";

import { useState } from "react";
import { Send, Sparkles, Calendar, TrendingUp, Radio, Share2, Globe } from "lucide-react";
import MultiPlatformComposer, { SocialPlatform } from "./social_media/MultiPlatformComposer";
import HermesAiCopywriter from "./social_media/HermesAiCopywriter";
import SocialScheduledQueue, { ScheduledPost, INITIAL_SCHEDULE } from "./social_media/SocialScheduledQueue";
import EngagementRadar from "./social_media/EngagementRadar";
import { cyberAudio } from "@/lib/cyberAudio";

export default function SocialMediaView() {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULE);
  const [activeSubTab, setActiveSubTab] = useState<"composer" | "copywriter" | "queue" | "radar">("composer");
  const [injectedText, setInjectedText] = useState<string | null>(null);

  const handleSchedulePost = (newPost: { platform: SocialPlatform; text: string; hasMedia: boolean }) => {
    const postItem: ScheduledPost = {
      id: `post-${Date.now()}`,
      platform:
        newPost.platform === "twitter"
          ? "X / Twitter"
          : newPost.platform === "discord"
          ? "Discord Announce"
          : newPost.platform === "telegram"
          ? "Telegram Channel"
          : newPost.platform === "linkedin"
          ? "LinkedIn Tech"
          : "Reddit /r/Cyberpunk",
      platformColor:
        newPost.platform === "twitter"
          ? "#00F0FF"
          : newPost.platform === "discord"
          ? "#BF40FF"
          : newPost.platform === "telegram"
          ? "#00FF41"
          : newPost.platform === "linkedin"
          ? "#00F0FF"
          : "#FFB800",
      scheduledTime: "Today in 15 mins",
      copy: newPost.text,
      status: "scheduled",
      hasMedia: newPost.hasMedia,
    };
    setPosts((prev) => [postItem, ...prev]);
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Top Social Studio Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Share2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                SOCIAL MEDIA COMMAND // <span className="text-[#00F0FF]">OMNICHANNEL BROADCASTER</span>
              </h2>
              <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                HERMES VIRAL PIPELINE
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Synchronized dispatch across X, Discord, Telegram, LinkedIn & Reddit with Hermes AI copywriting
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          5 CHANNELS CONNECTED
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "composer" as const, label: "Omnichannel Composer & Live Preview", icon: Send },
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
                  ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]"
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
      {activeSubTab === "composer" && (
        <div className="animate-fade-in">
          <MultiPlatformComposer onSchedulePost={handleSchedulePost} />
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
          <SocialScheduledQueue posts={posts} />
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
