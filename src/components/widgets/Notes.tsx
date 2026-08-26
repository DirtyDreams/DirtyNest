"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Copy, Check, Trash2, Code } from "lucide-react";

export default function Notes() {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const note = await res.json();
        setContent(note.content || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = useCallback(async (text: string) => {
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      setSaved(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setSaved(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveNote(value), 800);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="cyber-card p-4.5 relative">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <FileText size={15} className="icon" />
        <h3>Scratchpad Buffer</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={copyContent}
            title="Copy buffer"
            className="p-1 rounded-md hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-colors"
          >
            {copied ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
          </button>
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded transition-all duration-300 font-bold"
            style={{
              background: saved ? "rgba(0, 255, 65, 0.1)" : "rgba(255, 184, 0, 0.15)",
              color: saved ? "#00FF41" : "#FFB800",
              border: saved
                ? "1px solid rgba(0, 255, 65, 0.25)"
                : "1px solid rgba(255, 184, 0, 0.35)",
            }}
          >
            {saved ? "SYNCED" : "BUFFERING"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-[#4F536E] px-2 py-1 bg-[#07070B] rounded-t-lg border-t border-x border-white/5">
        <span className="flex items-center gap-1">
          <Code size={10} className="text-[#BF40FF]" />
          <span>dirtynest://notes.md</span>
        </span>
        <span>
          {words} W · {chars} C
        </span>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-[135px] outline-none text-xs resize-none rounded-b-lg p-3 text-[#F1F3F9] placeholder:text-[#4F536E]"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderTop: "none",
          background: "rgba(7, 7, 11, 0.7)",
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          lineHeight: "1.6",
        }}
        placeholder="// Record operational insights, keys, scratch data..."
      />
    </div>
  );
}
