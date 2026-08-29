"use client";

import { create } from "zustand";
import {
  HermesFullConfig,
  HermesMemoryItem,
  HermesSkillDefinition,
  HermesAcpEvent,
} from "./types";

const DEFAULT_HERMES_CONFIG: HermesFullConfig = {
  model: {
    provider: "nous_portal",
    modelId: "Nous-Hermes-3-Llama-70B",
    apiKey: "",
    endpointUrl: "https://api.nousresearch.com/v1",
    contextWindowTokens: 128000,
    temperature: 0.2,
    topP: 0.95,
    maxReasoningTokens: 8192,
    enableThinkingTrace: true,
  },
  memory: {
    fts5Enabled: true,
    vectorIndexEnabled: true,
    maxRecallCount: 8,
    memoryDecayRate: 0.05,
    autoPruneAgeDays: 90,
    autoExtractMemories: true,
  },
  skills: {
    autoAbstractSkills: true,
    minSuccessRateThreshold: 95.0,
    minInvocationsToDistill: 3,
    syncWithSkillsHub: true,
    autoDiscoverMcp: true,
  },
  hitl: {
    autoApproveLowRisk: true,
    requireClearanceForFsWrite: true,
    requireClearanceForDocker: true,
    requireClearanceForShell: true,
    requireClearanceForNetwork: false,
    sessionTokenBudgetCeiling: 100000,
  },
  gateway: {
    telegramEnabled: false,
    telegramBotToken: "",
    discordEnabled: false,
    discordWebhookUrl: "",
    slackEnabled: false,
    slackAppToken: "",
    cliSocketActive: true,
    enableWebhooks: true,
  },
  subagents: {
    maxConcurrentSubagents: 8,
    subagentTokenLimit: 32000,
    sandboxMode: "docker",
    maxDagDepth: 4,
  },
};

const DEFAULT_MEMORIES: HermesMemoryItem[] = [
  {
    id: "mem-01",
    title: "Cyberpunk Terminal Aesthetic Directive",
    category: "preference",
    content: "Operator prefers obsidian backgrounds (#07070B), luminous green accents (#00FF41), and CRT scanline styling.",
    timestamp: "2026-08-20 18:22",
    recalls: 48,
    pinned: true,
    confidence: 0.99,
    tags: ["UI", "Tailwind", "Theme"],
  },
  {
    id: "mem-02",
    title: "Central Write-Mutex Persistence Architecture",
    category: "decision",
    content: "All SQLite mutations must execute through @/db persistDb() mutex to prevent multi-process database locks.",
    timestamp: "2026-08-22 14:05",
    recalls: 32,
    pinned: true,
    confidence: 0.98,
    tags: ["Database", "SQLite", "WAL"],
  },
  {
    id: "mem-03",
    title: "AirGap Isolation Boundary on Port 8080",
    category: "fact",
    content: "Container dirtynest-auth-proxy enforces Ed25519 signatures and disallows unauthenticated ingress requests.",
    timestamp: "2026-08-23 09:15",
    recalls: 19,
    pinned: false,
    confidence: 0.95,
    tags: ["Security", "Docker", "mTLS"],
  },
  {
    id: "mem-04",
    title: "1-Click DORA Metric Audit Workflow",
    category: "workflow",
    content: "Automated aggregation of lead time for changes, deployment frequency, MTTR, and change failure rate.",
    timestamp: "2026-08-24 16:40",
    recalls: 67,
    pinned: false,
    confidence: 0.96,
    tags: ["DevOps", "DORA", "Metrics"],
  },
];

