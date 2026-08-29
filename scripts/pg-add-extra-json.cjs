// scratch: add extra_json column to zb_queue (idempotent)
const postgres = require("postgres");
const url = process.argv[2];
const sql = postgres(url);
(async () => {
  await sql.unsafe('ALTER TABLE zb_queue ADD COLUMN IF NOT EXISTS extra_json text');
  const c = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${"zb_queue"} ORDER BY ordinal_position`;
  console.log("zb_queue cols:", c.map((x) => x.column_name).join(", "));
  await sql.end();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});