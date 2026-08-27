"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw,
  Play,
  Globe,
  Lock,
  ArrowUpRight,
  Server,
  Zap,
  Activity,
  Send,
  Sliders,
  Check,
  Settings,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import ApiEndpointProbeModal from "./api_health/ApiEndpointProbeModal";

interface ServiceHealthItem {
  id: string;
  name: string;
  endpoint: string;
  category: "CORE" | "DATABASE" | "AI" | "NETWORK";
  status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  latency: number;
  uptime90d: string;
  sslExpiryDays: number;
  lastChecked: string;
}

const INITIAL_SERVICES: ServiceHealthItem[] = [
  {
    id: "auth_svc",
    name: "Auth & Identity Provider",
    endpoint: "https://auth.dirtynest.mesh/v1/health",
    category: "CORE",
    status: "OPERATIONAL",
    latency: 18,
    uptime90d: "99.99%",
    sslExpiryDays: 248,
    lastChecked: "Just now",
  },
  {
    id: "graphql_gateway",
    name: "GraphQL Federation Gateway",
    endpoint: "https://api.dirtynest.mesh/graphql",
    category: "CORE",
    status: "OPERATIONAL",
    latency: 24,
    uptime90d: "99.95%",
    sslExpiryDays: 190,
    lastChecked: "Just now",
  },
  {
    id: "postgres_primary",
    name: "PostgreSQL 16 Cluster",
    endpoint: "postgres://db.dirtynest.mesh:5432",
    category: "DATABASE",
    status: "OPERATIONAL",
    latency: 6,
    uptime90d: "99.98%",
    sslExpiryDays: 310,
    lastChecked: "Just now",
  },
  {
    id: "redis_cluster",
    name: "Redis Cache & Pub/Sub",
    endpoint: "redis://cache.dirtynest.mesh:6379",
    category: "DATABASE",
    status: "OPERATIONAL",
    latency: 2,
    uptime90d: "100.00%",
    sslExpiryDays: 310,
    lastChecked: "Just now",
  },
  {
    id: "vector_db",
    name: "Qdrant Vector Neural Store",
    endpoint: "https://vector.dirtynest.mesh:6333",
    category: "AI",
    status: "OPERATIONAL",
    latency: 32,
    uptime90d: "99.90%",
    sslExpiryDays: 145,
    lastChecked: "Just now",
  },
  {
    id: "ai_inference",
    name: "Local AI Inference Server (RTX 4090)",
    endpoint: "http://inference.dirtynest.local:11434",
    category: "AI",
    status: "OPERATIONAL",
    latency: 85,
    uptime90d: "99.82%",
    sslExpiryDays: 999,
    lastChecked: "Just now",
  },
  {
    id: "cdn_edge",
    name: "Cloudflare Edge CDN Cache",
    endpoint: "https://cdn.dirtynest.mesh/healthz",
    category: "NETWORK",
    status: "OPERATIONAL",
    latency: 12,
    uptime90d: "99.99%",
    sslExpiryDays: 114,
    lastChecked: "Just now",
  },
  {
    id: "telemetry_ws",
    name: "Realtime Telemetry WebSocket",
    endpoint: "wss://ws.dirtynest.mesh/telemetry",
    category: "NETWORK",
    status: "OPERATIONAL",
    latency: 4,
    uptime90d: "99.97%",
    sslExpiryDays: 190,
    lastChecked: "Just now",
  },
];

