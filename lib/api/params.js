// Parses and validates URL search params into a normalized filter object.
// Centralizes validation so every API route and page shares the same rules.

const VALID_SORTS = ["newest", "closingSoon", "highestValue", "lowestValue", "recentlyUpdated"]
const VALID_STATUS = ["live", "closed", "closingSoon"]

const VALUE_RANGES = {
  "under-10l": { minValue: 0, maxValue: 1000000 },
  "10l-50l": { minValue: 1000000, maxValue: 5000000 },
  "50l-1cr": { minValue: 5000000, maxValue: 10000000 },
  "1cr-10cr": { minValue: 10000000, maxValue: 100000000 },
  "above-10cr": { minValue: 100000000, maxValue: null },
}

const DATE_RANGES = {
  today: 1,
  "7d": 7,
  "30d": 30,
}

export function parseTenderFilters(searchParams) {
  const get = (k) =>
    typeof searchParams.get === "function" ? searchParams.get(k) : searchParams[k]

  const filters = {}

  const q = clean(get("q"))
  if (q) filters.q = q

  const organisation = clean(get("organisation"))
  if (organisation) filters.organisation = organisation

  const district = clean(get("district"))
  if (district) filters.district = district

  const category = clean(get("category"))
  if (category) filters.category = category

  const productCategory = clean(get("productCategory"))
  if (productCategory) filters.productCategory = productCategory

  const tenderType = clean(get("tenderType"))
  if (tenderType) filters.tenderType = tenderType

  const status = clean(get("status"))
  if (status && VALID_STATUS.includes(status)) filters.status = status

  const valueRange = clean(get("value"))
  if (valueRange && VALUE_RANGES[valueRange]) {
    Object.assign(filters, VALUE_RANGES[valueRange])
  } else {
    const minValue = toNumber(get("minValue"))
    const maxValue = toNumber(get("maxValue"))
    if (minValue !== null) filters.minValue = minValue
    if (maxValue !== null) filters.maxValue = maxValue
  }

  const dateRange = clean(get("published"))
  if (dateRange && DATE_RANGES[dateRange]) {
    filters.publishedWithinDays = DATE_RANGES[dateRange]
  }

  const sort = clean(get("sort"))
  filters.sort = sort && VALID_SORTS.includes(sort) ? sort : "newest"

  const page = toNumber(get("page"))
  filters.page = page && page > 0 ? Math.floor(page) : 1

  const pageSize = toNumber(get("pageSize"))
  if (pageSize) filters.pageSize = Math.min(Math.max(Math.floor(pageSize), 1), 60)

  return filters
}

function clean(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function toNumber(v) {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export { VALUE_RANGES, DATE_RANGES, VALID_SORTS }
