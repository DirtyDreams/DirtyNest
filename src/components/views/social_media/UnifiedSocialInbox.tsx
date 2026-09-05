"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  Star,
  Check,
  CheckCircle2,
  Search,
  Bot,
  ThumbsUp,
  AlertTriangle,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface CommunityMessage {
  id: string;
  author: string;
  handle: string;
  avatarBg: string;
  platform: "X / Twitter" | "Discord" | "Telegram" | "LinkedIn" | "Reddit";
  platformColor: string;
  content: string;
  timestamp: string;
  intent: "positive" | "question" | "bug" | "sales" | "neutral";
  isStarred: boolean;
  isReplied: boolean;
  suggestedReplies: {
    helpful: string;
    cyberpunk: string;
    corporate: string;
  };
  replies?: string[];
}

const SAMPLE_INBOX_MESSAGES: CommunityMessage[] = [
  {
    id: "msg-01",
    author: "Alex Rivers",
    handle: "@arivers_dev",
    avatarBg: "#1DA1F2",
    platform: "X / Twitter",
    platformColor: "#1DA1F2",
    content: "Just tested the Web Audio 96kHz DSP soundboard in DirtyNest v3.5. How did you get 0ms latency in the browser without WebAssembly crashes?",
    timestamp: "12m ago",
    intent: "question",
    isStarred: true,
    isReplied: false,
    suggestedReplies: {
      helpful: "We used pure AudioContext procedural oscillators and custom audio buffers with exponential gain ramps! Check out the sound_studio repo for the complete DSP rack implementation.",
      cyberpunk: "Zero latency is achieved by direct neural hardware acceleration over the Web Audio bus. Welcome to the machine, operative ⚡",
      corporate: "Thank you for trying DirtyNest v3.5. Our engineering team engineered the DSP pipeline directly on top of native browser AudioContext nodes for optimal performance.",
    },
  },
  {
    id: "msg-02",
    author: "Kaito Tanaka",
    handle: "Kaito#4089",
    avatarBg: "#5865F2",
    platform: "Discord",
    platformColor: "#5865F2",
    content: "The multi-layer inpainting canvas in Image Studio is absolutely insane. Any plans to add export to PSD or Layered SVG?",
    timestamp: "28m ago",
    intent: "positive",
    isStarred: false,
    isReplied: false,
    suggestedReplies: {
      helpful: "Glad you love it! Yes, we have layered PSD and vector SVG export planned for the next sprint release.",
      cyberpunk: "Layered neural synthesis is just the beginning. Vector export protocols are already compiling in the next node update 🎨",
      corporate: "We appreciate your valuable feedback. Layered SVG export is on our Q3 enterprise roadmap.",
    },
  },
  {
    id: "msg-03",
    author: "Elena Rostova",
    handle: "@elena_secops",
    avatarBg: "#0088CC",
    platform: "Telegram",
    platformColor: "#0088CC",
    content: "Found a small visual glitch when scaling zoom to 200% on ultra-wide screens in Canvas Studio Pro. Everything else is rock solid.",
    timestamp: "1h ago",
    intent: "bug",
    isStarred: true,
    isReplied: false,
    suggestedReplies: {
      helpful: "Thanks for reporting Elena! We just patched the CSS transform-origin bounding box in the latest build. Should be smooth now.",
      cyberpunk: "Bug acknowledged and quarantined by Hermes Defense subsystem. Telemetry patched in node root 🛡️",
      corporate: "Thank you for submitting this report. Our QA team has logged this issue and deployed a hotfix to production.",
    },
  },
  {
    id: "msg-04",
    author: "Marcus Vance",
    handle: "Marcus Vance · VP of Product",
    avatarBg: "#0A66C2",
    platform: "LinkedIn",
    platformColor: "#0A66C2",
    content: "We are looking to deploy an autonomous cybersecurity command center across our 50-person security operations center. Can we schedule an enterprise demo?",
    timestamp: "2h ago",
    intent: "sales",
    isStarred: true,
    isReplied: false,
    suggestedReplies: {
      helpful: "Hi Marcus! We'd love to set up an interactive enterprise demo for your SOC team. I'll send over a calendar invite shortly.",
      cyberpunk: "Hermes Agent fleet deployment authorized for enterprise scale. Let's schedule an encrypted briefing ⚡",
      corporate: "Hello Marcus, thank you for reaching out. We would be delighted to demonstrate how DirtyNest can streamline your SOC operations. Let's connect via DM.",
    },
  },
  {
    id: "msg-05",
    author: "CyberGhost_99",
    handle: "u/CyberGhost_99",
    avatarBg: "#FF4500",
    platform: "Reddit",
    platformColor: "#FF4500",
    content: "Is DirtyNest completely free and open source? Can I self-host the whole dashboard on my home lab server?",
    timestamp: "3h ago",
    intent: "question",
    isStarred: false,
    isReplied: true,
    suggestedReplies: {
      helpful: "Yes! 100% open source under MIT license. You can clone the repo and run `npm run dev` or self-host in Docker.",
      cyberpunk: "Full sovereignty is the core doctrine. Self-host the node and take control of your machine 🤖",
      corporate: "Yes, DirtyNest is fully open-source and architected for seamless on-premise and local containerized deployment.",
    },
  },
];

