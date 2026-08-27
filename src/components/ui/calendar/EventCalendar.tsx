"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CalendarItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category?: "DEPLOY" | "CRON" | "SECURITY" | "MAINTENANCE" | "TASK";
  priority?: "low" | "medium" | "high" | "critical";
  description?: string;
}

export interface EventCalendarProps {
  events: CalendarItem[];
  onAddEvent?: (date: string) => void;
  onSelectEvent?: (event: CalendarItem) => void;
  className?: string;
}

const CATEGORY_COLORS = {
  DEPLOY: { text: "#00FF41", bg: "rgba(0, 255, 65, 0.12)", border: "rgba(0, 255, 65, 0.3)" },
  CRON: { text: "#00F0FF", bg: "rgba(0, 240, 255, 0.12)", border: "rgba(0, 240, 255, 0.3)" },
  SECURITY: { text: "#FF2A6D", bg: "rgba(255, 42, 109, 0.12)", border: "rgba(255, 42, 109, 0.3)" },
  MAINTENANCE: { text: "#FFB800", bg: "rgba(255, 184, 0, 0.12)", border: "rgba(255, 184, 0, 0.3)" },
  TASK: { text: "#BF40FF", bg: "rgba(191, 64, 255, 0.12)", border: "rgba(191, 64, 255, 0.3)" },
};

export function EventCalendar({
  events,
  onAddEvent,
  onSelectEvent,
  className,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#080912] flex flex-col overflow-hidden font-mono text-xs shadow-xl select-none",
        className
      )}
    >
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 bg-[#07070B] border-white/10 text-[#F1F3F9] hover:text-[#00FF41]"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 bg-[#07070B] border-white/10 text-[#F1F3F9] hover:text-[#00FF41]"
            >
              <ChevronRight size={14} />
            </Button>
          </div>

          <h3 className="text-sm sm:text-base font-black text-[#F1F3F9] tracking-wider uppercase">
            {monthNames[month]} {year}
          </h3>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 px-2.5 text-[10px] bg-black/40 border-white/10 text-[#9499B3] hover:text-[#00FF41]"
          >
            TODAY
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg bg-black/50 border border-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                viewMode === "month"
                  ? "bg-[#00FF41]/20 text-[#00FF41]"
                  : "text-[#4F536E] hover:text-[#9499B3]"
              )}
            >
              MONTH
            </button>
            <button
              type="button"
              onClick={() => setViewMode("agenda")}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                viewMode === "agenda"
                  ? "bg-[#00FF41]/20 text-[#00FF41]"
                  : "text-[#4F536E] hover:text-[#9499B3]"
              )}
            >
              AGENDA
            </button>
          </div>

          {onAddEvent && (
            <Button
              onClick={() => onAddEvent(todayStr)}
              size="sm"
              className="h-8 gap-1.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20"
            >
              <Plus size={13} />
              <span>ADD EVENT</span>
            </Button>
          )}
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === "month" && (
        <div className="flex flex-col">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-black/40 text-center text-[10px] font-bold text-[#4F536E] py-2">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/5 min-h-[420px]">
            {/* Leading empty days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 bg-black/20 min-h-[70px]" />
            ))}

            {/* Actual month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const dayEvents = eventsByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  onClick={() => onAddEvent && onAddEvent(dateStr)}
                  className={cn(
                    "p-2 flex flex-col justify-between min-h-[75px] sm:min-h-[85px] hover:bg-white/[0.02] transition-colors cursor-pointer relative",
                    isToday && "bg-[#00FF41]/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold font-mono",
                        isToday
                          ? "w-6 h-6 rounded-full bg-[#00FF41] text-[#07070B] flex items-center justify-center font-black"
                          : "text-[#9499B3]"
                      )}
                    >
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-[#4F536E] font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const color = ev.category
                        ? CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.TASK
                        : CATEGORY_COLORS.TASK;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent && onSelectEvent(ev);
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold truncate transition-transform hover:scale-102"
                          style={{
                            backgroundColor: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                          }}
                          title={`${ev.time ? `${ev.time} - ` : ""}${ev.title}`}
                        >
                          {ev.time && <span className="mr-1 opacity-75">{ev.time}</span>}
                          <span>{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-[#4F536E] block text-center">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
          {events.length > 0 ? (
            events.map((ev) => {
              const color = ev.category
                ? CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.TASK
                : CATEGORY_COLORS.TASK;

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent && onSelectEvent(ev)}
                  className="p-3 rounded-xl border border-white/5 bg-black/40 hover:border-white/15 transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: color.text }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F1F3F9] text-xs">{ev.title}</span>
                        {ev.category && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0"
                            style={{ color: color.text, borderColor: color.border }}
                          >
                            {ev.category}
                          </Badge>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-[10px] text-[#9499B3] mt-0.5">{ev.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[10px] text-[#4F536E]">
                    <div className="text-[#F1F3F9] font-bold">{ev.date}</div>
                    {ev.time && <div>{ev.time}</div>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#4F536E]">No events scheduled</div>
          )}
        </div>
      )}
    </div>
  );
}
