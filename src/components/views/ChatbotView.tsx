"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Brain,
  Sparkles,
  Cpu,
  Trash2,
  Check,
  Code2,
  Zap,
  Sliders,
  Database,
  Search,
  Globe,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GitBranch,
  Paperclip,
  StopCircle,
  TerminalSquare,
  AtSign,
  CornerDownLeft,
  Mic,
  Image as ImageIcon,
  Video,
  X,
  FileCode,
  Eye,
  GitFork,
  Settings,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/components/common/ToastProvider";
import ArtifactsCanvas from "./chatbot/ArtifactsCanvas";
import HermesMessageBlock from "./chatbot/HermesMessageBlock";
import ChatbotSessionsDrawer, { HermesChatSession } from "./chatbot/ChatbotSessionsDrawer";
import ChatbotSidebar, { ChatFolder } from "./chatbot/ChatbotSidebar";
import PersonaStudioModal, { AgentPersona, AGENT_PERSONAS } from "./chatbot/PersonaStudioModal";
import { useHermesAcpStore } from "@/lib/hermes/hermesAcpStore";
export type ChatMode = "standard" | "reasoning" | "deep_research" | "code_interpreter";

export interface ResearchSource {
  title: string;
  url: string;
  sourceType: "web" | "arxiv" | "github" | "obsidian";
  snippet: string;
  relevanceScore: number;
}

export interface DeepResearchProgress {
  status: "idle" | "planning" | "searching" | "reading" | "synthesizing" | "completed";
  subQueries: string[];
  crawledSources: ResearchSource[];
  activeStepText: string;
  thinkingSeconds: number;
  totalTokens: number;
}

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  mode?: ChatMode;
  thinkingTimeSec?: number;
  thinkingTrace?: string;
  researchData?: DeepResearchProgress;
  citations?: ResearchSource[];
}