const DEFAULT_SKILLS: HermesSkillDefinition[] = [
  {
    id: "skill-cve",
    name: "CVE Triage & 1-Click Patch Synthesizer",
    slug: "cve-triage-patch",
    category: "Security",
    description: "Ingests CVE disclosures, traces AST call graphs in src/, and drafts isolated patches.",
    author: "Nous Research",
    version: "2.4.0",
    invocations: 142,
    successRate: 99.4,
    tags: ["CVE", "AST", "AppSec"],
    requiresHitl: true,
  },
  {
    id: "skill-pr",
    name: "Autonomous PR Review & Diff Hardener",
    slug: "pr-diff-hardener",
    category: "Code",
    description: "Performs static SAST review, ensures zero 'any' types in TypeScript, and runs performance budgets.",
    author: "DirtyNest Swarm",
    version: "1.8.2",
    invocations: 388,
    successRate: 99.8,
    tags: ["GitHub", "TypeScript", "Lint"],
    requiresHitl: false,
  },
  {
    id: "skill-docker",
    name: "Container Mesh Health & Auto-Prune",
    slug: "docker-mesh-prune",
    category: "DevOps",
    description: "Monitors socket connections, unmapped ports, and runs automated vacuum on dangling build layers.",
    author: "Nous Research",
    version: "1.5.0",
    invocations: 92,
    successRate: 100.0,
    tags: ["Docker", "Socket", "Prune"],
    requiresHitl: true,
  },
  {
    id: "skill-sqlite",
    name: "Persistent Memory Index & B-Tree Balancer",
    slug: "sqlite-btree-balance",
    category: "Automation",
    description: "Re-indexes SQLite FTS5 virtual tables and consolidates vector embeddings for sub-10ms recall.",
    author: "DirtyNest Swarm",
    version: "3.1.0",
    invocations: 512,
    successRate: 99.9,
    tags: ["SQLite", "FTS5", "Vector"],
    requiresHitl: false,
  },
];

interface HermesState {
  config: HermesFullConfig;
  memories: HermesMemoryItem[];
  skills: HermesSkillDefinition[];
  acpEvents: HermesAcpEvent[];
  isAcpConnected: boolean;
  totalTokensProcessed: number;
  activeReasoningStep: number;
  servicesStatus: Record<string, any> | null;
  minionsList: any[];
  hostTelemetry: any | null;
  
  // Actions
  updateConfig: <K extends keyof HermesFullConfig>(section: K, values: Partial<HermesFullConfig[K]>) => void;
  addMemory: (memory: Omit<HermesMemoryItem, "id" | "timestamp" | "recalls">) => void;
  deleteMemory: (id: string) => void;
  togglePinMemory: (id: string) => void;
  triggerSkill: (skillId: string) => Promise<string>;
  addAcpEvent: (event: Omit<HermesAcpEvent, "id" | "timestamp">) => void;
  resetConfigToDefault: () => void;
  updateServicesStatus: (services: Record<string, unknown>) => void;
  updateMinionsList: (minions: unknown[]) => void;
  updateHostTelemetry: (host: unknown) => void;
}

const STORAGE_KEY = "dirtynest_hermes_config";

export const useHermesStore = create<HermesState>((set, get) => {
  // Load persisted config from localStorage if in browser
  let initialConfig = DEFAULT_HERMES_CONFIG;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        initialConfig = { ...DEFAULT_HERMES_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  return {
    config: initialConfig,
    memories: DEFAULT_MEMORIES,
    skills: DEFAULT_SKILLS,
    acpEvents: [],
    isAcpConnected: true,
    totalTokensProcessed: 142850,
    activeReasoningStep: 3,
    servicesStatus: null,
    minionsList: [],
    hostTelemetry: null,

    updateConfig: (section, values) => {
      set((state) => {
        const nextConfig = {
          ...state.config,
          [section]: {
            ...state.config[section],
            ...values,
          },
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
          } catch {
            // ignore
          }
        }
        return { config: nextConfig };
      });
    },

    addMemory: (item) => {
      const newMemory: HermesMemoryItem = {
        ...item,
        id: `mem-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        recalls: 1,
      };
      set((state) => ({ memories: [newMemory, ...state.memories] }));
    },

    deleteMemory: (id) => {
      set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }));
    },

    togglePinMemory: (id) => {
      set((state) => ({
        memories: state.memories.map((m) =>
          m.id === id ? { ...m, pinned: !m.pinned } : m
        ),
      }));
    },

    triggerSkill: async (skillId) => {
      const skill = get().skills.find((s) => s.id === skillId);
      if (!skill) return "Skill not found";

      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === skillId ? { ...s, invocations: s.invocations + 1 } : s
        ),
      }));

      return `[HERMES EXECUTED] ${skill.name} completed successfully. Returncode=0.`;
    },

    addAcpEvent: (evt) => {
      const newEvt: HermesAcpEvent = {
        ...evt,
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };
      set((state) => ({ acpEvents: [...state.acpEvents.slice(-50), newEvt] }));
    },

    resetConfigToDefault: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      set({ config: DEFAULT_HERMES_CONFIG });
    },

    // Socket telemetry handlers (data from hermesSocket.ts)
    updateServicesStatus: (servicesStatus) => {
      set({ servicesStatus });
    },
    updateMinionsList: (minionsList) => {
      set({ minionsList });
    },
    updateHostTelemetry: (hostTelemetry) => {
      set({ hostTelemetry });
    },
  };
});
