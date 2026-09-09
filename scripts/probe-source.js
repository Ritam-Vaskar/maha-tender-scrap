import process from "node:process"

const baseUrl = process.env.SOURCE_BASE_URL || "https://mahatenders.gov.in/nicgep/app"
const url = `${baseUrl}?page=FrontEndLatestActiveTenders&service=page`
const headers = { "User-Agent": process.env.SOURCE_USER_AGENT || "MahTenderBot/1.0 (+contact@example.com)", Accept: "text/html,application/xhtml+xml" }
const landing = await fetch(baseUrl, { headers })
const cookie = landing.headers.get("set-cookie")?.split(";")[0]
const response = await fetch(url, { headers: cookie ? { ...headers, Cookie: cookie } : headers })
const html = await response.text()
const captchaRequired = /Provide Captcha|captchaText|LatestActiveTenderscaptcha/i.test(html)
const hasLatestRows = /Tender Title[\s\S]{0,2000}Reference No[\s\S]{0,2000}Closing Date/i.test(html) && !captchaRequired
const responseSignature = html.replace(/\s+/g, " ").slice(0, 220)
console.log(JSON.stringify({ url, status: response.status, captchaRequired, hasLatestRows, bytes: html.length, responseSignature, diagnosis: captchaRequired ? "The official active-tender search requires CAPTCHA. No records can be collected automatically without bypassing an access control." : hasLatestRows ? "Public tender rows are available for parsing." : "The page returned no parseable tender rows." }, null, 2))