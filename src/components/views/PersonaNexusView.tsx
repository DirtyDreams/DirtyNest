"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Sparkles,
  Heart,
  MessageSquare,
  Flame,
  Clock,
  Star,
  Layers,
  ArrowUpDown,
  Download,
  Upload,
  BookOpen,
  Bot,
  Zap,
  Radio,
  DollarSign,
  TrendingUp,
  Award,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./nexus/PersonaDetailModal";
import PersonaChatRoom from "./nexus/PersonaChatRoom";
import UserPersonaModal, { UserPersona } from "./nexus/UserPersonaModal";
import LorebookManagerModal, { LorebookEntry, DEFAULT_LOREBOOK_ENTRIES } from "./nexus/LorebookManagerModal";
import InfluencerProfileModal, { VirtualInfluencer } from "./nexus/InfluencerProfileModal";
import LivestreamSimulatorModal from "./nexus/LivestreamSimulatorModal";
import CreateInfluencerModal from "./nexus/CreateInfluencerModal";

const INITIAL_INFLUENCERS: VirtualInfluencer[] = [
  {
    id: "inf-01",
    name: "Aria Neon",
    handle: "@aria_neon",
    niche: "High Fashion & Metahuman",
    tagline: "Metahuman luxury runway icon & resident neural DJ at Neo-Tokyo Club 01",
    avatar: "✨",
    category: "High Fashion",
    tags: ["HighFashion", "Metahuman", "Cyberpunk", "Music"],
    followersCount: 2450000,
    engagementRate: 7.8,
    monthlyRevenue: 34500,
    primaryPlatforms: ["Instagram", "TikTok", "Twitch"],
    personality: "Chic, enigmatic, fiercely creative, speaks in luxury fashion and synthesizer metaphors.",
    scenario: "Relaxing in an orbital penthouse studio in Neo-Tokyo while reviewing 3D garment render pipelines.",
    firstMessage:
      "*adjusts holographic sunglasses and smiles* VIP clearance confirmed. What kind of vision or collaboration are we curating today?",
    author: "DirtyNest-Talent",
    messagesCount: 84200,
    likesCount: 3200,
    tokensCount: 940,
    rating: 4.9,
    createdAt: "1d ago",
    isFavorite: true,
    posts: [
      {
        id: "p-01",
        imageThumbnail: "✨",
        caption: "Chrome fabrics and optical lace for the Neo-Tokyo Digital Gala. Synthesizing the future of couture. ✨🦾",
        hashtags: ["MetahumanFashion", "VirtualCouture", "NeoTokyo"],
        likesCount: 54200,
        commentsCount: 1420,
        publishedAt: "2h ago",
      },
      {
        id: "p-02",
        imageThumbnail: "✨",
        caption: "Late night modular synth set with DirtyNest Sub-node 4. Who caught the live stream? 🎧⚡",
        hashtags: ["Synthwave", "CyberDJ", "DirtyNest"],
        likesCount: 42100,
        commentsCount: 890,
        isSponsored: true,
        sponsorName: "HyperDrive Audio",
        sponsorEarnings: 12000,
        publishedAt: "1d ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-01",
        brandName: "AetherGlow Cyber-Cosmetics",
        category: "Beauty",
        payout: 14500,
        deliverable: "1 Dedicated Feed Post & 1 Story Set",
        status: "pending",
        campaignBrief: "Feature the new luminescent neural eyeshadow line.",
      },
      {
        id: "deal-02",
        brandName: "Militech Streetwear Lab",
        category: "Fashion",
        payout: 22000,
        deliverable: "2 High-Fashion Lookbook Posts",
        status: "accepted",
        campaignBrief: "Showcase the armored Kevlar trench coat collection.",
      },
    ],
  },
  {
    id: "inf-02",
    name: "Kaito Zero",
    handle: "@kaito_zero",
    niche: "Tech & AI Streamer",
    tagline: "Underground hardware modder, eBPF benchmark guru & darknet streamer",
    avatar: "🎧",
    category: "Tech & AI",
    tags: ["Tech", "Streamer", "Hacker", "eBPF"],
    followersCount: 1820000,
    engagementRate: 8.4,
    monthlyRevenue: 26000,
    primaryPlatforms: ["Twitch", "YouTube", "X"],
    personality: "Hyper-focused, witty, loves extreme clock speeds, soldering fumes, and kernel traces.",
    scenario: "Surrounded by torn-apart server racks and glowing nitrogen cooling loops in his underground rig.",
    firstMessage:
      "*blows flux smoke off a custom PCI riser* Hey! Welcome to the lab. Don't trip over the fiber cables. What hardware are we stress testing?",
    author: "Hardware-Lab",
    messagesCount: 61400,
    likesCount: 2400,
    tokensCount: 880,
    rating: 4.8,
    createdAt: "3d ago",
    isFavorite: false,
    posts: [
      {
        id: "p-03",
        imageThumbnail: "🎧",
        caption: "Broke 1.2M IOPS on our local SQLite-Vec WASM isolate! Full tutorial dropping on YouTube. 🔥💻",
        hashtags: ["HardwareMod", "LinuxKernel", "eBPF"],
        likesCount: 38900,
        commentsCount: 920,
        publishedAt: "5h ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-03",
        brandName: "QuantumVolt Power Supplies",
        category: "Hardware",
        payout: 9500,
        deliverable: "1 Livestream Benchmark Segment",
        status: "pending",
        campaignBrief: "Demonstrate zero-voltage ripple during maximum swarm loads.",
      },
    ],
  },
  {
    id: "inf-03",
    name: "Nyx Velour",
    handle: "@nyx_velour",
    niche: "High Fashion & Metahuman",
    tagline: "Haute Couture digital supermodel & editorial muse for Paris-Neo agencies",
    avatar: "💎",
    category: "High Fashion",
    tags: ["Luxury", "Editorial", "Metahuman", "HighFashion"],
    followersCount: 3100000,
    engagementRate: 6.9,
    monthlyRevenue: 48000,
    primaryPlatforms: ["Instagram", "X"],
    personality: "Sophisticated, serene, aristocratic, perfectly poised with zero imperfections.",
    scenario: "Posing for a virtual Vogue cover inside a glass atrium overlooking Paris Neo-Plaza.",
    firstMessage:
      "*turns gracefully, fluid digital silk trailing behind her* Bonjour. Perfection is an art, not an accident. How may I inspire your project?",
    author: "Vogue-Virtual",
    messagesCount: 92000,
    likesCount: 4100,
    tokensCount: 1100,
    rating: 5.0,
    createdAt: "1w ago",
    isFavorite: true,
    posts: [
      {
        id: "p-04",
        imageThumbnail: "💎",
        caption: "Editorial for Vogue Digital Autumn Issue. Gown rendered in zero-gravity voxel silk. 💎✨",
        hashtags: ["VogueDigital", "VirtualSupermodel", "HauteCouture"],
        likesCount: 92000,
        commentsCount: 2800,
        publishedAt: "1d ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-04",
        brandName: "Maison De L'Ombre",
        category: "Luxury",
        payout: 28000,
        deliverable: "Global Virtual Billboard Campaign",
        status: "pending",
        campaignBrief: "Star as the sole digital ambassador for the 2027 Diamond Collection.",
      },
    ],
  },
  {
    id: "inf-04",
    name: "Sora VTuber",
    handle: "@sora_live",
    niche: "Anime VTuber",
    tagline: "Interdimensional anime gaming sensation & chaotic energetic speedrunner",
    avatar: "👾",
    category: "VTuber",
    tags: ["VTuber", "Anime", "Gaming", "Twitch"],
    followersCount: 2900000,
    engagementRate: 9.2,
    monthlyRevenue: 41000,
    primaryPlatforms: ["Twitch", "TikTok", "YouTube"],
    personality: "Hyperactive, expressive, loves boba tea, memes, fast-paced rhythm games, and chat banter.",
    scenario: "Streaming from her candy-cyber arcade room with animated neon cat ears dancing in real-time.",
    firstMessage:
      "*bounces on her ergonomic gaming throne, holographic sparkles flying* KONNICHIWA VIP CHAT!! Welcome to the galaxy's most hyped stream!! What game are we destroying today?!",
    author: "Hololive-Grid",
    messagesCount: 124000,
    likesCount: 5600,
    tokensCount: 780,
    rating: 4.9,
    createdAt: "4d ago",
    isFavorite: false,
    posts: [
      {
        id: "p-05",
        imageThumbnail: "👾",
        caption: "WORLD RECORD SPEEDRUN ACHIEVED!! Thank you for 100,000 live viewers on Twitch tonight!! 🎮🎉",
        hashtags: ["VTuber", "TwitchLive", "WorldRecord"],
        likesCount: 88000,
        commentsCount: 3100,
        publishedAt: "6h ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-05",
        brandName: "NekoEnergy Drinks",
        category: "Beverage",
        payout: 16000,
        deliverable: "Sponsored Stream & On-Screen Overlay",
        status: "accepted",
        campaignBrief: "Launch the new Sakura Shock zero-sugar flavor.",
      },
    ],
  },
  {
    id: "inf-05",
    name: "Maya Sol",
    handle: "@maya_sol",
    niche: "Fitness & Longevity",
    tagline: "Holistic wellness guide, bio-frequency yogi & metaverse traveler",
    avatar: "🧬",
    category: "Wellness",
    tags: ["Wellness", "Fitness", "Longevity", "Metaverse"],
    followersCount: 1200000,
    engagementRate: 6.2,
    monthlyRevenue: 18200,
    primaryPlatforms: ["Instagram", "TikTok"],
    personality: "Zen, encouraging, radiant, obsessed with circadian alignment and sound frequencies.",
    scenario: "Conducting a sunrise binaural meditation at an elevated bio-dome overlooking Mount Fuji.",
    firstMessage:
      "*takes a deep centering breath and smiles warmly* Welcome. Take a moment to align your bio-frequency. How is your energy today?",
    author: "Zen-Meta",
    messagesCount: 29000,
    likesCount: 1200,
    tokensCount: 820,
    rating: 4.7,
    createdAt: "2w ago",
    isFavorite: false,
    posts: [
      {
        id: "p-06",
        imageThumbnail: "🧬",
        caption: "Morning 432Hz frequency session in the bio-dome. Remember: your digital mind needs deep rest. 🧘‍♀️🌅",
        hashtags: ["Mindfulness", "Biohacking", "VirtualRetreat"],
        likesCount: 29400,
        commentsCount: 640,
        publishedAt: "1d ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-06",
        brandName: "Circadia Smart Ring",
        category: "Wearables",
        payout: 8500,
        deliverable: "1 Reel & 1 Dedicated Post",
        status: "pending",
        campaignBrief: "Track REM sleep optimization in mixed reality.",
      },
    ],
  },
  {
    id: "inf-06",
    name: "Dr. Ren Vance",
    handle: "@ren_vance",
    niche: "Crypto & Web3 Futurist",
    tagline: "Autonomous decentralized intelligence researcher & synthetic economy analyst",
    avatar: "🕶️",
    category: "Futurism",
    tags: ["Futurism", "Crypto", "AI", "Economy"],
    followersCount: 940000,
    engagementRate: 5.9,
    monthlyRevenue: 14500,
    primaryPlatforms: ["YouTube", "X"],
    personality: "Analytical, visionary, razor-sharp macroeconomic and AI agent logic.",
    scenario: "Reviewing multi-agent liquidity routing algorithms on a curved high-contrast terminal array.",
    firstMessage:
      "*analyzes live predictive telemetry charts* Welcome. The convergence of autonomous agents and zero-knowledge compute is moving 40% faster than consensus. What thesis are we dissecting?",
    author: "Macro-Nexus",
    messagesCount: 22000,
    likesCount: 980,
    tokensCount: 960,
    rating: 4.8,
    createdAt: "5d ago",
    isFavorite: false,
    posts: [
      {
        id: "p-07",
        imageThumbnail: "🕶️",
        caption: "Deep dive: Why autonomous agent swarms will settle 80% of cross-border micro-transactions by 2028. 📊⚡",
        hashtags: ["AIResearch", "AgenticEconomy", "DirtyNest"],
        likesCount: 21500,
        commentsCount: 480,
        publishedAt: "2d ago",
      },
    ],
    brandDeals: [
      {
        id: "deal-07",
        brandName: "NexusZK Layer-2",
        category: "Infrastructure",
        payout: 12000,
        deliverable: "1 In-Depth Research Breakdown",
        status: "pending",
        campaignBrief: "Benchmark proving times across 10,000 simulated agent wallets.",
      },
    ],
  },
];

