"use client";

import { useState, useEffect } from "react";
import { Clock as ClockIcon, Globe, Radio } from "lucide-react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time ? time.getHours().toString().padStart(2, "0") : "--";
  const minutes = time ? time.getMinutes().toString().padStart(2, "0") : "--";
  const seconds = time ? time.getSeconds().toString().padStart(2, "0") : "--";
  const secNumber = time ? time.getSeconds() : 0;
  
  const dateStr = time
    ? time.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Synchronizing...";

  // Calculate timezone offset
  const tzOffset = time ? -time.getTimezoneOffset() / 60 : 0;
  const tzString = `UTC${tzOffset >= 0 ? `+${tzOffset}` : tzOffset}`;

  // Progress for seconds ring (0 - 360deg)
  const secondsAngle = (secNumber / 60) * 360;

  return (
    <div className="cyber-card p-4.5 relative" suppressHydrationWarning>
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <ClockIcon size={15} className="icon" />
        <h3>Chronometer</h3>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/20">
          <Radio size={10} className="text-[#00FF41] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00FF41]">LOCKED</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-1 pb-2">
        {/* Glowing Digital Time */}
        <div className="relative flex items-center justify-center gap-1.5 my-1">
          <div
            className="flex items-baseline font-mono font-black tracking-tight"
            style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}
          >
            <span
              className="text-4xl text-[#00FF41] neon-glow-green tracking-tight"
            >
              {hours}
            </span>
            <span
              className="text-3xl text-[#00FF41] animate-blink mx-0.5 opacity-80"
            >
              :
            </span>
            <span
              className="text-4xl text-[#00FF41] neon-glow-green tracking-tight"
            >
              {minutes}
            </span>
          </div>

          {/* Seconds tag */}
          <div className="flex flex-col items-start ml-1.5">
            <span
              className="text-sm font-mono font-bold text-[#BF40FF] px-1.5 py-0.5 rounded bg-[#BF40FF]/15 border border-[#BF40FF]/30 neon-glow-purple"
            >
              {seconds}
            </span>
            <span className="text-[9px] font-mono text-[#4F536E] mt-0.5 uppercase">
              SEC
            </span>
          </div>
        </div>

        {/* Seconds Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00FF41] via-[#00F0FF] to-[#BF40FF] transition-all duration-300 rounded-full"
            style={{ width: `${(secNumber / 59) * 100}%` }}
          />
        </div>

        {/* Date & Timezone Metadata */}
        <div className="w-full flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[11px] font-mono text-[#9499B3]">
          <span>{dateStr}</span>
          <div className="flex items-center gap-1 text-[#00F0FF]">
            <Globe size={11} />
            <span>{tzString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
