/**
 * Hermes Agentic Engine — orchestrator types (F3).
 * Routing decision + agent registry shape shared by classifier, router, and API.
 */

export type AgentType =
  | "hermes"
  | "research"
  | "code"
  | "security"
  | "devops"
  | "social";

export type RoutingSource = "rules" | "llm" | "fallback";

export interface RoutingDecision {
  agentType: AgentType;
  reasoning: string;
  source: RoutingSource;
}

export interface AgentConfig {
  agentType: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  keywords: string[];
  toolWhitelist: string[];
  llmProvider: string;
  llmModel: string;
  enabled: boolean;
}

/** LLM fallback classifier signature — injectable for tests. */
export type LlmClassifier = (prompt: string, agents: AgentConfig[]) => Promise<RoutingDecision | null>;
