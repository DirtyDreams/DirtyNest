"use client";

import { useState } from "react";
import { Send, Sparkles, Image as ImageIcon, Music, Paperclip, Check, Eye, MessageSquare, Heart, Repeat, Share } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export type SocialPlatform = "twitter" | "discord" | "telegram" | "linkedin" | "reddit";

interface PlatformDef {
  id: SocialPlatform;
  name: string;
  color: string;
  maxChars: number;
  handle: string;
}

const PLATFORMS: PlatformDef[] = [
  { id: "twitter", name: "X / Twitter", color: "#00F0FF", maxChars: 280, handle: "@DirtyNestAI" },
  { id: "discord", name: "Discord Announce", color: "#BF40FF", maxChars: 2000, handle: "#announcements" },
  { id: "telegram", name: "Telegram Channel", color: "#00FF41", maxChars: 4096, handle: "@dirtynest_ops" },
  { id: "linkedin", name: "LinkedIn Tech", color: "#00F0FF", maxChars: 3000, handle: "DirtyNest Systems" },
  { id: "reddit", name: "Reddit /r/Cyberpunk", color: "#FFB800", maxChars: 4000, handle: "u/DirtyNest_Bot" },
];

interface Props {
  onSchedulePost: (post: { platform: SocialPlatform; text: string; hasMedia: boolean }) => void;
}

export default function MultiPlatformComposer({ onSchedulePost }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("twitter");
  const [postText, setPostText] = useState(
    "🚀 DirtyNest v2.5 is officially live! Featuring Hermes Agent 100% autonomous Master Brain, zero-trust container sockets, and real-time DSP voice synthesis for Virtual Influencers. Try the demo now: https://dirtynest.ai #Cyberpunk #AI #HermesAgent"
  );
  const [hasMedia, setHasMedia] = useState(true);
  const [scheduled, setScheduled] = useState(false);

  const activePlatformDef = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const charCount = postText.length;
  const isOverLimit = charCount > activePlatformDef.maxChars;

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
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Send size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              OMNICHANNEL COMPOSER // <span className="text-[#00F0FF]">LIVE BROADCASTER</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Compose & schedule synchronized dispatches across X, Discord, Telegram & Reddit
            </p>
          </div>
        </div>

        {/* Platform Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setSelectedPlatform(p.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                selectedPlatform === p.id
                  ? "bg-black text-white shadow-[0_0_10px_currentColor]"
                  : "bg-white/5 border-white/5 text-[#9499B3] hover:text-white"
              }`}
              style={{
                borderColor: selectedPlatform === p.id ? p.color : undefined,
                color: selectedPlatform === p.id ? p.color : undefined,
              }}
            >
              {p.name.split("/")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Editor (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#4F536E] mb-1">
              <span>POST COPY // {activePlatformDef.handle}</span>
              <span className={isOverLimit ? "text-[#FF2A6D] font-bold" : "text-[#00FF41]"}>
                {charCount} / {activePlatformDef.maxChars} chars
              </span>
            </div>
            <textarea
              rows={5}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed shadow-inner"
            />
          </div>

          {/* Media Attachments Strip */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasMedia(!hasMedia)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  hasMedia
                    ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41]"
                    : "bg-white/5 border-white/5 text-[#9499B3]"
                }`}
              >
                <ImageIcon size={12} />
                <span>IMAGE ATTACHED</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-[#9499B3] cursor-pointer"
              >
                <Music size={12} />
                <span>VOCAL STEM</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isOverLimit || !postText.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00d4e0] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {scheduled ? "POST SCHEDULED!" : "SCHEDULE DISPATCH"}
            </button>
          </div>
        </form>

        {/* Right Live Device Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-[#4F536E] px-1">
            Live Platform Feed Preview:
          </span>

          <div className="p-3.5 rounded-2xl bg-black/80 border border-white/10 flex flex-col gap-2 text-xs">
            {/* Header Identity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] text-black"
                  style={{ background: activePlatformDef.color }}
                >
                  DN
                </div>
                <div>
                  <span className="font-bold text-[#F1F3F9] block text-xs">DirtyNest AI</span>
                  <span className="text-[9px] text-[#4F536E] block">{activePlatformDef.handle}</span>
                </div>
              </div>
              <span className="text-[9px] text-[#4F536E]">Just now</span>
            </div>

            {/* Post Content */}
            <p className="text-xs text-[#F1F3F9] font-sans leading-relaxed whitespace-pre-wrap">
              {postText}
            </p>

            {/* Attached Media Thumbnail */}
            {hasMedia && (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80)",
                  }}
                />
              </div>
            )}

            {/* Fake Engagement Bar */}
            <div className="flex items-center justify-between text-[11px] text-[#4F536E] pt-2 border-t border-white/5">
              <div className="flex items-center gap-1 hover:text-[#00F0FF] cursor-pointer">
                <MessageSquare size={12} />
                <span>24</span>
              </div>
              <div className="flex items-center gap-1 hover:text-[#00FF41] cursor-pointer">
                <Repeat size={12} />
                <span>88</span>
              </div>
              <div className="flex items-center gap-1 hover:text-[#FF2A6D] cursor-pointer">
                <Heart size={12} />
                <span>412</span>
              </div>
              <div className="flex items-center gap-1 hover:text-white cursor-pointer">
                <Share size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
