"use client";

import { useState } from "react";
import { ShieldCheck, Terminal, FileCode, Globe } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface AuditEvent {
  id: string;
  agent: string;
  type: "SHELL" | "FS_WRITE" | "NETWORK";
  target: string;
  risk: "SAFE" | "ELEVATED" | "CRITICAL";
  timestamp: string;
}

const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: "evt-1",
    agent: "Codex Engine",
    type: "FS_WRITE",
    target: "src/components/widgets/AwsCloudBurnWidget.tsx",
    risk: "SAFE",
    timestamp: "12s ago",
  },
  {
    id: "evt-2",
    agent: "Pi Worker",
    type: "SHELL",
    target: "powershell -Command 'npx tsc --noEmit'",
    risk: "SAFE",
    timestamp: "45s ago",
  },
  {
    id: "evt-3",
    agent: "Hermes Lead",
    type: "NETWORK",
    target: "https://api.github.com/repos/DirtyDreams/DirtyNest",
    risk: "SAFE",
    timestamp: "2m ago",
  },
  {
    id: "evt-4",
    agent: "OpenCode Synth",
    type: "SHELL",
    target: "docker compose up -d --build",
    risk: "ELEVATED",
    timestamp: "5m ago",
  },
];

export default function AgentSecurityBeaconWidget() {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const filteredEvents = events.filter((ev) =>
    filterRisk === "ALL" ? true : ev.risk === filterRisk
  );

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              AGENT SECURITY BEACON & AUDIT
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Zero-Trust Local Execution Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-black/40 rounded-lg border border-white/5 text-[9px]">
          {["ALL", "SAFE", "ELEVATED"].map((r) => (
            <button
              key={r}
              onClick={() => {
                cyberAudio.play("click");
                setFilterRisk(r);
              }}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                filterRisk === r
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-1.5 pt-1">
        {filteredEvents.map((ev) => {
          const typeIcon =
            ev.type === "SHELL" ? (
              <Terminal size={11} className="text-[#00FF41]" />
            ) : ev.type === "FS_WRITE" ? (
              <FileCode size={11} className="text-[#00F0FF]" />
            ) : (
              <Globe size={11} className="text-[#BF40FF]" />
            );

          const riskBadge =
            ev.risk === "SAFE" ? (
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                SAFE
              </span>
            ) : (
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ELEVATED
              </span>
            );

          return (
            <div
              key={ev.id}
              className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-white/5 shrink-0">{typeIcon}</div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#F1F3F9] text-[11px] truncate">
                      {ev.agent}
                    </span>
                    <span className="text-[9px] text-[#4F536E]">• {ev.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-[#9499B3] font-mono truncate">
                    {ev.target}
                  </span>
                </div>
              </div>

              <div className="shrink-0">{riskBadge}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
