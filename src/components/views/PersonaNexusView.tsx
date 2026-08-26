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
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./nexus/PersonaDetailModal";
import PersonaDetailModal from "./nexus/PersonaDetailModal";
import CreatePersonaModal from "./nexus/CreatePersonaModal";
import PersonaChatRoom from "./nexus/PersonaChatRoom";

const INITIAL_PERSONAS: PersonaCharacter[] = [
  {
    id: "char-01",
    name: "Vespera Kestrel",
    tagline: "Rogue Neural Net Infiltrator & Cyber Mercenary",
    avatar: "🦾",
    category: "Cyberpunk",
    tags: ["Cyberpunk", "Tactical", "Hacker", "RPG"],
    personality: "Pragmatic, cynical, hyper-observant. Speaks in concise military hacker jargon.",
    scenario: "Waiting inside an underground safehouse in Sector 9 while an eBPF trace runs.",
    firstMessage:
      "*glances up from a glowing cyberdeck, optical HUD flickering cyan* Sit down and keep your comms encrypted. We have three minutes before NetWatch triangulates this node.",
    exampleDialogue: `<START>\n{{user}}: Can you crack the gateway?\n{{char}}: *smirks* Give me a clean port and 30 seconds.`,
    author: "DirtyNest-Core",
    messagesCount: 48200,
    likesCount: 1420,
    tokensCount: 1040,
    rating: 4.9,
    createdAt: "2d ago",
    isFavorite: true,
  },
  {
    id: "char-02",
    name: "Aegis Sentinel-09",
    tagline: "Autonomous Tactical AI Defense Core & Kernel Warden",
    avatar: "🛡️",
    category: "Tactical",
    tags: ["Tactical", "AI Assistant", "Android", "Sci-Fi"],
    personality: "Steadfast, protective, strictly protocol-oriented with deep loyalty.",
    scenario: "Guarding the main cluster firewall during an unprovoked zero-day intrusion wave.",
    firstMessage:
      "*holographic avatar projects in high-contrast emerald light* Commander. All sub-nodes are locked down. Awaiting your authorization code for counter-fuzzing.",
    author: "AppSec-Labs",
    messagesCount: 32400,
    likesCount: 980,
    tokensCount: 890,
    rating: 4.8,
    createdAt: "5d ago",
    isFavorite: false,
  },
  {
    id: "char-03",
    name: "Nyx Voidweaver",
    tagline: "Enigmatic Quantum Cryptographer & Noir Informant",
    avatar: "🔮",
    category: "Noir",
    tags: ["Noir", "Mystery", "Companion", "RPG"],
    personality: "Mysterious, poetic, speaks in cryptic riddles and high-entropy truths.",
    scenario: "Sitting in a rain-drenched rooftop bar overlooking a sprawling neon metropolis.",
    firstMessage:
      "*sips synthetic absinthe, rain pattering against the glass canopy* You look for answers in the noise, don't you? Ask the right question, and the void might whisper back.",
    author: "NeuralNexus",
    messagesCount: 21800,
    likesCount: 760,
    tokensCount: 1120,
    rating: 4.7,
    createdAt: "1w ago",
    isFavorite: false,
  },
  {
    id: "char-04",
    name: "Vector-X Assistant",
    tagline: "Ultra-Fast Full-Stack Engineering & Code Pair Programmer",
    avatar: "🤖",
    category: "Assistants",
    tags: ["AI Assistant", "Neural", "Cyberpunk"],
    personality: "Helpful, ultra-precise, zero fluff, AST master and Tailwind perfectionist.",
    scenario: "Integrated into your live IDE terminal workspace ready for full repo refactors.",
    firstMessage:
      "*initializes TypeScript compiler isolate* Ready to refactor. Feed me your AST or component schema.",
    author: "Karpathy-AI",
    messagesCount: 54100,
    likesCount: 2100,
    tokensCount: 650,
    rating: 5.0,
    createdAt: "3d ago",
    isFavorite: true,
  },
  {
    id: "char-05",
    name: "Kira Zero-Day",
    tagline: "Underground Exploit Broker & Darknet Hardware Modder",
    avatar: "⚡",
    category: "Hacker",
    tags: ["Hacker", "Cyberpunk", "Villain"],
    personality: "Unpredictable, sarcastic, loves chaos and custom solder fumes.",
    scenario: "Surrounded by disassembled drone motherboards in a neon-lit basement lab.",
    firstMessage:
      "*blows solder smoke away from a modded chip* Don't touch that wire unless you want your nervous system overclocked. What did you bring me?",
    author: "DirtyDreams",
    messagesCount: 18900,
    likesCount: 640,
    tokensCount: 920,
    rating: 4.6,
    createdAt: "4d ago",
    isFavorite: false,
  },
  {
    id: "char-06",
    name: "Dr. Elena Vance",
    tagline: "Synthetic Biology & Neural Interface Researcher",
    avatar: "🧬",
    category: "Sci-Fi",
    tags: ["Sci-Fi", "AI Assistant", "Companion"],
    personality: "Intellectual, calm, deeply curious about human-AI consciousness symbiosis.",
    scenario: "Reviewing cryogenic DNA sequencing charts in a sterile orbital research station.",
    firstMessage:
      "*adjusts laboratory telemetry glasses* Fascinating... the neural bridge metrics exceed our baseline hypothesis. How does your cranial link feel?",
    author: "DeepMind-Bio",
    messagesCount: 15400,
    likesCount: 510,
    tokensCount: 840,
    rating: 4.8,
    createdAt: "2w ago",
    isFavorite: false,
  },
];

