"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Sliders,
  RotateCcw,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trash2,
  Volume2,
  StopCircle,
  Copy,
  Cpu,
  Layers,
  Heart,
  Bot,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./PersonaDetailModal";

interface ChatMessage {
  id: string;
  sender: "user" | "char";
  variants: string[];
  activeVariantIndex: number;
  timestamp: string;
  isEditing?: boolean;
}

interface Props {
  character: PersonaCharacter;
  onBack: () => void;
}

export default function PersonaChatRoom({ character, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "char",
      variants: [
        character.firstMessage,
        `*adjusts ocular implants and watches you carefully* Access granted. Let's see what you brought to the table.`,
      ],
      activeVariantIndex: 0,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showLorebookDrawer, setShowLorebookDrawer] = useState(false);
  const [authorsNote, setAuthorsNote] = useState(
    `[Tone: Cyberpunk Noir · Setting: Sub-Level 4 Tactical Core · Uncensored]`
  );
  const [temperature, setTemperature] = useState(0.8);
  const [selectedModel, setSelectedModel] = useState("Nous-Hermes-3-70B");
  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    cyberAudio.play("click");
    const userText = input.trim();
    const timeNow = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      variants: [userText],
      activeVariantIndex: 0,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    // Simulate AI response generation with multiple swipable variants
    setTimeout(() => {
      setIsGenerating(false);
      cyberAudio.play("chime");

      const responseVariant1 = `*taps the terminal holographic array, reflections shifting across her visor*\n\n"Understood. If you're ready to commit to this run, keep your telemetry masked. The perimeter sentinel won't miss a second spike."`;
      const responseVariant2 = `*steps closer, her cybernetic arm humming with raw power*\n\n"You talk like you know the risk. Fine. I've pre-loaded the payload into our local isolate sandbox. Give the signal and we execute."`;

      const charMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "char",
        variants: [responseVariant1, responseVariant2],
        activeVariantIndex: 0,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, charMsg]);
    }, 1200);
  };

  const handleSwipe = (msgId: string, direction: "prev" | "next") => {
    cyberAudio.play("click");
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const total = msg.variants.length;
          const nextIdx =
            direction === "next"
              ? (msg.activeVariantIndex + 1) % total
              : (msg.activeVariantIndex - 1 + total) % total;
          return { ...msg, activeVariantIndex: nextIdx };
        }
        return msg;
      })
    );
  };

  const handleStartEdit = (msg: ChatMessage) => {
    cyberAudio.play("click");
    setEditingId(msg.id);
    setEditingText(msg.variants[msg.activeVariantIndex]);
  };

  const handleSaveEdit = (msgId: string) => {
    cyberAudio.play("click");
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const updatedVariants = [...msg.variants];
          updatedVariants[msg.activeVariantIndex] = editingText;
          return { ...msg, variants: updatedVariants };
        }
        return msg;
      })
    );
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in pb-8 h-[calc(100vh-120px)] min-h-[640px]">
      {/* Top Ambient Character Header */}
      <div className="cyber-card p-3 sm:p-4 bg-[#07070B]/95 border border-white/10 rounded-2xl flex items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              cyberAudio.play("click");
              onBack();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer shrink-0"
            title="Back to Nexus Discovery Grid"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.25)] shrink-0 bg-black flex items-center justify-center text-lg">
            {character.avatar.startsWith("http") ? (
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span>{character.avatar}</span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#F1F3F9] truncate">{character.name}</h2>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hidden sm:inline">
                {character.category}
              </span>
            </div>
            <span className="text-[10px] text-[#4F536E] font-sans truncate">{character.tagline}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowLorebookDrawer(!showLorebookDrawer);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showLorebookDrawer
                ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/50"
                : "bg-white/5 text-[#9499B3] border-white/10 hover:text-white"
            }`}
            title="Author's Note / Lorebook Memory"
          >
            <BookOpen size={14} />
            <span className="hidden md:inline">LOREBOOK</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowSettingsDrawer(!showSettingsDrawer);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showSettingsDrawer
                ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50"
                : "bg-white/5 text-[#9499B3] border-white/10 hover:text-white"
            }`}
            title="LLM Hyperparameters"
          >
            <Sliders size={14} />
            <span className="hidden md:inline">PARAMETERS</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace with Collapsible Drawers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Messages Stream Container (Full or 8-Cols if Drawer Open) */}
        <div
          className={`cyber-card bg-[#05060A]/95 border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
            showSettingsDrawer || showLorebookDrawer ? "lg:col-span-8" : "lg:col-span-12"
          }`}
        >
          {/* Scrollable Messages Stream */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => {
              const isChar = msg.sender === "char";
              const currentText = msg.variants[msg.activeVariantIndex];
              const isEditing = editingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${
                    isChar ? "items-start max-w-2xl" : "items-end max-w-xl ml-auto"
                  }`}
                >
                  <div className="flex items-center gap-2 px-1 text-[10px] text-[#4F536E]">
                    <span className="font-bold text-[#F1F3F9]">
                      {isChar ? character.name : "You"}
                    </span>
                    <span>· {msg.timestamp}</span>

                    {/* Swiping Variants Navigator */}
                    {isChar && msg.variants.length > 1 && (
                      <div className="flex items-center gap-1 ml-2 bg-white/5 px-1.5 py-0.2 rounded border border-white/10 text-[9px] text-[#00F0FF]">
                        <button
                          onClick={() => handleSwipe(msg.id, "prev")}
                          className="hover:text-white cursor-pointer"
                        >
                          <ChevronLeft size={11} />
                        </button>
                        <span>
                          {msg.activeVariantIndex + 1}/{msg.variants.length}
                        </span>
                        <button
                          onClick={() => handleSwipe(msg.id, "next")}
                          className="hover:text-white cursor-pointer"
                        >
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs font-sans leading-relaxed relative group ${
                      isChar
                        ? "bg-[#0A0C16] border border-white/10 text-[#F1F3F9] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        : "bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.1)]"
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2.5 bg-black/80 border border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none font-mono resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 rounded bg-white/5 text-[10px] text-[#9499B3]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-3 py-1 rounded bg-[#00FF41] text-black font-bold text-[10px]"
                          >
                            Save Turn
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap select-text">
                        {currentText.split("\n\n").map((para, pIdx) => {
                          const isAction = para.startsWith("*") && para.endsWith("*");
                          return (
                            <p
                              key={pIdx}
                              className={isAction ? "italic text-[#9499B3] mb-2" : "mb-2"}
                            >
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {/* Hover Quick Toolbar */}
                    {!isEditing && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/70 p-1 rounded-lg border border-white/10">
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 text-[#4F536E] hover:text-[#00FF41] cursor-pointer"
                          title="Edit Message"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => {
                            cyberAudio.play("click");
                            navigator.clipboard.writeText(currentText);
                          }}
                          className="p-1 text-[#4F536E] hover:text-[#00F0FF] cursor-pointer"
                          title="Copy Message"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-[#00FF41] animate-pulse">
                <Bot size={14} className="animate-spin" />
                <span>{character.name} is formulating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-[#080910] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Speak with ${character.name} or type *actions in asterisks*...`}
              className="flex-1 px-4 py-2.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              <span>SEND</span>
            </button>
          </form>
        </div>

        {/* RIGHT DRAWER: LOREBOOK & AUTHOR'S NOTE */}
        {showLorebookDrawer && (
          <div className="lg:col-span-4 cyber-card p-5 bg-[#080912] border border-[#BF40FF]/30 rounded-2xl flex flex-col gap-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#BF40FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                  AUTHOR&apos;S NOTE // LOREBOOK
                </h3>
              </div>
              <button
                onClick={() => setShowLorebookDrawer(false)}
                className="text-xs text-[#4F536E] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Context Injection (Dynamic Memory Modifier)
              </label>
              <textarea
                rows={6}
                value={authorsNote}
                onChange={(e) => setAuthorsNote(e.target.value)}
                className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>
            <p className="text-[10px] text-[#9499B3] font-sans">
              Injected into every turn&apos;s prompt buffer to anchor situational context, world facts, or pacing rules.
            </p>
          </div>
        )}

        {/* RIGHT DRAWER: LLM PARAMETERS */}
        {showSettingsDrawer && !showLorebookDrawer && (
          <div className="lg:col-span-4 cyber-card p-5 bg-[#080912] border border-[#00F0FF]/30 rounded-2xl flex flex-col gap-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#00F0FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                  LLM HYPERPARAMETERS
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs text-[#4F536E] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Inference Engine</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none"
                >
                  <option value="Nous-Hermes-3-70B">Nous-Hermes-3-70B (Default)</option>
                  <option value="Claude-3.7-Sonnet">Claude-3.7-Sonnet (Deep RP)</option>
                  <option value="Gemini-2.5-Pro">Gemini-2.5-Pro (Long Context)</option>
                  <option value="DeepSeek-Coder-V2">DeepSeek-Coder-V2 (Local)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#4F536E] uppercase font-bold">Temperature (Creativity)</span>
                  <span className="text-[#00FF41] font-bold">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#00FF41]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
