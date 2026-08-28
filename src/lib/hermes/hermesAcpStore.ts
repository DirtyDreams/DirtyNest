"use client";

import { create } from "zustand";
import { hermesSocket } from "./hermesSocket";

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
  currentReasoningTrace: string;
  activeToolExecutions: AcpToolExecutionItem[];
  pendingGate: AcpGateItem | null;
  recalledMemories: AcpMemoryItem[];
  allMemories: AcpMemoryItem[];
  browserState: AcpBrowserState;
  isStreaming: boolean;
  isLoading: boolean;
  isMemoryLoading: boolean;

  // Actions
  fetchSessions: () => Promise<void>;
  createSession: (name?: string, profile?: string, model?: string) => Promise<AcpSessionItem | null>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendPromptDirective: (promptText: string) => Promise<void>;
  resolveGateClearance: (requestId: string, decision: "ALLOW_ONCE" | "ALLOW_SESSION" | "DENY") => Promise<void>;
  handleIncomingAcpEvent: (event: Record<string, unknown>) => void;
  clearReasoningTrace: () => void;

  // Memory Actions
  fetchMemories: (searchQuery?: string) => Promise<void>;
  createMemory: (title: string, content: string, category?: string, tags?: string[]) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;

  // CDP Browser Actions
  fetchBrowserStatus: () => Promise<void>;
  navigateBrowser: (url: string) => Promise<void>;
  captureBrowserScreenshot: () => Promise<void>;
  extractBrowserDom: (selector?: string) => Promise<string>;
}

