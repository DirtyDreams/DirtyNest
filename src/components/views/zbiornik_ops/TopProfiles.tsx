"use client";

// TopProfiles — TOP PROFILI // NATYWNA TOPKA: lustro publicznego rankingu portalu.
// Zasada §6 (docs/zbiornik-ops.md): read-only — bez eksportu, bez akcji na profilach,
// bez łączenia z automatyzacją kontaktu. Jedyne wyjście to zwykły link zewnętrzny.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, ExternalLink, Flame, Heart, Radio, RefreshCw, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { cyberAudio } from "@/lib/cyberAudio";
import { apiJson, errMessage, extractList, type TopItem } from "./types";

const TOP_LIMIT = 100;
const VISIBLE_ROWS = 10;
const REFRESH_MS = 120_000;

type TopMode = "women" | "couples" | "viewAll" | "mixed";
type FetchMode = "women" | "couples" | "mixed";

const MODE_CHIPS: { id: TopMode; label: string; hint: string }[] = [
  { id: "women", label: "KOBIETY (2)", hint: "accType=2 — filtr po stronie portalu" },
  { id: "couples", label: "PARY (3)", hint: "accType=3 — filtr po stronie portalu" },
  { id: "viewAll", label: "WSZYSCY", hint: "widok wszystkich wierszy z ostatniego pobrania" },
  { id: "mixed", label: "BEZ FILTRA", hint: "surowa topka portalu, bez parametru accType" },
];

// Chip: WSZYSCY = czysty widok klienta nad ostatnio pobranym payloadem (bez refetchu).
// BEZ FILTRA = zapytanie na serwer bez parametru accType. Reszta = filtr accType po stronie portalu.
function portalProfileUrl(item: TopItem): string | null {
  const clean = (item.url ?? "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/")) return `https://zbiornik.com${clean}`;
  const nick = (item.nick ?? "").trim();
  return nick ? `https://zbiornik.com/${encodeURIComponent(nick)}` : null;
}

function pointsOf(item: TopItem): number {
  if (typeof item.points === "number" && Number.isFinite(item.points)) return item.points;
  const fans = item.fans ?? 0;
  const favs = item.favs ?? 0;
  const likes = item.likes ?? 0;
  return Math.floor(fans + 0.2 * favs + 0.1 * likes);
}

interface TopProfilesProps {
  /** Wzrost wartości wymusza natychmiastowy reload. */
  refreshKey: number;
}

