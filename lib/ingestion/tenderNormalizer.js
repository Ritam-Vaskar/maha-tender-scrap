// Normalizes and validates raw parsed records into the canonical shape used by
// the repository. Rejects records missing a stable source identifier so that
// deduplication and change detection stay reliable.

export function normalizeTender(raw) {
  if (!raw || !raw.sourceId) {
    return { ok: false, error: "Missing sourceId" }
  }

  const value = normalizeCurrency(raw.estimatedValue)
  const tender = {
    sourceId: String(raw.sourceId).trim(),
    title: clean(raw.title),
    referenceNumber: clean(raw.referenceNumber),
    organisationName: clean(raw.organisation),
    departmentName: clean(raw.department),
    districtName: clean(raw.district),
    location: clean(raw.location),
    category: clean(raw.category),
    productCategory: clean(raw.productCategory),
    formOfContract: clean(raw.formOfContract),
    tenderType: clean(raw.tenderType),
    estimatedValue: value,
    emd: normalizeCurrency(raw.emd),
    tenderFee: normalizeCurrency(raw.tenderFee),
    publishedAt: normalizeDate(raw.publishedAt),
    submissionEndAt: normalizeDate(raw.submissionEndAt),
    openingAt: normalizeDate(raw.openingAt),
    sourceUrl: clean(raw.sourceUrl),
  }

  if (!tender.title) {
    return { ok: false, error: "Missing title" }
  }
  return { ok: true, tender }
}

function clean(v) {
  if (v === null || v === undefined) return null
  const s = String(v).replace(/\s+/g, " ").trim()
  return s.length ? s : null
}

// Converts Indian currency strings ("Rs. 1,82,00,000" / "1.82 Cr") to a number.
function normalizeCurrency(v) {
  if (v === null || v === undefined || v === "") return null
  if (typeof v === "number") return v
  const s = String(v).toLowerCase()
  const num = Number(s.replace(/[^0-9.]/g, ""))
  if (Number.isNaN(num)) return null
  if (s.includes("cr")) return Math.round(num * 10000000)
  if (s.includes("lakh") || s.includes("lac")) return Math.round(num * 100000)
  return Math.round(num)
}

function normalizeDate(v) {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
