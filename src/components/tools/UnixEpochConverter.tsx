"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function UnixEpochConverter() {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState(Math.floor(Date.now() / 1000).toString());
  const [inputDateStr, setInputDateStr] = useState(new Date().toISOString().slice(0, 16));
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedEpochNum = parseInt(inputEpoch, 10) || 0;
  // Handle seconds vs milliseconds automatically
  const parsedDate = new Date(parsedEpochNum > 9999999999 ? parsedEpochNum : parsedEpochNum * 1000);

  const handleCopy = (text: string, label: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleDateToEpoch = (dateString: string) => {
    setInputDateStr(dateString);
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      setInputEpoch(Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              UNIX EPOCH TIME CONVERTER
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Real-time POSIX Chronometer & Timestamp Parser
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputEpoch(currentEpoch.toString())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#00FF41] font-bold border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw size={11} />
            <span>SET TO NOW</span>
          </button>
        </div>
      </div>

      {/* Live Current Epoch Banner */}
      <div className="cyber-card p-4 bg-[#080914] border border-[#00FF41]/30 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase font-bold">Current Unix Timestamp</span>
          <span className="text-xl font-black text-[#00FF41] font-mono tracking-wider">
            {currentEpoch}
          </span>
        </div>

        <button
          onClick={() => handleCopy(currentEpoch.toString(), "current")}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#00FF41] cursor-pointer"
          title="Copy Live Epoch"
        >
          {copied === "current" ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Two-Way Conversion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Epoch to Human Date */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl space-y-3">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">
            Convert Timestamp ➔ Human Date
          </span>

          <input
            type="text"
            value={inputEpoch}
            onChange={(e) => setInputEpoch(e.target.value)}
            placeholder="Enter seconds or milliseconds..."
            className="w-full px-3 py-2 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none"
          />

          <div className="space-y-2 pt-1">
            {[
              { label: "ISO 8601", value: parsedDate.toISOString() },
              { label: "UTC String", value: parsedDate.toUTCString() },
              { label: "Local Time", value: parsedDate.toString() },
            ].map((item) => (
              <div
                key={item.label}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex flex-col truncate">
                  <span className="text-[9px] text-[#4F536E] uppercase">{item.label}</span>
                  <span className="font-mono text-[#F1F3F9] text-[11px] truncate">
                    {item.value}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(item.value, item.label)}
                  className="p-1.5 text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
                >
                  {copied === item.label ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Human Date to Epoch */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl space-y-3">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">
            Convert Human Date ➔ Timestamp
          </span>

          <input
            type="datetime-local"
            value={inputDateStr}
            onChange={(e) => handleDateToEpoch(e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none"
          />

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4F536E] uppercase">Unix Seconds</span>
                <span className="font-mono text-[#00FF41] text-sm font-bold">
                  {inputEpoch}
                </span>
              </div>
              <button
                onClick={() => handleCopy(inputEpoch, "seconds")}
                className="p-1.5 text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
              >
                {copied === "seconds" ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4F536E] uppercase">Milliseconds</span>
                <span className="font-mono text-[#00F0FF] text-sm font-bold">
                  {(parseInt(inputEpoch, 10) * 1000).toString()}
                </span>
              </div>
              <button
                onClick={() => handleCopy((parseInt(inputEpoch, 10) * 1000).toString(), "ms")}
                className="p-1.5 text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
              >
                {copied === "ms" ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
