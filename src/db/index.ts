import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — configure .env.local before starting the app");
}

// Global Postgres connection client pool
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Table initialization flag
let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  try {
    // Apply schema migrations (drizzle-kit generate → drizzle/*.sql)
    await migrate(db, { migrationsFolder: "./drizzle" });

    // Seed default note if empty
    const notesCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.notes);
    if (notesCount[0]?.count === 0) {
      await db.insert(schema.notes).values({
        content: "# Welcome to DirtyNest 🪺\n\nStart typing your notes here...",
        updated_at: new Date().toISOString(),
      });
    }

    // Seed quick links if empty
    const linksCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.quickLinks);
    if (linksCount[0]?.count === 0) {
      const defaultLinks = [
        { name: "GitHub", url: "https://github.com", icon: "Github", sort_order: 0 },
        { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "Code", sort_order: 1 },
        { name: "Vercel", url: "https://vercel.com", icon: "Triangle", sort_order: 2 },
        { name: "ChatGPT", url: "https://chat.openai.com", icon: "Bot", sort_order: 3 },
        { name: "Hacker News", url: "https://news.ycombinator.com", icon: "Newspaper", sort_order: 4 },
      ];
      for (const link of defaultLinks) {
        await db.insert(schema.quickLinks).values({
          ...link,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Seed calendar events if empty
    const eventsCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.calendarEvents);
    if (eventsCount[0]?.count === 0) {
      const today = new Date();
      const defaultEvents = [
        { title: "Sprint Planning", description: null, date: offsetDate(today, 1), time: "09:00", color: "#00FF41" },
        { title: "Code Review Session", description: "Review PRs from the team", date: offsetDate(today, 2), time: "14:00", color: "#BF40FF" },
        { title: "Deploy v2.0", description: "Production deployment", date: offsetDate(today, 3), time: "16:00", color: "#FF3366" },
        { title: "Team Standup", description: null, date: offsetDate(today, 0), time: "10:00", color: "#00E5FF" },
        { title: "1:1 with Lead", description: "Weekly sync", date: offsetDate(today, 5), time: "11:00", color: "#FFB800" },
      ];
      for (const ev of defaultEvents) {
        await db.insert(schema.calendarEvents).values({
          ...ev,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Seed todos if empty
    const todosCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.todos);
    if (todosCount[0]?.count === 0) {
      const defaultTodos = [
        { text: "Set up CI/CD pipeline", completed: 0, sort_order: 0, priority: "high" },
        { text: "Review pull requests", completed: 0, sort_order: 1, priority: "normal" },
        { text: "Update API documentation", completed: 0, sort_order: 2, priority: "normal" },
        { text: "Fix auth token refresh bug", completed: 1, sort_order: 3, priority: "critical" },
        { text: "Deploy staging environment", completed: 0, sort_order: 4, priority: "normal" },
      ];
      for (const t of defaultTodos) {
        await db.insert(schema.todos).values({
          ...t,
          created_at: new Date().toISOString(),
        });
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error("Postgres initDb error:", error);
  }
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Backward compatibility helper
export async function getDb() {
  await initDb();
  return db;
}

export function persistDb() {
  // No-op for PostgreSQL as all transactions persist automatically
}

// Type definitions
export interface Todo {
  id: number;
  text: string;
  completed: number;
  sort_order: number;
  priority?: string;
  due_date?: string | null;
  created_at?: string;
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
  color: string | null;
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
  await initDb();
  const timestamp = new Date().toISOString();
  const detailsStr = typeof details === "object" ? JSON.stringify(details) : details || "";
  const hash_sig = "0x" + crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

  try {
    const res = await db
      .insert(schema.systemLogs)
      .values({
        timestamp,
        level,
        category,
        action,
        actor,
        details: detailsStr,
        latency_ms,
        status_code,
        ip_origin,
        hash_sig,
      })
      .returning({ id: schema.systemLogs.id });

    return res[0]?.id || 0;
  } catch (err) {
    console.error("Error inserting system log to Postgres:", err);
    return 0;
  }
}

