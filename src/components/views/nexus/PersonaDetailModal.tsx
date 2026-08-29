"use client";

import { useState } from "react";
import { X, MessageSquare, Heart, Copy, Check, Download } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface PersonaCharacter {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  category: string;
  tags: string[];
  personality: string;
  scenario: string;
  firstMessage: string;
  exampleDialogue?: string;
  author: string;
  messagesCount: number;
  likesCount: number;
  tokensCount: number;
  rating: number;
  createdAt: string;
  isFavorite?: boolean;
}

interface Props {
  character: PersonaCharacter;
  onClose: () => void;
  onStartChat: (character: PersonaCharacter) => void;
  onToggleFavorite: (id: string) => void;
}

export default function PersonaDetailModal({
  character,
  onClose,
  onStartChat,
  onToggleFavorite,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "definition" | "dialogue">("overview");
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(
      `[Character: ${character.name}]\n[Personality: ${character.personality}]\n[Scenario: ${character.scenario}]`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    cyberAudio.play("click");
    const tavernCardV2 = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: character.name,
        description: character.tagline,
        personality: character.personality,
        scenario: character.scenario,
        first_mes: character.firstMessage,
        mes_example: character.exampleDialogue || "",
        creator_notes: `Exported from DirtyNest Persona Nexus · Created by ${character.author}`,
        tags: character.tags,
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: [],
        character_book: undefined,
      },
    };

    const blob = new Blob([JSON.stringify(tavernCardV2, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${character.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-taverncard-v2.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-2xl cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[88vh]">
        {/* Modal Header with Character Backdrop */}
        <div className="relative p-6 bg-gradient-to-b from-[#00FF41]/10 via-black/60 to-[#0A0C14] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00FF41]/50 shadow-[0_0_20px_rgba(0,255,65,0.3)] shrink-0 bg-black flex items-center justify-center text-2xl font-black text-[#00FF41]">
              {character.avatar.startsWith("http") ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{character.avatar}</span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F1F3F9] tracking-wide">{character.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                  {character.category}
                </span>
              </div>
              <p className="text-xs text-[#9499B3] font-sans mt-0.5">{character.tagline}</p>
              <span className="text-[10px] text-[#4F536E] mt-1 font-mono">
                By @{character.author} · Created {character.createdAt}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                cyberAudio.play("click");
                onToggleFavorite(character.id);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                character.isFavorite
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : "bg-white/5 text-[#9499B3] border-white/10 hover:text-white"
              }`}
              title="Bookmark / Favorite"
            >
              <Heart size={16} className={character.isFavorite ? "fill-red-400" : ""} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-black/40 border-b border-white/5 text-center text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase">Total Chats</span>
            <span className="font-bold text-[#00FF41] mt-0.5">
              {(character.messagesCount / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase">Rating</span>
            <span className="font-bold text-[#FFB800] mt-0.5">★ {character.rating.toFixed(1)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase">Tokens</span>
            <span className="font-bold text-[#00F0FF] mt-0.5">{character.tokensCount} T</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4F536E] uppercase">Likes</span>
            <span className="font-bold text-[#BF40FF] mt-0.5">{character.likesCount}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 text-xs">
          {[
            { id: "overview", label: "OVERVIEW & GREETING" },
            { id: "definition", label: "PERSONALITY & SCENARIO" },
            { id: "dialogue", label: "DIALOGUE EXAMPLES" },
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
        <div className="flex-1 p-6 overflow-y-auto font-sans text-xs space-y-4 text-[#9499B3] leading-relaxed">
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#4F536E] uppercase font-bold tracking-wider">
                  Initial Greeting Message:
                </span>
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-[#F1F3F9] font-mono text-xs leading-relaxed italic">
                  &ldquo;{character.firstMessage}&rdquo;
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#4F536E] uppercase font-bold tracking-wider">
                  Assigned Genre Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {character.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "definition" && (
            <div className="space-y-4 animate-fade-in font-mono">
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
                  Personality Traits & Behavioral Architecture:
                </span>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#00F0FF] leading-relaxed">
                  {character.personality}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
                  Scenario & World Setting:
                </span>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#F1F3F9] leading-relaxed">
                  {character.scenario}
                </div>
              </div>
            </div>
          )}

          {activeTab === "dialogue" && (
            <div className="space-y-3 animate-fade-in font-mono">
              <span className="text-[10px] text-[#4F536E] uppercase font-bold tracking-wider">
                Few-Shot Example Dialogues:
              </span>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#BF40FF] leading-relaxed whitespace-pre-wrap">
                {character.exampleDialogue ||
                  `<START>\n{{user}}: How do we breach the security perimeter?\n{{char}}: *smirks and taps the console* Hand me the bypass key. We have 45 seconds before the daemon notices.`}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 px-6 bg-[#0A0C14] border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#9499B3] hover:text-[#F1F3F9] transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
              <span>{copied ? "COPIED" : "COPY PROMPT"}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF]/15 transition-all cursor-pointer flex items-center gap-1.5"
              title="Export TavernCard V2 JSON"
            >
              <Download size={13} />
              <span>EXPORT JSON</span>
            </button>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("warp");
              onStartChat(character);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] cursor-pointer flex items-center gap-2"
          >
            <MessageSquare size={14} className="fill-black" />
            <span>ENTER CHAT ROOM</span>
          </button>
        </div>
      </div>
    </div>
  );
}
