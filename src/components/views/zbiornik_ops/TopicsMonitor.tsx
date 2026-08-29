"use client";

// TopicsMonitor — MONITOR TEMATÓW: cache tematów z polla + tworzenie szkiców
// (nowy temat / komentarz) które lądują wyłącznie w kolejce zatwierdzeń.

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, MessageSquare, Waves, Zap } from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import {
  apiJson,
  BLOCKED_NOTE,
  errMessage,
  extractList,
  relTime,
  truncateMiddle,
  type TopicItem,
} from "./types";

interface TopicsMonitorProps {
  refreshKey: number;
  /** true = sesja portalu niesprawna — nowe szkice wyjściowe wstrzymane. */
  blocked: boolean;
  /** Po dodaniu szkicu — odśwież liczniki i resztę pulpitu. */
  onMutated: () => void;
}

const INPUT_CLS =
  "w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] outline-none focus:border-[#00F0FF]/50";

export default function TopicsMonitor({ refreshKey, blocked, onMutated }: TopicsMonitorProps) {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);

  const [commentFor, setCommentFor] = useState<number | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commenting, setCommenting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiJson<Record<string, unknown>>("/api/zbiornik/topics");
      const list = extractList<TopicItem>(data, ["topics", "items"]);
      setTopics([...list].sort((a, b) => (b.fetched_at ?? "").localeCompare(a.fetched_at ?? "")));
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

  const handleCreateTopic = async () => {
    if (creating) return;
    if (!category.trim() || !title.trim() || !body.trim()) {
      toast.error("BRAK DANYCH", { description: "Kategoria/URL, tytuł i treść są wymagane." });
      return;
    }
    cyberAudio.play("click");
    setCreating(true);
    try {
      await apiJson("/api/zbiornik/queue", {
        method: "POST",
        body: JSON.stringify({
          kind: "topic",
          target_ref: category.trim(),
          title: title.trim(),
          body,
        }),
      });
      cyberAudio.play("chime");
      toast.success("SZKIC TEMATU DODANY", { description: `„${title.trim()}” czeka w kolejce zatwierdzeń.` });
      setCategory("");
      setTitle("");
      setBody("");
      setFormOpen(false);
      onMutated();
    } catch (err) {
      cyberAudio.play("error");
      toast.error("NIE DODANO SZKICU", { description: errMessage(err) });
    } finally {
      setCreating(false);
    }
  };

  const handleQueueComment = async (topic: TopicItem) => {
    if (commenting) return;
    if (!commentBody.trim()) {
      toast.error("PUSTY SZKIC", { description: "Treść komentarza nie może być pusta." });
      return;
    }
    cyberAudio.play("click");
    setCommenting(true);
    try {
      await apiJson("/api/zbiornik/queue", {
        method: "POST",
        body: JSON.stringify({ kind: "comment", target_ref: topic.portal_ref, body: commentBody }),
      });
      cyberAudio.play("chime");
      toast.success("SZKIC KOMENTARZA ODŁOŻONY", { description: `Cel: ${truncateMiddle(topic.title, 48)}` });
      setCommentFor(null);
      setCommentBody("");
      onMutated();
    } catch (err) {
      cyberAudio.play("error");
      toast.error("NIE DODANO KOMENTARZA", { description: errMessage(err) });
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Waves size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              MONITOR TEMATÓW // <span className="text-[#BF40FF]">FORUM ZBIORNIK.COM</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">Cache z ostatniego polla · szkice trafiają do kolejki</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            cyberAudio.play("click");
            setFormOpen((o) => !o);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#BF40FF]/10 text-[#BF40FF] border border-[#BF40FF]/30 text-[10px] font-bold hover:bg-[#BF40FF]/20 transition-all cursor-pointer"
        >
          <Zap size={12} /> NOWY TEMAT
          {formOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {blocked && (
        <div className="flex items-center gap-2 rounded-lg bg-[#FFB000]/10 border border-[#FFB000]/30 px-3 py-2 text-[10px] font-bold text-[#FFB000]">
          <MessageSquare size={12} className="shrink-0" />
          {BLOCKED_NOTE}
        </div>
      )}

      {/* Formularz nowego tematu */}
      {formOpen && (
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="KATEGORIA TEMATU / pełny URL"
              className={INPUT_CLS}
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TYTUŁ TEMATU"
              className={INPUT_CLS}
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="TREŚĆ TEMATU…"
            className={`${INPUT_CLS} resize-y`}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-[#4F536E]">SZKIC → KOLEJKA ZATWIERDZEŃ (kind: topic)</span>
            <button
              type="button"
              onClick={() => void handleCreateTopic()}
              disabled={creating || blocked}
              title={blocked ? BLOCKED_NOTE : "Utwórz szkic tematu"}
              className="px-3 py-1.5 rounded-lg bg-[#BF40FF]/15 text-[#BF40FF] text-[10px] font-bold hover:bg-[#BF40FF]/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              DODAJ SZKIC TEMATU
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 px-3 py-2 text-[10px] font-bold text-[#FF2A6D]">
          {error} — sprawdź backend /api/zbiornik
        </div>
      )}

      {/* Lista tematów */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E] animate-pulse">ŁADOWANIE TEMATÓW…</div>
        ) : topics.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E]">
            BRAK TEMATÓW W CACHE // UŻYJ „POLL TERAZ” W PANELU STATUSU
          </div>
        ) : (
          topics.map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#F1F3F9] break-words">{t.title}</p>
                  <p className="text-[9px] text-[#4F536E] truncate">
                    {t.author} · {relTime(t.fetched_at)} · ref {truncateMiddle(t.portal_ref, 24)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play("click");
                      window.open(t.url, "_blank", "noopener,noreferrer");
                    }}
                    title={t.url}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-bold hover:bg-[#00F0FF]/20 cursor-pointer"
                  >
                    <ExternalLink size={11} /> OTWÓRZ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play("click");
                      setCommentFor((cur) => (cur === t.id ? null : t.id));
                      setCommentBody("");
                    }}
                    disabled={blocked}
                    title={blocked ? BLOCKED_NOTE : "Szkic komentarza w tym temacie"}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#00FF41]/10 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {commentFor === t.id ? <ChevronUp size={11} /> : <MessageSquare size={11} />} SZKIC KOMENTARZA
                  </button>
                </div>
              </div>

              {t.preview && <p className="text-[10px] text-[#9499B3] leading-relaxed font-sans break-words">{t.preview}</p>}

              {commentFor === t.id && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5 animate-fade-in">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={3}
                    placeholder="TREŚĆ KOMENTARZA (szkic do zatwierdzenia)…"
                    className={`${INPUT_CLS} resize-y`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-[#4F536E]">POST → kolejka (kind: comment, cel {truncateMiddle(t.portal_ref, 28)})</span>
                    <button
                      type="button"
                      onClick={() => void handleQueueComment(t)}
                      disabled={commenting || blocked}
                      title={blocked ? BLOCKED_NOTE : "Dodaj szkic komentarza do kolejki"}
                      className="px-3 py-1.5 rounded-lg bg-[#00FF41]/15 text-[#00FF41] text-[10px] font-bold hover:bg-[#00FF41]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      DODAJ DO KOLEJKI
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}