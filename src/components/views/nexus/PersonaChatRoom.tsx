"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Sliders,
  Edit2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Bot,
  GitBranch,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { PersonaCharacter } from "./PersonaDetailModal";
import { UserPersona } from "./UserPersonaModal";
import { LorebookEntry } from "./LorebookManagerModal";
import ChatSessionsDrawer, { ChatSession } from "./ChatSessionsDrawer";
import TokenContextInspector from "./TokenContextInspector";

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
  activeUserPersona: UserPersona;
  lorebookEntries: LorebookEntry[];
  onBack: () => void;
  onOpenUserPersonaModal: () => void;
  onOpenLorebookModal: () => void;
}

export default function PersonaChatRoom({
  character,
  activeUserPersona,
  lorebookEntries,
  onBack,
  onOpenUserPersonaModal,
  onOpenLorebookModal,
}: Props) {
  const initialGreetings = [
    character.firstMessage,
    `*adjusts ocular implants and watches you carefully* Identity verified as ${activeUserPersona.name}. Let's see what you brought to the table.`,
    `*leans closer under the flickering neon lamps* What brings a ${activeUserPersona.role} to my sub-level terminal? Speak quickly.`,
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "char",
      variants: initialGreetings,
      activeVariantIndex: 0,
      timestamp: "Just now",
    },
  ]);

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "sess-01",
      name: "Main Timeline Alpha",
      characterId: character.id,
      messagesCount: 1,
      lastMessageSnippet: character.firstMessage.slice(0, 70) + "...",
      updatedAt: "Just now",
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("sess-01");

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showLorebookDrawer, setShowLorebookDrawer] = useState(false);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);

  // Audio / TTS State
  const [isPlayingTtsId, setIsPlayingTtsId] = useState<string | null>(null);
  const [ttsVoiceRate, setTtsVoiceRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);

  // Inference Hyperparameters
  const [authorsNote, setAuthorsNote] = useState(
    `[Tone: Cyberpunk Noir · Setting: Sub-Level 4 Tactical Core · Uncensored]`
  );
  const [temperature, setTemperature] = useState(0.8);
  const [selectedModel, setSelectedModel] = useState("Nous-Hermes-3-70B");

  // Inline Message Editing State
  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Clean up TTS when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scan recent messages for Keyword-Triggered Lorebook entries
  const activeTriggeredLoreEntries = useMemo(() => {
    const combinedChatText = messages
      .slice(-6)
      .map((m) => m.variants[m.activeVariantIndex])
      .join(" ")
      .toLowerCase();

    return lorebookEntries.filter((entry) => {
      if (!entry.enabled) return false;
      if (entry.isConstant) return true;
      return entry.keys.some((k) => combinedChatText.includes(k.toLowerCase()));
    });
  }, [messages, lorebookEntries]);

  // Calculate Tokens for Inspector
  const tokenBreakdown = useMemo(() => {
    const charTokens = Math.round(
      (character.personality.length + character.scenario.length + character.tagline.length) / 3.8
    );
    const userTokens = Math.round((activeUserPersona.name.length + activeUserPersona.bio.length) / 3.8);
    const loreTokens = activeTriggeredLoreEntries.reduce(
      (acc, e) => acc + Math.round(e.content.length / 3.8),
      0
    );
    const historyTokens = messages.reduce(
      (acc, m) => acc + Math.round(m.variants[m.activeVariantIndex].length / 3.8),
      0
    );

    return { charTokens, userTokens, loreTokens, historyTokens };
  }, [character, activeUserPersona, activeTriggeredLoreEntries, messages]);

  // Text-To-Speech Playback using Web Speech API
  const handleToggleTts = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isPlayingTtsId === msgId) {
      window.speechSynthesis.cancel();
      setIsPlayingTtsId(null);
      return;
    }

    window.speechSynthesis.cancel();
    cyberAudio.play("click");

    // Clean actions enclosed in asterisks for clean speech synthesis
    const cleanSpeech = text.replace(/\*[^*]+\*/g, "").trim() || text;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = ttsVoiceRate;
    utterance.pitch = ttsPitch;

    // Pick an appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const enVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => setIsPlayingTtsId(null);
    utterance.onerror = () => setIsPlayingTtsId(null);

    window.speechSynthesis.speak(utterance);
    setIsPlayingTtsId(msgId);
  };

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

    // AI Generation with Persona Awareness
    setTimeout(() => {
      setIsGenerating(false);
      cyberAudio.play("chime");

      const responseVariant1 = `*taps the terminal holographic array, reflections shifting across her visor*\n\n"${activeUserPersona.name}, I see where you're heading with this. Keep your telemetry masked. If the perimeter triggers a second spike, NetWatch will deploy ICE."`;
      const responseVariant2 = `*steps closer, cybernetic arm humming with raw power*\n\n"A ${activeUserPersona.role} like you knows the risks. Fine. I've pre-loaded the payload into our isolate sandbox. Give the command and we breach."`;

      const charMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "char",
        variants: [responseVariant1, responseVariant2],
        activeVariantIndex: 0,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit" }),
      };

      setMessages((prev) => {
        const next = [...prev, charMsg];
        // Update session snippet
        setSessions((sList) =>
          sList.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messagesCount: next.length,
                  lastMessageSnippet: responseVariant1.slice(0, 60) + "...",
                  updatedAt: "Just now",
                }
              : s
          )
        );
        return next;
      });
    }, 1100);
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

  // Export current chat transcript as Markdown
  const handleExportTranscript = () => {
    cyberAudio.play("click");
    let markdown = `# DirtyNest Persona Nexus Transcript\n\n`;
    markdown += `**Character**: ${character.name} (@${character.author})\n`;
    markdown += `**User Persona**: ${activeUserPersona.name} (${activeUserPersona.role})\n`;
    markdown += `**Export Date**: ${new Date().toISOString()}\n\n---\n\n`;

    messages.forEach((msg) => {
      const sender = msg.sender === "char" ? character.name : activeUserPersona.name;
      const text = msg.variants[msg.activeVariantIndex];
      markdown += `### ${sender} [${msg.timestamp}]\n${text}\n\n`;
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${character.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create new timeline branch
  const handleCreateSession = () => {
    const newId = `sess-${Date.now().toString(36)}`;
    const newSession: ChatSession = {
      id: newId,
      name: `Timeline ${sessions.length + 1}`,
      characterId: character.id,
      messagesCount: 1,
      lastMessageSnippet: character.firstMessage.slice(0, 60) + "...",
      updatedAt: "Just now",
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "char",
        variants: initialGreetings,
        activeVariantIndex: 0,
        timestamp: "Just now",
      },
    ]);
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

        {/* Action Controls: User Persona Pill, Timelines, Lorebook & Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Persona Pill Switcher */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              onOpenUserPersonaModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-xs text-[#00F0FF] cursor-pointer transition-all"
            title="Switch User Roleplay Persona"
          >
            <span className="text-sm">{activeUserPersona.avatar}</span>
            <span className="font-bold text-[11px] max-w-[90px] truncate">{activeUserPersona.name}</span>
          </button>

          {/* Timelines / Sessions Drawer */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowSessionsDrawer(true);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Chat Timelines & History Branches"
          >
            <GitBranch size={14} />
            <span className="hidden md:inline">TIMELINES</span>
          </button>

          {/* Lorebook Trigger Drawer */}
          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowLorebookDrawer(!showLorebookDrawer);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showLorebookDrawer || activeTriggeredLoreEntries.length > 0
                ? "bg-[#BF40FF]/20 text-[#BF40FF] border-[#BF40FF]/50"
                : "bg-white/5 text-[#9499B3] border-white/10 hover:text-white"
            }`}
            title="Dynamic Lorebook & World Info"
          >
            <BookOpen size={14} />
            <span className="hidden md:inline">
              LORE ({activeTriggeredLoreEntries.length})
            </span>
          </button>

          {/* Parameters Drawer */}
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
            title="LLM Hyperparameters & Token Inspector"
          >
            <Sliders size={14} />
            <span className="hidden md:inline">TUNING</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Messages Stream Container */}
        <div
          className={`cyber-card bg-[#05060A]/95 border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
            showSettingsDrawer || showLorebookDrawer ? "lg:col-span-8" : "lg:col-span-12"
          }`}
        >
          {/* Scrollable Messages Stream */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 pr-2">
            {/* Triggered Lorebook Active Indicator Banner */}
            {activeTriggeredLoreEntries.length > 0 && (
              <div className="p-2.5 px-3.5 rounded-xl bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-between gap-2 text-xs text-[#BF40FF]">
                <div className="flex items-center gap-2">
                  <Zap size={13} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Dynamic Lore Triggered:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {activeTriggeredLoreEntries.map((l) => (
                      <span
                        key={l.id}
                        className="px-1.5 py-0.2 rounded bg-[#BF40FF]/20 text-[9px] font-bold"
                      >
                        {l.title}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenLorebookModal}
                  className="text-[10px] underline hover:text-white cursor-pointer shrink-0"
                >
                  Manage
                </button>
              </div>
            )}

            {messages.map((msg) => {
              const isChar = msg.sender === "char";
              const currentText = msg.variants[msg.activeVariantIndex];
              const isEditing = editingId === msg.id;
              const isTtsActive = isPlayingTtsId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${
                    isChar ? "items-start max-w-2xl" : "items-end max-w-xl ml-auto"
                  }`}
                >
                  <div className="flex items-center gap-2 px-1 text-[10px] text-[#4F536E]">
                    <span className="font-bold text-[#F1F3F9] flex items-center gap-1">
                      {isChar ? (
                        <>
                          <span className="text-xs">{character.avatar}</span>
                          <span>{character.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">{activeUserPersona.avatar}</span>
                          <span>{activeUserPersona.name}</span>
                        </>
                      )}
                    </span>
                    <span>· {msg.timestamp}</span>

                    {/* Swiping Variants Navigator */}
                    {isChar && msg.variants.length > 1 && (
                      <div className="flex items-center gap-1 ml-2 bg-white/5 px-1.5 py-0.2 rounded border border-white/10 text-[9px] text-[#00F0FF]">
                        <button
                          onClick={() => handleSwipe(msg.id, "prev")}
                          className="hover:text-white cursor-pointer"
                          title="Previous Variant"
                        >
                          <ChevronLeft size={11} />
                        </button>
                        <span>
                          {msg.activeVariantIndex + 1}/{msg.variants.length}
                        </span>
                        <button
                          onClick={() => handleSwipe(msg.id, "next")}
                          className="hover:text-white cursor-pointer"
                          title="Next Variant"
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

                    {/* Hover Quick Action Toolbar with TTS */}
                    {!isEditing && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-white/10 shadow-lg">
                        {isChar && (
                          <button
                            onClick={() => handleToggleTts(msg.id, currentText)}
                            className={`p-1 transition-colors cursor-pointer ${
                              isTtsActive
                                ? "text-[#00FF41] animate-pulse"
                                : "text-[#4F536E] hover:text-[#00FF41]"
                            }`}
                            title={isTtsActive ? "Stop Voice Playback" : "Synthesize Character Voice (TTS)"}
                          >
                            {isTtsActive ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 text-[#4F536E] hover:text-[#00FF41] cursor-pointer"
                          title="Edit Message Turn"
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
              placeholder={`Roleplay as ${activeUserPersona.name} with ${character.name}... (*actions in asterisks*)`}
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
          <div className="lg:col-span-4 cyber-card p-5 bg-[#080912] border border-[#BF40FF]/30 rounded-2xl flex flex-col gap-4 animate-fade-in shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#BF40FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                  DYNAMIC LOREBOOK
                </h3>
              </div>
              <button
                onClick={() => setShowLorebookDrawer(false)}
                className="text-xs text-[#4F536E] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Active Triggered Entries ({activeTriggeredLoreEntries.length})
                </span>
                <button
                  onClick={onOpenLorebookModal}
                  className="text-[10px] text-[#BF40FF] hover:underline cursor-pointer font-bold"
                >
                  Manage Matrix
                </button>
              </div>

              {activeTriggeredLoreEntries.length > 0 ? (
                <div className="space-y-2">
                  {activeTriggeredLoreEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-black/60 border border-[#BF40FF]/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F1F3F9]">{entry.title}</span>
                        {entry.isConstant && (
                          <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300">
                            CONSTANT
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9499B3] font-sans leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-[#4F536E] text-xs">
                  No keywords detected in recent turns.
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2 border-t border-white/5">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                Manual Author&apos;s Note Injection
              </label>
              <textarea
                rows={4}
                value={authorsNote}
                onChange={(e) => setAuthorsNote(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* RIGHT DRAWER: LLM PARAMETERS & TOKEN INSPECTOR */}
        {showSettingsDrawer && !showLorebookDrawer && (
          <div className="lg:col-span-4 cyber-card p-5 bg-[#080912] border border-[#00F0FF]/30 rounded-2xl flex flex-col gap-4 animate-fade-in shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#00F0FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                  TUNING & TOKEN MATRIX
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs text-[#4F536E] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Token Budget Inspector Bar */}
            <TokenContextInspector
              charTokens={tokenBreakdown.charTokens}
              userTokens={tokenBreakdown.userTokens}
              loreTokens={tokenBreakdown.loreTokens}
              historyTokens={tokenBreakdown.historyTokens}
              maxTokens={8192}
            />

            <div className="space-y-3 text-xs pt-2">
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

              {/* TTS Voice Speed & Pitch Tuning */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#4F536E] uppercase font-bold">TTS Voice Speech Rate</span>
                  <span className="text-[#00F0FF] font-bold">{ttsVoiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsVoiceRate}
                  onChange={(e) => setTtsVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHAT SESSIONS DRAWER */}
      <ChatSessionsDrawer
        isOpen={showSessionsDrawer}
        onClose={() => setShowSessionsDrawer(false)}
        characterName={character.name}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onCreateSession={handleCreateSession}
        onDeleteSession={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
        onExportCurrentChat={handleExportTranscript}
      />
    </div>
  );
}
