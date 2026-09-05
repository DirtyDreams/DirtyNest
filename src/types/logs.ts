export type LogLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR" | "AUDIT" | "DEBUG";
export type LogCategory = "AGENT" | "DOCKER" | "TOOL" | "API" | "DATABASE" | "AUTH" | "SYSTEM" | "UI";

export interface SystemLog {
  id: number;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  actor: string;
  details?: string;
  latency_ms: number;
  status_code?: string;
  ip_origin?: string;
  hash_sig?: string | null;
}
