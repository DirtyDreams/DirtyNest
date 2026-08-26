"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Zap } from "lucide-react";

interface Endpoint {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  responseTime: number;
  uptime: number;
  region: string;
}

const initialEndpoints: Endpoint[] = [
  { id: "auth", name: "Auth Service", url: "auth.dirtynest.local/v1", status: "up", responseTime: 28, uptime: 99.98, region: "EU-CENTRAL" },
  { id: "gql", name: "GraphQL Gateway", url: "api.dirtynest.local/graphql", status: "up", responseTime: 82, uptime: 99.95, region: "US-EAST" },
  { id: "db", name: "SQLite Cluster", url: "db-sync.dirtynest.local", status: "up", responseTime: 12, uptime: 99.99, region: "LOCAL" },
  { id: "edge", name: "CDN / Edge Cache", url: "edge-cdn.dirtynest.local", status: "degraded", responseTime: 310, uptime: 98.70, region: "AP-SOUTH" },
  { id: "ws", name: "Telemetry WebSocket", url: "ws.dirtynest.local/feed", status: "up", responseTime: 9, uptime: 99.92, region: "EU-WEST" },
  { id: "ai", name: "AI Inference Node", url: "ai-mesh.dirtynest.local/v2", status: "down", responseTime: 0, uptime: 94.80, region: "US-WEST" },
];

export default function ApiHealth() {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [filter, setFilter] = useState<"all" | "issues">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const randomizeMetrics = () => {
    setEndpoints((prev) =>
      prev.map((ep) => {
        if (ep.status === "down") {
          if (Math.random() > 0.85) {
            return {
              ...ep,
              status: "up",
              responseTime: Math.floor(Math.random() * 90) + 20,
              uptime: +(ep.uptime + 0.05).toFixed(2),
            };
          }
          return ep;
        }
        const delta = (Math.random() - 0.5) * 20;
        const newRt = Math.max(5, Math.round(ep.responseTime + delta));
        let newStatus: "up" | "degraded" | "down" = "up";
        if (newRt > 250) newStatus = "degraded";
        return { ...ep, responseTime: newRt, status: newStatus };
      })
    );
  };

  useEffect(() => {
    intervalRef.current = setInterval(randomizeMetrics, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    randomizeMetrics();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filtered = endpoints.filter((e) =>
    filter === "all" ? true : e.status !== "up"
  );

  const upCount = endpoints.filter((e) => e.status === "up").length;

  return (
    <div className="cyber-card p-5 relative flex flex-col gap-3">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Activity size={15} className="icon" />
        <h3>Mesh Node Health</h3>
        <div className="ml-auto flex items-center gap-2">
          {/* Filter toggles */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 text-[10px] font-mono">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === "all"
                  ? "bg-[#00FF41]/20 text-[#00FF41] font-bold"
                  : "text-[#9499B3]"
              }`}
            >
              ALL ({endpoints.length})
            </button>
            <button
              onClick={() => setFilter("issues")}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === "issues"
                  ? "bg-[#FF2A6D]/20 text-[#FF2A6D] font-bold"
                  : "text-[#9499B3]"
              }`}
            >
              ISSUES ({endpoints.length - upCount})
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Poll now"
            className="p-1 rounded-lg hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-colors"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-[#00FF41]" : ""}
            />
          </button>
        </div>
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-start">
        {filtered.map((ep) => {
          const isUp = ep.status === "up";
          const isDegraded = ep.status === "degraded";
          const isDown = ep.status === "down";

          const statusColor = isUp
            ? "#00FF41"
            : isDegraded
            ? "#FFB800"
            : "#FF2A6D";

          return (
            <div
              key={ep.id}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${isDown ? "rgba(255, 42, 109, 0.25)" : "rgba(255, 255, 255, 0.04)"}`,
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 relative"
                style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
              >
                {!isDown && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ background: statusColor }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F1F3F9] truncate group-hover:text-[#00FF41] transition-colors">
                    {ep.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#4F536E] px-1 py-0.2 rounded bg-white/5">
                    {ep.region}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#4F536E] truncate mt-0.5">
                  {ep.url}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className="text-xs font-mono font-bold tracking-tight"
                  style={{
                    color: statusColor,
                    textShadow: `0 0 8px ${statusColor}40`,
                  }}
                >
                  {isDown ? "TIMEOUT" : `${ep.responseTime}ms`}
                </div>
                <div className="text-[9px] font-mono text-[#9499B3] mt-0.5">
                  {ep.uptime}% SLA
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cluster Latency Summary Strip */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#4F536E]">
        <div className="flex items-center gap-2">
          <span>LATENCY P50: <strong className="text-[#00FF41]">18ms</strong></span>
          <span>•</span>
          <span>P99: <strong className="text-[#00F0FF]">112ms</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-[#9499B3]">
          <Zap size={11} className="text-[#00FF41]" />
          <span>REALTIME WS MESH ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