export const useHermesAcpStore = create<HermesAcpStoreState>((set, get) => ({
  activeSessionId: null,
  sessions: [],
  messages: [],
  currentReasoningTrace: "",
  activeToolExecutions: [],
  pendingGate: null,
  recalledMemories: [],
  allMemories: [],
  browserState: {
    isConnected: false,
    port: 9333,
    url: "about:blank",
    title: "No Active Tab",
    screenshotB64: null,
    extractedText: "",
    isLoading: false,
  },
  isStreaming: false,
  isLoading: false,
  isMemoryLoading: false,

  fetchSessions: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/hermes/acp/sessions");
      if (res.ok) {
        const data = await res.json();
        const sessions: AcpSessionItem[] = data.sessions || [];
        set({ sessions, isLoading: false });
        if (!get().activeSessionId && sessions.length > 0) {
          get().selectSession(sessions[0].id);
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createSession: async (name, profile = "dirtydaily", model = "Nous-Hermes-3-Llama-3.1-8B") => {
    try {
      const res = await fetch("/api/hermes/acp/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile, model }),
      });
      if (res.ok) {
        const data = await res.json();
        const newSession: AcpSessionItem = data.session;
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: newSession.id,
          messages: [],
          currentReasoningTrace: "",
          activeToolExecutions: [],
          pendingGate: null,
          recalledMemories: [],
        }));
        return newSession;
      }
    } catch (err) {
      console.error("Failed to create ACP session:", err);
    }
    return null;
  },

  selectSession: async (sessionId: string) => {
    try {
      set({ activeSessionId: sessionId, isLoading: true, currentReasoningTrace: "", pendingGate: null, recalledMemories: [] });
      const res = await fetch(`/api/hermes/acp/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          messages: data.messages || [],
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await fetch(`/api/hermes/acp/sessions/${sessionId}`, { method: "DELETE" });
      set((state) => {
        const remaining = state.sessions.filter((s) => s.id !== sessionId);
        const nextActive = state.activeSessionId === sessionId ? (remaining[0]?.id || null) : state.activeSessionId;
        return {
          sessions: remaining,
          activeSessionId: nextActive,
        };
      });
      if (get().activeSessionId) {
        get().selectSession(get().activeSessionId!);
      }
    } catch (err) {
      console.error("Failed to delete ACP session:", err);
    }
  },

  sendPromptDirective: async (promptText: string) => {
    const { activeSessionId } = get();
    let sesId = activeSessionId;

    if (!sesId) {
      const newSes = await get().createSession();
      if (newSes) sesId = newSes.id;
    }
    if (!sesId || !promptText.trim()) return;

    const userMsg: AcpMessageItem = {
      id: `msg-usr-${Date.now()}`,
      session_id: sesId,
      role: "user",
      content: promptText.trim(),
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      currentReasoningTrace: `[ACP ENGINE INITIALIZING // SESSION ${sesId}]`,
    }));

    // Send command via WebSocket
    const sentViaWs = hermesSocket.send("ACP_PROMPT", {
      session_id: sesId,
      prompt: promptText.trim(),
    });

    if (!sentViaWs) {
      // Fallback via Sidecar REST
      try {
        const sidecarUrl = hermesSocket.getSidecarBaseUrl();
        await fetch(`${sidecarUrl}/api/hermes/acp/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sesId,
            prompt: promptText.trim(),
          }),
        });
      } catch (err) {
        console.error("Failed to post prompt to Sidecar REST:", err);
      }
    }
  },

  resolveGateClearance: async (requestId: string, decision: "ALLOW_ONCE" | "ALLOW_SESSION" | "DENY") => {
    // Send via socket first
    hermesSocket.send("RESOLVE_GATE", {
      request_id: requestId,
      decision,
    });

    // Also call REST fallback
    try {
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      await fetch(`${sidecarUrl}/api/hermes/acp/gate/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, decision }),
      });
    } catch {
      // socket handled
    }

    set({ pendingGate: null });
  },

  fetchMemories: async (searchQuery?: string) => {
    try {
      set({ isMemoryLoading: true });
      const endpoint = searchQuery
        ? `/api/hermes/memories?q=${encodeURIComponent(searchQuery)}`
        : "/api/hermes/memories";
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        set({ allMemories: data.memories || [], isMemoryLoading: false });
      } else {
        set({ isMemoryLoading: false });
      }
    } catch {
      set({ isMemoryLoading: false });
    }
  },

  createMemory: async (title, content, category = "fact", tags = []) => {
    try {
      const res = await fetch("/api/hermes/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, tags }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          set((state) => ({
            allMemories: [data.memory, ...state.allMemories],
          }));
          return true;
        }
      }
    } catch (err) {
      console.error("Failed to create memory:", err);
    }
    return false;
  },

  deleteMemory: async (id: string) => {
    try {
      const res = await fetch(`/api/hermes/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        set((state) => ({
          allMemories: state.allMemories.filter((m) => m.id !== id),
          recalledMemories: state.recalledMemories.filter((m) => m.id !== id),
        }));
        return true;
      }
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
    return false;
  },

  fetchBrowserStatus: async () => {
    try {
      set((state) => ({ browserState: { ...state.browserState, isLoading: true } }));
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      const res = await fetch(`${sidecarUrl}/api/hermes/cdp/status`);
      if (res.ok) {
        const data = await res.json();
        const cdp = data.cdp || {};
        set((state) => ({
          browserState: {
            ...state.browserState,
            isConnected: !!cdp.is_connected,
            port: cdp.port || 9333,
            url: cdp.current_url || "about:blank",
            title: cdp.current_title || "No Active Tab",
            isLoading: false,
          },
        }));
      } else {
        set((state) => ({ browserState: { ...state.browserState, isLoading: false } }));
      }
    } catch {
      set((state) => ({ browserState: { ...state.browserState, isLoading: false } }));
    }
  },

  navigateBrowser: async (url: string) => {
    try {
      set((state) => ({ browserState: { ...state.browserState, isLoading: true } }));
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      await fetch(`${sidecarUrl}/api/hermes/cdp/navigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      await get().captureBrowserScreenshot();
    } catch {
      set((state) => ({ browserState: { ...state.browserState, isLoading: false } }));
    }
  },

  captureBrowserScreenshot: async () => {
    try {
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      const res = await fetch(`${sidecarUrl}/api/hermes/cdp/screenshot`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const shot = data.screenshot || {};
        set((state) => ({
          browserState: {
            ...state.browserState,
            screenshotB64: shot.data || state.browserState.screenshotB64,
            url: shot.url || state.browserState.url,
            isLoading: false,
          },
        }));
      }
    } catch {
      set((state) => ({ browserState: { ...state.browserState, isLoading: false } }));
    }
  },

  extractBrowserDom: async (selector?: string) => {
    try {
      const sidecarUrl = hermesSocket.getSidecarBaseUrl();
      const endpoint = selector
        ? `${sidecarUrl}/api/hermes/cdp/extract?selector=${encodeURIComponent(selector)}`
        : `${sidecarUrl}/api/hermes/cdp/extract`;
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const text = data.dom?.text || "";
        set((state) => ({
          browserState: { ...state.browserState, extractedText: text },
        }));
        return text;
      }
    } catch {
      // ignore
    }
    return "";
  },

  handleIncomingAcpEvent: (event: Record<string, unknown>) => {
    const type = event.type as string;

    if (type === "ACP_BROWSER_UPDATED") {
      set((state) => ({
        browserState: {
          ...state.browserState,
          url: (event.url as string) || state.browserState.url,
          title: (event.title as string) || state.browserState.title,
          screenshotB64: (event.screenshot_b64 as string) || state.browserState.screenshotB64,
          extractedText: (event.extracted_text as string) || state.browserState.extractedText,
          port: (event.port as number) || state.browserState.port,
          isConnected: true,
        },
      }));
    } else if (type === "ACP_MEMORY_RECALLED") {
      const memories = (event.recalled_memories as AcpMemoryItem[]) || [];
      set({ recalledMemories: memories });
    } else if (type === "ACP_REASONING_DELTA") {
      const delta = (event.delta as string) || "";
      set((state) => ({
        currentReasoningTrace: state.currentReasoningTrace + delta,
      }));
    } else if (type === "ACP_GATE_REQUESTED") {
      const gate = event.gate as AcpGateItem;
      if (gate) {
        set({ pendingGate: gate });
      }
    } else if (type === "ACP_GATE_RESOLVED") {
      set({ pendingGate: null });
    } else if (type === "ACP_TOOL_EXECUTED") {
      const toolName = (event.tool_name as string) || "unknown_tool";
      const result = (event.result as string) || "Executed";
      const executionItem: AcpToolExecutionItem = {
        id: `exec-${Date.now()}`,
        session_id: (event.session_id as string) || "",
        tool_name: toolName,
        status: "success",
        result,
        timestamp: Date.now(),
      };
      set((state) => ({
        activeToolExecutions: [executionItem, ...state.activeToolExecutions.slice(0, 15)],
      }));
    } else if (type === "ACP_EXECUTION_FINISHED") {
      const finalMsg = (event.final_message as string) || (event.result as string) || "Completed.";
      const { activeSessionId } = get();
      if (activeSessionId) {
        const agentMsg: AcpMessageItem = {
          id: `msg-agy-${Date.now()}`,
          session_id: activeSessionId,
          role: "agent",
          content: finalMsg,
          reasoning_trace: get().currentReasoningTrace,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, agentMsg],
          isStreaming: false,
        }));
      } else {
        set({ isStreaming: false });
      }
    }
  },

  clearReasoningTrace: () => {
    set({ currentReasoningTrace: "" });
  },
}));

if (typeof window !== "undefined") {
  hermesSocket.onAcpEvent((event) => {
    useHermesAcpStore.getState().handleIncomingAcpEvent(event);
  });
}

