"use client";

import { memo } from "react";
import { Rocket, Clock, ShieldAlert, RefreshCw, CheckCircle2, TrendingUp } from "lucide-react";

function DoraMetricsBar() {
  const metrics = [
    {
      label: "Deployment Frequency",
      value: "14.2 / day",
      status: "ELITE",
      color: "#00FF41",
      icon: Rocket,
      subtext: "Top 5% industry tier",
    },
    {
      label: "Lead Time for Changes",
      value: "18.4 min",
      status: "FAST",
      color: "#00F0FF",
      icon: Clock,
      subtext: "Commit to production",
    },
    {
      label: "Change Failure Rate",
      value: "0.82%",
      status: "STABLE",
      color: "#BF40FF",
      icon: ShieldAlert,
      subtext: "Well below 5% threshold",
    },
    {
      label: "Mean Time to Recovery",
      value: "4.2 min",
      status: "RAPID",
      color: "#00FF41",
      icon: RefreshCw,
      subtext: "Automated rollback active",
    },
  ];

  return (
    <div className="cyber-card p-3.5 sm:p-4 mb-1 select-none font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-[#00FF41]" />
          <span className="font-black text-[#F1F3F9] tracking-wider text-[11px] uppercase">
            DORA ENGINEERING HEALTH // <span className="text-[#00FF41]">ELITE TIER COCKPIT</span>
          </span>
        </div>
        <span className="text-[10px] text-[#4F536E]">AGGREGATED PAST 30 DAYS</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="flex flex-col p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#9499B3] font-bold truncate">{m.label}</span>
                <Icon size={13} style={{ color: m.color }} />
              </div>

              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-base sm:text-lg font-black" style={{ color: m.color }}>
                  {m.value}
                </span>
                <span
                  className="text-[9px] font-bold px-1 py-0.2 rounded"
                  style={{
                    color: m.color,
                    background: `${m.color}15`,
                    border: `1px solid ${m.color}30`,
                  }}
                >
                  {m.status}
                </span>
              </div>

              <span className="text-[10px] text-[#4F536E] mt-1">{m.subtext}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(DoraMetricsBar);
