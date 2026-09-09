import { isSourceEnabled, fetchListingPage, SOURCE } from "./sourceClient"
import { parseListing, parseTenderDetail } from "./tenderParser"
import { normalizeTender } from "./tenderNormalizer"
import { upsertTender, startSyncLog, finishSyncLog } from "./tenderRepository"

// Orchestrates a single ingestion run:
//   source -> parse -> normalize -> validate -> upsert (dedupe + change detect)
// with rate limiting, retry, and structured logging.
//
// The pipeline is fully wired but remains inert until SOURCE_ENABLED=true and
// the parser selectors have been verified against the live portal.

export async function runSync({ maxPages = 1 } = {}) {
  const logId = await startSyncLog()
  const stats = { newTenders: 0, updatedTenders: 0, failedRecords: 0, documentsDiscovered: 0 }

  if (!isSourceEnabled()) {
    await finishSyncLog(logId, {
      ...stats,
      status: "skipped",
      message:
        "Source adapter inactive (SOURCE_ENABLED != true). Configure and verify the adapter against the official portal before enabling.",
    })
    return {
      status: "skipped",
      ...stats,
      message: "Ingestion source is not configured. No external requests were made.",
    }
  }

  try {
    for (let page = 1; page <= Math.min(maxPages, SOURCE.maxRequestsPerRun); page++) {
      const html = await withRetry(() => fetchListingPage(page), 3)
      const rawRecords = parseListing(html)

      for (const raw of rawRecords) {
        const result = normalizeTender(raw)
        if (!result.ok) {
          stats.failedRecords++
          console.log("[v0] ingestion: rejected record:", result.error)
          continue
        }
        const { action } = await upsertTender(result.tender)
        if (action === "inserted") stats.newTenders++
        else if (action === "updated") stats.updatedTenders++
      }
    }

    await finishSyncLog(logId, { ...stats, status: "success", message: "Sync completed." })
    return { status: "success", ...stats }
  } catch (err) {
    await finishSyncLog(logId, { ...stats, status: "failed", message: err.message })
    return { status: "failed", ...stats, message: err.message }
  }
}

async function withRetry(fn, attempts) {
  let lastErr
  for (let a = 0; a < attempts; a++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 1000 * (a + 1)))
    }
  }
  throw lastErr
}
