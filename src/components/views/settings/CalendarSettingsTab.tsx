"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Clock,
  Volume2,
  Download,
  Globe,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function CalendarSettingsTab() {
  const toast = useToast();
  const [operatorTimezone, setOperatorTimezone] = useState("Europe/Warsaw");
  const [sprintDuration, setSprintDuration] = useState("2w");
  const [reminderChime, setReminderChime] = useState("5m");
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(true);

  useEffect(() => {
    try {
      const savedTz = localStorage.getItem("dirtynest_cal_timezone");
      if (savedTz) setOperatorTimezone(savedTz);
      const savedSprint = localStorage.getItem("dirtynest_cal_sprint");
      if (savedSprint) setSprintDuration(savedSprint);
      const savedChime = localStorage.getItem("dirtynest_cal_chime");
      if (savedChime) setReminderChime(savedChime);
      const savedMon = localStorage.getItem("dirtynest_cal_startmonday");
      if (savedMon) setWeekStartsOnMonday(savedMon !== "false");
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_cal_timezone", operatorTimezone);
      localStorage.setItem("dirtynest_cal_sprint", sprintDuration);
      localStorage.setItem("dirtynest_cal_chime", reminderChime);
      localStorage.setItem("dirtynest_cal_startmonday", String(weekStartsOnMonday));
    } catch {}
    toast.success("Calendar Preferences Saved", "Timezone and schedule cadence updated.");
  };

  const handleExportIcs = async () => {
    cyberAudio.play("chime");
    try {
      const res = await fetch("/api/calendar");
      const events = await res.json();
      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DirtyNest//CyberDeck Ops//EN",
        ...events.map((ev: any) => [
          "BEGIN:VEVENT",
          `SUMMARY:${ev.title || "DirtyNest Event"}`,
          `DESCRIPTION:${ev.description || ""}`,
          `DTSTART:${new Date(ev.start_time || Date.now()).toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
          "END:VEVENT",
        ]).flat(),
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([icsLines], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest_ops_schedule_${new Date().toISOString().slice(0, 10)}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ICS Exported", "iCalendar feed snapshot downloaded.");
    } catch {
      toast.error("Export Failed", "Could not export events.");
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} />
            <span>Schedule & Tactical Calendar Settings</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure primary operator timezones, sprint cadences, audio reminder chimes & ICS export
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00c8d6] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE CALENDAR CONFIG</span>
        </button>
      </div>

      {/* Timezone and Sprint Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Globe size={13} className="text-[#00F0FF]" />
            <span>Primary Timezone</span>
          </label>
          <select
            value={operatorTimezone}
            onChange={(e) => setOperatorTimezone(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="Europe/Warsaw">Warsaw (GMT+1 / CET)</option>
            <option value="Europe/London">London (GMT+0 / UTC)</option>
            <option value="America/New_York">New York (GMT-5 / EST)</option>
            <option value="America/Los_Angeles">San Francisco (GMT-8 / PST)</option>
            <option value="Asia/Tokyo">Tokyo (GMT+9 / JST)</option>
          </select>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Clock size={13} className="text-[#00FF41]" />
            <span>Default Sprint Iteration Cycle</span>
          </label>
          <select
            value={sprintDuration}
            onChange={(e) => setSprintDuration(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="1w">1 Week (High-Velocity Sprint)</option>
            <option value="2w">2 Weeks (Standard Scrum Cycle)</option>
            <option value="4w">4 Weeks (Monthly Release Milestone)</option>
          </select>
        </div>
      </div>

      {/* Reminder Chime & Week Start */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Volume2 size={13} className="text-[#BF40FF]" />
            <span>Event Audio Alert Chime</span>
          </label>
          <select
            value={reminderChime}
            onChange={(e) => setReminderChime(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="5m">5 Minutes Before Event</option>
            <option value="15m">15 Minutes Before Event</option>
            <option value="0m">At Event Time</option>
            <option value="none">Muted (No Sound)</option>
          </select>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-[#F1F3F9] uppercase">First Day of the Week</div>
            <p className="text-[10px] text-[#4F536E] mt-0.5">Start calendar view on Monday</p>
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setWeekStartsOnMonday(!weekStartsOnMonday);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              weekStartsOnMonday ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40" : "bg-white/5 text-[#4F536E]"
            }`}
          >
            {weekStartsOnMonday ? "MONDAY" : "SUNDAY"}
          </button>
        </div>
      </div>

      {/* ICS Export */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <div className="font-bold text-xs text-[#F1F3F9] uppercase">iCalendar ICS Export Feed</div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Download standard .ics file for Google Calendar, Apple Calendar or Outlook
          </p>
        </div>

        <button
          onClick={handleExportIcs}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00F0FF] border border-white/10 font-bold text-xs transition-all cursor-pointer"
        >
          <Download size={13} />
          <span>EXPORT .ICS</span>
        </button>
      </div>
    </div>
  );
}
