import { eq } from "drizzle-orm";
import type { AgentConfig, AgentType } from "./types";
import { db } from "@/lib/db";
import { agentConfigs } from "@/lib/schema";

const DEFAULT_AGENT: AgentType = "hermes";

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function toAgentConfig(row: typeof agentConfigs.$inferSelect): AgentConfig {
  return {
    agentType: row.agent_type as AgentType,
    name: row.name,
    description: row.description,
    systemPrompt: row.system_prompt,
    keywords: parseJsonArray(row.keywords),
    toolWhitelist: parseJsonArray(row.tool_whitelist),
    llmProvider: row.llm_provider,
    llmModel: row.llm_model,
    enabled: row.enabled === 1,
  };
}

/** Load all enabled agent configs from the DB, ordered by id. */
export async function loadAgents(): Promise<AgentConfig[]> {
  const rows = await db.select().from(agentConfigs).orderBy(agentConfigs.id);
  return rows.map(toAgentConfig);
}

/** Load a single agent config by type, or null if missing/disabled. */
export async function loadAgent(agentType: AgentType): Promise<AgentConfig | null> {
  const rows = await db.select().from(agentConfigs).where(eq(agentConfigs.agent_type, agentType)).limit(1);
  const row = rows[0];
  if (!row || row.enabled !== 1) return null;
  return toAgentConfig(row);
}

export { DEFAULT_AGENT };
