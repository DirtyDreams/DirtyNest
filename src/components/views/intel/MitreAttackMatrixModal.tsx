"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  X,
  ShieldAlert,
} from "lucide-react";
=======
import { X, ShieldAlert } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

interface MitreAttackMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttackTactic {
  id: string;
  name: string;
  code: string;
  techniques: { id: string; name: string; severity: "CRITICAL" | "HIGH" | "MEDIUM"; detected: boolean }[];
}

const MITRE_TACTICS: AttackTactic[] = [
  {
    id: "ta-01",
    name: "Initial Access",
    code: "TA0001",
    techniques: [
      { id: "T1190", name: "Exploit Public-Facing App", severity: "CRITICAL", detected: false },
      { id: "T1566", name: "Phishing: Spearphishing Link", severity: "HIGH", detected: false },
    ],
  },
  {
    id: "ta-02",
    name: "Execution",
    code: "TA0002",
    techniques: [
      { id: "T1059", name: "Command and Scripting Interpreter", severity: "HIGH", detected: true },
      { id: "T1204", name: "User Execution: Malicious File", severity: "MEDIUM", detected: false },
    ],
  },
  {
    id: "ta-03",
    name: "Persistence",
    code: "TA0003",
    techniques: [
      { id: "T1543", name: "Create or Modify System Process", severity: "HIGH", detected: false },
      { id: "T1053", name: "Scheduled Task/Cron Job", severity: "MEDIUM", detected: false },
    ],
  },
  {
    id: "ta-04",
    name: "Defense Evasion",
    code: "TA0005",
    techniques: [
      { id: "T1027", name: "Obfuscated/Encrypted Payloads", severity: "CRITICAL", detected: true },
      { id: "T1070", name: "Indicator Removal on Host", severity: "HIGH", detected: false },
    ],
  },
  {
    id: "ta-05",
    name: "Credential Access",
    code: "TA0006",
    techniques: [
      { id: "T1552", name: "Unsecured Credentials in AST", severity: "CRITICAL", detected: false },
      { id: "T1110", name: "Brute Force Authentication", severity: "MEDIUM", detected: false },
    ],
  },
];

export default function MitreAttackMatrixModal({
  isOpen,
  onClose,
}: MitreAttackMatrixModalProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>("T1027");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs text-white">
      <div className="relative w-full max-w-5xl bg-[#080910] border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                MITRE ATT&CK MATRIX // <span className="text-rose-400">ENTERPRISE THREAT RADAR v14</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Threat vector mapping, technique kill-chain correlation & active defense posture
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Columns */}
        <div className="p-6 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 min-w-[750px]">
            {MITRE_TACTICS.map((tactic) => (
              <div key={tactic.id} className="p-3 bg-black/50 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">{tactic.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{tactic.code}</span>
                </div>

                <div className="space-y-2">
                  {tactic.techniques.map((tech) => {
                    const isSelected = selectedTech === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => {
                          cyberAudio.play("click");
                          setSelectedTech(tech.id);
                        }}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                          tech.detected
                            ? "bg-rose-500/15 border-rose-500/50 shadow-[0_0_10px_rgba(255,0,60,0.2)]"
                            : isSelected
                            ? "bg-cyan-500/15 border-cyan-500/50"
                            : "bg-black/40 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-300 truncate">{tech.name}</span>
                          <span className="text-[8px] font-mono text-slate-500">{tech.id}</span>
                        </div>

                        <div className="flex items-center justify-between text-[9px]">
                          <span
                            className={`font-bold ${
                              tech.severity === "CRITICAL"
                                ? "text-rose-400"
                                : tech.severity === "HIGH"
                                ? "text-amber-400"
                                : "text-cyan-400"
                            }`}
                          >
                            {tech.severity}
                          </span>
                          <span className={tech.detected ? "text-rose-400 font-black animate-pulse" : "text-emerald-400"}>
                            {tech.detected ? "ALERT DETECTED" : "SHIELDED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05060b] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Active Threat Detection Status: <strong className="text-rose-400">2 Techniques Flagged</strong>
          </span>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            CLOSE MATRIX
          </button>
        </div>
      </div>
    </div>
  );
}
