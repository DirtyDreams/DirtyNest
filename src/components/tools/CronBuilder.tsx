"use client";

import { useState, useMemo } from "react";
import { Clock, Calendar, Copy, Check, Sparkles, Terminal } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const CRON_PRESETS = [
  { label: "Every Minute", cron: "* * * * *", desc: "Runs every single minute" },
  { label: "Every 5 Minutes", cron: "*/5 * * * *", desc: "Runs every 5 minutes past the hour" },
  { label: "Every 15 Minutes", cron: "*/15 * * * *", desc: "Runs at :00, :15, :30, :45" },
  { label: "Hourly at :00", cron: "0 * * * *", desc: "Runs at minute 0 of every hour" },
  { label: "Daily at Midnight", cron: "0 0 * * *", desc: "Runs once a day at 00:00 UTC" },
  { label: "Every Weekday 9 AM", cron: "0 9 * * 1-5", desc: "Runs Mon-Fri at 09:00 AM" },
  { label: "Weekly on Sunday", cron: "0 0 * * 0", desc: "Runs every Sunday at midnight" },
  { label: "Monthly on 1st", cron: "0 0 1 * *", desc: "Runs on day 1 of every month" },
];

function explainCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (must have 5 space-separated parts)";

  const [min, hour, dom, mon, dow] = parts;

  let desc = "";

  // Minutes
  if (min === "*") desc += "Every minute";
  else if (min.startsWith("*/")) desc += `Every ${min.slice(2)} minutes`;
  else desc += `At minute ${min}`;

  // Hours
  if (hour === "*") {
    if (min !== "*") desc += " of every hour";
  } else if (hour.startsWith("*/")) {
    desc += `, every ${hour.slice(2)} hours`;
  } else {
    desc += `, past hour ${hour}:00`;
  }

  // Day of Month
  if (dom !== "*") {
    desc += `, on day ${dom} of the month`;
  }

  // Month
  if (mon !== "*") {
    desc += `, in month ${mon}`;
  }

  // Day of week
  if (dow === "1-5") desc += `, Monday through Friday`;
  else if (dow === "0,6" || dow === "6,0") desc += `, on weekends`;
  else if (dow === "0" || dow === "7") desc += `, on Sunday`;
  else if (dow === "1") desc += `, on Monday`;
  else if (dow !== "*") desc += `, on weekday ${dow}`;

  return desc;
}

// Simple next run simulator for next 5 times
function getNextRuns(cron: string, count = 5): string[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const results: string[] = [];
  const now = new Date();
  let cursor = new Date(now.getTime() + 60000);
  cursor.setSeconds(0, 0);

  const [mStr, hStr, domStr, monStr, dowStr] = parts;

  const matches = (val: number, rule: string) => {
    if (rule === "*") return true;
    if (rule.startsWith("*/")) {
      const step = parseInt(rule.slice(2), 10);
      return val % step === 0;
    }
    if (rule.includes(",")) {
      return rule.split(",").map(Number).includes(val);
    }
    if (rule.includes("-")) {
      const [start, end] = rule.split("-").map(Number);
      return val >= start && val <= end;
    }
    return val === parseInt(rule, 10);
  };

  let loops = 0;
  while (results.length < count && loops < 20000) {
    loops++;
    const minute = cursor.getMinutes();
    const hour = cursor.getHours();
    const dom = cursor.getDate();
    const mon = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      matches(minute, mStr) &&
      matches(hour, hStr) &&
      matches(dom, domStr) &&
      matches(mon, monStr) &&
      matches(dow, dowStr)
    ) {
      results.push(cursor.toLocaleString());
    }
    cursor = new Date(cursor.getTime() + 60000);
  }

  return results;
}

export default function CronBuilder() {
  const [cron, setCron] = useState("*/15 * * * *");
  const [copied, setCopied] = useState<string | null>(null);

  const explanation = useMemo(() => explainCron(cron), [cron]);
  const nextRuns = useMemo(() => getNextRuns(cron, 5), [cron]);

  const copyText = (text: string, id: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const parts = cron.trim().split(/\s+/);
  const minuteVal = parts[0] || "*";
  const hourVal = parts[1] || "*";
  const domVal = parts[2] || "*";
  const monVal = parts[3] || "*";
  const dowVal = parts[4] || "*";

  const updatePart = (index: number, val: string) => {
    const arr = [...parts];
    while (arr.length < 5) arr.push("*");
    arr[index] = val.trim() || "*";
    setCron(arr.join(" "));
  };

  return (
    <div className="flex flex-col gap-4.5 font-mono">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            Cron Schedule Expression Builder
          </h3>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#4F536E] mr-1">PRESETS:</span>
          {CRON_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                cyberAudio.play("click");
                setCron(p.cron);
              }}
              className="px-2 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Field Interactive Segment Editor */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { label: "MINUTE (0-59)", val: minuteVal, idx: 0, placeholder: "0-59, */5" },
            { label: "HOUR (0-23)", val: hourVal, idx: 1, placeholder: "0-23, */2" },
            { label: "DAY OF MO (1-31)", val: domVal, idx: 2, placeholder: "1-31, *" },
            { label: "MONTH (1-12)", val: monVal, idx: 3, placeholder: "1-12, *" },
            { label: "DAY OF WK (0-6)", val: dowVal, idx: 4, placeholder: "0-6, 1-5" },
          ].map((field) => (
            <div key={field.idx} className="flex flex-col gap-1.5">
              <label className="text-[9px] text-[#9499B3] uppercase font-bold tracking-wider truncate">
                {field.label}
              </label>
              <input
                type="text"
                value={field.val}
                onChange={(e) => updatePart(field.idx, e.target.value)}
                placeholder={field.placeholder}
                className="p-2.5 rounded-lg bg-black/50 border border-white/10 focus:border-[#00F0FF] text-center text-xs font-bold text-[#00F0FF] outline-none transition-all"
              />
            </div>
          ))}
        </div>

        {/* Master Expression Line */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/10 mt-1">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-[#00FF41]" />
            <span className="text-sm font-bold text-[#00FF41] tracking-widest">{cron}</span>
          </div>
          <button
            onClick={() => copyText(cron, "cron")}
            className="flex items-center gap-1 text-xs text-[#00FF41] hover:underline cursor-pointer"
          >
            {copied === "cron" ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied === "cron" ? "COPIED" : "COPY CRON"}</span>
          </button>
        </div>
      </div>

      {/* Human Readable Explanation & Next 5 Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Human Translation */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#BF40FF] border-b border-white/5 pb-2">
            <Sparkles size={14} />
            <span>HUMAN READABLE SCHEDULE</span>
          </div>
          <p className="text-xs text-[#F1F3F9] leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
            {explanation}
          </p>
          <p className="text-[10px] text-[#4F536E]">
            Evaluated according to standard POSIX crontab specification in local browser timezone.
          </p>
        </div>

        {/* Next 5 Executions */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00FF41] border-b border-white/5 pb-2">
            <Calendar size={14} />
            <span>UPCOMING 5 SCHEDULED EXECUTIONS</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {nextRuns.length === 0 && (
              <p className="text-xs text-[#4F536E] py-4 text-center">
                Invalid or unresolvable schedule expression
              </p>
            )}
            {nextRuns.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs text-[#9499B3]"
              >
                <span className="font-bold text-[#00F0FF] text-[10px]">#{idx + 1}</span>
                <span className="font-mono text-[#F1F3F9]">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
