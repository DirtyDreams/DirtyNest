import initSqlJs, { type Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

function getDbPath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "dirtynest.db");
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();
  const dbPath = getDbPath();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      priority TEXT DEFAULT 'normal',
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quick_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      color TEXT DEFAULT '#00FF41',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      details TEXT,
      latency_ms INTEGER DEFAULT 0,
      status_code TEXT DEFAULT '200',
      ip_origin TEXT DEFAULT '127.0.0.1',
      hash_sig TEXT
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default note if empty
  const result = db.exec("SELECT COUNT(*) as count FROM notes");
  const count = result.length > 0 ? result[0].values[0][0] as number : 0;
  if (count === 0) {
    db.run(
      "INSERT INTO notes (content, updated_at) VALUES (?, ?)",
      ["# Welcome to DirtyNest 🪺\n\nStart typing your notes here...", new Date().toISOString()]
    );
  }

  // Seed some quick links if empty
  const linksResult = db.exec("SELECT COUNT(*) as count FROM quick_links");
  const linksCount = linksResult.length > 0 ? linksResult[0].values[0][0] as number : 0;
  if (linksCount === 0) {
    const links = [
      ["GitHub", "https://github.com", "Github", 0],
      ["Stack Overflow", "https://stackoverflow.com", "Code", 1],
      ["Vercel", "https://vercel.com", "Triangle", 2],
      ["ChatGPT", "https://chat.openai.com", "Bot", 3],
      ["Hacker News", "https://news.ycombinator.com", "Newspaper", 4],
    ];
    for (const [name, url, icon, order] of links) {
      db.run(
        "INSERT INTO quick_links (name, url, icon, sort_order) VALUES (?, ?, ?, ?)",
        [name, url, icon, order]
      );
    }
  }

  // Seed calendar events if empty
  const eventsResult = db.exec("SELECT COUNT(*) as count FROM calendar_events");
  const eventsCount = eventsResult.length > 0 ? eventsResult[0].values[0][0] as number : 0;
  if (eventsCount === 0) {
    const today = new Date();
    const events = [
      ["Sprint Planning", null, offsetDate(today, 1), "09:00", "#00FF41"],
      ["Code Review Session", "Review PRs from the team", offsetDate(today, 2), "14:00", "#BF40FF"],
      ["Deploy v2.0", "Production deployment", offsetDate(today, 3), "16:00", "#FF3366"],
      ["Team Standup", null, offsetDate(today, 0), "10:00", "#00E5FF"],
      ["1:1 with Lead", "Weekly sync", offsetDate(today, 5), "11:00", "#FFB800"],
    ];
    for (const [title, desc, date, time, color] of events) {
      db.run(
        "INSERT INTO calendar_events (title, description, date, time, color) VALUES (?, ?, ?, ?, ?)",
        [title, desc, date, time, color]
      );
    }
  }

  // Seed some todos if empty
  const todosResult = db.exec("SELECT COUNT(*) as count FROM todos");
  const todosCount = todosResult.length > 0 ? todosResult[0].values[0][0] as number : 0;
  if (todosCount === 0) {
    const todosData = [
      ["Set up CI/CD pipeline", 0, 0],
      ["Review pull requests", 0, 1],
      ["Update API documentation", 0, 2],
      ["Fix auth token refresh bug", 1, 3],
      ["Deploy staging environment", 0, 4],
    ];
    for (const [text, completed, order] of todosData) {
      db.run(
        "INSERT INTO todos (text, completed, sort_order) VALUES (?, ?, ?)",
        [text, completed, order]
      );
    }
  }

  // Seed system logs if empty
  const logsResult = db.exec("SELECT COUNT(*) as count FROM system_logs");
  const logsCount = logsResult.length > 0 ? logsResult[0].values[0][0] as number : 0;
  if (logsCount === 0) {
    const now = Date.now();
    const seedLogs = [
      {
        offsetMinutes: 1,
        level: "INFO",
        category: "SYSTEM",
        action: "NODE_BOOTSTRAP_COMPLETE",
        actor: "Kernel-Core",
        details: JSON.stringify({ version: "v2.5.0", node: "dirtynest-core-01", env: "production", memory_limit_mb: 8192 }),
        latency_ms: 12,
        status_code: "200",
      },
      {
        offsetMinutes: 3,
        level: "SUCCESS",
        category: "DOCKER",
        action: "CONTAINER_HEALTH_CHECK_PASS",
        actor: "Docker-Daemon",
        details: JSON.stringify({ container_id: "c-open-webui-01", status: "healthy", ports: ["3000:3000"], uptime: "4h 12m" }),
        latency_ms: 24,
        status_code: "200",
      },
      {
        offsetMinutes: 7,
        level: "AUDIT",
        category: "AUTH",
        action: "SECURITY_CLEARANCE_ISSUED",
        actor: "RBAC-Guard",
        details: JSON.stringify({ subject: "admin-root", token_type: "Bearer-ECDSA", scope: ["read", "write", "dispatch", "telemetry"] }),
        latency_ms: 8,
        status_code: "201",
      },
      {
        offsetMinutes: 12,
        level: "INFO",
        category: "AGENT",
        action: "AGENT_SWARM_DISPATCH",
        actor: "Hermes-Agent-01",
        details: JSON.stringify({ task: "Codebase semantic index update", target_files: 48, harness: "hermes-fast" }),
        latency_ms: 840,
        status_code: "200",
      },
      {
        offsetMinutes: 15,
        level: "SUCCESS",
        category: "TOOL",
        action: "TOOL_EXECUTE_SQL_QUERY",
        actor: "Pi-Agent-02",
        details: JSON.stringify({ tool: "sql_executor", query_plan: "SELECT COUNT(*) FROM notes", execution_time_ms: 4.2 }),
        latency_ms: 4,
        status_code: "200",
      },
      {
        offsetMinutes: 22,
        level: "WARN",
        category: "API",
        action: "RATE_LIMIT_THRESHOLD_WARN",
        actor: "API-Gateway",
        details: JSON.stringify({ client_ip: "192.168.1.104", current_rps: 42, threshold_rps: 50, window: "60s" }),
        latency_ms: 1,
        status_code: "429-WARN",
      },
      {
        offsetMinutes: 35,
        level: "INFO",
        category: "DATABASE",
        action: "SQLITE_WAL_CHECKPOINT",
        actor: "Db-Engine",
        details: JSON.stringify({ wal_size_kb: 512, mode: "PASSIVE", pages_written: 128 }),
        latency_ms: 18,
        status_code: "200",
      },
      {
        offsetMinutes: 48,
        level: "ERROR",
        category: "API",
        action: "EXTERNAL_WEBHOOK_TIMEOUT",
        actor: "Webhook-Dispatcher",
        details: JSON.stringify({ endpoint: "https://hooks.slack.com/services/alerts", error: "ETIMEDOUT (5000ms exceeded)", retry_count: 3 }),
        latency_ms: 5002,
        status_code: "504",
      },
      {
        offsetMinutes: 65,
        level: "SUCCESS",
        category: "AGENT",
        action: "TOOL_CLEARANCE_APPROVED",
        actor: "ControlRoom-Operator",
        details: JSON.stringify({ harness: "Hermes", tool_name: "git_push", authorized_by: "human_supervisor", auto_rollback: true }),
        latency_ms: 45,
        status_code: "200",
      },
      {
        offsetMinutes: 90,
        level: "DEBUG",
        category: "SYSTEM",
        action: "MEMORY_TELEMETRY_SAMPLE",
        actor: "Prometheus-Agent",
        details: JSON.stringify({ heap_used_mb: 284, heap_total_mb: 512, external_mb: 48, rss_mb: 412 }),
        latency_ms: 2,
        status_code: "200",
      },
      {
        offsetMinutes: 120,
        level: "INFO",
        category: "DOCKER",
        action: "COMPOSE_STACK_SYNC",
        actor: "Docker-Hub",
        details: JSON.stringify({ stack: "dirtynest-stack", active_services: 4, stopped_services: 0, network: "bridge_overlay" }),
        latency_ms: 110,
        status_code: "200",
      },
      {
        offsetMinutes: 180,
        level: "SUCCESS",
        category: "DATABASE",
        action: "DB_PERSISTENCE_EXPORT_OK",
        actor: "Storage-Engine",
        details: JSON.stringify({ target: "dirtynest.db", bytes_written: 49152, checksum: "a9f82d1c" }),
        latency_ms: 15,
        status_code: "200",
      },
    ];

    for (const log of seedLogs) {
      const ts = new Date(now - log.offsetMinutes * 60 * 1000).toISOString();
      const hash = "0x" + crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
      db.run(
        "INSERT INTO system_logs (timestamp, level, category, action, actor, details, latency_ms, status_code, ip_origin, hash_sig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [ts, log.level, log.category, log.action, log.actor, log.details, log.latency_ms, log.status_code, "127.0.0.1", hash]
      );
    }
  }

  persistDb();
  return db;
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function persistDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

