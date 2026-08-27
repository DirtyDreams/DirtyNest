"use client";

import { useState } from "react";
import {
  X,
  GitBranch,
  Plus,
  Trash2,
  Download,
  Calendar,
  MessageSquare,
  Check,
  Clock,
  Sparkles,
  Star,
  Search,
  Edit2,
  FileText,
  Copy,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface HermesChatSession {
  id: string;
  title: string;
  personaId: string;
  personaName: string;
  model: string;
  messageCount: number;
  lastMessageSnippet: string;
  updatedAt: string;
  isPinned?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: HermesChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onBranchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onExportSessionMarkdown: (id: string) => void;
}

export default function ChatbotSessionsDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onBranchSession,
  onDeleteSession,
  onRenameSession,
  onExportSessionMarkdown,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex justify-start bg-black/70 backdrop-blur-sm animate-fade-in font-mono select-none">
      <div className="w-full max-w-md bg-[#07080F] border-r border-white/10 h-full flex flex-col z-10 shadow-[0_0_50px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0C16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <GitBranch size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                CHAT SESSIONS & THREADS
              </h3>
              <p className="text-[10px] text-[#4F536E]">Hermes Neural Tree Manager</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#4F536E] hover:text-white cursor-pointer rounded-lg hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons & Search */}
        <div className="p-3.5 border-b border-white/5 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => {
                cyberAudio.play("warp");
                onCreateSession();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-xs cursor-pointer transition-all shadow-[0_0_10px_rgba(0,255,65,0.15)]"
            >
              <Plus size={13} />
              <span>NEW CHAT THREAD</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none font-mono"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#4F536E] flex flex-col items-center justify-center gap-2">
              <MessageSquare size={24} className="opacity-40" />
              <span>No chat sessions found.</span>
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
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative group ${
                    isActive
                      ? "bg-white/[0.08] border-[#00FF41]/60 shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                      : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/70"
                  }`}
                >
                  {/* Top: Title & Actions */}
                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(e, session.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 flex-1 mr-2"
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
                          <Check size={12} />
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(e, session)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title="Rename Session"
                      >
                        <Edit2 size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cyberAudio.play("warp");
                          onBranchSession(session.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-[#00F0FF] hover:text-cyan-300"
                        title="Branch Alternative Timeline"
                      >
                        <GitBranch size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cyberAudio.play("click");
                          onExportSessionMarkdown(session.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-[#00FF41] hover:text-emerald-300"
                        title="Export Markdown"
                      >
                        <Download size={11} />
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
                          title="Delete Session"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Last Snippet */}
                  <p className="text-[10px] text-[#9499B3] line-clamp-2 leading-relaxed">
                    {session.lastMessageSnippet}
                  </p>

                  {/* Footer Metadata */}
                  <div className="flex items-center justify-between pt-1 text-[8px] text-[#4F536E]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#00FF41] font-bold">{session.personaName}</span>
                      <span>•</span>
                      <span>{session.messageCount} msgs</span>
                    </div>
                    <span>{session.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
