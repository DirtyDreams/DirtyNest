"use client";

/**
 * F7.6 — Real knowledge-graph data.
 *
 * Fetches GET /api/knowledge/graph (Postgres `knowledge_graph_edges` joined
 * with `knowledge_docs`) and maps the API shape
 * `{ nodes: [{ id, title, category, tags, source }], edges: [{ id, source, target, relation }] }`
 * onto the KnowledgeGraphCanvas `GraphNode` contract (id/title/category/color/
 * radius/links), preserving the deck's cyber color language.
 */
import { useCallback, useEffect, useState } from "react";
import type { GraphNode } from "./KnowledgeGraphCanvas";

interface ApiNode {
  id: number | string;
  title: string;
  category: string;
  tags?: string[];
  source?: string;
}

interface ApiEdge {
  id?: number | string;
  source: number | string;
  target: number | string;
  relation?: string;
}

export interface KnowledgeGraphPayload {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

export type GraphLoadState = "loading" | "ready" | "empty" | "error";

const CATEGORY_COLORS: Record<string, string> = {
  "Karpathy Skills": "#FFB800",
  "Threat Intel": "#FF2A6D",
  "System Arch": "#00FF41",
  "API Contracts": "#00F0FF",
  "Code Runbooks": "#BF40FF",
  "Neural Memory": "#FF007F",
  "Obsidian Wiki": "#3B82F6",
};

function nodeColor(category: string): string {
  return CATEGORY_COLORS[category] || "#3B82F6";
}

/** API payload -> canvas nodes (edges become adjacency links). */
export function transformGraphPayload(payload: KnowledgeGraphPayload): GraphNode[] {
  const byId = new Map(payload.nodes.map((n) => [String(n.id), n]));
  const links = new Map<string, string[]>();
  for (const e of payload.edges) {
    const source = String(e.source);
    const target = String(e.target);
    if (!byId.has(source) || !byId.has(target) || source === target) continue;
    if (!links.has(source)) links.set(source, []);
    if (!links.get(source)!.includes(target)) links.get(source)!.push(target);
  }
  return payload.nodes.map((n) => {
    const id = String(n.id);
    return {
      id,
      title: n.title,
      category: n.category,
      color: nodeColor(n.category),
      radius: n.tags && n.tags.length > 3 ? 12 : 8,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      links: links.get(id) ?? [],
      tags: n.tags ?? [],
    };
  });
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  state: GraphLoadState;
  error: string | null;
  reload: () => void;
}

/** Load the real graph once per mounted deck; exposes loading/empty/error. */
export function useKnowledgeGraph(): GraphQueryResult {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [state, setState] = useState<GraphLoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState("loading");
      setError(null);
      try {
        const res = await fetch("/api/knowledge/graph");
        if (!cancelled && !res.ok) {
          setState("error");
          setError(`Graph API error ${res.status}`);
          return;
        }
        if (cancelled) return;
        const data = (await res.json()) as KnowledgeGraphPayload;
        const mapped = transformGraphPayload({
          nodes: Array.isArray(data.nodes) ? data.nodes : [],
          edges: Array.isArray(data.edges) ? data.edges : [],
        });
        setNodes(mapped);
        setState(mapped.length === 0 ? "empty" : "ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setState("error");
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  return { nodes, state, error, reload };
}