"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Brain,
  Sliders,
  Database,
  Sparkles,
  Shield,
  Radio,
  Cpu,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
=======
import { Brain, Sliders, Database, Sparkles, Shield, Radio, Cpu, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { useHermesStore } from "@/lib/hermes/hermesStore";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";
import { HermesProvider, HermesSandboxMode } from "@/lib/hermes/types";

type SubSection = "model" | "memory" | "skills" | "hitl" | "gateway" | "subagents";

export default function HermesSettingsTab() {
  const { config, updateConfig, resetConfigToDefault } = useHermesStore();
  const [activeSection, setActiveSection] = useState<SubSection>("model");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    cyberAudio.play("chime");
    setSaved(true);
    toast.success("Hermes Config Saved", "Configuration persisted to local vault.");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    cyberAudio.play("click");
    resetConfigToDefault();
    toast.info("Hermes Config Reset", "Settings restored to factory defaults.");
  };

  return (
    <div className="flex flex-col gap-6 font-mono select-none animate-fade-in">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#00FF41]/30 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
                HERMES AGENT ENGINE MATRIX // <span className="text-[#00FF41]">NOUS RESEARCH 2026</span>
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                100% MASTER AI BRAIN
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Configure reasoning parameters, persistent memory FTS5, self-created skills & multi-platform gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#9499B3] hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>RESET</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            <Save size={13} />
            <span>{saved ? "CONFIG SAVED!" : "SAVE CONFIG"}</span>
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: "model" as const, label: "Inference & Model", icon: Sliders },
          { id: "memory" as const, label: "Persistent Memory (FTS5)", icon: Database },
          { id: "skills" as const, label: "Self-Created Skills", icon: Sparkles },
          { id: "hitl" as const, label: "Sandbox & Zero-Trust HITL", icon: Shield },
          { id: "gateway" as const, label: "Multi-Platform Gateways", icon: Radio },
          { id: "subagents" as const, label: "Subagent Swarm Limits", icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setActiveSection(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                  : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: INFERENCE & MODEL */}
      {activeSection === "model" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Inference Provider Backend
              </label>
              <select
                value={config.model.provider}
                onChange={(e) => updateConfig("model", { provider: e.target.value as HermesProvider })}
                className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
              >
                <option value="nous_portal">Nous Research Portal (Direct RPC)</option>
                <option value="openrouter">OpenRouter Multi-Provider Bridge</option>
                <option value="gemini">Google Gemini API Bridge</option>
                <option value="ollama">Local Ollama Hardware CUDA (Air-Gapped)</option>
                <option value="anthropic">Anthropic Claude Bridge</option>
                <option value="openai">OpenAI GPT Bridge</option>
                <option value="deepseek">DeepSeek Direct Engine</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Model Identifier
              </label>
              <input
                type="text"
                value={config.model.modelId}
                onChange={(e) => updateConfig("model", { modelId: e.target.value })}
                className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
              />
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Provider API Token / Secret
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                autoComplete="new-password"
                data-1p-ignore="true"
                value={config.model.apiKey}
                onChange={(e) => updateConfig("model", { apiKey: e.target.value })}
                placeholder="sk-nous-... or sk-or-v1-..."
                className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00FF41]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F536E] hover:text-white cursor-pointer"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Reasoning & Temperature Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9499B3]">Temperature</span>
                <span className="text-[#00FF41] font-bold">{config.model.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.model.temperature}
                onChange={(e) => updateConfig("model", { temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#00FF41] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9499B3]">Thinking Tokens Budget</span>
                <span className="text-[#BF40FF] font-bold">{config.model.maxReasoningTokens}</span>
              </div>
              <input
                type="range"
                min="1024"
                max="32768"
                step="1024"
                value={config.model.maxReasoningTokens}
                onChange={(e) => updateConfig("model", { maxReasoningTokens: parseInt(e.target.value) })}
                className="w-full accent-[#BF40FF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9499B3]">Context Limit</span>
                <span className="text-[#00F0FF] font-bold">{(config.model.contextWindowTokens / 1000).toFixed(0)}k tok</span>
              </div>
              <input
                type="range"
                min="16000"
                max="200000"
                step="8000"
                value={config.model.contextWindowTokens}
                onChange={(e) => updateConfig("model", { contextWindowTokens: parseInt(e.target.value) })}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PERSISTENT MEMORY & FTS5 */}
      {activeSection === "memory" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F1F3F9] block">SQLite FTS5 Virtual Table Indexing</span>
                <span className="text-[10px] text-[#4F536E]">Full-text search indexing across memory notes</span>
              </div>
              <input
                type="checkbox"
                checked={config.memory.fts5Enabled}
                onChange={(e) => updateConfig("memory", { fts5Enabled: e.target.checked })}
                className="w-4 h-4 accent-[#00FF41] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F1F3F9] block">Cosine Vector Embeddings</span>
                <span className="text-[10px] text-[#4F536E]">Sub-10ms semantic vector similarity recall</span>
              </div>
              <input
                type="checkbox"
                checked={config.memory.vectorIndexEnabled}
                onChange={(e) => updateConfig("memory", { vectorIndexEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Max Recall Depth per Query
              </label>
              <input
                type="number"
                value={config.memory.maxRecallCount}
                onChange={(e) => updateConfig("memory", { maxRecallCount: parseInt(e.target.value) || 5 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Auto-Prune Inactive Memories (Days)
              </label>
              <input
                type="number"
                value={config.memory.autoPruneAgeDays}
                onChange={(e) => updateConfig("memory", { autoPruneAgeDays: parseInt(e.target.value) || 30 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Automatic Memory Extraction
              </label>
              <div className="p-2 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#F1F3F9]">Auto-Ingest</span>
                <input
                  type="checkbox"
                  checked={config.memory.autoExtractMemories}
                  onChange={(e) => updateConfig("memory", { autoExtractMemories: e.target.checked })}
                  className="accent-[#00FF41] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SELF-CREATED SKILLS */}
      {activeSection === "skills" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F1F3F9] block">Autonomous Workflow Distillation</span>
                <span className="text-[10px] text-[#4F536E]">Automatically convert repeated successful tasks into named skills</span>
              </div>
              <input
                type="checkbox"
                checked={config.skills.autoAbstractSkills}
                onChange={(e) => updateConfig("skills", { autoAbstractSkills: e.target.checked })}
                className="w-4 h-4 accent-[#00FF41] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F1F3F9] block">Hermes Skills Hub Cloud Sync</span>
                <span className="text-[10px] text-[#4F536E]">Download and share community-verified skills</span>
              </div>
              <input
                type="checkbox"
                checked={config.skills.syncWithSkillsHub}
                onChange={(e) => updateConfig("skills", { syncWithSkillsHub: e.target.checked })}
                className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9499B3]">Minimum Success Rate to Abstract Skill</span>
                <span className="text-[#00FF41] font-bold">{config.skills.minSuccessRateThreshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                step="1"
                value={config.skills.minSuccessRateThreshold}
                onChange={(e) => updateConfig("skills", { minSuccessRateThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#00FF41] cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Min Executions Before Synthesis
              </label>
              <input
                type="number"
                value={config.skills.minInvocationsToDistill}
                onChange={(e) => updateConfig("skills", { minInvocationsToDistill: parseInt(e.target.value) || 3 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SANDBOX & ZERO-TRUST HITL */}
      {activeSection === "hitl" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div>
            <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
              Tool Execution Sandbox Environment
            </label>
            <select
              value={config.subagents.sandboxMode}
              onChange={(e) => updateConfig("subagents", { sandboxMode: e.target.value as HermesSandboxMode })}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
            >
              <option value="docker">Docker Container Sandbox (Network Boundary Isolated)</option>
              <option value="isolate">V8 Isolate In-Memory Runtime</option>
              <option value="ssh">Remote SSH Server Node</option>
              <option value="modal">Modal Serverless Cloud Sandbox</option>
              <option value="local">Local Direct Process (Developer Mode)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-[#4F536E] uppercase block">
              Human-In-The-Loop Clearance Interceptors
            </span>

            {[
              { key: "requireClearanceForFsWrite" as const, label: "File System Mutation (write_file, patch, rm)" },
              { key: "requireClearanceForDocker" as const, label: "Docker Socket & Container Management" },
              { key: "requireClearanceForShell" as const, label: "Terminal Command & Bash Execution" },
              { key: "requireClearanceForNetwork" as const, label: "External Network Probes & Port Scanners" },
            ].map((rule) => (
              <div
                key={rule.key}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
              >
                <span className="text-xs text-[#F1F3F9] font-bold">{rule.label}</span>
                <input
                  type="checkbox"
                  checked={config.hitl[rule.key]}
                  onChange={(e) => updateConfig("hitl", { [rule.key]: e.target.checked })}
                  className="w-4 h-4 accent-[#FFB800] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: MULTI-PLATFORM GATEWAY */}
      {activeSection === "gateway" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Telegram */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00F0FF]">Telegram Messaging Gateway</span>
                <input
                  type="checkbox"
                  checked={config.gateway.telegramEnabled}
                  onChange={(e) => updateConfig("gateway", { telegramEnabled: e.target.checked })}
                  className="accent-[#00F0FF] cursor-pointer"
                />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Telegram Bot API Token (e.g. 123456:ABC-DEF...)"
                value={config.gateway.telegramBotToken}
                onChange={(e) => updateConfig("gateway", { telegramBotToken: e.target.value })}
                disabled={!config.gateway.telegramEnabled}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-lg text-xs text-[#F1F3F9] font-mono outline-none disabled:opacity-30"
              />
            </div>

            {/* Discord */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#BF40FF]">Discord Webhook / Gateway Relay</span>
                <input
                  type="checkbox"
                  checked={config.gateway.discordEnabled}
                  onChange={(e) => updateConfig("gateway", { discordEnabled: e.target.checked })}
                  className="accent-[#BF40FF] cursor-pointer"
                />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Discord Webhook URL (https://discord.com/api/webhooks/...)"
                value={config.gateway.discordWebhookUrl}
                onChange={(e) => updateConfig("gateway", { discordWebhookUrl: e.target.value })}
                disabled={!config.gateway.discordEnabled}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-lg text-xs text-[#F1F3F9] font-mono outline-none disabled:opacity-30"
              />
            </div>

            {/* Slack */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00FF41]">Slack Bot & App Token</span>
                <input
                  type="checkbox"
                  checked={config.gateway.slackEnabled}
                  onChange={(e) => updateConfig("gateway", { slackEnabled: e.target.checked })}
                  className="accent-[#00FF41] cursor-pointer"
                />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Slack xoxb-... Bot Token"
                value={config.gateway.slackAppToken}
                onChange={(e) => updateConfig("gateway", { slackAppToken: e.target.value })}
                disabled={!config.gateway.slackEnabled}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-lg text-xs text-[#F1F3F9] font-mono outline-none disabled:opacity-30"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: SUBAGENT SWARM CONCURRENCY */}
      {activeSection === "subagents" && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Max Concurrent Subagents
              </label>
              <input
                type="number"
                min="1"
                max="32"
                value={config.subagents.maxConcurrentSubagents}
                onChange={(e) => updateConfig("subagents", { maxConcurrentSubagents: parseInt(e.target.value) || 4 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Subagent Token Budget
              </label>
              <input
                type="number"
                min="4000"
                max="128000"
                step="4000"
                value={config.subagents.subagentTokenLimit}
                onChange={(e) => updateConfig("subagents", { subagentTokenLimit: parseInt(e.target.value) || 16000 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-1">
                Max Delegation DAG Depth
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={config.subagents.maxDagDepth}
                onChange={(e) => updateConfig("subagents", { maxDagDepth: parseInt(e.target.value) || 3 })}
                className="w-full p-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
