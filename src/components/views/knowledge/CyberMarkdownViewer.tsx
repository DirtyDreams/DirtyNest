"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Sparkles, Terminal } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface CyberMarkdownViewerProps {
  content: string;
  onWikiLinkClick?: (linkName: string) => void;
}

interface FrontmatterData {
  title?: string;
  category?: string;
  tags?: string[];
  skill_level?: string;
  author?: string;
  status?: string;
  cvss?: string;
  version?: string;
  vault?: string;
  [key: string]: any;
}

export default function CyberMarkdownViewer({ content, onWikiLinkClick }: CyberMarkdownViewerProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // Extract YAML frontmatter
  const { frontmatter, body } = parseFrontmatter(content);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    cyberAudio.play("click");
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleLinkClick = (wikiTarget: string) => {
    cyberAudio.play("click");
    if (onWikiLinkClick) {
      onWikiLinkClick(wikiTarget);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs leading-relaxed text-[#F1F3F9] font-sans selection:bg-[#00FF41]/20 selection:text-[#00FF41]">
      {/* RENDER FRONTMATTER HUD CARD IF PRESENT */}
      {frontmatter && Object.keys(frontmatter).length > 0 && (
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-2.5 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5 text-[10px] text-[#9499B3]">
              <Sparkles size={12} className="text-[#00FF41]" />
              <span className="font-bold uppercase tracking-wider text-[#00FF41]">OBSIDIAN FRONTMATTER METADATA</span>
            </div>
            {frontmatter.status && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                {frontmatter.status}
              </span>
            )}
            {frontmatter.cvss && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40">
                CVSS: {frontmatter.cvss}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {frontmatter.skill_level && (
              <div className="flex flex-col p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[9px] text-[#4F536E] uppercase">SKILL LEVEL</span>
                <span className="font-bold text-[#FFB800] mt-0.5">{frontmatter.skill_level}</span>
              </div>
            )}

            {frontmatter.author && (
              <div className="flex flex-col p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[9px] text-[#4F536E] uppercase">AUTHOR / ARCHITECT</span>
                <span className="font-bold text-[#00F0FF] mt-0.5 truncate">{frontmatter.author}</span>
              </div>
            )}

            {frontmatter.category && (
              <div className="flex flex-col p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[9px] text-[#4F536E] uppercase">FRAMEWORK</span>
                <span className="font-bold text-[#BF40FF] mt-0.5 truncate">{frontmatter.category}</span>
              </div>
            )}
          </div>

          {frontmatter.tags && Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
              <span className="text-[9px] text-[#4F536E] uppercase mr-1">TAGS:</span>
              {frontmatter.tags.map((t: string) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] border border-[#00F0FF]/25 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER MAIN BODY */}
      <div className="space-y-4">
        {renderMarkdownBlocks(body, handleCopyCode, copiedCodeIdx, handleLinkClick)}
      </div>
    </div>
  );
}

// Frontmatter parsing helper
function parseFrontmatter(rawContent: string): { frontmatter: FrontmatterData | null; body: string } {
  const trimmed = rawContent.trim();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: null, body: rawContent };
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return { frontmatter: null, body: rawContent };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();

  const frontmatter: FrontmatterData = {};
  const lines = yamlBlock.split("\n");

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      // Parse tags array format [tag1, tag2]
      if (value.startsWith("[") && value.endsWith("]")) {
        const items = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
        frontmatter[key] = items;
      } else {
        frontmatter[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return { frontmatter, body };
}

// Block-by-block renderer
function renderMarkdownBlocks(
  markdownText: string,
  onCopyCode: (code: string, idx: number) => void,
  copiedCodeIdx: number | null,
  onLinkClick: (link: string) => void
) {
  const blocks = splitIntoBlocks(markdownText);
  let codeBlockCounter = 0;

  return blocks.map((block, idx) => {
    // 1. Fenced Code Block
    if (block.type === "code") {
      const currentIdx = codeBlockCounter++;
      return (
        <div key={idx} className="my-3 rounded-xl bg-black/80 border border-white/10 overflow-hidden font-mono shadow-lg">
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/5 text-[10px] text-[#9499B3]">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} className="text-[#00FF41]" />
              <span className="font-bold uppercase tracking-wider text-[#00FF41]">
                {block.lang || "CODE"}
              </span>
            </div>
            <button
              onClick={() => onCopyCode(block.content, currentIdx)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
            >
              {copiedCodeIdx === currentIdx ? (
                <>
                  <Check size={11} className="text-[#00FF41]" />
                  <span className="text-[#00FF41] font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 text-xs text-[#00FF41]/90 overflow-x-auto leading-relaxed scrollbar-none">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    }

    // 2. Heading 1 (#)
    if (block.type === "h1") {
      return (
        <div key={idx} className="pt-2 pb-1 border-b border-white/10">
          <h1 className="text-base sm:text-lg font-black text-[#F1F3F9] tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-[#00FF41]" />
            {renderInlineText(block.content, onLinkClick)}
          </h1>
        </div>
      );
    }

    // 3. Heading 2 (##)
    if (block.type === "h2") {
      return (
        <h2 key={idx} className="text-sm font-black text-[#00F0FF] tracking-tight pt-2 flex items-center gap-2">
          <span className="text-[#00F0FF] opacity-60 font-mono">//</span>
          {renderInlineText(block.content, onLinkClick)}
        </h2>
      );
    }

    // 4. Heading 3 (###)
    if (block.type === "h3") {
      return (
        <h3 key={idx} className="text-xs font-bold text-[#BF40FF] tracking-wide pt-1 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#BF40FF]" />
          {renderInlineText(block.content, onLinkClick)}
        </h3>
      );
    }

    // 5. Table
    if (block.type === "table") {
      return (
        <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40">
          <table className="w-full text-left text-[11px] border-collapse font-sans">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10 text-[#00F0FF] font-mono font-bold">
                {block.headers.map((h: string, i: number) => (
                  <th key={i} className="p-2.5">
                    {renderInlineText(h, onLinkClick)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {block.rows.map((row: string[], rIdx: number) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((cell: string, cIdx: number) => (
                    <td key={cIdx} className="p-2.5 text-[#D1D5DB]">
                      {renderInlineText(cell, onLinkClick)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 6. Ordered List
    if (block.type === "ol") {
      return (
        <ol key={idx} className="space-y-1.5 pl-2">
          {block.items.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#D1D5DB] leading-relaxed">
              <span className="font-mono font-bold text-[#00FF41] shrink-0 text-[11px]">{i + 1}.</span>
              <span>{renderInlineText(item, onLinkClick)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // 7. Unordered List
    if (block.type === "ul") {
      return (
        <ul key={idx} className="space-y-1.5 pl-2">
          {block.items.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#D1D5DB] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shrink-0 mt-1.5" />
              <span>{renderInlineText(item, onLinkClick)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // 8. Blockquote
    if (block.type === "quote") {
      return (
        <div
          key={idx}
          className="p-3 my-2 rounded-r-xl bg-[#BF40FF]/[0.06] border-l-2 border-[#BF40FF] text-[#D1D5DB] text-xs italic leading-relaxed"
        >
          {renderInlineText(block.content, onLinkClick)}
        </div>
      );
    }

    // 9. Standard Paragraph
    return (
      <p key={idx} className="text-xs text-[#D1D5DB] leading-relaxed">
        {renderInlineText(block.content, onLinkClick)}
      </p>
    );
  });
}

// Split into AST blocks
function splitIntoBlocks(text: string): any[] {
  const lines = text.split("\n");
  const blocks: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check code fence
    if (line.trim().startsWith("`")) {
      const lang = line.trim().replace(/^`/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("`")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      i++;
      continue;
    }

    // Check headings
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", content: line.replace(/^#\s+/, "") });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", content: line.replace(/^##\s+/, "") });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.replace(/^###\s+/, "") });
      i++;
      continue;
    }

    // Check blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "quote", content: quoteLines.join(" ") });
      continue;
    }

    // Check table
    if (line.trim().startsWith("|") && line.trim().endsWith("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const parseRow = (str: string) =>
        str
          .split("|")
          .slice(1, -1)
          .map((s) => s.trim());

      const headers = parseRow(line);
      i += 2; // skip header and divider
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Check lists
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph (group non-empty lines)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("`") &&
      !lines[i].startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !/^\s*(\d+\.|[-*])\s+/.test(lines[i])
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", content: pLines.join(" ") });
  }

  return blocks;
}

// Inline renderer: WikiLinks [[...]], code, **bold**, *italic*, [link](url)
function renderInlineText(text: string, onLinkClick: (link: string) => void): React.ReactNode[] {
  const regex = /(\[\[[^\]]+\]\]|[^]+|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. [[WikiLink]]
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const linkTarget = part.slice(2, -2).trim();
      return (
        <button
          key={index}
          type="button"
          onClick={() => onLinkClick(linkTarget)}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 my-0.5 rounded-md bg-[#BF40FF]/15 border border-[#BF40FF]/40 text-[#BF40FF] hover:bg-[#BF40FF]/25 hover:text-white font-mono text-[11px] font-bold transition-all cursor-pointer shadow-[0_0_8px_rgba(191,64,255,0.2)]"
        >
          <ExternalLink size={10} />
          <span>{linkTarget}</span>
        </button>
      );
    }

    // 2. inline code
    if (part.startsWith("") && part.endsWith("")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-black/60 border border-[#00FF41]/30 text-[#00FF41] font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 3. **bold**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[#F1F3F9]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 4. *italic*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-[#9499B3]">
          {part.slice(1, -1)}
        </em>
      );
    }

    // 5. [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[#00F0FF] hover:underline font-bold"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink size={10} />
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
