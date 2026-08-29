"use client";

// InboxAlerts — dwa niezależne sygnały skrzynki:
// 1) PORTAL (session.unread z /status, żywe liczniki check): zmiana messages o ≥1 → toast
//    w górę (nowa wiadomość, chime) / w dół (info — operator przeczytał na portalu).
//    Ten sygnał łapie też nieskolejkowane powtórki od znanych nadawców.
// 2) KOLEJKA (diff szkiców kind=priv): NOWY nadawca/szkic → toast + pasek alarmowy.
// Oba kanały to uzupełnienie — wyświetlane osobno (StatusStrip pokazuje liczniki portalu).

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import { apiJson, extractList, type QueueItem, type ZbStatus } from "./types";

const WATCH_INTERVAL_MS = 30_000;

interface InboxAlertsProps {
  /** Wzrost wartości wymusza natychmiastowy skan (np. po ręcznym pollu). */
  refreshKey: number;
}

export default function InboxAlerts({ refreshKey }: InboxAlertsProps) {
  const [newCount, setNewCount] = useState(0);
  const [portalUnread, setPortalUnread] = useState<number | null>(null);

  const seenDrafts = useRef<Map<number, string> | null>(null);
  const primedDrafts = useRef(false);
  const unreadBaseline = useRef<{ messages: number; notifications: number } | null>(null);
  const primedUnread = useRef(false);

  /** Kanał 1: żywe liczniki sesji (messages ± ≥1 → toast; górka też z chime). */
  const scanPortal = useCallback(async () => {
    try {
      const data = await apiJson<ZbStatus>("/api/zbiornik/status");
      const unread = data.session?.unread ?? null;
      setPortalUnread(typeof unread?.messages === "number" ? unread.messages : null);
      if (!unread) return; // sesja offline — trzymamy starą bazę, bez alertów
      if (!primedUnread.current) {
        unreadBaseline.current = unread;
        primedUnread.current = true;
        return;
      }
      const prev = unreadBaseline.current;
      unreadBaseline.current = unread;
      if (!prev) return;
      const dMessages = unread.messages - prev.messages;
      if (dMessages > 0) {
        cyberAudio.play("chime");
        toast.success("NOWA WIADOMOŚĆ W PORTALU", {
          description: `+${dMessages} nieprzeczytanych (łącznie ${unread.messages}). Sprawdź SKRZYNKĘ.`,
        });
      } else if (dMessages < 0) {
        toast.info("LICZNIK SKRZYNKI W DÓŁ", {
          description: `−${Math.abs(dMessages)} nieprzeczytanych (pozostało ${unread.messages}).`,
        });
      }
    } catch {
      /* cicho — StatusStrip i tak pokaże brak backendu */
    }
  }, []);

  /** Kanał 2: diff szkiców kind=priv (nowi nadawcy). */
  const scanQueue = useCallback(async () => {
    try {
      const data = await apiJson<Record<string, unknown>>("/api/zbiornik/queue?kind=priv&limit=100");
      const list = extractList<QueueItem>(data, ["items"]);
      if (!primedDrafts.current) {
        seenDrafts.current = new Map(list.map((it) => [it.id, it.target_ref ?? ""]));
        primedDrafts.current = true;
        return;
      }
      const known = seenDrafts.current ?? new Map<number, string>();
      const fresh = list.filter((it) => !known.has(it.id));
      if (fresh.length > 0) {
        for (const it of fresh) known.set(it.id, it.target_ref ?? "");
        setNewCount((n) => n + fresh.length);
        cyberAudio.play("click");
        toast.info("NOWY KONTAKT W KOLEJCE", {
          description: fresh
            .map((f) => `${f.target_ref ?? "?"} (szkic #${f.id})`)
            .join(" · "),
        });
      }
    } catch {
      /* cicho — status pulpitu i tak sygnalizuje brak backendu */
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      void scanPortal();
      void scanQueue();
    };
    tick();
    const timer = setInterval(tick, WATCH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [scanPortal, scanQueue, refreshKey]);

  return (
    <div className="cyber-card px-4 py-2.5 flex flex-wrap items-center gap-2.5 border-[#FFB000]/40 font-mono select-none animate-fade-in">
      <Bell size={14} className="text-[#FFB000] shrink-0" />
      <span className="text-[10px] font-bold text-[#FFB000] tracking-wide">
        PORTAL: NIEPRZECZYTANE {portalUnread ?? "?"}
        {portalUnread !== null && portalUnread > 0 ? " — ZAJRZYJ DO PORTALU LUB SKRZYNKI" : " — CZYSTO"}
      </span>
      <span className="text-[10px] font-bold text-[#9499B3]">
        | NOWE SZKICE W KOLEJCE: {newCount} · ZATWIERDZ I PUBLIKUJ PER SZTUKA
      </span>
      <button
        type="button"
        onClick={() => {
          cyberAudio.play("click");
          setNewCount(0);
        }}
        title="Wycisz alarm nowych szkiców"
        className="ml-auto p-1 rounded text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10 cursor-pointer transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}