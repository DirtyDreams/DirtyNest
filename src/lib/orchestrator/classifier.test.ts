import { describe, it, expect, vi } from "vitest";
import { classifyByRules, routePrompt } from "./classifier";
import type { AgentConfig } from "./types";

const agents: AgentConfig[] = [
  {
    agentType: "hermes",
    name: "Hermes",
    description: "master",
    systemPrompt: "",
    keywords: ["hermes", "master"],
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
    keywords: ["research", "zbadaj", "sources"],
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
    keywords: ["code", "kod", "typescript"],
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
    keywords: ["security", "cve", "bezpieczeństwo"],
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
    keywords: ["docker", "deploy", "kontener"],
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
    keywords: ["social", "post", "twitter"],
    toolWhitelist: [],
    llmProvider: "ollama",
    llmModel: "llama3",
    enabled: true,
  },
];

describe("classifyByRules", () => {
  it("routes research keywords to the research agent", () => {
    const d = classifyByRules("Zbadaj temat i podaj źródła", agents);
    expect(d?.agentType).toBe("research");
    expect(d?.source).toBe("rules");
  });

  it("routes code keywords to the code agent", () => {
    const d = classifyByRules("napisz kod w typescript", agents);
    expect(d?.agentType).toBe("code");
  });

  it("routes security keywords to the security agent", () => {
    const d = classifyByRules("check this CVE vulnerability", agents);
    expect(d?.agentType).toBe("security");
  });

  it("routes devops keywords to the devops agent", () => {
    const d = classifyByRules("restart the docker container", agents);
    expect(d?.agentType).toBe("devops");
  });

  it("routes social keywords to the social agent", () => {
    const d = classifyByRules("draft a twitter post", agents);
    expect(d?.agentType).toBe("social");
  });

  it("is case-insensitive", () => {
    const d = classifyByRules("RESEARCH this", agents);
    expect(d?.agentType).toBe("research");
  });

  it("returns null when no keyword matches", () => {
    const d = classifyByRules("hello there, how are you today", agents);
    expect(d).toBeNull();
  });

  it("skips disabled agents", () => {
    const disabled = agents.map((a) => ({ ...a, enabled: a.agentType === "research" ? false : a.enabled }));
    const d = classifyByRules("research this", disabled);
    expect(d).toBeNull();
  });
});

describe("routePrompt", () => {
  it("uses rules when a keyword matches", async () => {
    const d = await routePrompt("deploy the stack", agents);
    expect(d.agentType).toBe("devops");
    expect(d.source).toBe("rules");
  });

  it("falls back to the default agent when no rule matches and no LLM", async () => {
    const d = await routePrompt("hello there", agents);
    expect(d.agentType).toBe("hermes");
    expect(d.source).toBe("fallback");
  });

  it("uses the LLM classifier when rules miss", async () => {
    const llm = vi.fn().mockResolvedValue({
      agentType: "research" as const,
      reasoning: "llm decided",
      source: "llm" as const,
    });
    const d = await routePrompt("some ambiguous prompt", agents, llm);
    expect(d.agentType).toBe("research");
    expect(d.source).toBe("llm");
    expect(llm).toHaveBeenCalledTimes(1);
  });

  it("does not call the LLM when rules already match", async () => {
    const llm = vi.fn();
    const d = await routePrompt("docker restart", agents, llm);
    expect(d.source).toBe("rules");
    expect(llm).not.toHaveBeenCalled();
  });

  it("degrades to fallback when the LLM classifier throws", async () => {
    const llm = vi.fn().mockRejectedValue(new Error("llm down"));
    const d = await routePrompt("some ambiguous prompt", agents, llm);
    expect(d.agentType).toBe("hermes");
    expect(d.source).toBe("fallback");
  });
});
