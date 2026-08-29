"use client";

// ApprovalQueue — KOLEJKA ZATWIERDZEŃ (HITL): draft → approved → published | rejected | failed.
// Każda operacja wychodząca (publish) musi tu przejść przez przycisk operatora.

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ClipboardList,
  Pencil,
  RefreshCw,
  Send,
  ShieldAlert,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  apiJson,
  BLOCKED_NOTE,
  errMessage,
  extractList,
  KIND_CLASS,
  KIND_LABEL,
  relTime,
  STATUS_CLASS,
  STATUS_LABEL,
  truncateMiddle,
  type QueueItem,
  type QueueItemStatus,
} from "./types";

const STATUS_FILTERS: { id: QueueItemStatus | "all"; label: string }[] = [
  { id: "all", label: "WSZYSTKIE" },
  { id: "draft", label: "SZKICE" },
  { id: "approved", label: "ZATWIERDZONE" },
  { id: "published", label: "OPUBLIKOWANE" },
  { id: "failed", label: "NIEUDANE" },
  { id: "rejected", label: "ODRZUCONE" },
];

const ACTIVE_FILTER_CLS = "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)] font-black";
const IDLE_FILTER_CLS = "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10";

interface ApprovalQueueProps {
  refreshKey: number;
  /** true = sesja portalu niesprawna, publikacja wstrzymana. */
  blocked: boolean;
  /** Po każdej mutacji — odśwież liczniki statusu i resztę pulpitu. */
  onMutated: () => void;
}

