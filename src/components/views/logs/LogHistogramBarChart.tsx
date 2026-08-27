"use client";

import { useMemo } from "react";
import { Activity, BarChart2 } from "lucide-react";
import { SystemLog } from "@/db";

interface LogHistogramBarChartProps {
  logs: SystemLog[];
}

export default function LogHistogramBarChart({ logs }: LogHistogramBarChartProps) {
  // Generate 16 time buckets across the log series
  const buckets = useMemo(() => {
    const totalBuckets = 16;
    const bucketArray = Array.from({ length: totalBuckets }, (_, i) => ({
      index: i,
      label: `T-${(totalBuckets - i) * 5}m`,
      info: 0,
      warn: 0,
      error: 0,
      audit: 0,
      total: 0,
    }));

    logs.forEach((log, i) => {
      const bucketIdx = i % totalBuckets;
      const bucket = bucketArray[bucketIdx];
      const level = (log.level || "INFO").toUpperCase();

      if (level === "ERROR") bucket.error += 1;
      else if (level === "WARN") bucket.warn += 1;
      else if (level === "AUDIT") bucket.audit += 1;
      else bucket.info += 1;

      bucket.total += 1;
    });

    const maxTotal = Math.max(...bucketArray.map((b) => b.total), 1);
    return { bucketArray, maxTotal };
  }, [logs]);

  return (
    <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-white space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            LOG INGESTION RATE & FREQUENCY HISTOGRAM
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-400" /> INFO
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-400" /> WARN
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500" /> ERROR
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-purple-400" /> AUDIT
          </span>
        </div>
      </div>

      {/* Bars Container */}
      <div className="h-24 flex items-end gap-1.5 pt-2">
        {buckets.bucketArray.map((b) => {
          const heightPct = Math.max(8, (b.total / buckets.maxTotal) * 100);
          return (
            <div
              key={b.index}
              className="flex-1 flex flex-col justify-end items-center h-full group relative cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col p-1.5 rounded-md bg-slate-900 border border-white/20 text-[9px] shadow-xl z-20 whitespace-nowrap pointer-events-none">
                <span className="font-bold text-white">{b.label}</span>
                <span className="text-emerald-400">INFO: {b.info}</span>
                <span className="text-amber-400">WARN: {b.warn}</span>
                <span className="text-rose-400">ERROR: {b.error}</span>
                <span className="text-purple-400">AUDIT: {b.audit}</span>
              </div>

              {/* Stacked bar segments */}
              <div
                className="w-full rounded-t-sm flex flex-col overflow-hidden transition-all group-hover:brightness-125"
                style={{ height: `${heightPct}%` }}
              >
                {b.error > 0 && (
                  <div
                    className="bg-rose-500 w-full"
                    style={{ height: `${(b.error / (b.total || 1)) * 100}%` }}
                  />
                )}
                {b.warn > 0 && (
                  <div
                    className="bg-amber-400 w-full"
                    style={{ height: `${(b.warn / (b.total || 1)) * 100}%` }}
                  />
                )}
                {b.audit > 0 && (
                  <div
                    className="bg-purple-500 w-full"
                    style={{ height: `${(b.audit / (b.total || 1)) * 100}%` }}
                  />
                )}
                {b.info > 0 && (
                  <div
                    className="bg-emerald-500/60 w-full"
                    style={{ height: `${(b.info / (b.total || 1)) * 100}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Scale */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-white/5 pt-1">
        <span>T-80m (Oldest)</span>
        <span>Time Windows (5-min buckets)</span>
        <span>Now (Realtime)</span>
      </div>
    </div>
  );
}
