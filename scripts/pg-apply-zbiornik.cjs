// scratch: idempotent apply of ONLY the zb_* tables (+ default rules) to live PG.
const postgres = require("postgres");
const url = process.argv[2];
const sql = postgres(url);

const stmts = [
  `CREATE TABLE IF NOT EXISTS "zb_activity_log" (
    "id" serial PRIMARY KEY NOT NULL,
    "op" varchar(40) NOT NULL,
    "target_ref" varchar(300),
    "payload_json" text,
    "ok" integer DEFAULT 0 NOT NULL,
    "message" text,
    "created_at" varchar(100) DEFAULT '' NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "zb_queue" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "zb_rules" (
    "key" varchar(60) PRIMARY KEY NOT NULL,
    "value" varchar(300) NOT NULL,
    "updated_at" varchar(100) DEFAULT '' NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "zb_topics" (
    "id" serial PRIMARY KEY NOT NULL,
    "portal_ref" varchar(300) NOT NULL,
    "url" text NOT NULL,
    "title" text DEFAULT '' NOT NULL,
    "author" varchar(120) DEFAULT '' NOT NULL,
    "preview" text DEFAULT '' NOT NULL,
    "raw_json" text,
    "fetched_at" varchar(100) DEFAULT '' NOT NULL
  )`,
  `INSERT INTO zb_rules ("key","value","updated_at") VALUES
     ('max_per_day','20', to_char(now(),'YYYY-MM-DD"T"HH24:MI:SS')),
     ('min_gap_minutes','10', to_char(now(),'YYYY-MM-DD"T"HH24:MI:SS')),
     ('quiet_hours','23:00-07:00', to_char(now(),'YYYY-MM-DD"T"HH24:MI:SS'))
   ON CONFLICT (key) DO NOTHING`,
];

(async () => {
  for (const s of stmts) await sql.unsafe(s);
  const tables = await sql`select table_name from information_schema.tables where table_schema='public' and table_name like 'zb_%' order by table_name`;
  console.log("ZB TABLES:", tables.map((t) => t.table_name).join(", "));
  const rules = await sql`select key, value from zb_rules order by key`;
  console.log("RULES:", rules.map((r) => `${r.key}=${r.value}`).join(", "));
  await sql.end();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});