import { getSql } from "./client"

export async function getAnalytics() {
  const sql = getSql()

  const [byDistrict, byOrganisation, byCategory, valueDistribution, overTime, closingDistribution, totals] =
    await Promise.all([
      sql.query(
        `SELECT dist.name, count(t.id)::int AS count, coalesce(sum(t.estimated_value),0)::float8 AS value
         FROM tenders t JOIN districts dist ON dist.id = t.district_id
         GROUP BY dist.name ORDER BY count DESC`,
        [],
      ),
      sql.query(
        `SELECT o.short_name AS name, count(t.id)::int AS count, coalesce(sum(t.estimated_value),0)::float8 AS value
         FROM tenders t JOIN organisations o ON o.id = t.organisation_id
         GROUP BY o.short_name ORDER BY count DESC`,
        [],
      ),
      sql.query(
        `SELECT category AS name, count(*)::int AS count
         FROM tenders WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC`,
        [],
      ),
      sql.query(
        `SELECT bucket AS name, count(*)::int AS count FROM (
           SELECT CASE
             WHEN estimated_value < 1000000 THEN 'Under ₹10L'
             WHEN estimated_value < 5000000 THEN '₹10L–50L'
             WHEN estimated_value < 10000000 THEN '₹50L–1Cr'
             WHEN estimated_value < 100000000 THEN '₹1Cr–10Cr'
             ELSE 'Above ₹10Cr'
           END AS bucket,
           CASE
             WHEN estimated_value < 1000000 THEN 1
             WHEN estimated_value < 5000000 THEN 2
             WHEN estimated_value < 10000000 THEN 3
             WHEN estimated_value < 100000000 THEN 4
             ELSE 5
           END AS ord
           FROM tenders WHERE estimated_value IS NOT NULL
         ) b GROUP BY bucket, ord ORDER BY ord`,
        [],
      ),
      sql.query(
        `SELECT to_char(date_trunc('week', published_at), 'DD Mon') AS name,
           count(*)::int AS count,
           coalesce(sum(estimated_value),0)::float8 AS value
         FROM tenders WHERE published_at IS NOT NULL
         GROUP BY date_trunc('week', published_at)
         ORDER BY date_trunc('week', published_at) ASC`,
        [],
      ),
      sql.query(
        `SELECT bucket AS name, count(*)::int AS count FROM (
           SELECT CASE
             WHEN submission_end_at < now() THEN 'Closed'
             WHEN submission_end_at <= now() + interval '3 days' THEN '≤ 3 days'
             WHEN submission_end_at <= now() + interval '7 days' THEN '3–7 days'
             WHEN submission_end_at <= now() + interval '30 days' THEN '7–30 days'
             ELSE '30+ days'
           END AS bucket,
           CASE
             WHEN submission_end_at < now() THEN 1
             WHEN submission_end_at <= now() + interval '3 days' THEN 2
             WHEN submission_end_at <= now() + interval '7 days' THEN 3
             WHEN submission_end_at <= now() + interval '30 days' THEN 4
             ELSE 5
           END AS ord
           FROM tenders WHERE submission_end_at IS NOT NULL
         ) b GROUP BY bucket, ord ORDER BY ord`,
        [],
      ),
      sql.query(
        `SELECT count(*)::int AS "totalTenders",
           coalesce(sum(estimated_value),0)::float8 AS "totalValue",
           coalesce(avg(estimated_value),0)::float8 AS "avgValue"
         FROM tenders`,
        [],
      ),
    ])

  return {
    byDistrict,
    byOrganisation,
    byCategory,
    valueDistribution,
    overTime,
    closingDistribution,
    totals: totals[0] || { totalTenders: 0, totalValue: 0, avgValue: 0 },
  }
}
