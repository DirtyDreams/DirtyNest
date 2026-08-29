"use client";

import { useState, useEffect } from "react";
import { Code, Copy, Check, Plus, Trash2, Search } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface Snippet {
  id: string;
  title: string;
  category: string;
  language: string;
  code: string;
  description: string;
}

const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: "s-1",
    title: "Docker Compose: Full Stack Matrix",
    category: "Docker",
    language: "yaml",
    code: `services:
  dirtynest:
    image: node:20-alpine
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/data`,
    description: "Production ready docker-compose container configuration",
  },
  {
    id: "s-2",
    title: "Kill Process on Specified Port (PowerShell)",
    category: "Bash / CLI",
    language: "powershell",
    code: `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force`,
    description: "Instantly terminate any hanging node server occupying port 3000",
  },
  {
    id: "s-3",
    title: "Git: Revert Uncommitted Changes & Clean Untracked",
    category: "Git",
    language: "bash",
    code: `git reset --hard HEAD
git clean -fd`,
    description: "Hard reset working tree and remove all untracked artifacts",
  },
  {
    id: "s-4",
    title: "PostgreSQL: Active Connections & Query Locks",
    category: "SQL",
    language: "sql",
    code: `SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;`,
    description: "Inspect slow running queries and connection pool locks",
  },
  {
    id: "s-5",
    title: "Next.js: Optimized Fetch with Timeout AbortSignal",
    category: "TypeScript",
    language: "typescript",
    code: `export async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}`,
    description: "Reliable client-side fetch helper with automatic request timeout",
  },
];

const CATEGORIES = ["ALL", "Docker", "Bash / CLI", "Git", "SQL", "TypeScript", "Custom"];

export default function SnippetVault() {
  const [snippets, setSnippets] = useState<Snippet[]>(DEFAULT_SNIPPETS);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSnippet, setNewSnippet] = useState({
    title: "",
    category: "Custom",
    language: "bash",
    code: "",
    description: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_custom_snippets");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSnippets([...DEFAULT_SNIPPETS, ...parsed]);
      }
    } catch {}
  }, []);

  const saveCustomSnippet = () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim()) return;
    cyberAudio.play("click");
    const item: Snippet = {
      id: `custom-${Date.now()}`,
      title: newSnippet.title,
      category: newSnippet.category,
      language: newSnippet.language,
      code: newSnippet.code,
      description: newSnippet.description,
    };

    const updated = [item, ...snippets];
    setSnippets(updated);

    const customOnly = updated.filter((s) => s.id.startsWith("custom-"));
    try {
      localStorage.setItem("dirtynest_custom_snippets", JSON.stringify(customOnly));
    } catch {}

    setNewSnippet({ title: "", category: "Custom", language: "bash", code: "", description: "" });
    setShowAddModal(false);
  };

  const deleteSnippet = (id: string) => {
    cyberAudio.play("click");
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    const customOnly = updated.filter((s) => s.id.startsWith("custom-"));
    try {
      localStorage.setItem("dirtynest_custom_snippets", JSON.stringify(customOnly));
    } catch {}
  };

  const copySnippet = (code: string, id: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = snippets.filter((s) => {
    const matchesCat = selectedCategory === "ALL" || s.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4.5 font-mono">
      {/* Top Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-[#00FF41]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            Developer Code Snippets Vault
          </h3>
        </div>

        <button
          onClick={() => {
            cyberAudio.play("click");
            setShowAddModal(!showAddModal);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)]"
        >
          <Plus size={13} />
          <span>ADD SNIPPET</span>
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center bg-black/50 rounded-xl border border-white/10 px-3 py-2">
          <Search size={14} className="text-[#9499B3] mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets by command, keyword, language..."
            className="w-full bg-transparent outline-none text-xs text-[#F1F3F9] font-mono selection:bg-[#00FF41]/20"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                  : "text-[#9499B3] hover:text-[#F1F3F9] border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Snippet Modal / Drawer */}
      {showAddModal && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-[#00FF41]/30 flex flex-col gap-3 animate-fade-in">
          <span className="text-xs font-bold text-[#00FF41] uppercase tracking-wider">
            Create New Tactical Code Snippet
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newSnippet.title}
              onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
              placeholder="Snippet title..."
              className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]"
            />
            <select
              value={newSnippet.category}
              onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value })}
              className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs text-[#00F0FF] outline-none cursor-pointer"
            >
              <option value="Docker">Docker</option>
              <option value="Bash / CLI">Bash / CLI</option>
              <option value="Git">Git</option>
              <option value="SQL">SQL</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Custom">Custom</option>
            </select>
            <input
              type="text"
              value={newSnippet.description}
              onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
              placeholder="Short description..."
              className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]"
            />
          </div>

          <textarea
            value={newSnippet.code}
            onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
            placeholder="Paste code / shell commands here..."
            rows={5}
            className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-[#00FF41] outline-none resize-none focus:border-[#00FF41]"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={saveCustomSnippet}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 cursor-pointer"
            >
              SAVE TO VAULT
            </button>
          </div>
        </div>
      )}

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="lg:col-span-2 py-12 text-center text-[#4F536E] text-xs">
            No snippets match the active filter or search terms.
          </div>
        )}

        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3 hover:border-white/15 transition-all group"
          >
            {/* Snippet Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors">
                    {s.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
                    {s.category}
                  </span>
                </div>
                {s.description && (
                  <p className="text-[10px] text-[#4F536E]">{s.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copySnippet(s.code, s.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] bg-white/5 hover:bg-[#00FF41]/20 hover:text-[#00FF41] text-[#9499B3] transition-all cursor-pointer font-bold border border-transparent hover:border-[#00FF41]/30"
                  title="Copy code"
                >
                  {copiedId === s.id ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                  <span>{copiedId === s.id ? "COPIED" : "COPY"}</span>
                </button>

                {s.id.startsWith("custom-") && (
                  <button
                    onClick={() => deleteSnippet(s.id)}
                    className="p-1 rounded text-[#4F536E] hover:text-[#FF2A6D] cursor-pointer"
                    title="Delete custom snippet"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Code Pre Block */}
            <pre className="text-xs text-[#00FF41] bg-black/60 p-3 rounded-lg overflow-x-auto max-h-[160px] font-mono selection:bg-[#00FF41]/20 border border-white/5">
              {s.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
