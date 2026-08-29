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
// ---------------------------------------------------------------------------
// Auth (F2) — operator accounts. api_keys holds AES-GCM-encrypted JSON.
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("operator"),
  api_keys: text("api_keys"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});
// ---------------------------------------------------------------------------
// Hermes Agentic Engine (F3) — chat sessions, messages, agent registry.
// ---------------------------------------------------------------------------

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  model: varchar("model", { length: 100 }),
  mode: varchar("mode", { length: 50 }).notNull().default("standard"),
  orchestrator_decision: text("orchestrator_decision"),
  harness_session_id: varchar("harness_session_id", { length: 100 }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  sender: varchar("sender", { length: 20 }).notNull(), // user | ai | system | tool
  text: text("text").notNull(),
  tokens: integer("tokens").default(0),
  thinking_time_ms: integer("thinking_time_ms").default(0),
  thinking_trace: text("thinking_trace"),
  citations: text("citations"),
  tool_calls: text("tool_calls"),
  agent_used: varchar("agent_used", { length: 50 }),
  execution_time_ms: integer("execution_time_ms").default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const agentConfigs = pgTable("agent_configs", {
  id: serial("id").primaryKey(),
  agent_type: varchar("agent_type", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull().default(""),
  system_prompt: text("system_prompt").notNull().default(""),
  keywords: text("keywords").notNull().default("[]"),
  tool_whitelist: text("tool_whitelist").notNull().default("[]"),
  llm_provider: varchar("llm_provider", { length: 50 }).notNull().default("ollama"),
  llm_model: varchar("llm_model", { length: 100 }).notNull().default("llama3"),
  enabled: integer("enabled").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});
// ---------------------------------------------------------------------------
// Knowledge Vault (F4) — document metadata in PG, embeddings in Qdrant.
// ---------------------------------------------------------------------------

export const knowledgeDocs = pgTable("knowledge_docs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  tags: text("tags").notNull().default("[]"),
  metadata: text("metadata"),
  qdrant_point_id: varchar("qdrant_point_id", { length: 100 }),
  source: varchar("source", { length: 50 }).notNull().default("manual"),
  obsidian_path: text("obsidian_path"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const knowledgeGraphEdges = pgTable("knowledge_graph_edges", {
  id: serial("id").primaryKey(),
  source_doc_id: integer("source_doc_id").notNull().references(() => knowledgeDocs.id, { onDelete: "cascade" }),
  target_doc_id: integer("target_doc_id").notNull().references(() => knowledgeDocs.id, { onDelete: "cascade" }),
  relation: varchar("relation", { length: 50 }).notNull().default("wiki_link"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});
// ---------------------------------------------------------------------------
// Social Media Command (F5) — connected accounts, posts, engagement metrics.
// access_token is AES-256-GCM encrypted (src/lib/auth/encryption.ts).
// ---------------------------------------------------------------------------

export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 20 }).notNull(), // twitter|instagram|facebook|tiktok|reddit
  account_name: varchar("account_name", { length: 255 }).notNull(),
  access_token: text("access_token").notNull(), // AES-256-GCM encrypted
  refresh_token: text("refresh_token"),
  expires_at: timestamp("expires_at", { withTimezone: true, mode: "string" }),
  is_active: integer("is_active").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  account_id: integer("account_id").references(() => socialAccounts.id, { onDelete: "set null" }),
  platform: varchar("platform", { length: 20 }).notNull(),
  text: text("text").notNull(),
  media_urls: text("media_urls").notNull().default("[]"),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft|scheduled|queued|awaiting_hitl|published|failed|cancelled
  scheduled_time: timestamp("scheduled_time", { withTimezone: true, mode: "string" }),
  cron_expression: text("cron_expression"),
  repeat_until: timestamp("repeat_until", { withTimezone: true, mode: "string" }),
  published_time: timestamp("published_time", { withTimezone: true, mode: "string" }),
  platform_post_id: varchar("platform_post_id", { length: 255 }),
  metrics: text("metrics").notNull().default("{}"),
  error: text("error"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const socialMetrics = pgTable("social_metrics", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 20 }).notNull(),
  reach: integer("reach").notNull().default(0),
  engagement: integer("engagement").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  collected_at: timestamp("collected_at", { withTimezone: true, mode: "string" }),
});
