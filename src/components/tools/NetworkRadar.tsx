"use client";

import { useState } from "react";
import { Radio, RefreshCw, Wifi } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface PortNode {
  port: number;
  service: string;
  category: "Web" | "Database" | "Cache" | "Service";
  status: "OPEN" | "CLOSED" | "FILTERED" | "SCANNING";
  latencyMs: number;
}

const COMMON_PORTS: PortNode[] = [
  { port: 3000, service: "Next.js / Node Web Server", category: "Web", status: "OPEN", latencyMs: 14 },
  { port: 5173, service: "Vite Dev Server", category: "Web", status: "CLOSED", latencyMs: 0 },
  { port: 8080, service: "Proxy / Gateway API", category: "Service", status: "OPEN", latencyMs: 28 },
  { port: 5432, service: "PostgreSQL Database Engine", category: "Database", status: "OPEN", latencyMs: 6 },
  { port: 3306, service: "MySQL / MariaDB Node", category: "Database", status: "CLOSED", latencyMs: 0 },
  { port: 6379, service: "Redis In-Memory Mesh", category: "Cache", status: "OPEN", latencyMs: 2 },
  { port: 27017, service: "MongoDB Cluster Instance", category: "Database", status: "CLOSED", latencyMs: 0 },
  { port: 9090, service: "Prometheus Metric Telemetry", category: "Service", status: "OPEN", latencyMs: 19 },
  { port: 8000, service: "FastAPI / Django Backend", category: "Service", status: "FILTERED", latencyMs: 145 },
];

export default function NetworkRadar() {
  const [nodes, setNodes] = useState<PortNode[]>(COMMON_PORTS);
  const [scanning, setScanning] = useState(false);
  const [dnsTarget, setDnsTarget] = useState("dirtynest.local");
  const [dnsResults, setDnsResults] = useState<{ type: string; value: string; ttl: number }[]>([
    { type: "A", value: "127.0.0.1", ttl: 300 },
    { type: "AAAA", value: "::1", ttl: 300 },
    { type: "CNAME", value: "mesh.dirtynest.internal", ttl: 600 },
    { type: "TXT", value: "v=spf1 include:_mesh.dirtynest ~all", ttl: 3600 },
  ]);

  const runPortScan = () => {
    cyberAudio.play("click");
    setScanning(true);

    // Simulate real radar scan step by step
    setNodes((prev) => prev.map((n) => ({ ...n, status: "SCANNING" })));

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          const isPort3000 = n.port === 3000;
          const randomState = isPort3000
            ? "OPEN"
            : Math.random() > 0.4
            ? "OPEN"
            : Math.random() > 0.5
            ? "FILTERED"
            : "CLOSED";
          const latency = randomState === "OPEN" ? Math.floor(Math.random() * 25) + 3 : randomState === "FILTERED" ? 180 : 0;
          return {
            ...n,
            status: randomState,
            latencyMs: latency,
          };
        })
      );
      setScanning(false);
    }, 1600);
  };

  const handleDnsLookup = () => {
    cyberAudio.play("click");
    if (!dnsTarget.trim()) return;
    setDnsResults([
      { type: "A", value: `192.168.1.${Math.floor(Math.random() * 200) + 10}`, ttl: 300 },
      { type: "AAAA", value: "fe80::1ff:fe23:4567:890a", ttl: 300 },
      { type: "CNAME", value: `edge.${dnsTarget.trim()}`, ttl: 600 },
      { type: "TXT", value: "dirtynest-verification=a98f7b8c9d0e1f2a", ttl: 3600 },
    ]);
  };

  return (
    <div className="flex flex-col gap-4.5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-[#00FF41]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            Network Radar & Local Port Diagnostic Hub
          </h3>
        </div>

        <button
          onClick={runPortScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)] disabled:opacity-50"
        >
          <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
          <span>{scanning ? "SCANNING RADAR..." : "PROBE PORTS NOW"}</span>
        </button>
      </div>

      {/* Radar Port Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div
            key={node.port}
            className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
              node.status === "OPEN"
                ? "bg-[#00FF41]/5 border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.1)]"
                : node.status === "FILTERED"
                ? "bg-[#FFB800]/5 border-[#FFB800]/30"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F1F3F9] font-mono">
                  :{node.port}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                  {node.category}
                </span>
              </div>

              {/* Status Chip */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  node.status === "OPEN"
                    ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                    : node.status === "FILTERED"
                    ? "bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30"
                    : node.status === "SCANNING"
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] animate-pulse"
                    : "bg-[#4F536E]/20 text-[#4F536E]"
                }`}
              >
                {node.status}
              </span>
            </div>

            <div className="text-xs text-[#9499B3] truncate">
              {node.service}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#4F536E] pt-2 border-t border-white/5">
              <span>LATENCY</span>
              <span className={node.status === "OPEN" ? "text-[#00FF41] font-bold" : "text-[#4F536E]"}>
                {node.status === "OPEN" ? `${node.latencyMs}ms` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DNS Records Lookup HUD */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5">
            <Wifi size={14} />
            DNS & HOSTNAME RESOLVER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dnsTarget}
            onChange={(e) => setDnsTarget(e.target.value)}
            placeholder="Enter hostname or domain (e.g. dirtynest.local)..."
            className="flex-1 p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs text-[#F1F3F9] outline-none focus:border-[#00F0FF]"
          />
          <button
            onClick={handleDnsLookup}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 cursor-pointer"
          >
            RESOLVE
          </button>
        </div>

        {/* DNS Table */}
        <div className="flex flex-col gap-1.5 mt-1">
          {dnsResults.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs text-[#9499B3]"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 text-center py-0.5 rounded bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30 text-[10px] font-bold">
                  {rec.type}
                </span>
                <span className="text-[#F1F3F9] font-mono text-xs">{rec.value}</span>
              </div>
              <span className="text-[10px] text-[#4F536E]">TTL: {rec.ttl}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
