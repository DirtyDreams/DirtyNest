"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Rss,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  ShieldAlert,
  RefreshCw,
  Radio,
  Settings,
  Server,
  Network,
  AlertTriangle,
  Bug,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import MitreAttackMatrixModal from "./intel/MitreAttackMatrixModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { KevItem, PortScanResult, ThreatRadarSummary } from "@/lib/intel/sidecar";

interface IntelItem {
  id: string;
  title: string;
  source: string;
  channel: "AI" | "SECURITY" | "DEVOPS" | "HARDWARE";
  snippet: string;
  timestamp: string;
  url: string;
  score: number;
  tags: string[];
  isSaved?: boolean;
}

const INITIAL_INTEL: IntelItem[] = [
  {
    id: "intel-1",
    title: "Next.js 16.3 Unveils Instant Edge Routing & Turbopack v2 Engine",
    source: "Vercel Engineering",
    channel: "DEVOPS",
    snippet: "Major runtime optimizations yield 40% faster cold starts and zero-config streaming Server Actions across distributed edge worker nodes.",
    timestamp: "14m ago",
    url: "https://vercel.com/blog",
    score: 342,
    tags: ["nextjs", "turbopack", "edge"],
  },
  {
    id: "intel-2",
    title: "Autonomous Multi-Thread Agent Orchestration: The 2026 Consensus",
    source: "DeepMind Research",
    channel: "AI",
    snippet: "New architectural framework for deterministic agent coordination across distributed tool protocols with verifiable cryptographic proofs.",
    timestamp: "1h ago",
    url: "https://arxiv.org",
    score: 512,
    tags: ["agents", "mcp", "llm"],
  },
  {
    id: "intel-3",
    title: "Critical Zero-Day in OpenSSH (RegreSSHion CVE-2026) Mitigation Guide",
    source: "Cyber Threat Intel",
    channel: "SECURITY",
    snippet: "Remote unauthenticated code execution vulnerability identified in default PAM configurations. Immediate patch directive issued.",
    timestamp: "2h ago",
    url: "https://cve.mitre.org",
    score: 890,
    tags: ["cve", "openssh", "zero-day"],
  },
  {
    id: "intel-4",
    title: "NVIDIA Rubin Architecture Delivers 3.2x Tensor FLOPS & HBM4 Memory",
    source: "Hardware Matrix",
    channel: "HARDWARE",
    snippet: "Next-generation data center GPUs introduce native FP4 quantization and 288GB ultra-bandwidth unified memory for local 70B parameter models.",
    timestamp: "4h ago",
    url: "https://nvidia.com",
    score: 420,
    tags: ["gpu", "cuda", "hardware"],
  },
  {
    id: "intel-5",
    title: "PostgreSQL 18 Release: Autonomous Vector Query Re-Indexing Engine",
    source: "Hacker News",
    channel: "DEVOPS",
    snippet: "Native HNSW indexes now auto-calibrate clustering parameters based on live operational query heatmaps without table locks.",
    timestamp: "5h ago",
    url: "https://news.ycombinator.com",
    score: 610,
    tags: ["postgres", "vector", "database"],
  },
  {
    id: "intel-6",
    title: "Claude 3.7 Sonnet Hybrid Reasoning: Real-Time Thinking Benchmarks",
    source: "Anthropic Research",
    channel: "AI",
    snippet: "Detailed analysis of dynamic reasoning token allocation and test-time compute scaling across software architecture and formal verification tasks.",
    timestamp: "7h ago",
    url: "https://anthropic.com/research",
    score: 780,
    tags: ["claude", "reasoning", "benchmark"],
  },
];

type IntelTab = "ALL" | "NVD" | "KEV" | "MESH";

