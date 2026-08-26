"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  Trash2,
  Copy,
  Check,
  Code2,
  Terminal,
  Shield,
  Zap,
  Sliders,
  RotateCcw,
  Download,
  Flame,
  Database,
  Search,
  Globe,
  FileText,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  BookOpen,
  Volume2,
  GitBranch,
  ArrowRight,
  Clock,
  Compass,
  Paperclip,
  StopCircle,
  TerminalSquare,
  AtSign,
  CornerDownLeft,
  Mic,
  Plus,
  Image as ImageIcon,
  Video,
  X,
  FileCode
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

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
  const [activeMode, setActiveMode] = useState<ChatMode>("deep_research");
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
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: "image" | "video" | "file"; size: string }[]>([
    { id: "att-1", name: "system_architecture.png", type: "image", size: "2.4 MB" },
    { id: "att-2", name: "auth_service.ts", type: "file", size: "14 KB" }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      sender: "system",
      text: "NEURAL LINK ESTABLISHED // DEEP RESEARCH ENGINE ONLINE // GROUNDING: WEB + OBSIDIAN VAULT + CODE SANDBOX",
      timestamp: "06:00:01",
    },
    {
      id: "ai-1",
      sender: "ai",
      text: "Greetings, Commander. DirtyNest Deep Research Subsystem is fully initialized with recursive web search, Obsidian Vault vector embeddings, and multi-step cognitive reasoning. Select a research template or enter your operational directive to begin.",
      timestamp: "06:00:04",
      model: "Gemini 3.7 Flash",
      tokens: 42,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

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

  const handleSend = (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isGenerating) return;

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

    // Deep Research Multi-Phase Simulation
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

      // Phase 1: Planning
      const initialAiMsg: Message = {
        id: researchMsgId,
        sender: "ai",
        text: "Initiating multi-phase deep research protocol...",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        model: activeAiModel?.name,
        mode: "deep_research",
        thinkingTimeSec: 2.4,
        thinkingTrace: `1. Decomposing user prompt into 4 search axes.\n2. Checking SQLite-Vec knowledge embeddings for cosine similarity.\n3. Dispatching parallel search crawl across arXiv, GitHub, and web citations.\n4. Synthesizing citations into structured Markdown dossier.`,
        researchData: {
          status: "planning",
          subQueries,
          crawledSources: [],
          activeStepText: "Phase 1/4: Query Decomposition & Sub-Task Planning...",
          thinkingSeconds: 2.4,
          totalTokens: 620,
        },
      };

      setMessages((prev) => [...prev, initialAiMsg]);

      // Phase 2: Searching & Crawling
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === researchMsgId
              ? {
                  ...msg,
                  researchData: {
                    ...msg.researchData!,
                    status: "searching",
                    crawledSources: mockSources.slice(0, 2),
                    activeStepText: "Phase 2/4: Crawling & Semantic Vector Search (2/4 sources indexed)...",
                    thinkingSeconds: 6.8,
                  },
                }
              : msg
          )
        );
        cyberAudio.play("click");
      }, 1500);

      // Phase 3: Reading & Fact Verification
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === researchMsgId
              ? {
                  ...msg,
                  researchData: {
                    ...msg.researchData!,
                    status: "reading",
                    crawledSources: mockSources,
                    activeStepText: "Phase 3/4: Extracting Key Evidence & Cross-Referencing Knowledge Vault...",
                    thinkingSeconds: 11.2,
                  },
                }
              : msg
          )
        );
        cyberAudio.play("click");
      }, 3000);

      // Phase 4: Final Synthesis Report
      setTimeout(() => {
        const finalReport = `### 📑 DEEP RESEARCH EXECUTIVE REPORT: ${textToSend.toUpperCase()}

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

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === researchMsgId
              ? {
                  ...msg,
                  text: finalReport,
                  tokens: 1480,
                  thinkingTimeSec: 14.8,
                  citations: mockSources,
                  researchData: {
                    ...msg.researchData!,
                    status: "completed",
                    activeStepText: "Phase 4/4: Research Synthesis Completed · 4 Sources Verified",
                    thinkingSeconds: 14.8,
                    totalTokens: 1480,
                  },
                }
              : msg
          )
        );
        setIsGenerating(false);
        cyberAudio.play("chime");
      }, 4800);
    } else {
      // Standard or Extended Reasoning response
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `**Directive Acknowledged.** Analyzing: "${textToSend}"\n\nExecution completed within the ${activeAiModel?.name} neural framework. Telemetry verified and aligned with active DirtyNest runtime protocols.`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          model: activeAiModel?.name,
          tokens: 420,
          mode: activeMode,
          thinkingTimeSec: activeMode === "reasoning" ? 6.2 : undefined,
          thinkingTrace:
            activeMode === "reasoning"
              ? `* Checked constraints and context boundaries.\n* Evaluated potential security implications.\n* Formulated direct, actionable response.`
              : undefined,
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsGenerating(false);
        cyberAudio.play("chime");
      }, 1200);
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

      {/* MAIN CHAT & RESEARCH WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* MESSAGES THREAD (Full or 8-Cols if Sources Drawer Open) */}
        <div 
          className={`relative cyber-card p-4 flex flex-col justify-between gap-4 min-h-[580px] transition-colors ${showSourcesDrawer ? "lg:col-span-8" : "lg:col-span-12"} ${isDragging ? "border-[#00FF41] shadow-[0_0_30px_rgba(0,255,65,0.1)]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* in a real app, handle files here */ }}
        >
          {/* Mock Drag Overlay */}
          {isDragging && (
             <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-[#00FF41] bg-[#00FF41]/10 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in pointer-events-none">
                <FileCode size={48} className="text-[#00FF41] animate-bounce" />
                <span className="text-[#00FF41] font-bold font-mono mt-4 tracking-widest text-lg shadow-black drop-shadow-md">DROP ASSETS TO ATTACH</span>
             </div>
          )}

          {/* Scrollable Messages Stream */}
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[520px] pr-2">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isSystem = msg.sender === "system";

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-center text-[11px] text-[#4F536E] font-mono tracking-wider">
                    {msg.text}
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 text-[10px] text-[#4F536E]">
                    <span>{isUser ? "OPERATOR // DIRECTIVE" : msg.model || "DIRTYNEST AI"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.tokens && (
                      <span className="px-1.5 py-0.2 rounded bg-white/5 text-[#00FF41]">
                        {msg.tokens} tok
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl max-w-3xl leading-relaxed text-xs ${
                      isUser
                        ? "bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#F1F3F9] shadow-[0_0_15px_rgba(0,255,65,0.08)]"
                        : "bg-black/60 border border-white/10 text-[#F1F3F9] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {/* Collapsible Extended Thinking Trace */}
                    {msg.thinkingTrace && (
                      <div className="mb-3 pb-3 border-b border-white/10 flex flex-col gap-1.5">
                        <button
                          onClick={() => toggleThinkingExpand(msg.id)}
                          className="flex items-center justify-between w-full text-[11px] text-[#BF40FF] font-bold cursor-pointer hover:underline"
                        >
                          <div className="flex items-center gap-1.5">
                            <BrainCircuitIcon size={13} className="text-[#BF40FF]" />
                            <span>
                              {expandedThinkingIds[msg.id] ? "Hide Thinking Process" : `Thought for ${msg.thinkingTimeSec || 4.2}s`}
                            </span>
                          </div>
                          {expandedThinkingIds[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {expandedThinkingIds[msg.id] && (
                          <pre className="p-3 bg-black/80 rounded-xl text-[11px] text-[#9499B3] font-mono whitespace-pre-wrap leading-relaxed border border-white/5 animate-fade-in">
                            {msg.thinkingTrace}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Live Deep Research Multi-Phase Progress Tree */}
                    {msg.researchData && (
                      <div className="mb-4 p-3.5 rounded-xl bg-black/70 border border-[#00FF41]/30 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Search size={14} className="text-[#00FF41]" />
                            <span className="font-black text-[#F1F3F9]">DEEP RESEARCH EXECUTION PIPELINE</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              msg.researchData.status === "completed"
                                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                                : "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 animate-pulse"
                            }`}
                          >
                            {msg.researchData.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Current Active Step */}
                        <div className="p-2.5 rounded-lg bg-black/90 border border-white/5 flex items-center gap-2 text-xs text-[#00FF41]">
                          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                          <span>{msg.researchData.activeStepText}</span>
                        </div>

                        {/* Sub-Queries Planned */}
                        {msg.researchData.subQueries.length > 0 && (
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Generated Sub-Query Axes:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {msg.researchData.subQueries.map((q, idx) => (
                                <div key={idx} className="p-1.5 rounded bg-black/40 border border-white/5 text-[#9499B3] text-[10px] truncate">
                                  #{idx + 1}: {q}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Discovered Citations Pills */}
                        {msg.researchData.crawledSources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                            {msg.researchData.crawledSources.map((src, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] border border-[#00F0FF]/30 font-mono"
                              >
                                <span>{src.sourceType.toUpperCase()}</span>
                                <span className="text-[#9499B3]">· {src.title.slice(0, 24)}...</span>
                                <strong className="text-[#00FF41]">({src.relevanceScore}%)</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Markdown Text Output */}
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#F1F3F9]">
                      {msg.text}
                    </div>

                    {/* Action Bar for AI message */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5 text-[10px] text-[#4F536E]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="flex items-center gap-1 hover:text-[#00FF41] cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedId === msg.id ? "COPIED" : "COPY"}</span>
                          </button>

                          {msg.mode === "deep_research" && (
                            <button
                              onClick={() => handleSaveToObsidian(msg)}
                              className="flex items-center gap-1 hover:text-[#00F0FF] cursor-pointer"
                            >
                              <Database size={12} />
                              <span>SAVE TO OBSIDIAN</span>
                            </button>
                          )}
                        </div>

                        {msg.citations && (
                          <span className="text-[#00FF41] font-bold">
                            {msg.citations.length} VERIFIED CITATIONS
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Templates Quick Carousel */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase font-bold">Deep Research Prompt Starters:</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DEEP_RESEARCH_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => handleSend(tpl.prompt)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] text-[11px] whitespace-nowrap transition-all cursor-pointer disabled:opacity-40"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Interactive Compositor */}
            <div className="relative mt-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl focus-within:border-[#00FF41]/40 focus-within:shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-all flex flex-col">
              
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

        {/* RIGHT SOURCES & CITATION EXPLORER (4 Cols) */}
        {showSourcesDrawer && (
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
  );
}

function BrainCircuitIcon(props: any) {
  return <Cpu {...props} />;
}
