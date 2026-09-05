"use client";

import { create } from "zustand";

export interface AcpSessionItem {
  id: string;
  name: string;
  profile: string;
  model: string;
  cwd: string;
  status: "IDLE" | "RUNNING" | "WAITING_CLEARANCE" | "ERROR" | "COMPLETED";
  created_at: string;
  updated_at: string;
}

export interface AcpMessageItem {
  id: string;
  session_id: string;
  role: "user" | "agent" | "system" | "tool";
  content: string;
  reasoning_trace?: string | null;
  created_at: string;
}

export interface AcpGateItem {
  request_id: string;
  session_id: string;
  tool_name: string;
  parameters: Record<string, unknown>;
  risk_level: "low" | "medium" | "critical";
  diff_preview?: string | null;
  created_at?: number;
}

export interface AcpToolExecutionItem {
  id: string;
  session_id: string;
  tool_name: string;
  status: "running" | "success" | "error";
  result?: string;
  timestamp: number;
}

export interface AcpMemoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  recall_count?: number;
  score?: number;
  created_at?: string;
}

export interface AcpBrowserState {
  isConnected: boolean;
  port: number;
  url: string;
  title: string;
  screenshotB64: string | null;
  extractedText?: string;
  isLoading: boolean;
}

interface HermesAcpStoreState {
  activeSessionId: string | null;
  sessions: AcpSessionItem[];
  messages: AcpMessageItem[];
  messagesBySession: Record<string, AcpMessageItem[]>;
  currentReasoningTrace: string;
  activeToolExecutions: AcpToolExecutionItem[];
  pendingGate: AcpGateItem | null;
  recalledMemories: AcpMemoryItem[];
  allMemories: AcpMemoryItem[];
  browserState: AcpBrowserState;
  isStreaming: boolean;
  isLoading: boolean;
  isMemoryLoading: boolean;

  fetchSessions: () => Promise<void>;
  createSession: (name?: string, profile?: string, model?: string) => Promise<AcpSessionItem | null>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendPromptDirective: (promptText: string) => Promise<void>;
  resolveGateClearance: (requestId: string, decision: "ALLOW_ONCE" | "ALLOW_SESSION" | "DENY") => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  handleIncomingAcpEvent: (event: Record<string, unknown>) => void;
  clearReasoningTrace: () => void;
  fetchMemories: (searchQuery?: string) => Promise<void>;
  createMemory: (title: string, content: string, category?: string, tags?: string[]) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;
  fetchBrowserStatus: () => Promise<void>;
  navigateBrowser: (url: string) => Promise<void>;
  captureBrowserScreenshot: () => Promise<void>;
  extractBrowserDom: (selector?: string) => Promise<string>;
}

const nowIso = () => new Date().toISOString();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_MEMORIES: AcpMemoryItem[] = [
  {
    id: "mem-frontend-1",
    title: "Frontend-only mode",
    content: "DirtyNest is running without Next API routes or the Python sidecar. Interactive panels use local in-memory state and built-in demo data.",
    category: "decision",
    tags: ["frontend", "local", "demo"],
    recall_count: 12,
    score: 0.98,
    created_at: "2026-09-05T10:00:00.000Z",
  },
  {
    id: "mem-frontend-2",
    title: "Operator theme preference",
    content: "Primary palette prefers obsidian backgrounds with neon green, cyan, and violet accents.",
    category: "preference",
    tags: ["theme", "ui"],
    recall_count: 8,
    score: 0.91,
    created_at: "2026-09-05T10:05:00.000Z",
  },
  {
    id: "mem-frontend-3",
    title: "Knowledge deck fallback",
    content: "Knowledge, social, intel, and Docker decks ship with local mock datasets so the shell remains usable offline.",
    category: "fact",
    tags: ["knowledge", "social", "docker"],
    recall_count: 5,
    score: 0.87,
    created_at: "2026-09-05T10:10:00.000Z",
  },
];

const INITIAL_SESSION: AcpSessionItem = {
  id: "acp-local-1",
  name: "Frontend Sandbox Session",
  profile: "frontend-only",
  model: "DirtyNest Local Mock",
  cwd: "/ui-only",
  status: "IDLE",
  created_at: "2026-09-05T10:00:00.000Z",
  updated_at: "2026-09-05T10:00:00.000Z",
};