export default function IntelFeedView() {
  const { setActiveView } = useAppStore();
  const [intelList, setIntelList] = useState<IntelItem[]>(INITIAL_INTEL);
  const [kevList, setKevList] = useState<KevItem[]>([]);
  const [meshScan, setMeshScan] = useState<PortScanResult | null>(null);
  const [threatSummary, setThreatSummary] = useState<ThreatRadarSummary | null>(null);
  const [activeTab, setActiveTab] = useState<IntelTab>("ALL");

  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanningMesh, setIsScanningMesh] = useState(false);
  const [showMitreModal, setShowMitreModal] = useState(false);

  const [syncedFeeds, setSyncedFeeds] = useState<Array<{ name: string; url: string; enabled: boolean }>>([
    { name: "CISA Cybersecurity Alerts", url: "https://www.cisa.gov/uscert/ncas/all.xml", enabled: true },
    { name: "CISA KEV (Known Exploited)", url: "https://www.cisa.gov/.../kev.json", enabled: true },
    { name: "NVD API 2.0 Security Feed", url: "https://services.nvd.nist.gov/rest/json/cves/2.0", enabled: true },
    { name: "Hacker News Frontpage", url: "https://news.ycombinator.com/rss", enabled: true },
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_rss_feeds");
      if (saved) {
        setSyncedFeeds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const fetchCves = useCallback(async (force = false) => {
    try {
      const res = await fetch(`/api/intel/cve${force ? "?force=true" : ""}`);
      if (res.ok) {
        const data = (await res.json()) as {
          cves?: Array<{
            cve_id: string;
            title: string;
            description: string;
            severity: string;
            cvss_score: string;
            published_at: string;
            url: string;
          }>;
        };
        if (data.cves && data.cves.length > 0) {
          const mapped: IntelItem[] = data.cves.map((c) => ({
            id: c.cve_id,
            title: c.title || c.cve_id,
            source: "NVD CVE Feed",
            channel: "SECURITY",
            snippet: c.description || c.cve_id,
            timestamp: c.published_at ? new Date(c.published_at).toLocaleString() : "recent",
            url: c.url,
            score: c.cvss_score ? Math.round(Number(c.cvss_score) * 100) : 0,
            tags: [c.severity.toUpperCase(), c.cve_id],
          }));
          setIntelList(mapped);
        }
      }
    } catch {}
  }, []);

  const fetchKevs = useCallback(async (force = false) => {
    try {
      const res = await fetch(`/api/intel/kev${force ? "?force=true" : ""}`);
      if (res.ok) {
        const data = (await res.json()) as { vulnerabilities?: KevItem[] };
        if (data.vulnerabilities) {
          setKevList(data.vulnerabilities);
        }
      }
    } catch {}
  }, []);

  const fetchMeshScan = useCallback(async () => {
    setIsScanningMesh(true);
    try {
      const res = await fetch("/api/intel/ports");
      if (res.ok) {
        const data = (await res.json()) as PortScanResult;
        setMeshScan(data);
      }
    } catch {} finally {
      setIsScanningMesh(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/intel/summary");
      if (res.ok) {
        const data = (await res.json()) as ThreatRadarSummary;
        setThreatSummary(data);
        if (data.mesh_ports && data.mesh_ports.length > 0) {
          setMeshScan({
            target: "127.0.0.1",
            scan: data.mesh_ports,
            open_count: data.mesh_healthy_services,
            total_services: data.mesh_total_services,
          });
        }
      }
    } catch {}
  }, []);

  const handleFullRefresh = useCallback(async (force = false) => {
    setIsRefreshing(true);
    cyberAudio.play("warp");
    await Promise.allSettled([
      fetchCves(force),
      fetchKevs(force),
      fetchMeshScan(),
      fetchSummary(),
    ]);
    setIsRefreshing(false);
    cyberAudio.play("chime");
  }, [fetchCves, fetchKevs, fetchMeshScan, fetchSummary]);

  useEffect(() => {
    handleFullRefresh(false);
  }, [handleFullRefresh]);

  const handleToggleSave = async (id: string, title?: string, snippet?: string, url?: string) => {
    cyberAudio.play("chime");
    const item = intelList.find((i) => i.id === id);
    const willSave = item ? !item.isSaved : true;

    setIntelList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isSaved: !i.isSaved } : i))
    );

    try {
      await fetch("/api/knowledge/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || item?.title || id,
          content: `${snippet || item?.snippet || ""}\n\nReference: ${url || item?.url || ""}`,
          category: "threat-intel",
          tags: ["security", "threat-radar", "cve", id],
        }),
      });
    } catch {}
  };

  const filteredItems = intelList.filter((item) => {
    const matchesChannel = channelFilter === "ALL" || item.channel === channelFilter;
    const matchesSeverity =
      severityFilter === "ALL" ||
      item.tags.some((t) => t.toUpperCase() === severityFilter);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesSeverity && matchesSearch;
  });

  const filteredKevs = kevList.filter((kev) => {
    const q = searchQuery.toLowerCase();
    return (
      kev.cve_id.toLowerCase().includes(q) ||
      kev.title.toLowerCase().includes(q) ||
      kev.vendor.toLowerCase().includes(q) ||
      kev.product.toLowerCase().includes(q) ||
      kev.description.toLowerCase().includes(q)
    );
  });

  const posture = threatSummary?.posture ?? (meshScan && meshScan.open_count >= 5 ? "OPTIMAL" : "ELEVATED_THREAT");
  const postureColor =
    posture === "OPTIMAL" ? "#00FF41" : posture === "ELEVATED_THREAT" ? "#FFB800" : "#FF003C";

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
      <div className="cyber-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(255,0,60,0.2) 100%)",
                border: "1px solid rgba(0,240,255,0.4)",
                boxShadow: "0 0 16px rgba(0,240,255,0.3)",
              }}
            >
              <ShieldAlert size={22} className="text-[#00F0FF]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#F1F3F9]">
                  CYBER THREAT RADAR // <span className="text-[#00F0FF]">SECURITY OPS MATRIX</span>
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border"
                  style={{
                    color: postureColor,
                    backgroundColor: `${postureColor}15`,
                    borderColor: `${postureColor}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: postureColor }}
                  />
                  POSTURE: {posture}
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                CISA Weaponized KEV catalog · Live NVD API 2.0 zero-day bulletins · Zero-trust mesh port surveillance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="h-9 px-3.5 bg-[#FF8800]/15 border-[#FF8800]/40 text-[#FF8800] hover:bg-[#FF8800]/25 text-xs font-bold shadow-[0_0_12px_rgba(255,136,0,0.2)]"
              title="Configure RSS sources and alert filters in Settings"
            >
              <Settings size={14} className="mr-1.5" />
              <span>MANAGE WIRE FEEDS</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                cyberAudio.play("click");
                setShowMitreModal(true);
              }}
              className="h-9 px-3.5 bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 text-xs font-bold shadow-[0_0_12px_rgba(255,0,60,0.2)]"
            >
              <ShieldAlert size={14} className="mr-1.5" />
              <span>MITRE ATT&CK MATRIX</span>
            </Button>

            <Button
              onClick={() => handleFullRefresh(true)}
              disabled={isRefreshing}
              className="h-9 px-3.5 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn("mr-1.5", isRefreshing ? "animate-spin" : "")} />
              <span>{isRefreshing ? "SYNCING RADAR..." : "REFRESH RADAR"}</span>
            </Button>
          </div>
        </div>

        {/* 4-METRIC THREAT RADAR RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold flex items-center gap-1">
              <Bug size={12} className="text-red-400" />
              Weaponized KEVs
            </span>
            <span className="text-lg font-black text-red-400 mt-0.5">
              {threatSummary?.kev_total_weaponized || kevList.length || 0}
            </span>
            <span className="text-[9px] text-[#4F536E]">Active in the wild</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-400" />
              Ransomware Linked
            </span>
            <span className="text-lg font-black text-amber-400 mt-0.5">
              {threatSummary?.kev_ransomware_linked || kevList.filter((k) => k.ransomware_use === "Known").length || 0}
            </span>
            <span className="text-[9px] text-[#4F536E]">Known campaign exploits</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold flex items-center gap-1">
              <Zap size={12} className="text-[#00F0FF]" />
              Recent NVD CVEs
            </span>
            <span className="text-lg font-black text-[#00F0FF] mt-0.5">
              {threatSummary?.recent_cve_count || intelList.length}
            </span>
            <span className="text-[9px] text-[#4F536E]">
              {threatSummary?.critical_cve_count ?? intelList.filter((i) => i.tags.includes("CRITICAL")).length} Critical
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold flex items-center gap-1">
              <Network size={12} className="text-[#00FF41]" />
              Mesh Services
            </span>
            <span className="text-lg font-black text-[#00FF41] mt-0.5">
              {meshScan?.open_count ?? threatSummary?.mesh_healthy_services ?? 0} / {meshScan?.total_services ?? threatSummary?.mesh_total_services ?? 7}
            </span>
            <span className="text-[9px] text-[#4F536E]">Ports online & verified</span>
          </div>
        </div>
      </div>

      {/* RADAR SUB-TABS SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 cyber-card p-3">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("ALL");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              activeTab === "ALL"
                ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Rss size={13} />
            <span>ALL INTEL WIRE</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("NVD");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              activeTab === "NVD"
                ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/40"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Zap size={13} />
            <span>NVD CVE RADAR</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("KEV");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              activeTab === "KEV"
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Bug size={13} />
            <span>CISA WEAPONIZED KEV</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded bg-red-500/30 text-red-300 font-black">
              {kevList.length}
            </span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setActiveTab("MESH");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              activeTab === "MESH"
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Server size={13} />
            <span>LOCAL MESH RADAR</span>
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
          </button>
        </div>

        {/* Global Search Box */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, CVEs, ports, vendors..."
            className="pl-9 bg-black/50 border-white/10 text-xs font-mono"
          />
        </div>
      </div>

      {/* VIEWPORT BODY SWITCHER */}
      {activeTab === "MESH" ? (
        /* MESH RADAR PORT GRID */
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="cyber-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Network size={20} className="text-[#00FF41]" />
              <div>
                <h3 className="text-sm font-black text-[#F1F3F9]">
                  ZERO-TRUST TCP PORT MESH // LOCALHOST MONITOR
                </h3>
                <p className="text-xs text-[#9499B3]">
                  Direct socket probes targeting core DirtyNest subsystems on 127.0.0.1
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                cyberAudio.play("warp");
                fetchMeshScan();
              }}
              disabled={isScanningMesh}
              className="h-8 px-3 text-xs bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 font-bold cursor-pointer"
            >
              <RefreshCw size={12} className={cn("mr-1.5", isScanningMesh ? "animate-spin" : "")} />
              <span>{isScanningMesh ? "SCANNING MESH..." : "RE-SCAN MESH"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(meshScan?.scan ?? []).map((node) => (
              <div
                key={node.port}
                className={cn(
                  "cyber-card p-4 flex flex-col justify-between gap-3 border transition-all",
                  node.open
                    ? "border-[#00FF41]/30 hover:border-[#00FF41]/60 bg-[#00FF41]/[0.02]"
                    : "border-red-500/30 hover:border-red-500/60 bg-red-500/[0.02]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-[#F1F3F9]">
                        :{node.port}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1",
                          node.open
                            ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]"
                            : "bg-red-500/10 border-red-500/40 text-red-400"
                        )}
                      >
                        {node.open ? (
                          <>
                            <CheckCircle2 size={11} /> ONLINE
                          </>
                        ) : (
                          <>
                            <XCircle size={11} /> OFFLINE
                          </>
                        )}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#9499B3] mt-1">{node.service}</span>
                    <span className="text-[10px] text-[#4F536E]">{node.role}</span>
                  </div>

                  <span className="text-xs font-mono text-[#00F0FF] bg-black/40 px-2 py-1 rounded border border-white/5">
                    {node.open ? `${node.latency_ms}ms` : node.error || "REFUSED"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-[#4F536E]">
                  <span>TARGET: {node.target}:{node.port}</span>
                  <span className="font-mono text-[#00FF41]">ZERO-TRUST ISOLATED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "KEV" ? (
        /* CISA WEAPONIZED KEV CATALOG */
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="cyber-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug size={20} className="text-red-400" />
              <div>
                <h3 className="text-sm font-black text-[#F1F3F9]">
                  CISA KNOWN EXPLOITED VULNERABILITIES (KEV) // WEAPONIZED DIRECTIVE
                </h3>
                <p className="text-xs text-[#9499B3]">
                  Catalog of zero-day exploits actively observed in targeted attacks and ransomware campaigns
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-500/15 border border-red-500/40 text-red-400">
              {filteredKevs.length} CATALOG MATCHES
            </span>
          </div>

          <div className="space-y-3">
            {filteredKevs.slice(0, 50).map((kev) => (
              <div
                key={kev.cve_id}
                className="cyber-card p-4 flex flex-col gap-2.5 border border-red-500/25 hover:border-red-500/50 transition-all bg-red-500/[0.01]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black font-mono text-sm text-red-400 tracking-wider">
                      {kev.cve_id}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black animate-pulse">
                      ACTIVE WEAPONIZATION
                    </span>
                    {kev.ransomware_use === "Known" && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                        RANSOMWARE USE
                      </span>
                    )}
                    <span className="text-[#4F536E]">•</span>
                    <span className="text-[#9499B3] font-bold">
                      {kev.vendor} {kev.product}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSave(kev.cve_id, kev.title, kev.description, kev.url)}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[#4F536E] hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-all cursor-pointer"
                      title="Save to Knowledge Vault"
                    >
                      <Bookmark size={14} />
                    </button>
                    <a
                      href={kev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[#4F536E] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all"
                      title="View NVD Detail"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#F1F3F9] leading-snug">
                  {kev.title}
                </h4>

                <p className="text-xs text-[#9499B3] leading-relaxed font-sans">
                  {kev.description}
                </p>

                <div className="p-2 rounded bg-black/40 border border-white/5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-rose-300 text-[11px]">
                    <span className="font-bold">Remediation Action:</span>
                    <span className="font-sans text-[#F1F3F9]">{kev.required_action}</span>
                  </div>
                  <div className="text-[10px] text-[#9499B3]">
                    <span className="text-[#4F536E]">Due Date: </span>
                    <span className="font-mono text-amber-400 font-bold">{kev.due_date || "Immediate"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STANDARD OR NVD FILTERED ARTICLES FEED */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Feed Content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="cyber-card p-3.5 flex flex-wrap items-center justify-between gap-3">
              {/* Channel Pills */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
                {["ALL", "AI", "SECURITY", "DEVOPS", "HARDWARE"].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      cyberAudio.play("click");
                      setChannelFilter(ch);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      channelFilter === ch
                        ? "bg-[#00F0FF]/20 text-[#00F0FF] font-bold border border-[#00F0FF]/40"
                        : "text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Severity Pills */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
                <span className="text-[10px] text-[#9499B3] px-1.5 uppercase font-bold">Severity:</span>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
                  const isSelected = severityFilter === sev;
                  const sevColor =
                    sev === "CRITICAL"
                      ? "#FF003C"
                      : sev === "HIGH"
                      ? "#FF8800"
                      : sev === "MEDIUM"
                      ? "#FFB800"
                      : sev === "LOW"
                      ? "#00FF41"
                      : "#00F0FF";
                  return (
                    <button
                      key={sev}
                      onClick={() => {
                        cyberAudio.play("click");
                        setSeverityFilter(sev);
                      }}
                      className="px-2 py-0.5 rounded transition-all cursor-pointer text-[10px] font-bold border"
                      style={{
                        color: isSelected ? sevColor : "#9499B3",
                        background: isSelected ? `${sevColor}20` : "transparent",
                        borderColor: isSelected ? `${sevColor}50` : "transparent",
                      }}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const channelColor =
                  item.channel === "AI"
                    ? "#BF40FF"
                    : item.channel === "SECURITY"
                    ? "#FF003C"
                    : item.channel === "DEVOPS"
                    ? "#00FF41"
                    : "#00F0FF";

                return (
                  <div
                    key={item.id}
                    className="cyber-card p-4 sm:p-5 flex flex-col gap-2.5 border hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            color: channelColor,
                            background: `${channelColor}15`,
                            borderColor: `${channelColor}40`,
                          }}
                        >
                          {item.channel}
                        </span>
                        <span className="text-[#4F536E]">•</span>
                        <span className="text-[#9499B3] font-bold">{item.source}</span>
                        <span className="text-[#4F536E]">•</span>
                        <span className="text-[#4F536E]">{item.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSave(item.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            item.isSaved
                              ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                              : "bg-white/[0.03] border-white/10 text-[#4F536E] hover:text-[#F1F3F9]"
                          }`}
                          title={item.isSaved ? "Saved in Knowledge Vault" : "Save to Knowledge Vault"}
                        >
                          {item.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#4F536E] hover:text-[#00F0FF] transition-all"
                          title="Open Source Link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#F1F3F9] group-hover:text-[#00F0FF] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#9499B3] leading-relaxed font-sans">
                      {item.snippet}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-[#4F536E]">
                      <div className="flex items-center gap-1.5">
                        {item.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <span className="font-mono text-[#00FF41]">+{item.score} AGENT VOTES</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feed Channels & Synced Wire Feeds Hub (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="cyber-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-[#00FF41]" />
                  <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                    Active Wire Feeds
                  </h3>
                </div>
                <span className="text-[10px] text-[#00FF41] font-bold">
                  {syncedFeeds.filter((f) => f.enabled !== false).length} ACTIVE
                </span>
              </div>

              <p className="text-[10px] text-[#9499B3] leading-relaxed">
                Real-time cyber telemetry and preprints auto-polled across registered sources.
              </p>

              <div className="space-y-2 text-xs font-mono">
                {syncedFeeds.map((feed) => (
                  <div
                    key={feed.name}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      feed.enabled !== false
                        ? "bg-black/30 border-white/5"
                        : "bg-black/20 border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-[#F1F3F9] truncate text-xs">{feed.name}</span>
                      <span className="text-[9px] text-[#4F536E] truncate font-mono">{feed.url}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        feed.enabled !== false
                          ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30"
                          : "bg-white/5 text-[#4F536E]"
                      }`}
                    >
                      {feed.enabled !== false ? "SYNCED" : "PAUSED"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveView("settings");
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#FF8800]/15 border border-[#FF8800]/40 text-[#FF8800] hover:bg-[#FF8800]/25 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,136,0,0.15)]"
              >
                <Settings size={14} />
                <span>CONFIGURE FEEDS IN SETTINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MITRE ATT&CK Matrix Modal */}
      {showMitreModal && (
        <MitreAttackMatrixModal
          isOpen={showMitreModal}
          onClose={() => setShowMitreModal(false)}
        />
      )}
    </div>
  );
}
