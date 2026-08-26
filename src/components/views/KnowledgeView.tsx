"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Database,
  Search,
  Plus,
  FileText,
  ShieldAlert,
  Server,
  Code2,
  Cpu,
  Layers,
  UploadCloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  Trash2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen,
  Share2,
  Eye,
  Terminal,
  Activity,
  Zap,
  Tag,
  BookOpen,
  Bot,
  Compass,
  Network,
  Workflow,
  BrainCircuit,
  FileCode,
  Link2,
  FolderSync,
  Play,
  ArrowUpRight,
  Sliders,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import SemanticRagTester from "./knowledge/SemanticRagTester";

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: "Threat Intel" | "System Arch" | "API Contracts" | "Code Runbooks" | "Neural Memory" | "Karpathy Skills" | "Obsidian Wiki";
  slug: string;
  tags: string[];
  tokens: number;
  chunks: number;
  vectors: string;
  similarity?: number;
  updatedAt: string;
  author: string;
  content: string;
  embeddingSnippet: number[];
  obsidianPath?: string;
  backlinks?: string[];
  wikiLinks?: string[];
  isKarpathySkill?: boolean;
}

const INITIAL_DOCS: KnowledgeDoc[] = [
  {
    id: "skill-01",
    title: "Karpathy Skill: BPE Tokenizer from Scratch",
    category: "Karpathy Skills",
    slug: "/karpathy/bpe-tokenizer-from-scratch.md",
    tags: ["karpathy", "tokenizer", "bpe", "llm-core", "skills"],
    tokens: 940,
    chunks: 2,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 04:45",
    author: "KARPATHY-NEURAL-01",
    obsidianPath: "Skills/Karpathy/BPE_Tokenizer.md",
    backlinks: ["Zero-Trust Mesh Topology", "Neural Long-Term Memory Buffer"],
    wikiLinks: ["[[Autoresearch Agent Loop]]", "[[NanoGPT KV-Cache Attention]]"],
    isKarpathySkill: true,
    embeddingSnippet: [0.1284, -0.0492, 0.5182, 0.1983, -0.0812, 0.4491, 0.2201],
    content: `---
title: BPE Tokenizer from Scratch
category: Karpathy Skills
tags: [karpathy, tokenizer, bpe, llm-core]
skill_level: EXPERT
author: Andrej Karpathy (Refactored for DirtyNest)
---

# Karpathy Skill: Byte-Pair Encoding (BPE) Tokenizer

## Mental Model
Language models do not process text; they process integer IDs. **BPE** starts from raw UTF-8 bytes (vocabulary size 256) and iteratively merges the most frequent consecutive pairs to build a compact vocabulary.

### Core Algorithmic Loop (Python Implementation)
\`\`\`python
def get_pair_stats(vocab_ids):
    counts = {}
    for pair in zip(vocab_ids, vocab_ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts

def merge_vocab(vocab_ids, pair, new_token_id):
    new_ids = []
    i = 0
    while i < len(vocab_ids):
        if i < len(vocab_ids) - 1 and (vocab_ids[i], vocab_ids[i+1]) == pair:
            new_ids.append(new_token_id)
            i += 2
        else:
            new_ids.append(vocab_ids[i])
            i += 1
    return new_ids
\`\`\`

## Key Takeaways
1. **Vocabulary Ceiling**: Standard GPT-4/Claude tokenizers use ~100k tokens.
2. **Byte Fallback**: Ensuring byte-level encoding prevents out-of-vocabulary (<UNK>) errors.
3. Connected nodes: [[Autoresearch Agent Loop]], [[NanoGPT KV-Cache Attention]].`,
  },
  {
    id: "skill-02",
    title: "Karpathy Skill: Autoresearch Autonomous Agent Loop",
    category: "Karpathy Skills",
    slug: "/karpathy/autoresearch-agent-loop.md",
    tags: ["karpathy", "agent-loop", "autoresearch", "swarm", "evals"],
    tokens: 1120,
    chunks: 3,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 04:30",
    author: "KARPATHY-NEURAL-01",
    obsidianPath: "Skills/Karpathy/Autoresearch_Loop.md",
    backlinks: ["DirtyNest Swarm Protocol & Agent IPC Specification v2"],
    wikiLinks: ["[[BPE Tokenizer from Scratch]]", "[[LLM-OS Kernel Architecture]]"],
    isKarpathySkill: true,
    embeddingSnippet: [-0.0912, 0.3841, 0.1192, -0.2201, 0.4491, -0.0124, 0.3129],
    content: `---
title: Autoresearch Autonomous Agent Loop
category: Karpathy Skills
tags: [karpathy, autoresearch, agents, evals]
skill_level: ADVANCED
---

# Karpathy Skill: Autonomous Research & Experimentation Loop

## The LLM Autoresearch Paradigm
An autonomous research agent operates not as a chatbot, but as an infinite hypothesis-test-iterate loop over code repositories.

### The 4-Phase Cycle
1. **Hypothesis Formulation**: Generate candidate parameter tweaks or architectural diffs.
2. **Execution Sandbox**: Spawn isolated subprocess to train/benchmark for $N$ iterations.
3. **Evaluation Matrix**: Parse loss curves, validation P99 latency, and accuracy SLA.
4. **Git Commit / Rollback**: Auto-commit winners to branch; discard regressions.

\`\`\`typescript
interface AutoresearchEngine {
  generateCandidateDiff(): Promise<GitDiff>;
  executeBenchmark(diff: GitDiff): Promise<BenchmarkMetrics>;
  validateScore(metrics: BenchmarkMetrics): boolean;
  commitWinner(): Promise<void>;
}
\`\`\`

Connected to Obsidian Wiki: [[LLM-OS Kernel Architecture]], [[Swarm Protocol v2]].`,
  },
  {
    id: "skill-03",
    title: "Karpathy Skill: LLM-OS Kernel & Context Memory Management",
    category: "Karpathy Skills",
    slug: "/karpathy/llm-os-architecture.md",
    tags: ["karpathy", "llm-os", "architecture", "operating-systems"],
    tokens: 1050,
    chunks: 2,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 04:10",
    author: "KARPATHY-NEURAL-01",
    obsidianPath: "Skills/Karpathy/LLM_OS_Kernel.md",
    backlinks: ["Zero-Trust Mesh Topology", "Neural Long-Term Memory Buffer"],
    wikiLinks: ["[[Autoresearch Agent Loop]]", "[[SQLite Vector Ingestion]]"],
    isKarpathySkill: true,
    embeddingSnippet: [0.3124, -0.0512, 0.1824, 0.2912, -0.4019, 0.1192, 0.0482],
    content: `---
title: LLM-OS Kernel Architecture
category: Karpathy Skills
tags: [karpathy, llm-os, operating-systems, ram]
skill_level: ARCHITECT
---

# Karpathy Skill: LLM as Operating System Kernel

## The Conceptual Mapping
| Traditional OS | LLM Operating System |
| :--- | :--- |
| **CPU Core** | Transformer Inference Engine (Gemini / Claude / GPT) |
| **RAM (Working Memory)** | Context Window Tokens (128k–1M token window) |
| **Disk Storage (Persistent)** | Vector DB / SQLite-Vec / Obsidian Vault |
| **Device Drivers / IO** | Tool Calling / MCP Server Protocols |
| **User Space GUI** | DirtyNest HUD & Interactive Command Palette |

### Context Window Paging & Compaction
When context tokens exceed 80% ceiling, trigger automatic hierarchical summarization and flush old conversational rounds to [[SQLite Vector Ingestion]].`,
  },
  {
    id: "doc-01",
    title: "Zero-Trust Mesh Topology & eBPF Daemon Gateway",
    category: "System Arch",
    slug: "/arch/zero-trust-ebpf-mesh.md",
    tags: ["ebpf", "wireguard", "mesh-vpn", "zero-trust"],
    tokens: 840,
    chunks: 2,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-24 22:15",
    author: "ARCH-BOT-09",
    obsidianPath: "Architecture/Zero_Trust_eBPF_Mesh.md",
    backlinks: ["BPE Tokenizer from Scratch", "Production Incident Triage"],
    wikiLinks: ["[[CVE-2026-9811 Mitigation]]", "[[Swarm IPC Protocol]]"],
    embeddingSnippet: [0.0382, -0.1942, 0.4281, 0.0812, -0.2201, 0.6124, 0.0092],
    content: `---
title: Zero-Trust Mesh Topology & eBPF Daemon Gateway
category: System Arch
tags: [ebpf, wireguard, mesh-vpn, zero-trust]
vault: CyberVault
status: APPROVED
---

# Zero-Trust Mesh Topology & eBPF Daemon Gateway

## Executive Architecture
DirtyNest clusters communicate across an encrypted WireGuard flat network topology governed by an autonomous **eBPF-driven** kernel filter. All inter-node Remote Procedure Calls (gRPC/HTTP3) require mutual TLS 1.3 with ephemeral cryptographic hardware tokens.

### Packet Routing Flow
\`\`\`text
[Node Ingress] -> [eBPF TC Ingress Filter] -> [mTLS Handshake] -> [Envoy Sidecar] -> [Target Core]
\`\`\`

### Security Directives
- **Strict Isolation**: Pods cannot traverse namespaces without hardware crypt-signing.
- **Kernel Filter**: Any unauthenticated SYN packet is discarded within 120 nanoseconds.
- **Latency SLA**: < 1.4ms cross-regional packet replication.

Linked Wiki Notes: [[CVE-2026-9811 Mitigation]], [[Swarm IPC Protocol]].`,
  },
  {
    id: "doc-02",
    title: "Autonomous Red-Team Threat Recon Directive [CVE-2026-9811]",
    category: "Threat Intel",
    slug: "/threat/cve-2026-9811-mitigation.md",
    tags: ["cve", "threat-intel", "exploit", "kernel"],
    tokens: 1240,
    chunks: 3,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 02:40",
    author: "SENTINEL-01",
    obsidianPath: "Threats/CVE_2026_9811.md",
    backlinks: ["Zero-Trust Mesh Topology & eBPF Daemon Gateway"],
    wikiLinks: ["[[Zero-Trust Mesh Topology]]"],
    embeddingSnippet: [-0.1428, 0.3129, 0.0914, -0.4812, 0.1192, 0.0482, -0.3104],
    content: `---
title: CVE-2026-9811 Mitigation
category: Threat Intel
tags: [cve, threat-intel, exploit, kernel]
cvss: 9.8
status: MITIGATING
---

# CVE-2026-9811 // Linux Kernel Race Condition Mitigation

## Threat Overview
A race condition vulnerability in memory page pinning routines allows an unprivileged local adversary to execute arbitrary ring-0 kernel code through misaligned IO-uring buffers.

### Vulnerability Indicators
- **Severity**: CRITICAL (CVSS 9.8)
- **Vector**: Local Privilege Escalation -> Container Escape
- **Target Subsystem**: \`io_uring/kbuf.c\`

### Immediate Containment Steps
1. Apply dynamic eBPF patch \`sys_enter_io_uring_setup\` to disallow unprivileged ring allocation:
\`\`\`bash
sysctl -w kernel.unprivileged_bpf_disabled=1
sysctl -w io_uring_disabled=2
\`\`\`
2. Re-compile kernel daemon with ASLR entropy ceiling.`,
  },
  {
    id: "doc-03",
    title: "High-Frequency SQLite Vector Ingestion & Cosine Indexing",
    category: "System Arch",
    slug: "/arch/sqlite-vec-indexing.md",
    tags: ["sqlite", "vectors", "rag", "embeddings"],
    tokens: 920,
    chunks: 2,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-24 18:04",
    author: "DB-OPTIMIZER",
    obsidianPath: "Storage/SQLite_Vec_Indexing.md",
    backlinks: ["LLM-OS Kernel Architecture"],
    wikiLinks: ["[[LLM-OS Kernel Architecture]]", "[[BPE Tokenizer from Scratch]]"],
    embeddingSnippet: [0.2415, -0.0512, 0.3841, 0.1982, -0.0124, 0.4491, -0.1923],
    content: `---
title: High-Frequency SQLite Vector Ingestion
category: System Arch
tags: [sqlite, vectors, rag, embeddings]
---

# High-Frequency SQLite Vector Ingestion

## Vector Table Schema
DirtyNest executes semantic search queries directly within SQLite utilizing the \`sqlite-vec\` C extension.

\`\`\`sql
CREATE VIRTUAL TABLE vec_knowledge USING vec0(
  id TEXT PRIMARY KEY,
  embedding float[1536] distance_metric=cosine
);

-- Cosine Distance KNN Query (Limit 5)
SELECT id, distance 
FROM vec_knowledge 
WHERE embedding MATCH :query_embedding 
ORDER BY distance 
LIMIT 5;
\`\`\`

### Performance Characteristics
- In-memory search time: ~ 0.42ms for 20,000 vectors.
- Quantization format: INT8 scalar quantization for 75% memory compression.`,
  },
  {
    id: "doc-04",
    title: "DirtyNest Swarm Protocol & Agent IPC Specification v2",
    category: "API Contracts",
    slug: "/api/swarm-ipc-protocol-v2.md",
    tags: ["agents", "ipc", "protocol", "websocket"],
    tokens: 1100,
    chunks: 3,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 04:12",
    author: "SWARM-LEAD",
    obsidianPath: "Protocols/Swarm_IPC_v2.md",
    backlinks: ["Autoresearch Autonomous Agent Loop"],
    wikiLinks: ["[[Autoresearch Agent Loop]]"],
    embeddingSnippet: [0.0891, 0.2219, -0.1834, 0.3921, 0.0519, -0.2104, 0.1742],
    content: `---
title: Swarm IPC Protocol Specification v2
category: API Contracts
tags: [agents, ipc, protocol, websocket]
version: 2.4.0
---

# Swarm IPC Protocol Specification v2

## Packet Framing
Inter-Agent messages are transmitted across WebSockets using JSON-RPC 2.0 frames encapsulated in Binary ArrayBuffers.

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": "msg_904a8b2",
  "sender": "SENTINEL-01",
  "target": "BROADCAST",
  "action": "MISSION_DISPATCH",
  "payload": {
    "mission_id": "RECON_09",
    "priority": "HIGH",
    "params": {
      "target_subnet": "10.240.0.0/16"
    }
  },
  "timestamp": 1787626922
}
\`\`\`

### Status Codes
- \`200 ACK\`: Directive Accepted by Swarm Worker.
- \`429 BACKOFF\`: Swarm Worker CPU overload; throttle requests.`,
  },
  {
    id: "doc-05",
    title: "Production Incident Triage & Automated Rollback Runbook",
    category: "Code Runbooks",
    slug: "/runbooks/production-triage-rollback.md",
    tags: ["runbook", "devops", "kubernetes", "incident"],
    tokens: 780,
    chunks: 2,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-23 11:30",
    author: "KUBE-DEPLOYER",
    obsidianPath: "Runbooks/Production_Incident_Triage.md",
    backlinks: ["Zero-Trust Mesh Topology & eBPF Daemon Gateway"],
    wikiLinks: ["[[Zero-Trust Mesh Topology]]"],
    embeddingSnippet: [-0.0124, 0.1824, -0.4019, 0.2214, -0.1524, 0.0924, 0.3129],
    content: `---
title: Production Incident Triage & Rollback
category: Code Runbooks
tags: [runbook, devops, kubernetes, incident]
severity: SEV-1
---

# Production Incident Triage & Rollback

## Immediate Actions
Upon detecting error rate exceeding 1.5% for > 60 seconds:

1. **Activate Circuit Breaker**:
\`\`\`bash
kubectl annotate ingress dirtynest-api traefik.ingress.kubernetes.io/circuit-breaker="LatencyAtQuantileMS(50.0) > 100"
\`\`\`
2. **Execute Atomic Canary Rollback**:
\`\`\`bash
kubectl rollout undo deployment/dirtynest-core-service -n production
\`\`\`
3. **Notify Commander**:
Ping the on-call channel via autonomous alert webhook.`,
  },
  {
    id: "doc-06",
    title: "Neural Long-Term Memory Buffer & Dynamic Persona Directives",
    category: "Neural Memory",
    slug: "/neural/memory-persona-directives.md",
    tags: ["ai", "memory", "prompts", "rag"],
    tokens: 650,
    chunks: 1,
    vectors: "1536-dim float32",
    updatedAt: "2026-08-25 01:18",
    author: "CHATBOT-CORE",
    obsidianPath: "Neural/Memory_Persona_Directives.md",
    backlinks: ["BPE Tokenizer from Scratch", "LLM-OS Kernel Architecture"],
    wikiLinks: ["[[LLM-OS Kernel Architecture]]"],
    embeddingSnippet: [0.3124, 0.1192, 0.0482, -0.3104, 0.2415, -0.0512, 0.3841],
    content: `---
title: Neural Long-Term Memory Buffer
category: Neural Memory
tags: [ai, memory, prompts, rag]
---

# Neural Long-Term Memory Buffer

## Persona Injection Contract
When querying the Chatbot AI Core with active RAG mode, documents matching cosine similarity > 0.72 are injected into the system context prompt dynamically:

\`\`\`markdown
<system_context>
[INGESTED_NODE: {{doc_slug}}]
{{doc_content}}
</system_context>
\`\`\`

This guarantees zero hallucination for proprietary tactical cluster protocols.`,
  },
];

