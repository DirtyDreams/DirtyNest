"use client";

import { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cyberAudio } from "@/lib/cyberAudio";
import { cn } from "@/lib/utils";

type Mode = "work" | "shortBreak" | "longBreak";

const MODE_DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function FocusTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.work);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(2);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchTotalTime = () => {
    fetch("/api/focus/total")
      .then((res) => res.json())
      .then((data) => {
        if (data.total_minutes) {
          setTotalFocusMinutes(data.total_minutes);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTotalTime();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (soundEnabled) {
        cyberAudio.play("chime");
      }
      
      // Save session to DB
      fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: MODE_DURATIONS[mode] / 60,
          type: mode,
        }),
      }).then(() => {
        if (mode === "work") fetchTotalTime();
      }).catch(console.error);

      if (mode === "work") {
        setCompletedSessions((prev) => prev + 1);
        setMode("shortBreak");
        setTimeLeft(MODE_DURATIONS.shortBreak);
      } else {
        setMode("work");
        setTimeLeft(MODE_DURATIONS.work);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, soundEnabled]);

  const switchMode = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const total = MODE_DURATIONS[mode];
  const progress = ((total - timeLeft) / total) * 100;

  const modeColor =
    mode === "work"
      ? "#00FF41"
      : mode === "shortBreak"
      ? "#00F0FF"
      : "#BF40FF";

  return (
    <div className="cyber-card p-4.5 relative font-mono select-none">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <Timer size={15} className="icon" style={{ color: modeColor }} />
        <h3>Focus Neural Loop</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-6 w-6 rounded-lg text-[#9499B3] hover:text-white"
            title={soundEnabled ? "Audio alert on" : "Audio alert off"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </Button>

          {totalFocusMinutes > 0 && (
            <span className="text-[9px] font-mono font-bold text-[#9499B3] px-1.5 py-0.5">
              <NumberFlow value={Math.floor(totalFocusMinutes / 60)} />h <NumberFlow value={totalFocusMinutes % 60} />m logged
            </span>
          )}

          <Badge
            variant="outline"
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase border-transparent"
            style={{
              background: `${modeColor}15`,
              color: modeColor,
            }}
          >
            {mode === "work" ? "DEEP WORK" : "NEURAL REST"}
          </Badge>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex gap-1 mb-3 bg-white/5 rounded-xl p-0.5 border border-white/5 text-[9px] font-mono">
        {[
          { key: "work", label: "25M FOCUS" },
          { key: "shortBreak", label: "5M BREAK" },
          { key: "longBreak", label: "15M REST" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchMode(tab.key as Mode)}
            className={cn(
              "flex-1 py-1 rounded-lg transition-all text-center font-bold cursor-pointer",
              mode === tab.key
                ? "bg-[#00FF41]/20 text-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Digital Countdown & Arc Progress */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          className="text-4xl font-mono font-black tracking-tight flex items-center justify-center"
          style={{
            color: modeColor,
            textShadow: `0 0 20px ${modeColor}40`,
          }}
        >
          <NumberFlow value={minutes} format={{ minimumIntegerDigits: 2 }} />
          <span className="mx-0.5 animate-pulse">:</span>
          <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} />
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progress}%`,
              background: modeColor,
              boxShadow: `0 0 8px ${modeColor}`,
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-white/5">
        <Button
          onClick={() => {
            cyberAudio.play("click");
            setIsActive(!isActive);
          }}
          variant={isActive ? "destructive" : "default"}
          size="sm"
          className={cn(
            "flex items-center gap-1.5 px-4 h-8 text-xs font-mono font-bold uppercase transition-all cursor-pointer",
            isActive
              ? "bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 hover:bg-[#FF2A6D]/30"
              : "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 hover:bg-[#00FF41]/30"
          )}
        >
          {isActive ? <Pause size={13} /> : <Play size={13} />}
          <span>{isActive ? "HOLD" : "ENGAGE"}</span>
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          title="Reset timer"
          className="h-8 w-8 bg-white/5 border-white/10 text-[#9499B3] hover:text-[#F1F3F9]"
        >
          <RotateCcw size={13} />
        </Button>

        <div className="ml-auto text-[10px] font-mono text-[#9499B3] flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30">
            <NumberFlow value={completedSessions} /> CYCLES
          </Badge>
        </div>
      </div>
    </div>
  );
}
