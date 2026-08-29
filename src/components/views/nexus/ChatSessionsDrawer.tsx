"use client";

import {  } from "react";
import { X, GitBranch, Plus, Trash2, Download, MessageSquare } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface ChatSession {
  id: string;
  name: string;
  characterId: string;
  messagesCount: number;
  lastMessageSnippet: string;
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onExportCurrentChat: () => void;
}

export default function ChatSessionsDrawer({
  isOpen,
  onClose,
  characterName,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onExportCurrentChat,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in font-mono select-none">
      <div className="w-full max-w-sm bg-[#07080F] border-l border-white/10 h-full flex flex-col z-10 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0C16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <GitBranch size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
                CHAT SESSIONS // TIMELINES
              </h3>
              <p className="text-[10px] text-[#4F536E] truncate">With {characterName}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#4F536E] hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-b border-white/5 flex gap-2">
          <button
            onClick={() => {
              cyberAudio.play("warp");
              onCreateSession();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-xs cursor-pointer transition-all shadow-[0_0_10px_rgba(0,255,65,0.15)]"
          >
            <Plus size={13} />
            <span>NEW TIMELINE</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              onExportCurrentChat();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 text-[#00F0FF] hover:bg-white/10 border border-white/10 font-bold text-xs cursor-pointer transition-all"
            title="Export Active Chat Transcript"
          >
            <Download size={13} />
            <span>EXPORT</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => {
                  cyberAudio.play("click");
                  onSelectSession(sess.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? "bg-[#00FF41]/10 border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                    : "bg-black/40 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F1F3F9] truncate text-xs">{sess.name}</span>
                  {isActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("click");
                        onDeleteSession(sess.id);
                      }}
                      className="p-1 text-[#4F536E] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#9499B3] font-sans line-clamp-2 leading-relaxed">
                  {sess.lastMessageSnippet}
                </p>

                <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-1 border-t border-white/5 font-mono">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={10} />
                    {sess.messagesCount} turns
                  </span>
                  <span>{sess.updatedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
