"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Eye,
  Heart,
  Repeat,
  Share,
  Radio,
  MessageCircle,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Cpu,
  Loader2,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { SAMPLE_ASSETS } from "../image_studio/GeneratedAssetsGallery";

export type SocialPlatform = "twitter" | "instagram" | "tiktok" | "facebook" | "reddit";

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
  { id: "twitter", name: "X / Twitter", badge: "X", color: "#1DA1F2", maxChars: 280, handle: "@DirtyNestAI", channelName: "x.com" },
  { id: "instagram", name: "Instagram", badge: "IG", color: "#E1306C", maxChars: 2200, handle: "@dirtynest_cyber", channelName: "Feed & Reels" },
  { id: "tiktok", name: "TikTok", badge: "TIKTOK", color: "#00F0FF", maxChars: 4000, handle: "@dirtynest_ops", channelName: "Video Feed" },
  { id: "facebook", name: "Facebook", badge: "FB", color: "#1877F2", maxChars: 5000, handle: "DirtyNest Operations", channelName: "Page Feed" },
  { id: "reddit", name: "Reddit", badge: "REDDIT", color: "#FF4500", maxChars: 40000, handle: "u/DirtyNest_Bot", channelName: "r/Cyberpunk" },
];

const QUICK_EMOJIS = ["🚀", "⚡", "🤖", "🛡️", "💎", "🔥", "📊", "👁️", "🧠", "🎯"];
const QUICK_HASHTAGS = ["#Cyberpunk", "#AutonomousAI", "#NextJS", "#WebAudio", "#AgenticAI", "#DirtyNest"];

interface Props {
  onSchedulePost: (post: { platform: SocialPlatform; text: string; hasMedia: boolean; mediaUrls?: string[]; status?: "approved" | "awaiting_hitl" | "scheduled" | "draft" }) => void;
  initialText?: string;
}

