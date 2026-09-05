"use client";

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
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToolCallProps {
  toolName: string;
  args: Record<string, any> | string;
  result?: Record<string, any> | string;
  status: "pending" | "running" | "success" | "error";
  durationMs?: number;
  riskLevel?: "low" | "medium" | "critical";
  className?: string;
}

export function ToolCallCard({
  toolName,
  args,
  result,
  status,
  durationMs,
  riskLevel,
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

  // Determine inferable risk level if not explicitly provided
  const resolvedRiskLevel = riskLevel || (() => {
    const lower = toolName.toLowerCase();
    if (lower.includes("rm") || lower.includes("delete") || lower.includes("drop") || lower.includes("socket")) {
      return "critical";
    }
    if (lower.includes("bash") || lower.includes("run_command") || lower.includes("terminal") || lower.includes("write") || lower.includes("exec")) {
      return "medium";
    }
    return "low";
  })();

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
        "luminous-surface-l2 rounded-xl border border-white/10 overflow-hidden font-mono text-xs transition-all relative",
        status === "running" && "border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.12)]",
        status === "error" && "border-[#FF2A6D]/40 shadow-[0_0_15px_rgba(255,42,109,0.12)]",
        className
      )}
    >
      <div className="hud-corner-bracket tl" />
      <div className="hud-corner-bracket br" />

      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border",
              status === "running" && "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 animate-pulse",
              status === "success" && "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/20",
              status === "error" && "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30",
              status === "pending" && "bg-white/5 text-[#9499B3] border-white/10"
            )}
          >
            <Icon size={13} />
          </div>

          <span className="font-bold text-[#F1F3F9] truncate tracking-wider">
            {toolName}
          </span>

          {/* Tactical Status Badge */}
          <span
            className={cn(
              "tactical-badge text-[9px] uppercase font-mono font-bold tracking-wider shrink-0",
              status === "running" && "border-[#00FF41]/40 text-[#00FF41] bg-[#00FF41]/10 shadow-[0_0_8px_rgba(0,255,65,0.2)]",
              status === "success" && "border-[#00FF41]/30 text-[#00FF41] bg-[#00FF41]/5",
              status === "error" && "border-[#FF2A6D]/40 text-[#FF2A6D] bg-[#FF2A6D]/10 shadow-[0_0_8px_rgba(255,42,109,0.2)]",
              status === "pending" && "border-white/10 text-[#9499B3]"
            )}
          >
            [{status}]
          </span>

          {/* Tactical Risk Badge */}
          <span
            className={cn(
              "tactical-badge text-[9px] uppercase font-mono font-bold tracking-wider shrink-0 hidden sm:inline-flex items-center gap-1",
              resolvedRiskLevel === "critical" && "border-red-500/40 text-red-400 bg-red-500/10 shadow-[0_0_8px_rgba(255,0,60,0.25)] animate-pulse",
              resolvedRiskLevel === "medium" && "border-amber-500/40 text-amber-300 bg-amber-500/10",
              resolvedRiskLevel === "low" && "border-emerald-500/30 text-emerald-400/80 bg-emerald-500/5"
            )}
          >
            {resolvedRiskLevel === "critical" && <ShieldAlert size={10} className="text-red-400" />}
            [{resolvedRiskLevel.toUpperCase()}]
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#4F536E] shrink-0 ml-2">
          {durationMs !== undefined && (
            <span className="tactical-badge text-[9px] text-[#9499B3]">{durationMs}ms</span>
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
