"use client";

import { useState } from "react";
import { Trash2, Calendar } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface ScheduledPost {
  id: string;
  platform: string;
  platformColor: string;
  scheduledTime: string;
  copy: string;
  status: "scheduled" | "published" | "draft" | "failed";
  hasMedia: boolean;
}

export const INITIAL_SCHEDULE: ScheduledPost[] = [
  {
    id: "post-01",
    platform: "X / Twitter",
    platformColor: "#00F0FF",
    scheduledTime: "Today at 18:00 (Prime Dev Hour)",
    copy: "⚡ How we achieved sub-10ms persistent memory recall with SQLite FTS5 in DirtyNest. Full architectural breakdown inside 🧵👇 #DevOps #SQLite #Hermes",
    status: "scheduled",
    hasMedia: true,
  },
  {
    id: "post-02",
    platform: "Discord Announce",
    platformColor: "#BF40FF",
    scheduledTime: "Today at 20:30 (Community Hangout)",
    copy: "🎙️ Stream Alert: KIRA is going live with real-time DSP voice synthesis! Join the voice channel to test the audio matrix.",
    status: "scheduled",
    hasMedia: true,
  },
  {
    id: "post-03",
    platform: "LinkedIn Tech",
    platformColor: "#00FF41",
    scheduledTime: "Tomorrow at 09:00 (Enterprise Feed)",
    copy: "Why zero-trust socket clearance interceptors are replacing static API gateways in modern AI microservices.",
    status: "draft",
    hasMedia: false,
  },
  {
    id: "post-04",
    platform: "Reddit /r/Cyberpunk",
    platformColor: "#FFB800",
    scheduledTime: "Yesterday at 22:00",
    copy: "Showcasing our CRT scanline terminal dashboard with binaural focus soundboard and Matrix rain zen canvas.",
    status: "published",
    hasMedia: true,
  },
];

interface Props {
  posts: ScheduledPost[];
}

export default function SocialScheduledQueue({ posts }: Props) {
  const [schedule, setSchedule] = useState<ScheduledPost[]>(posts.length > 0 ? posts : INITIAL_SCHEDULE);

  const handlePublishNow = (id: string) => {
    cyberAudio.play("chime");
    setSchedule((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "published" } : p))
    );
  };

  const handleDelete = (id: string) => {
    cyberAudio.play("click");
    setSchedule((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              SCHEDULED DISPATCH QUEUE // <span className="text-[#00FF41]">AUTOMATED RADAR</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Chronological pipeline of upcoming social broadcasts and approval gates
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          {schedule.filter((p) => p.status === "scheduled").length} QUEUED
        </span>
      </div>

      {/* List of Posts */}
      <div className="space-y-3">
        {schedule.map((p) => {
          return (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.platformColor }} />
                  <span className="text-xs font-bold text-[#F1F3F9]">{p.platform}</span>
                  <span className="text-[9px] text-[#4F536E]">· {p.scheduledTime}</span>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                    p.status === "published"
                      ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                      : p.status === "scheduled"
                      ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 animate-pulse"
                      : "bg-white/5 text-[#9499B3] border-white/10"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-[#9499B3] leading-relaxed font-sans">
                {p.copy}
              </p>

              {/* Actions Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                <span className="text-[#4F536E]">
                  {p.hasMedia ? "📸 Image Asset Attached" : "📝 Text Only"}
                </span>

                <div className="flex items-center gap-2">
                  {p.status !== "published" && (
                    <button
                      type="button"
                      onClick={() => handlePublishNow(p.id)}
                      className="px-3 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] font-bold hover:bg-[#00FF41]/25 cursor-pointer"
                    >
                      PUBLISH NOW
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-[#4F536E] hover:text-[#FF2A6D] cursor-pointer"
                    title="Cancel Dispatch"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
