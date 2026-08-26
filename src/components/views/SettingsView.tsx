"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  Bot,
  Cpu,
  Key,
  Database,
  Volume2,
  Shield,
  RefreshCw,
  Check,
  Download,
  Upload,
  Trash2,
  Palette,
  Sparkles,
  Server,
  Zap,
  Globe,
  Lock,
  Activity,
} from "lucide-react";
import { applyThemePreset, getAllThemes, deleteCustomTheme, type ThemePreset } from "@/lib/theme";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";
import SystemDiagnosticsTab from "./settings/SystemDiagnosticsTab";

type SettingsSection = "general" | "ai" | "agents" | "apikeys" | "storage" | "diagnostics";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsSection>("general");
  const toast = useToast();

  // General settings
  const [pollInterval, setPollInterval] = useState("2.5");
  const [soundVolume, setSoundVolume] = useState("80");
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [activeTheme, setActiveTheme] = useState("matrix");
  const [themeList, setThemeList] = useState<any[]>([]);

  // AI settings
  const [defaultAiModel, setDefaultAiModel] = useState("gemini-2.5-pro");
  const [defaultTemperature, setDefaultTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are DirtyNest Cyber-Intelligence Core, a high-performance terminal AI with full system observability, devtool mastery, and defensive cybersecurity capabilities."
  );

  // Agent Swarm settings
  const [maxConcurrency, setMaxConcurrency] = useState(8);
  const [autoRetry, setAutoRetry] = useState(true);
  const [agentTimeout, setAgentTimeout] = useState(30);

  // API Keys
  const [geminiKey, setGeminiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [githubToken, setGithubToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const refreshThemeList = () => {
    try {
      const all = getAllThemes();
      setThemeList(all);
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("dirtynest_theme");
        if (saved) setActiveTheme(saved);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshThemeList();

    const handleThemeApplied = (e: CustomEvent<ThemePreset>) => {
      if (e.detail?.id) setActiveTheme(e.detail.id);
    };
    const handleThemeListUpdated = () => {
      refreshThemeList();
    };

    window.addEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
    window.addEventListener("dirtynest-themes-list-updated" as any, handleThemeListUpdated);

    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        setGithubToken(localStorage.getItem("dirtynest_gh_token") || "");
        setPollInterval(localStorage.getItem("dirtynest_poll_interval") || "2.5");
        setGeminiKey(localStorage.getItem("dirtynest_gemini_key") || "");
        setAnthropicKey(localStorage.getItem("dirtynest_anthropic_key") || "");
        setOpenaiKey(localStorage.getItem("dirtynest_openai_key") || "");
        setDeepseekKey(localStorage.getItem("dirtynest_deepseek_key") || "");
        setOllamaUrl(localStorage.getItem("dirtynest_ollama_url") || "http://localhost:11434");
        if (typeof document !== "undefined" && document.body) {
          setScanlinesActive(document.body.classList.contains("scan-overlay"));
        }
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("dirtynest-theme-applied" as any, handleThemeApplied);
      window.removeEventListener("dirtynest-themes-list-updated" as any, handleThemeListUpdated);
    };
  }, []);

  const saveAllSettings = () => {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem("dirtynest_gh_token", githubToken);
        localStorage.setItem("dirtynest_poll_interval", pollInterval);
        localStorage.setItem("dirtynest_gemini_key", geminiKey);
        localStorage.setItem("dirtynest_anthropic_key", anthropicKey);
        localStorage.setItem("dirtynest_openai_key", openaiKey);
        localStorage.setItem("dirtynest_deepseek_key", deepseekKey);
        localStorage.setItem("dirtynest_ollama_url", ollamaUrl);
      }
      cyberAudio.play("toggle");
      toast.success("SYSTEM DIRECTIVE UPDATED", "Your neural configurations have been saved successfully.");
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

  const handleThemeChange = (themeId: any) => {
    setActiveTheme(themeId);
    applyThemePreset(themeId);
    cyberAudio.play("click");
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
        config: {
          pollInterval,
          defaultAiModel,
          defaultTemperature,
          maxConcurrency,
        },
        data: { todos, notes, links, events },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest-system-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export database snapshot");
    }
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.app || data.app !== "DirtyNest") {
        toast.error("INVALID BACKUP", "The selected file is not a valid DirtyNest backup.");
        return;
      }

      cyberAudio.play("toggle");
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("RESTORE COMPLETE", "Backup restored successfully. Please refresh.");
        if (data.config) {
          if (data.config.pollInterval) localStorage.setItem("dirtynest_poll_interval", data.config.pollInterval);
          if (data.config.defaultAiModel) setDefaultAiModel(data.config.defaultAiModel);
          if (data.config.defaultTemperature) setDefaultTemperature(data.config.defaultTemperature);
          if (data.config.maxConcurrency) setMaxConcurrency(data.config.maxConcurrency);
        }
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("RESTORE FAILED", "Database restore encountered an error.");
      }
    } catch (err) {
      console.error(err);
      toast.error("RESTORE ERROR", "Failed to parse backup file.");
    }
  };

  const tabs = [
    { id: "general", label: "General & HUD", icon: Sliders, tag: "CORE" },
    { id: "ai", label: "AI & Chatbot", icon: Bot, tag: "NEURAL" },
    { id: "agents", label: "Agent Swarm", icon: Cpu, tag: "SWARM" },
    { id: "apikeys", label: "API Keys & Mesh", icon: Key, tag: "AUTH" },
    { id: "storage", label: "Storage & Backup", icon: Database, tag: "SQL" },
    { id: "diagnostics", label: "Self-Diagnostics", icon: Activity, tag: "BENCH" },
  ];

  return (
    <div className="flex flex-col gap-5 font-mono animate-fade-in pb-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 cyber-card bg-[#07070B]/90 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <SettingsIcon size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-[#F1F3F9] uppercase">
                System Configuration & Parameters
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
                PROPER CONFIG MATRIX
              </span>
            </div>
            <p className="text-[11px] text-[#4F536E]">
              DIRTYNEST v2.4.0 // COMPLETE HARDWARE, AI, AGENT & STORAGE PREFERENCES
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={saveAllSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.2)]"
          >
            <Sparkles size={14} />
            <span>SAVE ALL PARAMETERS</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Vertical Section Selector */}
        <div className="lg:col-span-1 flex flex-col gap-1.5 p-2 rounded-2xl cyber-card bg-[#07070B]/90 border border-white/10">
          <div className="text-[10px] uppercase font-bold text-[#4F536E] px-3 py-2">
            Settings Categories
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as SettingsSection);
                  cyberAudio.play("click");
                }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                    : "text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#4F536E]">
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Active Panel */}
        <div className="lg:col-span-3 cyber-card bg-[#07070B]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={16} />
                  <span>General & Display Operations</span>
                </h3>
              </div>

              {/* Polling Interval */}
              <div className="space-y-2">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <RefreshCw size={14} className="text-[#00F0FF]" />
                  <span>Hardware Telemetry Polling Rate</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "1.0s (Hyper Real-time)", val: "1.0" },
                    { label: "2.5s (Balanced)", val: "2.5" },
                    { label: "5.0s (Eco Low CPU)", val: "5.0" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setPollInterval(opt.val)}
                      className={`p-3 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                        pollInterval === opt.val
                          ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-bold shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                          : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Themes Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                    <Palette size={14} className="text-[#BF40FF]" />
                    <span>Cyber Colorway Palette ({themeList.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play("click");
                      window.dispatchEvent(new CustomEvent("dirtynest-open-theme-studio"));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>THEME STUDIO & CREATOR</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {themeList.map((th) => {
                    const isSelected = activeTheme === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => handleThemeChange(th.id)}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/10 border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                            : "bg-white/[0.02] border-white/5 text-[#9499B3] hover:bg-white/5 hover:border-white/15"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${th.bgDeep} 0%, rgba(20,20,35,0.6) 100%)`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="font-bold truncate"
                              style={{ color: isSelected ? th.primary : "#F1F3F9" }}
                            >
                              {th.name}
                            </span>
                            {isSelected && (
                              <span
                                className="text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0"
                                style={{ background: `${th.primary}25`, color: th.primary }}
                              >
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {th.isCustom && (
                              <button
                                type="button"
                                title="Delete custom theme"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cyberAudio.play("click");
                                  if (confirm(`Delete custom theme "${th.name}"?`)) {
                                    deleteCustomTheme(th.id);
                                    refreshThemeList();
                                  }
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-[#9499B3] hover:text-[#FF2A6D] transition-colors"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color Pips */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ background: th.primary }}
                            title={`Primary: ${th.primary}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ background: th.secondary }}
                            title={`Secondary: ${th.secondary}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ background: th.accent }}
                            title={`Accent: ${th.accent}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/15"
                            style={{ background: th.bgDeep }}
                            title={`Abyss: ${th.bgDeep}`}
                          />
                          <span className="text-[9px] text-[#4F536E] ml-auto uppercase font-mono">
                            {th.isCustom ? "Custom" : "Built-in"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRT Scanlines Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-xs font-bold text-[#F1F3F9] uppercase">
                    CRT Phosphor Raster Scanlines
                  </div>
                  <p className="text-[11px] text-[#4F536E] mt-0.5">
                    Overlay retro CRT beam lines across the viewport
                  </p>
                </div>
                <button
                  onClick={() => toggleScanlines(!scanlinesActive)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scanlinesActive
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                      : "bg-white/5 text-[#9499B3] border border-white/10"
                  }`}
                >
                  {scanlinesActive ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            </div>
          )}

          {/* AI & CHATBOT TAB */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                  <Bot size={16} />
                  <span>AI & Neural Chatbot Parameters</span>
                </h3>
              </div>

              {/* Default Model */}
              <div className="space-y-2">
                <label className="text-xs text-[#9499B3] uppercase font-bold">
                  Default Reasoning Model
                </label>
                <select
                  value={defaultAiModel}
                  onChange={(e) => setDefaultAiModel(e.target.value)}
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#00FF41] outline-none"
                >
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Google DeepMind - Recommended)</option>
                  <option value="claude-3.7-sonnet">Claude 3.7 Sonnet (Anthropic)</option>
                  <option value="gpt-4o">GPT-4o Omniscience (OpenAI)</option>
                  <option value="deepseek-r1">DeepSeek R1 (DeepSeek Reasoning)</option>
                  <option value="llama-3.3-70b">Llama 3.3 70B (Local Ollama Air-gapped)</option>
                </select>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#9499B3]">
                  <span>DEFAULT REASONING TEMPERATURE</span>
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

              {/* System Instructions */}
              <div className="space-y-2">
                <label className="text-xs text-[#9499B3] uppercase font-bold">
                  Core AI System Persona & Instructions
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[#040406] border border-white/10 rounded-xl p-3 text-xs text-[#F1F3F9] outline-none focus:border-[#00F0FF] resize-none"
                />
              </div>
            </div>
          )}

          {/* AGENTS TAB */}
          {activeTab === "agents" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-[#BF40FF] uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={16} />
                  <span>Autonomous Swarm Fleet Governance</span>
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#9499B3]">
                  <span>MAX SWARM CONCURRENCY THREADS</span>
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

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-xs font-bold text-[#F1F3F9] uppercase">
                    Auto-Healing & Autonomous Retry
                  </div>
                  <p className="text-[11px] text-[#4F536E] mt-0.5">
                    Automatically restart subagents on unhandled IPC exceptions
                  </p>
                </div>
                <button
                  onClick={() => setAutoRetry(!autoRetry)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    autoRetry
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                      : "bg-white/5 text-[#9499B3] border border-white/10"
                  }`}
                >
                  {autoRetry ? "ACTIVE" : "DISABLED"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#9499B3] uppercase font-bold">
                  Task Execution Timeout (Seconds)
                </label>
                <input
                  type="number"
                  value={agentTimeout}
                  onChange={(e) => setAgentTimeout(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]"
                />
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === "apikeys" && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-2">
                  <Key size={16} />
                  <span>API Secrets & Mesh Credentials</span>
                </h3>
              </div>

              {/* GitHub PAT */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <Lock size={13} className="text-[#00FF41]" />
                  <span>GitHub Personal Access Token (PAT)</span>
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Gemini Key */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <Lock size={13} className="text-[#00F0FF]" />
                  <span>Google Gemini API Key</span>
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Anthropic Key */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <Lock size={13} className="text-[#BF40FF]" />
                  <span>Anthropic Claude API Key</span>
                </label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]"
                />
              </div>

              {/* OpenAI Key */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <Lock size={13} className="text-[#00FF41]" />
                  <span>OpenAI API Key</span>
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Ollama Base URL */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9499B3] uppercase font-bold flex items-center gap-2">
                  <Server size={13} className="text-[#FF2A6D]" />
                  <span>Local Ollama Endpoint URL</span>
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-[#040406] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1F3F9] outline-none focus:border-[#FF2A6D]"
                />
              </div>
            </div>
          )}

          {/* STORAGE TAB */}
          {activeTab === "storage" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
                  <Database size={16} />
                  <span>SQLite Storage & Database Registry</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#040406] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#4F536E]">DB ENGINE</span>
                  <div className="text-xs font-bold text-[#00FF41] mt-0.5">SQLite 3 (WAL)</div>
                </div>
                <div className="p-3 bg-[#040406] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#4F536E]">DATABASE SIZE</span>
                  <div className="text-xs font-bold text-[#00F0FF] mt-0.5">128 KB</div>
                </div>
                <div className="p-3 bg-[#040406] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#4F536E]">SCHEMA TABLES</span>
                  <div className="text-xs font-bold text-[#BF40FF] mt-0.5">4 Tables</div>
                </div>
                <div className="p-3 bg-[#040406] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#4F536E]">INTEGRITY CHECK</span>
                  <div className="text-xs font-bold text-[#00FF41] mt-0.5">PASSED (0 ERR)</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs text-[#9499B3] uppercase font-bold">
                  Backup & Disaster Recovery
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={exportData}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer font-bold text-xs"
                  >
                    <Download size={15} />
                    <span>EXPORT COMPLETE JSON SNAPSHOT</span>
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 transition-all cursor-pointer font-bold text-xs">
                    <Upload size={15} />
                    <span>IMPORT JSON SNAPSHOT</span>
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* DIAGNOSTICS & BENCHMARK SUITE */}
          {activeTab === "diagnostics" && <SystemDiagnosticsTab />}
        </div>
      </div>
    </div>
  );
}
