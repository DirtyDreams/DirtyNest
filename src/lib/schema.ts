import { pgTable, serial, text, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: integer("completed").notNull().default(0),
  sort_order: integer("sort_order").notNull().default(0),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  due_date: timestamp("due_date", { withTimezone: true, mode: "string" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull().default(""),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const quickLinks = pgTable("quick_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  color: text("color").default("#00FF41"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  duration_minutes: integer("duration_minutes").notNull(),
  type: text("type").notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true, mode: "string" }),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  level: varchar("level", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  details: text("details"),
  latency_ms: integer("latency_ms").default(0),
  status_code: varchar("status_code", { length: 50 }).default("200"),
  ip_origin: varchar("ip_origin", { length: 100 }).default("127.0.0.1"),
  hash_sig: varchar("hash_sig", { length: 100 }),
});

export const hermesSessions = pgTable("hermes_sessions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  profile: varchar("profile", { length: 100 }).notNull().default("dirtydaily"),
  model: varchar("model", { length: 100 }).notNull().default("Nous-Hermes-3-Llama-3.1-8B"),
  cwd: text("cwd").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("IDLE"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const hermesMessages = pgTable("hermes_messages", {
  id: varchar("id", { length: 100 }).primaryKey(),
  session_id: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  reasoning_trace: text("reasoning_trace"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const hermesToolLogs = pgTable("hermes_tool_logs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  session_id: varchar("session_id", { length: 100 }).notNull(),
  tool_name: varchar("tool_name", { length: 100 }).notNull(),
  parameters_json: text("parameters_json").notNull(),
  result_json: text("result_json"),
  risk_level: varchar("risk_level", { length: 50 }).notNull().default("low"),
  permission_status: varchar("permission_status", { length: 50 }).notNull().default("AUTO_APPROVED"),
  execution_time_ms: integer("execution_time_ms").default(0),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
});

export const hermesMemories = pgTable("hermes_memories", {
  id: varchar("id", { length: 100 }).primaryKey(),
  category: varchar("category", { length: 50 }).notNull().default("fact"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags_json: text("tags_json"),
  recall_count: integer("recall_count").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

// ---------------------------------------------------------------------------
// Zbiornik Ops (docs/zbiornik-ops.md) — HITL automation state for zbiornik.com.
// All outbound actions flow: draft -> approved -> (publish gate) -> published.
// ---------------------------------------------------------------------------

export const zbTopics = pgTable("zb_topics", {
  id: serial("id").primaryKey(),
  portal_ref: varchar("portal_ref", { length: 300 }).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  author: varchar("author", { length: 120 }).notNull().default(""),
  preview: text("preview").notNull().default(""),
  raw_json: text("raw_json"),
  fetched_at: timestamp("fetched_at", { withTimezone: true, mode: "string" }),
});

export const zbQueue = pgTable("zb_queue", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull(), // topic | comment | priv
  target_ref: varchar("target_ref", { length: 300 }),
  content_hash: varchar("content_hash", { length: 64 }).notNull(),
  title: text("title"),
  body: text("body").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft|approved|published|rejected|failed
  portal_ref: varchar("portal_ref", { length: 300 }),
  error: text("error"),
  extra_json: text("extra_json"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  approved_at: timestamp("approved_at", { withTimezone: true, mode: "string" }),
  published_at: timestamp("published_at", { withTimezone: true, mode: "string" }),
});

export const zbActivityLog = pgTable("zb_activity_log", {
  id: serial("id").primaryKey(),
  op: varchar("op", { length: 40 }).notNull(),
  target_ref: varchar("target_ref", { length: 300 }),
  payload_json: text("payload_json"),
  ok: integer("ok").notNull().default(0),
  message: text("message"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const zbRules = pgTable("zb_rules", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: varchar("value", { length: 300 }).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});
