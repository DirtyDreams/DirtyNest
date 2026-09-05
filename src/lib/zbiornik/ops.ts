/**
 * Zbiornik Ops — server-side helpers (docs/zbiornik-ops.md).
 * HITL guard lives here: nothing reaches the runner without an approved
 * queue item + tempo rules. Single account. No bulk operations.
 */
import { db } from "@/db";
import { zbActivityLog, zbQueue, zbRules, zbTopics } from "@/lib/schema";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";

export const SIDE_CAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://127.0.0.1:8000";

export type LoginCode = "OK" | "LOGIN_REQUIRED" | "CDP_OFFLINE" | "NOT_CONFIGURED";

/* ------------------------------- sidecar call ------------------------------ */
export async function sidecarPost<T = Record<string, unknown>>(
  path: string,
  body: unknown,
  timeoutMs = 130_000
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null; error?: string }> {
  try {
    const res = await fetch(SIDE_CAR_URL.replace(/\/+$/, "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, data: null, error: text.slice(0, 300) || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data: (await res.json()) as Record<string, unknown> };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { ok: false, status: 0, data: null, error: e?.message || "sidecar unreachable" };
  }
}

export async function sidecarGet<T = Record<string, unknown>>(
  path: string,
  timeoutMs = 12_000
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null; error?: string }> {
  try {
    const res = await fetch(SIDE_CAR_URL.replace(/\/+$/, "") + path, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, data: null, error: text.slice(0, 300) || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data: (await res.json()) as Record<string, unknown> };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { ok: false, status: 0, data: null, error: e?.message || "sidecar unreachable" };
  }
}

/* ---------------------------------- rules ---------------------------------- */
export interface ZbRules {
  max_per_day: number;
  min_gap_minutes: number;
  quiet_hours: string;
}

export const DEFAULT_RULES: ZbRules = { max_per_day: 20, min_gap_minutes: 10, quiet_hours: "23:00-07:00" };

export async function getRules(): Promise<ZbRules> {
  const rows = await db.select().from(zbRules).where(inArray(zbRules.key, ["max_per_day", "min_gap_minutes", "quiet_hours"]));
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    max_per_day: Number(map.max_per_day ?? DEFAULT_RULES.max_per_day) || DEFAULT_RULES.max_per_day,
    min_gap_minutes: Number(map.min_gap_minutes ?? DEFAULT_RULES.min_gap_minutes) || DEFAULT_RULES.min_gap_minutes,
    quiet_hours: map.quiet_hours || DEFAULT_RULES.quiet_hours,
  };
}

function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function parseQuietHours(spec: string): { fromMin: number; toMin: number } | null {
  const m = spec.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const fromMin = Number(m[1]) * 60 + Number(m[2]);
  const toMin = Number(m[3]) * 60 + Number(m[4]);
  return { fromMin, toMin };
}

function inQuietHours(qs: string, now = new Date()): boolean {
  const q = parseQuietHours(qs);
  if (!q) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (q.fromMin <= q.toMin) return cur >= q.fromMin && cur < q.toMin;
  return cur >= q.fromMin || cur < q.toMin; // wraps midnight
}

export async function publishedToday(): Promise<number> {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(zbQueue)
    .where(and(eq(zbQueue.status, "published"), gte(zbQueue.published_at, todayStartIso())));
  return n ?? 0;
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
  code?: string;
  usedToday: number;
  rules: ZbRules;
}

export async function publishGate(): Promise<GateResult> {
  const rules = await getRules();
  const todayStart = todayStartIso();
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(zbQueue)
    .where(and(eq(zbQueue.status, "published"), gte(zbQueue.published_at, todayStart)));
  const usedToday = n ?? 0;
  if (usedToday >= rules.max_per_day) {
    return { allowed: false, usedToday, rules, reason: `Dzienny limit osiągnięty (${usedToday}/${rules.max_per_day}).`, code: "LIMIT_DAY" };
  }
  const [last] = await db
    .select({ publishedAt: zbQueue.published_at })
    .from(zbQueue)
    .where(eq(zbQueue.status, "published"))
    .orderBy(desc(zbQueue.published_at))
    .limit(1);
  if (last?.publishedAt) {
    const lastTs = new Date(last.publishedAt).getTime();
    const waitMs = rules.min_gap_minutes * 60_000 - (Date.now() - lastTs);
    if (waitMs > 0) {
      return {
        allowed: false,
        usedToday,
        rules,
        reason: `Odstęp między publikacjami: poczekaj ${Math.ceil(waitMs / 60_000)} min (min ${rules.min_gap_minutes}).`,
        code: "LIMIT_GAP",
      };
    }
  }
  if (inQuietHours(rules.quiet_hours)) {
    return { allowed: false, usedToday, rules, reason: `Cisza nocna (${rules.quiet_hours}) — publikacja wstrzymana.`, code: "QUIET_HOURS" };
  }
  return { allowed: true, usedToday, rules };
}

export async function logActivity(entry: {
  op: string;
  targetRef?: string | null;
  payload?: unknown;
  ok: boolean;
  message?: string;
}): Promise<void> {
  await db.insert(zbActivityLog).values({
    op: entry.op,
    target_ref: entry.targetRef ?? null,
    payload_json: entry.payload !== undefined ? JSON.stringify(entry.payload).slice(0, 4000) : null,
    ok: entry.ok ? 1 : 0,
    message: entry.message ?? null,
    created_at: new Date().toISOString(),
  });
}

/* ---------------------------------- ingest --------------------------------- */
function itemRef(item: Record<string, unknown>): string | null {
  const id = item.id ?? item.msg_id ?? item.message_id ?? null;
  const url = item.url ?? item.permalink ?? null;
  if (url && typeof url === "string") return url;
  return id != null ? String(id) : null;
}

async function upsertTopics(topics: Array<Record<string, unknown>>): Promise<number> {
  let added = 0;
  for (const t of topics) {
    let url = String(t.url ?? t.portal_ref ?? "").trim();
    if (!url) continue;
    if (url.startsWith("/")) url = "https://zbiornik.com" + url;
    const ref = (String(t.portal_ref ?? "").trim() || url).slice(0, 290);
    const existing = await db.select({ id: zbTopics.id }).from(zbTopics).where(eq(zbTopics.portal_ref, ref)).limit(1);
    if (existing.length) {
      await db
        .update(zbTopics)
        .set({
          title: String(t.title ?? "").slice(0, 500),
          preview: String(t.preview ?? t.activity ?? "").slice(0, 500),
          raw_json: JSON.stringify(t).slice(0, 3000),
          fetched_at: new Date().toISOString(),
        })
        .where(eq(zbTopics.id, existing[0].id));
      continue;
    }
    await db.insert(zbTopics).values({
      portal_ref: ref,
      url,
      title: String(t.title ?? "").slice(0, 500),
      author: String(t.author ?? t.nick ?? "").slice(0, 110),
      preview: String(t.preview ?? t.activity ?? "").slice(0, 500),
      raw_json: JSON.stringify(t).slice(0, 3000),
      fetched_at: new Date().toISOString(),
    });
    added++;
  }
  return added;
}

async function ensurePrivDrafts(inbox: Array<Record<string, unknown>>): Promise<number> {
  let created = 0;
  for (const m of inbox) {
    const from = String(m.from ?? m.author ?? m.nick ?? m.user ?? "").trim();
    if (!from) continue;
    // No-double-contact guard (24h): skip draft if we already replied to this
    // person in the last 24h — prevents draft accumulation under repeat polls
    // and hardens the tool against mass-contact use (contract §6).
    const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
    const recent = await db
      .select({ id: zbQueue.id })
      .from(zbQueue)
      .where(
        and(
          eq(zbQueue.kind, "priv"),
          eq(zbQueue.target_ref, from),
          inArray(zbQueue.status, ["approved", "published"]),
          gte(zbQueue.approved_at, cutoff)
        )
      )
      .limit(1);
    if (recent.length) continue;
    const hash = await contentHash(`priv|${from}|`);
    const existing = await db
      .select({ id: zbQueue.id, status: zbQueue.status })
      .from(zbQueue)
      .where(and(eq(zbQueue.kind, "priv"), eq(zbQueue.target_ref, from), inArray(zbQueue.status, ["draft", "approved"])))
      .limit(1);
    if (existing.length) continue;
    await db.insert(zbQueue).values({
      kind: "priv",
      target_ref: from.slice(0, 290),
      content_hash: hash,
      title: String(m.subject ?? m.title ?? "").slice(0, 250) || null,
      body: "",
      status: "draft",
      portal_ref: (m.msgTalkId != null ? String(m.msgTalkId) : m.id != null ? String(m.id) : null) || null,
      extra_json: m.msdata != null ? JSON.stringify({ msdata: String(m.msdata) }) : null,
      created_at: new Date().toISOString(),
    });
    created++;
  }
  return created;
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function contentHash(raw: string): Promise<string> {
  return sha256Hex(raw.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase());
}

export async function ingestPoll(poll: Record<string, unknown>): Promise<{
  ok: boolean;
  topicsNew: number;
  privDrafts: number;
  loginCode: string | null;
}> {
  const session = (poll.session ?? {}) as Record<string, unknown>;
  const loginCode = (session.loginCode as string) ?? null;
  const topics = Array.isArray(poll.topics) ? (poll.topics as Array<Record<string, unknown>>) : [];
  const inbox = Array.isArray(poll.inbox) ? (poll.inbox as Array<Record<string, unknown>>) : [];
  const topicsNew = await upsertTopics(topics);
  const privDrafts = loginCode === "OK" || (session.loggedIn as boolean) === true ? await ensurePrivDrafts(inbox) : 0;
  await logActivity({ op: "poll", payload: { topicsNew, privDrafts, codes: poll.codes }, ok: Boolean(poll.ok), message: `topics: +${topicsNew}, priv drafts: +${privDrafts}` });
  return { ok: Boolean(poll.ok), topicsNew, privDrafts, loginCode };
}

/* --------------------------------- publish --------------------------------- */
export function runnerArgsFor(item: typeof zbQueue.$inferSelect): string[] | null {
  const target = (item.target_ref ?? "").trim();
  const body = (item.body ?? "").trim();
  if (item.kind === "comment") {
    if (!target || !body) return null;
    return [target, body];
  }
  if (item.kind === "priv") {
    if (!body) return null;
    // sendMessage needs the dialog data token (portal_ref from inbox poll);
    // target_ref holds the display nick — used only as fallback.
    const dialogToken = (item.portal_ref ?? target).trim();
    if (!dialogToken) return null;
    let msdata = "";
    try {
      const extra = item.extra_json ? (JSON.parse(item.extra_json) as { msdata?: string }) : null;
      msdata = (extra?.msdata ?? "").trim();
    } catch {}
    return msdata ? [dialogToken, msdata, body] : [dialogToken, body];
  }
  if (item.kind === "topic") {
    const title = (item.title ?? "").trim();
    if (!target || !title || !body) return null;
    return [target, title, body];
  }
  return null;
}

export async function publishQueueItem(queueId: number): Promise<{ ok: boolean; message: string; item?: unknown; code?: string }> {
  const [item] = await db.select().from(zbQueue).where(eq(zbQueue.id, queueId)).limit(1);
  if (!item) return { ok: false, message: `Kolejka ${queueId} nie istnieje.` };
  if (item.status !== "approved") {
    return { ok: false, message: `Element #${queueId} ma status ${item.status} — publikacja wymaga „approved”.`, code: "NOT_APPROVED" };
  }
  const args = runnerArgsFor(item);
  if (!args) {
    return { ok: false, message: "Brakuje target/treści — uzupełnij szkic przed publikacją.", code: "INCOMPLETE" };
  }
  const gate = await publishGate();
  if (!gate.allowed) {
    await logActivity({ op: item.kind, targetRef: item.target_ref, ok: false, message: gate.reason });
    return { ok: false, message: gate.reason ?? "Zablokowane przez limity.", code: gate.code };
  }

  const runnerOp = item.kind === "comment" ? "comment" : item.kind === "priv" ? "send-priv" : "post-topic";
  const res = await sidecarPost("/api/automations/zbiornik/exec", {
    op: runnerOp,
    args,
    dry: false,
    confirm_run: true,
  });
  const result = (res.data?.result ?? {}) as Record<string, unknown>;
  const code = String(result.code ?? (res.error ? "SIDECAR_DOWN" : "OK"));
  const ok = res.ok && result.ok === true;

  await db
    .update(zbQueue)
    .set(
      ok
        ? { status: "published", portal_ref: String(result.data && (result.data as Record<string, unknown>).portalRef ? (result.data as Record<string, unknown>).portalRef : item.portal_ref ?? ""), error: null, published_at: new Date().toISOString() }
        : { status: "failed", error: String(result.message ?? res.error ?? code).slice(0, 900) }
    )
    .where(eq(zbQueue.id, queueId));

  const [fresh] = await db.select().from(zbQueue).where(eq(zbQueue.id, queueId)).limit(1);
  await logActivity({ op: runnerOp, targetRef: item.target_ref, payload: { queueId, args: args.map((a) => (a.length > 60 ? a.slice(0, 60) + "…" : a)) }, ok, message: ok ? `Published #${queueId}` : `Failed #${queueId}: ${code}` });

  return { ok, message: ok ? "Opublikowano." : `Publikacja nieudana (${code}).`, item: fresh, code };
}

/* ------------------------------- queue helpers ----------------------------- */
export async function queueCounts(): Promise<Record<string, number>> {
  const rows = await db.select({ status: zbQueue.status, n: sql<number>`count(*)::int` }).from(zbQueue).groupBy(zbQueue.status);
  const map: Record<string, number> = { draft: 0, approved: 0, published: 0, failed: 0, rejected: 0 };
  for (const r of rows) map[r.status] = r.n ?? 0;
  return map;
}

export { zbQueue, zbTopics, zbActivityLog, zbRules };