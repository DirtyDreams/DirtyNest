// scratch: set extra_json (msdata) for a queue row
const postgres = require("postgres");
const [url, id, msdata] = [process.argv[2], Number(process.argv[3]), process.argv[4]];
const sql = postgres(url);
(async () => {
  const rows = await sql`
    UPDATE zb_queue SET extra_json = ${JSON.stringify({ msdata })}
    WHERE id = ${id}
    RETURNING id, kind, target_ref, extra_json`;
  console.log(JSON.stringify(rows[0] || {}, null, 2));
  await sql.end();
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});