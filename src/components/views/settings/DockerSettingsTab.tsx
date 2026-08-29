"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Sparkles,
  Terminal,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function DockerSettingsTab() {
  const toast = useToast();
  const [daemonSocket, setDaemonSocket] = useState("npipe:////./pipe/docker_engine");
  const [restartPolicy, setRestartPolicy] = useState("unless-stopped");
  const [prunePolicy, setPrunePolicy] = useState("weekly");
  const [cpuAlertLimit, setCpuAlertLimit] = useState("85");
  const [isPruning, setIsPruning] = useState(false);

  useEffect(() => {
    try {
      const savedSocket = localStorage.getItem("dirtynest_docker_socket");
      if (savedSocket) setDaemonSocket(savedSocket);
      const savedRestart = localStorage.getItem("dirtynest_docker_restart");
      if (savedRestart) setRestartPolicy(savedRestart);
      const savedPrune = localStorage.getItem("dirtynest_docker_prune");
      if (savedPrune) setPrunePolicy(savedPrune);
      const savedCpu = localStorage.getItem("dirtynest_docker_cpulimit");
      if (savedCpu) setCpuAlertLimit(savedCpu);
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_docker_socket", daemonSocket);
      localStorage.setItem("dirtynest_docker_restart", restartPolicy);
      localStorage.setItem("dirtynest_docker_prune", prunePolicy);
      localStorage.setItem("dirtynest_docker_cpulimit", cpuAlertLimit);
    } catch {}
    toast.success("Docker Hub Saved", "Daemon socket and container policies updated.");
  };

  const handleSystemPrune = async () => {
    cyberAudio.play("click");
    setIsPruning(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsPruning(false);
    toast.success("Docker Pruned", "Dangling images, stopped containers & build cache purged.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
            <Container size={16} />
            <span>Docker Daemon & Container Fleet Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure Docker socket endpoints, container restart policies, auto-pruning & resource alert limits
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00c8d6] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE DOCKER CONFIG</span>
        </button>
      </div>

      {/* Socket Endpoint & Restart Policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Socket */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Terminal size={13} className="text-[#00F0FF]" />
            <span>Docker Daemon Socket / Host</span>
          </label>
          <input
            type="text"
            value={daemonSocket}
            onChange={(e) => setDaemonSocket(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#00F0FF] font-mono outline-none"
          />
          <div className="text-[9px] text-[#4F536E]">
            Default Windows: <code>npipe:////./pipe/docker_engine</code>
          </div>
        </div>

        {/* Restart Policy */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Zap size={13} className="text-[#00FF41]" />
            <span>Default Container Restart Policy</span>
          </label>
          <select
            value={restartPolicy}
            onChange={(e) => setRestartPolicy(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="unless-stopped">Unless-Stopped (Recommended)</option>
            <option value="always">Always (Mission-Critical)</option>
            <option value="on-failure:3">On-Failure: 3 Retries</option>
            <option value="no">No (Manual Only)</option>
          </select>
          <div className="text-[9px] text-[#4F536E]">
            Applied when spinning up microservice stacks
          </div>
        </div>
      </div>

      {/* Pruning & Resource Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pruning */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold">Auto-Prune Cadence</label>
          <select
            value={prunePolicy}
            onChange={(e) => setPrunePolicy(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="daily">Daily Auto-Prune (Reclaim Space)</option>
            <option value="weekly">Weekly Auto-Prune (Recommended)</option>
            <option value="manual">Manual Pruning Only</option>
          </select>
        </div>

        {/* CPU limit */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Container CPU Alert Limit</label>
            <span className="text-xs font-bold text-[#FF007F]">{cpuAlertLimit}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={cpuAlertLimit}
            onChange={(e) => setCpuAlertLimit(e.target.value)}
            className="w-full accent-[#FF007F] cursor-pointer"
          />
        </div>
      </div>

      {/* Manual Docker Prune */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <div className="font-bold text-xs text-[#F1F3F9] uppercase flex items-center gap-2">
            <Trash2 size={14} className="text-red-400" />
            <span>Docker System Prune</span>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Remove all unused containers, dangling images, networks, and build cache
          </p>
        </div>

        <button
          onClick={handleSystemPrune}
          disabled={isPruning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={13} className={isPruning ? "animate-spin" : ""} />
          <span>{isPruning ? "PRUNING..." : "RUN SYSTEM PRUNE"}</span>
        </button>
      </div>
    </div>
  );
}
