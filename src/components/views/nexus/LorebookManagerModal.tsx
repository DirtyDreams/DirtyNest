"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  Download,
  Sparkles,
  Zap,
  Tag,
  Key,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface LorebookEntry {
  id: string;
  title: string;
  keys: string[];
  content: string;
  isConstant: boolean;
  enabled: boolean;
}

export const DEFAULT_LOREBOOK_ENTRIES: LorebookEntry[] = [
  {
    id: "lore-01",
    title: "Sector 9 (Neon Slums & Sub-level 4)",
    keys: ["Sector 9", "sub-level", "safehouse", "underground", "slums"],
    content:
      "[Location: Sector 9 is a lawless lower-tier industrial district plagued by acid rain, unregulated black-market cyberware clinics, and rogue eBPF server racks.]",
    isConstant: false,
    enabled: true,
  },
  {
    id: "lore-02",
    title: "NetWatch Tactical Division",
    keys: ["NetWatch", "enforcer", "triangulate", "black-ice", "agent"],
    content:
      "[Faction: NetWatch is a militarized corporate regulatory entity equipped with lethal deep-packet tracer daemons and Level-5 Black ICE to terminate illegal rogue swarms.]",
    isConstant: false,
    enabled: true,
  },
  {
    id: "lore-03",
    title: "DirtyNest Tactical Node Mesh",
    keys: ["DirtyNest", "sub-node", "mesh", "node-4", "terminal"],
    content:
      "[Infrastructure: DirtyNest is a distributed underground kernel platform powering isolated agent swarms, vector knowledge cores, and autonomous Docker sandbox environments.]",
    isConstant: true,
    enabled: true,
  },
  {
    id: "lore-04",
    title: "Zero-Day Quantum Cryptography",
    keys: ["zero-day", "quantum", "payload", "cryptography", "exploit", "breach"],
    content:
      "[Technology: Quantum payload exploits utilize entangled byte streams to bypass standard SHA-512 authentication hashes before hardware clocks can synchronize.]",
    isConstant: false,
    enabled: true,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: LorebookEntry[];
  onSaveEntries: (entries: LorebookEntry[]) => void;
}

export default function LorebookManagerModal({
  isOpen,
  onClose,
  entries,
  onSaveEntries,
}: Props) {
  const [localEntries, setLocalEntries] = useState<LorebookEntry[]>(entries);
  const [editingEntry, setEditingEntry] = useState<LorebookEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [keysInput, setKeysInput] = useState("");
  const [content, setContent] = useState("");
  const [isConstant, setIsConstant] = useState(false);

  if (!isOpen) return null;

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    cyberAudio.play("chime");
    const keyArray = keysInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (editingEntry) {
      const updated = localEntries.map((item) =>
        item.id === editingEntry.id
          ? {
              ...item,
              title: title.trim(),
              keys: keyArray,
              content: content.trim(),
              isConstant,
            }
          : item
      );
      setLocalEntries(updated);
      onSaveEntries(updated);
      setEditingEntry(null);
    } else {
      const newEntry: LorebookEntry = {
        id: `lore-${Date.now().toString(36)}`,
        title: title.trim(),
        keys: keyArray.length > 0 ? keyArray : [title.trim().toLowerCase()],
        content: content.trim(),
        isConstant,
        enabled: true,
      };
      const updated = [...localEntries, newEntry];
      setLocalEntries(updated);
      onSaveEntries(updated);
      setIsCreating(false);
    }

    setTitle("");
    setKeysInput("");
    setContent("");
    setIsConstant(false);
  };

  const handleDelete = (id: string) => {
    cyberAudio.play("click");
    const updated = localEntries.filter((e) => e.id !== id);
    setLocalEntries(updated);
    onSaveEntries(updated);
  };

  const toggleEnabled = (id: string) => {
    cyberAudio.play("click");
    const updated = localEntries.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
    setLocalEntries(updated);
    onSaveEntries(updated);
  };

  const handleStartEdit = (entry: LorebookEntry) => {
    cyberAudio.play("click");
    setEditingEntry(entry);
    setTitle(entry.title);
    setKeysInput(entry.keys.join(", "));
    setContent(entry.content);
    setIsConstant(entry.isConstant);
    setIsCreating(true);
  };

  const handleExportJson = () => {
    cyberAudio.play("click");
    const data = {
      spec: "dirtynest_lorebook_v1",
      exportedAt: new Date().toISOString(),
      entries: localEntries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dirtynest-lorebook-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      cyberAudio.play("warp");
      if (Array.isArray(json.entries)) {
        setLocalEntries(json.entries);
        onSaveEntries(json.entries);
      } else if (Array.isArray(json)) {
        setLocalEntries(json);
        onSaveEntries(json);
      }
    } catch {
      alert("Failed to parse Lorebook JSON file.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-2xl cyber-card bg-[#05060A] border border-[#BF40FF]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 bg-[#0A0C14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BF40FF]/15 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF] shadow-[0_0_12px_rgba(191,64,255,0.25)]">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                WORLD LOREBOOK ENGINE // <span className="text-[#BF40FF]">KEYWORD TRIGGER MATRIX</span>
              </h3>
              <p className="text-[10px] text-[#4F536E]">
                SELECTIVELY INJECT RELEVANT WORLD FACTS & LORE WHEN KEYWORDS ARE DETECTED IN CHAT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white cursor-pointer"
              title="Export Lorebook JSON"
            >
              <Download size={14} />
            </button>
            <label className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white cursor-pointer" title="Import Lorebook JSON">
              <Upload size={14} />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
            <button onClick={onClose} className="p-1.5 text-[#4F536E] hover:text-[#F1F3F9] cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {!isCreating ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#4F536E]">
                  Active World Entries ({localEntries.length})
                </span>
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    setEditingEntry(null);
                    setTitle("");
                    setKeysInput("");
                    setContent("");
                    setIsConstant(false);
                    setIsCreating(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#BF40FF]/15 text-[#BF40FF] hover:bg-[#BF40FF]/25 border border-[#BF40FF]/30 font-bold text-[11px] cursor-pointer transition-all shadow-[0_0_10px_rgba(191,64,255,0.2)]"
                >
                  <Plus size={13} />
                  <span>ADD LORE ENTRY</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {localEntries.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                      item.enabled
                        ? "bg-black/50 border-white/10 hover:border-[#BF40FF]/40"
                        : "bg-black/20 border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEnabled(item.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                            item.enabled
                              ? "bg-[#BF40FF] border-[#BF40FF] text-black"
                              : "border-white/20 bg-transparent"
                          }`}
                        >
                          {item.enabled && <Check size={11} className="stroke-[3]" />}
                        </button>
                        <span className="font-bold text-[#F1F3F9] text-xs">{item.title}</span>
                        {item.isConstant && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ALWAYS ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-[#4F536E] hover:text-[#BF40FF] cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-[#4F536E] hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Trigger Keys */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Key size={11} className="text-[#4F536E]" />
                      {item.keys.map((k) => (
                        <span
                          key={k}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-[#BF40FF]/10 text-[#BF40FF] border border-[#BF40FF]/25 font-mono"
                        >
                          {k}
                        </span>
                      ))}
                    </div>

                    {/* Content snippet */}
                    <p className="text-[11px] text-[#9499B3] font-sans line-clamp-2 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/5">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSaveEntry} className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Entry Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sector 9 Lawless District"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Trigger Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  placeholder="e.g. Sector 9, safehouse, sub-level, black-market"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Lore Context Content (Injected when triggered)
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="[Location: Sector 9 is controlled by rogue hacker syndicates...]"
                  className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="constant-check"
                  checked={isConstant}
                  onChange={(e) => setIsConstant(e.target.checked)}
                  className="accent-[#BF40FF]"
                />
                <label htmlFor="constant-check" className="text-xs text-[#F1F3F9] cursor-pointer">
                  Always Injected (Constant entry, bypasses keyword matching)
                </label>
              </div>

              <div className="flex justify-between pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#BF40FF] text-black font-black text-xs hover:bg-[#a630e0] cursor-pointer shadow-[0_0_20px_rgba(191,64,255,0.4)]"
                >
                  {editingEntry ? "UPDATE ENTRY" : "SAVE LORE ENTRY"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
