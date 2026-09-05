"use client";

import { useState } from "react";
import {
  ClipboardList,
  Copy,
  Pin,
  Check,
  Plus,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ClipItem {
  id: string;
  text: string;
  category: "CODE" | "TOKEN" | "URL";
  pinned: boolean;
  timestamp: string;
}

const INITIAL_CLIPS: ClipItem[] = [
  {
    id: "c-1",
    text: "git add .; git commit -m 'feat(nexus): deliver virtual influencers'; git push",
    category: "CODE",
    pinned: true,
    timestamp: "10m ago",
  },
  {
    id: "c-2",
    text: "sk-ant-api03-cyberdeck-94f8a817b209",
    category: "TOKEN",
    pinned: false,
    timestamp: "25m ago",
  },
  {
    id: "c-3",
    text: "https://github.com/DirtyDreams/DirtyNest.git",
    category: "URL",
    pinned: false,
    timestamp: "1h ago",
  },
];

export default function ClipboardManagerWidget() {
  const [clips, setClips] = useState<ClipItem[]>(INITIAL_CLIPS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");

  const handleCopy = (clip: ClipItem) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(clip.text);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePin = (id: string) => {
    cyberAudio.play("click");
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    cyberAudio.play("chime");
    const item: ClipItem = {
      id: `c-${Date.now()}`,
      text: newText.trim(),
      category: "CODE",
      pinned: false,
      timestamp: "Just now",
    };
    setClips((prev) => [item, ...prev]);
    setNewText("");
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <ClipboardList size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              CLIPBOARD BUFFER & SNIPPETS
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Fast Code & Token Memory Scratchpad
            </span>
          </div>
        </div>

        <button
          onClick={() => setClips((prev) => prev.filter((c) => c.pinned))}
          className="text-[9px] text-[#9499B3] hover:text-red-400 cursor-pointer"
          title="Clear Unpinned"
        >
          CLEAR UNPINNED
        </button>
      </div>

      {/* Add New Snippet Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Store quick command, token or URL..."
          className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-[11px] text-[#F1F3F9] outline-none"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="px-3 py-1.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 font-bold text-xs cursor-pointer disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </form>

      {/* Snippet List */}
      <div className="space-y-1.5">
        {clips.map((clip) => {
          const isCopied = copiedId === clip.id;
          return (
            <div
              key={clip.id}
              className={`p-2.5 rounded-xl bg-black/40 border transition-all flex items-center justify-between gap-2 text-xs ${
                clip.pinned ? "border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.1)]" : "border-white/5"
              }`}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-mono text-[10px] text-[#F1F3F9] truncate">
                  {clip.text}
                </span>
                <span className="text-[8px] text-[#4F536E] mt-0.5">
                  {clip.category} • {clip.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => togglePin(clip.id)}
                  className={`p-1.5 rounded-lg text-[10px] cursor-pointer ${
                    clip.pinned ? "text-[#00FF41] bg-[#00FF41]/10" : "text-[#4F536E] hover:text-white"
                  }`}
                  title={clip.pinned ? "Unpin" : "Pin"}
                >
                  <Pin size={12} className={clip.pinned ? "fill-current" : ""} />
                </button>

                <button
                  onClick={() => handleCopy(clip)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#00FF41] cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
