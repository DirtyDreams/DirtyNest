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
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  X,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { HermesChatSession } from "./ChatbotSessionsDrawer";
import { AgentPersona } from "./PersonaStudioModal";

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
  isCollapsed?: boolean;
}

export type ThreadSortMode = "newest" | "oldest" | "alphabetical" | "messages";

interface Props {
  sessions: HermesChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: (folderId?: string) => void;
  onBranchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onMoveSessionToFolder: (sessionId: string, folderId?: string) => void;
  onExportSessionMarkdown: (id: string) => void;
  folders: ChatFolder[];
  onCreateFolder: (name: string, color: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolderCollapse: (id: string) => void;
  activePersona: AgentPersona;
  onOpenPersonaStudio: () => void;
}

const NEON_COLORS = [
  { label: "Emerald Green", value: "#00FF41" },
  { label: "Cyan Blue", value: "#00F0FF" },
  { label: "Purple Neural", value: "#BF40FF" },
  { label: "Amber Gold", value: "#FFB800" },
  { label: "Crimson Red", value: "#FF0055" },
  { label: "Sky Azure", value: "#38BDF8" },
];

export default function ChatbotSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onBranchSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onMoveSessionToFolder,
  onExportSessionMarkdown,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleFolderCollapse,
  activePersona,
  onOpenPersonaStudio,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<ThreadSortMode>("newest");
  const [activeFilter, setActiveFilter] = useState<"all" | "pinned">("all");
  
  // Folder Modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(NEON_COLORS[0].value);

  // Rename session / folder states
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  // Move dropdown popover
  const [openMoveMenuId, setOpenMoveMenuId] = useState<string | null>(null);

  // Filter & Search
  let processedSessions = sessions.filter((s) => {
    if (activeFilter === "pinned" && !s.isPinned) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.lastMessageSnippet.toLowerCase().includes(q);
  });

