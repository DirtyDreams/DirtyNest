/**
 * Hermes Agent Standard Specification (Nous Research, 2026)
 * Strict TypeScript types for ACP Protocol, Persistent Memory,
 * Self-Created Skills, Tool Sandbox, and Multi-Platform Gateways.
 */

export type HermesProvider =
  | "nous_portal"
  | "openrouter"
  | "ollama"
  | "anthropic"
  | "openai"
  | "deepseek"
  | "gemini";

export type HermesSandboxMode = "docker" | "isolate" | "ssh" | "modal" | "local";

export type HermesMemoryCategory = "decision" | "preference" | "fact" | "workflow";

export type HermesToolRisk = "low" | "medium" | "critical";

export interface HermesModelConfig {
  provider: HermesProvider;
  modelId: string;
  apiKey: string;
  endpointUrl?: string;
  contextWindowTokens: number;
  temperature: number;
  topP: number;
  maxReasoningTokens: number;
  enableThinkingTrace: boolean;
}

export interface HermesMemoryConfig {
  fts5Enabled: boolean;
  vectorIndexEnabled: boolean;
  maxRecallCount: number;
  memoryDecayRate: number;
  autoPruneAgeDays: number;
  autoExtractMemories: boolean;
}

export interface HermesSkillsConfig {
  autoAbstractSkills: boolean;
  minSuccessRateThreshold: number;
  minInvocationsToDistill: number;
  syncWithSkillsHub: boolean;
  autoDiscoverMcp: boolean;
}

export interface HermesHitlPolicy {
  autoApproveLowRisk: boolean;
  requireClearanceForFsWrite: boolean;
  requireClearanceForDocker: boolean;
  requireClearanceForShell: boolean;
  requireClearanceForNetwork: boolean;
  sessionTokenBudgetCeiling: number;
}

export interface HermesGatewayConfig {
  telegramEnabled: boolean;
  telegramBotToken: string;
  discordEnabled: boolean;
  discordWebhookUrl: string;
  slackEnabled: boolean;
  slackAppToken: string;
  cliSocketActive: boolean;
  enableWebhooks: boolean;
}

export interface HermesSubagentConfig {
  maxConcurrentSubagents: number;
  subagentTokenLimit: number;
  sandboxMode: HermesSandboxMode;
  maxDagDepth: number;
}

export interface HermesFullConfig {
  model: HermesModelConfig;
  memory: HermesMemoryConfig;
  skills: HermesSkillsConfig;
  hitl: HermesHitlPolicy;
  gateway: HermesGatewayConfig;
  subagents: HermesSubagentConfig;
}

export interface HermesMemoryItem {
  id: string;
  title: string;
  category: HermesMemoryCategory;
  content: string;
  timestamp: string;
  recalls: number;
  pinned: boolean;
  confidence: number;
  tags: string[];
}

export interface HermesSkillDefinition {
  id: string;
  name: string;
  slug: string;
  category: "Security" | "Code" | "DevOps" | "Research" | "Automation";
  description: string;
  author: string;
  version: string;
  invocations: number;
  successRate: number;
  tags: string[];
  requiresHitl: boolean;
}

export interface HermesToolDefinition {
  id: string;
  name: string;
  description: string;
  category: "Storage" | "Network" | "Runtime" | "Database" | "Web" | "VCS";
  risk: HermesToolRisk;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

export interface HermesAcpEvent {
  id: string;
  timestamp: string;
  type: "THOUGHT" | "TOOL_CALL" | "TOOL_RESPONSE" | "GATE_REQUEST" | "GATE_APPROVAL" | "OUTPUT";
  content: string;
  metadata?: Record<string, unknown>;
}
