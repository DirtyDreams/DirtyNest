"use client";

import { useState } from "react";
import {
  Cpu,
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  DollarSign,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ModelQuota {
  id: string;
  name: string;
  provider: string;
  usedTokens: number;
  maxTokens: number;
  rpmUsed: number;
  rpmLimit: number;
  cost: number;
  color: string;
}

const INITIAL_MODELS: ModelQuota[] = [
  {
    id: "gemini",
    name: "Gemini 2.5 Pro",
    provider: "Google Cloud",
    usedTokens: 684000,
    maxTokens: 1000000,
    rpmUsed: 42,
    rpmLimit: 120,
    cost: 1.84,
    color: "#00FF41",
  },
  {
    id: "claude",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    usedTokens: 412000,
    maxTokens: 800000,
    rpmUsed: 28,
    rpmLimit: 60,
    cost: 3.29,
    color: "#00F0FF",
  },
  {
    id: "gpt4o",
    name: "GPT-4o Omnimodal",
    provider: "OpenAI",
    usedTokens: 290000,
    maxTokens: 500000,
    rpmUsed: 19,
    rpmLimit: 50,
    cost: 2.15,
    color: "#BF40FF",
  },
  {
    id: "deepseek",
    name: "DeepSeek R1",
    provider: "Local/Ollama",
    usedTokens: 920000,
    maxTokens: 2000000,
    rpmUsed: 65,
    rpmLimit: 200,
    cost: 0.12,
    color: "#FFB800",
  },
];

export default function AiAgentQuotaWidget() {
  const [models, setModels] = useState<ModelQuota[]>(INITIAL_MODELS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalCost = models.reduce((acc, m) => acc + m.cost, 0).toFixed(2);
  const totalTokens = (
    models.reduce((acc, m) => acc + m.usedTokens, 0) / 1000000
  ).toFixed(2);

  const handleRefresh = () => {
    cyberAudio.play("click");
    setIsRefreshing(true);
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) => ({
          ...m,
          usedTokens: Math.min(
            m.maxTokens,
            m.usedTokens + Math.floor(Math.random() * 5000)
          ),
          rpmUsed: Math.floor(Math.random() * (m.rpmLimit * 0.8)),
        }))
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Zap size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              AI MODEL QUOTAS & BURNDOWN
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Multi-LLM Rate Limits & Cost Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-white/5 text-[10px]">
            <span className="text-[#4F536E]">EST. BURN:</span>
            <span className="text-[#FFB800] font-bold">${totalCost}</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
            title="Refresh LLM Quotas"
          >
            <RotateCcw size={13} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Model Burndown Bars */}
      <div className="space-y-3 pt-1">
        {models.map((m) => {
          const pct = Math.round((m.usedTokens / m.maxTokens) * 100);
          const isHigh = pct > 75;

          return (
            <div
              key={m.id}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="font-bold text-[#F1F3F9] truncate">{m.name}</span>
                  <span className="text-[9px] text-[#4F536E] hidden sm:inline">
                    ({m.provider})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                  <span className="text-[#9499B3]">
                    {(m.usedTokens / 1000).toFixed(0)}k / {(m.maxTokens / 1000).toFixed(0)}k
                  </span>
                  <span
                    className="font-bold px-1.5 py-0.5 rounded text-[9px]"
                    style={{
                      backgroundColor: `${m.color}20`,
                      color: m.color,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: m.color,
                    boxShadow: `0 0 8px ${m.color}80`,
                  }}
                />
              </div>

              {/* Mini RPM stats row */}
              <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-0.5">
                <span>RPM: {m.rpmUsed} / {m.rpmLimit}</span>
                <span>Session: ${m.cost.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
