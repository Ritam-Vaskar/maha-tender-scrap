import { getSql } from "@/lib/db/client"

// Persistence for the ingestion pipeline: deduplication + upsert + change
// detection keyed on the stable sourceId.

async function resolveReferenceId(sql, table, name) {
  if (!name) return null
  const existing = await sql.query(`SELECT id FROM ${table} WHERE name = $1`, [name])
  if (existing.length) return existing[0].id
  const inserted = await sql.query(`INSERT INTO ${table} (name) VALUES ($1) RETURNING id`, [name])
  return inserted[0].id
}

// Upserts a normalized tender. Returns { action: 'inserted' | 'updated' | 'unchanged' }.
export async function upsertTender(tender) {
  const sql = getSql()

  const organisationId = await resolveReferenceId(sql, "organisations", tender.organisationName)
  const districtId = await resolveReferenceId(sql, "districts", tender.districtName)

  const existing = await sql.query(`SELECT * FROM tenders WHERE source_id = $1`, [tender.sourceId])

  if (!existing.length) {
    await sql.query(
      `INSERT INTO tenders
        (source_id, title, reference_number, organisation_id, district_id, location, category,
         product_category, form_of_contract, tender_type, estimated_value, emd, tender_fee,
         published_at, submission_end_at, opening_at, source_url, is_sample, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,false,'live')`,
      [
        tender.sourceId,
        tender.title,
        tender.referenceNumber,
        organisationId,
        districtId,
        tender.location,
        tender.category,
        tender.productCategory,
        tender.formOfContract,
        tender.tenderType,
        tender.estimatedValue,
        tender.emd,
        tender.tenderFee,
        tender.publishedAt,
        tender.submissionEndAt,
        tender.openingAt,
        tender.sourceUrl,
      ],
    )
    return { action: "inserted" }
  }

  // Change detection on the fields that matter most.
  const prev = existing[0]
  const changed =
    String(prev.title) !== String(tender.title) ||
    String(prev.submission_end_at) !== String(tender.submissionEndAt) ||
    String(prev.estimated_value) !== String(tender.estimatedValue)

  if (!changed) return { action: "unchanged" }

  await sql.query(
    `UPDATE tenders SET title=$2, reference_number=$3, estimated_value=$4, emd=$5,
       submission_end_at=$6, opening_at=$7, updated_at=now() WHERE source_id=$1`,
    [
      tender.sourceId,
      tender.title,
      tender.referenceNumber,
      tender.estimatedValue,
      tender.emd,
      tender.submissionEndAt,
      tender.openingAt,
    ],
  )
  return { action: "updated" }
}

export async function startSyncLog() {
  const sql = getSql()
  const rows = await sql.query(`INSERT INTO sync_logs (status) VALUES ('running') RETURNING id`, [])
  return rows[0].id
}

export async function finishSyncLog(id, stats) {
  const sql = getSql()
  await sql.query(
    `UPDATE sync_logs SET finished_at=now(), status=$2, new_tenders=$3, updated_tenders=$4,
       failed_records=$5, documents_discovered=$6, message=$7 WHERE id=$1`,
    [
      id,
      stats.status || "success",
      stats.newTenders || 0,
      stats.updatedTenders || 0,
      stats.failedRecords || 0,
      stats.documentsDiscovered || 0,
      stats.message || null,
    ],
  )
}

export async function getLatestSync() {
  const sql = getSql()
  const rows = await sql.query(
    `SELECT id, started_at AS "startedAt", finished_at AS "finishedAt", status,
       new_tenders AS "newTenders", updated_tenders AS "updatedTenders",
       failed_records AS "failedRecords", documents_discovered AS "documentsDiscovered", message
     FROM sync_logs ORDER BY started_at DESC LIMIT 10`,
    [],
  )
  return rows
}
