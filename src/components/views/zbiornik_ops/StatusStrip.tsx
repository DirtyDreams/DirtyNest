"use client";

// StatusStrip — pasek STATUS SESJI: sesja CDP/portal, limity tempa, wynik ostatniego polla.
// Auto-odświeżanie co 30 s + przyciski odśwież i "POLL TERAZ" (POST /api/zbiornik/poll).

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Inbox,
  Lock,
  MessageSquare,
  Radio,
  RefreshCw,
  Rss,
  Server,
  ShieldCheck,
  Timer,
  Unplug,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import { apiJson, errMessage, formatQuietHours, relTime, type LoginCode, type ZbStatus } from "./types";

const SESSION_BADGE: Record<LoginCode, { label: string; cls: string; Icon: LucideIcon }> = {
  OK: { label: "SESJA OK", cls: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30", Icon: ShieldCheck },
  LOGIN_REQUIRED: { label: "WYMAGANY LOGIN", cls: "bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30", Icon: Lock },
  CDP_OFFLINE: { label: "CDP OFFLINE", cls: "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30", Icon: Unplug },
  NOT_CONFIGURED: { label: "NIE SKONFIGUROWANO", cls: "bg-white/5 text-[#9499B3] border-white/10", Icon: AlertTriangle },
};

interface StatusStripProps {
  status: ZbStatus | null;
  /** Pobiera GET /api/zbiornik/status (właściciel stanu: ZbiornikOpsView). */
  onLoad: () => Promise<void>;
  /** Wzrost wartości wymusza natychmiastowy reload statusu. */
  refreshKey: number;
  /** Po udanym pollu — odświeżenie całego pulpitu. */
  onPollSuccess: () => void;
}

export default function StatusStrip({ status, onLoad, refreshKey, onPollSuccess }: StatusStripProps) {
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  // tictac co 10 s, żeby czasy względne nie kasztanowały między pollami
  const [, setTick] = useState(0);

  useEffect(() => {
    void onLoad();
    const timer = setInterval(() => void onLoad(), 30_000);
    return () => clearInterval(timer);
  }, [onLoad, refreshKey]);

  useEffect(() => {
    const tick = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(tick);
  }, []);

  const handleRefresh = async () => {
    if (busy) return;
    cyberAudio.play("click");
    setBusy(true);
    try {
      await onLoad();
    } finally {
      setBusy(false);
    }
  };

  const handlePoll = async () => {
    if (polling) return;
    cyberAudio.play("click");
    setPolling(true);
    try {
      const data = await apiJson<{ topics?: number; inbox?: number; notif?: number }>("/api/zbiornik/poll", {
        method: "POST",
      });
      cyberAudio.play("chime");
      toast.success("POLL ZAKOŃCZONY", {
        description: `Tematy: ${data.topics ?? 0} · Skrzynka: ${data.inbox ?? 0} · Powiadomienia: ${data.notif ?? 0}`,
      });
      onPollSuccess();
    } catch (err) {
      cyberAudio.play("error");
      toast.error("POLL NIEUDANY", { description: errMessage(err) });
    } finally {
      setPolling(false);
    }
  };

  const session = status?.session;
  const badge = SESSION_BADGE[session?.loginCode ?? "NOT_CONFIGURED"];
  const BadgeIcon = badge.Icon;

  const max = status?.rules.max_per_day ?? 0;
  const used = status?.usedToday ?? 0;
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const barCls = pct >= 100 ? "bg-[#FF2A6D]" : pct >= 70 ? "bg-[#FFB000]" : "bg-[#00FF41]";

  const queue = status?.queue ?? { draft: 0, approved: 0, published: 0, failed: 0 };
  const lastPoll = status?.lastPoll;

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header + akcje */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Server size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              STATUS SESJI // <span className="text-[#00F0FF]">CDP · ZBIORNIK.COM</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Jedna sesja operatora · akcje wyjściowe tylko przez kolejkę zatwierdzeń
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handlePoll()}
            disabled={polling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold hover:bg-[#00F0FF]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ręczny poll portalu (tylko do odczytu)"
          >
            <Radio size={12} className={polling ? "animate-pulse" : ""} />
            POLL TERAZ
          </button>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={busy}
            className="p-1.5 rounded-lg bg-white/5 text-[#9499B3] border border-white/10 hover:text-[#F1F3F9] hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Odśwież status"
          >
            <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Szczegóły sesji */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border ${badge.cls}`}>
          <BadgeIcon size={12} />
          {badge.label}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
          <Unplug size={12} />
          CDP :{session?.port ?? "—"} {session?.connected ? "· POŁĄCZONO" : "· BRAK POŁĄCZENIA"}
        </span>
        <span className="text-[10px] font-bold text-[#00F0FF] px-2.5 py-1 rounded bg-[#00F0FF]/5 border border-white/5">
          KONTO: {session?.account ?? "NIEZNANE"}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
          <Clock size={12} />
          OSTATNI POLL: {relTime(lastPoll?.at ?? null)}
        </span>
        {typeof session?.unread?.messages === "number" && (
          <span
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border ${
              session.unread.messages > 0
                ? "bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30"
                : "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
            }`}
            title="Nieskolejkowane powtórki też się liczą (życie portalu)"
          >
            <Inbox size={12} />
            NIEPRZECZYTANE W PORTALU: {session.unread.messages}
          </span>
        )}
        {typeof session?.unread?.notifications === "number" && (
          <span
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border ${
              session.unread.notifications > 0
                ? "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30"
                : "bg-white/5 text-[#9499B3] border-white/10"
            }`}
            title="Nieobejrzane powiadomienia (życie portalu)"
          >
            <MessageSquare size={12} />
            POWIADOMIENIA: {session.unread.notifications}
          </span>
        )}
      </div>

      {/* Licznik wykorzystania dziennego + meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-white/5">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3]">
              <Timer size={11} /> LIMIT DZIENNY
            </span>
            <span className={`text-[10px] font-black ${pct >= 100 ? "text-[#FF2A6D]" : pct >= 70 ? "text-[#FFB000]" : "text-[#00FF41]"}`}>
              {used}/{max || "—"} OPUBLIKOWANYCH
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barCls}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[9px] text-[#4F536E]">
            cisza nocna: {formatQuietHours(status?.rules.quiet_hours ?? null)} · odstęp: {status?.rules.min_gap_minutes ?? "—"} min
          </div>
        </div>

        {[
          { label: "SZKICE", value: lastPoll?.topics ?? 0, cls: "text-[#00F0FF]", note: "TEMATÓW Z POLL" },
          { label: "SKRZYNKA", value: lastPoll?.inbox ?? 0, cls: "text-[#FFB000]", note: "NOWYCH WIADOMOŚCI" },
          { label: "POWIADOMIENIA", value: lastPoll?.notif ?? 0, cls: "text-[#BF40FF]", note: "Z OSTATNIEGO POLL" },
        ].map((m) => (
          <div key={m.label} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-[#4F536E]">{m.note}</span>
            <span className={`text-lg font-black leading-none ${m.cls}`}>{m.value}</span>
            <span className="text-[9px] font-bold text-[#9499B3] flex items-center gap-1">
              {m.label === "SKRZYNKA" ? <Inbox size={10} /> : m.label === "POWIADOMIENIA" ? <MessageSquare size={10} /> : <Rss size={10} />}
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Licznik kolejki HITL */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: "SZKIC", value: queue.draft, cls: "text-[#00F0FF]" },
          { label: "ZATWIERDZONE", value: queue.approved, cls: "text-[#00FF41]" },
          { label: "OPUBLIKOWANE", value: queue.published, cls: "text-[#BF40FF]" },
          { label: "NIEUDANE", value: queue.failed, cls: "text-[#FF2A6D]" },
        ].map((q) => (
          <div key={q.label} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#4F536E]">{q.label}</span>
            <span className={`text-xs font-black ${q.cls}`}>{q.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}