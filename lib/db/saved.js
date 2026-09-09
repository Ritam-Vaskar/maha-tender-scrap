import { getSql } from "./client"

export async function saveTender(userId, tenderId, note) {
  const sql = getSql()
  await sql.query(
    `INSERT INTO saved_tenders (user_id, tender_id, note) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, tender_id) DO UPDATE SET note = EXCLUDED.note`,
    [userId, Number(tenderId), note || null],
  )
}

export async function unsaveTender(userId, tenderId) {
  const sql = getSql()
  await sql.query(`DELETE FROM saved_tenders WHERE user_id = $1 AND tender_id = $2`, [userId, Number(tenderId)])
}

export async function isSaved(userId, tenderId) {
  const sql = getSql()
  const rows = await sql.query(`SELECT 1 FROM saved_tenders WHERE user_id = $1 AND tender_id = $2`, [
    userId,
    Number(tenderId),
  ])
  return rows.length > 0
}

export async function listSavedTenderIds(userId) {
  const sql = getSql()
  const rows = await sql.query(`SELECT tender_id AS "tenderId" FROM saved_tenders WHERE user_id = $1`, [userId])
  return rows.map((r) => r.tenderId)
}

export async function listSavedTenders(userId) {
  const sql = getSql()
  return sql.query(
    `SELECT
       t.id, t.source_id AS "sourceId", t.title, t.reference_number AS "referenceNumber",
       t.location, t.category, t.estimated_value AS "estimatedValue",
       t.published_at AS "publishedAt", t.submission_end_at AS "submissionEndAt",
       t.status, t.is_sample AS "isSample",
       o.short_name AS "organisationShortName", o.name AS "organisationName",
       dist.name AS "districtName",
       s.note, s.created_at AS "savedAt"
     FROM saved_tenders s
     JOIN tenders t ON t.id = s.tender_id
     LEFT JOIN organisations o ON o.id = t.organisation_id
     LEFT JOIN districts dist ON dist.id = t.district_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId],
  )
}

export async function listSavedSearches(userId) {
  const sql = getSql()
  return sql.query(
    `SELECT id, name, query, filters, created_at AS "createdAt", last_matched_at AS "lastMatchedAt"
     FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  )
}

export async function createSavedSearch(userId, name, query, filters) {
  const sql = getSql()
  const rows = await sql.query(
    `INSERT INTO saved_searches (user_id, name, query, filters) VALUES ($1, $2, $3, $4)
     RETURNING id, name, query, filters, created_at AS "createdAt", last_matched_at AS "lastMatchedAt"`,
    [userId, name, query || null, filters ? JSON.stringify(filters) : null],
  )
  return rows[0]
}

export async function deleteSavedSearch(userId, id) {
  const sql = getSql()
  await sql.query(`DELETE FROM saved_searches WHERE user_id = $1 AND id = $2`, [userId, Number(id)])
}
