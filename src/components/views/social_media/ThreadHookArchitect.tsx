"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  Flame,
  ArrowUp,
  ArrowDown,
  Wand2,
  CheckCircle2,
  MessageSquare,
  Repeat,
  Heart,
  Send,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface TweetNode {
  id: string;
  text: string;
}

const VIRAL_HOOK_TEMPLATES = [
  {
    id: "controversy",
    category: "Controversial Truth",
    title: "99% of Devs Are Doing This Wrong",
    text: "99% of developers are still building web apps the 2022 way.\n\nHere is how autonomous AI agents and local neural networks completely destroyed traditional full-stack workflows in 2026 🧵👇",
  },
  {
    id: "blueprint",
    category: "Zero to Hero Blueprint",
    title: "The Exact Step-by-Step Framework",
    text: "I spent 6 months building an autonomous cybersecurity dashboard with zero external APIs.\n\nHere is the exact step-by-step architecture you can replicate in under 10 minutes 🧵👇",
  },
  {
    id: "mistake",
    category: "Costly Mistake Breakdown",
    title: "A $50,000 Cloud Mistake",
    text: "We almost lost $50,000 on runaway GPU instances.\n\nHere are the 4 guardrails you MUST implement before deploying your first autonomous agent fleet 🧵👇",
  },
  {
    id: "future",
    category: "Next-Gen Tech Vision",
    title: "The Future of Cybernetics",
    text: "Web Audio DSP + Local Diffusion is the most underrated stack in 2026.\n\nHere is why you should stop building boring CRUD apps and start building cybernetic workstations 🧵👇",
  },
];

const CTA_CLOSERS = [
  "If you found this valuable:\n1. Retweet the first tweet 🔁\n2. Follow @DirtyNestAI for daily autonomous engineering breakdowns ⚡",
  "Want to test this live?\nJoin our private Discord community & clone the open-source repo at dirtynest.systems 🚀",
  "Drop your thoughts below 👇 What is the #1 tool in your autonomous AI stack right now?",
];

