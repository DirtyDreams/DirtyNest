"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  User,
  Camera,
  Video,
  Radio,
  Globe,
  DollarSign,
  Tag,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { VirtualInfluencer } from "./InfluencerProfileModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveInfluencer: (influencer: VirtualInfluencer) => void;
}

const AVATAR_PRESETS = ["🦾", "✨", "🎧", "🔮", "💎", "🧬", "🕶️", "🗡️", "👾", "👗"];

const NICHES = [
  "Cyberpunk & Music",
  "High Fashion & Metahuman",
  "Tech & AI Streamer",
  "Anime VTuber",
  "Fitness & Longevity",
  "Crypto & Web3 Futurist",
];

const PLATFORMS = ["Instagram", "TikTok", "Twitch", "X / Twitter", "YouTube"];

export default function CreateInfluencerModal({
  isOpen,
  onClose,
  onSaveInfluencer,
}: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("@");
  const [niche, setNiche] = useState("High Fashion & Metahuman");
  const [tagline, setTagline] = useState("");
  const [avatar, setAvatar] = useState("✨");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "Instagram",
    "TikTok",
  ]);
  const [followersCount, setFollowersCount] = useState("1250000");

  // Step 2 & 3
  const [personality, setPersonality] = useState("");
  const [scenario, setScenario] = useState("");
  const [catchphrase, setCatchphrase] = useState("");
  const [firstPost, setFirstPost] = useState("");
  const [firstGreeting, setFirstGreeting] = useState("");

  if (!isOpen) return null;

  const togglePlatform = (p: string) => {
    cyberAudio.play("click");
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("chime");

    const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
    const parsedFollowers = parseInt(followersCount, 10) || 500000;

    const newInfluencer: VirtualInfluencer = {
      id: `inf-${Date.now().toString(36)}`,
      name: name.trim() || "Nova Synth",
      handle: cleanHandle,
      tagline: tagline.trim() || `Autonomous ${niche} Creator`,
      avatar,
      niche,
      category: niche.split(" ")[0] || "Influencer",
      tags: [niche.split(" ")[0] || "VirtualHuman", "Influencer", "AI"],
      followersCount: parsedFollowers,
      engagementRate: 6.8,
      monthlyRevenue: Math.round((parsedFollowers / 1000) * 18),
      primaryPlatforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["Instagram"],
      personality:
        personality.trim() ||
        "Charismatic, chic, trendsetting, and highly engaged with digital culture.",
      scenario:
        scenario.trim() ||
        "Based in a virtual high-rise studio in Neo-Tokyo, producing cutting-edge digital fashion drops.",
      firstMessage:
        firstGreeting.trim() ||
        `*glances at the incoming VIP ping and smiles* Welcome to my private channel! What collaboration do you have in mind?`,
      author: "Agency-Admin",
      messagesCount: 1,
      likesCount: 100,
      tokensCount: 920,
      rating: 5.0,
      createdAt: "Just now",
      isFavorite: true,
      posts: [
        {
          id: `post-init-${Date.now()}`,
          imageThumbnail: avatar,
          caption:
            firstPost.trim() ||
            `Official launch with DirtyNest Virtual Talent Agency! Synced neural aesthetics live. ⚡✨ #VirtualHuman #AI`,
          hashtags: ["VirtualHuman", "AIInfluencer", "DirtyNest"],
          likesCount: 24500,
          commentsCount: 680,
          publishedAt: "Just now",
        },
      ],
      brandDeals: [
        {
          id: `deal-1-${Date.now()}`,
          brandName: "AetherGlow Cosmetics",
          category: "Beauty",
          payout: 12000,
          deliverable: "1 Dedicated Feed Post & 1 Reel",
          status: "pending",
          campaignBrief: "Showcase the new cybernetic holographic lip glow line.",
        },
      ],
    };

    onSaveInfluencer(newInfluencer);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-xl cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0A0C16] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                VIRTUAL HUMAN TALENT CASTING STUDIO
              </h3>
              <span className="text-[10px] text-[#9499B3]">
                Step {step} of 4 // Synthesize AI Influencer
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#4F536E] hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: IDENTITY & SOCIAL HANDLES */}
        {step === 1 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Avatar / Icon</label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center cursor-pointer transition-all ${
                      avatar === emoji
                        ? "bg-[#00FF41]/20 border-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                        : "bg-black/40 border-white/10 hover:border-white/30"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Influencer Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aria Neon"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Social Handle</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@aria_neon"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#00FF41] outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Niche Specialization</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Primary Channels</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                      selectedPlatforms.includes(p)
                        ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 font-bold"
                        : "bg-black/40 text-[#9499B3] border-white/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT: STYLE & TONE</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONALITY & CATCHPHRASES */}
        {step === 2 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Tagline / Social Bio
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Metahuman fashion icon & neural synth DJ based in Neo-Tokyo"
                className="w-full px-3.5 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Behavioral Tone & Personality Directives
              </label>
              <textarea
                rows={4}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="High-fashion, sharp wit, trendsetter, energetic on stream, luxurious in DMs..."
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT: SCENARIO & LAUNCH</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCENARIO & FIRST POST */}
        {step === 3 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Studio Setting / World Scenario
              </label>
              <textarea
                rows={3}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Broadcasting from an orbital digital penthouse during a virtual runway rehearsal..."
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                First Viral Social Post Caption
              </label>
              <textarea
                rows={3}
                value={firstPost}
                onChange={(e) => setFirstPost(e.target.value)}
                placeholder="Officially signed with DirtyNest Talent Agency! Dropping our virtual lookbook tonight. ✨🦾 #AI #Fashion"
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.4)]"
              >
                CAST TALENT TO AGENCY ROSTER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
