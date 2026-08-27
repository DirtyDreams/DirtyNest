"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Radio,
  Tag,
  Timer,
  Trash2,
  Globe,
  Sliders,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { EventCalendar, CalendarItem } from "@/components/ui/calendar/EventCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  category: "DEPLOYMENT" | "CRON_BACKUP" | "SECURITY_AUDIT" | "SPRINT_MILESTONE" | "MAINTENANCE";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  description: string;
  recurrence?: "ONCE" | "HOURLY" | "DAILY" | "WEEKLY";
  lastRun?: string;
}

const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: "evt-1",
    title: "v2.6 Staging Deployment & Edge Route Canary",
    category: "DEPLOYMENT",
    date: new Date().toISOString().split("T")[0],
    time: "22:00",
    priority: "CRITICAL",
    description: "Rollout of unified Next.js 16.3 runtime across European edge proxy cluster.",
  },
  {
    id: "evt-2",
    title: "Automated Postgres Full Snapshot & Vector Vacuum",
    category: "CRON_BACKUP",
    date: new Date().toISOString().split("T")[0],
    time: "04:00",
    priority: "HIGH",
    description: "pg_dumpall encrypted pipeline to cold S3 storage & vector index compaction.",
  },
  {
    id: "evt-3",
    title: "Weekly Red Team Penetration & Token Audit",
    category: "SECURITY_AUDIT",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "14:30",
    priority: "HIGH",
    description: "Automated fuzzing of external GraphQL and MCP endpoint interfaces.",
  },
  {
    id: "evt-4",
    title: "Sprint 42 Consensus & Agent Swarm Review",
    category: "SPRINT_MILESTONE",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "16:00",
    priority: "NORMAL",
    description: "Q3 roadmap alignment with autonomous agent development pipelines.",
  },
];

