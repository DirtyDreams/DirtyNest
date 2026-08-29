"use client";

import { useState } from "react";
import { Split, Check, Sparkles, Copy } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface DiffCandidate {
  id: string;
  name: string;
  harness: string;
  tokens: number;
  runtimeMs: number;
  code: string;
}

const CANDIDATES: DiffCandidate[] = [
  {
    id: "cand-hermes",
    name: "HERMES-70B // AST Hardened Refactor",
    harness: "Nous-Hermes-3-70B",
    tokens: 4210,
    runtimeMs: 840,
    code: `// HERMES-70B Output: Zero-trust mTLS proxy handler with strict payload validation
export async function handleProxyRequest(req: SecureRequest): Promise<ProxyResponse> {
  const token = req.headers.get("x-hermes-signature");
  if (!token || !verifyEd25519(token, CLUSTER_PUBLIC_KEY)) {
    throw new SecurityException("UNAUTHORIZED_CLUSTER_INGRESS", 401);
  }
  
  const payload = await req.json();
  const validated = ProxyPayloadSchema.parse(payload);
  
  const latency = await measureSocketLatency(validated.targetNode);
  return { status: 200, latencyMs: latency, route: "mesh-v2" };
}`,
  },
  {
    id: "cand-pi",
    name: "PI-REASONER // Adaptive Fallback Solution",
    harness: "Pi-Reflection-2.5",
    tokens: 3890,
    runtimeMs: 1120,
    code: `// PI-REASONER Output: Empathetic error handling with automatic retry backoff
export async function handleProxyRequest(req: Request): Promise<Response> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Missing token" }, { status: 401 });
    
    return await executeWithExponentialBackoff(() => forwardToCluster(req), {
      retries: 3,
      delayMs: 250,
      onRetry: (err) => console.warn("Retrying cluster proxy:", err.message)
    });
  } catch (err) {
    return Response.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}`,
  },
];

export default function MultiAgentDiffViewer() {
  const [leftId, setLeftId] = useState<string>("cand-hermes");
  const [rightId, setRightId] = useState<string>("cand-pi");
  const [copiedPane, setCopiedPane] = useState<"left" | "right" | null>(null);
  const [merged, setMerged] = useState(false);

  const leftCand = CANDIDATES.find((c) => c.id === leftId) || CANDIDATES[0];
  const rightCand = CANDIDATES.find((c) => c.id === rightId) || CANDIDATES[1];

  const handleCopy = (pane: "left" | "right", text: string) => {
    cyberAudio.play("click");
    navigator.clipboard?.writeText(text);
    setCopiedPane(pane);
    setTimeout(() => setCopiedPane(null), 2000);
  };

  const handleMerge = () => {
    cyberAudio.play("chime");
    setMerged(true);
    setTimeout(() => setMerged(false), 3000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Split size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              MULTI-AGENT DIFF VIEWER // <span className="text-[#BF40FF]">PARALLEL OUTPUT COMPARATOR</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Compare code synthesis and reasoning paths across concurrent agent harness branches
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMerge}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BF40FF] text-white font-bold text-xs hover:bg-[#a832e6] transition-all cursor-pointer shadow-[0_0_12px_rgba(191,64,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>{merged ? "MERGED INTO REPO!" : "MERGE OPTIMAL PATH"}</span>
        </button>
      </div>

      {/* Split Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF41]/30 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
              <span className="text-xs font-bold text-[#00FF41]">{leftCand.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("left", leftCand.code)}
              className="text-[10px] text-[#4F536E] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedPane === "left" ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
              <span>{copiedPane === "left" ? "COPIED" : "COPY"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
            <span>Tokens: {leftCand.tokens}</span>
            <span>Duration: {leftCand.runtimeMs}ms</span>
          </div>

          <pre className="p-3 rounded-lg bg-black/90 border border-white/5 text-[11px] text-[#00FF41] font-mono overflow-x-auto leading-relaxed max-h-60 custom-scrollbar">
            {leftCand.code}
          </pre>
        </div>

        {/* Right Pane */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-[#00F0FF]/30 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
              <span className="text-xs font-bold text-[#00F0FF]">{rightCand.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("right", rightCand.code)}
              className="text-[10px] text-[#4F536E] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedPane === "right" ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
              <span>{copiedPane === "right" ? "COPIED" : "COPY"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#4F536E]">
            <span>Tokens: {rightCand.tokens}</span>
            <span>Duration: {rightCand.runtimeMs}ms</span>
          </div>

          <pre className="p-3 rounded-lg bg-black/90 border border-white/5 text-[11px] text-[#00F0FF] font-mono overflow-x-auto leading-relaxed max-h-60 custom-scrollbar">
            {rightCand.code}
          </pre>
        </div>
      </div>
    </div>
  );
}
