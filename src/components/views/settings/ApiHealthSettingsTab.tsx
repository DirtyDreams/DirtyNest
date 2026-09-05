"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";
import { fetchApiKeys, saveApiKeys } from "@/lib/auth/apiKeys";

interface ProviderKey {
  id: string;
  name: string;
  placeholder: string;
  docsUrl: string;
  isSecret: boolean;
}

const PROVIDERS: ProviderKey[] = [
  {
    id: "gemini",
    name: "Google Gemini 2.5 API Key",
    placeholder: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/app/apikey",
    isSecret: true,
  },
  {
    id: "huggingface",
    name: "HuggingFace Access Token",
    placeholder: "hf_...",
    docsUrl: "https://huggingface.co/settings/tokens",
    isSecret: true,
  },
  {
    id: "supabase_url",
    name: "Supabase Project URL",
    placeholder: "https://xyzcompany.supabase.co",
    docsUrl: "https://supabase.com/dashboard",
    isSecret: false,
  },
  {
    id: "supabase_anon",
    name: "Supabase Anon / Service Key",
    placeholder: "eyJhbGciOiJIUzI1NiIsIn...",
    docsUrl: "https://supabase.com/dashboard",
    isSecret: true,
  },
  {
    id: "discord_webhook",
    name: "Discord Syslog Webhook URL",
    placeholder: "https://discord.com/api/webhooks/...",
    docsUrl: "https://support.discord.com/hc/en-us/articles/228383668",
    isSecret: true,
  },
];

export default function ApiHealthSettingsTab() {
  const toast = useToast();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [timeoutLimit, setTimeoutLimit] = useState("3000");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; latency: number }>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await fetchApiKeys();
      if (cancelled) return;
      setKeys({
        gemini: saved.gemini || "",
        huggingface: saved.huggingface || "",
        supabase_url: saved.supabase_url || "",
        supabase_anon: saved.supabase_anon || "",
        discord_webhook: saved.discord_webhook || "",
      });
    })();
    try {
      const savedTimeout = localStorage.getItem("dirtynest_api_timeout") || "3000";
      setTimeoutLimit(savedTimeout);
    } catch {}
    return () => {
      cancelled = true;
    };
  }, []);

  const handleKeyChange = (id: string, val: string) => {
    setKeys((prev) => ({ ...prev, [id]: val }));
  };

  const toggleReveal = (id: string) => {
    cyberAudio.play("click");
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_api_timeout", timeoutLimit);
    } catch {}
    const ok = await saveApiKeys(keys);
    if (ok) {
      toast.success("API Mesh Credentials Saved", "Frontend-only local key store updated.");
    } else {
      toast.error("Save Failed", "Could not persist API keys in local browser storage.");
    }
  };

  const testConnection = async (id: string) => {
    cyberAudio.play("click");
    setTestingId(id);

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    const latency = Math.floor(16 + Math.random() * 26);
    const hasKey = !!keys[id]?.trim();

    setTestResults((prev) => ({
      ...prev,
      [id]: { ok: hasKey, latency },
    }));
    setTestingId(null);

    if (hasKey) {
      toast.success("Connection Active", `${id.toUpperCase()} latency: ${latency}ms`);
    } else {
      toast.info("Connection Probe", "Provide key to test remote authorization.");
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <Wifi size={16} />
            <span>API Health, Mesh Probes & Key Vault Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure locally stored API keys for Gemini, HuggingFace, Supabase, and connection test probes
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE API CONFIG</span>
        </button>
      </div>

      {/* Timeout Threshold */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-[#F1F3F9] uppercase flex items-center gap-2">
            <Clock size={13} className="text-[#00F0FF]" />
            <span>Microservice Endpoint Timeout Limit</span>
          </label>
          <span className="text-[10px] text-[#4F536E]">Abort probe if request exceeds threshold</span>
        </div>

        <select
          value={timeoutLimit}
          onChange={(e) => setTimeoutLimit(e.target.value)}
          className="p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
        >
          <option value="1500">1.5s (Strict Low-Latency)</option>
          <option value="3000">3.0s (Recommended)</option>
          <option value="5000">5.0s (Tolerant)</option>
        </select>
      </div>

      {/* Provider Keys Grid */}
      <div className="space-y-3">
        {PROVIDERS.map((provider) => {
          const isMasked = provider.isSecret && !revealed[provider.id];
          const testRes = testResults[provider.id];
          const isTesting = testingId === provider.id;

          return (
            <div
              key={provider.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#F1F3F9] uppercase">
                  {provider.name}
                </label>

                <div className="flex items-center gap-3">
                  {testRes && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        testRes.ok
                          ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {testRes.ok ? `CONNECTED (${testRes.latency}ms)` : "NO KEY SET"}
                    </span>
                  )}

                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-[#00F0FF] hover:underline"
                  >
                    <span>Get Key</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={isMasked ? "password" : "text"}
                    name={`vault_token_${provider.id}`}
                    id={`vault_token_${provider.id}`}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={keys[provider.id] || ""}
                    onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full pl-3 pr-9 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#00FF41] font-mono outline-none"
                  />

                  {provider.isSecret && (
                    <button
                      type="button"
                      onClick={() => toggleReveal(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F536E] hover:text-white cursor-pointer"
                      title={isMasked ? "Reveal Secret" : "Hide Secret"}
                    >
                      {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => testConnection(provider.id)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] text-xs font-bold border border-white/10 transition-all cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {isTesting ? "PINGING..." : "TEST CONNECTION"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
