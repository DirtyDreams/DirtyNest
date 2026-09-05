/**
 * Thin client for the sidecar Knowledge Vault (F4). Best-effort: failures
 * degrade to a no-op / empty result so PG metadata never blocks on Qdrant.
 */

import { getSidecarBaseUrl } from "@/lib/orchestrator/sidecar";

export interface KnowledgeSearchHit {
  doc_id: string;
  chunk_index: number;
  title: string;
  text: string;
  category: string;
  tags: string[];
  score: number;
}

export interface ObsidianIndexResult {
  docs: Array<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    obsidian_path: string;
    wiki_links: string[];
  }>;
  edges: Array<{ source: string; target: string }>;
}

/** Embed + upsert a document into the Qdrant knowledge vault. */
export async function ingestDocument(
  docId: string,
  title: string,
  content: string,
  category: string,
  tags: string[],
): Promise<{ point_ids: string[]; chunks: number } | null> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/knowledge/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, title, content, category, tags }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; point_ids?: string[]; chunks?: number };
    if (data.status !== "success") return null;
    return { point_ids: data.point_ids ?? [], chunks: data.chunks ?? 0 };
  } catch {
    return null;
  }
}

/** Semantic search over the Qdrant knowledge vault. */
export async function searchKnowledge(
  query: string,
  limit = 5,
  threshold = 0.5,
): Promise<KnowledgeSearchHit[]> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/knowledge/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, threshold }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { status: string; results?: KnowledgeSearchHit[] };
    return data.status === "success" ? (data.results ?? []) : [];
  } catch {
    return [];
  }
}

/** Delete all Qdrant points for a document. */
export async function deleteDocumentPoints(docId: string): Promise<boolean> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/knowledge/docs/${docId}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Get Qdrant knowledge vault stats. */
export async function getKnowledgeStats(): Promise<{ point_count: number; ready: boolean } | null> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/knowledge/stats`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; point_count?: number; ready?: boolean };
    if (data.status !== "success") return null;
    return { point_count: data.point_count ?? 0, ready: data.ready ?? false };
  } catch {
    return null;
  }
}

/** Scan an Obsidian vault dir; returns parsed docs + wiki-link edges. */
export async function indexObsidianVault(vaultPath: string): Promise<ObsidianIndexResult | null> {
  try {
    const res = await fetch(`${getSidecarBaseUrl()}/api/knowledge/obsidian/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vault_path: vaultPath }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; docs?: ObsidianIndexResult["docs"]; edges?: ObsidianIndexResult["edges"] };
    if (data.status !== "success") return null;
    return { docs: data.docs ?? [], edges: data.edges ?? [] };
  } catch {
    return null;
  }
}
