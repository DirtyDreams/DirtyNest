export interface AiModelConfig {
  id: string;
  name: string;
  provider: "Google" | "Anthropic" | "OpenAI" | "DeepSeek";
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  tpmQuota: number;
  rpmQuota: number;
  badgeColor: string;
}

export const AI_MODELS_REGISTRY: AiModelConfig[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextWindow: 1048576,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    tpmQuota: 4000000,
    rpmQuota: 360,
    badgeColor: "#00FF41",
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    tpmQuota: 200000,
    rpmQuota: 100,
    badgeColor: "#00F0FF",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o Omnimodal",
    provider: "OpenAI",
    contextWindow: 128000,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    tpmQuota: 3000000,
    rpmQuota: 500,
    badgeColor: "#BF40FF",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 Reasoning",
    provider: "DeepSeek",
    contextWindow: 64000,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.55,
    tpmQuota: 1000000,
    rpmQuota: 120,
    badgeColor: "#FFB800",
  },
];

export function calculateInferenceCost(tokens: number, modelId: string): number {
  const model = AI_MODELS_REGISTRY.find((m) => m.id === modelId) || AI_MODELS_REGISTRY[0]!;
  return (tokens / 1000000) * model.inputCostPer1M;
}
