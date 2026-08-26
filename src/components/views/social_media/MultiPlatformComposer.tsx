"use client";

import { useState } from "react";
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Music,
  Paperclip,
  Check,
  Eye,
  MessageSquare,
  Heart,
  Repeat,
  Share,
  Globe,
  Radio,
  Bookmark,
  Smile,
  Hash,
  AtSign,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export type SocialPlatform = "twitter" | "discord" | "telegram" | "linkedin" | "reddit";

interface PlatformDef {
  id: SocialPlatform;
  name: string;
  badge: string;
  color: string;
  maxChars: number;
  handle: string;
  channelName: string;
}

const PLATFORMS: PlatformDef[] = [
  { id: "twitter", name: "X / Twitter", badge: "X", color: "#1DA1F2", maxChars: 280, handle: "@DirtyNestAI", channelName: "DirtyNest" },
  { id: "discord", name: "Discord", badge: "DISCORD", color: "#5865F2", maxChars: 2000, handle: "DirtyNest Bot#0001", channelName: "#announcements" },
  { id: "telegram", name: "Telegram", badge: "TG", color: "#0088CC", maxChars: 4096, handle: "@dirtynest_ops", channelName: "DirtyNest Operations" },
  { id: "linkedin", name: "LinkedIn", badge: "IN", color: "#0A66C2", maxChars: 3000, handle: "DirtyNest Systems Inc.", channelName: "Corporate Feed" },
  { id: "reddit", name: "Reddit", badge: "REDDIT", color: "#FF4500", maxChars: 4000, handle: "u/DirtyNest_Bot", channelName: "r/Cyberpunk" },
];

interface Props {
  onSchedulePost: (post: { platform: SocialPlatform; text: string; hasMedia: boolean }) => void;
}

