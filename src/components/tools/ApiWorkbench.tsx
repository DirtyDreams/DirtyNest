"use client";

import { useState, useEffect } from "react";
import { Send, Copy, Check, Clock, Globe, ArrowRight, Trash2, History, Code2, ShieldAlert } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface RequestHistoryItem {
  id: string;
  method: string;
  url: string;
  status: number | null;
  durationMs: number;
  timestamp: string;
}

const PRESET_ENDPOINTS = [
  { method: "GET", url: "/api/todos", label: "Get Todos" },
  { method: "GET", url: "/api/notes", label: "Get Notes" },
  { method: "GET", url: "/api/calendar", label: "Get Calendar" },
  { method: "GET", url: "/api/focus/total", label: "Get Total Focus" },
  { method: "POST", url: "/api/todos", label: "Create Todo", body: '{\n  "title": "New Directive",\n  "priority": "high"\n}' },
];

export default function ApiWorkbench() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("/api/todos");
  const [activeReqTab, setActiveReqTab] = useState<"params" | "headers" | "body" | "auth">("body");
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState('{\n  "title": "Tactical Deployment Directive",\n  "priority": "high"\n}');
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    sizeBytes: number;
    headers: Record<string, string>;
    data: any;
    error?: string;
  } | null>(null);

  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_api_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveHistoryItem = (item: RequestHistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.slice(0, 14)];
      try {
        localStorage.setItem("dirtynest_api_history", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSend = async () => {
    if (!url.trim()) return;
    cyberAudio.play("click");
    setLoading(true);
    const start = performance.now();

    try {
      let customHeaders: Record<string, string> = {};
      try {
        if (headersText.trim()) customHeaders = JSON.parse(headersText);
      } catch {}

      if (authToken.trim()) {
        customHeaders["Authorization"] = `Bearer ${authToken.trim()}`;
      }

      const options: RequestInit = {
        method,
        headers: customHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && bodyText.trim()) {
        options.body = bodyText;
      }

      const res = await fetch(url, options);
      const durationMs = Math.round(performance.now() - start);

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => (respHeaders[key] = val));

      let data: any = null;
      const text = await res.text();
      const sizeBytes = new Blob([text]).size;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      const result = {
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        durationMs,
        sizeBytes,
        headers: respHeaders,
        data,
      };

      setResponse(result);
      saveHistoryItem({
        id: crypto.randomUUID(),
        method,
        url,
        status: res.status,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (e: any) {
      const durationMs = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        statusText: "Network/Fetch Error",
        durationMs,
        sizeBytes: 0,
        headers: {},
        data: null,
        error: e.message || "Failed to execute fetch request",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    let cmd = `curl -X ${method} "${url}"`;
    try {
      const h = JSON.parse(headersText);
      Object.entries(h).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
    } catch {}
    if (authToken.trim()) {
      cmd += ` \\\n  -H "Authorization: Bearer ${authToken.trim()}"`;
    }
    if (["POST", "PUT", "PATCH"].includes(method) && bodyText.trim()) {
      cmd += ` \\\n  -d '${bodyText.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  };

  const copyCurl = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(generateCurl());
    setCopied("curl");
    setTimeout(() => setCopied(null), 1500);
  };

  const copyResponseData = () => {
    if (!response) return;
    cyberAudio.play("click");
    navigator.clipboard.writeText(
      typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : String(response.data)
    );
    setCopied("resp");
    setTimeout(() => setCopied(null), 1500);
  };

  const loadPreset = (p: typeof PRESET_ENDPOINTS[0]) => {
    cyberAudio.play("click");
    setMethod(p.method);
    setUrl(p.url);
    if (p.body) setBodyText(p.body);
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Top Presets Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#00FF41]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            API Workbench & HTTP Request Lab
          </h3>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#4F536E] mr-1">QUICK API:</span>
          {PRESET_ENDPOINTS.map((p) => (
            <button
              key={p.label}
              onClick={() => loadPreset(p)}
              className="px-2 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
            >
              <span className="text-[#00FF41] font-bold mr-1">{p.method}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Request Bar */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Method Selector */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-black/60 border border-white/10 text-xs font-bold font-mono px-3 py-2.5 rounded-xl text-[#00FF41] outline-none cursor-pointer"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
        </select>

        {/* URL Input */}
        <div className="flex-1 flex items-center bg-black/60 rounded-xl border border-white/10 focus-within:border-[#00FF41] px-3 py-2 transition-all">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:3000/api/..."
            className="w-full bg-transparent outline-none text-xs text-[#F1F3F9] font-mono selection:bg-[#00FF41]/20"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.25)] shrink-0 disabled:opacity-50"
        >
          <Send size={13} className={loading ? "animate-pulse" : ""} />
          <span>{loading ? "SENDING..." : "SEND REQUEST"}</span>
        </button>

        {/* Copy cURL */}
        <button
          onClick={copyCurl}
          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-[#9499B3] hover:text-[#F1F3F9] transition-all cursor-pointer shrink-0"
          title="Copy as cURL command"
        >
          {copied === "curl" ? <Check size={14} className="text-[#00FF41]" /> : <Code2 size={14} />}
        </button>
      </div>

      {/* Request Options Tabs (Headers, Body, Auth) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Request Config Column */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Subtabs Header */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
            {[
              { id: "body", label: "BODY (JSON)" },
              { id: "headers", label: "HEADERS" },
              { id: "auth", label: "BEARER AUTH" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveReqTab(tab.id as any);
                }}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[10px] tracking-wider transition-all cursor-pointer ${
                  activeReqTab === tab.id
                    ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                    : "text-[#9499B3] hover:text-[#F1F3F9] border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body Editor */}
          {activeReqTab === "body" && (
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Raw JSON Body payload..."
              rows={8}
              className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF41] text-xs font-mono text-[#F1F3F9] outline-none resize-none transition-all placeholder:text-[#4F536E]"
            />
          )}

          {/* Headers Editor */}
          {activeReqTab === "headers" && (
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder='JSON Headers e.g. { "Authorization": "..." }'
              rows={8}
              className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#00F0FF] text-xs font-mono text-[#F1F3F9] outline-none resize-none transition-all placeholder:text-[#4F536E]"
            />
          )}

          {/* Auth Editor */}
          {activeReqTab === "auth" && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5">
              <label className="text-[10px] text-[#9499B3] uppercase font-bold">
                Bearer Token Header
              </label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full p-2.5 rounded-lg bg-black/60 border border-white/10 focus:border-[#00FF41] text-xs text-[#F1F3F9] outline-none"
              />
              <p className="text-[10px] text-[#4F536E]">
                Automatically prepended as `Authorization: Bearer &lt;token&gt;` on execution.
              </p>
            </div>
          )}
        </div>

        {/* Right Response Column */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Response Telemetry Header */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#9499B3] font-bold uppercase">RESPONSE</span>
              {response && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    response.status >= 200 && response.status < 300
                      ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                      : "bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30"
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
              )}
            </div>

            {response && (
              <div className="flex items-center gap-3 text-[10px] text-[#9499B3]">
                <span>{response.durationMs}ms</span>
                <span>{(response.sizeBytes / 1024).toFixed(2)} KB</span>
                <button
                  onClick={copyResponseData}
                  className="text-[#00FF41] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copied === "resp" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied === "resp" ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Payload Viewer */}
          <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3.5 min-h-[190px] max-h-[300px] overflow-y-auto">
            {!response && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-[#4F536E] text-xs">
                <Globe size={24} className="mb-2 opacity-30" />
                <span>Enter an endpoint and hit Send Request to inspect results.</span>
              </div>
            )}

            {response?.error && (
              <div className="p-3 rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-[#FF2A6D] text-xs flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{response.error}</span>
              </div>
            )}

            {response && !response.error && (
              <pre className="text-xs font-mono text-[#00FF41] selection:bg-[#00FF41]/20 break-all whitespace-pre-wrap">
                {typeof response.data === "object"
                  ? JSON.stringify(response.data, null, 2)
                  : String(response.data)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* History Log Section */}
      {history.length > 0 && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-[#9499B3] flex items-center gap-1.5">
              <History size={13} />
              RECENT REQUEST HISTORY ({history.length})
            </span>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setHistory([]);
                localStorage.removeItem("dirtynest_api_history");
              }}
              className="text-[10px] text-[#4F536E] hover:text-[#FF2A6D] transition-colors cursor-pointer"
            >
              CLEAR HISTORY
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setMethod(item.method);
                  setUrl(item.url);
                }}
                className="p-2.5 rounded-lg bg-black/40 border border-white/5 hover:border-[#00FF41]/40 flex items-center justify-between text-xs cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] font-bold text-[#00FF41]">{item.method}</span>
                  <span className="text-[#F1F3F9] truncate font-mono text-[11px]">{item.url}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#4F536E] shrink-0">
                  <span>{item.durationMs}ms</span>
                  <ArrowRight size={11} className="group-hover:text-[#00FF41] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