export default function UnifiedSocialInbox() {
  const [messages, setMessages] = useState<CommunityMessage[]>(SAMPLE_INBOX_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string>(SAMPLE_INBOX_MESSAGES[0].id);
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "unreplied" | "starred">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customReplyText, setCustomReplyText] = useState("");
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  // Filter Messages
  const filteredMessages = messages.filter((m) => {
    if (platformFilter !== "ALL" && !m.platform.includes(platformFilter)) return false;
    if (statusFilter === "unreplied" && m.isReplied) return false;
    if (statusFilter === "starred" && !m.isStarred) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.author.toLowerCase().includes(q) ||
        m.handle.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle Star
  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    cyberAudio.play("toggle");
    setMessages(messages.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
  };

  // Apply Smart Reply
  const handleSelectSmartReply = (replyText: string) => {
    cyberAudio.play("warp");
    setCustomReplyText(replyText);
  };

  // Send Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReplyText.trim()) return;

    cyberAudio.play("chime");
    setMessages(
      messages.map((m) =>
        m.id === selectedMessageId
          ? {
              ...m,
              isReplied: true,
              replies: [...(m.replies || []), customReplyText.trim()],
            }
          : m
      )
    );

    setStatusNotification(`✓ Reply dispatched to ${selectedMessage.author} on ${selectedMessage.platform}!`);
    setCustomReplyText("");
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const getIntentBadge = (intent: CommunityMessage["intent"]) => {
    switch (intent) {
      case "positive":
        return <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-bold text-[8px] flex items-center gap-1"><ThumbsUp size={10} /> POSITIVE</span>;
      case "question":
        return <span className="px-2 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[8px] flex items-center gap-1"><HelpCircle size={10} /> QUESTION</span>;
      case "bug":
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[8px] flex items-center gap-1"><AlertTriangle size={10} /> BUG REPORT</span>;
      case "sales":
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[8px] flex items-center gap-1"><Briefcase size={10} /> ENTERPRISE LEAD</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-white/5 text-[#9499B3] text-[8px]">NEUTRAL</span>;
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Top Banner */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Inbox size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                UNIFIED COMMUNITY INBOX // <span className="text-[#00FF41]">HERMES SMART REPLY</span>
              </h3>
              <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                OMNICHANNEL DMs & COMMENTS
              </span>
            </div>
            <p className="text-[10px] text-[#4F536E]">
              Aggregated social stream across X, Discord, Telegram, LinkedIn & Reddit with AI reply generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community feed..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-xs text-white placeholder:text-[#4F536E] outline-none w-52 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotification && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Left Message List (5 cols) | Right Thread Detail & Smart Reply (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Message Feed List (5 cols) */}
        <div className="lg:col-span-5 cyber-card p-4 flex flex-col gap-3">
          {/* Feed Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-[10px]">
            <div className="flex items-center gap-1">
              {["ALL", "X", "Discord", "Telegram", "LinkedIn", "Reddit"].map((pl) => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setPlatformFilter(pl);
                  }}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    platformFilter === pl
                      ? "bg-[#00FF41] text-black"
                      : "text-[#9499B3] hover:text-white"
                  }`}
                >
                  {pl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2 py-0.5 rounded ${statusFilter === "all" ? "text-white font-bold" : "text-[#4F536E]"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unreplied")}
                className={`px-2 py-0.5 rounded ${statusFilter === "unreplied" ? "text-[#00FF41] font-bold" : "text-[#4F536E]"}`}
              >
                Unreplied
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("starred")}
                className={`px-2 py-0.5 rounded ${statusFilter === "starred" ? "text-amber-400 font-bold" : "text-[#4F536E]"}`}
              >
                ⭐
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSelectedMessageId(msg.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-white/[0.08] border-[#00FF41]/60 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                      : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60"
                  }`}
                  style={{ borderLeftColor: msg.platformColor, borderLeftWidth: 3 }}
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs text-white truncate">{msg.author}</span>
                      <span className="text-[9px] text-[#4F536E] truncate">{msg.handle}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[8px] text-[#4F536E]">{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(e, msg.id)}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        <Star size={12} className={msg.isStarred ? "text-amber-400 fill-amber-400" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <p className="text-[11px] text-[#9499B3] line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>

                  {/* Footer Badges */}
                  <div className="flex items-center justify-between pt-1">
                    {getIntentBadge(msg.intent)}
                    {msg.isReplied ? (
                      <span className="text-[8px] font-bold text-[#00FF41] flex items-center gap-1">
                        <Check size={10} /> REPLIED
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-amber-400">PENDING REPLY</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Detail & Hermes Smart Reply (7 cols) */}
        {selectedMessage && (
          <div className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs border border-white/20"
                  style={{ backgroundColor: selectedMessage.avatarBg }}
                >
                  {selectedMessage.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{selectedMessage.author}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: `${selectedMessage.platformColor}20`, color: selectedMessage.platformColor }}>
                      {selectedMessage.platform}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4F536E]">{selectedMessage.handle} • {selectedMessage.timestamp}</span>
                </div>
              </div>

              <div>{getIntentBadge(selectedMessage.intent)}</div>
            </div>

            {/* Inbound Message Bubble */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 text-xs text-white leading-relaxed">
              {selectedMessage.content}
            </div>

            {/* Existing Sent Replies if any */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#00FF41] uppercase block">
                  Sent Replies ({selectedMessage.replies.length}):
                </span>
                {selectedMessage.replies.map((rep, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs text-white self-end ml-8"
                  >
                    {rep}
                  </div>
                ))}
              </div>
            )}

            {/* Hermes AI Smart Reply Recommendations */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-[#00F0FF]/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#00F0FF] font-bold text-xs">
                  <Bot size={15} />
                  <span>HERMES AI SMART REPLIES</span>
                </div>
                <span className="text-[9px] text-[#4F536E]">1-CLICK INSERT & EDIT</span>
              </div>

              <div className="space-y-2">
                {/* 1. Helpful */}
                <div
                  onClick={() => handleSelectSmartReply(selectedMessage.suggestedReplies.helpful)}
                  className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#00FF41] cursor-pointer transition-all flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#00FF41] uppercase">💡 Helpful & Technical</span>
                    <span className="text-[9px] text-white/50">USE ➔</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedMessage.suggestedReplies.helpful}</p>
                </div>

                {/* 2. Cyberpunk Hype */}
                <div
                  onClick={() => handleSelectSmartReply(selectedMessage.suggestedReplies.cyberpunk)}
                  className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#00F0FF] cursor-pointer transition-all flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#00F0FF] uppercase">⚡ Cyberpunk Hacker</span>
                    <span className="text-[9px] text-white/50">USE ➔</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedMessage.suggestedReplies.cyberpunk}</p>
                </div>

                {/* 3. Corporate B2B */}
                <div
                  onClick={() => handleSelectSmartReply(selectedMessage.suggestedReplies.corporate)}
                  className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-purple-400 cursor-pointer transition-all flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-purple-400 uppercase">💼 Corporate Professional</span>
                    <span className="text-[9px] text-white/50">USE ➔</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedMessage.suggestedReplies.corporate}</p>
                </div>
              </div>
            </div>

            {/* Custom Reply Form */}
            <form onSubmit={handleSendReply} className="flex flex-col gap-2 pt-1">
              <textarea
                rows={3}
                value={customReplyText}
                onChange={(e) => setCustomReplyText(e.target.value)}
                placeholder={`Reply to ${selectedMessage.author} on ${selectedMessage.platform}...`}
                className="w-full p-3 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none resize-none font-mono"
              />

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#4F536E]">Dispatching via {selectedMessage.platform} Gateway API</span>
                <button
                  type="submit"
                  disabled={!customReplyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all disabled:opacity-40"
                >
                  <Send size={13} />
                  <span>DISPATCH REPLY</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
