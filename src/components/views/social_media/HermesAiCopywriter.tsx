"use client";

import { useState } from "react";
import { Sparkles, Brain, Wand2, Copy, Check, Flame, MessageSquare, Tag } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface CopyTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
}

const TEMPLATES: CopyTemplate[] = [
  {
    id: "launch",
    name: "🚀 Product & Major Release Announcement",
    category: "Release",
    prompt: "Write a high-energy launch tweet thread about DirtyNest v2.5 featuring Hermes 100% Master AI Brain, zero-trust container sockets, and real-time DSP voice synthesis.",
  },
  {
    id: "changelog",
    name: "🛠️ Dev Changelog & Technical Deep Dive",
    category: "Tech",
    prompt: "Draft a technical Discord & X post detailing the migration to SQLite-Vec, ACP protocol v2 stdio streaming, and eBPF syscall observability.",
  },
  {
    id: "vtuber",
    name: "🎙️ VTuber KIRA Live Stream Alert",
    category: "Influencer",
    prompt: "Write an anime-style bubbly stream announcement for KIRA going live on Twitch to hack mainframe firewalls and chat with operatives.",
  },
  {
    id: "poll",
    name: "📊 Viral Community Engagement Question",
    category: "Engagement",
    prompt: "Generate an engaging debate question for developer Twitter comparing local CUDA air-gapped LLMs vs cloud multi-agent RPC mesh.",
  },
];

interface Props {
  onApplyCopy: (text: string) => void;
}

export default function HermesAiCopywriter({ onApplyCopy }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("launch");
  const [tone, setTone] = useState<string>("visionary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>(
    "🔥 EXECUTING DISPATCH: DirtyNest v2.5 is live.\n\nWe replaced monolithic AI assistants with Hermes Agent — a 100% autonomous Master Brain with persistent FTS5 vector recall and self-created skills.\n\nKey upgrades:\n⚡ ACP Protocol v2 Stdio Streaming\n🛡️ Zero-Trust Socket Clearance Interceptors\n🎙️ Real-time Web Audio DSP Voice Synthesizer\n\nTry it: https://dirtynest.ai\n\n#Cyberpunk #HermesAgent #Nextjs #AI"
  );
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    cyberAudio.play("toggle");
    setIsGenerating(true);
    setTimeout(() => {
      cyberAudio.play("chime");
      setIsGenerating(false);
      const tpl = TEMPLATES.find((t) => t.id === selectedTemplate);
      setGeneratedOutput(
        `⚡ [HERMES SYNTHESIS // ${tone.toUpperCase()}]\n\n${tpl?.prompt}\n\nKey takeaways:\n• 100% Master AI Brain\n• 42 Loaded Swarm Skills\n• Sub-10ms Vector Recall\n\nEngage with the stream at https://dirtynest.ai 🦾\n\n#DirtyNest #AutonomousAI #DevOps`
      );
    }, 1800);
  };

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseInComposer = () => {
    cyberAudio.play("chime");
    onApplyCopy(generatedOutput);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              HERMES VIRAL COPYWRITER // <span className="text-[#BF40FF]">AI MARKETING ENGINE</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Autonomous post generation, viral hook optimization & hashtag synthesis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BF40FF] text-white font-bold text-xs hover:bg-[#a832e6] transition-all cursor-pointer shadow-[0_0_12px_rgba(191,64,255,0.3)] disabled:opacity-50"
        >
          <Sparkles size={13} className={isGenerating ? "animate-spin" : ""} />
          <span>{isGenerating ? "HERMES WRITING..." : "GENERATE VIRAL COPY"}</span>
        </button>
      </div>

      {/* Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedTemplate(tpl.id);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#BF40FF]/10 border-[#BF40FF]/50 text-[#F1F3F9]"
                  : "bg-black/40 border-white/5 text-[#9499B3] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{tpl.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#BF40FF] uppercase font-bold">
                  {tpl.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tone Pills */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] text-[#4F536E] uppercase font-bold">Tone:</span>
        {[
          { id: "visionary", label: "Visionary & Hype" },
          { id: "technical", label: "Hard Technical" },
          { id: "streamer", label: "VTuber Streamer" },
          { id: "cynical", label: "Noir Hacker" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setTone(t.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              tone === t.id
                ? "bg-[#BF40FF] text-white"
                : "bg-white/5 text-[#9499B3] hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Generated Output Box */}
      <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-[#4F536E]">
          <span>GENERATED POST DRAFT</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
              <span>{copied ? "COPIED" : "COPY"}</span>
            </button>
            <button
              type="button"
              onClick={handleUseInComposer}
              className="px-2.5 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] font-bold hover:bg-[#00FF41]/30 cursor-pointer"
            >
              INSERT INTO COMPOSER
            </button>
          </div>
        </div>

        <pre className="text-xs text-[#00FF41] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {generatedOutput}
        </pre>
      </div>
    </div>
  );
}