export default function ScheduleView() {
  const [events, setEvents] = useState<ScheduleEvent[]>(INITIAL_EVENTS);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [viewMode, setViewMode] = useState<"calendar" | "gantt">("calendar");
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  // New Event Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ScheduleEvent["category"]>("DEPLOYMENT");
  const [newDate, setNewDate] = useState(selectedDate);
  const [newTime, setNewTime] = useState("12:00");
  const [newPriority, setNewPriority] = useState<ScheduleEvent["priority"]>("HIGH");
  const [newRecurrence, setNewRecurrence] = useState<ScheduleEvent["recurrence"]>("DAILY");
  const [newDesc, setNewDesc] = useState("");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    cyberAudio.play("chime");

    const newEvt: ScheduleEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      priority: newPriority,
      recurrence: newRecurrence,
      description: newDesc,
    };

    setEvents((prev) => [newEvt, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
  };

  const calendarItems: CalendarItem[] = useMemo(() => {
    return events.map((e) => {
      let cat: CalendarItem["category"] = "TASK";
      if (e.category === "DEPLOYMENT") cat = "DEPLOY";
      else if (e.category === "CRON_BACKUP") cat = "CRON";
      else if (e.category === "SECURITY_AUDIT") cat = "SECURITY";
      else if (e.category === "MAINTENANCE") cat = "MAINTENANCE";

      return {
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        category: cat,
        priority: e.priority.toLowerCase() as any,
        description: e.description,
      };
    });
  }, [events]);

  const handleTriggerCronJob = (id: string) => {
    cyberAudio.play("click");
    setRunningJobId(id);
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, lastRun: new Date().toLocaleTimeString("en-US", { hour12: false }) }
            : e
        )
      );
      setRunningJobId(null);
      cyberAudio.play("chime");
    }, 1200);
  };

  const handleDeleteEvent = (id: string) => {
    cyberAudio.play("error");
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Calendar Grid Days Calculation
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + currentMonthOffset);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: 0, dateStr: "", isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthFormatted = String(month + 1).padStart(2, "0");
      const dayFormatted = String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr: `${year}-${monthFormatted}-${dayFormatted}`,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);
  const filteredEvents = events.filter(
    (e) => categoryFilter === "ALL" || e.category === categoryFilter
  );

  const getCategoryColor = (cat: ScheduleEvent["category"]) => {
    switch (cat) {
      case "DEPLOYMENT": return "#00FF41";
      case "CRON_BACKUP": return "#00F0FF";
      case "SECURITY_AUDIT": return "#FF003C";
      case "SPRINT_MILESTONE": return "#BF40FF";
      case "MAINTENANCE": return "#FFB800";
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in font-mono select-none">
      {/* TOP HEADER HUD */}
      <div className="cyber-card p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.25) 0%, rgba(191,64,255,0.2) 100%)",
                border: "1px solid rgba(0,255,65,0.4)",
                boxShadow: "0 0 16px rgba(0,255,65,0.3)",
              }}
            >
              <CalendarIcon size={22} className="text-[#00FF41]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#F1F3F9]">
                  SCHEDULE // <span className="text-[#00FF41]">MISSION TIMELINE</span>
                </h2>
                <span className="text-[10px] font-bold text-[#00F0FF] px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  {events.length} ACTIVE EVENTS
                </span>
              </div>
              <span className="text-xs text-[#9499B3] mt-0.5">
                Automated cron schedules · Deployment windows & Zero-downtime maintenance calendar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setViewMode("calendar");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CALENDAR GRID
              </button>
              <button
                onClick={() => {
                  cyberAudio.play("click");
                  setViewMode("gantt");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "gantt"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TIMELINE GANTT
              </button>
            </div>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] cursor-pointer"
            >
              <Plus size={14} />
              <span>NEW MISSION EVENT</span>
            </button>
          </div>
        </div>

        {/* Global World Clocks Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5 text-xs">
          {[
            { label: "UTC PROTOCOL", time: new Date().toISOString().substring(11, 19) + " UTC" },
            { label: "LOCAL SYSTEM", time: new Date().toTimeString().split(" ")[0] },
            { label: "US-EAST (EST)", time: new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" }) },
            { label: "TOKYO (JST)", time: new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Tokyo" }) },
          ].map((clk) => (
            <div key={clk.label} className="flex flex-col p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#4F536E] uppercase">{clk.label}</span>
              <span className="text-sm font-bold text-[#00FF41] mt-0.5">{clk.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW: GANTT TIMELINE */}
      {viewMode === "gantt" && (
        <div className="cyber-card p-5 flex flex-col gap-4 animate-fade-in font-mono">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                24-HOUR OPERATIONAL GANTT TIMELINE ({selectedDate})
              </h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">HOURLY RESOLUTION (00:00 - 23:59 UTC)</span>
          </div>

          {/* 24 Hour Column Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-3">
              {/* Hour Header Scale */}
              <div className="grid grid-cols-12 gap-1 text-[9px] text-slate-500 font-bold border-b border-white/5 pb-1 text-center">
                {["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {/* Event Milestone Gantt Bars */}
              <div className="space-y-2 pt-1">
                {events.map((evt) => {
                  const hour = parseInt(evt.time.split(":")[0] || "12", 10);
                  const leftPct = Math.max(2, Math.min(85, (hour / 24) * 100));
                  const color = getCategoryColor(evt.category);

                  return (
                    <div key={evt.id} className="relative h-11 bg-black/40 rounded-xl border border-white/5 flex items-center px-3 overflow-hidden group">
                      <div
                        className="absolute h-8 rounded-lg flex items-center px-3 border shadow-lg transition-all"
                        style={{
                          left: `${leftPct}%`,
                          backgroundColor: `${color}20`,
                          borderColor: `${color}60`,
                          color: color,
                        }}
                      >
                        <span className="text-[10px] font-black truncate max-w-[200px]">
                          [{evt.time}] {evt.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR GRID & EVENT TIMELINE */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Calendar Month Grid (7 cols) */}
        <div className="lg:col-span-7">
          <EventCalendar
            events={calendarItems}
            onAddEvent={(d) => {
              setNewDate(d);
              setShowAddModal(true);
            }}
            onSelectEvent={(e) => {
              setSelectedDate(e.date);
            }}
          />
        </div>

        {/* Selected Date Timeline & Event Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#00F0FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Missions for {selectedDate}
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF41] font-bold">
                {selectedDateEvents.length} SCHEDULED
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-[#4F536E] gap-2">
                <CheckCircle2 size={24} className="text-[#00FF41]/40" />
                <p>No operational events scheduled for this date.</p>
                <button
                  onClick={() => {
                    setNewDate(selectedDate);
                    setShowAddModal(true);
                  }}
                  className="mt-2 text-xs font-bold text-[#00FF41] hover:underline cursor-pointer"
                >
                  + Add Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((evt) => {
                  const color = getCategoryColor(evt.category);
                  return (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-xl bg-black/40 border flex flex-col gap-2 relative group hover:border-white/20 transition-all"
                      style={{ borderColor: `${color}30` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                            style={{
                              color: color,
                              background: `${color}15`,
                              borderColor: `${color}40`,
                            }}
                          >
                            {evt.category}
                          </span>
                          <span className="text-xs font-bold font-mono text-[#F1F3F9]">
                            {evt.time}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="text-[#4F536E] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                          title="Delete Event"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-[#F1F3F9]">{evt.title}</h4>
                      <p className="text-[10px] text-[#9499B3] leading-relaxed">{evt.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Automated Cron Daemon Timers */}
          <div className="cyber-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-[#BF40FF]" />
                <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
                  Recurring Cron Daemons
                </h3>
              </div>
              <span className="text-[9px] text-[#00FF41] font-bold">ALL ACTIVE</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { id: "cron-1", name: "Postgres Snapshot", cron: "0 4 * * *", next: "In 7h 24m" },
                { id: "cron-2", name: "Vector Index Rebuild", cron: "0 2 * * 0", next: "In 3d 5h" },
                { id: "cron-3", name: "SSL Cert Validation", cron: "0 0 1 * *", next: "In 5d 12h" },
                { id: "cron-4", name: "Node Telemetry Rollup", cron: "*/15 * * * *", next: "In 9m" },
              ].map((cron) => (
                <div key={cron.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[#F1F3F9] text-xs truncate">{cron.name}</span>
                    <span className="text-[9px] text-[#4F536E] font-mono">{cron.cron}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#00F0FF] font-bold">{cron.next}</span>
                    <button
                      onClick={() => handleTriggerCronJob(cron.id)}
                      disabled={runningJobId === cron.id}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(191,64,255,0.2)] cursor-pointer disabled:opacity-50"
                    >
                      {runningJobId === cron.id ? "RUNNING..." : "RUN NOW"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* NEW EVENT CREATION MODAL */}
      <Dialog open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
        <DialogContent className="sm:max-w-md bg-[#0B0C16] border-[#00FF41]/40 text-[#F1F3F9] font-mono p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          <DialogHeader className="pb-3 border-b border-white/10 text-left">
            <DialogTitle className="text-sm font-black text-[#F1F3F9] tracking-wider">
              SCHEDULE NEW MISSION EVENT
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddEvent} className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Event Title</label>
              <Input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Cluster Upgrade v2.7"
                className="bg-black/60 border-white/10 text-xs text-[#F1F3F9]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none text-xs"
                >
                  <option value="DEPLOYMENT">DEPLOYMENT</option>
                  <option value="CRON_BACKUP">CRON BACKUP</option>
                  <option value="SECURITY_AUDIT">SECURITY AUDIT</option>
                  <option value="SPRINT_MILESTONE">SPRINT MILESTONE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none text-xs"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Date</label>
                <Input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-black/60 border-white/10 text-[11px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Time</label>
                <Input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-black/60 border-white/10 text-[11px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#4F536E] uppercase font-bold">Recurrence</label>
                <select
                  value={newRecurrence}
                  onChange={(e) => setNewRecurrence(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-[#F1F3F9] outline-none text-[11px]"
                >
                  <option value="ONCE">Once</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#4F536E] uppercase font-bold">Description</label>
              <Textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional mission notes..."
                className="bg-black/60 border-white/10 text-xs text-[#F1F3F9] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-[#9499B3]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/30 font-bold"
              >
                Confirm Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