const AI_MODELS = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google DeepMind", tag: "RESEARCH", color: "#00FF41" },
  { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", tag: "HYBRID", color: "#BF40FF" },
  { id: "gpt-4o", name: "GPT-4o Omniscience", provider: "OpenAI", tag: "FAST", color: "#00F0FF" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", tag: "DEEP THINK", color: "#FFB800" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Local Ollama", tag: "AIR-GAPPED", color: "#FF2A6D" },
];

const DEEP_RESEARCH_TEMPLATES = [
  {
    label: "Zero-Trust eBPF Mesh",
    prompt: "Deep Research: State of eBPF-driven zero-trust kernel microsegmentation and high-throughput packet filtering in modern cloud clusters.",
  },
  {
    label: "Karpathy BPE Tokenization",
    prompt: "Deep Research: Byte-Pair Encoding vs Byte-Level Byte-Fallback in Transformer LLMs: mathematical foundations, vocabulary compression ratios, and memory implications.",
  },
  {
    label: "Autonomous Agent Swarms",
    prompt: "Deep Research: Multi-agent coordination protocols, shared memory graphs, and tool clearance safety gates for autonomous AI developer networks.",
  },
  {
    label: "Next-Gen Vector Databases",
    prompt: "Deep Research: SQLite-Vec vs Qdrant vs pgvector: SIMD acceleration, memory mapped indices, and cosine similarity benchmarks on 1M embeddings.",
  },
];

export default function ChatbotView() {
  const { setActiveView } = useAppStore();
  const {
    activeSessionId: acpActiveSessionId,
    sessions: acpSessions,
    messages: acpMessages,
    fetchSessions,
    createSession: acpCreateSession,
    selectSession: acpSelectSession,
    deleteSession: acpDeleteSession,
    sendPromptDirective,
    isStreaming: acpIsStreaming,
    currentReasoningTrace,
  } = useHermesAcpStore();

  const [activeMode, setActiveMode] = useState<ChatMode>("standard");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro");
  const [researchDepth, setResearchDepth] = useState<"fast" | "standard" | "exhaustive">("standard");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(true);
  const [isVaultRagEnabled, setIsVaultRagEnabled] = useState(true);
  const [isCodeInterpreterEnabled, setIsCodeInterpreterEnabled] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showSourcesDrawer, setShowSourcesDrawer] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeResearchSources, setActiveResearchSources] = useState<ResearchSource[]>([]);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});
  
  // Fancy Compositor States
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeBranch, setActiveBranch] = useState<"main" | "alt">("main");
  const [activeArtifact, setActiveArtifact] = useState<{
    code: string;
    language: string;
    title: string;
  } | null>(null);

  const INITIAL_FOLDERS: ChatFolder[] = [
    { id: "f-dev", name: "Dev & Architecture", color: "#00F0FF" },
    { id: "f-research", name: "Deep Research & arXiv", color: "#BF40FF" },
    { id: "f-security", name: "SecOps & Audits", color: "#FF0055" },
    { id: "f-general", name: "General Operations", color: "#00FF41" },
  ];

  // Sessions History & Persona Studio States
  const [folders, setFolders] = useState<ChatFolder[]>(INITIAL_FOLDERS);
  const [sessions, setSessions] = useState<HermesChatSession[]>([
    {
      id: "session-root",
      title: "DirtyNest Master Neural Orchestration",
      personaId: "hermes-master",
      personaName: "Hermes Master",
      model: "Nous-Hermes-3-70B",
      messageCount: 2,
      lastMessageSnippet: "Greetings, Operator. I am Hermes, the 100% Master AI Neural Orchestrator...",
      updatedAt: "Just now",
      isPinned: true,
      folderId: "f-dev",
    },
    {
      id: "session-sec",
      title: "eBPF Zero-Trust Kernel Audit",
      personaId: "secops-sentinel",
      personaName: "SecOps",
      model: "Nous-Hermes-3-70B",
      messageCount: 4,
      lastMessageSnippet: "Audit completed. Zero privilege escalations detected.",
      updatedAt: "10m ago",
      folderId: "f-security",
    },
    {
      id: "session-res",
      title: "Karpathy BPE Tokenizer Analysis",
      personaId: "research-scientist",
      personaName: "Researcher",
      model: "Gemini-2.5-Pro",
      messageCount: 8,
      lastMessageSnippet: "arXiv synthesis completed with mathematical proofs.",
      updatedAt: "1h ago",
      folderId: "f-research",
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-root");
  const [showSessionsDrawer, setShowSessionsDrawer] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<AgentPersona>(AGENT_PERSONAS[0]);
  const [showPersonaModal, setShowPersonaModal] = useState<boolean>(false);
  const isAcpMode = activeMode === "standard" || activeMode === "reasoning";

  useEffect(() => {
    if (isAcpMode) {
      fetchSessions();
    }
  }, [isAcpMode, fetchSessions]);

  const displaySessions = useMemo(() => {
    if (!isAcpMode) return sessions;
    return acpSessions.map((s): HermesChatSession => ({
      id: s.id,
      title: s.name,
      personaId: "hermes-master",
      personaName: "Hermes Master",
      model: s.model || "Nous-Hermes-3-70B",
      messageCount: 0,
      lastMessageSnippet: s.status,
      updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleTimeString("en-US", { hour12: false }) : "just now",
      isPinned: false,
      folderId: undefined,
    }));
  }, [isAcpMode, sessions, acpSessions]);

  const displayActiveSessionId = isAcpMode ? (acpActiveSessionId || "") : activeSessionId;
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: "image" | "video" | "file"; size: string }[]>([
    { id: "att-1", name: "system_architecture.png", type: "image", size: "2.4 MB" },
    { id: "att-2", name: "auth_service.ts", type: "file", size: "14 KB" }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      sender: "system",
      text: "HERMES NEURAL ENGINE ONLINE // NOUS-HERMES-3-70B // ACP PROTOCOL V2 // PERSISTENT MEMORY & 42 SKILLS LOADED",
      timestamp: "06:00:01",
    },
    {
      id: "ai-1",
      sender: "ai",
      text: `<thought>
1. Checking DirtyNest cluster topology: all 8 microservices report 0 packet loss.
2. Verified SQLite FTS5 persistent memory store: 1,420 vector nodes loaded with sub-10ms recall.
3. Hermes Skills Hub active: 42 autonomous skills compiled and ready for dispatch.
</thought>
<tool_call>
{"name": "hermes_mesh_status", "parameters": {"cluster": "dirtynest-core", "check_skills": true}}
</tool_call>
<tool_response>
{"status": "ONLINE", "active_skills": 42, "memory_recall_accuracy": "99.8%", "sandbox": "Docker-AirGap"}
</tool_response>
Greetings, Operator. I am Hermes, the 100% Master AI Neural Orchestrator powering DirtyNest. Enter your operational directive or use /skills to trigger automated workflows.`,
      timestamp: "06:00:04",
      model: "Nous-Hermes-3-70B",
      tokens: 68,
    },
  ]);
  const displayMessages = useMemo(() => {
    if (!isAcpMode) return messages;

    const mapped: Message[] = acpMessages.map((m) => ({
      id: m.id,
      sender: m.role === "user" ? "user" : m.role === "system" ? "system" : "ai",
      text: m.content,
      timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString("en-US", { hour12: false }) : new Date().toLocaleTimeString("en-US", { hour12: false }),
      model: "Nous-Hermes-3-70B",
      thinkingTrace: m.reasoning_trace || undefined,
    }));

    if (acpIsStreaming && currentReasoningTrace) {
      mapped.push({
        id: "streaming-thought-trace",
        sender: "ai",
        text: "Hermes is computing response...",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        thinkingTrace: currentReasoningTrace,
      });
    }

    return mapped;
  }, [isAcpMode, messages, acpMessages, acpIsStreaming, currentReasoningTrace]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (typeof window === "undefined") return;
      const scrolledFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setShowScrollBottom(scrolledFromBottom > 320);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    
    const words = val.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("/")) {
      setShowSlashMenu(true);
      setShowMentionMenu(false);
    } else if (lastWord.startsWith("@")) {
      setShowMentionMenu(true);
      setShowSlashMenu(false);
    } else {
      setShowSlashMenu(false);
      setShowMentionMenu(false);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, isGenerating]);

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberAudio.play("click");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleThinkingExpand = (id: string) => {
    cyberAudio.play("click");
    setExpandedThinkingIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveToObsidian = (msg: Message) => {
    cyberAudio.play("chime");
    window.dispatchEvent(
      new CustomEvent("dirtynest-add-note", {
        detail: {
          title: `Research Dossier: ${msg.text.slice(0, 40)}...`,
          content: msg.text,
          tags: ["deep-research", "ai-dossier", "synthesis"],
        },
      })
    );
  };

  const toast = useToast();

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    if (isAcpMode) {
      if (acpIsStreaming) return;
      if (!customPrompt) setInput("");
      cyberAudio.play("click");

      let sId = acpActiveSessionId;
      if (!sId) {
        const newSession = await acpCreateSession(`Hermes Thread - ${textToSend.slice(0, 20)}...`);
        if (newSession) {
          sId = newSession.id;
        }
      }

      if (sId) {
        await sendPromptDirective(textToSend);
      }
      return;
    }

    if (isGenerating) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: timeStr,
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setIsGenerating(true);
    cyberAudio.play("click");

    const activeAiModel = AI_MODELS.find((m) => m.id === selectedModel);

    // Deep Research Multi-Phase Simulation (kept simulated for complex UI logic)
    if (activeMode === "deep_research") {
      const researchMsgId = `ai-research-${Date.now()}`;
      
      const subQueries = [
        `Deconstruct core mechanisms of: ${textToSend.slice(0, 50)}`,
        `Empirical benchmarks & arXiv research papers on ${textToSend.slice(0, 35)}`,
        `Production implementation patterns and security trade-offs`,
        `Obsidian Vault cross-reference: CyberVault/Zero_Trust.md & BPE_Tokenizer.md`,
      ];

      const mockSources: ResearchSource[] = [
        {
          title: "arXiv:2403.18921 - Deep Neural Synthesis & Kernel Acceleration",
          url: "https://arxiv.org/abs/2403.18921",
          sourceType: "arxiv",
          snippet: "Demonstrates 4.2x speedup in token generation using localized SIMD kernels and low-latency cache locality.",
          relevanceScore: 98,
        },
        {
          title: "Obsidian Vault // Skills/Karpathy/BPE_Tokenizer.md",
          url: "obsidian://open?vault=CyberVault&file=Skills/Karpathy/BPE_Tokenizer.md",
          sourceType: "obsidian",
          snippet: "Algorithmic pair merges, UTF-8 byte mappings, and vocabulary metrics from scratch.",
          relevanceScore: 95,
        },
        {
          title: "GitHub - dirtynest-core/ebpf-packet-gateway",
          url: "https://github.com/dirtynest/ebpf-gateway",
          sourceType: "github",
          snippet: "eBPF zero-trust filter daemon with XDP driver hook and 0.2ms latency SLA.",
          relevanceScore: 92,
        },
        {
          title: "Cloud Native Computing Foundation - Modern Security Spec 2026",
          url: "https://cncf.io/reports/security-mesh-2026",
          sourceType: "web",
          snippet: "Comparative survey of kernel isolation vs user-space sandbox isolation in distributed microservices.",
          relevanceScore: 89,
        },
      ];

      setActiveResearchSources(mockSources);

      const isCodeRequest = textToSend.toLowerCase().includes("code") || textToSend.toLowerCase().includes("component") || textToSend.toLowerCase().includes("react") || textToSend.toLowerCase().includes("sandbox");

      const finalReport = isCodeRequest
        ? `<thought>
Synthesizing requested full-stack React UI component with Tailwind CSS cyber styling.
Testing syntax validity, props contract, and animation hooks...
</thought>

### 💻 OPERATIONAL ARTIFACT GENERATED

Here is the requested high-throughput reactive component implementation:

\`\`\`tsx
import React, { useState } from 'react';
import { Shield, Zap, Terminal, Activity } from 'lucide-react';

export default function CyberTelemetryWidget() {
  const [active, setActive] = useState(true);
  const [load, setLoad] = useState(42);

  return (
    <div className="p-4 rounded-2xl bg-[#080A16] border border-[#00FF41]/40 text-white font-mono shadow-[0_0_25px_rgba(0,255,65,0.15)] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#00FF41] animate-pulse" />
          <span className="font-bold text-xs tracking-wider">NEURAL NODE #84</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] font-bold">ACTIVE</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-white/5">
          <span className="text-[#4F536E] text-[9px] block">THROUGHPUT</span>
          <span className="font-bold text-[#00F0FF]">14.8 GB/s</span>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <span className="text-[#4F536E] text-[9px] block">SYSTEM LOAD</span>
          <span className="font-bold text-[#FFB800]">{load}%</span>
        </div>
      </div>
      <button 
        onClick={() => setLoad(Math.floor(Math.random() * 60) + 30)}
        className="w-full py-2 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00FF41]/90 transition-all cursor-pointer"
      >
        CYCLE KERNEL TELEMETRY
      </button>
    </div>
  );
}
\`\`\`

- **Zero-Trust Memory Guard**: Component adheres to containerized eBPF isolation standards.
- Click **\`RUN IN LIVE CANVAS\`** above to mount and interact with this component in the live split-screen sandbox.`
        : `<thought>
Phase 1: Deep crawling arXiv (2403.18921), Obsidian Vault, and GitHub telemetry.
Phase 2: Extracting cross-domain parameter vectors and zero-trust benchmarks.
Phase 3: Synthesizing comparative matrix and executable directives.
</thought>

### 📄 DEEP RESEARCH EXECUTIVE REPORT: ${textToSend.toUpperCase()}

#### 1. Executive Summary & Core Findings
Based on synthesis across **4 authoritative sources** (arXiv, local Obsidian Vault, and GitHub telemetry), this architectural analysis reveals three critical paradigms:
- **Low-Latency Kernel Offloading**: Leveraging eBPF XDP filters achieves sub-millisecond packet routing without user-space context switches.
- **Vector Tokenization Efficiency**: Byte-level fallback mitigates out-of-vocabulary anomalies while preserving dense compression.
- **Zero-Trust Memory Isolation**: Enforcing capability-based permissions ensures resilience against unauthorized socket traversal.

---

#### 2. Comparative Technology Matrix
| Architecture Axis | Legacy Implementation | Modern Grounded Paradigm | Performance Multiplier |
| :--- | :--- | :--- | :--- |
| **Ingress Filtering** | User-space iptables | Kernel eBPF Hook | **4.2x Throughput** |
| **Token Representation** | Character BPE | Byte-Fallback BPE | **32% Memory Gain** |
| **Vector Indexing** | Flat Euclidean Scan | HNSW / SIMD Vector Pool | **18x Search Velocity** |

---

#### 3. Verified Citation Index
- **[1] [arXiv:2403.18921](https://arxiv.org/abs/2403.18921)** — *Deep Neural Synthesis & Kernel Acceleration* (Relevance: 98%)
- **[2] [[Skills/Karpathy/BPE_Tokenizer.md]]** — *Local Obsidian Vault Cognitive Core* (Relevance: 95%)
- **[3] [dirtynest-core/ebpf-gateway](https://github.com/dirtynest/ebpf-gateway)** — *eBPF Daemon Implementation* (Relevance: 92%)
- **[4] [CNCF Security Report 2026](https://cncf.io)** — *Microservice Isolation Standards* (Relevance: 89%)

---

#### 4. Recommended Action Directives
1. Deploy the compiled eBPF filter rule to \`dirtynest-auth-proxy\` container.
2. Ingest the newly resolved citations into the **DataCore SQLite-Vec** vector store.
3. Save this research dossier directly to the **Obsidian Vault** for automated backlink resolution.`;

      const initialAiMsg: Message = {
        id: researchMsgId,
        sender: "ai",
        text: "",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        model: activeAiModel?.name || "Nous-Hermes-3-70B",
        tokens: 0,
        citations: mockSources,
      };

      setMessages((prev) => [...prev, initialAiMsg]);

      const words = finalReport.split(" ");
      let currentWordIdx = 0;
      let streamedAccumulator = "";

      const streamTimer = setInterval(() => {
        if (currentWordIdx < words.length) {
          streamedAccumulator += (currentWordIdx === 0 ? "" : " ") + words[currentWordIdx];
          currentWordIdx++;
          const currentTokens = Math.floor(currentWordIdx * 1.3);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === researchMsgId
                ? {
                    ...msg,
                    text: streamedAccumulator,
                    tokens: currentTokens,
                  }
                : msg
            )
          );
        } else {
          clearInterval(streamTimer);
          setIsGenerating(false);
          cyberAudio.play("chime");
        }
      }, 16);
    } else {
      // ADR-0014: legacy /api/chat (Gemini proxy) retired. code_interpreter mode
      // rides the same Hermes ACP path as standard/reasoning (agents are the
      // fallback, not a second LLM proxy).
      if (acpIsStreaming || isGenerating) return;
      if (!customPrompt) setInput("");
      cyberAudio.play("click");

      const userMsg: Message = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text: textToSend,
        timestamp: timeStr,
        mode: activeMode,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsGenerating(true);

      let sId = acpActiveSessionId;
      if (!sId) {
        const newSession = await acpCreateSession(`Hermes Thread - ${textToSend.slice(0, 20)}...`);
        if (newSession) {
          sId = newSession.id;
        }
      }

      if (sId) {
        await sendPromptDirective(textToSend);
        setIsGenerating(false);
      } else {
        setIsGenerating(false);
        toast.error("NO ACP SESSION", "Could not create a Hermes session. Check sidecar status.");
      }
    }
  };

  const handleClearChat = () => {
    cyberAudio.play("click");
    setMessages([
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: "NEURAL BUFFER PURGED // COGNITIVE CORE READY FOR NEW QUERIES",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);
  };

  const handleSelectSession = (id: string) => {
    if (isAcpMode) {
      acpSelectSession(id);
    } else {
      setActiveSessionId(id);
    }
    setShowSessionsDrawer(false);
  };

  const handleCreateSession = async (folderId?: string) => {
    if (isAcpMode) {
      await acpCreateSession(`Hermes Thread #${acpSessions.length + 1}`);
    } else {
      const newId = `session-${Date.now()}`;
      const newSession: HermesChatSession = {
        id: newId,
        title: `Neural Thread #${sessions.length + 1}`,
        personaId: activePersona.id,
        personaName: activePersona.name.split(" ")[0],
        model: selectedModel,
        messageCount: 1,
        lastMessageSnippet: "Session initialized. Ready for operational directives.",
        updatedAt: "Just now",
        folderId,
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newId);
      setMessages([
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `NEW NEURAL SESSION INITIALIZED // PERSONA: ${activePersona.name.toUpperCase()} // READY`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
      ]);
    }
  };

  const handleTogglePinSession = (id: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s)));
  };

  const handleMoveSessionToFolder = (sessionId: string, folderId?: string) => {
    cyberAudio.play("click");
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, folderId } : s)));
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: ChatFolder = {
      id: `f-${Date.now()}`,
      name,
      color,
    };
    setFolders([...folders, newFolder]);
  };

  const handleRenameFolder = (id: string, newName: string) => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, name: newName } : f)));
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter((f) => f.id !== id));
    setSessions(sessions.map((s) => (s.folderId === id ? { ...s, folderId: undefined } : s)));
  };

  const handleToggleFolderCollapse = (id: string) => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f)));
  };

  const handleBranchSession = (sourceSessionId: string) => {
    const source = sessions.find((s) => s.id === sourceSessionId);
    const newId = `session-branch-${Date.now()}`;
    const branched: HermesChatSession = {
      id: newId,
      title: `Branch: ${source?.title || "Conversation"}`,
      personaId: activePersona.id,
      personaName: activePersona.name.split(" ")[0],
      model: selectedModel,
      messageCount: messages.length,
      lastMessageSnippet: messages[messages.length - 1]?.text.substring(0, 60) || "Branched timeline.",
      updatedAt: "Just now",
    };
    setSessions([branched, ...sessions]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = async (id: string) => {
    if (isAcpMode) {
      await acpDeleteSession(id);
    } else {
      if (sessions.length <= 1) return;
      const filtered = sessions.filter((s) => s.id !== id);
      setSessions(filtered);
      if (activeSessionId === id) setActiveSessionId(filtered[0].id);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  const handleExportSessionMarkdown = (id: string) => {
    const currentSess = sessions.find((s) => s.id === id);
    const mdContent = `# ${currentSess?.title || "DirtyNest AI Chat Session"}\n\n**Persona:** ${activePersona.name}\n**Model:** ${selectedModel}\n**Date:** ${new Date().toISOString()}\n\n---\n\n` +
      messages.map((m) => `### ${m.sender.toUpperCase()} [${m.timestamp}]\n\n${m.text}\n\n`).join("---\n\n");
    
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dirtynest-chat-${id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 pb-8 animate-fade-in font-mono select-none">
      {/* TOP DEEP RESEARCH & CHATBOT HUD */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.25) 0%, rgba(191,64,255,0.2) 100%)",
                border: "1px solid rgba(0,255,65,0.4)",
                boxShadow: "0 0 16px rgba(0,255,65,0.3)",
              }}
            >
              <Bot size={20} className="text-[#00FF41]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  NEURAL AI CHATBOT // <span className="text-[#00FF41]">DEEP RESEARCH CORE</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  MULTI-PHASE AGENT
                </span>
                <span className="text-[10px] font-bold text-[#BF40FF] px-2 py-0.5 rounded bg-[#BF40FF]/15 border border-[#BF40FF]/30 hidden sm:inline">
                  WEB + VAULT GROUNDED
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Autonomous recursive research agent · Extended thinking traces · Multi-source cross verification & Obsidian note export
              </span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {/* Sidebar Collapse / Expand Toggle */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSidebarOpen
                  ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                  : "bg-white/5 border-white/10 text-[#9499B3] hover:text-white"
              }`}
              title="Toggle Chat History Left Sidebar"
            >
              <GitBranch size={13} />
              <span>SIDEBAR {isSidebarOpen ? "ON" : "OFF"}</span>
            </button>

            {/* Persona Studio Trigger */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowPersonaModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
              style={{ color: activePersona.color }}
              title="Configure Agent Persona & Directives"
            >
              <Bot size={13} />
              <span>{activePersona.name.split(" ")[0].toUpperCase()}</span>
            </button>

            {/* Branching Thread Selector */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveBranch(activeBranch === "main" ? "alt" : "main");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
              title="Switch or Fork Conversation Branch"
            >
              <GitFork size={13} className="text-[#00FF41]" />
              <span>BRANCH: {activeBranch.toUpperCase()}</span>
            </button>

            {/* Live Artifact Canvas Toggle */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                if (activeArtifact) {
                  setActiveArtifact(null);
                } else {
                  setActiveArtifact({
                    title: "Tactical Micro-HUD Component",
                    language: "html",
                    code: `<div class="p-6 rounded-2xl bg-black/80 border border-[#00FF41]/40 text-center font-mono">
  <div class="inline-block px-3 py-1 rounded-full bg-[#00FF41]/10 text-[#00FF41] text-xs font-bold border border-[#00FF41]/30 animate-pulse mb-3">
    SYSTEM OPTIMAL · 99.98% SLA
  </div>
  <h2 class="text-xl font-bold text-white mb-2">DIRTYNEST TACTICAL NODE</h2>
  <p class="text-xs text-gray-400 max-w-sm mx-auto mb-4">Live Sandboxed Artifact Preview with Tailwind CSS and responsive CSS grid rendering.</p>
  <button class="px-4 py-2 rounded-xl bg-[#00FF41] text-black font-bold text-xs hover:bg-[#00cc34] transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)]">
    EXECUTE DIRECTIVE
  </button>
</div>`,
                  });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeArtifact
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-white/5 border-white/10 text-[#9499B3] hover:text-[#00F0FF]"
              }`}
              title="Toggle Interactive Artifacts Canvas"
            >
              <Eye size={13} />
              <span>CANVAS {activeArtifact ? "OPEN" : "OFF"}</span>
            </button>

            <button
              onClick={() => setShowSourcesDrawer(!showSourcesDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showSourcesDrawer
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-white/5 border-white/10 text-[#9499B3] hover:text-[#00F0FF]"
              }`}
            >
              <BookOpen size={13} />
              <span>SOURCES ({activeResearchSources.length})</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveView("settings");
              }}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
              title="Open AI Models & Inference Settings"
            >
              <Settings size={15} />
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showConfig
                  ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50"
                  : "bg-white/5 border-white/10 text-[#9499B3] hover:text-[#00FF41]"
              }`}
              title="Configure Model & Inference Knobs"
            >
              <Sliders size={15} />
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF2A6D]/40 text-[#9499B3] hover:text-[#FF2A6D] transition-all cursor-pointer"
              title="Purge Conversation History"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* 4 INTERACTIVE CHAT MODES SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-white/5">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveMode("deep_research");
              }}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === "deep_research"
                  ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "text-[#9499B3] hover:text-[#00FF41]"
              }`}
            >
              <Search size={13} />
              <span>DEEP RESEARCH</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveMode("reasoning");
              }}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === "reasoning"
                  ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_10px_rgba(191,64,255,0.2)]"
                  : "text-[#9499B3] hover:text-[#BF40FF]"
              }`}
            >
              <BrainCircuitIcon size={13} />
              <span>EXTENDED THINKING</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveMode("standard");
              }}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === "standard"
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "text-[#9499B3] hover:text-[#00F0FF]"
              }`}
            >
              <Zap size={13} />
              <span>SPEED CHAT</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setActiveMode("code_interpreter");
              }}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === "code_interpreter"
                  ? "bg-[#FFB800]/15 text-[#FFB800] font-bold border border-[#FFB800]/30 shadow-[0_0_10px_rgba(255,184,0,0.2)]"
                  : "text-[#9499B3] hover:text-[#FFB800]"
              }`}
            >
              <Code2 size={13} />
              <span>CODE SANDBOX</span>
            </button>
          </div>

          {/* Model Selector & Grounding Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedModel}
              onChange={(e) => {
                cyberAudio.play("click");
                setSelectedModel(e.target.value);
              }}
              className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-[#00FF41] font-bold outline-none cursor-pointer"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tag})
                </option>
              ))}
            </select>

            {/* RAG Toggle */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsVaultRagEnabled(!isVaultRagEnabled);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                isVaultRagEnabled
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                  : "bg-black/40 text-[#4F536E] border-white/5"
              }`}
              title="Toggle Obsidian Vault Vector Retrieval"
            >
              <Database size={12} />
              <span>RAG: {isVaultRagEnabled ? "ACTIVE" : "OFF"}</span>
            </button>

            {/* Web Search Toggle */}
            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsWebSearchEnabled(!isWebSearchEnabled);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                isWebSearchEnabled
                  ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/40"
                  : "bg-black/40 text-[#4F536E] border-white/5"
              }`}
              title="Toggle Web Search Grounding"
            >
              <Globe size={12} />
              <span>WEB: {isWebSearchEnabled ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE MODEL CONFIG PANEL */}
        {showConfig && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5 text-xs animate-fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[#9499B3]">Deep Research Intensity:</span>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(["fast", "standard", "exhaustive"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setResearchDepth(d)}
                    className={`py-1 rounded text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                      researchDepth === d
                        ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                        : "bg-black/40 border-white/5 text-[#4F536E]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[#9499B3]">Context Memory Length:</span>
              <span className="text-[#00F0FF] font-bold mt-1">128,000 Tokens (Full Vault Indexed)</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[#9499B3]">Execution Sandbox:</span>
              <span className="text-[#BF40FF] font-bold mt-1">V8 Isolate + eBPF Kernel Probe</span>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CHAT & RESEARCH WORKSPACE (2-COLUMN SPLIT SCREEN) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full relative">
        {/* LEFT CHAT THREADS & PERSONA SIDEBAR (STICKY ON SCROLL) */}
        {isSidebarOpen && (
          <div className="w-full lg:w-auto shrink-0 sticky top-4 self-start z-20 animate-fade-in">
            <ChatbotSidebar
              sessions={displaySessions}
              activeSessionId={displayActiveSessionId}
              onSelectSession={handleSelectSession}
              onCreateSession={handleCreateSession}
              onBranchSession={handleBranchSession}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
              onTogglePinSession={handleTogglePinSession}
              onMoveSessionToFolder={handleMoveSessionToFolder}
              onExportSessionMarkdown={handleExportSessionMarkdown}
              folders={folders}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onToggleFolderCollapse={handleToggleFolderCollapse}
              activePersona={activePersona}
              onOpenPersonaStudio={() => setShowPersonaModal(true)}
            />
          </div>
        )}

        {/* RIGHT MAIN CHAT CONVERSATION WORKSPACE */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full min-w-0">
          {/* MESSAGES THREAD */}
          <div 
            className={`relative cyber-card p-4 flex flex-col justify-between gap-4 w-full transition-colors ${activeArtifact ? "lg:col-span-6" : showSourcesDrawer ? "lg:col-span-8" : "lg:col-span-12"} ${isDragging ? "border-[#00FF41] shadow-[0_0_30px_rgba(0,255,65,0.1)]" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          >
          {/* Mock Drag Overlay */}
          {isDragging && (
             <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-[#00FF41] bg-[#00FF41]/10 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in pointer-events-none">
                <FileCode size={48} className="text-[#00FF41] animate-bounce" />
                <span className="text-[#00FF41] font-bold font-mono mt-4 tracking-widest text-lg shadow-black drop-shadow-md">DROP ASSETS TO ATTACH</span>
             </div>
          )}

          {/* Natural Full-Page Messages Stream (No inner scrollbar) */}
          <div className="flex flex-col gap-3.5 w-full max-w-[88%] 2xl:max-w-[80%] mx-auto pb-44">
            {displayMessages.map((msg: Message) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="p-2 rounded-full bg-white/[0.02] border border-white/10 text-center text-[10px] text-[#9499B3] font-mono tracking-wider mx-auto max-w-lg my-1">
                    {msg.text}
                  </div>
                );
              }

              return (
                <div key={msg.id} className="w-full">
                  <HermesMessageBlock
                    content={msg.text}
                    sender={msg.sender === "user" ? "user" : "bot"}
                    timestamp={msg.timestamp}
                    model={msg.model}
                    tokens={msg.tokens}
                    onSaveToObsidian={() => handleSaveToObsidian(msg)}
                    onOpenArtifact={(artifact) => setActiveArtifact(artifact)}
                    onEdit={(text) => {
                      setInput(text);
                      if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.style.height = "auto";
                        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
                      }
                    }}
                    onRegenerate={() => {
                      const lastUser = [...displayMessages].reverse().find((m) => m.sender === "user");
                      if (lastUser) {
                        handleSend(lastUser.text);
                      }
                    }}
                  />
                </div>
              );
            })}
            
            {/* Live Neural Inference Indicator while generating */}
            {isGenerating && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#090B14]/90 border border-[#00FF41]/30 w-full animate-slide-up-fade text-xs font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                <div className="w-5 h-5 rounded-md bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
                  <Brain size={12} className="animate-pulse" />
                </div>
                <span className="text-[#00FF41] font-bold tracking-wider text-[11px]">
                  HERMES NEURAL SYNAPSE REASONING & SYNTHESIS...
                </span>
                <span className="inline-block w-2 h-3.5 bg-[#00FF41] animate-caret-blink" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Sticky Bottom Composer Dock */}
          <div className="sticky bottom-6 lg:bottom-8 z-30 w-full pointer-events-none">
            {/* Floating Scroll to Bottom Quick Button */}
            {showScrollBottom && (
              <div className="flex justify-center mb-3 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    cyberAudio.play("click");
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1022]/95 border border-[#00FF41]/40 text-[#00FF41] text-[11px] font-bold shadow-[0_0_25px_rgba(0,255,65,0.3)] hover:bg-[#00FF41] hover:text-black transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md animate-slide-up-fade"
                >
                  <ChevronDown size={13} className="animate-bounce" />
                  <span>LATEST MESSAGES</span>
                </button>
              </div>
            )}

            <div className="w-full max-w-[88%] 2xl:max-w-[80%] mx-auto pointer-events-auto">
              {/* Interactive Compositor (Self-contained Solid Card with Ambient Glow) */}
              <div className="relative bg-[#080A16] border border-white/20 hover:border-white/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] focus-within:border-[#00FF41]/60 focus-within:shadow-[0_0_35px_rgba(0,255,65,0.2)] transition-all duration-300 flex flex-col w-full overflow-hidden">
                
                {/* Deep Research Prompt Starters Bar */}
                <div className="flex items-center gap-2 px-3.5 py-2 bg-[#0D1022] border-b border-white/10 overflow-x-auto scrollbar-none">
                  <span className="text-[9px] text-[#4F536E] uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#00FF41]" />
                    <span>STARTERS:</span>
                  </span>
                  {DEEP_RESEARCH_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      onClick={() => handleSend(tpl.prompt)}
                      disabled={isGenerating}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] text-[10px] whitespace-nowrap transition-all duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              
              {/* Slash Command Popover */}
              {showSlashMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/5 text-[10px] text-[#4F536E] uppercase font-bold tracking-wider flex justify-between">
                    <span>Slash Commands</span>
                    <kbd className="font-mono bg-white/5 px-1 rounded">ESC</kbd>
                  </div>
                  <div className="p-1 flex flex-col">
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput("/deep-research "); setShowSlashMenu(false); textareaRef.current?.focus(); }}>
                      <Globe size={14} className="text-[#00FF41]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">/deep-research</span><span className="text-[10px] text-[#9499B3]">Autonomous multi-step crawler</span></div>
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput("/sandbox "); setShowSlashMenu(false); textareaRef.current?.focus(); }}>
                      <Code2 size={14} className="text-[#00F0FF]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">/sandbox</span><span className="text-[10px] text-[#9499B3]">Execute code in isolated VM</span></div>
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput("/vault "); setShowSlashMenu(false); textareaRef.current?.focus(); }}>
                      <Database size={14} className="text-[#BF40FF]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">/vault</span><span className="text-[10px] text-[#9499B3]">Query local Obsidian knowledge</span></div>
                    </button>
                  </div>
                </div>
              )}

              {/* Context Mentions Popover */}
              {showMentionMenu && (
                <div className="absolute bottom-full left-10 mb-2 w-72 bg-[#0A0A0A]/95 backdrop-blur-2xl border border-[#00F0FF]/30 rounded-xl shadow-[0_-10px_40px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/5 text-[10px] text-[#00F0FF] uppercase font-bold tracking-wider flex justify-between">
                    <span>Include Context</span>
                    <kbd className="font-mono bg-white/5 px-1 rounded text-[#4F536E]">ESC</kbd>
                  </div>
                  <div className="p-1 flex flex-col max-h-[200px] overflow-y-auto scrollbar-none">
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput(input.replace(/@$/, "") + "@Obsidian_Vault "); setShowMentionMenu(false); textareaRef.current?.focus(); }}>
                      <Database size={14} className="text-[#BF40FF]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">@Obsidian_Vault</span><span className="text-[10px] text-[#9499B3]">Local Markdown Knowledge</span></div>
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput(input.replace(/@$/, "") + "@Workspace "); setShowMentionMenu(false); textareaRef.current?.focus(); }}>
                      <Code2 size={14} className="text-[#00F0FF]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">@Workspace</span><span className="text-[10px] text-[#9499B3]">Current Git Repository</span></div>
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer" onClick={() => { setInput(input.replace(/@$/, "") + "@UI_Mockups "); setShowMentionMenu(false); textareaRef.current?.focus(); }}>
                      <ImageIcon size={14} className="text-[#FF2A6D]" />
                      <div className="flex flex-col"><span className="text-xs text-[#F1F3F9] font-bold">@UI_Mockups</span><span className="text-[10px] text-[#9499B3]">Figma Integration</span></div>
                    </button>
                  </div>
                </div>
              )}

              {/* Attachments Preview Area */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 bg-[#1A1A24]/80 border border-white/10 rounded-lg px-2.5 py-1.5 relative group hover:border-[#00F0FF]/40 transition-colors">
                      {att.type === 'image' && <ImageIcon size={12} className="text-[#BF40FF]" />}
                      {att.type === 'video' && <Video size={12} className="text-[#FF2A6D]" />}
                      {att.type === 'file' && <FileCode size={12} className="text-[#00F0FF]" />}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#F1F3F9] font-mono truncate max-w-[120px]">{att.name}</span>
                        <span className="text-[8px] text-[#4F536E] font-mono">{att.size}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                        className="text-[#4F536E] hover:text-[#FF2A6D] ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 rounded-full hover:bg-white/10"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSlashMenu(false);
                    setShowMentionMenu(false);
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={
                  activeMode === "deep_research"
                    ? "Enter deep research query (e.g. 'Investigate eBPF zero-trust mesh vs Istio performance benchmarks')..."
                    : activeMode === "reasoning"
                    ? "Enter complex reasoning directive with extended thinking..."
                    : "Type a message, press / for commands, @ to mention context..."
                }
                className="w-full bg-transparent px-4 py-3 text-xs text-[#F1F3F9] font-mono outline-none placeholder:text-[#4F536E] resize-none overflow-y-auto scrollbar-none"
                style={{ minHeight: "44px", maxHeight: "200px" }}
              />

              <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-[#9499B3]">
                  <button type="button" className="p-1.5 hover:bg-white/10 rounded-lg hover:text-[#F1F3F9] transition-colors group relative cursor-pointer" title="Add Attachment (Files, Images)">
                    <Paperclip size={14} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-white/10 rounded-lg hover:text-[#00F0FF] transition-colors cursor-pointer" title="Mention Context (@)">
                    <AtSign size={14} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-white/10 rounded-lg hover:text-[#BF40FF] transition-colors cursor-pointer" onClick={() => setShowSlashMenu(!showSlashMenu)} title="Slash Commands (/)">
                    <TerminalSquare size={14} />
                  </button>
                  <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                  <button type="button" className="p-1.5 hover:bg-[#FFB800]/20 rounded-lg hover:text-[#FFB800] transition-colors cursor-pointer" title="Voice Input">
                    <Mic size={14} />
                  </button>
                  <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                  
                  {/* Model Selector Inside Compositor */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowModelMenu(!showModelMenu)}
                      className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 rounded-lg text-[10px] text-[#9499B3] hover:text-[#00FF41] font-mono transition-all cursor-pointer"
                    >
                      <Cpu size={12} />
                      <span className="truncate max-w-[100px] hidden sm:block">{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                      <ChevronUp size={10} />
                    </button>
                    {showModelMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-fade-in">
                        <div className="px-3 py-1.5 border-b border-white/5 text-[9px] text-[#4F536E] uppercase font-bold tracking-wider">Select Engine</div>
                        {AI_MODELS.map(model => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => { setSelectedModel(model.id); setShowModelMenu(false); }}
                            className={`flex items-center justify-between px-3 py-2 text-left text-[11px] transition-colors cursor-pointer ${selectedModel === model.id ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'hover:bg-white/5 text-[#9499B3] hover:text-[#F1F3F9]'}`}
                          >
                            <span>{model.name}</span>
                            {selectedModel === model.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block"></div>

                  {/* Web Search Toggle */}
                  <button 
                    type="button"
                    onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                    className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${isWebSearchEnabled ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'hover:bg-white/5 text-[#4F536E] hover:text-[#9499B3]'}`}
                  >
                    <Globe size={12} />
                    <span>WEB</span>
                  </button>

                  {/* Live Prompt Token Estimator */}
                  {input.trim().length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00FF41]/10 border border-[#00FF41]/30 text-[10px] text-[#00FF41] font-mono animate-fade-in">
                      <Sparkles size={10} />
                      <span>~{Math.ceil(input.trim().length / 4)} tok</span>
                    </span>
                  )}

                  {/* Context Window Token Meter */}
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded-lg text-[10px] text-[#9499B3] font-mono cursor-default transition-colors">
                    <Layers size={10} className="text-[#BF40FF]" />
                    <span>14.2k / 128k</span>
                    <div className="w-10 h-1 bg-white/10 rounded-full ml-1 overflow-hidden">
                      <div className="h-full bg-[#BF40FF] w-[11%] shadow-[0_0_5px_rgba(191,64,255,0.8)]"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#4F536E] hidden sm:block mr-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono border border-white/10">↵</kbd> Send
                    <span className="mx-1">·</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono border border-white/10">⇧↵</kbd> New Line
                  </span>
                  
                  {isGenerating ? (
                    <button
                      onClick={() => setIsGenerating(false)}
                      className="px-4 py-2 rounded-xl bg-[#FF2A6D]/20 border border-[#FF2A6D]/40 text-[#FF2A6D] hover:bg-[#FF2A6D]/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <StopCircle size={14} />
                      <span>HALT</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="px-4 py-2 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] disabled:opacity-40 disabled:shadow-none flex items-center gap-1.5 cursor-pointer"
                    >
                      <CornerDownLeft size={14} />
                      <span>TRANSMIT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* ARTIFACTS LIVE CANVAS PANE (6-Cols) */}
        {activeArtifact && (
          <div className="lg:col-span-6 sticky top-4 animate-fade-in">
            <ArtifactsCanvas
              title={activeArtifact.title}
              language={activeArtifact.language}
              code={activeArtifact.code}
              onClose={() => setActiveArtifact(null)}
            />
          </div>
        )}

        {/* RIGHT SOURCES & CITATION EXPLORER (4 Cols) */}
        {showSourcesDrawer && !activeArtifact && (
          <div className="lg:col-span-4 cyber-card p-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#00F0FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9]">DISCOVERED RESEARCH CITATIONS</h3>
              </div>
              <button onClick={() => setShowSourcesDrawer(false)} className="text-xs text-[#4F536E] hover:text-[#F1F3F9] cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {activeResearchSources.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#4F536E]">
                  No active research citations. Launch a Deep Research query to populate sources.
                </div>
              ) : (
                activeResearchSources.map((src, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#F1F3F9] leading-snug">{src.title}</span>
                      <span className="text-[10px] text-[#00FF41] font-mono shrink-0">{src.relevanceScore}% match</span>
                    </div>
                    <p className="text-[11px] text-[#9499B3] leading-relaxed italic">&quot;{src.snippet}&quot;</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                      <span className="text-[#00F0FF] uppercase font-mono">{src.sourceType}</span>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[#4F536E] hover:text-[#00FF41] flex items-center gap-1">
                        <span>OPEN</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Sessions History Drawer */}
      <ChatbotSessionsDrawer
        isOpen={showSessionsDrawer}
        onClose={() => setShowSessionsDrawer(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onBranchSession={handleBranchSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onExportSessionMarkdown={handleExportSessionMarkdown}
      />

      {/* Persona Studio Modal */}
      <PersonaStudioModal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        activePersona={activePersona}
        onSavePersona={(updated) => setActivePersona(updated)}
      />
    </div>
  );
}

function BrainCircuitIcon(props: React.ComponentProps<typeof Cpu>) {
  return <Cpu {...props} />;
}