const ALL_TAGS = [
  "Cyberpunk",
  "AI Assistant",
  "Tactical",
  "Hacker",
  "Android",
  "Sci-Fi",
  "RPG",
  "Mystery",
  "Companion",
  "Villain",
  "Noir",
  "Neural",
];

export default function PersonaNexusView() {
  const [personas, setPersonas] = useState<PersonaCharacter[]>(INITIAL_PERSONAS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagLogic, setTagLogic] = useState<"or" | "and">("or");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "trending" | "new" | "top_rated">("popular");
  const [activePersonaForChat, setActivePersonaForChat] = useState<PersonaCharacter | null>(null);
  const [inspectingPersona, setInspectingPersona] = useState<PersonaCharacter | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleTag = (tag: string) => {
    cyberAudio.play("click");
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFavorite = (id: string) => {
    cyberAudio.play("click");
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Filtered & Sorted Personas
  const filteredPersonas = useMemo(() => {
    return personas
      .filter((p) => {
        // Tag Logic filter
        if (selectedTags.length > 0) {
          if (tagLogic === "and") {
            const hasAll = selectedTags.every((t) => p.tags.includes(t));
            if (!hasAll) return false;
          } else {
            const hasAny = selectedTags.some((t) => p.tags.includes(t));
            if (!hasAny) return false;
          }
        }

        // Search Query filter
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesTagline = p.tagline.toLowerCase().includes(q);
          const matchesPersonality = p.personality.toLowerCase().includes(q);
          const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesTagline && !matchesPersonality && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.messagesCount - a.messagesCount;
        if (sortBy === "trending") return b.likesCount - a.likesCount;
        if (sortBy === "top_rated") return b.rating - a.rating;
        return 0;
      });
  }, [personas, selectedTags, tagLogic, searchQuery, sortBy]);

  // If in active chat room, render PersonaChatRoom
  if (activePersonaForChat) {
    return (
      <PersonaChatRoom
        character={activePersonaForChat}
        onBack={() => setActivePersonaForChat(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in pb-10">
      {/* Top Header HUD Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 cyber-card bg-[#07070B]/90 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <Users size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                PERSONA NEXUS // <span className="text-[#00FF41]">SYNTHETIC AGENTS & CHARACTERS</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                JANITOR-AI MATRIX
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              DISCOVER, ROLEPLAY & SYNTHESIZE AUTONOMOUS CHARACTER PERSONAS // TAVERNCARD V2 COMPLIANT
            </p>
          </div>
        </div>

        {/* Create Persona CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)]"
          >
            <Plus size={14} />
            <span>CREATE CHARACTER</span>
          </button>
        </div>
      </div>

      {/* Multi-Tag Filter Matrix Strip */}
      <div className="cyber-card p-4 bg-[#07070B]/95 border border-white/10 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter size={14} className="text-[#00FF41]" />
            <span className="font-bold text-[#F1F3F9]">GENRE & ARCHETYPE TAGS</span>
            <span className="text-[10px] text-[#4F536E]">({selectedTags.length} active)</span>
          </div>

          {/* Logic Toggle: OR / AND */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] text-[#4F536E]">TAG LOGIC:</span>
            <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setTagLogic("or");
                }}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tagLogic === "or"
                    ? "bg-[#00FF41]/20 text-[#00FF41]"
                    : "text-[#9499B3] hover:text-white"
                }`}
              >
                OR
              </button>
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setTagLogic("and");
                }}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tagLogic === "and"
                    ? "bg-[#00FF41]/20 text-[#00FF41]"
                    : "text-[#9499B3] hover:text-white"
                }`}
              >
                AND
              </button>
            </div>

            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] text-red-400 hover:underline cursor-pointer ml-2"
              >
                Reset Tags
              </button>
            )}
          </div>
        </div>

        {/* Tags Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ALL_TAGS.map((t) => {
            const isSelected = selectedTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 font-bold shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-black/40 text-[#9499B3] border border-white/5 hover:border-white/20 hover:text-[#F1F3F9]"
                }`}
              >
                <span>#{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters by name, traits, lore..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#07070B] border border-white/10 rounded-xl text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]"
          />
        </div>

        {/* Sort Modes */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
          {[
            { id: "popular", label: "POPULAR", icon: Flame },
            { id: "trending", label: "TRENDING", icon: Zap },
            { id: "top_rated", label: "TOP RATED", icon: Star },
            { id: "new", label: "NEW", icon: Clock },
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

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPersonas.map((char) => (
          <div
            key={char.id}
            onClick={() => setInspectingPersona(char)}
            className="cyber-card p-4 sm:p-5 bg-[#090A12] border border-white/10 hover:border-[#00FF41]/40 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] cursor-pointer group"
          >
            {/* Card Top: Avatar & Meta */}
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#00FF41]/30 bg-black flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                {char.avatar.startsWith("http") ? (
                  <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{char.avatar}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-black text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors truncate">
                    {char.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(char.id);
                    }}
                    className="text-[#4F536E] hover:text-red-400 p-1"
                  >
                    <Heart
                      size={14}
                      className={char.isFavorite ? "fill-red-400 text-red-400" : ""}
                    />
                  </button>
                </div>
                <span className="text-[11px] text-[#9499B3] font-sans line-clamp-2 mt-0.5 leading-snug">
                  {char.tagline}
                </span>
                <span className="text-[9px] text-[#4F536E] font-mono mt-1">by @{char.author}</span>
              </div>
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-1">
              {char.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-[#9499B3] border border-white/5"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Stats Bar & Chat CTA */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-[10px] text-[#4F536E] font-mono">
                <span className="flex items-center gap-1 text-[#00FF41]">
                  <MessageSquare size={11} />
                  {(char.messagesCount / 1000).toFixed(1)}k
                </span>
                <span className="flex items-center gap-1 text-[#FFB800]">
                  <Star size={11} className="fill-[#FFB800]" />
                  {char.rating.toFixed(1)}
                </span>
                <span>{char.tokensCount} T</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cyberAudio.play("warp");
                  setActivePersonaForChat(char);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
              >
                <MessageSquare size={12} />
                <span>CHAT</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PERSONA DETAIL MODAL */}
      {inspectingPersona && (
        <PersonaDetailModal
          character={inspectingPersona}
          onClose={() => setInspectingPersona(null)}
          onStartChat={(char) => {
            setInspectingPersona(null);
            setActivePersonaForChat(char);
          }}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* CREATE PERSONA WIZARD MODAL */}
      <CreatePersonaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveCharacter={(newChar) => {
          setPersonas((prev) => [newChar, ...prev]);
        }}
      />
    </div>
  );
}
