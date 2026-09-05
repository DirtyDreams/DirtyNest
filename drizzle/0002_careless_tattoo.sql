ALTER TABLE "calendar_events" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "calendar_events" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "completed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "completed_at" = '' THEN NULL ELSE "completed_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "hermes_memories" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_memories" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "hermes_messages" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "hermes_sessions" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_sessions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "hermes_sessions" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_sessions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "updated_at" = '' THEN NULL ELSE "updated_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "hermes_tool_logs" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_tool_logs" ALTER COLUMN "timestamp" SET DATA TYPE timestamp with time zone USING CASE WHEN "timestamp" = '' THEN NULL ELSE "timestamp"::timestamptz END;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "updated_at" = '' THEN NULL ELSE "updated_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "quick_links" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "quick_links" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quick_links" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "system_logs" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "system_logs" ALTER COLUMN "timestamp" SET DATA TYPE timestamp with time zone USING CASE WHEN "timestamp" = '' THEN NULL ELSE "timestamp"::timestamptz END;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "due_date" SET DATA TYPE timestamp with time zone USING CASE WHEN "due_date" = '' THEN NULL ELSE "due_date"::timestamptz END;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_activity_log" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "zb_activity_log" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "zb_activity_log" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_queue" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "zb_queue" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "zb_queue" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "created_at" = '' THEN NULL ELSE "created_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_queue" ALTER COLUMN "approved_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "approved_at" = '' THEN NULL ELSE "approved_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_queue" ALTER COLUMN "published_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "published_at" = '' THEN NULL ELSE "published_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_rules" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "zb_rules" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "zb_rules" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "updated_at" = '' THEN NULL ELSE "updated_at"::timestamptz END;--> statement-breakpoint
ALTER TABLE "zb_topics" ALTER COLUMN "fetched_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "zb_topics" ALTER COLUMN "fetched_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "zb_topics" ALTER COLUMN "fetched_at" SET DATA TYPE timestamp with time zone USING CASE WHEN "fetched_at" = '' THEN NULL ELSE "fetched_at"::timestamptz END;
