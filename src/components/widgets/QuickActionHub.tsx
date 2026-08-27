"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Shield,
  Trash2,
  Bot,
  Download,
  Database,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  successMessage: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: "deploy_staging",
    label: "Deploy Staging Canary",
    description: "Rollout v2.6 build to EU edge",
    icon: Rocket,
    color: "#00FF41",
    successMessage: "Staging canary pipeline triggered on branch main!",
  },
  {
    id: "vuln_scan",
    label: "Security & CVE Audit",
    description: "Scan npm and Docker images",
    icon: Shield,
    color: "#FF003C",
    successMessage: "Security audit passed: 0 vulnerabilities found.",
  },
  {
    id: "purge_cache",
    label: "Purge CDN & Redis Cache",
    description: "Invalidate stale edge entries",
    icon: Trash2,
    color: "#00F0FF",
    successMessage: "Redis cache & Cloudflare CDN purged successfully.",
  },
  {
    id: "hermes_research",
    label: "Dispatch Hermes Swarm",
    description: "Run autonomous research task",
    icon: Bot,
    color: "#BF40FF",
    successMessage: "Hermes Agent dispatched to deep knowledge scan.",
  },
  {
    id: "db_vacuum",
    label: "Vector Vacuum & Re-Index",
    description: "Optimize Qdrant embeddings",
    icon: Database,
    color: "#FFB800",
    successMessage: "Vector index compacted: +15% query speed.",
  },
  {
    id: "audit_export",
    label: "Export Audit Telemetry",
    description: "Download JSON system report",
    icon: Download,
    color: "#00FF41",
    successMessage: "Cluster telemetry export JSON downloaded.",
  },
];

export default function QuickActionHub() {
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const handleTriggerAction = (action: ActionItem) => {
    cyberAudio.play("warp");
    setRunningAction(action.id);

    setTimeout(() => {
      setRunningAction(null);
      cyberAudio.play("chime");
      toast.success(action.label, {
        description: action.successMessage,
      });

      if (action.id === "audit_export") {
        const data = {
          timestamp: new Date().toISOString(),
          cluster: "DIRTYNEST_NODE_01",
          status: "ALL_SYSTEMS_NOMINAL",
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dirtynest-quick-audit-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 1000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-3.5 select-none font-mono">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#00FF41]" />
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            TACTICAL ACTION HUB // <span className="text-[#00FF41]">QUICK DISPATCH</span>
          </h3>
        </div>
        <Badge variant="outline" className="text-[9px] text-[#4F536E] border-white/10 font-bold">
          1-CLICK AUTOMATION
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isCurrentRunning = runningAction === action.id;

          return (
            <button
              key={action.id}
              onClick={() => handleTriggerAction(action)}
              disabled={runningAction !== null}
              className={cn(
                "p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all flex flex-col gap-1.5 text-left cursor-pointer group disabled:opacity-50 relative overflow-hidden active:scale-98"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}40`,
                  }}
                >
                  <Icon size={14} style={{ color: action.color }} className={isCurrentRunning ? "animate-spin" : ""} />
                </div>
                {isCurrentRunning && (
                  <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                )}
              </div>

              <span className="font-bold text-xs text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors truncate mt-1">
                {action.label}
              </span>
              <span className="text-[9px] text-[#4F536E] leading-tight line-clamp-1">
                {action.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
