"use client";

import {  } from "react";
import { useState, useRef } from "react";
<<<<<<< HEAD
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  Quote,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
=======
import { Bold, Italic, Code, Heading1, Heading2, List, Quote, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {  } from "@/components/ui/badge";
import {  } from "@/components/ui/textarea";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cn } from "@/lib/utils";

export interface CyberMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  onAiAssist?: (action: string, content: string) => void;
}

export function CyberMarkdownEditor({
  value,
  onChange,
  placeholder = "Write documentation, knowledge base entries, or markdown...",
  className,
  onAiAssist,
}: CyberMarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#080912] flex flex-col overflow-hidden font-mono text-xs shadow-xl",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("**", "**")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Bold"
          >
            <Bold size={13} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("*", "*")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Italic"
          >
            <Italic size={13} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("`", "`")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Inline Code"
          >
            <Code size={13} />
          </Button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("# ")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Heading 1"
          >
            <Heading1 size={13} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("## ")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Heading 2"
          >
            <Heading2 size={13} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("- ")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Bullet List"
          >
            <List size={13} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("> ")}
            className="h-7 w-7 p-0 text-[#9499B3] hover:text-[#00FF41] hover:bg-white/5"
            title="Quote"
          >
            <Quote size={13} />
          </Button>

          {onAiAssist && (
            <>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAiAssist("enhance", value)}
                className="h-7 px-2 gap-1 border-[#BF40FF]/30 text-[#BF40FF] bg-[#BF40FF]/10 hover:bg-[#BF40FF]/20 text-[10px]"
              >
                <Sparkles size={11} />
                <span>AI Enhance</span>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg bg-black/50 border border-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                viewMode === "edit"
                  ? "bg-[#00FF41]/20 text-[#00FF41]"
                  : "text-[#4F536E] hover:text-[#9499B3]"
              )}
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all hidden md:inline",
                viewMode === "split"
                  ? "bg-[#00FF41]/20 text-[#00FF41]"
                  : "text-[#4F536E] hover:text-[#9499B3]"
              )}
            >
              SPLIT
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                viewMode === "preview"
                  ? "bg-[#00FF41]/20 text-[#00FF41]"
                  : "text-[#4F536E] hover:text-[#9499B3]"
              )}
            >
              PREVIEW
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[10px] text-[#9499B3] hover:text-[#00FF41]"
          >
            {copied ? <Check size={12} className="text-[#00FF41] mr-1" /> : <Copy size={12} className="mr-1" />}
            <span className="hidden sm:inline">{copied ? "COPIED" : "COPY"}</span>
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-[300px]">
        {/* Textarea */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={cn("p-3 flex flex-col", viewMode === "edit" && "md:col-span-2")}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-full bg-transparent border-0 text-[#F1F3F9] font-mono text-xs leading-relaxed resize-none focus:outline-hidden placeholder:text-[#4F536E]"
            />
          </div>
        )}

        {/* Live Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "p-4 border-t md:border-t-0 md:border-l border-white/5 bg-black/40 overflow-y-auto max-h-[500px] text-xs text-[#CBD5E1] leading-relaxed",
              viewMode === "preview" && "md:col-span-2"
            )}
          >
            {value ? (
              <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                {value}
              </div>
            ) : (
              <span className="text-[#4F536E] italic">Preview will appear here...</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-2 px-3 border-t border-white/5 bg-white/[0.01] text-[10px] text-[#4F536E]">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <span className="text-[#00FF41]">MARKDOWN SYNTAX READY</span>
      </div>
    </div>
  );
}