export default function TopProfiles({ refreshKey }: TopProfilesProps) {
  const [items, setItems] = useState<TopItem[]>([]);
  const [payloadAccType, setPayloadAccType] = useState<number | null>(null);
  const [mode, setMode] = useState<TopMode>("women");
  const [activeQuery, setActiveQuery] = useState<FetchMode>("women");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (query: FetchMode, { toast: withToast = false } = {}) => {
      if (!withToast) cyberAudio.play("click");
      try {
        const accParam = query === "women" ? "&accType=2" : query === "couples" ? "&accType=3" : "";
        const data = await apiJson<{ ok?: boolean; accType?: number | null }>(
          `/api/zbiornik/top?limit=${TOP_LIMIT}${accParam}`
        );
        const list = extractList<TopItem>(data, ["items", "ranking", "list"]).filter(
          (it) => it && typeof it === "object"
        );
        setItems(list);
        setPayloadAccType(typeof data?.accType === "number" ? data.accType : null);
        setError(null);
        if (withToast) toast.success("TOPKA ODŚWIEŻONA", { description: `${list.length} pozycji w TOP ${TOP_LIMIT}.` });
      } catch (err) {
        const message = errMessage(err);
        setError(message);
        if (withToast) toast.error("TOPKA NIEUDANA", { description: message });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    void load(activeQuery);
    const timer = setInterval(() => void load(activeQuery), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load, activeQuery, refreshKey]);

  const selectMode = (chip: TopMode) => {
    cyberAudio.play("click");
    setMode(chip);
    if (chip === "viewAll" && items.length === 0) void load("mixed");
  };

  // Sortowanie klienckie po punktach (portal zwraca gotową kolejność — to ją utrwala).
  const rows = useMemo(() => {
    const sorted = [...items].sort((a, b) => pointsOf(b) - pointsOf(a));
    if (mode === "women") return sorted.filter((it) => it.accType === 2);
    if (mode === "couples") return sorted.filter((it) => it.accType === 3);
    return sorted;
  }, [items, mode]);

  const visible = rows.slice(0, VISIBLE_ROWS);

  const breakdown = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const it of items) {
      const acc = it.accType ?? 0;
      counts[acc] = (counts[acc] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const accBadge = (accType: number | null) => {
    if (accType === 2) return { label: "K", cls: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" };
    if (accType === 3) return { label: "P", cls: "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30" };
    if (accType === 4) return { label: "T", cls: "bg-white/5 text-[#9499B3] border-white/10" };
    return { label: accType === 1 ? "M" : "—", cls: "bg-white/5 text-[#9499B3] border-white/10" };
  };

  const fmt = (v: number | null) => (typeof v === "number" ? v.toLocaleString("pl-PL") : "—");
  const rankCls = (idx: number) =>
    idx === 0 ? "text-[#FFB000]" : idx === 1 ? "text-[#C0C0C0]" : idx === 2 ? "text-[#CD7F32]" : "text-[#4F536E]";

  const counter = mode === "women" || mode === "couples"
    ? `${rows.length} × ${mode === "women" ? "KOBIETY" : "PARY"} W TOP ${TOP_LIMIT}`
    : `${items.length} POZYCJI W TOP ${TOP_LIMIT}`;

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFB000]/10 border border-[#FFB000]/30 flex items-center justify-center text-[#FFB000]">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              TOP PROFILI // <span className="text-[#FFB000]">NATYWNA TOPKA</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Lustro publicznego rankingu zbiornik.com — wyłącznie odczyt (§6: bez akcji, bez eksportu)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#FFB000] px-2.5 py-1 rounded bg-[#FFB000]/10 border border-[#FFB000]/30">
            {counter}
          </span>
          <button
            type="button"
            onClick={() => void load(mode === "viewAll" ? "mixed" : mode, { toast: true })}
            disabled={loading}
            title="Odśwież topkę"
            className="p-1.5 rounded-lg bg-white/5 text-[#9499B3] border border-white/10 hover:text-[#F1F3F9] hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filtry widoku */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {MODE_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            title={chip.hint}
            onClick={() => selectMode(chip.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              mode === chip.id
                ? "bg-[#FFB000] text-black shadow-[0_0_12px_rgba(255,176,0,0.3)] font-black"
                : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 px-3 py-2 text-[10px] font-bold text-[#FF2A6D]">
          {error} — backend /api/zbiornik/top
        </div>
      )}

      {/* Breakdown typu kont w mixed/widoku wszystkich */}
      {(mode === "mixed" || mode === "viewAll") && !loading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#9499B3]">
          <Radio size={10} className="text-[#00F0FF]" /> ROZKŁAD:{" "}
          <span className="text-[#9499B3]">
            {Object.entries(breakdown)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([acc, n]) => `${accBadge(Number(acc)).label}:${n}`)
              .join(" · ")}
          </span>
        </div>
      )}

      {/* Tabela TOP 10 */}
      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E] animate-pulse">ŁADOWANIE TOPKI…</div>
        ) : visible.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E]">BRAK POZYCJI W TYM WIDOKU // POLL PORTALU ZWRÓCIŁ PUSTĄ LISTĘ</div>
        ) : (
          visible.map((item, idx) => {
            const url = portalProfileUrl(item);
            const badge = accBadge(item.accType);
            return (
              <div
                key={`${item.portal_ref ?? item.nick ?? "x"}-${idx}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all"
              >
                <span className={`w-7 shrink-0 text-center text-sm font-black ${rankCls(idx)}`}>
                  {idx === 0 ? <Crown size={16} className="mx-auto" /> : idx + 1}
                </span>

                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => cyberAudio.play("click")}
                      title={url}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#F1F3F9] hover:text-[#00F0FF] transition-colors truncate"
                    >
                      <span className="truncate">{item.nick ?? "(bez nicku)"}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-[#9499B3] truncate">{item.nick ?? "(bez nicku)"}</span>
                  )}
                  {item.isOnline === true && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shrink-0 animate-pulse" title="online / live" />
                  )}
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[9px] font-mono text-[#9499B3]">
                  <span className="flex items-center gap-1">
                    <Flame size={9} /> {fmt(item.fans)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={9} /> {fmt(item.favs)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={9} /> {fmt(item.likes)}
                  </span>
                </div>

                <div className="text-right shrink-0 ml-auto sm:ml-0">
                  <div className="text-sm font-black text-[#FFB000] leading-none">{fmt(pointsOf(item))}</div>
                  <div className="text-[8px] font-bold text-[#4F536E] mt-0.5">PKT</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-white/5 text-[9px] text-[#4F536E]">
        PKT = FANS + 0,2·FAVS + 0,1·LIKES (formuła portalu) · TOP 10 z TOP {TOP_LIMIT} ·
        FILTR PORTALU: {payloadAccType !== null ? `accType=${payloadAccType}` : "brak"} · read-only, poza kolejką HITL
      </div>
    </div>
  );
}