const CATEGORIES = [
  "ALL NODES",
  "Karpathy Skills",
  "Obsidian Wiki",
  "Threat Intel",
  "System Arch",
  "API Contracts",
  "Code Runbooks",
  "Neural Memory",
] as const;

export default function KnowledgeView() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(INITIAL_DOCS);
  const [viewMode, setViewMode] = useState<"vault" | "obsidian" | "karpathy" | "config" | "rag_probe">("vault");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL NODES");
  const [selectedDocId, setSelectedDocId] = useState<string>("skill-01");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"viewer" | "vectors" | "graph" | "backlinks">("viewer");
  const [obsidianVaultPath, setObsidianVaultPath] = useState("C:\\\\Users\\\\coyot\\\\Obsidian\\\\CyberVault");
  const [obsidianVaultName, setObsidianVaultName] = useState("CyberVault");
  const [isObsidianSyncing, setIsObsidianSyncing] = useState(false);
  const [obsidianSyncCount, setObsidianSyncCount] = useState(142);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestPhase, setIngestPhase] = useState("");
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<KnowledgeDoc["category"]>("Karpathy Skills");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [executedSkillId, setExecutedSkillId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_knowledge_docs_v2");
      if (saved) {
        setDocs(JSON.parse(saved));
      }
      const savedVault = localStorage.getItem("dirtynest_obsidian_path");
      if (savedVault) {
        setObsidianVaultPath(savedVault);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveDocs = (newDocs: KnowledgeDoc[]) => {
    setDocs(newDocs);
    try {
      localStorage.setItem("dirtynest_knowledge_docs_v2", JSON.stringify(newDocs));
    } catch {
      // ignore
    }
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return docs
      .filter((d) => {
        let matchesMode = true;
        if (viewMode === "karpathy") {
          matchesMode = d.category === "Karpathy Skills" || d.isKarpathySkill === true;
        } else if (viewMode === "obsidian") {
          matchesMode = !!d.obsidianPath;
        }

        const matchesCategory =
          selectedCategory === "ALL NODES" || d.category === selectedCategory;
        const matchesQuery =
          searchQuery === "" ||
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          d.slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesMode && matchesCategory && matchesQuery;
      })
      .map((d) => {
        let sim = undefined;
        if (searchQuery.trim().length > 0) {
          const titleMatch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
          const tagMatch = d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
          sim = titleMatch ? 0.98 : tagMatch ? 0.89 : 0.77;
        }
        return { ...d, similarity: sim };
      });
  }, [docs, viewMode, selectedCategory, searchQuery]);

  const selectedDoc = useMemo(() => {
    return docs.find((d) => d.id === selectedDocId) || filteredDocs[0] || docs[0];
  }, [docs, selectedDocId, filteredDocs]);

  // Aggregate Metrics
  const totalTokens = useMemo(() => docs.reduce((acc, d) => acc + d.tokens, 0), [docs]);
  const totalVectors = docs.length * 1536;
  const karpathySkillCount = useMemo(() => docs.filter((d) => d.isKarpathySkill || d.category === "Karpathy Skills").length, [docs]);

  // Trigger Obsidian Vault Sync
  const handleSyncObsidianVault = () => {
    cyberAudio.play("click");
    setIsObsidianSyncing(true);
    setTimeout(() => {
      setIsObsidianSyncing(false);
      setObsidianSyncCount((prev) => prev + 3);
      cyberAudio.play("chime");
    }, 1200);
  };

  // Launch Obsidian Protocol URI
  const handleOpenInObsidian = (doc?: KnowledgeDoc) => {
    cyberAudio.play("click");
    const targetDoc = doc || selectedDoc;
    if (!targetDoc) return;
    const noteName = targetDoc.obsidianPath ? encodeURIComponent(targetDoc.obsidianPath.replace(/\\.md$/, "")) : encodeURIComponent(targetDoc.title);
    const uri = `obsidian://open?vault=${encodeURIComponent(obsidianVaultName)}&file=${noteName}`;
    window.open(uri, "_blank");
  };

  // Copy to clipboard
  const handleCopyContent = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content);
    cyberAudio.play("click");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Execute Karpathy Skill in Chatbot
  const handleExecuteSkillInChatbot = (skill: KnowledgeDoc) => {
    cyberAudio.play("click");
    setExecutedSkillId(skill.id);
    setTimeout(() => {
      setExecutedSkillId(null);
      window.dispatchEvent(new CustomEvent("dirtynest-navigate", { detail: "chatbot" }));
    }, 600);
  };

  // Delete Document
  const handleDeleteDoc = (id: string) => {
    cyberAudio.play("click");
    const updated = docs.filter((d) => d.id !== id);
    saveDocs(updated);
    if (selectedDocId === id && updated.length > 0) {
      setSelectedDocId(updated[0].id);
    }
  };

  // Start Ingest
  const handleStartIngest = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    cyberAudio.play("click");
    setIsIngesting(true);
    setIngestProgress(10);
    setIngestPhase("Parsing Obsidian Frontmatter & YAML tags...");

    setTimeout(() => {
      setIngestProgress(40);
      setIngestPhase("Resolving [[WikiLinks]] & calculating backlink topology...");
    }, 400);

    setTimeout(() => {
      setIngestProgress(75);
      setIngestPhase("Computing 1536-dimensional float32 embeddings (Text-3)...");
    }, 800);

    setTimeout(() => {
      setIngestProgress(100);
      setIngestPhase("Syncing into Obsidian Vault & SQLite-Vec database...");

      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const isKarpathy = newCategory === "Karpathy Skills";
      const slugBase = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);

      const newDoc: KnowledgeDoc = {
        id: `doc-${Date.now().toString(36)}`,
        title: newTitle.trim(),
        category: newCategory,
        slug: `/${newCategory.toLowerCase().replace(/\\s+/g, "-")}/${slugBase}.md`,
        tags: tagsArray.length > 0 ? tagsArray : ["obsidian", "pkm"],
        tokens: Math.max(120, Math.floor(newContent.length / 4)),
        chunks: Math.max(1, Math.ceil(newContent.length / 800)),
        vectors: "1536-dim float32",
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        author: isKarpathy ? "KARPATHY-AGENT" : "OPERATOR",
        obsidianPath: `${newCategory.replace(/\\s+/g, "_")}/${newTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`,
        backlinks: ["Obsidian Vault Core"],
        wikiLinks: ["[[Zero-Trust Mesh Topology]]"],
        isKarpathySkill: isKarpathy,
        embeddingSnippet: [
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
          Number((Math.random() * 0.4 - 0.2).toFixed(4)),
        ],
        content: newContent,
      };

      const updated = [newDoc, ...docs];
      saveDocs(updated);
      setSelectedDocId(newDoc.id);

      setTimeout(() => {
        setIsIngesting(false);
        setShowIngestModal(false);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setIngestProgress(0);
        cyberAudio.play("chime");
      }, 300);
    }, 1300);
  };

  // Canvas 2D Topology Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== "graph") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.36;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.006;

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Vault Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(191, 64, 255, 0.18)";
      ctx.fill();
      ctx.strokeStyle = "#BF40FF";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#BF40FF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("OBSIDIAN", centerX, centerY - 4);
      ctx.fillText("VAULT", centerX, centerY + 6);

      // Orbital Nodes
      const nodePositions: { x: number; y: number; doc: KnowledgeDoc; isSelected: boolean }[] = [];

      filteredDocs.forEach((doc, idx) => {
        const nodeAngle = angle + (idx / filteredDocs.length) * Math.PI * 2;
        const x = centerX + Math.cos(nodeAngle) * (radius + Math.sin(angle * 2 + idx) * 15);
        const y = centerY + Math.sin(nodeAngle) * (radius * 0.75 + Math.cos(angle * 2 + idx) * 15);
        nodePositions.push({ x, y, doc, isSelected: doc.id === selectedDocId });
      });

      // Connections
      nodePositions.forEach((pos, i) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = pos.doc.isKarpathySkill
          ? "rgba(255, 184, 0, 0.35)"
          : pos.isSelected
          ? "rgba(0, 255, 65, 0.6)"
          : "rgba(0, 240, 255, 0.15)";
        ctx.lineWidth = pos.isSelected ? 2 : 1;
        ctx.stroke();

        const nextPos = nodePositions[(i + 1) % nodePositions.length];
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.strokeStyle = "rgba(191, 64, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Nodes
      nodePositions.forEach((pos) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.isSelected ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = pos.doc.isKarpathySkill ? "#FFB800" : pos.isSelected ? "#00FF41" : "rgba(13, 14, 24, 0.9)";
        ctx.fill();
        ctx.strokeStyle = pos.isSelected ? "#00FF41" : pos.doc.isKarpathySkill ? "#FFB800" : "#00F0FF";
        ctx.lineWidth = pos.isSelected ? 2.5 : 1.5;
        ctx.stroke();

        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = pos.isSelected ? "#00FF41" : pos.doc.isKarpathySkill ? "#FFB800" : "#9499B3";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const shortName = pos.doc.title.length > 20 ? pos.doc.title.slice(0, 18) + ".." : pos.doc.title;
        ctx.fillText(shortName, pos.x, pos.y - 12);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [filteredDocs, selectedDocId, activeTab]);

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP KNOWLEDGE & OBSIDIAN HUD BANNER */}
      <div className="cyber-card p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(191,64,255,0.25) 0%, rgba(0,255,65,0.2) 100%)",
                border: "1px solid rgba(191,64,255,0.4)",
                boxShadow: "0 0 16px rgba(191,64,255,0.3)",
              }}
            >
              <BrainCircuit size={20} className="text-[#BF40FF]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  OBSIDIAN VAULT & // <span className="text-[#00FF41]">KARPATHY SKILLS CORE</span>
                </h2>
                <span className="text-[10px] font-bold text-[#BF40FF] px-2 py-0.5 rounded bg-[#BF40FF]/15 border border-[#BF40FF]/40">
                  OBSIDIAN WIKI LINKED
                </span>
                <span className="text-[10px] font-bold text-[#FFB800] px-2 py-0.5 rounded bg-[#FFB800]/15 border border-[#FFB800]/40 hidden sm:inline">
                  {karpathySkillCount} KARPATHY SKILLS
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Bi-directional [[WikiLinks]] · Karpathy AI/ML mental models & executable skill recipes · Local Obsidian Vault bridge
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncObsidianVault}
              title="Sync local Obsidian Vault notes & backlinks"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#BF40FF]/40 text-[#9499B3] hover:text-[#BF40FF] text-xs transition-all cursor-pointer ${
                isObsidianSyncing ? "animate-pulse border-[#BF40FF] text-[#BF40FF]" : ""
              }`}
            >
              <FolderSync size={13} className={isObsidianSyncing ? "animate-spin text-[#BF40FF]" : ""} />
              <span>{isObsidianSyncing ? "SYNCING VAULT..." : "SYNC OBSIDIAN"}</span>
            </button>

            <button
              onClick={() => handleOpenInObsidian()}
              title="Open currently selected note in Obsidian App"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#BF40FF]/15 border border-[#BF40FF]/40 text-[#BF40FF] hover:bg-[#BF40FF]/25 text-xs font-bold transition-all shadow-[0_0_10px_rgba(191,64,255,0.2)] cursor-pointer"
            >
              <ArrowUpRight size={13} />
              <span>OPEN IN OBSIDIAN</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowIngestModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Plus size={14} />
              <span>NEW SKILL / NOTE</span>
            </button>
          </div>
        </div>

        {/* METRICS & OBSIDIAN VAULT STATUS HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-3.5 border-t border-white/5">
          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Obsidian Vault</span>
            <span className="text-sm font-bold text-[#BF40FF] mt-0.5 truncate">{obsidianVaultName}</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Synced Vault Notes</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">{obsidianSyncCount} Notes</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Karpathy Skill Modules</span>
            <span className="text-sm font-bold text-[#FFB800] mt-0.5">{karpathySkillCount} Skills Loaded</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Vector Embedding DB</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5">SQLite-Vec (1536-D)</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Backlink Mesh</span>
            <span className="text-sm font-bold text-[#00F0FF] mt-0.5">548 Connections</span>
          </div>

          <div className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-[#4F536E] uppercase">Vault Watcher</span>
            <span className="text-sm font-bold text-[#00FF41] mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
              CHOKIDAR LIVE
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE DECK SWITCHER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewMode("vault");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "vault"
                ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            }`}
          >
            <Database size={13} />
            <span>ALL VAULT NODES</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewMode("karpathy");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "karpathy"
                ? "bg-[#FFB800]/15 text-[#FFB800] font-bold border border-[#FFB800]/30 shadow-[0_0_8px_rgba(255,184,0,0.2)]"
                : "text-[#9499B3] hover:text-[#FFB800]"
            }`}
          >
            <BrainCircuit size={13} />
            <span>KARPATHY SKILLS ({karpathySkillCount})</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewMode("obsidian");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "obsidian"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                : "text-[#9499B3] hover:text-[#BF40FF]"
            }`}
          >
            <BookOpen size={13} />
            <span>OBSIDIAN WIKI</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewMode("rag_probe");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "rag_probe"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                : "text-[#9499B3] hover:text-[#00F0FF]"
            }`}
          >
            <Sparkles size={13} />
            <span>RAG PROBE</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewMode("config");
            }}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "config"
                ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30 shadow-[0_0_8px_rgba(191,64,255,0.2)]"
                : "text-[#9499B3] hover:text-[#BF40FF]"
            }`}
          >
            <Sliders size={13} />
            <span>VAULT CONFIG</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search [[WikiLinks]], Karpathy recipes, or tags..."
            className="w-full pl-9 pr-20 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]/50 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4F536E] hover:text-[#F1F3F9] px-1.5 py-0.5 rounded bg-white/5"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE: SEMANTIC RAG TESTER */}
      {viewMode === "rag_probe" && <SemanticRagTester />}

      {/* VIEW MODE: CONFIGURATION PANEL */}
      {viewMode === "config" && (
        <div className="cyber-card p-6 flex flex-col gap-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <FolderSync size={18} className="text-[#BF40FF]" />
              <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                Obsidian Vault & Knowledge Sync Configuration
              </h3>
            </div>
            <span className="text-xs text-[#00FF41] font-bold">URI PROTOCOL: ENABLED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9499B3]">Obsidian Vault Name</label>
              <input
                type="text"
                value={obsidianVaultName}
                onChange={(e) => setObsidianVaultName(e.target.value)}
                className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50"
              />
              <span className="text-[10px] text-[#4F536E]">
                Must match the Vault Name registered in your local Obsidian desktop client.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9499B3]">Local File System Path</label>
              <input
                type="text"
                value={obsidianVaultPath}
                onChange={(e) => {
                  setObsidianVaultPath(e.target.value);
                  localStorage.setItem("dirtynest_obsidian_path", e.target.value);
                }}
                className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50"
              />
              <span className="text-[10px] text-[#4F536E]">
                Target directory monitored for real-time markdown modifications and new recipes.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 text-xs text-[#9499B3]">
            <span className="font-bold text-[#00FF41]">How the Obsidian & Karpathy Bridge Works:</span>
            <p className="leading-relaxed">
              1. <strong>Obsidian URI Integration</strong>: Clicking <em>&quot;OPEN IN OBSIDIAN&quot;</em> triggers the native <code className="text-[#BF40FF]">obsidian://open</code> scheme to launch your desktop Obsidian workspace directly to the active note.
            </p>
            <p className="leading-relaxed">
              2. <strong>Karpathy Skills Framework</strong>: Encapsulates deep learning mental models, tokenizers, backprop engines, and autoresearch agent workflows into executable prompt cards for the DirtyNest Swarm and Chatbot.
            </p>
            <p className="leading-relaxed">
              3. <strong>Bi-directional Wiki Graph</strong>: Automatically parses <code className="text-[#00F0FF]">[[WikiLinks]]</code> and YAML frontmatter headers to maintain cross-linking across system architecture and threat intel.
            </p>
          </div>
        </div>
      )}

      {/* 3-PANE / MASTER-DETAIL VAULT MATRIX */}
      {viewMode !== "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT LIST: NODES & RECIPES (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#4F536E] uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen size={13} className="text-[#00FF41]" />
                {viewMode === "karpathy"
                  ? `KARPATHY SKILLS (${filteredDocs.length})`
                  : viewMode === "obsidian"
                  ? `OBSIDIAN WIKI NOTES (${filteredDocs.length})`
                  : `VAULT NODES (${filteredDocs.length})`}
              </span>
              <span className="text-[10px] text-[#4F536E]">
                {viewMode === "karpathy" ? "EXECUTABLE PROMPTS" : "COSINE: > 0.72"}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                const isKarpathy = doc.isKarpathySkill;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      cyberAudio.play("click");
                      setSelectedDocId(doc.id);
                    }}
                    className={`cyber-card p-3.5 transition-all cursor-pointer relative group ${
                      isSelected
                        ? isKarpathy
                          ? "border-[#FFB800]/60 bg-[#FFB800]/[0.06] shadow-[0_0_15px_rgba(255,184,0,0.15)]"
                          : "border-[#00FF41]/50 bg-[#00FF41]/[0.05] shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                        : "hover:border-white/20 bg-black/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isKarpathy
                              ? "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40"
                              : doc.category === "Threat Intel"
                              ? "bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30"
                              : doc.category === "System Arch"
                              ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                              : "bg-[#BF40FF]/15 text-[#BF40FF] border border-[#BF40FF]/30"
                          }`}
                        >
                          {doc.category}
                        </span>
                        {doc.obsidianPath && (
                          <span className="text-[9px] font-mono text-[#BF40FF] bg-[#BF40FF]/10 px-1 py-0.2 rounded border border-[#BF40FF]/20 truncate max-w-[140px]">
                            {doc.obsidianPath}
                          </span>
                        )}
                      </div>

                      {doc.similarity && (
                        <span className="text-[10px] font-bold text-[#00FF41] px-1.5 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 shrink-0">
                          {(doc.similarity * 100).toFixed(0)}% MATCH
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-xs font-bold mt-2 line-clamp-1 transition-colors ${
                        isSelected
                          ? isKarpathy
                            ? "text-[#FFB800]"
                            : "text-[#00FF41]"
                          : "text-[#F1F3F9] group-hover:text-[#00FF41]"
                      }`}
                    >
                      {doc.title}
                    </h3>

                    <p className="text-[11px] text-[#9499B3] mt-1 line-clamp-2 leading-relaxed">
                      {doc.content.replace(/[#*`]/g, "").slice(0, 120)}...
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px] text-[#4F536E]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[#9499B3]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.wikiLinks && doc.wikiLinks.length > 0 && (
                          <span className="text-[#00F0FF]">{doc.wikiLinks.length} links</span>
                        )}
                        <span>{doc.tokens} tok</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDocs.length === 0 && (
                <div className="text-center py-16 cyber-card bg-black/30 flex flex-col items-center justify-center gap-2">
                  <BookOpen size={24} className="text-[#4F536E]" />
                  <span className="text-xs text-[#9499B3]">NO MATCHING NOTES OR SKILLS</span>
                  <span className="text-[10px] text-[#4F536E]">Try switching view mode or query.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: NEURAL INSPECTOR & OBSIDIAN READER (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {selectedDoc ? (
              <div className="cyber-card p-5 flex flex-col gap-4">
                {/* Document Header Bar */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex flex-col gap-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          selectedDoc.isKarpathySkill
                            ? "text-[#FFB800] bg-[#FFB800]/15 border-[#FFB800]/40"
                            : "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30"
                        }`}
                      >
                        {selectedDoc.category}
                      </span>
                      {selectedDoc.obsidianPath && (
                        <span className="text-[10px] font-mono text-[#BF40FF] bg-[#BF40FF]/10 px-1.5 py-0.5 rounded border border-[#BF40FF]/25">
                          {selectedDoc.obsidianPath}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-black text-[#F1F3F9] tracking-tight mt-1">
                      {selectedDoc.title}
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] text-[#9499B3] mt-0.5">
                      <span>AUTHOR: <strong className="text-[#00F0FF]">{selectedDoc.author}</strong></span>
                      <span>•</span>
                      <span>UPDATED: {selectedDoc.updatedAt}</span>
                      <span>•</span>
                      <span>SIZE: {selectedDoc.tokens} tokens</span>
                    </div>
                  </div>

                  {/* Reader Action Controls */}
                  <div className="flex items-center gap-1.5">
                    {selectedDoc.isKarpathySkill && (
                      <button
                        onClick={() => handleExecuteSkillInChatbot(selectedDoc)}
                        title="Execute Karpathy Skill in Chatbot AI Core"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] hover:bg-[#FFB800]/30 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(255,184,0,0.2)]"
                      >
                        <Play size={13} className={executedSkillId === selectedDoc.id ? "animate-spin" : ""} />
                        <span>EXECUTE SKILL</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenInObsidian(selectedDoc)}
                      title="Open note directly in Obsidian Application"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#BF40FF]/15 border border-[#BF40FF]/40 text-[#BF40FF] hover:bg-[#BF40FF]/25 text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowUpRight size={13} />
                      <span className="hidden sm:inline">OBSIDIAN</span>
                    </button>

                    <button
                      onClick={handleCopyContent}
                      title="Copy Markdown Source"
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
                    >
                      {copiedId ? <CheckCircle2 size={14} className="text-[#00FF41]" /> : <Copy size={14} />}
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(selectedDoc.id)}
                      title="Delete Node from Vault"
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF2A6D]/40 text-[#9499B3] hover:text-[#FF2A6D] transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inspector Mode Tabs */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setActiveTab("viewer");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === "viewer"
                        ? "bg-[#00FF41]/15 text-[#00FF41] font-bold border border-[#00FF41]/30"
                        : "text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>MARKDOWN & WIKILINKS</span>
                  </button>

                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setActiveTab("backlinks");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === "backlinks"
                        ? "bg-[#BF40FF]/15 text-[#BF40FF] font-bold border border-[#BF40FF]/30"
                        : "text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    <Link2 size={13} />
                    <span>BACKLINKS & GRAPH</span>
                  </button>

                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setActiveTab("vectors");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === "vectors"
                        ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30"
                        : "text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    <Cpu size={13} />
                    <span>VECTORS</span>
                  </button>

                  <button
                    onClick={() => {
                      cyberAudio.play("click");
                      setActiveTab("graph");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === "graph"
                        ? "bg-[#FFB800]/15 text-[#FFB800] font-bold border border-[#FFB800]/30"
                        : "text-[#9499B3] hover:text-[#F1F3F9]"
                    }`}
                  >
                    <Activity size={13} />
                    <span>2D MESH</span>
                  </button>
                </div>

                {/* TAB 1: MARKDOWN VIEWER & WIKILINK HIGHLIGHTING */}
                {activeTab === "viewer" && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 min-h-[460px] max-h-[620px] overflow-y-auto text-xs text-[#F1F3F9] leading-relaxed space-y-3 font-mono">
                    <div className="whitespace-pre-wrap font-sans text-xs text-[#D1D5DB] leading-6 selection:bg-[#00FF41]/30 selection:text-[#00FF41]">
                      {selectedDoc.content}
                    </div>
                  </div>
                )}

                {/* TAB 2: BACKLINKS & WIKILINK CONNECTIONS */}
                {activeTab === "backlinks" && (
                  <div className="flex flex-col gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                    <div>
                      <span className="text-[11px] font-bold text-[#BF40FF] uppercase block mb-2">
                        Incoming Backlinks (Referenced in Obsidian Notes)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.backlinks && selectedDoc.backlinks.length > 0 ? (
                          selectedDoc.backlinks.map((b) => (
                            <div
                              key={b}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 text-xs text-[#F1F3F9]"
                            >
                              <Link2 size={12} className="text-[#BF40FF]" />
                              <span>{b}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#4F536E]">No explicit backlinks registered.</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[11px] font-bold text-[#00F0FF] uppercase block mb-2">
                        Outbound [[WikiLinks]] in this Document
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.wikiLinks && selectedDoc.wikiLinks.length > 0 ? (
                          selectedDoc.wikiLinks.map((w) => (
                            <div
                              key={w}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs text-[#00F0FF] font-bold cursor-pointer hover:bg-[#00F0FF]/20"
                            >
                              <ExternalLink size={12} />
                              <span>{w}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#4F536E]">No outbound WikiLinks detected.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: VECTOR EMBEDDINGS */}
                {activeTab === "vectors" && (
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#00F0FF]">
                        1536-DIMENSIONAL FLOAT32 VECTOR MANIFOLD
                      </span>
                      <span className="text-[10px] text-[#4F536E]">COSINE SIMILARITY</span>
                    </div>

                    <div className="p-3 rounded-lg bg-black/60 border border-white/10">
                      <div className="text-[10px] text-[#4F536E] mb-2 uppercase">First 7 Dimensions:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.embeddingSnippet.map((dim, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF] text-[10px] font-bold"
                          >
                            dim[{idx}]: {dim > 0 ? `+${dim.toFixed(4)}` : dim.toFixed(4)}
                          </div>
                        ))}
                        <div className="px-2 py-1 rounded bg-white/5 text-[#4F536E] text-[10px]">
                          +1,529 dimensions...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: 2D MESH CANVAS */}
                {activeTab === "graph" && (
                  <div className="relative w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 flex flex-col items-center">
                    <div className="absolute top-3 left-3 text-[10px] font-bold text-[#BF40FF] bg-black/60 px-2 py-1 rounded border border-[#BF40FF]/30">
                      OBSIDIAN & KARPATHY NEURAL TOPOLOGY // 2D CANVAS
                    </div>
                    <canvas ref={canvasRef} className="w-full h-[360px]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="cyber-card p-12 text-center text-xs text-[#4F536E]">
                SELECT A NOTE OR KARPATHY SKILL TO INSPECT
              </div>
            )}
          </div>
        </div>
      )}

      {/* INGESTION & NOTE CREATOR MODAL */}
      {showIngestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowIngestModal(false)}
        >
          <div
            className="w-full max-w-xl cyber-card p-6 flex flex-col gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-[#BF40FF]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} className="text-[#BF40FF]" />
                <h3 className="text-sm font-black text-[#F1F3F9] uppercase tracking-wider">
                  CREATE OBSIDIAN NOTE / KARPATHY SKILL
                </h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-xs text-[#4F536E] hover:text-[#F1F3F9] px-2 py-1 rounded bg-white/5"
              >
                ESC
              </button>
            </div>

            {/* Ingestion Form */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Skill / Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Karpathy Skill: Micrograd Scalar Autograd"
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Category & Framework</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as KnowledgeDoc["category"])}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
                  >
                    <option value="Karpathy Skills">Karpathy Skills</option>
                    <option value="Obsidian Wiki">Obsidian Wiki</option>
                    <option value="Threat Intel">Threat Intel</option>
                    <option value="System Arch">System Arch</option>
                    <option value="API Contracts">API Contracts</option>
                    <option value="Code Runbooks">Code Runbooks</option>
                    <option value="Neural Memory">Neural Memory</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#4F536E] uppercase block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="karpathy, autograd, backprop"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#4F536E] uppercase block mb-1">
                  Markdown Intel, [[WikiLinks]] & Code Recipes
                </label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="---\\ntitle: Micrograd Scalar Autograd\\ncategory: Karpathy Skills\\n---\\n\\n# Micrograd Engine\\n\\nExplained algorithm with [[WikiLinks]]..."
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Ingestion Progress Bar */}
              {isIngesting && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/60 border border-[#BF40FF]/30">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#BF40FF] font-bold">{ingestPhase}</span>
                    <span className="text-[#00F0FF]">{ingestProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#BF40FF] via-[#00FF41] to-[#FFB800] transition-all duration-300"
                      style={{ width: `${ingestProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowIngestModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs text-[#9499B3] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                disabled={isIngesting || !newTitle.trim() || !newContent.trim()}
                onClick={handleStartIngest}
                className="px-5 py-2 rounded-xl bg-[#BF40FF]/20 border border-[#BF40FF]/40 text-[#BF40FF] hover:bg-[#BF40FF]/30 text-xs font-bold transition-all shadow-[0_0_12px_rgba(191,64,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={14} />
                <span>{isIngesting ? "SYNCING..." : "SYNC TO VAULT & EMBED"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