const INITIAL_MESSAGES: Record<string, AcpMessageItem[]> = {
  [INITIAL_SESSION.id]: [
    {
      id: "msg-local-system-1",
      session_id: INITIAL_SESSION.id,
      role: "system",
      content: "Frontend-only mode active. Hermes ACP is simulated locally for UI exploration.",
      created_at: "2026-09-05T10:00:00.000Z",
    },
    {
      id: "msg-local-agent-1",
      session_id: INITIAL_SESSION.id,
      role: "agent",
      content: "Ready. I can simulate local sessions, tool calls, memories, and HITL approvals without any backend services.",
      reasoning_trace: "Bootstrapped local ACP state.",
      created_at: "2026-09-05T10:00:10.000Z",
    },
  ],
};

function appendMessage(state: HermesAcpStoreState, sessionId: string, message: AcpMessageItem) {
  const current = state.messagesBySession[sessionId] ?? [];
  const nextBySession = {
    ...state.messagesBySession,
    [sessionId]: [...current, message],
  };
  return {
    messagesBySession: nextBySession,
    messages: state.activeSessionId === sessionId ? nextBySession[sessionId] : state.messages,
  };
}

function buildAgentReply(prompt: string): { reasoning: string; reply: string; gateTool?: string } {
  const normalized = prompt.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes("deploy") || lower.includes("publish") || lower.includes("delete") || lower.includes("docker")) {
    return {
      reasoning: "Detected an operator command that would normally require confirmation. Preparing a local HITL gate preview.",
      reply: "This frontend-only workspace simulated a guarded action. Approve the local HITL request to continue the mock execution.",
      gateTool: lower.includes("publish") ? "social_publish" : lower.includes("docker") ? "docker_action" : "filesystem_write",
    };
  }

  if (lower.includes("memory") || lower.includes("knowledge") || lower.includes("vault")) {
    return {
      reasoning: "Matched a memory-oriented request. Returning a local summary from the in-memory demo vault.",
      reply: "Local memory mode is active. The Knowledge and Control Room decks are using bundled sample data and in-browser state instead of server persistence.",
    };
  }

  return {
    reasoning: "Handled prompt in frontend-only simulation mode. No remote tools were contacted.",
    reply: `Local agent response: ${normalized || "No prompt provided."}`,
  };
}

