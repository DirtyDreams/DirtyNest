"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  X,
  Shield,
  Volume2,
  Sliders,
  Database,
  Key,
  RefreshCw,
  Check,
  Download,
  Trash2,
  Bot,
  Cpu,
  Palette,
  Server,
  Lock,
} from "lucide-react";
import { applyThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = "general" | "ai" | "agents" | "apikeys" | "storage";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("general");
  const toast = useToast();
  const [githubToken, setGithubToken] = useState("");
  const [pollInterval, setPollInterval] = useState("2.5");
  const [soundVolume, setSoundVolume] = useState("80");
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // AI & Agents
  const [defaultAiModel, setDefaultAiModel] = useState("gemini-2.5-pro");
  const [defaultTemperature, setDefaultTemperature] = useState(0.7);
  const [maxConcurrency, setMaxConcurrency] = useState(8);
  const [geminiKey, setGeminiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        setGithubToken(localStorage.getItem("dirtynest_gh_token") || "");
        setPollInterval(localStorage.getItem("dirtynest_poll_interval") || "2.5");
        setGeminiKey(localStorage.getItem("dirtynest_gemini_key") || "");
        setAnthropicKey(localStorage.getItem("dirtynest_anthropic_key") || "");
        setOpenaiKey(localStorage.getItem("dirtynest_openai_key") || "");
        setOllamaUrl(localStorage.getItem("dirtynest_ollama_url") || "http://localhost:11434");
        if (typeof document !== "undefined" && document.body) {
          setScanlinesActive(document.body.classList.contains("scan-overlay"));
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSettings = () => {
    try {
      cyberAudio.play("toggle");
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem("dirtynest_gh_token", githubToken);
        localStorage.setItem("dirtynest_poll_interval", pollInterval);
        localStorage.setItem("dirtynest_gemini_key", geminiKey);
        localStorage.setItem("dirtynest_anthropic_key", anthropicKey);
        localStorage.setItem("dirtynest_openai_key", openaiKey);
        localStorage.setItem("dirtynest_ollama_url", ollamaUrl);
      }
      toast.success("SYSTEM DIRECTIVE UPDATED", "Your neural configurations have been saved successfully.");
      setTimeout(() => onClose(), 800);
    } catch {
      // ignore
    }
  };

  const toggleScanlines = (active: boolean) => {
    setScanlinesActive(active);
    cyberAudio.play("click");
    try {
      if (typeof document !== "undefined" && document.body) {
        if (active) {
          document.body.classList.add("scan-overlay");
        } else {
          document.body.classList.remove("scan-overlay");
        }
      }
    } catch {
      // ignore
    }
  };

  const exportData = async () => {
    cyberAudio.play("click");
    try {
      const [todos, notes, links, events] = await Promise.all([
        fetch("/api/todos").then((r) => r.json()),
        fetch("/api/notes").then((r) => r.json()),
        fetch("/api/quick-links").then((r) => r.json()),
        fetch("/api/calendar").then((r) => r.json()),
      ]);

      const backup = {
        app: "DirtyNest",
        version: "2.4.0",
        exportDate: new Date().toISOString(),
        data: { todos, notes, links, events },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export database");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Sliders },
    { id: "ai", label: "AI Core", icon: Bot },
    { id: "agents", label: "Swarm", icon: Cpu },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "storage", label: "Storage", icon: Database },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col cyber-card overflow-hidden animate-fade-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
        style={{
          border: "1px solid rgba(0, 255, 65, 0.3)",
          background: "rgba(11, 12, 20, 0.96)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
              <SettingsIcon size={16} />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[#F1F3F9] uppercase tracking-wider">
                System Configuration & Parameters
              </h2>
              <p className="text-[10px] font-mono text-[#4F536E]">
                DIRTYNEST // CORE PARAMETERS & STORAGE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#9499B3] hover:text-[#FF2A6D] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center border-b border-white/5 bg-black/20 px-3 overflow-x-auto scrollbar-none text-[11px] font-mono shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ModalTab);
                  cyberAudio.play("click");
                }}
                className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#00FF41] text-[#00FF41] font-bold bg-white/[0.02]"
                    : "border-transparent text-[#9499B3] hover:text-[#F1F3F9]"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto font-mono text-xs">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Telemetry Polling */}
              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <RefreshCw size={13} className="text-[#00F0FF]" />
                  <span>Hardware Telemetry Polling Cadence</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "1.0s (Hyper)", val: "1.0" },
                    { label: "2.5s (Balanced)", val: "2.5" },
                    { label: "5.0s (Eco)", val: "5.0" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setPollInterval(opt.val)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        pollInterval === opt.val
                          ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold"
                          : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Scanline Effect */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-[11px] font-bold text-[#F1F3F9] uppercase flex items-center gap-1.5">
                    <Sliders size={13} className="text-[#BF40FF]" />
                    <span>CRT Matrix Scanline Raster</span>
                  </div>
                  <p className="text-[10px] text-[#4F536E] mt-0.5">
                    Simulate retro CRT phosphor scanlines across viewport
                  </p>
                </div>
                <button
                  onClick={() => toggleScanlines(!scanlinesActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scanlinesActive
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                      : "bg-white/5 text-[#9499B3]"
                  }`}
                >
                  {scanlinesActive ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#9499B3] text-[11px] font-bold uppercase">
                  Default Reasoning Model
                </label>
                <select
                  value={defaultAiModel}
                  onChange={(e) => setDefaultAiModel(e.target.value)}
                  className="w-full bg-[#07070B] border border-white/10 rounded-xl px-3 py-2 text-[#00FF41] outline-none text-xs"
                >
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Google DeepMind)</option>
                  <option value="claude-3.7-sonnet">Claude 3.7 Sonnet (Anthropic)</option>
                  <option value="gpt-4o">GPT-4o Omniscience (OpenAI)</option>
                  <option value="deepseek-r1">DeepSeek R1 (DeepSeek Reasoning)</option>
                  <option value="llama-3.3-70b">Llama 3.3 70B (Local Ollama)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[#9499B3] text-[11px] font-bold">
                  <span>TEMPERATURE</span>
                  <span className="text-[#00FF41]">{defaultTemperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={defaultTemperature}
                  onChange={(e) => setDefaultTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#00FF41] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* AGENTS TAB */}
          {activeTab === "agents" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#9499B3] text-[11px] font-bold">
                  <span>MAX SWARM CONCURRENCY</span>
                  <span className="text-[#BF40FF]">{maxConcurrency} WORKERS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  step="1"
                  value={maxConcurrency}
                  onChange={(e) => setMaxConcurrency(parseInt(e.target.value))}
                  className="w-full accent-[#BF40FF] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === "apikeys" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Key size={13} className="text-[#00FF41]" />
                  <span>GitHub Personal Access Token (PAT)</span>
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#07070B] rounded-xl px-3 py-2 text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Key size={13} className="text-[#00F0FF]" />
                  <span>Google Gemini API Key</span>
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#07070B] rounded-xl px-3 py-2 text-[#F1F3F9] border border-white/10 focus:border-[#00F0FF] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Server size={13} className="text-[#FF2A6D]" />
                  <span>Local Ollama Endpoint URL</span>
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-[#07070B] rounded-xl px-3 py-2 text-[#F1F3F9] border border-white/10 focus:border-[#FF2A6D] outline-none"
                />
              </div>
            </div>
          )}

          {/* STORAGE TAB */}
          {activeTab === "storage" && (
            <div className="space-y-3">
              <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                <Database size={13} className="text-[#FFB800]" />
                <span>Storage & Backup Registry</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportData}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#F1F3F9] hover:text-[#00FF41] transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>EXPORT JSON SNAPSHOT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-black/30">
          {savedMessage ? (
            <span className="text-[11px] font-mono text-[#00FF41] flex items-center gap-1">
              <Check size={13} />
              <span>PARAMETERS APPLIED</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#4F536E]">
              CONFIG VERSION 2.4.0
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#9499B3] hover:text-[#F1F3F9]"
            >
              DISMISS
            </button>
            <button
              onClick={saveSettings}
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer"
            >
              SAVE CONFIG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
