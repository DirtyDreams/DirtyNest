CREATE TABLE "agent_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_type" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"system_prompt" text DEFAULT '' NOT NULL,
	"keywords" text DEFAULT '[]' NOT NULL,
	"tool_whitelist" text DEFAULT '[]' NOT NULL,
	"llm_provider" varchar(50) DEFAULT 'ollama' NOT NULL,
	"llm_model" varchar(100) DEFAULT 'llama3' NOT NULL,
	"enabled" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "agent_configs_agent_type_unique" UNIQUE("agent_type")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"sender" varchar(20) NOT NULL,
	"text" text NOT NULL,
	"tokens" integer DEFAULT 0,
	"thinking_time_ms" integer DEFAULT 0,
	"thinking_trace" text,
	"citations" text,
	"tool_calls" text,
	"agent_used" varchar(50),
	"execution_time_ms" integer DEFAULT 0,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(255) NOT NULL,
	"model" varchar(100),
	"mode" varchar(50) DEFAULT 'standard' NOT NULL,
	"orchestrator_decision" text,
	"harness_session_id" varchar(100),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;