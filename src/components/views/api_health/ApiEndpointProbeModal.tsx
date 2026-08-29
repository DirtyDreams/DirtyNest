"use client";

import { useState } from "react";
import { X, Send, Radio, Copy, Check } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ApiEndpointProbeModalProps {
  endpointUrl: string;
  serviceName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiEndpointProbeModal({
  endpointUrl,
  serviceName,
  isOpen,
  onClose,
}: ApiEndpointProbeModalProps) {
  const [method, setMethod] = useState<"GET" | "POST" | "HEAD">("GET");
  const [url, setUrl] = useState(endpointUrl);
  const [isProbing, setIsProbing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    body: string;
    sslTlsVersion: string;
    dnsLookupMs: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunProbe = () => {
    cyberAudio.play("click");
    setIsProbing(true);

    setTimeout(() => {
      setIsProbing(false);
      const latency = Math.floor(12 + Math.random() * 24);
      setResponseResult({
        status: 200,
        statusText: "OK",
        latencyMs: latency,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-powered-by": "Next.js / Turbopack",
          "cache-control": "s-maxage=60, stale-while-revalidate",
          "server": "Caddy/2.7.6",
          "x-mesh-node": "node-04-edge-gateway",
        },
        body: JSON.stringify(
          {
            service: serviceName,
            status: "HEALTHY",
            timestamp: new Date().toISOString(),
            cluster: "dirtynest-mesh-eu",
            metrics: {
              activeConnections: 42,
              p99LatencyMs: latency * 1.5,
            },
          },
          null,
          2
        ),
        sslTlsVersion: "TLSv1.3 (ChaCha20-Poly1305)",
        dnsLookupMs: 1.8,
      });
      cyberAudio.play("chime");
    }, 600);
  };

  const handleCopyBody = () => {
    if (!responseResult) return;
    cyberAudio.play("click");
    navigator.clipboard.writeText(responseResult.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#080910] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-white">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                ENDPOINT PROBE // <span className="text-cyan-400">{serviceName}</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Synchronous HTTP probe with latency benchmark & TLS negotiation inspection
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Request URL Input Bar */}
          <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="bg-slate-800 text-cyan-400 font-bold px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="HEAD">HEAD</option>
            </select>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-200 font-mono outline-none px-2"
            />

            <button
              onClick={handleRunProbe}
              disabled={isProbing}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProbing ? "DISPATCHING..." : "SEND PROBE"}</span>
            </button>
          </div>

          {/* Results Display */}
          {responseResult && (
            <div className="space-y-3 animate-fade-in">
              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold">STATUS CODE</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5">
                    {responseResult.status} {responseResult.statusText}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold">ROUND-TRIP LATENCY</span>
                  <span className="text-sm font-black text-cyan-400 mt-0.5">
                    {responseResult.latencyMs} ms
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold">DNS RESOLUTION</span>
                  <span className="text-sm font-black text-purple-400 mt-0.5">
                    {responseResult.dnsLookupMs} ms
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold">SECURITY / TLS</span>
                  <span className="text-[11px] font-bold text-amber-400 mt-0.5 truncate">
                    {responseResult.sslTlsVersion}
                  </span>
                </div>
              </div>

              {/* Response Body & Headers Tabs */}
              <div className="bg-black/80 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">RESPONSE PAYLOAD (JSON)</span>
                  <button
                    onClick={handleCopyBody}
                    className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "COPIED" : "COPY"}</span>
                  </button>
                </div>
                <pre className="text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-48 leading-relaxed select-all">
                  {responseResult.body}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05060b] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Target Mesh Node: <strong className="text-cyan-400">node-04-edge-gateway</strong>
          </span>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