export default function ApprovalQueue({ refreshKey, blocked, onMutated }: ApprovalQueueProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<QueueItemStatus | "all">("draft");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const load = useCallback(async () => {
    try {
      const qs = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const data = await apiJson<Record<string, unknown>>(`/api/zbiornik/queue${qs}`);
      const list = extractList<QueueItem>(data, ["items", "queue"]);
      // defensywnie: backend może zignorować param status
      const filtered = list.filter((it) => filter === "all" || it.status === filter);
      setItems([...filtered].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      setError(null);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load, refreshKey]);

  const withPending = async (item: QueueItem, run: () => Promise<void>) => {
    if (pendingId !== null) return;
    setPendingId(item.id);
    try {
      await run();
      await load();
      onMutated();
    } catch (err) {
      cyberAudio.play("error");
      toast.error("OPERACJA ODRZUCONA", { description: errMessage(err) });
    } finally {
      setPendingId(null);
    }
  };

  const handleDecide = (item: QueueItem, action: "approve" | "reject") => {
    cyberAudio.play("click");
    void withPending(item, async () => {
      await apiJson(`/api/zbiornik/queue/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      cyberAudio.play(action === "approve" ? "chime" : "click");
      toast.success(action === "approve" ? "ZATWIERDZONO DO PUBLIKACJI" : "ODRZUCONO SZKIC", {
        description: `#${item.id} · ${KIND_LABEL[item.kind]}`,
      });
    });
  };

  const handleDelete = (item: QueueItem) => {
    cyberAudio.play("click");
    void withPending(item, async () => {
      await apiJson(`/api/zbiornik/queue/${item.id}`, { method: "DELETE" });
      toast.info("POZYCJA USUNIĘTA", { description: `#${item.id} usunięta z kolejki.` });
    });
  };

  const handlePublish = (item: QueueItem) => {
    if (!window.confirm(`Opublikować "${item.title ?? item.body.slice(0, 60)}" na zbiornik.com?`)) return;
    cyberAudio.play("click");
    void withPending(item, async () => {
      const data = await apiJson<{ message?: string }>(`/api/zbiornik/publish`, {
        method: "POST",
        body: JSON.stringify({ queueId: item.id }),
      });
      cyberAudio.play("chime");
      toast.success("OPUBLIKOWANO NA ZBIORNIK.COM", { description: data.message ?? `#${item.id} wypłynął przez strażnika limitów.` });
    });
  };

  const startEdit = (item: QueueItem) => {
    cyberAudio.play("click");
    setEditingId(item.id);
    setEditTitle(item.title ?? "");
    setEditBody(item.body);
  };

  const cancelEdit = () => {
    cyberAudio.play("click");
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const saveEdit = (item: QueueItem) => {
    cyberAudio.play("click");
    void withPending(item, async () => {
      await apiJson(`/api/zbiornik/queue/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "edit", title: editTitle.trim() || null, body: editBody }),
      });
      cyberAudio.play("chime");
      toast.success("SZKIC ZAKTUALIZOWANY", { description: `#${item.id} zapisany edycją inline.` });
      setEditingId(null);
    });
  };

  const busy = pendingId !== null;

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <ClipboardList size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              KOLEJKA ZATWIERDZEŃ // <span className="text-[#00FF41]">HITL GATEKEEPER</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">Nic nie wychodzi na portal bez twojej aprobaty</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          {items.length} POZYCJI
        </span>
      </div>

      {/* Filtry statusów */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setFilter(f.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === f.id ? ACTIVE_FILTER_CLS : IDLE_FILTER_CLS
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {blocked && (
        <div className="flex items-center gap-2 rounded-lg bg-[#FFB000]/10 border border-[#FFB000]/30 px-3 py-2 text-[10px] font-bold text-[#FFB000]">
          <ShieldAlert size={12} className="shrink-0" />
          {BLOCKED_NOTE}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 px-3 py-2 text-[10px] font-bold text-[#FF2A6D]">
          {error} — sprawdź backend /api/zbiornik
        </div>
      )}

      {/* Lista pozycji */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E] animate-pulse">ŁADOWANIE KOLEJKI…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E]">
            KOLEJKA CZYSTA // BRAK POZYCJI W FILTRZE: {filter.toUpperCase()}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2"
            >
              {/* Wiersz meta */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${KIND_CLASS[item.kind]}`}>
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="text-[9px] text-[#4F536E]">#{item.id}</span>
                  <span className="text-[9px] text-[#4F536E] truncate" title={item.target_ref ?? undefined}>
                    {item.target_ref ? `→ ${truncateMiddle(item.target_ref, 32)}` : "→ bez celu"}
                  </span>
                </div>
                <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_CLASS[item.status]}`}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              {/* Treść / edycja inline */}
              {editingId === item.id ? (
                <div className="flex flex-col gap-2 pt-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="TYTUŁ (opcjonalny)"
                    disabled={busy}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]/50"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    disabled={busy}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00FF41]/50 resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(item)}
                      disabled={busy}
                      className="px-2.5 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ZAPISZ EDYCJĘ
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-2.5 py-1 rounded bg-white/5 text-[#9499B3] text-[10px] font-bold hover:bg-white/10 cursor-pointer"
                    >
                      ANULUJ
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {item.title && <p className="text-xs font-bold text-[#F1F3F9] break-words">{item.title}</p>}
                  <p className="text-xs text-[#9499B3] leading-relaxed whitespace-pre-wrap break-words font-sans">{item.body}</p>
                </>
              )}

              {item.error && <p className="text-[10px] text-[#FF2A6D] font-bold">BŁĄD: {item.error}</p>}

              {/* Meta + akcje */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[9px] text-[#4F536E]">
                <span>UTW {relTime(item.created_at)}</span>

                {editingId === item.id ? null : (
                  <div className="flex items-center gap-1.5">
                    {item.status === "draft" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDecide(item, "approve")}
                          disabled={busy}
                          title="Zatwierdź do publikacji"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Check size={11} /> ZATWIERDŹ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecide(item, "reject")}
                          disabled={busy}
                          title="Odrzuć szkic"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[#9499B3] text-[10px] font-bold hover:text-[#FF2A6D] hover:bg-[#FF2A6D]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ThumbsDown size={11} /> ODRZUĆ
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={busy}
                          title="Edytuj szkic"
                          className="p-1 text-[#4F536E] hover:text-[#00F0FF] cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                      </>
                    )}
                    {item.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handlePublish(item)}
                        disabled={busy || blocked}
                        title={blocked ? "Publikacja wstrzymana — sesja portalu" : "Wyślij na portal"}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#BF40FF]/15 text-[#BF40FF] text-[10px] font-bold hover:bg-[#BF40FF]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send size={11} /> PUBLIKUJ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={busy}
                      title="Usuń pozycję"
                      className="p-1 text-[#4F536E] hover:text-[#FF2A6D] cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {item.status === "approved" && (
                <p className="flex items-center gap-1.5 text-[9px] text-[#9499B3]">
                  <Send size={10} className="text-[#BF40FF]" /> ZATW. {relTime(item.approved_at)} — PUBLIKUJ Z TEJ KOLEJKI (STRAŻNIK LIMITÓW)
                </p>
              )}
              {item.status === "published" && item.published_at && (
                <p className="text-[9px] text-[#BF40FF] font-bold">OPUBLIKOWANO {relTime(item.published_at)} · REF {item.portal_ref ?? "—"}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stopka */}
      <div className="pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("click");
            void load();
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 text-[#9499B3] border border-white/10 text-[10px] font-bold hover:text-[#F1F3F9] hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw size={12} /> ODŚWIEŻ KOLEJKĘ
          </span>
        </button>
      </div>
    </div>
  );
}