// Type definitions
export interface Todo {
  id: number;
  text: string;
  completed: number;
  sort_order: number;
  created_at: string;
}

export interface Note {
  id: number;
  content: string;
  updated_at: string;
}

export interface QuickLink {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  color: string;
  created_at: string;
}

export type LogLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR" | "AUDIT" | "DEBUG";
export type LogCategory = "AGENT" | "DOCKER" | "TOOL" | "API" | "DATABASE" | "AUTH" | "SYSTEM" | "UI";

export interface SystemLog {
  id: number;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  actor: string;
  details: string | null;
  latency_ms: number;
  status_code: string;
  ip_origin: string;
  hash_sig: string;
}

// Helper to convert sql.js results to typed arrays
export function queryAll<T>(database: Database, sql: string, params: unknown[] = []): T[] {
  const stmt = database.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export async function insertLog(
  level: LogLevel,
  category: LogCategory,
  action: string,
  actor: string,
  details?: Record<string, unknown> | string,
  latency_ms = 0,
  status_code = "200",
  ip_origin = "127.0.0.1"
): Promise<number> {
  const database = await getDb();
  const timestamp = new Date().toISOString();
  const detailsStr = typeof details === "object" ? JSON.stringify(details) : (details || "");
  const hash_sig = "0x" + crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

  database.run(
    "INSERT INTO system_logs (timestamp, level, category, action, actor, details, latency_ms, status_code, ip_origin, hash_sig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [timestamp, level, category, action, actor, detailsStr, latency_ms, status_code, ip_origin, hash_sig]
  );
  persistDb();

  const idRes = database.exec("SELECT last_insert_rowid() as id");
  return idRes.length > 0 ? (idRes[0].values[0][0] as number) : 0;
}
