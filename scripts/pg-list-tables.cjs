// scratch: list public tables + row counts for zb_* presence (no secrets printed)
const postgres = require("postgres");
const url = process.argv[2];
const sql = postgres(url);
(async () => {
  const tables = await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
  console.log("TABLES:", tables.map((t) => t.table_name).join(", "));
  await sql.end();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});