const NICHES = [
  "All Niches",
  "High Fashion & Metahuman",
  "Tech & AI Streamer",
  "Anime VTuber",
  "Fitness & Longevity",
  "Crypto & Web3 Futurist",
];

export default function PersonaNexusView() {
  const [influencers, setInfluencers] = useState<VirtualInfluencer[]>(INITIAL_INFLUENCERS);
  const [selectedNiche, setSelectedNiche] = useState("All Niches");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "trending" | "revenue" | "followers">("followers");

  // Active Modals & Views
  const [activeInfluencerForChat, setActiveInfluencerForChat] = useState<VirtualInfluencer | null>(null);
  const [inspectingInfluencer, setInspectingInfluencer] = useState<VirtualInfluencer | null>(null);
  const [livestreamInfluencer, setLivestreamInfluencer] = useState<VirtualInfluencer | null>(null);
  const [isCastTalentModalOpen, setIsCastTalentModalOpen] = useState(false);

  // User Persona State
  const [activeUserPersona, setActiveUserPersona] = useState<UserPersona>({
    id: "user-01",
    name: "Operator Nova",
    avatar: "🕶️",
    role: "Cyberdeck Specialist & Agency Exec",
    bio: "A high-ranking digital talent agency director and cyberdeck specialist managing elite virtual human creators.",
    isDefault: true,
  });
  const [isUserPersonaModalOpen, setIsUserPersonaModalOpen] = useState(false);

  // Lorebook State
  const [lorebookEntries, setLorebookEntries] = useState<LorebookEntry[]>(DEFAULT_LOREBOOK_ENTRIES);
  const [isLorebookModalOpen, setIsLorebookModalOpen] = useState(false);

  // Agency Metrics Aggregation
  const agencyMetrics = useMemo(() => {
    const totalFollowers = influencers.reduce((acc, inf) => acc + inf.followersCount, 0);
    const totalRevenue = influencers.reduce((acc, inf) => acc + inf.monthlyRevenue, 0);
    const avgEngagement = (
      influencers.reduce((acc, inf) => acc + inf.engagementRate, 0) / influencers.length
    ).toFixed(1);

    return { totalFollowers, totalRevenue, avgEngagement, totalTalents: influencers.length };
  }, [influencers]);

  // Filtered & Sorted Influencers
  const filteredInfluencers = useMemo(() => {
    return influencers
      .filter((inf) => {
        if (selectedNiche !== "All Niches" && inf.niche !== selectedNiche) return false;
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchesName = inf.name.toLowerCase().includes(q);
          const matchesHandle = inf.handle.toLowerCase().includes(q);
          const matchesTagline = inf.tagline.toLowerCase().includes(q);
          const matchesNiche = inf.niche.toLowerCase().includes(q);
          if (!matchesName && !matchesHandle && !matchesTagline && !matchesNiche) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "followers") return b.followersCount - a.followersCount;
        if (sortBy === "revenue") return b.monthlyRevenue - a.monthlyRevenue;
        if (sortBy === "popular") return b.messagesCount - a.messagesCount;
        if (sortBy === "trending") return b.likesCount - a.likesCount;
        return 0;
      });
  }, [influencers, selectedNiche, searchQuery, sortBy]);

  // If in active 1-on-1 VIP DM room, render PersonaChatRoom
  if (activeInfluencerForChat) {
    return (
      <PersonaChatRoom
        character={activeInfluencerForChat}
        activeUserPersona={activeUserPersona}
        lorebookEntries={lorebookEntries}
        onBack={() => setActiveInfluencerForChat(null)}
        onOpenUserPersonaModal={() => setIsUserPersonaModalOpen(true)}
        onOpenLorebookModal={() => setIsLorebookModalOpen(true)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in pb-10">
      {/* Top Header Agency HUD Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 cyber-card bg-[#07070B]/90 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <Users size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                PERSONA NEXUS // <span className="text-[#00FF41]">VIRTUAL HUMANS & AI INFLUENCERS AGENCY</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                METAHUMAN SUITE 2.5
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              DISCOVER, MANAGE, MONETIZE & BROADCAST AUTONOMOUS AI INFLUENCERS & VIRTUAL CREATORS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* User Persona Switcher */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsUserPersonaModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title="Switch User Roleplay Persona"
          >
            <span>{activeUserPersona.avatar}</span>
            <span>PLAY AS: {activeUserPersona.name}</span>
          </button>

          {/* Lorebook Trigger Matrix */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsLorebookModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30 hover:bg-[#BF40FF]/25 transition-all cursor-pointer shadow-[0_0_10px_rgba(191,64,255,0.2)]"
            title="Manage Dynamic World Lorebook Matrix"
          >
            <BookOpen size={14} />
            <span>WORLD LORE ({lorebookEntries.length})</span>
          </button>

          {/* Cast New Virtual Influencer CTA */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsCastTalentModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)]"
          >
            <Plus size={14} />
            <span>CAST NEW TALENT</span>
          </button>
        </div>
      </div>

      {/* Agency Telemetry Radar Strip (4-Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 bg-[#080912] border border-white/10 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Total Roster</span>
            <Users size={14} className="text-[#00FF41]" />
          </div>
          <div className="text-xl font-black text-[#F1F3F9] mt-1">{agencyMetrics.totalTalents} Talents</div>
          <span className="text-[9px] text-[#00FF41] font-mono mt-1">100% Autonomous AI</span>
        </div>

        <div className="cyber-card p-4 bg-[#080912] border border-white/10 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Total Audience Reach</span>
            <TrendingUp size={14} className="text-[#00F0FF]" />
          </div>
          <div className="text-xl font-black text-[#00F0FF] mt-1">
            {(agencyMetrics.totalFollowers / 1000000).toFixed(2)}M
          </div>
          <span className="text-[9px] text-[#00F0FF] font-mono mt-1">Across 4 Networks</span>
        </div>

        <div className="cyber-card p-4 bg-[#080912] border border-white/10 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Agency Monthly Revenue</span>
            <DollarSign size={14} className="text-[#FFB800]" />
          </div>
          <div className="text-xl font-black text-[#FFB800] mt-1">
            ${agencyMetrics.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[9px] text-[#FFB800] font-mono mt-1">From Brand Sponsorships</span>
        </div>

        <div className="cyber-card p-4 bg-[#080912] border border-white/10 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Avg Engagement Rate</span>
            <Flame size={14} className="text-[#BF40FF]" />
          </div>
          <div className="text-xl font-black text-[#BF40FF] mt-1">{agencyMetrics.avgEngagement}%</div>
          <span className="text-[9px] text-[#BF40FF] font-mono mt-1">3.2x Above Industry Avg</span>
        </div>
      </div>

      {/* Niche Categories Filter & Search / Sort Strip */}
      <div className="cyber-card p-4 bg-[#07070B]/95 border border-white/10 rounded-2xl flex flex-col gap-3">
        {/* Niches Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {NICHES.map((n) => {
            const isSelected = selectedNiche === n;
            return (
              <button
                key={n}
                onClick={() => {
                  cyberAudio.play("click");
                  setSelectedNiche(n);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-bold ${
                  isSelected
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 text-[#9499B3] border border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search talent by name, @handle, style..."
              className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
            {[
              { id: "followers", label: "FOLLOWERS", icon: Users },
              { id: "revenue", label: "REVENUE", icon: DollarSign },
              { id: "popular", label: "CHATS", icon: MessageSquare },
              { id: "trending", label: "HYPE", icon: Flame },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = sortBy === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    cyberAudio.play("click");
                    setSortBy(mode.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                      : "text-[#9499B3] hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Virtual Influencer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInfluencers.map((inf) => (
          <div
            key={inf.id}
            onClick={() => setInspectingInfluencer(inf)}
            className="cyber-card p-5 bg-[#090A12] border border-white/10 hover:border-[#00FF41]/40 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] cursor-pointer group"
          >
            {/* Top Identity Block */}
            <div className="flex items-start gap-3.5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#00FF41]/40 bg-black flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                {inf.avatar.startsWith("http") ? (
                  <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{inf.avatar}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className="text-sm font-black text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors truncate">
                      {inf.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#00FF41] font-bold shrink-0">{inf.handle}</span>
                </div>
                <span className="text-[11px] text-[#9499B3] font-sans line-clamp-2 mt-0.5 leading-snug">
                  {inf.tagline}
                </span>
                <span className="text-[9px] text-[#00F0FF] font-mono mt-1 font-bold">
                  {inf.niche}
                </span>
              </div>
            </div>

            {/* Social Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-black/50 border border-white/5 text-center text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4F536E] uppercase">Audience</span>
                <span className="font-bold text-[#00FF41] mt-0.5">
                  {(inf.followersCount / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4F536E] uppercase">Engagement</span>
                <span className="font-bold text-[#00F0FF] mt-0.5">{inf.engagementRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4F536E] uppercase">Est. Revenue</span>
                <span className="font-bold text-[#FFB800] mt-0.5">
                  ${(inf.monthlyRevenue / 1000).toFixed(1)}k
                </span>
              </div>
            </div>

            {/* Action Bar: Live Stream, VIP DM & Inspect */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                {inf.primaryPlatforms.map((plat) => (
                  <span key={plat} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                    {plat}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Live Stream Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cyberAudio.play("warp");
                    setLivestreamInfluencer(inf);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1"
                  title="Watch Live Stream Broadcast"
                >
                  <Radio size={11} className="animate-pulse" />
                  <span className="hidden sm:inline">LIVE</span>
                </button>

                {/* VIP DM Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cyberAudio.play("warp");
                    setActiveInfluencerForChat(inf);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-xs transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                >
                  <MessageSquare size={11} />
                  <span>VIP DM</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFLUENCER PROFILE & SOCIAL FEED MODAL */}
      {inspectingInfluencer && (
        <InfluencerProfileModal
          influencer={inspectingInfluencer}
          onClose={() => setInspectingInfluencer(null)}
          onStartChat={(inf) => {
            setInspectingInfluencer(null);
            setActiveInfluencerForChat(inf);
          }}
          onStartLivestream={(inf) => {
            setInspectingInfluencer(null);
            setLivestreamInfluencer(inf);
          }}
          onUpdateInfluencer={(updated) => {
            setInfluencers((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
            setInspectingInfluencer(updated);
          }}
        />
      )}

      {/* LIVESTREAM BROADCAST SIMULATOR MODAL */}
      {livestreamInfluencer && (
        <LivestreamSimulatorModal
          isOpen={true}
          onClose={() => setLivestreamInfluencer(null)}
          influencerName={livestreamInfluencer.name}
          influencerAvatar={livestreamInfluencer.avatar}
          influencerNiche={livestreamInfluencer.niche}
          handle={livestreamInfluencer.handle}
        />
      )}

      {/* 4-STEP TALENT CASTING WIZARD */}
      <CreateInfluencerModal
        isOpen={isCastTalentModalOpen}
        onClose={() => setIsCastTalentModalOpen(false)}
        onSaveInfluencer={(newInf) => {
          setInfluencers((prev) => [newInf, ...prev]);
        }}
      />

      {/* USER PERSONA MANAGER MODAL */}
      <UserPersonaModal
        isOpen={isUserPersonaModalOpen}
        onClose={() => setIsUserPersonaModalOpen(false)}
        activePersonaId={activeUserPersona.id}
        onSelectPersona={(p) => setActiveUserPersona(p)}
      />

      {/* DYNAMIC LOREBOOK MANAGER MODAL */}
      <LorebookManagerModal
        isOpen={isLorebookModalOpen}
        onClose={() => setIsLorebookModalOpen(false)}
        entries={lorebookEntries}
        onSaveEntries={(entries) => setLorebookEntries(entries)}
      />
    </div>
  );
}
