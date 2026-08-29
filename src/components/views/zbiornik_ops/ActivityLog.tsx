"use client";

// ActivityLog — LOG AKTYWNOŚCI: dziennik operacji zb_activity_log (op, target, ok, message).
// Auto-odświeżanie co 60 s + reload po zmianach gdziekolwiek na pulpicie.

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, History, RefreshCw, XCircle } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { apiJson, clockTime, errMessage, extractList, truncateMiddle, type ActivityItem } from "./types";

const ACTIVITY_LIMIT = 50;

interface ActivityLogProps {
  refreshKey: number;
}

export default function ActivityLog({ refreshKey }: ActivityLogProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiJson<Record<string, unknown>>(`/api/zbiornik/activity?limit=${ACTIVITY_LIMIT}`);
      const list = extractList<ActivityItem>(data, ["activity", "items", "logs"]);
      const safe = list.filter((it) => it && typeof it === "object");
      setItems(
        [...safe].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, ACTIVITY_LIMIT)
      );
      setError(null);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load, refreshKey]);

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F0FF]">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              LOG AKTYWNOŚCI // <span className="text-[#00F0FF]">ŚCIGACZ OPERACJI</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">Każda próba akcji portalu ląduje tutaj (auto-odświeżanie 60 s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#00F0FF] px-2.5 py-1 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
            {items.length} WPISÓW
          </span>
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              void load();
            }}
            disabled={loading}
            title="Odśwież log"
            className="p-1.5 rounded-lg bg-white/5 text-[#9499B3] border border-white/10 hover:text-[#F1F3F9] hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 px-3 py-2 text-[10px] font-bold text-[#FF2A6D]">
          {error} — sprawdź backend /api/zbiornik
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E] animate-pulse">ŁADOWANIE LOGU…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-bold text-[#4F536E]">BRAK WPISÓW // OPERATOR JESZCZE NIE RUSZYŁ PIPELINE’U</div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-[9px] font-bold text-[#4F536E] uppercase tracking-wider">
                <th className="py-1 px-2">CZAS</th>
                <th className="py-1 px-2">OP</th>
                <th className="py-1 px-2">CEL</th>
                <th className="py-1 px-2">WYNIK</th>
                <th className="py-1 px-2">KOMUNIKAT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const success = it.ok === 1; // 1 = sukces, 0 = porażka
                return (
                  <tr key={it.id} className="bg-black/40 hover:bg-black/60 transition-colors">
                    <td className="py-1.5 px-2 rounded-l-lg text-[10px] text-[#4F536E] whitespace-nowrap">{clockTime(it.created_at)}</td>
                    <td className="py-1.5 px-2 text-[10px] font-bold text-[#00F0FF] whitespace-nowrap">{it.op}</td>
                    <td className="py-1.5 px-2 text-[10px] text-[#9499B3] max-w-[160px] truncate" title={it.target_ref ?? undefined}>
                      {it.target_ref ? truncateMiddle(it.target_ref, 26) : "—"}
                    </td>
                    <td className="py-1.5 px-2">
                      {success ? (
                        <CheckCircle2 size={13} className="text-[#00FF41]" />
                      ) : (
                        <XCircle size={13} className="text-[#FF2A6D]" />
                      )}
                    </td>
                    <td
                      className={`py-1.5 px-2 rounded-r-lg text-[10px] max-w-[280px] truncate ${
                        success ? "text-[#9499B3]" : "text-[#FF2A6D] font-bold"
                      }`}
                      title={it.message}
                    >
                      {it.message || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}