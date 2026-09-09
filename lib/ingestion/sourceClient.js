// Source client for the Maharashtra eProcurement portal.
//
// IMPORTANT LEGAL / ETHICAL NOTES:
// - The frontend NEVER scrapes the government website directly. All ingestion
//   runs server-side through this isolated adapter.
// - This client MUST NOT solve or bypass CAPTCHA, nor circumvent any access
//   control or authentication. Where a document or listing requires CAPTCHA or
//   a login, we only store the official source URL and link users to it.
// - The adapter is intentionally inert by default. Real selectors and request
//   flows must be verified against the official portal before enabling.
//
// Configure via environment variables; never hard-code credentials.

export const SOURCE = {
  name: "Maharashtra Government eProcurement Portal",
  baseUrl: process.env.SOURCE_BASE_URL || "https://mahatenders.gov.in/nicgep/app",
  // Politeness controls to avoid overloading the source.
  requestDelayMs: Number(process.env.SOURCE_REQUEST_DELAY_MS || 2000),
  maxRequestsPerRun: Number(process.env.SOURCE_MAX_REQUESTS || 50),
  userAgent: process.env.SOURCE_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
  activePath: "?page=FrontEndLatestActiveTenders&service=page",
}

// Enabled only when a source adapter has been configured and verified.
export function isSourceEnabled() {
  return process.env.SOURCE_ENABLED === "true"
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// Fetches a listing page. Returns raw HTML/text for the parser.
// NOTE: This is a scaffold. It performs a plain, rate-limited GET only.
export async function fetchListingPage(pageNumber = 1) {
  if (!isSourceEnabled()) {
    throw new Error("SOURCE_ENABLED is not set. The ingestion source adapter is inactive.")
  }
  await delay(SOURCE.requestDelayMs)
  const headers = { "User-Agent": SOURCE.userAgent, Accept: "text/html,application/xhtml+xml" }
  const landing = await fetch(SOURCE.baseUrl, { headers, cache: "no-store" })
  const cookie = landing.headers.get("set-cookie")?.split(";")[0]
  const url = `${SOURCE.baseUrl}${SOURCE.activePath}${pageNumber > 1 ? `&pageNumber=${pageNumber}` : ""}`
  const res = await fetch(url, {
    headers: cookie ? { ...headers, Cookie: cookie } : headers,
    // Never send cookies/credentials to the source.
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Source responded with ${res.status}`)
  }
  const html = await res.text()
  if (/Provide Captcha|captchaText|LatestActiveTenderscaptcha/i.test(html)) {
    throw new Error("The official active-tender listing requires CAPTCHA. MahTender will not bypass it; open the official portal to search or download records.")
  }
  return html
}

export async function fetchPublicHomePage() {
  await delay(SOURCE.requestDelayMs)
  const res = await fetch(SOURCE.baseUrl, {
    headers: { "User-Agent": SOURCE.userAgent, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9", Referer: "https://mahatenders.gov.in/" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Official portal responded with HTTP ${res.status}`)
  return res.text()
}

export async function fetchPublicTenderDetail(sourceUrl, sourceId) {
  const target = new URL(sourceUrl)
  const base = new URL(SOURCE.baseUrl)
  if (target.origin !== base.origin || target.pathname !== base.pathname) {
    throw new Error("Only Maharashtra eProcurement detail URLs are allowed")
  }
  const headers = { "User-Agent": SOURCE.userAgent, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9", Referer: "https://mahatenders.gov.in/" }
  const landing = await fetch(SOURCE.baseUrl, { headers, cache: "no-store" })
  if (!landing.ok) throw new Error(`Official portal session bootstrap responded with HTTP ${landing.status}`)
  const cookie = landing.headers.get("set-cookie")?.split(";")[0]
  let detailUrl = target
  if (sourceId || target.searchParams.get("component") === "$DirectLink") {
    const homepage = await landing.text()
    const rows = homepage.match(/<tr[^>]*id=["']informal_[^"']+["'][\s\S]*?<\/tr>/gi) || []
    const wanted = String(sourceId || "").trim().toLowerCase()
    const row = rows.find((candidate) => !wanted || candidate.toLowerCase().includes(wanted))
    const token = target.searchParams.get("sp")
    const linkPattern = token ? new RegExp(`href=["'][^"']*sp=${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"']*["']`, "i") : null
    const match = row?.match(/href=["'][^"']*(?:%24DirectLink|\$DirectLink)[^"']*["']/i)?.[0] || (linkPattern && homepage.match(linkPattern)?.[0])
    if (match) {
      const href = match.slice(match.indexOf("http") >= 0 ? match.indexOf("http") : match.indexOf("/nicgep")).replace(/&amp;/g, "&")
      detailUrl = new URL(href, base.origin)
    }
  }
  const response = await fetch(detailUrl, { headers: cookie ? { ...headers, Cookie: cookie } : headers, cache: "no-store" })
  if (!response.ok) throw new Error(`Official tender detail responded with HTTP ${response.status}`)
  return response.text()
}
