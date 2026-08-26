"use client";

import { useState } from "react";
import {
  Cpu,
  Shield,
  Activity,
  Zap,
  Check,
  AlertTriangle,
  Radio,
  Lock,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function AgentsContextDeck() {
  const [agents] = useState([
    { name: "Hermes Lead", status: "online", load: "34%", ram: "480MB" },
    { name: "Pi Worker", status: "online", load: "62%", ram: "320MB" },
    { name: "Codex Engine", status: "online", load: "18%", ram: "610MB" },
    { name: "OpenCode Synth", status: "online", load: "45%", ram: "290MB" },
  ]);

  const [pendingHitl, setPendingHitl] = useState(1);

  const handleClearHitl = () => {
    cyberAudio.play("chime");
    setPendingHitl(0);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Swarm Status & HITL Queue */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00FF41]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00FF41]">
            <Radio size={14} className="animate-pulse" />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Swarm Fleet Radar
            </span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40">
            4 / 4 ACTIVE
          </span>
        </div>

        {/* Agent Heartbeat Rows */}
        <div className="space-y-1.5 pt-1">
          {agents.map((ag) => (
            <div
              key={ag.name}
              className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
                <span className="font-bold text-[#F1F3F9]">{ag.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#00F0FF]">{ag.load}</span>
                <span className="text-[#4F536E]">{ag.ram}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HITL Gatekeeper Pending Action */}
      <div className="cyber-card p-3.5 bg-black/60 border border-amber-500/30 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Shield size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              HITL Clearance Queue
            </span>
          </div>
          <span className="text-[9px] font-bold text-amber-300">
            {pendingHitl} PENDING
          </span>
        </div>

        {pendingHitl > 0 ? (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <span className="text-[10px] text-amber-200 block font-sans">
              Pi Worker requested clearance to mutate Docker network topology.
            </span>
            <button
              onClick={handleClearHitl}
              className="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Check size={11} />
              <span>GRANT CLEARANCE</span>
            </button>
          </div>
        ) : (
          <div className="p-2 text-center text-[10px] text-[#00FF41] flex items-center justify-center gap-1">
            <Check size={12} />
            <span>All operations cleared</span>
          </div>
        )}
      </div>
    </div>
  );
}
