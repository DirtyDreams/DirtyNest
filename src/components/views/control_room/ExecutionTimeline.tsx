"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Code2,
} from "lucide-react";
=======
import { Clock, ChevronDown, ChevronRight, Code2 } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

interface TimelineStep {
  step: number;
  time: string;
  durationMs: number;
  title: string;
  thought: string;
  status: "completed" | "pending_approval" | "denied" | "executing";
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
    response?: string;
  };
}

const DEMO_STEPS: TimelineStep[] = [
  {
    step: 1,
    time: "23:40:12",
    durationMs: 412,
    title: "Ingest Autonomous Directive // Network Recon",
    thought:
      "Operator requested thorough zero-trust audit across Docker containers and SQLite-Vec clusters.",
    status: "completed",
    toolCall: {
      name: "hermes_context_retrieve",
      args: { target: "system_architecture", scope: "network_boundary" },
      response: "Retrieved 14 topological nodes and 4 exposed port bindings.",
    },
  },
  {
    step: 2,
    time: "23:40:14",
    durationMs: 650,
    title: "Query Vector Memory Store (FTS5 + Cosine)",
    thought:
      "Searching past incident memories for recurring CVE vulnerability signatures on port 8080.",
    status: "completed",
    toolCall: {
      name: "sqlite_vec_search",
      args: { collection: "threat_intel", query: "CVE-2026-9811 Auth Proxy", limit: 3 },
      response: "Matched 2 historical incidents with 0.94 cosine similarity.",
    },
  },
  {
    step: 3,
    time: "23:40:17",
    durationMs: 1200,
    title: "Verify eBPF Kernel Probe Telemetry",
    thought:
      "Checking syscall interception logs to verify zero unmapped socket listeners on the local host.",
    status: "completed",
    toolCall: {
      name: "ebpf_kernel_inspect",
      args: { probes: ["sys_enter_connect", "sys_enter_bind"], window_seconds: 60 },
      response: "0 anomalous socket binds detected in the last 60s.",
    },
  },
  {
    step: 4,
    time: "23:40:22",
    durationMs: 890,
    title: "Container Socket Inspection Gate [HITL Required]",
    thought:
      "Preparing to inspect dirtynest-auth-proxy container internal socket and verify mTLS headers.",
    status: "pending_approval",
    toolCall: {
      name: "docker_socket_inspect",
      args: { container: "dirtynest-auth-proxy", inspect_tls: true, port_range: [443, 8080] },
    },
  },
  {
    step: 5,
    time: "23:40:28",
    durationMs: 340,
    title: "Synthesize Hardened Security Policy Diff",
    thought:
      "Generating strict CSP rules and Ed25519 token rotation cadence for production readiness.",
    status: "executing",
  },
];

export default function ExecutionTimeline() {
  const [steps, setSteps] = useState<TimelineStep[]>(DEMO_STEPS);
  const [expandedStep, setExpandedStep] = useState<number | null>(4);

  const handleApprove = (stepNum: number) => {
    cyberAudio.play("chime");
    setSteps((prev) =>
      prev.map((s) =>
        s.step === stepNum
          ? {
              ...s,
              status: "completed",
              toolCall: s.toolCall
                ? {
                    ...s.toolCall,
                    response: "[APPROVED] Socket inspected: 0 unauthorized listeners. mTLS active.",
                  }
                : undefined,
            }
          : s
      )
    );
  };

  const handleDeny = (stepNum: number) => {
    cyberAudio.play("error");
    setSteps((prev) =>
      prev.map((s) =>
        s.step === stepNum
          ? {
              ...s,
              status: "denied",
              toolCall: s.toolCall
                ? {
                    ...s.toolCall,
                    response: "[DENIED BY OPERATOR] Execution terminated under AirGap protocol.",
                  }
                : undefined,
            }
          : s
      )
    );
  };

  const toggleExpand = (stepNum: number) => {
    cyberAudio.play("click");
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              AGENT EXECUTION TIMELINE // <span className="text-[#00F0FF]">COGNITIVE TRACE</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Step-by-step reasoning chronology, tool call duration & human-in-the-loop gates
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          5 STEPS RECORDED
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {steps.map((s) => {
          const isExpanded = expandedStep === s.step;
          const statusColors = {
            completed: "bg-[#00FF41] shadow-[0_0_8px_#00FF41]",
            pending_approval: "bg-[#FFB800] shadow-[0_0_8px_#FFB800] animate-pulse",
            denied: "bg-[#FF2A6D] shadow-[0_0_8px_#FF2A6D]",
            executing: "bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse",
          };

          return (
            <div key={s.step} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-6 top-3 w-3 h-3 rounded-full border border-black ${
                  statusColors[s.status]
                }`}
              />

              {/* Step Card */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
                <div
                  onClick={() => toggleExpand(s.step)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? <ChevronDown size={14} className="text-[#9499B3]" /> : <ChevronRight size={14} className="text-[#9499B3]" />}
                    <span className="text-xs font-bold text-[#F1F3F9] truncate">{s.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-[#4F536E]">{s.time} ({s.durationMs}ms)</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        s.status === "completed"
                          ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                          : s.status === "pending_approval"
                          ? "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30"
                          : s.status === "denied"
                          ? "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30"
                          : "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Thought Bubble */}
                <p className="text-[11px] text-[#9499B3] italic mt-2 pl-5">
                  &quot;{s.thought}&quot;
                </p>

                {/* Expanded Details */}
                {isExpanded && s.toolCall && (
                  <div className="mt-3 pl-5 space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[#00F0FF]">
                        <Code2 size={13} />
                        <span className="font-bold">TOOL: {s.toolCall.name}</span>
                      </div>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-black/80 border border-white/10 text-[10px] text-[#00FF41] overflow-x-auto">
                      {JSON.stringify(s.toolCall.args, null, 2)}
                    </pre>

                    {s.toolCall.response && (
                      <div className="p-2 rounded bg-white/[0.02] border border-white/5 text-[10px] text-[#F1F3F9]">
                        <span className="text-[#4F536E] block mb-0.5 font-bold">RESPONSE:</span>
                        {s.toolCall.response}
                      </div>
                    )}

                    {/* Action buttons if pending approval */}
                    {s.status === "pending_approval" && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeny(s.step)}
                          className="px-3 py-1 rounded bg-[#FF2A6D]/15 border border-[#FF2A6D]/40 text-[#FF2A6D] text-[10px] font-bold hover:bg-[#FF2A6D]/25 cursor-pointer"
                        >
                          DENY PROBE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(s.step)}
                          className="px-3.5 py-1 rounded bg-[#00FF41] text-black text-[10px] font-black hover:bg-[#00cc34] cursor-pointer shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                        >
                          APPROVE & RUN
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
