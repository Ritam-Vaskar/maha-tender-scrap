import { getSql } from "./client"

export async function listOrganisations() {
  const sql = getSql()
  return sql.query(
    `SELECT o.id, o.name, o.short_name AS "shortName", o.type,
       count(t.id)::int AS "tenderCount"
     FROM organisations o
     LEFT JOIN tenders t ON t.organisation_id = o.id
     GROUP BY o.id
     ORDER BY count(t.id) DESC, o.name ASC`,
    [],
  )
}

export async function listDistricts() {
  const sql = getSql()
  return sql.query(
    `SELECT dist.id, dist.name, dist.region,
       count(t.id)::int AS "tenderCount"
     FROM districts dist
     LEFT JOIN tenders t ON t.district_id = dist.id
     GROUP BY dist.id
     ORDER BY count(t.id) DESC, dist.name ASC`,
    [],
  )
}

export async function listCategories() {
  const sql = getSql()
  const rows = await sql.query(
    `SELECT DISTINCT category FROM tenders WHERE category IS NOT NULL ORDER BY category ASC`,
    [],
  )
  return rows.map((r) => r.category)
}
