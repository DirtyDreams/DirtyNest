"use client";

import { useState } from "react";
import {
  X,
  Send,
  Loader2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";

interface MinionNodeSummary {
  id: string;
  name: string;
  role: string;
  model: string;
  status: string;
  color?: string;
}

interface MinionDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinionId?: string;
  minions: MinionNodeSummary[];
  onTaskDispatched?: () => void;
}

const DIRECTIVE_TEMPLATES = [
  {
    target: "minion-01",
    label: "Security Recon",
    name: "CISA & Mesh Anomaly Patrol",
    directive: "Audit all local ports and CISA weaponized KEVs for immediate risk signatures.",
  },
  {
    target: "minion-02",
    label: "AST Code Synthesis",
    name: "Refactor Component AST",
    directive: "Scan codebase types and interfaces for dead references and redundant imports.",
  },
  {
    target: "minion-03",
    label: "Social Synthesis",
    name: "Synthesize Cyber Campaign",
    directive: "Generate a drafted multi-platform announcement with ComfyUI prompt suggestions.",
  },
  {
    target: "minion-04",
    label: "Cron Orchestration",
    name: "Deep Telemetry Diagnostic",
    directive: "Probe all 7 background services and report latency drift metrics.",
  },
];

export default function MinionDispatchModal({
  isOpen,
  onClose,
  initialMinionId,
  minions,
  onTaskDispatched,
}: MinionDispatchModalProps) {
  const [selectedMinionId, setSelectedMinionId] = useState<string>(
    initialMinionId || minions[0]?.id || "minion-01"
  );
  const [taskName, setTaskName] = useState<string>("Autonomous Directive Execution");
  const [directive, setDirective] = useState<string>("");
  const [duration, setDuration] = useState<number>(2.0);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [dispatchStatus, setDispatchStatus] = useState<"IDLE" | "RUNNING" | "SUCCESS" | "ERROR">("IDLE");
  const [statusMessage, setStatusMessage] = useState<string>("");

  if (!isOpen) return null;

  const currentMinion = minions.find((m) => m.id === selectedMinionId) || minions[0];

  const handleSelectTemplate = (template: typeof DIRECTIVE_TEMPLATES[0]) => {
    cyberAudio.play("click");
    setSelectedMinionId(template.target);
    setTaskName(template.name);
    setDirective(template.directive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directive.trim() || isDispatching) return;

    setIsDispatching(true);
    setDispatchStatus("RUNNING");
    setProgress(15);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Submitting operational directive to subordinate ${selectedMinionId}...`,
    ]);
    cyberAudio.play("chime");

    try {
      const res = await fetch("/api/minions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minionId: selectedMinionId,
          name: taskName,
          directive: directive.trim(),
          duration: Number(duration),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProgress(50);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Task accepted by node (ID: ${data.task?.id || "N/A"}).`,
        `[${new Date().toLocaleTimeString()}] Subordinate node executing simulated instruction cycle...`,
      ]);

      // Poll or simulate completion animation
      setTimeout(() => {
        setProgress(100);
        setDispatchStatus("SUCCESS");
        setStatusMessage(`Directive dispatched successfully to ${currentMinion?.name || selectedMinionId}!`);
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Subordinate process initialized. Node load transitioned to EXECUTING.`,
          `[${new Date().toLocaleTimeString()}] Result: SUCCESS (0 errors).`,
        ]);
        cyberAudio.play("success");
        setIsDispatching(false);
        if (onTaskDispatched) {
          onTaskDispatched();
        }
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDispatchStatus("ERROR");
      setStatusMessage(`Dispatch failed: ${msg}`);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] FATAL: ${msg}`,
      ]);
      cyberAudio.play("error");
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0d14] border border-[#00FF41]/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,65,0.15)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <Cpu className="text-[#00FF41]" size={18} />
            <div>
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
                Subordinate Swarm Task Dispatch
              </h3>
              <p className="text-[10px] text-[#9499B3] font-mono">
                Port 6969 Minions Bridge // Direct Operational Delegation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1 rounded-lg text-[#4F536E] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          {/* Target Node Selection */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#4F536E] tracking-wider block mb-1.5">
              Select Target Subordinate Minion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {minions.map((m) => {
                const isSelected = m.id === selectedMinionId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedMinionId(m.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00FF41]/15 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                        : "bg-black/30 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{m.name}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: m.color || "#00FF41" }}
                      />
                    </div>
                    <span className="text-[9px] text-[#9499B3] font-mono truncate">{m.role}</span>
                    <Badge variant="outline" className="w-fit text-[8px] py-0 px-1 border-white/10 text-white/60">
                      {m.model}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Directive Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-[#4F536E] tracking-wider">
                Quick Directive Templates
              </span>
              <span className="text-[9px] text-[#00F0FF] font-mono flex items-center gap-1">
                <Sparkles size={10} /> 1-Click Fill
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DIRECTIVE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FF41]/30 text-left text-[10px] font-bold text-[#9499B3] hover:text-white transition-all cursor-pointer truncate"
                >
                  ⚡ {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Name Input */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#4F536E] tracking-wider block mb-1">
              Task Directive Label
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-[#F1F3F9] font-mono focus:border-[#00FF41] focus:outline-none transition-colors"
              placeholder="e.g. Memory Audit & Embedding Verification"
            />
          </div>

          {/* Directive Text Area */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#4F536E] tracking-wider block mb-1">
              Operational Instructions & Constraints
            </label>
            <textarea
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-[#F1F3F9] font-mono focus:border-[#00FF41] focus:outline-none transition-colors resize-none"
              placeholder="Describe the concrete subtask for this subordinate node to execute..."
            />
          </div>

          {/* Simulation Duration Slider */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">Execution Duration Window</span>
              <span className="text-[10px] text-[#4F536E]">Simulated async cycle in seconds</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-24 accent-[#00FF41]"
              />
              <span className="text-xs font-mono font-bold text-[#00FF41]">{duration}s</span>
            </div>
          </div>

          {/* Progress & Live Terminal Feed */}
          {dispatchStatus !== "IDLE" && (
            <div className="p-3 rounded-xl bg-black/70 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#00FF41] flex items-center gap-1.5">
                  <Terminal size={12} /> Execution Telemetry Feed
                </span>
                <span className="font-bold text-white">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00FF41] to-[#00F0FF] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="max-h-24 overflow-y-auto font-mono text-[10px] text-white/80 space-y-0.5">
                {logs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
              {dispatchStatus === "SUCCESS" && (
                <div className="flex items-center gap-1.5 text-xs text-[#00FF41] font-bold mt-1">
                  <CheckCircle2 size={14} />
                  <span>{statusMessage}</span>
                </div>
              )}
              {dispatchStatus === "ERROR" && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mt-1">
                  <AlertTriangle size={14} />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-[#9499B3] hover:text-white"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={isDispatching || !directive.trim()}
              className="bg-[#00FF41] text-black font-black hover:bg-[#00cc34] shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send size={14} className="mr-1.5" />
                  Dispatch Subtask
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
