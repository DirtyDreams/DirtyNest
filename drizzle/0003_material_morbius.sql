CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'operator' NOT NULL,
	"api_keys" text,
	"created_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
