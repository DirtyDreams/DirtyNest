"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ExternalLink, X, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="cyber-card p-4.5 relative select-none font-mono">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Compass size={15} className="icon" />
        <h3>Warp Gate / Links</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto h-7 w-7 rounded-lg text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-3 p-3 rounded-xl animate-fade-in space-y-2 bg-white/[0.03] border border-[#00FF41]/20">
          <Input
            type="text"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            placeholder="Bookmark Label..."
            className="h-8 bg-[#07070B] text-xs border-white/10 text-[#F1F3F9] focus-visible:border-[#00FF41]/50"
          />
          <div className="flex gap-2">
            <Input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="h-8 flex-1 bg-[#07070B] text-xs border-white/10 text-[#F1F3F9] focus-visible:border-[#00FF41]/50"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <Button
              onClick={addLink}
              size="sm"
              className="h-8 px-3 bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/30 font-bold"
            >
              LINK
            </Button>
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
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150 cursor-pointer bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
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

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLink(link.id);
                }}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0 text-[#4F536E] hover:text-[#FF2A6D] hover:bg-white/5"
              >
                <Trash2 size={12} />
              </Button>
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
