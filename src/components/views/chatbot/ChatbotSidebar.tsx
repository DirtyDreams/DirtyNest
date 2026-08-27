"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  GitBranch,
  Download,
  Trash2,
  Edit2,
  Check,
  Star,
  Bot,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { HermesChatSession } from "./ChatbotSessionsDrawer";
import { AgentPersona } from "./PersonaStudioModal";

interface Props {
  sessions: HermesChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onBranchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onExportSessionMarkdown: (id: string) => void;
  activePersona: AgentPersona;
  onOpenPersonaStudio: () => void;
}

export default function ChatbotSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onBranchSession,
  onDeleteSession,
  onRenameSession,
  onExportSessionMarkdown,
  activePersona,
  onOpenPersonaStudio,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.lastMessageSnippet.toLowerCase().includes(q);
  });

  const handleStartRename = (e: React.MouseEvent, s: HermesChatSession) => {
    e.stopPropagation();
    cyberAudio.play("click");
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-72 sm:w-80 shrink-0 cyber-card p-3 flex flex-col justify-between h-[680px] font-mono select-none overflow-hidden transition-all border border-white/10 shadow-2xl">
      {/* Top Section: Header & New Chat & Search */}
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <GitBranch size={13} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-wider">
                CHAT THREADS
              </h3>
              <p className="text-[9px] text-[#4F536E]">Hermes Tree Memory</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
            {sessions.length} THREADS
          </span>
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("warp");
            onCreateSession();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00FF41]/15 hover:bg-[#00FF41]/25 text-[#00FF41] border border-[#00FF41]/30 font-extrabold text-xs cursor-pointer transition-all shadow-[0_0_12px_rgba(0,255,65,0.15)]"
        >
          <Plus size={14} />
          <span>NEW CHAT THREAD</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none font-mono"
          />
        </div>
      </div>

      {/* Middle Section: Sessions List */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-1.5 scrollbar-thin">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#4F536E] flex flex-col items-center justify-center gap-2">
            <MessageSquare size={20} className="opacity-40" />
            <span>No threads match search.</span>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  if (!isEditing) {
                    cyberAudio.play("click");
                    onSelectSession(session.id);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 relative group ${
                  isActive
                    ? "bg-white/[0.08] border-[#00FF41]/60 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                    : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60"
                }`}
              >
                {/* Title & Rename Form */}
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(e, session.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1 mr-1"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-1 rounded bg-black border border-[#00FF41] text-xs text-white outline-none font-mono"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 rounded bg-[#00FF41] text-black font-bold text-[10px]"
                      >
                        <Check size={11} />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="font-bold text-xs text-white truncate">
                        {session.title}
                      </span>
                      {session.isPinned && <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                  )}

                  {/* Actions on Hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(e, session)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Rename"
                    >
                      <Edit2 size={10} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("warp");
                        onBranchSession(session.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-[#00F0FF] hover:text-cyan-300"
                      title="Branch Fork"
                    >
                      <GitBranch size={10} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("click");
                        onExportSessionMarkdown(session.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-[#00FF41] hover:text-emerald-300"
                      title="Export MD"
                    >
                      <Download size={10} />
                    </button>

                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cyberAudio.play("click");
                          onDeleteSession(session.id);
                        }}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Last Message Snippet */}
                <p className="text-[10px] text-[#9499B3] line-clamp-1">
                  {session.lastMessageSnippet}
                </p>

                {/* Footer Meta */}
                <div className="flex items-center justify-between text-[8px] text-[#4F536E] pt-0.5">
                  <span className="text-[#00FF41] font-bold">{session.personaName}</span>
                  <span>{session.updatedAt}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Section: Active Persona Card */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <div
          onClick={() => {
            cyberAudio.play("click");
            onOpenPersonaStudio();
          }}
          className="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between bg-black/50 hover:bg-black/80 hover:border-white/20"
          style={{ borderColor: `${activePersona.color}40` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-extrabold text-xs shrink-0"
              style={{ backgroundColor: activePersona.color }}
            >
              <Bot size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-white truncate">
                {activePersona.name}
              </span>
              <span className="text-[8px] text-[#4F536E] uppercase truncate">
                {activePersona.roleTitle}
              </span>
            </div>
          </div>

          <div
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9499B3] hover:text-white"
            title="Configure Persona Directives"
          >
            <Sliders size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
