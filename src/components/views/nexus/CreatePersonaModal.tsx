"use client";

import { useState } from "react";
import {
  X,
  Upload,
  Sparkles,
  Bot,
  Check,
  ArrowRight,
  Download,
  FileCode,
  Layers,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./PersonaDetailModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (character: PersonaCharacter) => void;
}

const DEFAULT_AVATARS = ["🦾", "⚡", "🔮", "🗡️", "🥷", "👾", "🤖", "🕶️", "📡", "🧬"];

const SUGGESTED_TAGS = [
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

export default function CreatePersonaModal({ isOpen, onClose, onSaveCharacter }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [category, setCategory] = useState("Cyberpunk");
  const [tags, setTags] = useState<string[]>(["Cyberpunk", "Tactical"]);
  const [personality, setPersonality] = useState("");
  const [scenario, setScenario] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [exampleDialogue, setExampleDialogue] = useState("");

  if (!isOpen) return null;

  const toggleTag = (t: string) => {
    cyberAudio.play("click");
    setTags((prev) => (prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]));
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      cyberAudio.play("warp");

      // Check for TavernCard V2 standard
      if (json.spec === "chara_card_v2" && json.data) {
        const d = json.data;
        setName(d.name || "");
        setTagline(d.description || "");
        setPersonality(d.personality || "");
        setScenario(d.scenario || "");
        setFirstMessage(d.first_mes || "");
        setExampleDialogue(d.mes_example || "");
        if (Array.isArray(d.tags)) setTags(d.tags);
      } else if (json.name) {
        // Fallback for simple persona JSON
        setName(json.name || "");
        setTagline(json.tagline || json.description || "");
        setPersonality(json.personality || "");
        setScenario(json.scenario || "");
        setFirstMessage(json.firstMessage || json.first_mes || "");
        if (Array.isArray(json.tags)) setTags(json.tags);
      }
    } catch {
      alert("Failed to parse TavernCard JSON file.");
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    cyberAudio.play("chime");

    const newChar: PersonaCharacter = {
      id: `char-${Date.now().toString(36)}`,
      name: name.trim() || "CYBER-PERSONA",
      tagline: tagline.trim() || "Autonomous Synthetic Persona",
      avatar,
      category,
      tags: tags.length > 0 ? tags : ["Cyberpunk"],
      personality: personality.trim() || "Pragmatic, sharp, and highly analytical.",
      scenario: scenario.trim() || "Stationed at DirtyNest Sub-node 4.",
      firstMessage:
        firstMessage.trim() ||
        `*boots up optical sensors and nods* Identity verified. What are our mission parameters?`,
      exampleDialogue: exampleDialogue.trim(),
      author: "Operator",
      messagesCount: 1,
      likesCount: 0,
      tokensCount: Math.round((personality.length + scenario.length + firstMessage.length) / 3.8),
      rating: 5.0,
      createdAt: "Just now",
      isFavorite: false,
    };

    onSaveCharacter(newChar);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-xl cyber-card bg-[#05060A] border border-[#00FF41]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#0A0C14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
                PERSONA CREATOR STUDIO
              </h3>
              <span className="text-[10px] text-[#9499B3]">
                Step {step} of 3 // TavernCard V2 Compliant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#00F0FF] border border-white/10 cursor-pointer">
              <Upload size={13} />
              <span>IMPORT JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button onClick={onClose} className="p-1.5 text-[#4F536E] hover:text-[#F1F3F9] cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* STEP 1: IDENTITY & AVATAR */}
        {step === 1 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Avatar / Icon</label>
              <div className="flex items-center gap-2 flex-wrap">
                {DEFAULT_AVATARS.map((emoji) => (
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

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Persona Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vespera Kestrel"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Short Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Rogue Neural Net Specialist & Cyber Mercenary"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Category & Genre Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                      tags.includes(t)
                        ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 font-bold"
                        : "bg-black/40 text-[#9499B3] border-white/5 hover:border-white/20"
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
              >
                <span>NEXT: BEHAVIOR</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONALITY & SCENARIO */}
        {step === 2 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Personality Traits & System Directives
              </label>
              <textarea
                rows={4}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Describe personality, tone, quirks, speech patterns, and emotional boundaries..."
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                World Setting & Scenario Prompt
              </label>
              <textarea
                rows={3}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Where does the story take place? (e.g. Neon-lit back alley in Neo-Warsaw after an eBPF perimeter breach)..."
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
                className="px-5 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
              >
                <span>NEXT: DIALOGUES</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FIRST MESSAGE & EXAMPLES */}
        {step === 3 && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                First Message / Initial Greeting (*actions allowed*)
              </label>
              <textarea
                rows={4}
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="*leans back in her ergonomic chair, eyes glowing with HUD overlays* You took your time. The packet sniffer is ready."
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Example Dialogues (Optional)
              </label>
              <textarea
                rows={3}
                value={exampleDialogue}
                onChange={(e) => setExampleDialogue(e.target.value)}
                placeholder="<START>\n{{user}}: What is our plan?\n{{char}}: *smiles coldly* Total data liberation."
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
                PUBLISH PERSONA TO NEXUS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
