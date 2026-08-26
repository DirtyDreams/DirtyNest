"use client";

import { useState, useEffect, useCallback } from "react";
import { Link2, Plus, Trash2, ExternalLink, X, Compass } from "lucide-react";

interface QuickLink {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  sort_order: number;
}

const colorBadges = ["#00FF41", "#BF40FF", "#00F0FF", "#FFB800", "#FF2A6D"];

export default function QuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/quick-links");
      if (res.ok) setLinks(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async () => {
    if (!newLink.name || !newLink.url) return;
    let finalUrl = newLink.url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    await fetch("/api/quick-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLink.name, url: finalUrl }),
    });
    setNewLink({ name: "", url: "" });
    setShowAdd(false);
    fetchLinks();
  };

  const deleteLink = async (id: number) => {
    await fetch(`/api/quick-links/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  return (
    <div className="cyber-card p-4.5 relative">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Compass size={15} className="icon" />
        <h3>Warp Gate / Links</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto p-1 rounded-lg hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-colors cursor-pointer"
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div
          className="mb-3 p-3 rounded-xl animate-fade-in space-y-2"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(0, 255, 65, 0.2)",
          }}
        >
          <input
            type="text"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            placeholder="Bookmark Label..."
            className="w-full bg-[#07070B] outline-none text-xs px-3 py-1.5 rounded-lg text-[#F1F3F9] border border-white/10 focus:border-[#00FF41]"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="flex-1 bg-[#07070B] outline-none text-xs px-3 py-1.5 rounded-lg text-[#F1F3F9] border border-white/10 focus:border-[#00FF41]"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <button
              onClick={addLink}
              className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all"
              style={{
                background: "rgba(0, 255, 65, 0.2)",
                color: "#00FF41",
                border: "1px solid rgba(0, 255, 65, 0.3)",
              }}
            >
              LINK
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
        {links.map((link, idx) => {
          const color = colorBadges[idx % colorBadges.length];
          return (
            <div
              key={link.id}
              onClick={() => window.open(link.url, "_blank")}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150 cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.03)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 255, 255, 0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 255, 255, 0.02)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255, 255, 255, 0.03)";
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold"
                style={{
                  background: `${color}15`,
                  color: color,
                  border: `1px solid ${color}30`,
                }}
              >
                {link.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#F1F3F9] truncate group-hover:text-[#00FF41] transition-colors">
                  {link.name}
                </p>
                <p className="text-[10px] font-mono text-[#4F536E] truncate">
                  {link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </p>
              </div>

              <ExternalLink
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#00FF41]"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLink(link.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#4F536E] hover:text-[#FF2A6D] shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {links.length === 0 && (
          <p className="text-[11px] font-mono text-center py-4 text-[#4F536E]">
            No warp links configured
          </p>
        )}
      </div>
    </div>
  );
}
