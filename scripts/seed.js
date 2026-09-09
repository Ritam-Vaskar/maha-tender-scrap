import fs from "node:fs"
import path from "node:path"
import pg from "pg"

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query(fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"))
  await client.query("INSERT INTO organisations (name, short_name, type) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING", ["Development sample organisation", "SAMPLE", "Development"])
  const organisation = await client.query("SELECT id FROM organisations WHERE short_name = 'SAMPLE'")
  await client.query("INSERT INTO districts (name, region) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING", ["Development district", "Sample"])
  const district = await client.query("SELECT id FROM districts WHERE name = 'Development district'")
  await client.query(`INSERT INTO tenders (source_id,title,reference_number,organisation_id,district_id,location,category,estimated_value,published_at,submission_end_at,status,source_url,is_sample) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),now()+interval '14 days','live',$9,true) ON CONFLICT (source_id) DO NOTHING`, ["DEV_SAMPLE_001", "Development sample tender for local testing", "SAMPLE/LOCAL/001", organisation.rows[0].id, district.rows[0].id, "Development location", "Works", 2500000, "https://mahatenders.gov.in/nicgep/app"])
  console.log("Database schema applied and one clearly marked development record seeded.")
} finally { client.release(); await pool.end() }