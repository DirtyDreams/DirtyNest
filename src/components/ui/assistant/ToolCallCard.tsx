"use client";

import * as React from "react";
import { useState } from "react";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToolCallProps {
  toolName: string;
  args: Record<string, any> | string;
  result?: Record<string, any> | string;
  status: "pending" | "running" | "success" | "error";
  durationMs?: number;
  className?: string;
}

export function ToolCallCard({
  toolName,
  args,
  result,
  status,
  durationMs,
  className,
}: ToolCallProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getToolIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "bash":
      case "run_command":
      case "terminal":
        return Terminal;
      case "search":
      case "grep_search":
        return Search;
      case "database":
      case "sql_query":
        return Database;
      default:
        return Cpu;
    }
  };

  const Icon = getToolIcon(toolName);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-[#06070E] overflow-hidden font-mono text-xs transition-all",
        status === "running" && "border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.08)]",
        status === "error" && "border-[#FF2A6D]/40",
        className
      )}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0",
              status === "running" && "bg-[#00FF41]/10 text-[#00FF41] animate-pulse",
              status === "success" && "bg-[#00FF41]/10 text-[#00FF41]",
              status === "error" && "bg-[#FF2A6D]/10 text-[#FF2A6D]",
              status === "pending" && "bg-white/5 text-[#9499B3]"
            )}
          >
            <Icon size={13} />
          </div>

          <span className="font-bold text-[#F1F3F9] truncate tracking-wider">
            {toolName}
          </span>

          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0 uppercase font-mono font-bold tracking-wider",
              status === "running" && "border-[#00FF41]/40 text-[#00FF41] bg-[#00FF41]/10",
              status === "success" && "border-[#00FF41]/30 text-[#00FF41] bg-[#00FF41]/5",
              status === "error" && "border-[#FF2A6D]/40 text-[#FF2A6D] bg-[#FF2A6D]/10",
              status === "pending" && "border-white/10 text-[#9499B3]"
            )}
          >
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-[#4F536E]">
          {durationMs !== undefined && (
            <span className="text-[10px] text-[#9499B3]">{durationMs}ms</span>
          )}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-3 border-t border-white/5 space-y-2.5 bg-black/40 text-[11px]">
          {/* Tool Arguments */}
          <div>
            <span className="text-[9px] font-bold text-[#4F536E] uppercase tracking-wider block mb-1">
              INPUT ARGUMENTS:
            </span>
            <pre className="p-2 rounded-lg bg-black/60 border border-white/5 text-[#9499B3] overflow-x-auto text-[11px] leading-relaxed">
              {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
            </pre>
          </div>

          {/* Tool Result Output */}
          {result && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-[#4F536E] uppercase tracking-wider">
                  OUTPUT RESULT:
                </span>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[9px] text-[#9499B3] hover:text-[#00FF41]"
                >
                  {copied ? <Check size={11} className="text-[#00FF41] mr-1" /> : <Copy size={11} className="mr-1" />}
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </Button>
              </div>
              <pre className="p-2 rounded-lg bg-black/60 border border-white/5 text-[#00FF41] overflow-x-auto text-[11px] leading-relaxed max-h-48">
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
