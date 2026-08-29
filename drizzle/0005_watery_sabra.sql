CREATE TABLE "knowledge_docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) DEFAULT 'general' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"metadata" text,
	"qdrant_point_id" varchar(100),
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"obsidian_path" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "knowledge_graph_edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_doc_id" integer NOT NULL,
	"target_doc_id" integer NOT NULL,
	"relation" varchar(50) DEFAULT 'wiki_link' NOT NULL,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_graph_edges" ADD CONSTRAINT "knowledge_graph_edges_source_doc_id_knowledge_docs_id_fk" FOREIGN KEY ("source_doc_id") REFERENCES "public"."knowledge_docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_graph_edges" ADD CONSTRAINT "knowledge_graph_edges_target_doc_id_knowledge_docs_id_fk" FOREIGN KEY ("target_doc_id") REFERENCES "public"."knowledge_docs"("id") ON DELETE cascade ON UPDATE no action;