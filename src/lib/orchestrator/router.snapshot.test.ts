import { describe, it, expect } from "vitest";
import { routePrompt } from "./classifier";
import type { AgentConfig } from "./types";

const agents: AgentConfig[] = [
  {
    agentType: "hermes",
    name: "Hermes",
    description: "master",
    systemPrompt: "",
    keywords: ["hermes", "master", "koordynuj"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
  {
    agentType: "research",
    name: "Research",
    description: "research",
    systemPrompt: "",
    keywords: ["research", "zbadaj", "sources", "deep dive", "raport"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
  {
    agentType: "code",
    name: "Code",
    description: "code",
    systemPrompt: "",
    keywords: ["code", "kod", "typescript", "bug", "refactor"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
  {
    agentType: "security",
    name: "Security",
    description: "security",
    systemPrompt: "",
    keywords: ["security", "cve", "bezpieczeństwo", "audyt", "firewall"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
  {
    agentType: "devops",
    name: "DevOps",
    description: "devops",
    systemPrompt: "",
    keywords: ["docker", "deploy", "kontener", "kubernetes", "stack"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
  {
    agentType: "social",
    name: "Social",
    description: "social",
    systemPrompt: "",
    keywords: ["social", "post", "twitter", "instagram", "publikacja"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
];

// Deterministic snapshot: 10 prompts → expected agent. Guards against
// regressions in keyword routing (F3b acceptance criterion 3).
const snapshot: Array<[string, string]> = [
  ["zbadaj najnowsze badania o AI i podaj źródła", "research"],
  ["napisz funkcję w typescript", "code"],
  ["sprawdź podatności CVE w systemie", "security"],
  ["wdróż kontener docker na serwer", "devops"],
  ["opublikuj post na twitter", "social"],
  ["koordynuj zadania zespołu", "hermes"],
  ["deep dive w raport o zmianach klimatu", "research"],
  ["zrefaktoruj ten bug w kodzie", "code"],
  ["audyt bezpieczeństwa firewalla", "security"],
  ["skonfiguruj kubernetes stack", "devops"],
];

describe("router snapshot (10 deterministic prompts)", () => {
  it.each(snapshot)("routes %j to %s", async (prompt, expected) => {
    const decision = await routePrompt(prompt, agents);
    expect(decision.agentType).toBe(expected);
    expect(decision.source).toBe("rules");
  });
});
