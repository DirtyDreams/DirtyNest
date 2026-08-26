"use client";

import { useState } from "react";
import {
  Database,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Code,
  Layers,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface SlowQuery {
  id: string;
  sql: string;
  durationMs: number;
  rows: number;
  table: string;
  status: "FAT_TAIL" | "LOCK_WAIT" | "OPTIMIZED";
}

const INITIAL_QUERIES: SlowQuery[] = [
  {
    id: "q-1",
    sql: "SELECT * FROM vectors WHERE embedding <=> $1 ORDER BY distance LIMIT 20",
    durationMs: 42.8,
    rows: 20,
    table: "sqlite_vec_nodes",
    status: "FAT_TAIL",
  },
  {
    id: "q-2",
    sql: "UPDATE agent_sessions SET memory_cache = $1 WHERE user_id = $2",
    durationMs: 28.1,
    rows: 1,
    table: "agent_sessions",
    status: "LOCK_WAIT",
  },
  {
    id: "q-3",
    sql: "SELECT count(*) FROM security_audit_events WHERE risk = 'CRITICAL'",
    durationMs: 4.2,
    rows: 1420,
    table: "security_audit_events",
    status: "OPTIMIZED",
  },
];

export default function SqlSlowQueryRadar() {
  const [queries, setQueries] = useState<SlowQuery[]>(INITIAL_QUERIES);
  const [selectedQuery, setSelectedQuery] = useState<SlowQuery | null>(null);

  const handleExplain = (q: SlowQuery) => {
    cyberAudio.play("click");
    setSelectedQuery(q);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              SQL & SLOW QUERY FORENSICS
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              P99 Latency & Lock Contention Radar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
            P99: 42.8ms
          </span>
        </div>
      </div>

      {/* Latency Percentiles Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">P50 Latency</span>
          <span className="text-xs font-bold text-[#00FF41] mt-0.5">1.2 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">P95 Latency</span>
          <span className="text-xs font-bold text-[#00F0FF] mt-0.5">8.4 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">P99 Latency</span>
          <span className="text-xs font-bold text-[#FFB800] mt-0.5">42.8 ms</span>
        </div>
      </div>

      {/* Query List */}
      <div className="space-y-2 pt-1">
        {queries.map((q) => (
          <div
            key={q.id}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#F1F3F9]">
                <span className="text-[#00FF41]">{q.table}</span>
                <span className="text-[9px] text-[#4F536E]">({q.rows} rows)</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold ${
                    q.durationMs > 30
                      ? "text-red-400"
                      : q.durationMs > 10
                      ? "text-amber-300"
                      : "text-[#00FF41]"
                  }`}
                >
                  {q.durationMs} ms
                </span>
                <button
                  onClick={() => handleExplain(q)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold text-[#00F0FF] cursor-pointer"
                >
                  EXPLAIN
                </button>
              </div>
            </div>

            <div className="p-1.5 rounded bg-black/80 border border-white/5 text-[10px] text-[#9499B3] font-mono truncate">
              <code>{q.sql}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
