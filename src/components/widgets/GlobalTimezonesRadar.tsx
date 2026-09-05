"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Globe,
} from "lucide-react";

interface TimezoneNode {
  city: string;
  tz: string;
  flag: string;
  offset: string;
}

const NODES: TimezoneNode[] = [
  { city: "Warsaw", tz: "Europe/Warsaw", flag: "🇵🇱", offset: "UTC+1" },
  { city: "London", tz: "Europe/London", flag: "🇬🇧", offset: "UTC+0" },
  { city: "San Francisco", tz: "America/Los_Angeles", flag: "🇺🇸", offset: "UTC-8" },
  { city: "New York", tz: "America/New_York", flag: "🇺🇸", offset: "UTC-5" },
  { city: "Tokyo", tz: "Asia/Tokyo", flag: "🇯🇵", offset: "UTC+9" },
];

export default function GlobalTimezonesRadar() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const map: Record<string, string> = {};
      NODES.forEach((n) => {
        map[n.city] = now.toLocaleTimeString("en-US", {
          timeZone: n.tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      });
      setTimes(map);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              GLOBAL COMMAND TIMEZONES
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Distributed Operations Chronometer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#00FF41] font-bold">
          <Globe size={12} />
          <span>SYNCED</span>
        </div>
      </div>

      {/* Timezone Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {NODES.map((n) => (
          <div
            key={n.city}
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs">{n.flag}</span>
              <span className="text-[9px] text-[#4F536E]">{n.offset}</span>
            </div>
            <span className="font-bold text-[11px] text-[#F1F3F9]">{n.city}</span>
            <span className="font-mono text-xs font-bold text-[#00FF41]">
              {times[n.city] || "--:--:--"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
