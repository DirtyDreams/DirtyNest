import { LogLevel, LogCategory } from "@/db";

export interface LogPayload {
  level: LogLevel;
  category: LogCategory;
  action: string;
  actor?: string;
  details?: Record<string, unknown> | string;
  latency_ms?: number;
  status_code?: string;
}

export async function emitLog(payload: LogPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: payload.level,
        category: payload.category,
        action: payload.action,
        actor: payload.actor || "User-Interface",
        details: payload.details,
        latency_ms: payload.latency_ms || 0,
        status_code: payload.status_code || "200",
      }),
    });

    if (res.ok) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dirtynest-log-emitted", { detail: payload }));
      }
      return true;
    }
    return false;
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
