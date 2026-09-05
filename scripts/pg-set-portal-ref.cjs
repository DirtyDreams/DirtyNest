// scratch: set portal_ref for a queue row (dialog data token)
const postgres = require("postgres");
const [url, id, portalRef] = [process.argv[2], Number(process.argv[3]), process.argv[4]];
const sql = postgres(url);
(async () => {
  const rows = await sql`
    UPDATE zb_queue SET portal_ref = ${portalRef}
    WHERE id = ${id}
    RETURNING id, kind, target_ref, portal_ref`;
  console.log(JSON.stringify(rows[0] || {}, null, 2));
  await sql.end();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});