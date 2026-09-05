"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Clock,
  Code,
  Copy,
  Check,
} from "lucide-react";
=======
import { Clock, Code, Copy, Check } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

export default function ToolsContextDeck() {
  const [epochTime, setEpochTime] = useState(Math.floor(Date.now() / 1000));
  const [b64Input, setB64Input] = useState("DirtyNest-Core");
  const [b64Output, setB64Output] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEpochTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      setB64Output(btoa(b64Input));
    } catch {
      setB64Output("Error");
    }
  }, [b64Input]);

  const handleCopy = (text: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Live Unix Epoch Clock */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00FF41]/30 rounded-xl space-y-1.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00FF41]">
            <Clock size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Unix Epoch Timestamp
            </span>
          </div>
          <button
            onClick={() => handleCopy(epochTime.toString())}
            className="text-[10px] text-[#9499B3] hover:text-[#00FF41] cursor-pointer"
            title="Copy Epoch Time"
          >
            {copied ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
          </button>
        </div>
        <div className="text-base font-black text-[#F1F3F9] font-mono tracking-wider">
          {epochTime}
        </div>
        <span className="text-[9px] text-[#4F536E]">Seconds since Jan 01 1970</span>
      </div>

      {/* Quick Base64 Encoder */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <Code size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Quick Base64 Converter
            </span>
          </div>
        </div>

        <input
          type="text"
          value={b64Input}
          onChange={(e) => setB64Input(e.target.value)}
          placeholder="Type string..."
          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-lg text-[10px] text-[#F1F3F9] outline-none"
        />

        <div className="p-2 rounded-lg bg-black/80 border border-white/5 flex items-center justify-between gap-1 text-[10px] text-[#00F0FF] font-mono break-all">
          <span className="truncate">{b64Output}</span>
          <button
            onClick={() => handleCopy(b64Output)}
            className="p-1 hover:text-white cursor-pointer shrink-0"
          >
            <Copy size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
