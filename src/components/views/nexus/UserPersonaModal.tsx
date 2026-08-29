"use client";

import { useState } from "react";
import { X, User, Plus, Check, Trash2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface UserPersona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  isDefault?: boolean;
}

const DEFAULT_USER_PERSONAS: UserPersona[] = [
  {
    id: "user-01",
    name: "Operator Nova",
    avatar: "🕶️",
    role: "Cyberdeck Specialist & Node Admin",
    bio: "A seasoned freelance cyberdeck operator running eBPF traces and rogue swarm clusters. Highly technical, pragmatic, and cautious with corporate security perimeters.",
    isDefault: true,
  },
  {
    id: "user-02",
    name: "Netrunner Zero",
    avatar: "⚡",
    role: "Darknet Infiltrator & Exploit Broker",
    bio: "An elusive data broker operating in the neon shadows of Neo-Warsaw. Specializes in zero-day memory bypasses and encrypted packet interception.",
    isDefault: false,
  },
  {
    id: "user-03",
    name: "Commander Vance",
    avatar: "🛡️",
    role: "Cluster Tactical Commander",
    bio: "A disciplined tactical commander directing autonomous AI swarm operations with strict protocols, military precision, and zero tolerance for compromised security.",
    isDefault: false,
  },
];

const AVATAR_PRESETS = ["🕶️", "⚡", "🛡️", "🦾", "👾", "🥷", "🔮", "🧬", "📡", "💻"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId: string;
  onSelectPersona: (persona: UserPersona) => void;
}

export default function UserPersonaModal({
  isOpen,
  onClose,
  activePersonaId,
  onSelectPersona,
}: Props) {
  const [personas, setPersonas] = useState<UserPersona[]>(DEFAULT_USER_PERSONAS);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("🕶️");
  const [newRole, setNewRole] = useState("");
  const [newBio, setNewBio] = useState("");

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    cyberAudio.play("chime");
    const created: UserPersona = {
      id: `user-${Date.now().toString(36)}`,
      name: newName.trim(),
      avatar: newAvatar,
      role: newRole.trim() || "Independent Operator",
      bio: newBio.trim() || "Autonomous operator within the DirtyNest mesh network.",
      isDefault: false,
    };

    setPersonas((prev) => [...prev, created]);
    onSelectPersona(created);
    setIsCreating(false);
    setNewName("");
    setNewRole("");
    setNewBio("");
  };

  const handleDelete = (id: string) => {
    cyberAudio.play("click");
    if (personas.length <= 1) return;
    setPersonas((prev) => prev.filter((p) => p.id !== id));
    if (activePersonaId === id) {
      const remaining = personas.filter((p) => p.id !== id);
      if (remaining[0]) onSelectPersona(remaining[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-xl cyber-card bg-[#05060A] border border-[#00F0FF]/40 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 bg-[#0A0C14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                USER PERSONA MANAGER // <span className="text-[#00F0FF]">PLAY AS...</span>
              </h3>
              <p className="text-[10px] text-[#4F536E]">
                CONFIGURE YOUR ROLEPLAY IDENTITY & BACKSTORY INJECTED INTO AI MEMORY
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#4F536E] hover:text-[#F1F3F9] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {!isCreating ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#4F536E]">
                  Saved User Personas ({personas.length})
                </span>
                <button
                  onClick={() => {
                    cyberAudio.play("click");
                    setIsCreating(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 font-bold text-[11px] cursor-pointer transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                  <Plus size={13} />
                  <span>NEW PERSONA</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {personas.map((p) => {
                  const isActive = p.id === activePersonaId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        cyberAudio.play("click");
                        onSelectPersona(p);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? "bg-[#00F0FF]/10 border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                          : "bg-black/40 border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-black border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          {p.avatar}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#F1F3F9] text-xs truncate">
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#00F0FF] mt-0.5">{p.role}</span>
                          <p className="text-[11px] text-[#9499B3] font-sans mt-1 line-clamp-2 leading-relaxed">
                            {p.bio}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-center">
                        {isActive ? (
                          <div className="w-6 h-6 rounded-full bg-[#00F0FF] text-black flex items-center justify-center">
                            <Check size={14} className="stroke-[3]" />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                            }}
                            className="p-1.5 text-[#4F536E] hover:text-red-400 cursor-pointer"
                            title="Delete Persona"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CREATE FORM */
            <form onSubmit={handleCreate} className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Select User Avatar
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center cursor-pointer transition-all ${
                        newAvatar === emoji
                          ? "bg-[#00F0FF]/20 border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          : "bg-black/40 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Operator Nova"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  Role / Specialization Tag
                </label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Cyberdeck Specialist & Kernel Hacker"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">
                  User Persona Backstory & Personality (Injected into Prompt)
                </label>
                <textarea
                  rows={4}
                  required
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Describe who you are, your reputation, your gear, and how AI characters should perceive you..."
                  className="w-full p-3 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00d0e0] cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                >
                  SAVE & ACTIVATE PERSONA
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
