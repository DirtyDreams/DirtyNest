"use client";

import { useState } from "react";
import { X, Radio, MessageSquare, Heart, Plus, Check } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./PersonaDetailModal";

export interface SocialPost {
  id: string;
  imageThumbnail: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorEarnings?: number;
  publishedAt: string;
}

export interface BrandDeal {
  id: string;
  brandName: string;
  category: string;
  payout: number;
  deliverable: string;
  status: "pending" | "accepted" | "declined";
  campaignBrief: string;
}

export interface VirtualInfluencer extends PersonaCharacter {
  handle: string;
  niche: string;
  followersCount: number;
  engagementRate: number;
  monthlyRevenue: number;
  primaryPlatforms: string[];
  posts: SocialPost[];
  brandDeals: BrandDeal[];
}

interface Props {
  influencer: VirtualInfluencer;
  onClose: () => void;
  onStartChat: (influencer: VirtualInfluencer) => void;
  onStartLivestream: (influencer: VirtualInfluencer) => void;
  onUpdateInfluencer: (influencer: VirtualInfluencer) => void;
}

export default function InfluencerProfileModal({
  influencer,
  onClose,
  onStartChat,
  onStartLivestream,
  onUpdateInfluencer,
}: Props) {
  const [activeTab, setActiveTab] = useState<"feed" | "brand_deals" | "persona">("feed");
  const [localInfluencer, setLocalInfluencer] = useState<VirtualInfluencer>(influencer);

  // Generate Next Viral Post
  const handleGenerateViralPost = () => {
    cyberAudio.play("warp");

    const sampleCaptions = [
      `Behind the scenes at the Neo-Warsaw Virtual Fashion Week. Synced neural textures rendered live. What do you think of this chrome silhouette? 🦾✨`,
      `Late night audio mixing in the sub-node studio. Streaming my new cyberpunk synthwave track tonight on Twitch! Who's tuning in? 🎧⚡`,
      `Overclocking the morning routine with cold-pressed electrolyte stacks. Mind sharp, telemetry masked. 🧬🚀`,
    ];

    const randomCaption = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)];
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      imageThumbnail: localInfluencer.avatar,
      caption: randomCaption,
      hashtags: [localInfluencer.niche.replace(/\s+/g, ""), "DirtyNest", "VirtualHuman", "CyberAesthetic"],
      likesCount: Math.floor(Math.random() * 25000) + 12000,
      commentsCount: Math.floor(Math.random() * 800) + 200,
      publishedAt: "Just now",
    };

    const updated = {
      ...localInfluencer,
      posts: [newPost, ...localInfluencer.posts],
      followersCount: localInfluencer.followersCount + Math.floor(Math.random() * 1500) + 400,
    };

    setLocalInfluencer(updated);
    onUpdateInfluencer(updated);
  };

  // Accept Brand Deal & Publish Sponsored Post
  const handleAcceptDeal = (dealId: string) => {
    cyberAudio.play("chime");

    const targetDeal = localInfluencer.brandDeals.find((d) => d.id === dealId);
    if (!targetDeal) return;

    const sponsoredPost: SocialPost = {
      id: `post-spon-${Date.now()}`,
      imageThumbnail: localInfluencer.avatar,
      caption: `Proud to partner with ${targetDeal.brandName}! ${targetDeal.campaignBrief} #ad #sponsored`,
      hashtags: [targetDeal.brandName.replace(/\s+/g, ""), "Sponsored", localInfluencer.niche.replace(/\s+/g, "")],
      likesCount: Math.floor(Math.random() * 35000) + 18000,
      commentsCount: Math.floor(Math.random() * 1200) + 400,
      isSponsored: true,
      sponsorName: targetDeal.brandName,
      sponsorEarnings: targetDeal.payout,
      publishedAt: "Just now",
    };

    const updatedDeals = localInfluencer.brandDeals.map((d) =>
      d.id === dealId ? { ...d, status: "accepted" as const } : d
    );

    const updated = {
      ...localInfluencer,
      monthlyRevenue: localInfluencer.monthlyRevenue + targetDeal.payout,
      brandDeals: updatedDeals,
      posts: [sponsoredPost, ...localInfluencer.posts],
    };

    setLocalInfluencer(updated);
    onUpdateInfluencer(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-3xl cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Modal Header: Avatar & Social Metrics */}
        <div className="p-6 bg-gradient-to-b from-[#00FF41]/10 via-[#0A0C16] to-[#06070C] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#00FF41]/50 shadow-[0_0_25px_rgba(0,255,65,0.3)] bg-black flex items-center justify-center text-3xl shrink-0">
              {localInfluencer.avatar.startsWith("http") ? (
                <img src={localInfluencer.avatar} alt={localInfluencer.name} className="w-full h-full object-cover" />
              ) : (
                <span>{localInfluencer.avatar}</span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F1F3F9] tracking-wider">{localInfluencer.name}</h2>
                <span className="text-xs text-[#00FF41] font-bold">{localInfluencer.handle}</span>
              </div>
              <span className="text-xs text-[#9499B3] font-sans mt-0.5">{localInfluencer.tagline}</span>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                  {localInfluencer.niche}
                </span>
                {localInfluencer.primaryPlatforms.map((plat) => (
                  <span key={plat} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                    {plat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Livestream Launcher */}
            <button
              onClick={() => {
                cyberAudio.play("warp");
                onStartLivestream(localInfluencer);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,60,0.25)] animate-pulse"
            >
              <Radio size={13} />
              <span>LIVE BROADCAST</span>
            </button>

            {/* VIP Direct Message Launcher */}
            <button
              onClick={() => {
                cyberAudio.play("warp");
                onStartChat(localInfluencer);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] cursor-pointer"
            >
              <MessageSquare size={13} className="fill-black" />
              <span>VIP DM</span>
            </button>

            <button onClick={onClose} className="p-2 text-[#4F536E] hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Social Metrics Radar Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-black/50 border-b border-white/5 text-center text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Total Followers</span>
            <span className="font-black text-[#00FF41] mt-0.5 text-sm">
              {(localInfluencer.followersCount / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Engagement Rate</span>
            <span className="font-black text-[#00F0FF] mt-0.5 text-sm">
              {localInfluencer.engagementRate}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Monthly Revenue</span>
            <span className="font-black text-[#FFB800] mt-0.5 text-sm">
              ${localInfluencer.monthlyRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Social Posts</span>
            <span className="font-black text-[#BF40FF] mt-0.5 text-sm">
              {localInfluencer.posts.length}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 text-xs">
          {[
            { id: "feed", label: `SOCIAL FEED & LOOKBOOK (${localInfluencer.posts.length})` },
            { id: "brand_deals", label: `BRAND DEALS & SPONSORSHIPS (${localInfluencer.brandDeals.length})` },
            { id: "persona", label: "BEHAVIOR & SCENARIO" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                cyberAudio.play("click");
                setActiveTab(tab.id as any);
              }}
              className={`pb-2.5 px-2 border-b-2 font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#00FF41] text-[#00FF41]"
                  : "border-transparent text-[#9499B3] hover:text-[#F1F3F9]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: SOCIAL FEED & LOOKBOOK */}
          {activeTab === "feed" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#4F536E]">
                  Simulated Social Post Feed
                </span>
                <button
                  onClick={handleGenerateViralPost}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-[11px] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                >
                  <Plus size={13} />
                  <span>GENERATE VIRAL POST</span>
                </button>
              </div>

              <div className="space-y-3">
                {localInfluencer.posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F1F3F9]">{localInfluencer.name}</span>
                        <span className="text-[10px] text-[#00FF41]">{localInfluencer.handle}</span>
                        {post.isSponsored && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            SPONSORED BY {post.sponsorName?.toUpperCase()} (${post.sponsorEarnings?.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#4F536E]">{post.publishedAt}</span>
                    </div>

                    <p className="text-xs text-[#F1F3F9] font-sans leading-relaxed">{post.caption}</p>

                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((h) => (
                        <span key={h} className="text-[10px] text-[#00F0FF] hover:underline cursor-pointer">
                          #{h}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-[#4F536E] pt-2 border-t border-white/5 font-mono">
                      <span className="flex items-center gap-1 text-red-400">
                        <Heart size={11} className="fill-red-400" />
                        {post.likesCount.toLocaleString()} likes
                      </span>
                      <span className="flex items-center gap-1 text-[#9499B3]">
                        <MessageSquare size={11} />
                        {post.commentsCount.toLocaleString()} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRAND DEALS & SPONSORSHIPS */}
          {activeTab === "brand_deals" && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-[10px] uppercase font-bold text-[#4F536E]">
                Active Brand Partnership Proposals
              </span>

              <div className="space-y-3">
                {localInfluencer.brandDeals.map((deal) => {
                  const isAccepted = deal.status === "accepted";
                  return (
                    <div
                      key={deal.id}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                        isAccepted
                          ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "bg-black/50 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F1F3F9] text-xs">{deal.brandName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#9499B3]">
                            {deal.category}
                          </span>
                          <span className="text-xs font-black text-[#FFB800]">
                            ${deal.payout.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9499B3] font-sans leading-relaxed">
                          {deal.campaignBrief}
                        </p>
                        <span className="text-[10px] text-[#00F0FF] mt-0.5">
                          Deliverable: {deal.deliverable}
                        </span>
                      </div>

                      <div className="shrink-0 self-center">
                        {isAccepted ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                            <Check size={12} />
                            <span>CONTRACT ACTIVE</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAcceptDeal(deal.id)}
                            className="px-4 py-2 rounded-xl bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 font-bold text-xs cursor-pointer transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                          >
                            ACCEPT & POST
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BEHAVIOR & SCENARIO */}
          {activeTab === "persona" && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Personality & Tone Directives:
                </span>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#00F0FF] leading-relaxed font-mono">
                  {localInfluencer.personality}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Scenario & World Backstory:
                </span>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#F1F3F9] leading-relaxed font-mono">
                  {localInfluencer.scenario}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Initial Greeting Message (VIP DM):
                </span>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#00FF41] leading-relaxed font-mono italic">
                  &ldquo;{localInfluencer.firstMessage}&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
