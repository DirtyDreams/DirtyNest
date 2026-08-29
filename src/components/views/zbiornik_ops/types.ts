// Zbiornik Ops — wspólne kształty danych i pomocniki pulpitu operatora.
// Kontrakt: docs/zbiornik-ops.md (HITL guardian + /api/zbiornik/*).

export type QueueKind = "topic" | "comment" | "priv";

export type QueueItemStatus = "draft" | "approved" | "published" | "rejected" | "failed";

export type LoginCode = "OK" | "LOGIN_REQUIRED" | "CDP_OFFLINE" | "NOT_CONFIGURED";

export interface QueueItem {
  id: number;
  kind: QueueKind;
  target_ref: string | null;
  title: string | null;
  body: string;
  status: QueueItemStatus;
  portal_ref: string | null;
  error: string | null;
  created_at: string;
  approved_at: string | null;
  published_at: string | null;
}

export interface TopicItem {
  id: number;
  portal_ref: string;
  url: string;
  title: string;
  author: string;
  preview: string;
  fetched_at: string;
}

export interface ActivityItem {
  id: number;
  op: string;
  target_ref: string | null;
  ok: number;
  message: string;
  created_at: string;
}

export interface ZbRules {
  max_per_day: number;
  min_gap_minutes: number;
  quiet_hours: string;
}

export interface ZbStatus {
  session: {
    connected: boolean;
    port: number | null;
    loggedIn: boolean | null;
    loginCode: LoginCode;
    account: string | null;
    /** Żywe liczniki z sesji portalu (komenda check); null gdy sesja offline lub starszy backend. */
    unread?: { messages: number; notifications: number } | null;
  };
  lastPoll: { at: string | null; topics: number; inbox: number; notif: number } | null;
  queue: { draft: number; approved: number; published: number; failed: number };
  rules: ZbRules;
  usedToday: number;
}

type ApiEnvelope = { ok?: boolean; error?: string; message?: string };

/** Wyodrębnia listę z typowej koperty odpowiedzi API ({ok, items|queue|topics|activity}). */
export function extractList<T>(data: unknown, keys: string[] = ["items", "queue", "topics", "activity", "list"]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return [];
}

/** Jednolity fetch JSON: rzuca Error z komunikatem API przy 4xx/5xx albo ok:false. */
export async function apiJson<T extends object>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* brak ciała odpowiedzi */
  }
  const envelope = (data ?? {}) as ApiEnvelope;
  if (!res.ok || envelope.ok === false) {
    throw new Error(envelope.error || envelope.message || `BŁĄD API (HTTP ${res.status})`);
  }
  return (data ?? {}) as T;
}

/** Komunikat błędu z nieznanego catcha. */
export function errMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "NIEZNANY BŁĄD OPERACJI";
}

/** Czas względny po polsku: "teraz", "5 min temu", "3 godz. temu", "2 dni temu", data. */
export function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return String(iso);
  const diffMs = Date.now() - ts;
  if (diffMs < 45_000) return "teraz";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "1 dzień temu" : `${days} dni temu`;
  return new Date(ts).toLocaleDateString("pl-PL");
}

/** Zegar lokalny HH:MM:SS — do logu aktywności. */
export function clockTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return String(iso);
  return new Date(ts).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Skrót środka długiego napisu (np. target_ref / url). */
export function truncateMiddle(text: string, max = 28): string {
  if (text.length <= max) return text;
  const cut = max - 1;
  const head = Math.ceil(cut / 2);
  const tail = cut - head;
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

export const KIND_LABEL: Record<QueueKind, string> = {
  topic: "TEMAT",
  comment: "KOMENTARZ",
  priv: "WIADOMOŚĆ",
};

export const KIND_CLASS: Record<QueueKind, string> = {
  topic: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30",
  comment: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30",
  priv: "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30",
};

export const STATUS_LABEL: Record<QueueItemStatus, string> = {
  draft: "SZKIC",
  approved: "ZATWIERDZONY",
  published: "OPUBLIKOWANY",
  rejected: "ODRZUCONY",
  failed: "NIEPOWODZENIE",
};

export const STATUS_CLASS: Record<QueueItemStatus, string> = {
  draft: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30",
  approved: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30",
  published: "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30",
  rejected: "bg-white/5 text-[#9499B3] border-white/10",
  failed: "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30",
};

/** Komunikat banera HITL, gdy sesja portalu nie jest sprawna. */
export const BLOCKED_NOTE = "SESJA PORTALU NIEWERYFIKOWANA — AKCJE WYJŚCIOWE WSTRZYMANE";

// ─── Ranking portalu (top lista profili) ────────────────────────────────────
// Źródło portalowe: facade getRanking (punktacja portalu: fans + 0,2·favs + 0,1·likes).
// Typy kont (accType): 1 = mężczyzna, 2 = kobieta, 3 = para, 4 = konto tematyczne.

export type RankingCategory = "all" | "women" | "men" | "couples";

export interface RankingItem {
  nick: string;
  accType: number;
  points: number;
  cntFans: number;
  cntFavs: number;
  cntLikes: number;
  online: boolean;
}

export const ACC_TYPE_LABEL: Record<number, string> = {
  1: "MĘŻCZYZNA",
  2: "KOBIETA",
  3: "PARA",
  4: "TEMATYCZNE",
};

/** Kategoria → parametr accType dla GET /api/zbiornik/ranking (all = bez parametru). */
export const RANKING_ACC_PARAM: Record<RankingCategory, number | null> = {
  all: null,
  women: 2,
  men: 1,
  couples: 3,
};

// ─── Natywna topka portalu (lustro read-only, docs/zbiornik-ops.md §6) ──────
// GET /api/zbiornik/top?limit=100[&accType=2|3] → { ok, items, accType }.

export interface TopItem {
  portal_ref: string | null;
  nick: string | null;
  points: number | null;
  fans: number | null;
  favs: number | null;
  likes: number | null;
  accType: number | null;
  isOnline: boolean | null;
  url: string | null;
}

/** Link do wątku rozmowy prywatnej na portalu (odczyt w przeglądarce operatora). */
export function privDialogUrl(nick: string | null | undefined): string | null {
  const n = (nick ?? "").trim();
  return n ? `https://zbiornik.com/talk/inbox/dialog/${encodeURIComponent(n)}/talk` : null;
}

/** "00:00-00:00" (okno puste) lub puste = cisza nocna wyłączona. */
export function formatQuietHours(spec: string | null | undefined): string {
  const s = (spec ?? "").trim();
  if (!s || s === "00:00-00:00" || s === "0:00-0:00") return "WYŁĄCZONA";
  return s;
}