"use client";

// ZbiornikOpsView — pulpit operatora zbiornik.com (nadzorowana automatyzacja HITL).
// Layout: STATUS SESJI na górze → [KOLEJKA ZATWIERDZEŃ | MONITOR TEMATÓW + SKRZYNKA] → LOG AKTYWNOŚCI.
// Kontrakt: docs/zbiornik-ops.md · backend: /api/zbiornik/* (bez publish z crona — tylko przez kolejkę).

import { useCallback, useState } from "react";
import { Anchor, Clock, Radio, ShieldCheck, User, Waves } from "lucide-react";
import StatusStrip from "./zbiornik_ops/StatusStrip";
import InboxAlerts from "./zbiornik_ops/InboxAlerts";
import ApprovalQueue from "./zbiornik_ops/ApprovalQueue";
import TopicsMonitor from "./zbiornik_ops/TopicsMonitor";
import InboxPanel from "./zbiornik_ops/InboxPanel";
import TopProfiles from "./zbiornik_ops/TopProfiles";
import ActivityLog from "./zbiornik_ops/ActivityLog";
import { apiJson, formatQuietHours, type ZbStatus } from "./zbiornik_ops/types";

<<<<<<< HEAD
const DEFAULT_STATUS: ZbStatus = {
  session: {
    connected: true,
    port: null,
    loggedIn: true,
    loginCode: "OK",
    account: "frontend-only",
    unread: { messages: 2, notifications: 1 },
  },
  lastPoll: { at: new Date().toISOString(), topics: 8, inbox: 2, notif: 1 },
  queue: { draft: 3, approved: 1, published: 12, failed: 0 },
  rules: { max_per_day: 20, min_gap_minutes: 10, quiet_hours: "23:00-07:00" },
  usedToday: 4,
};

export default function ZbiornikOpsView() {
  const [status, setStatus] = useState<ZbStatus | null>(DEFAULT_STATUS);
=======
export default function ZbiornikOpsView() {
  const [status, setStatus] = useState<ZbStatus | null>(null);
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiJson<ZbStatus>("/api/zbiornik/status");
      setStatus(data ?? null);
    } catch {
<<<<<<< HEAD
      // frontend-only mode: keep the local fallback status in place
      setStatus((current) => current ?? DEFAULT_STATUS);
=======
      // brak kontaktu z backendem → fail-closed: akcje wyjściowe zostają zablokowane
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
    }
  }, []);

  const refreshAll = useCallback(() => setRefreshKey((k) => k + 1), []);

  // HITL: bez potwierdzonej sesji operatora żadna akcja wychodząca nie rusza.
  const blocked = !status || status.session.loginCode !== "OK";

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* Nagłówek pulpitu */}
      <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Waves size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#F1F3F9]">
                  ZBIORNIK OPS // <span className="text-[#00F0FF]">HITL OPERACYJNY PERYSKOP</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                  HUMAN-IN-THE-LOOP
                </span>
              </div>
              <p className="text-xs text-[#9499B3]">
                Nadzorowana automatyzacja zbiornik.com — każda akcja wychodząca przechodzi przez kolejkę zatwierdzeń operatora
              </p>
            </div>
          </div>

          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border ${
            blocked ? "bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30" : "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
          }`}>
            <ShieldCheck size={12} />
            {blocked ? "AKCJE WYJŚCIOWE: WSTRZYMANE" : "AKCJE WYJŚCIOWE: ODBLOKOWANE"}
          </span>
        </div>

        {/* Meta sesji, zanim panel statusu dowiezie pełne dane */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
            <User size={11} /> OPERATOR: {status?.session.account ?? "—"}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
            <Anchor size={11} /> PORT CDP: {status?.session.port ?? "—"}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
            <Clock size={11} /> CISZA NOCNA: {formatQuietHours(status?.rules.quiet_hours ?? null)}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9499B3] px-2.5 py-1 rounded bg-white/5 border border-white/10">
            <Radio size={11} /> ODSTĘP: {status?.rules.min_gap_minutes ?? "—"} MIN
          </span>
        </div>
      </div>

      {/* Pasek statusu sesji */}
      <StatusStrip status={status} onLoad={loadStatus} refreshKey={refreshKey} onPollSuccess={refreshAll} />

      {/* Alarmy skrzynki: nowi nadawcy → szkice priv (toast + pasek) */}
      <InboxAlerts refreshKey={refreshKey} />

      {/* Dwie kolumny: kolejka zatwierdzeń | monitor tematów + skrzynka */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <ApprovalQueue refreshKey={refreshKey} blocked={blocked} onMutated={refreshAll} />
        <div className="flex flex-col gap-5 min-w-0">
          <TopicsMonitor refreshKey={refreshKey} blocked={blocked} onMutated={refreshAll} />
          <InboxPanel refreshKey={refreshKey} blocked={blocked} onMutated={refreshAll} />
        </div>
      </div>

      {/* Dziennik operacji */}
      <ActivityLog refreshKey={refreshKey} />

      {/* Natywna topka portalu — lustro read-only (§6): bez akcji, bez eksportu */}
      <TopProfiles refreshKey={refreshKey} />
    </div>
  );
}