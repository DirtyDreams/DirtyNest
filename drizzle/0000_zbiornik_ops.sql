CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" text NOT NULL,
	"time" text,
	"color" text DEFAULT '#00FF41',
	"created_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"duration_minutes" integer NOT NULL,
	"type" text NOT NULL,
	"completed_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hermes_memories" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"category" varchar(50) DEFAULT 'fact' NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"tags_json" text,
	"recall_count" integer DEFAULT 0 NOT NULL,
	"created_at" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hermes_messages" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"reasoning_trace" text,
	"created_at" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hermes_sessions" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"profile" varchar(100) DEFAULT 'dirtydaily' NOT NULL,
	"model" varchar(100) DEFAULT 'Nous-Hermes-3-Llama-3.1-8B' NOT NULL,
	"cwd" text NOT NULL,
	"status" varchar(50) DEFAULT 'IDLE' NOT NULL,
	"created_at" varchar(100) NOT NULL,
	"updated_at" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hermes_tool_logs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"tool_name" varchar(100) NOT NULL,
	"parameters_json" text NOT NULL,
	"result_json" text,
	"risk_level" varchar(50) DEFAULT 'low' NOT NULL,
	"permission_status" varchar(50) DEFAULT 'AUTO_APPROVED' NOT NULL,
	"execution_time_ms" integer DEFAULT 0,
	"timestamp" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"updated_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quick_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" varchar(100) NOT NULL,
	"level" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"details" text,
	"latency_ms" integer DEFAULT 0,
	"status_code" varchar(50) DEFAULT '200',
	"ip_origin" varchar(100) DEFAULT '127.0.0.1',
	"hash_sig" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"due_date" varchar(100),
	"created_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zb_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"op" varchar(40) NOT NULL,
	"target_ref" varchar(300),
	"payload_json" text,
	"ok" integer DEFAULT 0 NOT NULL,
	"message" text,
	"created_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zb_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(20) NOT NULL,
	"target_ref" varchar(300),
	"content_hash" varchar(64) NOT NULL,
	"title" text,
	"body" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"portal_ref" varchar(300),
	"error" text,
	"created_at" varchar(100) DEFAULT '' NOT NULL,
	"approved_at" varchar(100),
	"published_at" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "zb_rules" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" varchar(300) NOT NULL,
	"updated_at" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zb_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"portal_ref" varchar(300) NOT NULL,
	"url" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"author" varchar(120) DEFAULT '' NOT NULL,
	"preview" text DEFAULT '' NOT NULL,
	"raw_json" text,
	"fetched_at" varchar(100) DEFAULT '' NOT NULL
);
