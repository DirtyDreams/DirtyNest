"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Download, Trash2, Volume2, Sparkles, FileCode, Check, AudioLines } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface AudioTake {
  id: string;
  title: string;
  voiceName: string;
  durationSec: number;
  scriptSnippet: string;
  visemeJson: string;
  created: string;
}

export const SAMPLE_TAKES: AudioTake[] = [
  {
    id: "take-01",
    title: "Stream Intro // Midnight Net Run",
    voiceName: "KIRA // Neon VTuber",
    durationSec: 4.8,
    scriptSnippet: "Hey chat! Welcome back to the stream! Let's hack some firewalls today!",
    visemeJson: '{"visemes": [["k", 0.12], ["ih", 0.28], ["r", 0.44], ["aa", 0.62]]}',
    created: "2026-08-26 23:10",
  },
  {
    id: "take-02",
    title: "Cyber Idol Single Vocal Hook",
    voiceName: "AOA-01 // Cyber Idol",
    durationSec: 6.2,
    scriptSnippet: "Synchronizing heartbeat with the neon pulse of Neo-Warsaw. Listen closely.",
    visemeJson: '{"visemes": [["s", 0.15], ["ih", 0.35], ["ng", 0.55], ["k", 0.85]]}',
    created: "2026-08-26 22:45",
  },
  {
    id: "take-03",
    title: "Tactical Defense Briefing",
    voiceName: "TITAN // Strike Commander",
    durationSec: 5.4,
    scriptSnippet: "All units, hold perimeter. DirtyNest defense matrix is fully operational.",
    visemeJson: '{"visemes": [["aa", 0.10], ["l", 0.25], ["y", 0.40], ["uw", 0.60]]}',
    created: "2026-08-26 21:20",
  },
];

interface Props {
  takes: AudioTake[];
  onSelectTake?: (take: AudioTake) => void;
}

export default function AudioTakesVault({ takes }: Props) {
  const [activeTakeId, setActiveTakeId] = useState<string>(takes[0]?.id || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedViseme, setCopiedViseme] = useState(false);

  const activeTake = takes.find((t) => t.id === activeTakeId) || takes[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = (id: string) => {
    if (activeTakeId === id && isPlaying) {
      setIsPlaying(false);
    } else {
      cyberAudio.play("chime");
      setActiveTakeId(id);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleCopyVisemes = () => {
    if (!activeTake) return;
    cyberAudio.play("click");
    navigator.clipboard?.writeText(activeTake.visemeJson);
    setCopiedViseme(true);
    setTimeout(() => setCopiedViseme(false), 2000);
  };

  const handleDownloadWav = () => {
    cyberAudio.play("chime");
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <AudioLines size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              AUDIO TAKES VAULT // <span className="text-[#00FF41]">STEMS & PHONEMES</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Multi-take vocal stems, 3D viseme phoneme timelines & 48kHz WAV export
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          {takes.length} TAKES RECORDED
        </span>
      </div>

      {/* Main Waveform Player */}
      {activeTake && (
        <div className="p-4 rounded-2xl bg-black/80 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black text-[#F1F3F9] truncate">{activeTake.title}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#00FF41] border border-white/10 font-bold shrink-0">
                {activeTake.voiceName}
              </span>
            </div>
            <span className="text-[10px] text-[#4F536E] shrink-0">{activeTake.durationSec}s · 48kHz 24-bit</span>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="h-14 w-full flex items-center gap-1 px-2 bg-black/60 rounded-xl border border-white/5 overflow-hidden">
            {Array.from({ length: 48 }).map((_, idx) => {
              const active = (idx / 48) * 100 <= progress;
              const heightPct = Math.max(15, Math.sin(idx * 0.4) * 45 + 50);

              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all ${
                    active ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-white/10"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>

          {/* Playback Controls & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => togglePlay(activeTake.id)}
                className="w-8 h-8 rounded-xl bg-[#00FF41] text-black flex items-center justify-center font-bold hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.4)]"
              >
                {isPlaying && activeTakeId === activeTake.id ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <span className="text-xs text-[#9499B3]">
                {((activeTake.durationSec * progress) / 100).toFixed(1)}s / {activeTake.durationSec}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyVisemes}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-[#00F0FF] cursor-pointer"
                title="Copy Phoneme Visemes JSON for VTuber 3D Lip-Sync"
              >
                {copiedViseme ? <Check size={12} className="text-[#00FF41]" /> : <FileCode size={12} />}
                <span>{copiedViseme ? "COPIED JSON" : "COPY VISEMES"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadWav}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#00FF41]/15 border border-[#00FF41]/30 hover:bg-[#00FF41]/25 text-xs font-bold text-[#00FF41] cursor-pointer"
              >
                <Download size={12} />
                <span>EXPORT WAV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Takes List Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#4F536E] uppercase block px-1">
          Recent Takes Stream ({takes.length})
        </span>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
          {takes.map((t) => {
            const isSelected = activeTakeId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setActiveTakeId(t.id);
                  setIsPlaying(false);
                  setProgress(0);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#F1F3F9]"
                    : "bg-black/40 border-white/5 text-[#9499B3] hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(t.id);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#00FF41] hover:text-black text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    {isPlaying && activeTakeId === t.id ? <Pause size={12} /> : <Play size={12} />}
                  </button>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#F1F3F9] block truncate">{t.title}</span>
                    <span className="text-[10px] text-[#4F536E] block truncate">{t.scriptSnippet}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#4F536E]">
                  <span>{t.durationSec}s</span>
                  <span className="text-[#00FF41] font-bold">{t.voiceName.split("//")[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
