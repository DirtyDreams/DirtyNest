"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  Calendar as CalendarIcon,
  Plus,
  Flame,
  Trash2,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
=======
import { Calendar as CalendarIcon, Plus, Flame, Trash2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import {  } from "./SocialScheduledQueue";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24

interface CalendarDay {
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  bestTimeSlot?: string;
  peakReachMultiplier?: string;
}

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const INITIAL_CALENDAR_POSTS = [
  {
    id: "cal-01",
    dayNumber: 27,
    time: "10:15",
    platform: "X / Twitter",
    platformColor: "#1DA1F2",
    title: "DirtyNest v3.5 Alpha Release Announcement",
    reach: "+48% Peak",
    status: "scheduled",
  },
  {
    id: "cal-02",
    dayNumber: 27,
    time: "15:30",
    platform: "Discord Announce",
    platformColor: "#5865F2",
    title: "Live Community AMA with Hermes AI Agent",
    reach: "+35% Peak",
    status: "scheduled",
  },
  {
    id: "cal-03",
    dayNumber: 28,
    time: "11:00",
    platform: "Telegram Channel",
    platformColor: "#0088CC",
    title: "Zero-Shot Voice Cloning Tutorial Breakdown",
    reach: "+22% Peak",
    status: "draft",
  },
  {
    id: "cal-04",
    dayNumber: 29,
    time: "09:00",
    platform: "LinkedIn Tech",
    platformColor: "#0A66C2",
    title: "Why Autonomous Agent Architectures Win in 2026",
    reach: "+52% Peak",
    status: "scheduled",
  },
  {
    id: "cal-05",
    dayNumber: 30,
    time: "18:45",
    platform: "Reddit /r/Cyberpunk",
    platformColor: "#FF4500",
    title: "Showcase: Cyberpunk Terminal UI with Web Audio Synth",
    reach: "+65% Viral",
    status: "draft",
  },
];

export default function SocialContentCalendar() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [selectedDay, setSelectedDay] = useState<number>(27);
  const [calendarPosts, setCalendarPosts] = useState(INITIAL_CALENDAR_POSTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState("X / Twitter");
  const [newPostTime, setNewPostTime] = useState("14:00");

  // Simulated August 2026 calendar days
  const days: CalendarDay[] = Array.from({ length: 31 }, (_, i) => {
    const dayNumber = i + 1;
    const isToday = dayNumber === 27;
    let bestTimeSlot;
    let peakReachMultiplier;

    if (dayNumber % 3 === 0) {
      bestTimeSlot = "10:15 AM";
      peakReachMultiplier = "+42% REACH";
    } else if (dayNumber % 2 === 0) {
      bestTimeSlot = "03:30 PM";
      peakReachMultiplier = "+38% ENGAGE";
    } else {
      bestTimeSlot = "08:00 PM";
      peakReachMultiplier = "+25% REACH";
    }

    return {
      dayNumber,
      dateStr: `2026-08-${dayNumber < 10 ? `0${dayNumber}` : dayNumber}`,
      isToday,
      bestTimeSlot,
      peakReachMultiplier,
    };
  });

  const getPostsForDay = (dayNum: number) => {
    return calendarPosts.filter(
      (p) =>
        p.dayNumber === dayNum &&
        (platformFilter === "ALL" || p.platform.includes(platformFilter))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    cyberAudio.play("warp");
    const colors: Record<string, string> = {
      "X / Twitter": "#1DA1F2",
      "Discord Announce": "#5865F2",
      "Telegram Channel": "#0088CC",
      "LinkedIn Tech": "#0A66C2",
      "Reddit /r/Cyberpunk": "#FF4500",
    };

    const newPost = {
      id: `cal-${Date.now()}`,
      dayNumber: selectedDay,
      time: newPostTime,
      platform: newPostPlatform,
      platformColor: colors[newPostPlatform] || "#00FF41",
      title: newPostTitle.trim(),
      reach: "+35% Peak",
      status: "scheduled",
    };

    setCalendarPosts([...calendarPosts, newPost]);
    setNewPostTitle("");
    setShowAddModal(false);
  };

  const handleDeletePost = (id: string) => {
    cyberAudio.play("click");
    setCalendarPosts(calendarPosts.filter((p) => p.id !== id));
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                CONTENT EDITORIAL CALENDAR // <span className="text-[#00FF41]">AUGUST 2026</span>
              </h3>
              <span className="text-[9px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
                AI TIME-SLOT OPTIMIZER
              </span>
            </div>
            <p className="text-[10px] text-[#4F536E]">
              Omnichannel schedule matrix with peak engagement algorithmic heatmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Filters */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[10px]">
            {["ALL", "X", "Discord", "Telegram", "LinkedIn", "Reddit"].map((pl) => (
              <button
                key={pl}
                type="button"
                onClick={() => {
                  cyberAudio.play("click");
                  setPlatformFilter(pl);
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  platformFilter === pl
                    ? "bg-[#00FF41] text-black"
                    : "text-[#9499B3] hover:text-white"
                }`}
              >
                {pl}
              </button>
            ))}
          </div>

          {/* New Post Button */}
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
          >
            <Plus size={14} />
            <span>SCHEDULE POST</span>
          </button>
        </div>
      </div>

      {/* Best Time to Post Heatmap Banner */}
      <div className="p-3 rounded-2xl bg-black/60 border border-[#00FF41]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#00FF41] font-bold">
          <Flame size={16} className="text-[#00FF41]" />
          <span>TODAY&apos;S OPTIMAL REACH WINDOWS (AUG 27):</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
            ⚡ 10:15 AM (+48% REACH)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            ⚡ 03:30 PM (+35% ENGAGE)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#BF40FF]/10 text-[#BF40FF] border border-[#BF40FF]/30">
            ⚡ 08:00 PM (+52% CLICKS)
          </span>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-[#4F536E] uppercase pt-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="p-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid (31 Days) */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day.dayNumber);
          const isSelected = selectedDay === day.dayNumber;

          return (
            <div
              key={day.dayNumber}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedDay(day.dayNumber);
              }}
              className={`min-h-[110px] p-2 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                day.isToday
                  ? "bg-[#00FF41]/5 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                  : isSelected
                  ? "bg-white/[0.08] border-white/40"
                  : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${
                    day.isToday
                      ? "bg-[#00FF41] text-black"
                      : "text-[#F1F3F9]"
                  }`}
                >
                  {day.dayNumber}
                </span>

                {day.peakReachMultiplier && (
                  <span className="text-[7px] font-bold text-[#00FF41] opacity-70">
                    {day.peakReachMultiplier}
                  </span>
                )}
              </div>

              {/* Day Scheduled Posts List */}
              <div className="space-y-1 my-1 overflow-hidden">
                {dayPosts.map((p) => (
                  <div
                    key={p.id}
                    className="p-1 rounded-lg bg-black/80 border border-white/10 flex items-center justify-between text-[8px] group"
                    style={{ borderLeftColor: p.platformColor, borderLeftWidth: 3 }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white block truncate">{p.title}</span>
                      <span className="text-[#9499B3] block truncate">{p.time} • {p.platform}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 p-0.5"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Add Action */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay(day.dayNumber);
                    setShowAddModal(true);
                  }}
                  className="text-[8px] text-[#4F536E] hover:text-[#00FF41] font-bold flex items-center justify-end gap-0.5 w-full"
                >
                  <Plus size={9} />
                  <span>ADD</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono">
          <form
            onSubmit={handleCreatePost}
            className="w-full max-w-md rounded-2xl border border-white/15 p-5 flex flex-col gap-4 shadow-2xl relative bg-black/95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  SCHEDULE POST // AUGUST {selectedDay}, 2026
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-[#9499B3] font-bold block mb-1">
                Post Title / Campaign Concept:
              </label>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Systems Feature Teaser..."
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#00FF41] outline-none font-mono"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#9499B3] font-bold block mb-1">
                  Target Platform:
                </label>
                <select
                  value={newPostPlatform}
                  onChange={(e) => setNewPostPlatform(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black border border-white/15 text-xs text-[#00FF41] font-mono outline-none cursor-pointer"
                >
                  <option value="X / Twitter">X / Twitter</option>
                  <option value="Discord Announce">Discord Announce</option>
                  <option value="Telegram Channel">Telegram Channel</option>
                  <option value="LinkedIn Tech">LinkedIn Tech</option>
                  <option value="Reddit /r/Cyberpunk">Reddit /r/Cyberpunk</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#9499B3] font-bold block mb-1">
                  Time Slot:
                </label>
                <input
                  type="time"
                  value={newPostTime}
                  onChange={(e) => setNewPostTime(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black border border-white/15 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-[#9499B3] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.3)]"
              >
                SCHEDULE POST
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
