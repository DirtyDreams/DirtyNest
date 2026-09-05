import type { LogLevel, LogCategory } from "@/types/logs";

export interface LogPayload {
  level: LogLevel;
  category: LogCategory;
  action: string;
  actor?: string;
  details?: Record<string, unknown> | string;
  latency_ms?: number;
  status_code?: string;
}

const STORAGE_KEY = "dirtynest_local_logs";

export async function emitLog(payload: LogPayload): Promise<boolean> {
  try {
    if (typeof window !== "undefined") {
      const current = (() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          return raw ? (JSON.parse(raw) as unknown[]) : [];
        } catch {
          return [];
        }
      })();

      const next = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          level: payload.level,
          category: payload.category,
          action: payload.action,
          actor: payload.actor || "User-Interface",
          details: payload.details,
          latency_ms: payload.latency_ms || 0,
          status_code: payload.status_code || "200",
        },
        ...current,
      ].slice(0, 300);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("dirtynest-log-emitted", { detail: payload }));
    }
    return true;
  } catch {
    return false;
  }
}

export const logger = {
  info: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "INFO", category, action, details, actor }),
  success: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "SUCCESS", category, action, details, actor }),
  warn: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "WARN", category, action, details, actor }),
  error: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "ERROR", category, action, details, actor }),
  audit: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "AUDIT", category, action, details, actor }),
  debug: (category: LogCategory, action: string, details?: Record<string, unknown> | string, actor?: string) =>
    emitLog({ level: "DEBUG", category, action, details, actor }),
};
