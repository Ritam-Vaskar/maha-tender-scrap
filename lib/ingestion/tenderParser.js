import * as cheerio from "cheerio"

// Parses raw source HTML into loosely-typed records.
//
// Source-specific selectors are isolated in SELECTORS so they can be adjusted
// after verifying the live portal structure without touching the pipeline.
// Until verified against the official source, parsing stays a scaffold.

export const SELECTORS = {
  row: process.env.SOURCE_ROW_SELECTOR || "tr[id^='informal_']",
  title: process.env.SOURCE_TITLE_SELECTOR || "td:nth-child(1) a",
  referenceNumber: process.env.SOURCE_REFERENCE_SELECTOR || "td:nth-child(2)",
  submissionEnd: process.env.SOURCE_CLOSING_SELECTOR || "td:nth-child(3)",
  openingAt: process.env.SOURCE_OPENING_SELECTOR || "td:nth-child(4)",
}

// Given raw homepage HTML, return rows from the verified Latest Tenders panel.
export function parseListing(html) {
  const $ = cheerio.load(html || "")
  const records = []
  $(SELECTORS.row).each((_, row) => {
    const cells = $(row).find("td")
    const titleNode = $(row).find(SELECTORS.title).first()
    const title = clean(titleNode.text() || cells.eq(0).text())
    const referenceNumber = clean($(row).find(SELECTORS.referenceNumber).first().text() || cells.eq(1).text())
    const submissionEnd = clean($(row).find(SELECTORS.submissionEnd).first().text() || cells.eq(2).text())
    const openingAt = clean($(row).find(SELECTORS.openingAt).first().text() || cells.eq(3).text())
    const href = titleNode.attr("href")
    const sourceUrl = href ? new URL(href, process.env.SOURCE_BASE_URL || "https://mahatenders.gov.in/nicgep/app").toString() : null
    const sourceId = extractSourceId(referenceNumber, sourceUrl, title)
    if (cells.length >= 4 && title && sourceId && !/tender title|reference no|latest tenders/i.test(title)) records.push({ sourceId, title, referenceNumber, submissionEnd, submissionEndAt: parsePortalDate(submissionEnd), openingAt, openingAtDate: parsePortalDate(openingAt), sourceUrl })
  })
  return records
}

export function parseTenderDetail(html) {
  const $ = cheerio.load(html || "")
  const result = {}
  $("td.td_caption").each((_, labelCell) => {
    const label = (clean($(labelCell).text()) || "").toLowerCase().replace(/[^a-z0-9]+/g, "")
    const value = clean($(labelCell).nextAll("td").first().text())
    if (!value) return
    if (label === "tenderid") result.sourceId ||= value
    else if (label.includes("tenderreferencenumber")) result.referenceNumber ||= value
    else if (label.includes("organisationchain")) result.organisation ||= value
    else if (label.includes("worklocation") || label === "location") result.location ||= value
    else if (label.includes("tendervalue") || label.includes("estimatedcost")) result.estimatedValue ||= value
    else if (label.includes("emdamount")) result.emd ||= value
    else if (label.includes("tenderfeein")) result.tenderFee ||= value
    else if (label.includes("bidsubmissionend")) result.submissionEnd ||= value
    else if (label.includes("bidopeningdate")) result.openingAt ||= value
    else if (label === "title") result.title ||= value
  })
  result.documents = $("a[href]").toArray().map((node) => ({ name: clean($(node).text()), sourceUrl: $(node).attr("href") })).filter((item) => item.name && item.sourceUrl && /pdf|document|boq|corrigendum/i.test(`${item.name} ${item.sourceUrl}`))
  result.title ||= clean($("h1, .pageheader, td[colspan] b").first().text())
  return result
}

function clean(value) {
  const result = String(value || "").replace(/\s+/g, " ").trim()
  return result || null
}

function extractSourceId(referenceNumber, sourceUrl, title) {
  const fromUrl = String(sourceUrl || "").match(/(?:tender|id|nit)[^a-z0-9]*([a-z0-9_-]{5,})/i)?.[1]
  return fromUrl || referenceNumber || title
}

export function parsePortalDate(value) {
  if (!value) return null
  const match = String(value).trim().match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
  const month = months[match[2].slice(0, 3).toLowerCase()]
  if (month === undefined) return null
  let hour = Number(match[4])
  if (match[6].toUpperCase() === "PM" && hour !== 12) hour += 12
  if (match[6].toUpperCase() === "AM" && hour === 12) hour = 0
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), hour, Number(match[5]))).toISOString()
}
