"use client";

// InboxPanel — SKRZYNKA: pozycje kolejki kind=priv (wiadomości prywatne).
// Publikacja odpowiedzi odbywa się w KOLEJCE ZATWIERDZEŃ (Publish) — tu tylko edycja i zatwierdzanie.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Inbox, Mail, Pencil, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  apiJson,
  BLOCKED_NOTE,
  errMessage,
  extractList,
  KIND_CLASS,
  KIND_LABEL,
  privDialogUrl,
  relTime,
  STATUS_CLASS,
  STATUS_LABEL,
  truncateMiddle,
  type QueueItem,
} from "./types";

const INPUT_CLS =
  "w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#FFB000]/50 resize-y";

interface InboxPanelProps {
  refreshKey: number;
  /** true = sesja portalu niesprawna — synchronizacja skrzynki wstrzymana. */
  blocked: boolean;
  /** Po synchronizacji / mutacji — odśwież resztę pulpitu. */
  onMutated: () => void;
}

export default function InboxPanel({ refreshKey, blocked, onMutated }: InboxPanelProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiJson<Record<string, unknown>>("/api/zbiornik/queue");
      const priv = (extractList<QueueItem>(data, ["items", "queue"]) ?? []).filter((it) => it.kind === "priv");
      setItems(priv.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      setError(null);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load, refreshKey]);

  const handleSync = async () => {
    if (syncing || blocked) return;
    cyberAudio.play("click");
    setSyncing(true);
    try {
      const data = await apiJson<{ inbox?: number }>("/api/zbiornik/poll", { method: "POST" });
      cyberAudio.play("chime");
      toast.success("SKRZYNKA ZSYNCHRONIZOWANA", { description: `Nowych wiadomości z portalu: ${data.inbox ?? 0}.` });
      await load();
      onMutated();
    } catch (err) {
      cyberAudio.play("error");
      toast.error("SYNCHRONIZACJA NIEUDANA", { description: errMessage(err) });
    } finally {
      setSyncing(false);
    }
  };

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

  const startReply = (item: QueueItem) => {
    cyberAudio.play("click");
    setReplyId(item.id);
    setReplyBody(item.body);
  };

  const cancelReply = () => {
    cyberAudio.play("click");
    setReplyId(null);
    setReplyBody("");
  };

  const saveDraft = (item: QueueItem) => {
    cyberAudio.play("click");
    void withPending(item, async () => {
      await apiJson(`/api/zbiornik/queue/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "edit", body: replyBody }),
      });
      cyberAudio.play("chime");
      toast.success("ZAPISANO SZKIC ODPOWIEDZI", { description: `#${item.id} gotowy do zatwierdzenia.` });
      setReplyId(null);
    });
  };

  const handleApprove = (item: QueueItem) => {
    cyberAudio.play("click");
    void withPending(item, async () => {
      await apiJson(`/api/zbiornik/queue/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "approve" }),
      });
      cyberAudio.play("chime");
      toast.success("ZATWIERDZONO DO PUBLIKACJI", { description: `#${item.id} — wyślij przez „PUBLIKUJ” w KOLEJCE ZATWIERDZEŃ.` });
    });
  };

  const busy = pendingId !== null;

  // Statystyki kontaktów (z danych kolejki, klienci-side)
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      empty: items.filter((i) => i.status === "draft" && !(i.body ?? "").trim()).length,
      ready: items.filter((i) => i.status === "draft" && (i.body ?? "").trim().length > 0).length,
      approvedN: items.filter((i) => i.status === "approved").length,
      sentToday: items.filter((i) => i.status === "published" && (i.published_at ?? "").slice(0, 10) === today).length,
    };
  }, [items]);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFB000]/10 border border-[#FFB000]/30 flex items-center justify-center text-[#FFB000]">
            <Inbox size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              SKRZYNKA // <span className="text-[#FFB000]">WIADOMOŚCI PRYWATNE (PRIV)</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">Odpowiedzi z kolejki kind=priv · publikacja w KOLEJCE ZATWIERDZEŃ</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={syncing || blocked}
          title={blocked ? BLOCKED_NOTE : "Pobierz wiadomości z portalu"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30 text-[10px] font-bold hover:bg-[#FFB000]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> SYNCHRONIZUJ SKRZYNKĘ
        </button>
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

      {/* Statystyki kontaktów */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
          {stats.empty > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30">
              WYMAGA TREŚCI: {stats.empty}
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            GOTOWE DO ZATWIERDZENIA: {stats.ready}
          </span>
          {stats.approvedN > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              ZATWIERDZONE: {stats.approvedN}
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#BF40FF]/10 text-[#BF40FF] border border-[#BF40FF]/30">
            WYSŁANE DZIŚ: {stats.sentToday}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E] animate-pulse">ŁADOWANIE SKRZYNKI…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E]">
            SKRZYNKA PUSTA // ŻADNYCH SZKICÓW PRIV W KOLEJCE
          </div>
        ) : (
          items.map((item) => {
            const dialog = privDialogUrl(item.target_ref);
            const needsBody = item.status === "draft" && !(item.body ?? "").trim();
            return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${KIND_CLASS[item.kind]}`}>
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="text-[9px] text-[#4F536E]">
                    #{item.id} · KORESPONDENCJA {item.target_ref ? `→ ${truncateMiddle(item.target_ref, 32)}` : "(brak adresata)"}
                  </span>
                </div>
                <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_CLASS[item.status]}`}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              {item.title && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#F1F3F9] break-words">
                  <Mail size={12} className="text-[#FFB000] shrink-0" /> {item.title}
                </p>
              )}

              {replyId === item.id ? (
                <div className="flex flex-col gap-2 pt-1">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={4}
                    placeholder="TREŚĆ ODPOWIEDZI…"
                    disabled={busy}
                    className={INPUT_CLS}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void saveDraft(item)}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FFB000]/15 text-[#FFB000] text-[10px] font-bold hover:bg-[#FFB000]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Pencil size={11} /> ZAPISZ SZKIC
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleApprove(item)}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check size={11} /> ZATWIERDŹ
                    </button>
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="px-2.5 py-1 rounded bg-white/5 text-[#9499B3] text-[10px] font-bold hover:bg-white/10 cursor-pointer"
                    >
                      ANULUJ
                    </button>
                  </div>
                </div>
              ) : needsBody ? (
                <p className="text-[10px] text-[#FFB000] font-bold">PUSTY SZKIC — kliknij „ODPOWIEDZ/EDYTUJ” i napisz odpowiedź</p>
              ) : (
                <p className="text-xs text-[#9499B3] leading-relaxed whitespace-pre-wrap break-words font-sans">{item.body}</p>
              )}

              {item.error && <p className="text-[10px] text-[#FF2A6D] font-bold">BŁĄD: {item.error}</p>}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[9px] text-[#4F536E]">
                <span className="flex items-center gap-1.5">
                  UTW {relTime(item.created_at)}
                  {dialog && (
                    <a
                      href={dialog}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => cyberAudio.play("click")}
                      title="Otwórz wątek na portalu (read-only)"
                      className="flex items-center gap-1 text-[#9499B3] hover:text-[#00F0FF] cursor-pointer transition-colors"
                    >
                      <ExternalLink size={10} /> WĄTEK
                    </a>
                  )}
                </span>
                {replyId !== item.id && item.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => startReply(item)}
                    disabled={busy}
                    className="px-2.5 py-1 rounded bg-white/5 text-[#9499B3] text-[10px] font-bold hover:text-[#FFB000] hover:bg-[#FFB000]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ODPOWIEDZ / EDYTUJ
                  </button>
                )}
                {replyId !== item.id && item.status === "approved" && (
                  <span className="text-[9px] text-[#00FF41] font-bold">OCZEKUJE NA „PUBLIKUJ” W KOLEJCE ZATWIERDZEŃ</span>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}