"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Copy, Check, Code } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function Notes() {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(() => {
    try {
      const saved = localStorage.getItem("dirtynest_notes");
      const note = saved ? JSON.parse(saved) : null;
      setContent(note?.content || "");
    } catch {
      setContent("");
    }
  }, []);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = useCallback((text: string) => {
    try {
      localStorage.setItem("dirtynest_notes", JSON.stringify({ content: text }));
    } finally {
      setSaved(true);
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
    <div className="cyber-card p-4.5 relative select-none font-mono">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <FileText size={15} className="icon" />
        <h3>Scratchpad Buffer</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyContent}
            title="Copy buffer"
            className="h-6 w-6 rounded-lg text-[#9499B3] hover:text-[#00FF41]"
          >
            {copied ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
          </Button>

          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-mono px-2 py-0.5 font-bold transition-all duration-300",
              saved
                ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                : "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/35"
            )}
          >
            {saved ? "SYNCED" : "BUFFERING"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-[#4F536E] px-3 py-1.5 bg-[#07070B] rounded-t-xl border-t border-x border-white/5">
        <span className="flex items-center gap-1">
          <Code size={10} className="text-[#BF40FF]" />
          <span>dirtynest://notes.md</span>
        </span>
        <span>
          <NumberFlow value={words} /> W · <NumberFlow value={chars} /> C
        </span>
      </div>

      <Textarea
        value={content}
        onChange={handleChange}
        className="w-full h-[135px] text-xs resize-none rounded-t-none rounded-b-xl p-3 bg-[#07070B]/80 text-[#F1F3F9] border-white/5 focus-visible:border-[#00FF41]/50 focus-visible:ring-[#00FF41]/20 font-mono leading-relaxed placeholder:text-[#4F536E]"
        placeholder="// Record operational insights, keys, scratch data..."
      />
    </div>
  );
}