export default function MultiPlatformComposer({ onSchedulePost, initialText }: Props) {
  const [selectedPreviewPlatform, setSelectedPreviewPlatform] = useState<SocialPlatform>("twitter");
  const [activeBroadcasts, setActiveBroadcasts] = useState<SocialPlatform[]>(["twitter", "instagram", "tiktok", "facebook", "reddit"]);

  // Editing Tab: "master" or a specific platform
  const [activeEditTab, setActiveEditTab] = useState<"master" | SocialPlatform>("master");

  // Master Text
  const [masterText, setMasterText] = useState(
    initialText ??
    "🚀 DirtyNest v3.5 is officially live!\n\nFeaturing:\n⚡ 100% Hermes Agent Autonomous Master Brain\n🛡️ Zero-Trust Socket Interceptors & Audit Logs\n🎙️ Real-time Web Audio DSP Voice Synthesizer & Soundboard\n\nTry the interactive cyber dashboard now: https://dirtynest.ai\n\n#Cyberpunk #HermesAgent #Nextjs #AI"
  );

  useEffect(() => {
    if (initialText) {
      setMasterText(initialText);
    }
  }, [initialText]);

  // Per-Platform Customized Texts
  const [platformTexts, setPlatformTexts] = useState<Record<SocialPlatform, string>>({
    twitter: "🚀 DirtyNest v3.5 is live! Autonomous cybernetic command center with Hermes Master Brain, Web Audio 96kHz DSP soundboard & local multi-layer canvas studio.\n\nTry it now: https://dirtynest.ai\n\n#Cyberpunk #NextJS #AI",
    instagram: "Visual transmission from DirtyNest Cyber Command. Local neural rendering via ComfyUI (RTX 3060) & autonomous Hermes agents.\n\nLink in bio.\n\n#Cyberpunk #AIGenerated #ComfyUI #CyberAesthetics",
    tiktok: "Cyberpunk Command Center setup! ⚡ 100% autonomous agentic workflow with local GPU acceleration and real-time DSP soundboard.\n\n#Cyberpunk #TechTok #AgenticAI #Coding",
    facebook: "DirtyNest Systems update: Deploying full local AI workstation control with real-time process telemetry and container sandboxes.\n\nCheck out our GitHub release at https://dirtynest.ai",
    reddit: "DirtyNest v3.5 is an open-source cyberpunk command center built with Next.js Turbopack, Web Audio API DSP synthesis, and local multi-layer canvas inpainting. Check out the live demo and let us know what features you want next!",
  });

  // Reddit Specific Title
  const [redditTitle, setRedditTitle] = useState("Showcase: Built a complete Cyberpunk Command Center with Web Audio Synth & AI Studio");

  // Media Attachments & ComfyUI Studio
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [scheduledStatus, setScheduledStatus] = useState<string | null>(null);
  const [comfyHistoryImages, setComfyHistoryImages] = useState<string[]>([]);
  const [comfyPromptInput, setComfyPromptInput] = useState("");
  const [isGeneratingComfy, setIsGeneratingComfy] = useState(false);

  // Get current active editing text
  const currentEditText = activeEditTab === "master" ? masterText : platformTexts[activeEditTab];

  // Set current active editing text
  const handleUpdateText = (val: string) => {
    if (activeEditTab === "master") {
      setMasterText(val);
    } else {
      setPlatformTexts({ ...platformTexts, [activeEditTab]: val });
    }
  };

  // Sync from Master
  const handleSyncFromMaster = () => {
    if (activeEditTab === "master") return;
    cyberAudio.play("warp");
    setPlatformTexts({ ...platformTexts, [activeEditTab]: masterText });
  };

  // Toggle Broadcast Channel
  const toggleBroadcast = (id: SocialPlatform) => {
    cyberAudio.play("click");
    setActiveBroadcasts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Insert Emoji
  const handleInsertEmoji = (emoji: string) => {
    cyberAudio.play("click");
    handleUpdateText(currentEditText + " " + emoji);
  };

  // Insert Hashtag
  const handleInsertHashtag = (tag: string) => {
    cyberAudio.play("click");
    handleUpdateText(currentEditText + " " + tag);
  };

  // Add Image from Vault
  const handleSelectVaultImage = (url: string) => {
    if (attachedImages.includes(url) || attachedImages.length >= 4) return;
    cyberAudio.play("warp");
    setAttachedImages([...attachedImages, url]);
    setShowVaultPicker(false);
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    cyberAudio.play("click");
    setAttachedImages(attachedImages.filter((_, i) => i !== index));
  };

  // Upload Local Image
  const handleUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && attachedImages.length < 4) {
      cyberAudio.play("chime");
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setAttachedImages([...attachedImages, ev.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Schedule / Dispatch Posts to all active broadcasts
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeBroadcasts.length === 0) return;

    cyberAudio.play("chime");
    activeBroadcasts.forEach((plat) => {
      const textToUse = platformTexts[plat] || masterText;
      onSchedulePost({
        platform: plat,
        text: plat === "reddit" ? `[${redditTitle}]\n\n${textToUse}` : textToUse,
        hasMedia: attachedImages.length > 0,
        mediaUrls: attachedImages,
        status: autoApprove ? "approved" : "awaiting_hitl",
      });
    });

    setScheduledStatus(`✓ Dispatched to ${activeBroadcasts.length} synchronized social networks!`);
    setTimeout(() => setScheduledStatus(null), 3500);
  };

  const activePlatformDef = PLATFORMS.find((p) => p.id === (activeEditTab === "master" ? "twitter" : activeEditTab)) || PLATFORMS[0];
  const previewPlatformDef = PLATFORMS.find((p) => p.id === selectedPreviewPlatform) || PLATFORMS[0];
  const previewText = platformTexts[selectedPreviewPlatform] || masterText;
  const charCount = currentEditText.length;
  const isOverLimit = activeEditTab !== "master" && charCount > activePlatformDef.maxChars;

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Broadcast Target Channels Bar */}
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
                    : "bg-white/5 border-white/5 opacity-40 hover:opacity-80 text-[#9499B3]"
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

      {/* Status Bar */}
      {scheduledStatus && (
        <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} />
          <span>{scheduledStatus}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Left Composer Tabs (7 cols) | Right Live Simulators (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Composer Workstation (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 cyber-card p-4 sm:p-5 flex flex-col gap-4">
          {/* Header with Edit Tabs */}
          <div className="flex flex-col gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
                  <Send size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#F1F3F9] uppercase">
                    OMNICHANNEL DRAFTING MATRIX
                  </h3>
                  <span className="text-[10px] text-[#4F536E]">
                    Customize copy per network or synchronize from master
                  </span>
                </div>
              </div>

              {activeEditTab !== "master" && (
                <button
                  type="button"
                  onClick={handleSyncFromMaster}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#00FF41] font-bold cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>SYNC FROM MASTER</span>
                </button>
              )}
            </div>

            {/* Sub-Tabs: Master vs Platforms */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveEditTab("master");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeEditTab === "master"
                    ? "bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)] font-black"
                    : "bg-white/5 text-[#9499B3] hover:text-white"
                }`}
              >
                🌐 MASTER (ALL)
              </button>

              {PLATFORMS.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setActiveEditTab(pl.id);
                    setSelectedPreviewPlatform(pl.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    activeEditTab === pl.id
                      ? "bg-black/90 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border-transparent text-[#9499B3] hover:text-white"
                  }`}
                  style={{
                    borderColor: activeEditTab === pl.id ? pl.color : undefined,
                    color: activeEditTab === pl.id ? pl.color : undefined,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: pl.color }} />
                  <span>{pl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reddit Specific Title Field */}
          {activeEditTab === "reddit" && (
            <div>
              <label className="text-[10px] text-[#FF4500] font-bold block mb-1">
                REDDIT POST TITLE:
              </label>
              <input
                type="text"
                value={redditTitle}
                onChange={(e) => setRedditTitle(e.target.value)}
                placeholder="Catchy cyberpunk title for r/Cyberpunk..."
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#FF4500] outline-none font-mono"
              />
            </div>
          )}

          {/* Main Textarea */}
          <div className="relative">
            <textarea
              rows={6}
              value={currentEditText}
              onChange={(e) => handleUpdateText(e.target.value)}
              placeholder="Draft your omnichannel publication here..."
              className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00F0FF] outline-none resize-none font-mono leading-relaxed"
            />

            {/* Character Limit Badge */}
            <div className="absolute bottom-3 right-3 text-[10px] font-mono">
              <span
                className={`px-2 py-0.5 rounded-md ${
                  isOverLimit
                    ? "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40"
                    : "text-[#9499B3] bg-black/80"
                }`}
              >
                {charCount} / {activePlatformDef.maxChars} chars
              </span>
            </div>
          </div>

          {/* Emoji & Hashtag Quick Tools Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
            {/* Emojis */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#4F536E] mr-1">EMOJI:</span>
              {QUICK_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleInsertEmoji(em)}
                  className="hover:scale-125 transition-transform cursor-pointer text-sm"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Hashtags */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {QUICK_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertHashtag(tag)}
                  className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#00F0FF] hover:border-[#00F0FF]/40 border border-white/5 transition-all cursor-pointer font-bold"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Media Carousel Attachments Strip */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#F1F3F9] flex items-center gap-1.5">
                <ImageIcon size={13} className="text-[#00FF41]" />
                <span>ATTACHED MEDIA CAROUSEL ({attachedImages.length}/4)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    setShowVaultPicker(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-bold hover:bg-[#00FF41]/25 cursor-pointer shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                >
                  <FolderOpen size={11} />
                  <span>FROM IMAGE VAULT</span>
                </button>

                <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#9499B3] hover:text-white font-bold cursor-pointer">
                  <Paperclip size={11} />
                  <span>UPLOAD</span>
                  <input type="file" accept="image/*" onChange={handleUploadLocal} className="hidden" />
                </label>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {attachedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {attachedImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/15 group"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imgUrl})` }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                      title="Remove image"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <label className="flex items-center gap-2 text-[10px] text-[#9499B3] hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-black/60 border-white/20 text-[#00FF41] focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-[#00FF41]">HITL PRE-APPROVAL:</span>
              <span>Enable live broadcast without secondary queue clearance</span>
            </label>

            <button
              type="submit"
              disabled={isOverLimit || activeBroadcasts.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all disabled:opacity-40"
            >
              <Send size={14} />
              <span>DISPATCH OMNICHANNEL BROADCAST</span>
            </button>
          </div>
        </form>

        {/* Right: Live Interactive Network Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3">
            {/* Simulator Header & Platform Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Eye size={14} className="text-[#00F0FF]" />
                <span>LIVE NETWORK SIMULATOR</span>
              </div>

              {/* Selector Pills */}
              <div className="flex items-center gap-1">
                {PLATFORMS.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedPreviewPlatform(pl.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      selectedPreviewPlatform === pl.id
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-[#4F536E] hover:text-white"
                    }`}
                  >
                    {pl.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* X / Twitter Simulator */}
            {selectedPreviewPlatform === "twitter" && (
              <div className="p-3.5 rounded-2xl bg-black border border-white/15 text-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/20 border border-[#1DA1F2]/50 flex items-center justify-center text-[#1DA1F2] font-black text-xs">
                      DN
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-xs">DirtyNest Systems</span>
                        <span className="text-[#1DA1F2] text-[10px]">✓</span>
                      </div>
                      <span className="text-[10px] text-[#4F536E]">@DirtyNestAI · Just now</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#1DA1F2]">𝕏</span>
                </div>

                <p className="text-white text-xs leading-relaxed whitespace-pre-line font-sans">
                  {previewText}
                </p>

                {attachedImages.length > 0 && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${attachedImages[0]})` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-[#4F536E]">
                  <span className="flex items-center gap-1 hover:text-[#1DA1F2] cursor-pointer">
                    <MessageCircle size={12} /> 14
                  </span>
                  <span className="flex items-center gap-1 hover:text-[#00FF41] cursor-pointer">
                    <Repeat size={12} /> 38
                  </span>
                  <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                    <Heart size={12} /> 245
                  </span>
                  <span className="flex items-center gap-1 hover:text-[#1DA1F2] cursor-pointer">
                    <Share size={12} />
                  </span>
                </div>
              </div>
            )}

            {/* Instagram Simulator */}
            {selectedPreviewPlatform === "instagram" && (
              <div className="p-3.5 rounded-2xl bg-black text-white text-xs flex flex-col gap-2.5 font-sans border border-[#E1306C]/40">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-[#E1306C]">
                        DN
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">dirtynest_cyber</span>
                      <span className="text-[9px] text-[#A8A8A8]">Original audio</span>
                    </div>
                  </div>
                  <span className="text-[#E1306C] font-bold text-[10px]">INSTAGRAM</span>
                </div>

                {attachedImages.length > 0 && (
                  <div className="relative aspect-square max-h-64 rounded-xl overflow-hidden border border-white/10 bg-black">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${attachedImages[0]})` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-sm text-white">
                  <div className="flex items-center gap-3">
                    <span className="hover:text-[#E1306C] cursor-pointer"><Heart size={16} /></span>
                    <span className="hover:text-[#00F0FF] cursor-pointer"><MessageCircle size={16} /></span>
                    <span className="hover:text-[#00FF41] cursor-pointer"><Send size={15} /></span>
                  </div>
                  <span className="text-[10px] text-[#A8A8A8]">1,420 likes</span>
                </div>

                <p className="text-[#F1F3F9] text-xs leading-relaxed whitespace-pre-line font-sans">
                  <span className="font-bold mr-1.5 text-white">dirtynest_cyber</span>
                  {previewText}
                </p>
                <span className="text-[9px] text-[#737373] uppercase">2 hours ago</span>
              </div>
            )}

            {/* TikTok Simulator */}
            {selectedPreviewPlatform === "tiktok" && (
              <div className="p-3.5 rounded-2xl bg-[#010101] text-white text-xs flex flex-col gap-2.5 font-sans border border-[#00F0FF]/40">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] text-[#8A8B91]">
                  <span>TikTok Video Transmission</span>
                  <span className="text-[#00F0FF] font-bold">TIKTOK</span>
                </div>

                <div className="relative aspect-video max-h-60 rounded-xl overflow-hidden border border-white/10 bg-[#121212] flex flex-col justify-end p-3">
                  {attachedImages.length > 0 && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-80"
                      style={{ backgroundImage: `url(${attachedImages[0]})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Floating Action Column */}
                  <div className="absolute right-2 bottom-3 flex flex-col items-center gap-2.5 z-10">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-rose-500">
                        <Heart size={14} />
                      </div>
                      <span className="text-[9px] font-bold text-white">18.4K</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white">
                        <MessageCircle size={14} />
                      </div>
                      <span className="text-[9px] font-bold text-white">524</span>
                    </div>
                  </div>

                  {/* Caption & Account */}
                  <div className="relative z-10 pr-10">
                    <span className="font-bold text-white text-xs block mb-1">@dirtynest_ops</span>
                    <p className="text-white text-[11px] leading-snug line-clamp-3">
                      {previewText}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#00F0FF]">
                      <Radio size={11} className="animate-pulse" />
                      <span>♫ DirtyNest Cyber Synth (Original Audio)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Facebook Simulator */}
            {selectedPreviewPlatform === "facebook" && (
              <div className="p-3.5 rounded-2xl bg-[#18191A] text-white text-xs flex flex-col gap-2.5 font-sans border border-[#1877F2]/40">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-xs">
                      f
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">DirtyNest Systems</span>
                      <span className="text-[9px] text-[#B0B3B8]">Public · Just now</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1877F2]">FACEBOOK</span>
                </div>

                <p className="text-[#E4E6EB] text-xs leading-relaxed whitespace-pre-line">
                  {previewText}
                </p>

                {attachedImages.length > 0 && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${attachedImages[0]})` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] text-[#B0B3B8]">
                  <span className="flex items-center gap-1 text-[#1877F2]">👍 142 Likes</span>
                  <span>28 Comments · 14 Shares</span>
                </div>
              </div>
            )}

            {/* Reddit Simulator */}
            {selectedPreviewPlatform === "reddit" && (
              <div className="p-3.5 rounded-2xl bg-[#1A1A1B] text-white text-xs flex flex-col gap-2 font-sans border border-[#FF4500]/40">
                <div className="flex items-center justify-between text-[10px] text-[#818384]">
                  <span>r/Cyberpunk · Posted by u/DirtyNest_Bot</span>
                  <span className="text-[#FF4500] font-bold">REDDIT</span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug">
                  {redditTitle}
                </h4>

                <p className="text-[#D7DADC] text-xs leading-relaxed whitespace-pre-line">
                  {previewText}
                </p>

                {attachedImages.length > 0 && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 mt-1">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${attachedImages[0]})` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 text-[10px] text-[#818384]">
                  <span className="flex items-center gap-1 font-bold text-[#FF4500]">
                    ▲ 428 Upvotes
                  </span>
                  <span>💬 64 Comments</span>
                  <span>↗ Share</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Studio Vault Selector Modal */}
      {showVaultPicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono">
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 p-5 flex flex-col gap-4 shadow-2xl relative bg-[#090C19] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  COMFYUI NEURAL STUDIO & ARTIFACT VAULT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVaultPicker(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Generator on RTX 3060 */}
            <div className="p-3 rounded-xl bg-black/50 border border-[#00FF41]/30 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#00FF41] font-bold flex items-center gap-1.5">
                  <Sparkles size={12} />
                  <span>RENDER NEW ARTWORK VIA COMFYUI (RTX 3060)</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={comfyPromptInput}
                  onChange={(e) => setComfyPromptInput(e.target.value)}
                  placeholder="Enter visual prompt (e.g. cybernetic hacker terminal neon green)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:outline-none focus:border-[#00FF41]"
                />
                <button
                  type="button"
                  disabled={isGeneratingComfy || !comfyPromptInput.trim()}
                  onClick={async () => {
                    setIsGeneratingComfy(true);
                    cyberAudio.play("warp");
                    try {
                      const res = await fetch("/api/comfyui", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt: comfyPromptInput, width: 768, height: 768 }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.images && data.images[0]) {
                          handleSelectVaultImage(data.images[0]);
                        }
                      }
                    } catch {}
                    setIsGeneratingComfy(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isGeneratingComfy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>{isGeneratingComfy ? "RENDERING..." : "RENDER"}</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-[#9499B3] font-bold">CLICK ASSET TO ATTACH:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...comfyHistoryImages, ...SAMPLE_ASSETS.map((a) => a.url)].map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectVaultImage(imgUrl)}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 hover:border-[#00FF41] cursor-pointer transition-all flex flex-col justify-end p-2"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform"
                    style={{ backgroundImage: `url(${imgUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="relative text-[10px] font-bold text-white truncate z-10">
                    Artifact #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVaultPicker(false)}
                className="px-4 py-1.5 rounded-xl text-xs text-[#9499B3] hover:text-white cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