export default function ThreadHookArchitect() {
  const [tweets, setTweets] = useState<TweetNode[]>([
    {
      id: "t-1",
      text: VIRAL_HOOK_TEMPLATES[0].text,
    },
    {
      id: "t-2",
      text: "1/ First principle: Stop relying on cloud latency for UI sound effects. By moving DSP to client-side Web Audio API, we achieved 0ms latency with procedural synthesizers.",
    },
    {
      id: "t-3",
      text: "2/ Second principle: Multi-layer canvas editors with hardware acceleration allow inpainting & generative fill without sending huge raw files across networks.",
    },
    {
      id: "t-4",
      text: CTA_CLOSERS[0],
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);
  const [scheduledStatus, setScheduledStatus] = useState<string | null>(null);

  // Add Tweet
  const handleAddTweet = () => {
    cyberAudio.play("click");
    const newTweet: TweetNode = {
      id: `t-${Date.now()}`,
      text: `${tweets.length + 1}/ `,
    };
    setTweets([...tweets, newTweet]);
  };

  // Remove Tweet
  const handleRemoveTweet = (id: string) => {
    if (tweets.length <= 1) return;
    cyberAudio.play("click");
    setTweets(tweets.filter((t) => t.id !== id));
  };

  // Move Tweet
  const handleMoveTweet = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tweets.length - 1)
    )
      return;

    cyberAudio.play("click");
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newTweets = [...tweets];
    const temp = newTweets[index];
    newTweets[index] = newTweets[targetIdx];
    newTweets[targetIdx] = temp;
    setTweets(newTweets);
  };

  // Update Tweet Text
  const handleUpdateTweet = (id: string, text: string) => {
    setTweets(tweets.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  // Apply Hook
  const handleApplyHook = (hookText: string) => {
    cyberAudio.play("warp");
    const newTweets = [...tweets];
    newTweets[0] = { ...newTweets[0], text: hookText };
    setTweets(newTweets);
  };

  // Apply CTA
  const handleApplyCta = (ctaText: string) => {
    cyberAudio.play("warp");
    const newTweets = [...tweets];
    newTweets[newTweets.length - 1] = { ...newTweets[newTweets.length - 1], text: ctaText };
    setTweets(newTweets);
  };

  // Schedule Thread
  const handleScheduleThread = () => {
    cyberAudio.play("chime");
    setScheduledStatus(`✓ Thread with ${tweets.length} tweets scheduled across X & Threads!`);
    setTimeout(() => setScheduledStatus(null), 3500);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Top Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 flex items-center justify-center text-[#1DA1F2] shadow-[0_0_15px_rgba(29,161,242,0.2)]">
            <Share2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                VIRAL THREAD & HOOK ARCHITECT // <span className="text-[#1DA1F2]">X & THREADS</span>
              </h3>
              <span className="text-[9px] font-bold text-[#1DA1F2] px-2 py-0.5 rounded bg-[#1DA1F2]/10 border border-[#1DA1F2]/30">
                RETENTION ENGINE
              </span>
            </div>
            <p className="text-[10px] text-[#4F536E]">
              Compose high-converting multi-tweet stories with automated numbering, hooks & CTA closers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScheduleThread}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1DA1F2] hover:bg-[#1a90d9] text-white font-extrabold text-xs cursor-pointer shadow-[0_0_15px_rgba(29,161,242,0.3)] transition-all"
          >
            <Send size={14} />
            <span>SCHEDULE FULL THREAD ({tweets.length})</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {scheduledStatus && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} />
          <span>{scheduledStatus}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Left Thread Builder (7 cols) | Right Viral Hooks Library (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Thread Cards List (7 cols) */}
        <div className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              THREAD TIMELINE ({tweets.length} POSTS)
            </span>
            <button
              type="button"
              onClick={handleAddTweet}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1DA1F2]/15 text-[#1DA1F2] border border-[#1DA1F2]/40 text-[10px] font-bold hover:bg-[#1DA1F2]/25 cursor-pointer"
            >
              <Plus size={12} />
              <span>ADD TWEET</span>
            </button>
          </div>

          {/* List of Tweet Edit Cards */}
          <div className="space-y-3">
            {tweets.map((tweet, index) => {
              const charCount = tweet.text.length;
              const isOverLimit = charCount > 280;

              return (
                <div
                  key={tweet.id}
                  className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-2 relative group focus-within:border-[#1DA1F2]/60 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 text-[#1DA1F2] font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-bold text-[#9499B3]">
                        {index === 0 ? "🎣 MASTER HOOK TWEET" : index === tweets.length - 1 ? "🎯 CTA CLOSER" : `POST ${index + 1} OF ${tweets.length}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveTweet(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTweet(index, "down")}
                        disabled={index === tweets.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={12} />
                      </button>
                      {tweets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTweet(tweet.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tweet Content Input */}
                  <textarea
                    rows={3}
                    value={tweet.text}
                    onChange={(e) => handleUpdateTweet(tweet.id, e.target.value)}
                    placeholder="Write tweet content here..."
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-[#4F536E] focus:border-[#1DA1F2] outline-none resize-none font-mono"
                  />

                  {/* Card Footer: Character Count */}
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[#4F536E]">X & Threads Compatibility</span>
                    <span
                      className={`font-bold ${
                        isOverLimit
                          ? "text-rose-400 font-black"
                          : charCount > 240
                          ? "text-amber-400"
                          : "text-[#00FF41]"
                      }`}
                    >
                      {charCount} / 280 CHARS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddTweet}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#9499B3] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus size={14} />
            <span>ADD NEXT TWEET TO THREAD</span>
          </button>
        </div>

        {/* Right: Viral Hooks & CTA Library (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Viral Hooks Library */}
          <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[#1DA1F2] font-bold text-xs">
                <Flame size={15} />
                <span>VIRAL HOOK TEMPLATES</span>
              </div>
              <span className="text-[9px] font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                HIGH CTR
              </span>
            </div>

            <div className="space-y-2">
              {VIRAL_HOOK_TEMPLATES.map((hk) => (
                <div
                  key={hk.id}
                  className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-[#1DA1F2]/50 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#1DA1F2] uppercase">{hk.category}</span>
                    <button
                      type="button"
                      onClick={() => handleApplyHook(hk.text)}
                      className="px-2 py-0.5 rounded bg-[#1DA1F2]/15 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] text-[9px] font-bold border border-[#1DA1F2]/40 cursor-pointer"
                    >
                      USE AS HOOK
                    </button>
                  </div>
                  <span className="text-xs font-bold text-white">{hk.title}</span>
                  <p className="text-[10px] text-[#9499B3] line-clamp-2 leading-relaxed">
                    {hk.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Closer Templates */}
          <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[#00FF41] font-bold text-xs">
                <Repeat size={15} />
                <span>CALL-TO-ACTION (CTA) CLOSERS</span>
              </div>
            </div>

            <div className="space-y-2">
              {CTA_CLOSERS.map((cta, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-1 text-[10px]"
                >
                  <p className="text-slate-300 line-clamp-2">{cta}</p>
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyCta(cta)}
                      className="px-2 py-0.5 rounded bg-[#00FF41]/15 hover:bg-[#00FF41]/30 text-[#00FF41] text-[9px] font-bold border border-[#00FF41]/40 cursor-pointer"
                    >
                      USE AS CTA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
