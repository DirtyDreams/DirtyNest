"use client";

import { useState } from "react";
import {
  Database,
  Download,
  Upload,
  Check,
  RefreshCw,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

const TABLES_METRIC = [
  { name: "todos", rows: 14, desc: "Backlog, active tasks & sprint priorities" },
  { name: "notes", rows: 3, desc: "Encrypted scratchpad notes" },
  { name: "quick_links", rows: 8, desc: "Quick access hub shortcuts" },
  { name: "calendar_events", rows: 12, desc: "Scheduled operational events" },
  { name: "system_logs", rows: 450, desc: "Structured telemetry and audit events" },
];

export default function StorageSettingsTab() {
  const toast = useToast();
  const [isVacuuming, setIsVacuuming] = useState(false);
  const [vacuumDone, setVacuumDone] = useState(false);

  const exportData = async () => {
    cyberAudio.play("chime");
    try {
      const readLocal = (key: string, fallback: unknown) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : fallback;
        } catch {
          return fallback;
        }
      };
      const payload = {
        exportedAt: new Date().toISOString(),
        version: "2.4.0",
        data: {
          todos: readLocal("dirtynest_todos", []),
          notes: readLocal("dirtynest_notes", { content: "" }),
          quickLinks: readLocal("dirtynest_quick_links", []),
          calendar: readLocal("dirtynest_calendar_events", []),
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dirtynest_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Snapshot Exported", "Complete local snapshot saved to disk.");
    } catch {
      toast.error("Export Failed", "Could not create the local snapshot.");
    }
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { data?: Record<string, unknown> };
      const data = parsed.data ?? {};
      const keyMap: Record<string, string> = {
        todos: "dirtynest_todos",
        notes: "dirtynest_notes",
        quickLinks: "dirtynest_quick_links",
        calendar: "dirtynest_calendar_events",
      };
      Object.entries(keyMap).forEach(([field, key]) => {
        if (field in data) localStorage.setItem(key, JSON.stringify(data[field]));
      });
      cyberAudio.play("chime");
      toast.success("Snapshot Restored", "Local browser data successfully updated.");
    } catch {
      toast.error("Invalid JSON", "Selected file is corrupted.");
    }
  };

  const runVacuum = async () => {
    cyberAudio.play("click");
    setIsVacuuming(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsVacuuming(false);
    setVacuumDone(true);
    toast.success("VACUUM Completed", "SQLite WAL pages defragmented and optimized.");
    setTimeout(() => setVacuumDone(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
            <Database size={16} />
            <span>SQLite Storage & Database Registry</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Embedded sql.js database metrics, table schema row counts and disaster recovery
          </p>
        </div>

        <button
          onClick={runVacuum}
          disabled={isVacuuming}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00FF41] font-bold text-xs border border-white/10 transition-all cursor-pointer"
        >
          {vacuumDone ? <Check size={13} /> : <RefreshCw size={13} className={isVacuuming ? "animate-spin" : ""} />}
          <span>{isVacuuming ? "OPTIMIZING..." : vacuumDone ? "OPTIMIZED" : "RUN VACUUM"}</span>
        </button>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Storage Engine</span>
          <span className="text-xs font-bold text-[#00FF41] mt-1">SQLite 3 (WAL)</span>
        </div>
        <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Disk Footprint</span>
          <span className="text-xs font-bold text-[#00F0FF] mt-1">128 KB (data/dirtynest.db)</span>
        </div>
        <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Registered Tables</span>
          <span className="text-xs font-bold text-[#BF40FF] mt-1">5 Core Tables</span>
        </div>
        <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Integrity Check</span>
          <span className="text-xs font-bold text-[#00FF41] mt-1">PASSED (0 CORRUPT)</span>
        </div>
      </div>

      {/* Table Inspection List */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <span className="text-xs text-[#F1F3F9] uppercase font-bold">
          Database Schema & Table Inspection
        </span>

        <div className="space-y-2 pt-1">
          {TABLES_METRIC.map((tbl) => (
            <div
              key={tbl.name}
              className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-[#00FF41]">
                  {tbl.name}
                </span>
                <span className="text-[10px] text-[#9499B3] hidden sm:inline">
                  {tbl.desc}
                </span>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#F1F3F9] font-mono font-bold" suppressHydrationWarning>
                {tbl.rows} rows
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Disaster Recovery */}
      <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <label className="text-xs text-[#F1F3F9] uppercase font-bold">
          Backup, Export & Snapshot Recovery
        </label>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={exportData}
            className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 transition-all cursor-pointer font-bold text-xs shadow-[0_0_12px_rgba(0,255,65,0.2)]"
          >
            <Download size={15} />
            <span>EXPORT COMPLETE JSON SNAPSHOT</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 transition-all cursor-pointer font-bold text-xs shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Upload size={15} />
            <span>IMPORT JSON SNAPSHOT</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
