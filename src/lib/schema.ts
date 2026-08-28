import { pgTable, serial, text, integer, varchar } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: integer("completed").notNull().default(0),
  sort_order: integer("sort_order").notNull().default(0),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  due_date: varchar("due_date", { length: 100 }),
});

export const hermesSessions = pgTable("hermes_sessions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  profile: varchar("profile", { length: 100 }).notNull().default("dirtydaily"),
  model: varchar("model", { length: 100 }).notNull().default("Nous-Hermes-3-Llama-3.1-8B"),
  cwd: text("cwd").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("IDLE"),
  created_at: varchar("created_at", { length: 100 }).notNull(),
  updated_at: varchar("updated_at", { length: 100 }).notNull(),
});

export const hermesMessages = pgTable("hermes_messages", {
  id: varchar("id", { length: 100 }).primaryKey(),
  session_id: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  reasoning_trace: text("reasoning_trace"),
  created_at: varchar("created_at", { length: 100 }).notNull(),
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
  timestamp: varchar("timestamp", { length: 100 }).notNull(),
});

export const hermesMemories = pgTable("hermes_memories", {
  id: varchar("id", { length: 100 }).primaryKey(),
  category: varchar("category", { length: 50 }).notNull().default("fact"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags_json: text("tags_json"),
  recall_count: integer("recall_count").notNull().default(0),
  created_at: varchar("created_at", { length: 100 }).notNull(),
});
