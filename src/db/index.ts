import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

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
    // Seed operator accounts (F2) — exactly 2, passwords from env with dev defaults.
    const usersCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
    if (usersCount[0]?.count === 0) {
      const seedUsers = [
        {
          username: process.env.ADMIN_USERNAME || "admin",
          password: process.env.ADMIN_PASSWORD || "admin123",
          role: "admin",
        },
        {
          username: process.env.OPERATOR_USERNAME || "operator",
          password: process.env.OPERATOR_PASSWORD || "operator123",
          role: "operator",
        },
      ];
      for (const u of seedUsers) {
        await db.insert(schema.users).values({
          username: u.username,
          password_hash: bcrypt.hashSync(u.password, 10),
          role: u.role,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Seed agent registry (F3) — 6 agents, only if empty.
    const agentsCount = await db.select({ count: sql<number>`count(*)::int` }).from(schema.agentConfigs);
    if (agentsCount[0]?.count === 0) {
      const seedAgents = [
        {
          agent_type: "hermes",
          name: "Hermes",
          description: "Master agent — routing, delegation, reasoning, fallback for unmatched prompts.",
          system_prompt:
            "You are Hermes, the DirtyNest master agent. Oversee routing, delegate to specialist agents, and reason through complex directives before acting.",
          keywords: JSON.stringify(["hermes", "master", "nadzorca", "deleguj", "koordynuj"]),
          tool_whitelist: JSON.stringify(["dirtynest_system_status", "dirtynest_delegate", "dirtynest_web_search"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
        {
          agent_type: "research",
          name: "Research",
          description: "Deep research, citations, fact-checking, source synthesis.",
          system_prompt:
            "You are the Research agent. Perform deep research, gather sources, fact-check claims, and synthesize answers with citations.",
          keywords: JSON.stringify(["research", "zbadaj", "poszukaj", "wyszukaj", "analiza", "źródła", "citations", "fact-check", "deep dive", "raport", "sources"]),
          tool_whitelist: JSON.stringify(["dirtynest_web_search", "dirtynest_semantic_search"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
        {
          agent_type: "code",
          name: "Code",
          description: "Software engineering — write, review, debug, refactor code in a sandbox.",
          system_prompt:
            "You are the Code agent. Write, review, debug, and refactor code. Prefer sandboxed execution and explain your reasoning.",
          keywords: JSON.stringify(["code", "kod", "program", "bug", "funkcja", "typescript", "python", "refactor", "implement", "napisz kod", "debug", "function"]),
          tool_whitelist: JSON.stringify(["dirtynest_semantic_search", "dirtynest_web_search"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
        {
          agent_type: "security",
          name: "Security",
          description: "CVE, threat intel, log audit, vulnerability analysis.",
          system_prompt:
            "You are the Security agent. Analyze CVEs, audit logs, assess vulnerabilities, and provide threat intelligence.",
          keywords: JSON.stringify(["security", "bezpieczeństwo", "cve", "vulnerability", "podatność", "threat", "audyt", "exploit", "firewall", "atak", "intel"]),
          tool_whitelist: JSON.stringify(["dirtynest_cve_query", "dirtynest_cve_scan", "dirtynest_system_status"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
        {
          agent_type: "devops",
          name: "DevOps",
          description: "Containers, Compose, infrastructure, deployment.",
          system_prompt:
            "You are the DevOps agent. Manage containers, Compose stacks, infrastructure, and deployments.",
          keywords: JSON.stringify(["docker", "container", "kontener", "deploy", "infrastruktura", "compose", "kubernetes", "server", "ci/cd", "wdróż", "stack"]),
          tool_whitelist: JSON.stringify(["dirtynest_docker_list", "dirtynest_docker_logs", "dirtynest_system_status"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
        {
          agent_type: "social",
          name: "Social",
          description: "Copywriting, scheduling, social media analytics.",
          system_prompt:
            "You are the Social agent. Draft copy, schedule posts, and analyze social media performance across platforms.",
          keywords: JSON.stringify(["social", "post", "twitter", "instagram", "facebook", "tiktok", "reddit", "publikacja", "media społecznościowe", "hashtag", "copy"]),
          tool_whitelist: JSON.stringify(["dirtynest_social_metrics", "dirtynest_social_schedule"]),
          llm_provider: "ollama",
          llm_model: "llama3",
        },
      ];
      for (const a of seedAgents) {
        await db.insert(schema.agentConfigs).values({
          ...a,
          enabled: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
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

