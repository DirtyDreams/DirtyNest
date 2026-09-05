"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  Database,
  Key,
  RefreshCw,
  Download,
  Bot,
  Cpu,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cyberAudio } from "@/lib/cyberAudio";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [githubToken, setGithubToken] = useState("");
  const [pollInterval, setPollInterval] = useState("2.5");
  const [soundVolume, setSoundVolume] = useState("80");
  const [scanlinesActive, setScanlinesActive] = useState(false);

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
      toast.success("SYSTEM DIRECTIVE UPDATED", {
        description: "Your neural configurations have been saved successfully.",
      });
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
      const backup = {
        app: "DirtyNest",
        mode: "frontend-only",
        version: "2.4.0",
        exportDate: new Date().toISOString(),
        localStorage: typeof window !== "undefined" ? { ...localStorage } : {},
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest-frontend-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("SNAPSHOT CREATED", { description: "Frontend state export downloaded." });
    } catch {
      toast.error("EXPORT FAILED", { description: "Failed to export local frontend state." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#090B14] border-[#00FF41]/30 text-[#F1F3F9] font-mono p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
              <SettingsIcon size={16} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
                System Configuration & Parameters
              </DialogTitle>
              <p className="text-[10px] text-[#4F536E]">
                DIRTYNEST // CORE PARAMETERS & STORAGE
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs Control */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-black/40 px-3 h-10 gap-1">
            <TabsTrigger value="general" className="text-xs data-[state=active]:bg-[#00FF41]/20 data-[state=active]:text-[#00FF41]">
              <Sliders size={13} className="mr-1.5" /> General
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-[#00FF41]/20 data-[state=active]:text-[#00FF41]">
              <Bot size={13} className="mr-1.5" /> AI Core
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs data-[state=active]:bg-[#00FF41]/20 data-[state=active]:text-[#00FF41]">
              <Cpu size={13} className="mr-1.5" /> Swarm
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="text-xs data-[state=active]:bg-[#00FF41]/20 data-[state=active]:text-[#00FF41]">
              <Key size={13} className="mr-1.5" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-xs data-[state=active]:bg-[#00FF41]/20 data-[state=active]:text-[#00FF41]">
              <Database size={13} className="mr-1.5" /> Storage
            </TabsTrigger>
          </TabsList>

          <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
            {/* GENERAL */}
            <TabsContent value="general" className="space-y-4 mt-0">
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
                    <Button
                      key={opt.val}
                      type="button"
                      variant={pollInterval === opt.val ? "default" : "outline"}
                      onClick={() => setPollInterval(opt.val)}
                      className="text-xs h-9"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

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
                <Switch
                  checked={scanlinesActive}
                  onCheckedChange={toggleScanlines}
                />
              </div>
            </TabsContent>

            {/* AI CORE */}
            <TabsContent value="ai" className="space-y-4 mt-0">
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
            </TabsContent>

            {/* AGENTS */}
            <TabsContent value="agents" className="space-y-4 mt-0">
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
            </TabsContent>

            {/* API KEYS */}
            <TabsContent value="apikeys" className="space-y-3 mt-0">
              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Key size={13} className="text-[#00FF41]" />
                  <span>GitHub Personal Access Token (PAT)</span>
                </label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-[#07070B] border-white/10 text-xs text-[#F1F3F9] focus-visible:border-[#00FF41]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Key size={13} className="text-[#00F0FF]" />
                  <span>Google Gemini API Key</span>
                </label>
                <Input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-[#07070B] border-white/10 text-xs text-[#F1F3F9] focus-visible:border-[#00F0FF]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                  <Server size={13} className="text-[#FF2A6D]" />
                  <span>Local Ollama Endpoint URL</span>
                </label>
                <Input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="bg-[#07070B] border-white/10 text-xs text-[#F1F3F9] focus-visible:border-[#FF2A6D]/50"
                />
              </div>
            </TabsContent>

            {/* STORAGE */}
            <TabsContent value="storage" className="space-y-3 mt-0">
              <label className="text-[#9499B3] flex items-center gap-1.5 text-[11px] font-bold uppercase">
                <Database size={13} className="text-[#FFB800]" />
                <span>Storage & Backup Registry</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="w-full gap-2 text-xs border-white/10 hover:border-[#00FF41]/40 text-[#F1F3F9] hover:text-[#00FF41]"
                >
                  <Download size={14} />
                  <span>EXPORT JSON SNAPSHOT</span>
                </Button>
              </div>
            </TabsContent>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-black/40">
            <Badge variant="outline" className="text-[10px] text-[#4F536E] border-white/10">
              CONFIG VERSION 2.4.0
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-[#9499B3]"
              >
                DISMISS
              </Button>
              <Button
                size="sm"
                onClick={saveSettings}
                className="text-xs font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/30"
              >
                SAVE CONFIG
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
