"use client";

import { useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface AgentPermissionRow {
  agentId: string;
  agentName: string;
  color: string;
  permissions: Record<string, boolean>;
}

const TOOL_COLUMNS = [
  { id: "fs_read", label: "FS Read", cat: "Storage", isHighRisk: false },
  { id: "fs_write", label: "FS Write (HITL)", cat: "Storage", isHighRisk: true },
  { id: "net_fetch", label: "Net Fetch", cat: "Network", isHighRisk: false },
  { id: "shell_exec", label: "Shell Exec (HITL)", cat: "Runtime", isHighRisk: true },
  { id: "sqlite_vec", label: "SQLite Vec", cat: "DB", isHighRisk: false },
  { id: "docker_socket", label: "Docker Socket", cat: "Runtime", isHighRisk: true },
  { id: "ast_mutate", label: "AST Mutate", cat: "Code", isHighRisk: false },
];

const INITIAL_ROWS: AgentPermissionRow[] = [
  {
    agentId: "agy-01",
    agentName: "SENTINEL-01",
    color: "#00FF41",
    permissions: {
      fs_read: true,
      fs_write: false,
      net_fetch: true,
      shell_exec: false,
      sqlite_vec: true,
      docker_socket: true,
      ast_mutate: false,
    },
  },
  {
    agentId: "agy-02",
    agentName: "SCRAPER-INTEL",
    color: "#00F0FF",
    permissions: {
      fs_read: true,
      fs_write: false,
      net_fetch: true,
      shell_exec: false,
      sqlite_vec: true,
      docker_socket: false,
      ast_mutate: false,
    },
  },
  {
    agentId: "agy-03",
    agentName: "KUBE-DEPLOYER",
    color: "#BF40FF",
    permissions: {
      fs_read: true,
      fs_write: true,
      net_fetch: true,
      shell_exec: true,
      sqlite_vec: false,
      docker_socket: true,
      ast_mutate: false,
    },
  },
  {
    agentId: "agy-04",
    agentName: "CODE-AUDITOR",
    color: "#FFB800",
    permissions: {
      fs_read: true,
      fs_write: true,
      net_fetch: false,
      shell_exec: false,
      sqlite_vec: true,
      docker_socket: false,
      ast_mutate: true,
    },
  },
  {
    agentId: "agy-05",
    agentName: "DB-OPTIMIZER",
    color: "#00FF41",
    permissions: {
      fs_read: true,
      fs_write: true,
      net_fetch: false,
      shell_exec: false,
      sqlite_vec: true,
      docker_socket: false,
      ast_mutate: false,
    },
  },
  {
    agentId: "agy-06",
    agentName: "LATENCY-PINGER",
    color: "#FF2A6D",
    permissions: {
      fs_read: false,
      fs_write: false,
      net_fetch: true,
      shell_exec: false,
      sqlite_vec: false,
      docker_socket: true,
      ast_mutate: false,
    },
  },
];

export default function ToolPermissionMatrix() {
  const [rows, setRows] = useState<AgentPermissionRow[]>(INITIAL_ROWS);
  const [saved, setSaved] = useState(false);

  const togglePermission = (agentId: string, toolId: string) => {
    cyberAudio.play("click");
    setRows((prev) =>
      prev.map((r) =>
        r.agentId === agentId
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [toolId]: !r.permissions[toolId],
              },
            }
          : r
      )
    );
  };

  const handleGrantAll = (agentId: string) => {
    cyberAudio.play("toggle");
    setRows((prev) =>
      prev.map((r) => {
        if (r.agentId === agentId) {
          const allTrue: Record<string, boolean> = {};
          TOOL_COLUMNS.forEach((c) => (allTrue[c.id] = true));
          return { ...r, permissions: allTrue };
        }
        return r;
      })
    );
  };

  const handleRevokeAll = (agentId: string) => {
    cyberAudio.play("click");
    setRows((prev) =>
      prev.map((r) => {
        if (r.agentId === agentId) {
          const allFalse: Record<string, boolean> = {};
          TOOL_COLUMNS.forEach((c) => (allFalse[c.id] = false));
          return { ...r, permissions: allFalse };
        }
        return r;
      })
    );
  };

  const handleSaveMatrix = () => {
    cyberAudio.play("chime");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              TOOL PERMISSION MATRIX // <span className="text-[#00F0FF]">ZERO-TRUST RBAC</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Granular access control per autonomous agent with Human-In-The-Loop security flags
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveMatrix}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-bold text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Check size={13} />
          <span>{saved ? "PERMISSIONS SAVED!" : "SAVE MATRIX"}</span>
        </button>
      </div>

      {/* Permission Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-[#4F536E] uppercase font-bold">
              <th className="py-2.5 px-3">Agent</th>
              {TOOL_COLUMNS.map((col) => (
                <th key={col.id} className="py-2.5 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className={col.isHighRisk ? "text-[#FFB800]" : "text-[#F1F3F9]"}>
                      {col.label}
                    </span>
                    <span className="text-[8px] text-[#4F536E]">{col.cat}</span>
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => {
              const highRiskCount = TOOL_COLUMNS.filter(
                (c) => c.isHighRisk && r.permissions[c.id]
              ).length;

              return (
                <tr key={r.agentId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                      <span className="font-bold text-[#F1F3F9]">{r.agentName}</span>
                      {highRiskCount > 0 && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30">
                          {highRiskCount} HITL
                        </span>
                      )}
                    </div>
                  </td>

                  {TOOL_COLUMNS.map((col) => {
                    const isGranted = r.permissions[col.id];

                    return (
                      <td key={col.id} className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(r.agentId, col.id)}
                          className={`w-6 h-6 rounded-lg border inline-flex items-center justify-center transition-all cursor-pointer ${
                            isGranted
                              ? "bg-[#00FF41]/20 border-[#00FF41]/50 text-[#00FF41]"
                              : "bg-black/60 border-white/10 text-[#4F536E] hover:border-white/30"
                          }`}
                          title={`${r.agentName} - ${col.label}: ${isGranted ? "Granted" : "Denied"}`}
                        >
                          {isGranted ? <Check size={12} /> : <X size={11} />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleGrantAll(r.agentId)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#00FF41] cursor-pointer"
                      >
                        ALL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeAll(r.agentId)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#FF2A6D] cursor-pointer"
                      >
                        REVOKE
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