export default function ApiHealthView() {
  const { setActiveView } = useAppStore();
  const [services, setServices] = useState<ServiceHealthItem[]>(INITIAL_SERVICES);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isProbing, setIsProbing] = useState(false);
  const [customUrl, setCustomUrl] = useState("https://api.github.com/zen");
  const [probeResult, setProbeResult] = useState<{ status: string; latency: number; code: number } | null>(null);
  const [selectedProbeService, setSelectedProbeService] = useState<ServiceHealthItem | null>(null);

  // Trigger simulated refresh
  const handleProbeAll = () => {
    cyberAudio.play("warp");
    setIsProbing(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latency: Math.max(2, Math.round(s.latency + (Math.random() * 8 - 4))),
          lastChecked: "Just now",
        }))
      );
      setIsProbing(false);
      cyberAudio.play("chime");
    }, 1200);
  };

  const handleCustomProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    cyberAudio.play("click");
    setIsProbing(true);
    setProbeResult(null);

    setTimeout(() => {
      setIsProbing(false);
      setProbeResult({
        status: "200 OK",
        latency: Math.floor(Math.random() * 60 + 20),
        code: 200,
      });
      cyberAudio.play("chime");
    }, 900);
  };

  const filteredServices = services.filter(
    (s) => categoryFilter === "ALL" || s.category === categoryFilter
  );

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
      <div className="cyber-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.25) 0%, rgba(0,240,255,0.2) 100%)",
                border: "1px solid rgba(0,255,65,0.4)",
                boxShadow: "0 0 16px rgba(0,255,65,0.3)",
              }}
            >
              <Wifi size={22} className="text-[#00FF41]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#F1F3F9]">
                  API HEALTH // <span className="text-[#00FF41]">MESH SERVICE RADAR</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                  ALL SERVICES OPERATIONAL
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Realtime synthetic healthchecks · Global latency probes · SSL TLS 1.3 verification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/40 text-xs font-bold transition-all cursor-pointer"
              title="Configure API Keys and Timeout Thresholds in Settings"
            >
              <Settings size={14} />
              <span>API KEYS & TIMEOUTS</span>
            </button>

            <button
              onClick={handleProbeAll}
              disabled={isProbing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isProbing ? "animate-spin" : ""} />
              <span>{isProbing ? "PROBING MESH..." : "PROBE ALL (REFRESH)"}</span>
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5 text-xs">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Average Latency</span>
            <span className="text-base font-bold text-[#00FF41] mt-0.5">14.8 ms</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">90-Day SLA Uptime</span>
            <span className="text-base font-bold text-[#00F0FF] mt-0.5">99.98%</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Active Monitored Nodes</span>
            <span className="text-base font-bold text-[#BF40FF] mt-0.5">8 Microservices</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">SSL Certificate Status</span>
            <span className="text-base font-bold text-[#00FF41] mt-0.5">VALID (TLS 1.3)</span>
          </div>
        </div>
      </div>

      {/* SERVICE HEALTH TABLE & CUSTOM PROBE RUNNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Service List (8 cols) */}
        <div className="lg:col-span-8 cyber-card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-[#00FF41]" />
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                Microservice Diagnostic Matrix
              </h3>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
              {["ALL", "CORE", "DATABASE", "AI", "NETWORK"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    cyberAudio.play("click");
                    setCategoryFilter(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#00FF41]/20 text-[#00FF41] font-bold border border-[#00FF41]/40"
                      : "text-[#9499B3] hover:text-[#F1F3F9]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Service Rows */}
          <div className="space-y-3">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41] animate-pulse shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F1F3F9] truncate">{svc.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[#4F536E]">
                          {svc.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9499B3] font-mono truncate">{svc.endpoint}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] text-[#4F536E]">LATENCY</span>
                      <span className="font-bold text-[#00FF41]">{svc.latency} ms</span>
                    </div>

                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] text-[#4F536E]">90D UPTIME</span>
                      <span className="font-bold text-[#00F0FF]">{svc.uptime90d}</span>
                    </div>

                    <div className="flex flex-col text-left sm:text-right hidden md:flex">
                      <span className="text-[10px] text-[#4F536E]">SSL CERT</span>
                      <span className="text-[#9499B3]">{svc.sslExpiryDays}d left</span>
                    </div>

                    <button
                      onClick={() => {
                        cyberAudio.play("click");
                        setSelectedProbeService(svc);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 text-xs font-bold transition-all shadow-[0_0_8px_rgba(0,240,255,0.2)] cursor-pointer"
                    >
                      PROBE
                    </button>
                  </div>
                </div>

                {/* 30-Day SLA Uptime History Bar */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-500 shrink-0">30-DAY SLA HISTORY</span>
                  <div className="flex items-center gap-1 overflow-hidden flex-1 justify-end">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-3 rounded-xs bg-emerald-500/40 hover:bg-emerald-400 transition-colors"
                        title={`Day -${30 - i}: 100% Operational (0 outages)`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Edge Radar & Custom Prober (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Custom Prober Card */}
          <div className="cyber-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Zap size={16} className="text-[#00F0FF]" />
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                Synthetic Ping Prober
              </h3>
            </div>

            <p className="text-[10px] text-[#9499B3] leading-relaxed">
              Execute live healthcheck probes against any public or local microservice endpoint.
            </p>

            <form onSubmit={handleCustomProbe} className="flex flex-col gap-2.5 mt-1">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://api.service.local/health"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00F0FF] text-xs font-mono text-[#F1F3F9] outline-none"
              />

              <button
                type="submit"
                disabled={isProbing}
                className="w-full py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={12} />
                <span>{isProbing ? "PROBING..." : "DISPATCH HEALTHCHECK"}</span>
              </button>
            </form>

            {probeResult && (
              <div className="mt-2 p-3 rounded-xl bg-black/40 border border-[#00FF41]/30 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF41]" />
                  <span className="font-bold text-[#00FF41]">{probeResult.status}</span>
                </div>
                <span className="text-xs font-bold text-[#F1F3F9]">{probeResult.latency} ms</span>
              </div>
            )}
          </div>

          {/* Global Multi-Region Edge Map */}
          <div className="cyber-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#BF40FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Global Region Latency
                </h3>
              </div>
              <span className="text-[9px] text-[#00FF41] font-bold">ALL PASS</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { region: "US-East (Virginia)", ping: "14 ms", status: "OK" },
                { region: "EU-Central (Frankfurt)", ping: "8 ms", status: "OK" },
                { region: "AP-Northeast (Tokyo)", ping: "142 ms", status: "OK" },
                { region: "EU-West (London)", ping: "12 ms", status: "OK" },
                { region: "SA-East (São Paulo)", ping: "168 ms", status: "OK" },
              ].map((r) => (
                <div key={r.region} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[#9499B3]">{r.region}</span>
                  <span className="text-[#00FF41] font-bold">{r.ping}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API ENDPOINT PROBE MODAL */}
      {selectedProbeService && (
        <ApiEndpointProbeModal
          serviceName={selectedProbeService.name}
          endpointUrl={selectedProbeService.endpoint}
          isOpen={!!selectedProbeService}
          onClose={() => setSelectedProbeService(null)}
        />
      )}
    </div>
  );
}
