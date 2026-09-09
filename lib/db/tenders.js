import { getSql } from "./client"

const SELECT = `
  SELECT
    t.id,
    t.source_id AS "sourceId",
    t.title,
    t.reference_number AS "referenceNumber",
    t.location,
    t.category,
    t.product_category AS "productCategory",
    t.form_of_contract AS "formOfContract",
    t.tender_type AS "tenderType",
    t.estimated_value AS "estimatedValue",
    t.emd,
    t.tender_fee AS "tenderFee",
    t.published_at AS "publishedAt",
    t.document_start_at AS "documentStartAt",
    t.submission_start_at AS "submissionStartAt",
    t.submission_end_at AS "submissionEndAt",
    t.opening_at AS "openingAt",
    t.status,
    t.description,
    t.eligibility,
    t.source_url AS "sourceUrl",
    t.is_sample AS "isSample",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt",
    o.id AS "organisationId",
    o.name AS "organisationName",
    o.short_name AS "organisationShortName",
    d.name AS "departmentName",
    dist.id AS "districtId",
    dist.name AS "districtName"
  FROM tenders t
  LEFT JOIN organisations o ON o.id = t.organisation_id
  LEFT JOIN departments d ON d.id = t.department_id
  LEFT JOIN districts dist ON dist.id = t.district_id
`

const SORTS = {
  newest: "t.published_at DESC NULLS LAST",
  closingSoon: "t.submission_end_at ASC NULLS LAST",
  highestValue: "t.estimated_value DESC NULLS LAST",
  lowestValue: "t.estimated_value ASC NULLS LAST",
  recentlyUpdated: "t.updated_at DESC NULLS LAST",
}

export async function listTenders(filters = {}) {
  const sql = getSql()
  const {
    q,
    organisation,
    district,
    category,
    productCategory,
    tenderType,
    status,
    minValue,
    maxValue,
    publishedWithinDays,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = filters

  const where = []
  const params = []
  let i = 1

  if (q) {
    where.push(`(
      t.title ILIKE $${i} OR t.reference_number ILIKE $${i} OR t.source_id ILIKE $${i}
      OR t.location ILIKE $${i} OR t.category ILIKE $${i} OR t.product_category ILIKE $${i}
      OR o.name ILIKE $${i} OR o.short_name ILIKE $${i} OR d.name ILIKE $${i} OR dist.name ILIKE $${i}
    )`)
    params.push(`%${q}%`)
    i++
  }
  if (organisation) {
    where.push(`(o.short_name ILIKE $${i} OR o.name ILIKE $${i})`)
    params.push(`%${organisation}%`)
    i++
  }
  if (district) {
    where.push(`dist.name ILIKE $${i}`)
    params.push(`%${district}%`)
    i++
  }
  if (category) {
    where.push(`t.category = $${i}`)
    params.push(category)
    i++
  }
  if (productCategory) {
    where.push(`t.product_category ILIKE $${i}`)
    params.push(`%${productCategory}%`)
    i++
  }
  if (tenderType) {
    where.push(`t.tender_type = $${i}`)
    params.push(tenderType)
    i++
  }
  if (status === "live") {
    where.push(`t.submission_end_at >= now()`)
  } else if (status === "closed") {
    where.push(`t.submission_end_at < now()`)
  } else if (status === "closingSoon") {
    where.push(`t.submission_end_at >= now() AND t.submission_end_at <= now() + interval '7 days'`)
  }
  if (minValue !== undefined && minValue !== null && minValue !== "") {
    where.push(`t.estimated_value >= $${i}`)
    params.push(Number(minValue))
    i++
  }
  if (maxValue !== undefined && maxValue !== null && maxValue !== "") {
    where.push(`t.estimated_value <= $${i}`)
    params.push(Number(maxValue))
    i++
  }
  if (publishedWithinDays) {
    where.push(`t.published_at >= now() - ($${i}::int * interval '1 day')`)
    params.push(Number(publishedWithinDays))
    i++
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const orderBy = SORTS[sort] || SORTS.newest

  const countRows = await sql.query(
    `SELECT count(*)::int AS total FROM tenders t
     LEFT JOIN organisations o ON o.id = t.organisation_id
     LEFT JOIN departments d ON d.id = t.department_id
     LEFT JOIN districts dist ON dist.id = t.district_id
     ${whereClause}`,
    params,
  )
  const total = countRows[0]?.total ?? 0

  const limit = Math.min(Math.max(Number(pageSize) || 12, 1), 60)
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit
  const rows = await sql.query(
    `${SELECT} ${whereClause} ORDER BY ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset],
  )

  return {
    items: rows,
    total,
    page: Math.max(Number(page) || 1, 1),
    pageSize: limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  }
}

export async function getTenderById(id) {
  const sql = getSql()
  const rows = await sql.query(`${SELECT} WHERE t.id = $1`, [Number(id)])
  return rows[0] || null
}

export async function getTenderDocuments(id) {
  const sql = getSql()
  return sql.query(
    `SELECT id, tender_id AS "tenderId", name, document_type AS "documentType",
       source_url AS "sourceUrl", mime_type AS "mimeType", file_size AS "fileSize",
       preview_available AS "previewAvailable", created_at AS "createdAt"
     FROM tender_documents WHERE tender_id = $1 ORDER BY id ASC`,
    [Number(id)],
  )
}

export async function getTenderCorrigendums(id) {
  const sql = getSql()
  return sql.query(
    `SELECT id, tender_id AS "tenderId", title, description,
       published_at AS "publishedAt", source_url AS "sourceUrl"
     FROM corrigendums WHERE tender_id = $1 ORDER BY published_at DESC`,
    [Number(id)],
  )
}

export async function getKpis() {
  const sql = getSql()
  const rows = await sql.query(
    `SELECT
      (SELECT count(*)::int FROM tenders WHERE published_at >= now() - interval '7 days') AS "newTenders",
      (SELECT count(*)::int FROM tenders WHERE submission_end_at >= now() AND submission_end_at <= now() + interval '7 days') AS "closingSoon",
      (SELECT count(*)::int FROM tenders WHERE estimated_value >= 10000000 AND submission_end_at >= now()) AS "highValue",
      (SELECT count(*)::int FROM tenders) AS "totalTenders"`,
    [],
  )
  return rows[0] || { newTenders: 0, closingSoon: 0, highValue: 0, totalTenders: 0 }
}

export async function countTracked(userId) {
  const sql = getSql()
  const rows = await sql.query(`SELECT count(*)::int AS c FROM saved_tenders WHERE user_id = $1`, [userId])
  return rows[0]?.c ?? 0
}

export async function recordView(id, userId) {
  const sql = getSql()
  await sql.query(`INSERT INTO tender_views (tender_id, user_id) VALUES ($1, $2)`, [Number(id), userId || null])
}