  // Sorting
  processedSessions.sort((a, b) => {
    if (sortMode === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    if (sortMode === "messages") {
      return b.messageCount - a.messageCount;
    }
    if (sortMode === "oldest") {
      return a.id.localeCompare(b.id);
    }
    // newest (default)
    return b.id.localeCompare(a.id);
  });

  const handleStartRenameSession = (e: React.MouseEvent, s: HermesChatSession) => {
    e.stopPropagation();
    cyberAudio.play("click");
    setEditingSessionId(s.id);
    setEditSessionTitle(s.title);
  };

  const handleSaveRenameSession = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editSessionTitle.trim()) {
      onRenameSession(id, editSessionTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleStartRenameFolder = (e: React.MouseEvent, f: ChatFolder) => {
    e.stopPropagation();
    cyberAudio.play("click");
    setEditingFolderId(f.id);
    setEditFolderName(f.name);
  };

  const handleSaveRenameFolder = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editFolderName.trim()) {
      onRenameFolder(id, editFolderName.trim());
    }
    setEditingFolderId(null);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      cyberAudio.play("chime");
      onCreateFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName("");
      setShowNewFolderModal(false);
    }
  };

  // Render a Single Session Card
  const renderSessionCard = (session: HermesChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingSessionId === session.id;
    const isMoveOpen = openMoveMenuId === session.id;

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
        {/* Top: Title & Quick Hover Actions */}
        <div className="flex items-center justify-between">
          {isEditing ? (
            <form
              onSubmit={(e) => handleSaveRenameSession(e, session.id)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 flex-1 mr-1"
            >
              <input
                type="text"
                value={editSessionTitle}
                onChange={(e) => setEditSessionTitle(e.target.value)}
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
              {session.isPinned && (
                <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
              )}
            </div>
          )}

          {/* Actions on Hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cyberAudio.play("click");
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-white/10 ${
                session.isPinned ? "text-amber-400" : "text-slate-400 hover:text-amber-300"
              }`}
              title={session.isPinned ? "Unpin thread" : "Pin thread to top"}
            >
              <Star size={10} className={session.isPinned ? "fill-amber-400" : ""} />
            </button>

            {/* Move to Folder Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyberAudio.play("click");
                  setOpenMoveMenuId(isMoveOpen ? null : session.id);
                }}
                className="p-1 rounded hover:bg-white/10 text-[#00F0FF] hover:text-cyan-300"
                title="Move to Folder"
              >
                <Folder size={10} />
              </button>

              {/* Move to Folder Dropdown Popover */}
              {isMoveOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-44 bg-[#0A0C16] border border-white/15 rounded-xl shadow-2xl z-50 p-1 flex flex-col gap-0.5 font-mono animate-fade-in"
                >
                  <span className="text-[8px] font-bold text-[#4F536E] px-2 py-1 uppercase">
                    Move to Folder:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onMoveSessionToFolder(session.id, undefined);
                      setOpenMoveMenuId(null);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] text-left hover:bg-white/10 transition-colors ${
                      !session.folderId ? "text-[#00FF41] font-bold bg-white/5" : "text-slate-300"
                    }`}
                  >
                    <Folder size={11} className="text-slate-400" />
                    <span>Uncategorized</span>
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        onMoveSessionToFolder(session.id, f.id);
                        setOpenMoveMenuId(null);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] text-left hover:bg-white/10 transition-colors ${
                        session.folderId === f.id ? "text-[#00FF41] font-bold bg-white/5" : "text-slate-300"
                      }`}
                    >
                      <Folder size={11} style={{ color: f.color }} />
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rename */}
            <button
              type="button"
              onClick={(e) => handleStartRenameSession(e, session)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
              title="Rename"
            >
              <Edit2 size={10} />
            </button>

            {/* Branch Fork */}
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

            {/* Export Markdown */}
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

            {/* Delete */}
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

        {/* Snippet */}
        <p className="text-[11px] text-[#9499B3] line-clamp-2 leading-relaxed">
          {session.lastMessageSnippet}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00FF41] font-bold">{session.personaName}</span>
            <span>•</span>
            <span>{session.messageCount} msgs</span>
          </div>
          <span>{session.updatedAt}</span>
        </div>
      </div>
    );
  };

  const pinnedSessions = processedSessions.filter((s) => s.isPinned);
  const uncategorizedSessions = processedSessions.filter((s) => !s.folderId && !s.isPinned);

  return (
    <div className="w-80 sm:w-96 lg:w-[380px] xl:w-[410px] shrink-0 cyber-card p-3.5 flex flex-col justify-between h-[calc(100vh-6rem)] min-h-[640px] max-h-[920px] font-mono select-none overflow-hidden transition-all border border-white/10 shadow-2xl relative">
      {/* Top Section */}
      <div className="flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Layers size={13} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-wider">
                THREADS & FOLDERS
              </h3>
              <p className="text-[9px] text-[#4F536E]">Hierarchical Memory</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
            {sessions.length} THREADS
          </span>
        </div>

        {/* Action Buttons: New Chat & New Folder */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("warp");
              onCreateSession();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#00FF41]/15 hover:bg-[#00FF41]/25 text-[#00FF41] border border-[#00FF41]/30 font-extrabold text-[11px] cursor-pointer transition-all shadow-[0_0_10px_rgba(0,255,65,0.15)]"
          >
            <Plus size={13} />
            <span>NEW CHAT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setShowNewFolderModal(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[11px] cursor-pointer transition-all"
          >
            <FolderPlus size={13} />
            <span>+ FOLDER</span>
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[11px] text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none font-mono"
            />
          </div>

          {/* Sort Selector Dropdown */}
          <select
            value={sortMode}
            onChange={(e) => {
              cyberAudio.play("click");
              setSortMode(e.target.value as ThreadSortMode);
            }}
            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-[#9499B3] focus:border-[#00FF41] outline-none cursor-pointer"
          >
            <option value="newest">🕒 Newest</option>
            <option value="oldest">⌛ Oldest</option>
            <option value="alphabetical">🔤 A-Z</option>
            <option value="messages">💬 Most msgs</option>
          </select>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 text-[9px] font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-white/15 text-white border border-white/20"
                : "text-[#4F536E] hover:text-white"
            }`}
          >
            ALL ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pinned")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
              activeFilter === "pinned"
                ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                : "text-[#4F536E] hover:text-amber-400"
            }`}
          >
            <Star size={9} className="fill-amber-400" />
            <span>PINNED ({sessions.filter((s) => s.isPinned).length})</span>
          </button>
        </div>
      </div>

      {/* Middle Section: Folders & Threads Tree */}
      <div className="flex-1 overflow-y-auto my-2.5 pr-1 space-y-2.5 scrollbar-thin">
        {/* PINNED SECTION */}
        {pinnedSessions.length > 0 && activeFilter === "all" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 px-1 uppercase tracking-wider">
              <Star size={10} className="fill-amber-400" />
              <span>PINNED THREADS ({pinnedSessions.length})</span>
            </div>
            {pinnedSessions.map(renderSessionCard)}
          </div>
        )}

        {/* FOLDERS LIST */}
        {folders.map((folder) => {
          const folderSessions = processedSessions.filter(
            (s) => s.folderId === folder.id && !s.isPinned
          );
          const isCollapsed = folder.isCollapsed;
          const isEditingFolder = editingFolderId === folder.id;

          return (
            <div key={folder.id} className="rounded-xl border border-white/5 bg-black/30 overflow-hidden">
              {/* Folder Header */}
              <div
                onClick={() => onToggleFolderCollapse(folder.id)}
                className="p-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group/folder"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {isCollapsed ? (
                    <ChevronRight size={13} className="text-[#4F536E]" />
                  ) : (
                    <ChevronDown size={13} className="text-[#4F536E]" />
                  )}
                  <Folder
                    size={13}
                    style={{ color: folder.color }}
                    className="shrink-0"
                  />

                  {isEditingFolder ? (
                    <form
                      onSubmit={(e) => handleSaveRenameFolder(e, folder.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1 mr-1"
                    >
                      <input
                        type="text"
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        className="w-full p-0.5 rounded bg-black border border-[#00FF41] text-[11px] text-white outline-none font-mono"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-0.5 rounded bg-[#00FF41] text-black font-bold text-[9px]"
                      >
                        <Check size={10} />
                      </button>
                    </form>
                  ) : (
                    <span className="text-[11px] font-bold text-white truncate">
                      {folder.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className="text-[8px] font-black px-1.5 py-0.2 rounded"
                    style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                  >
                    {folderSessions.length}
                  </span>

                  {/* Folder Actions on Hover */}
                  <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("warp");
                        onCreateSession(folder.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-[#00FF41]"
                      title="New chat in this folder"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStartRenameFolder(e, folder)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400"
                      title="Rename folder"
                    >
                      <Edit2 size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("click");
                        onDeleteFolder(folder.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                      title="Delete folder"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Folder Inner Sessions List */}
              {!isCollapsed && (
                <div className="p-1.5 pt-0 space-y-1 pl-4 border-l border-white/5 ml-3 my-1">
                  {folderSessions.length === 0 ? (
                    <div className="p-2 text-center text-[10px] text-[#4F536E] italic">
                      Folder is empty.
                    </div>
                  ) : (
                    folderSessions.map(renderSessionCard)
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* UNCATEGORIZED SESSIONS */}
        {uncategorizedSessions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-[#9499B3] px-1 uppercase tracking-wider">
              <span>GENERAL // UNCATEGORIZED ({uncategorizedSessions.length})</span>
            </div>
            {uncategorizedSessions.map(renderSessionCard)}
          </div>
        )}

        {processedSessions.length === 0 && (
          <div className="p-8 text-center text-xs text-[#4F536E] flex flex-col items-center justify-center gap-2">
            <MessageSquare size={22} className="opacity-40" />
            <span>No threads found.</span>
          </div>
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
            title="Configure Persona Directives & LLM Knobs"
          >
            <Sliders size={12} />
          </div>
        </div>
      </div>

      {/* Create New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="w-full max-w-sm rounded-2xl bg-[#0A0C16] border border-white/15 p-4 flex flex-col gap-3.5 shadow-2xl font-mono"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderPlus size={16} className="text-[#00F0FF]" />
                <h4 className="text-xs font-black text-white uppercase">
                  Create New Chat Folder
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="p-1 text-[#4F536E] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#9499B3] uppercase block mb-1">
                Folder Name:
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Security Audits, Project Alpha..."
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-[#4F536E] focus:border-[#00FF41] outline-none font-mono"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#9499B3] uppercase block mb-1">
                Folder Neon Color:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {NEON_COLORS.map((c) => {
                  const isSelected = newFolderColor === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewFolderColor(c.value)}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected ? "border-white bg-white/10" : "border-white/5 bg-black/40 text-[#9499B3]"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.value }}
                      />
                      <span className="truncate">{c.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#9499B3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#00FF41] text-black font-extrabold text-xs cursor-pointer hover:bg-[#00cc34] shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
