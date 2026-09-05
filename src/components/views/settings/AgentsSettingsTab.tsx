"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Cpu,
  Shield,
  Sparkles,
  AlertTriangle,
  Zap,
  Terminal,
  Database,
  Globe,
} from "lucide-react";
=======
import { Cpu, Shield, Sparkles, AlertTriangle, Zap, Terminal, Database, Globe } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

const TOOL_PERMISSIONS = [
  { id: "fs.read", label: "Filesystem Read Access", icon: Terminal, desc: "Allow agents to read files in workspace" },
  { id: "fs.write", label: "Filesystem Write & Edit", icon: Terminal, desc: "Allow agents to edit code and create files" },
  { id: "exec.shell", label: "Shell & Terminal Commands", icon: Zap, desc: "Allow executing powershell / bash commands" },
  { id: "net.fetch", label: "Outbound Network & Web Scraping", icon: Globe, desc: "Allow querying external REST APIs and URLs" },
  { id: "sql.run", label: "SQLite Database Read/Write", icon: Database, desc: "Allow direct query execution on dirtynest.db" },
];

export default function AgentsSettingsTab() {
  const toast = useToast();
  const [maxConcurrency, setMaxConcurrency] = useState(4);
  const [maxLoops, setMaxLoops] = useState("5");
  const [memoryTtl, setMemoryTtl] = useState("24h");
  const [enabledPermissions, setEnabledPermissions] = useState<string[]>([
    "fs.read",
    "fs.write",
    "exec.shell",
    "net.fetch",
    "sql.run",
  ]);

  useEffect(() => {
    try {
      const savedConc = localStorage.getItem("dirtynest_agent_concurrency");
      if (savedConc) setMaxConcurrency(parseInt(savedConc, 10) || 4);
      const savedLoops = localStorage.getItem("dirtynest_agent_loops");
      if (savedLoops) setMaxLoops(savedLoops);
      const savedTtl = localStorage.getItem("dirtynest_agent_memory_ttl");
      if (savedTtl) setMemoryTtl(savedTtl);
      const savedPerms = localStorage.getItem("dirtynest_agent_permissions");
      if (savedPerms) setEnabledPermissions(JSON.parse(savedPerms));
    } catch {
      // ignore
    }
  }, []);

  const togglePermission = (id: string) => {
    cyberAudio.play("click");
    const updated = enabledPermissions.includes(id)
      ? enabledPermissions.filter((p) => p !== id)
      : [...enabledPermissions, id];
    setEnabledPermissions(updated);
    try {
      localStorage.setItem("dirtynest_agent_permissions", JSON.stringify(updated));
    } catch {}
    toast.success("Permission Toggled", `Updated ${id} policy.`);
  };

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_agent_concurrency", maxConcurrency.toString());
      localStorage.setItem("dirtynest_agent_loops", maxLoops);
      localStorage.setItem("dirtynest_agent_memory_ttl", memoryTtl);
      localStorage.setItem("dirtynest_agent_permissions", JSON.stringify(enabledPermissions));
    } catch {}
    toast.success("Agent Policies Saved", "Swarm governance settings updated.");
  };

  const handleKillSwitch = () => {
    cyberAudio.play("alarm");
    toast.error("SWARM HALTED", "Emergency killswitch triggered. All background agent jobs paused.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#BF40FF] uppercase tracking-wider flex items-center gap-2">
            <Cpu size={16} />
            <span>Autonomous Agent Swarm Governance</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure concurrency quotas, sandbox security policies, reflection budgets & killswitches
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BF40FF] text-black font-black text-xs hover:bg-[#a62ee6] transition-all cursor-pointer shadow-[0_0_12px_rgba(191,64,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE AGENT POLICIES</span>
        </button>
      </div>

      {/* Concurrency & Memory Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Max Parallel Agents */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Max Concurrent Agents</label>
            <span className="font-bold text-xs text-[#BF40FF] font-mono">{maxConcurrency} Active</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={maxConcurrency}
            onChange={(e) => setMaxConcurrency(parseInt(e.target.value, 10))}
            className="w-full accent-[#BF40FF] cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>1 (Solo)</span>
            <span>4 (Standard)</span>
            <span>10 (Swarm)</span>
          </div>
        </div>

        {/* Max Reflection Loops */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold">Max Self-Reflection Loops</label>
          <select
            value={maxLoops}
            onChange={(e) => setMaxLoops(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="3">3 Iterations (Speed-First)</option>
            <option value="5">5 Iterations (Recommended)</option>
            <option value="10">10 Iterations (Deep Architecture)</option>
            <option value="20">20 Iterations (Autonomous Goal)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Prevents runaway token loops</span>
        </div>

        {/* Memory TTL */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold">Vector Memory Retention</label>
          <select
            value={memoryTtl}
            onChange={(e) => setMemoryTtl(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="1h">1 Hour (Session Only)</option>
            <option value="24h">24 Hours (Daily Context)</option>
            <option value="7d">7 Days (Weekly Sprint)</option>
            <option value="permanent">Permanent (Full Project Knowledge)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Long-term knowledge storage</span>
        </div>
      </div>

      {/* Granular Tool Permissions Sandbox */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
          <Shield size={14} className="text-[#00FF41]" />
          <span>Autonomous Tool Capability Permissions</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {TOOL_PERMISSIONS.map((perm) => {
            const Icon = perm.icon;
            const isEnabled = enabledPermissions.includes(perm.id);

            return (
              <div
                key={perm.id}
                onClick={() => togglePermission(perm.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? "bg-[#090A14] border-[#00FF41]/40"
                    : "bg-black/40 border-white/5 opacity-60 hover:opacity-90"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isEnabled
                        ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30"
                        : "bg-white/5 text-[#4F536E]"
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-[#F1F3F9] truncate">
                      {perm.label}
                    </span>
                    <span className="text-[10px] text-[#9499B3] truncate">
                      {perm.desc}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-10 h-5 rounded-full transition-all cursor-pointer relative shrink-0 p-0.5 border ${
                    isEnabled
                      ? "bg-[#00FF41]/20 border-[#00FF41]"
                      : "bg-black border-white/20"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      isEnabled
                        ? "translate-x-5 bg-[#00FF41]"
                        : "translate-x-0 bg-[#4F536E]"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Swarm Killswitch */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/[0.04] border border-red-500/20">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs">
            <AlertTriangle size={14} />
            <span>Emergency Swarm Halt & Kill Switch</span>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Immediately terminates all active agent processes, subagents and background worker tasks
          </p>
        </div>

        <button
          onClick={handleKillSwitch}
          className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          HALT ALL AGENTS
        </button>
      </div>
    </div>
  );
}
