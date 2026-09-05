"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  color: string;
}

const colorPresets = [
  { label: "Green", value: "#00FF41" },
  { label: "Purple", value: "#BF40FF" },
  { label: "Cyan", value: "#00F0FF" },
  { label: "Amber", value: "#FFB800" },
  { label: "Red", value: "#FF2A6D" },
];

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    color: "#00FF41",
  });
  const [mounted, setMounted] = useState(false);

  const fetchEvents = useCallback(() => {
    try {
      const saved = localStorage.getItem("dirtynest_calendar_events");
      setEvents(saved ? JSON.parse(saved) : []);
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    const event: CalendarEvent = {
      ...newEvent,
      id: Date.now(),
      description: null,
      time: newEvent.time || null,
    };
    const nextEvents = [...events, event];
    setEvents(nextEvents);
    localStorage.setItem("dirtynest_calendar_events", JSON.stringify(nextEvents));
    setNewEvent({ title: "", date: "", time: "", color: "#00FF41" });
    setShowAdd(false);
    fetchEvents();
  };

  const deleteEvent = (id: number) => {
    const nextEvents = events.filter((event) => event.id !== id);
    setEvents(nextEvents);
    localStorage.setItem("dirtynest_calendar_events", JSON.stringify(nextEvents));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = mounted ? new Date().toISOString().split("T")[0] : "";

  const eventDates = new Map<string, string[]>();
  events.forEach((e) => {
    const list = eventDates.get(e.date) || [];
    list.push(e.color);
    eventDates.set(e.date, list);
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="cyber-card p-5 relative" suppressHydrationWarning>
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <CalendarIcon size={15} className="icon" />
        <h3>Operational Schedule</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-200 cursor-pointer"
          style={{
            background: showAdd ? "rgba(255, 42, 109, 0.15)" : "rgba(0, 255, 65, 0.12)",
            color: showAdd ? "#FF2A6D" : "#00FF41",
            border: showAdd ? "1px solid rgba(255, 42, 109, 0.3)" : "1px solid rgba(0, 255, 65, 0.3)",
          }}
        >
          {showAdd ? <X size={13} /> : <Plus size={13} />}
          <span>{showAdd ? "CANCEL" : "NEW EVENT"}</span>
        </button>
      </div>

      {/* Add Event Drawer */}
      {showAdd && (
        <div
          className="mb-5 p-4 rounded-xl space-y-3 animate-fade-in"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(0, 255, 65, 0.2)",
          }}
        >
          <div className="text-xs font-mono text-[#00FF41] uppercase tracking-wider font-bold">
            Schedule New Operation
          </div>
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Operation / Event name..."
            className="w-full bg-[#07070B] outline-none text-xs px-3 py-2 rounded-lg text-[#F1F3F9] border border-white/10 focus:border-[#00FF41]"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="bg-[#07070B] outline-none text-xs px-3 py-2 rounded-lg text-[#F1F3F9] border border-white/10 focus:border-[#00FF41]"
              style={{ colorScheme: "dark" }}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="bg-[#07070B] outline-none text-xs px-3 py-2 rounded-lg text-[#F1F3F9] border border-white/10 focus:border-[#00FF41]"
              style={{ colorScheme: "dark" }}
            />

            {/* Color picker */}
            <div className="flex items-center gap-1.5 px-2 bg-[#07070B] rounded-lg border border-white/10">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, color: c.value })}
                  className="w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: c.value,
                    transform: newEvent.color === c.value ? "scale(1.25)" : "scale(0.9)",
                    boxShadow: newEvent.color === c.value ? `0 0 8px ${c.value}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={addEvent}
            className="w-full py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 65, 0.25) 0%, rgba(0, 204, 52, 0.1) 100%)",
              color: "#00FF41",
              border: "1px solid rgba(0, 255, 65, 0.4)",
            }}
          >
            CONFIRM & DEPLOY TO TIMELINE
          </button>
        </div>
      )}

      {/* Main Calendar Layout: Mini Grid on Left, Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Grid View */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#F1F3F9] tracking-wider">
                {monthNames[month]} {year}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded hover:bg-white/10 text-[#9499B3] hover:text-[#00FF41]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-[10px] py-1.5 font-mono text-[#4F536E] font-bold"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = mounted && dateStr === todayStr;
              const cellColors = eventDates.get(dateStr) || [];

              return (
                <div
                  key={day}
                  className="relative h-8 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-150 group"
                  style={{
                    background: isToday
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(255, 255, 255, 0.02)",
                    border: isToday
                      ? "1px solid rgba(0, 255, 65, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: isToday ? "#00FF41" : "#F1F3F9",
                      fontWeight: isToday ? 800 : 500,
                    }}
                  >
                    {day}
                  </span>
                  {cellColors.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {cellColors.slice(0, 3).map((col, ci) => (
                        <div
                          key={ci}
                          className="w-1 h-1 rounded-full"
                          style={{ background: col, boxShadow: `0 0 4px ${col}` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming List */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#4F536E] mb-2 px-1">
            Active Timeline
          </div>
          <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {events.length === 0 && (
              <p className="text-xs font-mono text-center py-6 text-[#4F536E]">
                No operations scheduled
              </p>
            )}
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 group"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <div
                  className="w-1.5 h-7 rounded-full shrink-0"
                  style={{
                    background: event.color,
                    boxShadow: `0 0 8px ${event.color}80`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F1F3F9] truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#9499B3] mt-0.5">
                    <span>{event.date}</span>
                    {event.time && (
                      <>
                        <span>•</span>
                        <span className="text-[#00F0FF]">{event.time}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#4F536E] hover:text-[#FF2A6D]"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
