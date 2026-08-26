"use client";

import { useState, useEffect, memo } from "react";
import { Activity } from "lucide-react";

export const UptimeBadge = memo(function UptimeBadge({ initialSeconds = 14820 }: { initialSeconds?: number }) {
  const [uptimeSeconds, setUptimeSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[11px] font-mono text-[#9499B3]">
      <Activity size={12} className="text-[#00FF41] animate-pulse" />
      <span className="text-[#4F536E]">UPTIME:</span>
      <span className="text-[#F1F3F9] font-medium">{formatUptime(uptimeSeconds)}</span>
    </div>
  );
});
