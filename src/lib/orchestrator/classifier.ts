import type { AgentConfig, LlmClassifier, RoutingDecision } from "./types";
import { DEFAULT_AGENT } from "./registry";

/**
 * Rule-based classifier: first enabled agent whose keyword appears in the
 * prompt (case-insensitive) wins. Deterministic — the basis for snapshot tests.
 */
export function classifyByRules(prompt: string, agents: AgentConfig[]): RoutingDecision | null {
  const lower = prompt.toLowerCase();
  for (const agent of agents) {
    if (!agent.enabled) continue;
    for (const keyword of agent.keywords) {
      if (keyword && lower.includes(keyword.toLowerCase())) {
        return {
          agentType: agent.agentType,
          reasoning: `keyword "${keyword}" matched in prompt`,
          source: "rules",
        };
      }
    }
  }
  return null;
}

/**
 * Full routing: rules first, then optional LLM fallback, then the default agent.
 * `llmClassifier` is injectable so tests can mock it; when absent, rules-only.
 */
export async function routePrompt(
  prompt: string,
  agents: AgentConfig[],
  llmClassifier?: LlmClassifier
): Promise<RoutingDecision> {
  const byRules = classifyByRules(prompt, agents);
  if (byRules) return byRules;

  if (llmClassifier) {
    try {
      const byLlm = await llmClassifier(prompt, agents);
      if (byLlm) return byLlm;
    } catch {
      // LLM fallback failure degrades to the default agent, never errors the request.
    }
  }

  return {
    agentType: DEFAULT_AGENT,
    reasoning: "no rule matched and no LLM fallback available — defaulted to master agent",
    source: "fallback",
  };
}