export default function MultiPlatformComposer({ onSchedulePost }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("twitter");
  const [activeBroadcasts, setActiveBroadcasts] = useState<SocialPlatform[]>(["twitter", "discord", "telegram"]);
  const [postText, setPostText] = useState(
    "🚀 DirtyNest v2.5 is officially live!\n\nFeaturing:\n⚡ 100% Hermes Agent Autonomous Master Brain\n🛡️ Zero-Trust Socket Interceptors & Audit Logs\n🎙️ Real-time Web Audio DSP Voice Synthesizer for Virtual Influencers\n\nTry the interactive cyber dashboard now: https://dirtynest.ai\n\n#Cyberpunk #HermesAgent #Nextjs #AI"
  );
  const [hasMedia, setHasMedia] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const activePlatformDef = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const charCount = postText.length;
  const isOverLimit = charCount > activePlatformDef.maxChars;

  const toggleBroadcast = (id: SocialPlatform) => {
    cyberAudio.play("click");
    setActiveBroadcasts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isOverLimit) return;

    cyberAudio.play("chime");
    onSchedulePost({
      platform: selectedPlatform,
      text: postText,
      hasMedia,
    });
    setScheduled(true);
    setTimeout(() => setScheduled(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none">
      {/* Broadcast Target Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-[#00FF41] animate-pulse" />
          <span className="text-xs font-black text-[#F1F3F9] uppercase">Synchronized Target Channels:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {PLATFORMS.map((p) => {
            const isBroadcasting = activeBroadcasts.includes(p.id);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleBroadcast(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isBroadcasting
                    ? "bg-black/90 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "bg-white/5 border-white/5 opacity-50 hover:opacity-100 text-[#9499B3]"
                }`}
                style={{
                  borderColor: isBroadcasting ? p.color : undefined,
                  color: isBroadcasting ? p.color : undefined,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: isBroadcasting ? p.color : "#4F536E" }} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Composer Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
                <Send size={15} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase">
                  POST DRAFTING MATRIX
                </h3>
                <span className="text-[10px] text-[#4F536E]">
                  Broadcasting to {activeBroadcasts.length} selected networks
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isOverLimit ? "bg-[#FF2A6D]/20 text-[#FF2A6D] border-[#FF2A6D]/40" : "bg-white/5 text-[#00FF41] border-white/10"
              }`}>
                {charCount} / {activePlatformDef.maxChars} chars
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              rows={7}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Draft your multi-network dispatch..."
              className="w-full p-3.5 bg-black/70 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-sans leading-relaxed outline-none resize-none shadow-inner"
            />

            {/* Quick Insert Badges */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPostText((p) => `${p} #DirtyNest #AI`)}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#00F0FF] flex items-center gap-0.5 cursor-pointer"
              >
                <Hash size={10} />
                <span>Hashtags</span>
              </button>
              <button
                type="button"
                onClick={() => setPostText((p) => `${p} @HermesBrain`)}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#BF40FF] flex items-center gap-0.5 cursor-pointer"
              >
                <AtSign size={10} />
                <span>@Hermes</span>
              </button>
              <button
                type="button"
                onClick={() => setHasMedia(!hasMedia)}
                className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-all ${
                  hasMedia ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30 font-bold" : "bg-white/5 border-white/5 text-[#9499B3]"
                }`}
              >
                <ImageIcon size={10} />
                <span>{hasMedia ? "Asset Attached" : "Attach Image"}</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-[10px] text-[#4F536E]">
              Next dispatch slot: Today at 18:00
            </span>

            <button
              type="submit"
              disabled={isOverLimit || !postText.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00d4e0] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={13} />
              <span>{scheduled ? "POST SCHEDULED!" : "DISPATCH BROADCAST"}</span>
            </button>
          </div>
        </form>

        {/* Right Live Social Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold text-[#4F536E]">
              Platform Simulator Viewport:
            </span>

            {/* Platform Selector Buttons */}
            <div className="flex items-center gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedPlatform(p.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    selectedPlatform === p.id
                      ? "bg-white text-black"
                      : "bg-white/5 text-[#9499B3] hover:text-white"
                  }`}
                >
                  {p.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Specific Mockups */}
          {selectedPlatform === "twitter" && (
            <div className="p-4 rounded-2xl bg-[#000000] border border-[#2F3336] text-white font-sans text-xs flex flex-col gap-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#00FF41] text-black font-black flex items-center justify-center text-xs">
                    DN
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-white text-xs">
                      <span>DirtyNest AI</span>
                      <span className="text-[#1DA1F2]">✓</span>
                    </div>
                    <span className="text-[#71767B] text-[11px]">@DirtyNestAI · 2m</span>
                  </div>
                </div>
                <span className="text-[#71767B] text-xs">•••</span>
              </div>

              <p className="text-white text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {postText}
              </p>

              {hasMedia && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#16181C] border border-[#2F3336] relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: "url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80)",
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[#71767B] text-xs pt-2 border-t border-[#2F3336]">
                <span className="flex items-center gap-1 hover:text-[#1DA1F2] cursor-pointer"><MessageSquare size={13} /> 32</span>
                <span className="flex items-center gap-1 hover:text-[#00BA7C] cursor-pointer"><Repeat size={13} /> 124</span>
                <span className="flex items-center gap-1 hover:text-[#F91880] cursor-pointer"><Heart size={13} /> 586</span>
                <span className="flex items-center gap-1 hover:text-[#1DA1F2] cursor-pointer"><Bookmark size={13} /> 94</span>
                <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Share size={13} /></span>
              </div>
            </div>
          )}

          {selectedPlatform === "discord" && (
            <div className="p-4 rounded-2xl bg-[#313338] border border-[#3F4147] text-white font-sans text-xs flex flex-col gap-2 shadow-xl">
              <div className="text-[10px] text-[#949BA4] font-bold uppercase pb-1 border-b border-[#3F4147] flex items-center gap-1">
                <span>#</span>
                <span>announcements</span>
              </div>

              <div className="flex items-start gap-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-[#5865F2] text-white font-black flex items-center justify-center text-xs shrink-0">
                  DN
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#F2F3F5] text-xs">DirtyNest Bot</span>
                    <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase">BOT</span>
                    <span className="text-[10px] text-[#949BA4]">Today at 12:45 PM</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#2B2D31] border-l-4 border-[#00FF41] text-xs text-[#DBDEE1] leading-relaxed whitespace-pre-wrap">
                    {postText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === "telegram" && (
            <div className="p-4 rounded-2xl bg-[#0E1621] border border-[#242F3D] text-white font-sans text-xs flex flex-col gap-2 shadow-xl">
              <div className="text-[10px] text-[#0088CC] font-bold pb-1 border-b border-[#242F3D] flex items-center justify-between">
                <span>DirtyNest Operations Channel</span>
                <span className="text-[#6C7883]">9,200 subscribers</span>
              </div>

              <div className="p-3 rounded-2xl rounded-tl-sm bg-[#182533] border border-[#242F3D] text-[#E4ECF2] text-xs leading-relaxed whitespace-pre-wrap mt-1">
                {postText}
                <div className="text-right text-[10px] text-[#6C7883] mt-2">
                  12:45 PM ✓✓
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === "linkedin" && (
            <div className="p-4 rounded-2xl bg-[#1B1F23] border border-[#383E45] text-white font-sans text-xs flex flex-col gap-2.5 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#0A66C2] text-white font-black flex items-center justify-center text-xs">
                  DN
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">DirtyNest Systems Inc.</span>
                  <span className="text-[10px] text-[#8C929B] block">3,120 followers · 1h · 🌐</span>
                </div>
              </div>

              <p className="text-[#E8E8E8] text-xs leading-relaxed whitespace-pre-wrap">
                {postText}
              </p>

              <div className="flex items-center justify-between text-[#8C929B] text-xs pt-2 border-t border-[#383E45]">
                <span className="flex items-center gap-1 hover:text-white cursor-pointer"><ThumbsUp size={13} /> Like</span>
                <span className="flex items-center gap-1 hover:text-white cursor-pointer"><MessageCircle size={13} /> Comment</span>
                <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Repeat size={13} /> Repost</span>
                <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Send size={13} /> Send</span>
              </div>
            </div>
          )}

          {selectedPlatform === "reddit" && (
            <div className="p-4 rounded-2xl bg-[#1A1A1B] border border-[#343536] text-white font-sans text-xs flex flex-col gap-2 shadow-xl">
              <div className="text-[10px] text-[#818384] flex items-center gap-1.5">
                <span className="font-bold text-white">r/Cyberpunk</span>
                <span>• Posted by u/DirtyNest_Bot 2 hours ago</span>
              </div>

              <h4 className="text-xs font-bold text-[#D7DADC]">
                DirtyNest v2.5 Launch: 100% Hermes Brain & DSP Voice Modulation
              </h4>

              <p className="text-[#D7DADC] text-xs leading-relaxed whitespace-pre-wrap">
                {postText}
              </p>

              <div className="flex items-center gap-4 text-[#818384] text-xs pt-2 border-t border-[#343536]">
                <div className="flex items-center gap-1 bg-[#272729] px-2 py-0.5 rounded-full">
                  <ArrowUp size={13} className="text-[#FF4500]" />
                  <span className="text-[#FF4500] font-bold">1.4k</span>
                  <ArrowDown size={13} />
                </div>
                <span className="flex items-center gap-1"><MessageSquare size={13} /> 86 Comments</span>
                <span className="flex items-center gap-1"><Share size={13} /> Share</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