export const useHermesAcpStore = create<HermesAcpStoreState>((set, get) => ({
  activeSessionId: INITIAL_SESSION.id,
  sessions: [INITIAL_SESSION],
  messages: INITIAL_MESSAGES[INITIAL_SESSION.id],
  messagesBySession: INITIAL_MESSAGES,
  currentReasoningTrace: "",
  activeToolExecutions: [],
  pendingGate: null,
  recalledMemories: [],
  allMemories: DEFAULT_MEMORIES,
  browserState: {
    isConnected: true,
    port: 0,
    url: "https://dirtynest.local/frontend-only",
    title: "DirtyNest Frontend Sandbox",
    screenshotB64: null,
    extractedText: "Frontend-only browser sandbox active.",
    isLoading: false,
  },
  isStreaming: false,
  isLoading: false,
  isMemoryLoading: false,

  fetchSessions: async () => {
    set((state) => {
      const sessions = state.sessions.length ? state.sessions : [INITIAL_SESSION];
      const activeSessionId = state.activeSessionId ?? sessions[0]?.id ?? INITIAL_SESSION.id;
      return {
        sessions,
        activeSessionId,
        messages: state.messagesBySession[activeSessionId] ?? [],
        isLoading: false,
      };
    });
  },

  createSession: async (name, profile = "frontend-only", model = "DirtyNest Local Mock") => {
    const session: AcpSessionItem = {
      id: `acp-local-${Date.now()}`,
      name: (name || "Local Sandbox Session").trim(),
      profile,
      model,
      cwd: "/ui-only",
      status: "IDLE",
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const initialMessages: AcpMessageItem[] = [
      {
        id: `msg-local-system-${Date.now()}`,
        session_id: session.id,
        role: "system",
        content: `Session ${session.name} initialized in frontend-only mode.`,
        created_at: nowIso(),
      },
    ];

    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id,
      messages: initialMessages,
      messagesBySession: {
        ...state.messagesBySession,
        [session.id]: initialMessages,
      },
      currentReasoningTrace: "",
      pendingGate: null,
      activeToolExecutions: [],
    }));

    return session;
  },

  selectSession: async (sessionId: string) => {
    set((state) => ({
      activeSessionId: sessionId,
      messages: state.messagesBySession[sessionId] ?? [],
      isLoading: false,
      currentReasoningTrace: "",
      pendingGate: null,
      recalledMemories: [],
    }));
  },

  deleteSession: async (sessionId: string) => {
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== sessionId);
      const nextSessions = sessions.length ? sessions : [INITIAL_SESSION];
      const nextActive = state.activeSessionId === sessionId ? nextSessions[0].id : state.activeSessionId ?? nextSessions[0].id;
      const nextMessagesBySession = { ...state.messagesBySession };
      delete nextMessagesBySession[sessionId];
      if (!nextMessagesBySession[nextSessions[0].id]) {
        nextMessagesBySession[nextSessions[0].id] = INITIAL_MESSAGES[nextSessions[0].id] ?? [];
      }
      return {
        sessions: nextSessions,
        activeSessionId: nextActive,
        messagesBySession: nextMessagesBySession,
        messages: nextMessagesBySession[nextActive] ?? [],
        currentReasoningTrace: "",
        pendingGate: null,
      };
    });
  },

  sendPromptDirective: async (promptText: string) => {
    if (!promptText.trim()) return;

    let sessionId = get().activeSessionId;
    if (!sessionId) {
      const created = await get().createSession();
      sessionId = created?.id ?? null;
    }
    if (!sessionId) return;

    const userMsg: AcpMessageItem = {
      id: `msg-user-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: promptText.trim(),
      created_at: nowIso(),
    };

    set((state) => {
      const appended = appendMessage(state, sessionId!, userMsg);
      return {
        ...appended,
        isStreaming: true,
        currentReasoningTrace: "Analyzing local prompt...",
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "RUNNING", updated_at: nowIso() } : s
        ),
      };
    });

    const response = buildAgentReply(promptText);
    await sleep(350);

    if (response.gateTool) {
      const gate: AcpGateItem = {
        request_id: `gate-${Date.now()}`,
        session_id: sessionId,
        tool_name: response.gateTool,
        parameters: { prompt: promptText.trim(), mode: "frontend-only" },
        risk_level: "critical",
        created_at: Date.now(),
      };

      set((state) => ({
        currentReasoningTrace: response.reasoning,
        pendingGate: gate,
        isStreaming: false,
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "WAITING_CLEARANCE", updated_at: nowIso() } : s
        ),
      }));
      return;
    }

    const toolExecution: AcpToolExecutionItem = {
      id: `exec-${Date.now()}`,
      session_id: sessionId,
      tool_name: "local_simulation",
      status: "success",
      result: "Rendered simulated frontend-only result.",
      timestamp: Date.now(),
    };

    const agentMsg: AcpMessageItem = {
      id: `msg-agent-${Date.now()}`,
      session_id: sessionId,
      role: "agent",
      content: response.reply,
      reasoning_trace: response.reasoning,
      created_at: nowIso(),
    };

    set((state) => {
      const appended = appendMessage(state, sessionId!, agentMsg);
      return {
        ...appended,
        isStreaming: false,
        currentReasoningTrace: response.reasoning,
        activeToolExecutions: [toolExecution, ...state.activeToolExecutions.slice(0, 15)],
        recalledMemories: state.allMemories.slice(0, 2),
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "COMPLETED", updated_at: nowIso() } : s
        ),
      };
    });
  },

  resolveGateClearance: async (requestId, decision) => {
    const gate = get().pendingGate;
    if (!gate || gate.request_id !== requestId) {
      set({ pendingGate: null });
      return;
    }

    const allowed = decision !== "DENY";
    const message: AcpMessageItem = {
      id: `msg-gate-${Date.now()}`,
      session_id: gate.session_id,
      role: "agent",
      content: allowed
        ? `Local HITL approved for ${gate.tool_name}. Mock execution completed successfully.`
        : `Local HITL denied for ${gate.tool_name}. Mock execution stopped by the operator.`,
      reasoning_trace: allowed
        ? "Operator granted local clearance in frontend-only mode."
        : "Operator denied local clearance in frontend-only mode.",
      created_at: nowIso(),
    };

    const exec: AcpToolExecutionItem = {
      id: `exec-gate-${Date.now()}`,
      session_id: gate.session_id,
      tool_name: gate.tool_name,
      status: allowed ? "success" : "error",
      result: allowed ? "Mock action approved." : "Mock action denied.",
      timestamp: Date.now(),
    };

    set((state) => {
      const appended = appendMessage(state, gate.session_id, message);
      return {
        ...appended,
        pendingGate: null,
        isStreaming: false,
        currentReasoningTrace: message.reasoning_trace ?? "",
        activeToolExecutions: [exec, ...state.activeToolExecutions.slice(0, 15)],
        sessions: state.sessions.map((s) =>
          s.id === gate.session_id ? { ...s, status: allowed ? "COMPLETED" : "ERROR", updated_at: nowIso() } : s
        ),
      };
    });
  },

  cancelSession: async (sessionId: string) => {
    const message: AcpMessageItem = {
      id: `msg-cancel-${Date.now()}`,
      session_id: sessionId,
      role: "system",
      content: "Local execution cancelled.",
      created_at: nowIso(),
    };

    set((state) => {
      const appended = appendMessage(state, sessionId, message);
      return {
        ...appended,
        isStreaming: false,
        pendingGate: null,
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "ERROR", updated_at: nowIso() } : s
        ),
      };
    });
  },

  fetchMemories: async (searchQuery?: string) => {
    set({ isMemoryLoading: true });
    const query = searchQuery?.trim().toLowerCase();
    const filtered = query
      ? get().allMemories.filter(
          (memory) =>
            memory.title.toLowerCase().includes(query) ||
            memory.content.toLowerCase().includes(query) ||
            (memory.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
        )
      : get().allMemories;
    set({ allMemories: filtered, isMemoryLoading: false });
  },

  createMemory: async (title, content, category = "fact", tags = []) => {
    const memory: AcpMemoryItem = {
      id: `mem-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      recall_count: 0,
      score: 1,
      created_at: nowIso(),
    };
    set((state) => ({
      allMemories: [memory, ...state.allMemories],
      recalledMemories: [memory, ...state.recalledMemories.slice(0, 4)],
    }));
    return true;
  },

  deleteMemory: async (id) => {
    set((state) => ({
      allMemories: state.allMemories.filter((m) => m.id !== id),
      recalledMemories: state.recalledMemories.filter((m) => m.id !== id),
    }));
    return true;
  },

  fetchBrowserStatus: async () => {
    set((state) => ({
      browserState: {
        ...state.browserState,
        isConnected: true,
        isLoading: false,
        title: "DirtyNest Frontend Sandbox",
      },
    }));
  },

  navigateBrowser: async (url: string) => {
    set((state) => ({
      browserState: {
        ...state.browserState,
        isConnected: true,
        isLoading: false,
        url,
        title: "Mock Browser Navigation",
      },
    }));
  },

  captureBrowserScreenshot: async () => {
    set((state) => ({
      browserState: {
        ...state.browserState,
        isConnected: true,
        isLoading: false,
        screenshotB64: null,
      },
    }));
  },

  extractBrowserDom: async (selector?: string) => {
    const text = selector
      ? `Mock DOM extract for selector: ${selector}`
      : "Mock DOM extract for the current frontend-only browser sandbox.";
    set((state) => ({
      browserState: {
        ...state.browserState,
        extractedText: text,
      },
    }));
    return text;
  },

  handleIncomingAcpEvent: () => {
    // No-op in frontend-only mode.
  },

  clearReasoningTrace: () => {
    set({ currentReasoningTrace: "" });
  },
}));
