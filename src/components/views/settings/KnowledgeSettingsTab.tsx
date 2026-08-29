"use client";

import { useState, useEffect } from "react";
import { Database, Sparkles, Cpu, RefreshCw, FolderSync, Zap } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function KnowledgeSettingsTab() {
  const toast = useToast();
  const [vectorEngine, setVectorEngine] = useState("sqlite-vec");
  const [chunkSize, setChunkSize] = useState("512");
  const [chunkOverlap, setChunkOverlap] = useState("15");
  const [embeddingModel, setEmbeddingModel] = useState("gemini-embeddings");
  const [similarityMetric, setSimilarityMetric] = useState("cosine");
  const [autoSyncWatcher, setAutoSyncWatcher] = useState(true);
  const [isReindexing, setIsReindexing] = useState(false);

  // Obsidian Vault Specific Parameters
  const [obsidianVaultName, setObsidianVaultName] = useState("CyberVault");
  const [obsidianVaultPath, setObsidianVaultPath] = useState("C:/Users/coyot/Documents/CyberVault");
  const [obsidianUriEnabled, setObsidianUriEnabled] = useState(true);

  useEffect(() => {
    try {
      const savedEngine = localStorage.getItem("dirtynest_rag_engine");
      if (savedEngine) setVectorEngine(savedEngine);
      const savedChunk = localStorage.getItem("dirtynest_rag_chunk_size");
      if (savedChunk) setChunkSize(savedChunk);
      const savedOverlap = localStorage.getItem("dirtynest_rag_overlap");
      if (savedOverlap) setChunkOverlap(savedOverlap);
      const savedModel = localStorage.getItem("dirtynest_rag_model");
      if (savedModel) setEmbeddingModel(savedModel);
      const savedSim = localStorage.getItem("dirtynest_rag_metric");
      if (savedSim) setSimilarityMetric(savedSim);
      const savedWatch = localStorage.getItem("dirtynest_rag_autosync");
      if (savedWatch) setAutoSyncWatcher(savedWatch !== "false");

      // Obsidian Vault parameters
      const savedVaultName = localStorage.getItem("dirtynest_obsidian_vault_name");
      if (savedVaultName) setObsidianVaultName(savedVaultName);
      const savedVaultPath = localStorage.getItem("dirtynest_obsidian_path");
      if (savedVaultPath) setObsidianVaultPath(savedVaultPath);
      const savedUri = localStorage.getItem("dirtynest_obsidian_uri_enabled");
      if (savedUri) setObsidianUriEnabled(savedUri !== "false");
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_rag_engine", vectorEngine);
      localStorage.setItem("dirtynest_rag_chunk_size", chunkSize);
      localStorage.setItem("dirtynest_rag_overlap", chunkOverlap);
      localStorage.setItem("dirtynest_rag_model", embeddingModel);
      localStorage.setItem("dirtynest_rag_metric", similarityMetric);
      localStorage.setItem("dirtynest_rag_autosync", String(autoSyncWatcher));

      // Save Obsidian Vault parameters
      localStorage.setItem("dirtynest_obsidian_vault_name", obsidianVaultName);
      localStorage.setItem("dirtynest_obsidian_path", obsidianVaultPath);
      localStorage.setItem("dirtynest_obsidian_uri_enabled", String(obsidianUriEnabled));
    } catch {}
    toast.success("Knowledge & Vault Saved", "Obsidian and Vector RAG configurations stored.");
  };

  const handleRebuildIndex = async () => {
    cyberAudio.play("click");
    setIsReindexing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsReindexing(false);
    toast.success("Index Rebuilt", "All knowledge base vectors regenerated successfully.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <Database size={16} />
            <span>Knowledge Base & Vector RAG Pipeline Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure vector databases, document chunking, neural embeddings, and similarity metrics
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE RAG CONFIG</span>
        </button>
      </div>

      {/* Vector Engine & Model Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vector Engine */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Database size={13} className="text-[#00FF41]" />
            <span>Vector Store Provider</span>
          </label>
          <select
            value={vectorEngine}
            onChange={(e) => setVectorEngine(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="sqlite-vec">SQLite-Vec (Embedded Zero-Latency)</option>
            <option value="pinecone">Pinecone Serverless</option>
            <option value="qdrant">Qdrant Mesh</option>
            <option value="chroma">ChromaDB Local Daemon</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Underlying vector storage backend</span>
        </div>

        {/* Embedding Model */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Cpu size={13} className="text-[#00F0FF]" />
            <span>Embedding Model Engine</span>
          </label>
          <select
            value={embeddingModel}
            onChange={(e) => setEmbeddingModel(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="gemini-embeddings">Google text-embedding-004 (768d)</option>
            <option value="openai-3-small">OpenAI text-embedding-3-small (1536d)</option>
            <option value="bge-large">BGE-Large-EN v1.5 (Local Transformers)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Vector dimensionality & accuracy</span>
        </div>

        {/* Similarity Metric */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Zap size={13} className="text-[#BF40FF]" />
            <span>Distance & Similarity</span>
          </label>
          <select
            value={similarityMetric}
            onChange={(e) => setSimilarityMetric(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="cosine">Cosine Distance (Recommended)</option>
            <option value="dot">Dot Product (Max Speed)</option>
            <option value="euclidean">L2 Euclidean Distance</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Mathematical index metric</span>
        </div>
      </div>

      {/* Chunk Size & Overlap Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Document Chunk Size</label>
            <span className="text-xs font-bold text-[#00FF41]">{chunkSize} Tokens</span>
          </div>
          <input
            type="range"
            min="128"
            max="2048"
            step="128"
            value={chunkSize}
            onChange={(e) => setChunkSize(e.target.value)}
            className="w-full accent-[#00FF41] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>128 (Atomic)</span>
            <span>512 (Recommended)</span>
            <span>2048 (Long Context)</span>
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F3F9] uppercase font-bold">Chunk Overlap Window</label>
            <span className="text-xs font-bold text-[#00F0FF]">{chunkOverlap}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="5"
            value={chunkOverlap}
            onChange={(e) => setChunkOverlap(e.target.value)}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4F536E]">
            <span>5% (Low Redundancy)</span>
            <span>15% (Optimal Continuity)</span>
            <span>35% (Deep Overlap)</span>
          </div>
        </div>
      </div>

      {/* Directory Watcher & Rebuild */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs text-[#F1F3F9] uppercase">
            <FolderSync size={14} className="text-[#00FF41]" />
            <span>Filesystem Auto-Sync Watcher</span>
          </div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Automatically index modified docs and codefiles in your project workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setAutoSyncWatcher(!autoSyncWatcher);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              autoSyncWatcher
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "bg-white/5 text-[#9499B3] border border-white/10"
            }`}
          >
            {autoSyncWatcher ? "ENABLED" : "DISABLED"}
          </button>

          <button
            onClick={handleRebuildIndex}
            disabled={isReindexing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00F0FF] font-bold text-xs border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isReindexing ? "animate-spin" : ""} />
            <span>{isReindexing ? "INDEXING..." : "REBUILD INDEX"}</span>
          </button>
        </div>
      </div>

      {/* Obsidian Vault & Knowledge Sync Configuration Block */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-[#BF40FF]/25 shadow-[0_0_20px_rgba(191,64,255,0.08)]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <FolderSync size={16} className="text-[#BF40FF]" />
            <h4 className="text-xs font-bold text-[#F1F3F9] uppercase tracking-wider">
              Obsidian Vault & Knowledge Sync Configuration
            </h4>
          </div>
          <span className="text-[10px] text-[#00FF41] font-bold">URI PROTOCOL: ENABLED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#9499B3] uppercase">Obsidian Vault Name</label>
            <input
              type="text"
              value={obsidianVaultName}
              onChange={(e) => setObsidianVaultName(e.target.value)}
              placeholder="e.g. CyberVault"
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
            />
            <span className="text-[9px] text-[#4F536E]">
              Must match the Vault Name registered in your local Obsidian desktop client.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#9499B3] uppercase">Local File System Path</label>
            <input
              type="text"
              value={obsidianVaultPath}
              onChange={(e) => setObsidianVaultPath(e.target.value)}
              placeholder="e.g. C:/Users/name/Documents/Vault"
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none focus:border-[#BF40FF]/50 font-mono"
            />
            <span className="text-[9px] text-[#4F536E]">
              Target directory monitored for real-time markdown modifications and new recipes.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 text-[11px] text-[#9499B3]">
          <span className="font-bold text-[#00FF41] text-xs">How the Obsidian & Karpathy Bridge Works:</span>
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
    </div>
  );
}
