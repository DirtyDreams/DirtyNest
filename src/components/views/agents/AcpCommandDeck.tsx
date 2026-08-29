"use client";

import { useEffect, useState, useRef } from "react";
import {
  Terminal,
  Bot,
  Plus,
  Trash2,
  Wrench,
  Send,
  Loader2,
  Brain,
  Sparkles,
  Clock,
} from "lucide-react";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
import { cyberAudio } from "@/lib/cyberAudio";
import dynamic from "next/dynamic";
import HitlApprovalModal from "./HitlApprovalModal";
import ReasoningTreeInspector from "./ReasoningTreeInspector";
import AcpMemoryBrowser from "./AcpMemoryBrowser";
import AcpBrowserHud from "./AcpBrowserHud";
import AcpCronHub from "./AcpCronHub";
import LiveWaveformBadge from "./LiveWaveformBadge";
const CyberpunkTerminalModal = dynamic(() => import("../tools/CyberpunkTerminalModal"), { ssr: false });
import { cyberSpeech } from "@/lib/cyberSpeech";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_DIRECTIVES = [
  { label: "🛡️ CVE Recon & Auth Audit", prompt: "Perform deep vulnerability scan on /api/auth and verify boundary tokens." },
  { label: "⚡ AST Code Optimization", prompt: "Run AST parser on client components and verify memory leak disposals." },
  { label: "🌐 Chrome CDP Viewport Scan", prompt: "Navigate Chrome CDP to http://localhost:3000 and capture screenshot & DOM structure." },
  { label: "🗄️ PostgreSQL & Qdrant Check", prompt: "Verify PostgreSQL 16 connection and Qdrant semantic memory index health." },
];

