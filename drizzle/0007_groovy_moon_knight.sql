CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"timestamp" timestamp with time zone,
	"level" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"details" text,
	"ip_origin" varchar(100) DEFAULT '127.0.0.1',
	"hash_sig" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "docker_containers_cache" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"ports" text,
	"cpu_percent" text,
	"memory_usage" text,
	"net_io" text,
	"uptime" text,
	"stack" varchar(100),
	"raw_json" text,
	"last_seen" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "intel_cves" (
	"id" serial PRIMARY KEY NOT NULL,
	"cve_id" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" varchar(20) DEFAULT 'unknown' NOT NULL,
	"cvss_score" text,
	"published_at" timestamp with time zone,
	"source" varchar(100) DEFAULT 'nvd' NOT NULL,
	"url" text,
	"raw_json" text,
	"created_at" timestamp with time zone,
	CONSTRAINT "intel_cves_cve_id_unique" UNIQUE("cve_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;