export default function AcpCommandDeck() {
  const {
    activeSessionId,
    sessions,
    messages,
    currentReasoningTrace,
    activeToolExecutions,
    pendingGate,
    recalledMemories,
    isStreaming,
    isLoading,
    fetchSessions,
    createSession,
    selectSession,
    deleteSession,
    sendPromptDirective,
    resolveGateClearance,
  } = useHermesAcpStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [showMemoryBrowser, setShowMemoryBrowser] = useState(false);
  const [showBrowserHud, setShowBrowserHud] = useState(false);
  const [showCronHub, setShowCronHub] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [isAutoVoiceEnabled, setIsAutoVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentReasoningTrace, activeToolExecutions]);

  // Trigger automated vocalization if enabled
  useEffect(() => {
    if (!isAutoVoiceEnabled || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (latest.role === "agent" && latest.id !== lastSpokenMessageIdRef.current) {
      lastSpokenMessageIdRef.current = latest.id;
      cyberSpeech.speak(latest.content, { pitch: 1.0, rate: 1.05 });
    }
  }, [messages, isAutoVoiceEnabled]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    cyberAudio.play("toggle");
    sendPromptDirective(inputPrompt);
    setInputPrompt("");
  };

  const handleQuickDirective = (prompt: string) => {
    cyberAudio.play("click");
    sendPromptDirective(prompt);
  };

  const handleCreateSession = async () => {
    cyberAudio.play("chime");
    await createSession(newSessionName || undefined);
    setNewSessionName("");
    setIsCreatingSession(false);
  };

  return (
    <div className="flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Top Banner & Session Control */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black tracking-tight text-[#F1F3F9] uppercase">
                HERMES ACP COMMAND DECK // <span className="text-[#00FF41]">{activeSession?.name || "ACTIVE MISSION"}</span>
              </h2>
              <Badge variant="outline" className="text-[9px] bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 font-bold">
                PROFILE: {activeSession?.profile || "dirtydaily"}
              </Badge>
              <Badge variant="outline" className="text-[9px] bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 font-bold">
                MODEL: {activeSession?.model || "Nous-Hermes-3"}
              </Badge>
            </div>
            <p className="text-xs text-[#9499B3]">
              Stateful JSON-RPC 2.0 Agent Client Protocol daemon with Zero-Trust HITL & Qdrant RAG Memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chrome CDP Browser HUD Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setShowBrowserHud(!showBrowserHud);
            }}
            className={`h-8 px-2.5 text-xs font-bold transition-all ${
              showBrowserHud
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : "bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
            }`}
          >
            <Bot size={13} className="mr-1.5 text-emerald-400" />
            <span>{showBrowserHud ? "HIDE CDP HUD" : "CHROME CDP HUD"}</span>
          </Button>

          {/* Memory Browser Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setShowMemoryBrowser(!showMemoryBrowser);
            }}
            className={`h-8 px-2.5 text-xs font-bold transition-all ${
              showMemoryBrowser
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
            }`}
          >
            <Brain size={13} className="mr-1.5 text-cyan-400" />
            <span>{showMemoryBrowser ? "HIDE MEMORY" : "QDRANT MEMORY"}</span>
          </Button>

          {/* Redis Cron Scheduler Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setShowCronHub(!showCronHub);
            }}
            className={`h-8 px-2.5 text-xs font-bold transition-all ${
              showCronHub
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
            }`}
          >
            <Clock size={13} className="mr-1.5 text-amber-400" />
            <span>{showCronHub ? "HIDE CRON" : "CRON QUEUE"}</span>
          </Button>

          {/* Auto-Voice Vocalizer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setIsAutoVoiceEnabled(!isAutoVoiceEnabled);
            }}
            className={`h-8 px-2.5 text-xs font-bold transition-all ${
              isAutoVoiceEnabled
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
            }`}
          >
            <Sparkles size={13} className="mr-1.5 text-purple-400" />
            <span>{isAutoVoiceEnabled ? "AUTO-VOICE ON" : "AUTO-VOICE OFF"}</span>
          </Button>

          {/* Live PTY Terminal Modal Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cyberAudio.play("click");
              setShowTerminalModal(true);
            }}
            className="h-8 px-2.5 text-xs font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
          >
            <Terminal size={13} className="mr-1.5 text-emerald-400" />
            <span>LIVE TERMINAL</span>
          </Button>

          {/* Session Selector Dropdown */}
          <select
            value={activeSessionId || ""}
            onChange={(e) => {
              cyberAudio.play("click");
              selectSession(e.target.value);
            }}
            className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none cursor-pointer"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => setIsCreatingSession(!isCreatingSession)}
            className="h-8 bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            <Plus size={14} className="mr-1" />
            <span>NEW MISSION</span>
          </Button>

          {activeSessionId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cyberAudio.play("click");
                deleteSession(activeSessionId);
              }}
              className="h-8 px-2 bg-white/5 border-white/10 hover:bg-red-500/20 text-red-400 hover:text-white"
              title="Delete Active Session"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* New Session Drawer / Input */}
      {isCreatingSession && (
        <div className="p-3 bg-black/60 border border-[#00FF41]/30 rounded-xl flex items-center gap-2 animate-fade-in">
          <Input
            placeholder="Enter mission title (e.g. 'Hermes Autonomous Security Patching')..."
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            className="flex-1 bg-black/80 border-white/10 text-xs text-white font-mono"
          />
          <Button
            onClick={handleCreateSession}
            className="bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34]"
          >
            CREATE
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsCreatingSession(false)}
            className="text-xs text-[#9499B3]"
          >
            CANCEL
          </Button>
        </div>
      )}

      {/* Redis Cron Scheduler & Task Queue Collapsible View */}
      {showCronHub && <AcpCronHub />}

      {/* Chrome CDP Browser HUD Collapsible View */}
      {showBrowserHud && <AcpBrowserHud />}

      {/* Qdrant Memory Browser Collapsible View */}
      {showMemoryBrowser && <AcpMemoryBrowser />}

      {/* Recalled Memories Active Context Strip */}
      {recalledMemories.length > 0 && (
        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <Brain size={14} className="text-cyan-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold text-cyan-300">
              QDRANT RECALLED CONTEXT ({recalledMemories.length} facts):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {recalledMemories.map((m) => (
                <span
                  key={m.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-black/50 border border-cyan-500/20 text-[#F1F3F9] whitespace-nowrap"
                >
                  {m.title} <strong className="text-emerald-400">{Math.round((m.score || 0.85) * 100)}%</strong>
                </span>
              ))}
            </div>
          </div>
          <span className="text-[9px] text-[#4F536E] shrink-0 uppercase font-mono">
            RAG INJECTED
          </span>
        </div>
      )}

      {/* Quick Tactical Preset Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {QUICK_DIRECTIVES.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickDirective(d.prompt)}
            className="p-2 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF41]/40 hover:bg-[#00FF41]/5 transition-all text-left cursor-pointer group"
          >
            <span className="text-[11px] font-bold text-[#F1F3F9] group-hover:text-[#00FF41] block">
              {d.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Execution Stage & Live Stream Pane */}
      <div className="cyber-card p-4 flex flex-col gap-4 min-h-[420px] max-h-[560px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-[#00FF41] gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs">Loading ACP session state...</span>
          </div>
        )}

        {/* Message Trajectory Feed */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-2 animate-fade-in">
            {msg.role === "user" ? (
              <div className="self-end max-w-[85%] p-3 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs text-white">
                <div className="text-[9px] text-[#00FF41] font-bold uppercase mb-1">OPERATOR DIRECTIVE</div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ) : msg.role === "system" ? (
              <div className="self-center p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] text-[#4F536E]">
                {msg.content}
              </div>
            ) : (
              <div className="self-start max-w-[90%] flex flex-col gap-2">
                {/* Reasoning Inspector for past message */}
                {msg.reasoning_trace && (
                  <ReasoningTreeInspector reasoningTrace={msg.reasoning_trace} isStreaming={false} />
                )}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-[#F1F3F9] leading-relaxed shadow-lg flex flex-col gap-2">
                  <div className="text-[9px] text-[#00F0FF] font-bold uppercase flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={11} />
                      <span>HERMES ACP SYNTHESIS</span>
                    </div>
                    <LiveWaveformBadge textToSpeak={msg.content} />
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Active Streaming Reasoning Stage */}
        {isStreaming && currentReasoningTrace && (
          <div className="self-start max-w-[90%] w-full flex flex-col gap-2">
            <ReasoningTreeInspector reasoningTrace={currentReasoningTrace} isStreaming={true} />
          </div>
        )}

        {/* Active Tool Executions Badges */}
        {activeToolExecutions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {activeToolExecutions.map((tool) => (
              <div
                key={tool.id}
                className="px-2.5 py-1 rounded-lg bg-black/80 border border-[#00F0FF]/30 text-[10px] text-[#00F0FF] flex items-center gap-1.5"
              >
                <Wrench size={11} className="text-[#00FF41]" />
                <span className="font-bold">{tool.tool_name}</span>
                <span className="text-[#4F536E]">({tool.status})</span>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Prompt Command Input Bar */}
      <form onSubmit={handleSend} className="cyber-card p-2.5 flex items-center gap-2">
        <div className="p-2 text-[#00FF41]">
          <Terminal size={18} />
        </div>
        <Input
          type="text"
          placeholder="Send ACP directive to Hermes (e.g. 'Audit /api/auth routes and execute patch')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={isStreaming}
          className="flex-1 bg-black/60 border-white/10 text-xs text-[#F1F3F9] font-mono outline-none"
        />
        <Button
          type="submit"
          disabled={isStreaming || !inputPrompt.trim()}
          className="bg-[#00FF41] hover:bg-[#00cc34] text-black font-black text-xs shadow-[0_0_12px_rgba(0,255,65,0.3)] h-9 px-4"
        >
          {isStreaming ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Send size={14} className="mr-1.5" />
              <span>DISPATCH</span>
            </>
          )}
        </Button>
      </form>

      {/* Zero-Trust HITL Clearance Modal */}
      <HitlApprovalModal
        gate={pendingGate}
        onResolve={(decision) => {
          if (pendingGate) {
            resolveGateClearance(pendingGate.request_id, decision);
          }
        }}
      />

      {/* Cyberpunk Live PTY Shell Terminal */}
      <CyberpunkTerminalModal
        isOpen={showTerminalModal}
        onClose={() => setShowTerminalModal(false)}
      />
    </div>
  );
}
