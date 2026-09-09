import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { EmptyState, NoResultsState } from "@/components/states"
import { TenderCard } from "@/components/tender-card"
import { TenderFilters } from "@/components/tender-filters"
import { listTenders } from "@/lib/db/tenders"
import { parseTenderFilters } from "@/lib/api/params"
import { fetchPublicHomePage } from "@/lib/ingestion/sourceClient"
import { parseListing } from "@/lib/ingestion/tenderParser"

export const dynamic = "force-dynamic"

function filterDirectTenders(sourceItems, filters) {
  const multiplier = Math.min(Math.max(Number(process.env.DIRECT_PREVIEW_MULTIPLIER || 1), 1), 100)
  const expandedItems = Array.from({ length: multiplier }, (_, copy) => sourceItems.map((item) => ({ ...item, previewCopy: copy + 1, isPreview: multiplier > 1 }))).flat()
  const query = String(filters.q || "").toLowerCase()
  const now = Date.now()
  const filtered = expandedItems.filter((item) => {
    const matchesQuery = !query || `${item.title} ${item.referenceNumber} ${item.sourceId}`.toLowerCase().includes(query)
    const deadline = item.submissionEndAt ? new Date(item.submissionEndAt).getTime() : NaN
    const matchesStatus = !filters.status || (filters.status === "closed" && deadline < now) || (filters.status === "live" && deadline >= now) || (filters.status === "closingSoon" && deadline >= now && deadline <= now + 7 * 86400000)
    return matchesQuery && matchesStatus
  })
  if (filters.sort === "closingSoon") filtered.sort((a, b) => new Date(a.submissionEndAt || 8640000000000000).getTime() - new Date(b.submissionEndAt || 8640000000000000).getTime())
  return filtered.map((item, index) => ({ ...item, id: `source-${index}-${item.sourceId}`, isSourceDirect: true }))
}

export default async function TendersPage({ searchParams }) {
  const params = await searchParams
  const filters = parseTenderFilters(new URLSearchParams(params || {}))
  let result = { items: [], total: 0, totalPages: 1, page: 1 }
  let error = false

  if (process.env.SOURCE_MODE === "direct" && process.env.SOURCE_ENABLED === "true") {
    try {
      const items = filterDirectTenders(parseListing(await fetchPublicHomePage()), filters)
      const pageSize = 24
      const page = filters.page || 1
      result = { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize, totalPages: Math.max(Math.ceil(items.length / pageSize), 1) }
    } catch (err) {
      console.error("Direct source search unavailable", err)
      error = true
    }
  } else if (process.env.DATABASE_URL) {
    try {
      result = await listTenders(filters)
    } catch (err) {
      console.error("Tender search unavailable", err)
      error = true
    }
  }

  const directMode = process.env.SOURCE_MODE === "direct"
  const previewMode = directMode && Number(process.env.DIRECT_PREVIEW_MULTIPLIER || 1) > 1
  const queryParams = new URLSearchParams(params || {})
  function pageHref(page) {
    const next = new URLSearchParams(queryParams)
    next.set("page", String(page))
    return `/tenders?${next.toString()}`
  }
  return <>
    <SiteHeader />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Discovery workspace</p>
          <h1 className="mt-1 text-3xl font-bold">Tenders</h1>
          <p className="mt-2 text-sm text-muted-foreground">{directMode ? "Direct public-source mode. Only rows returned without CAPTCHA are shown." : "Search indexed Maharashtra procurement opportunities."}</p>
          {previewMode ? <p className="mt-2 inline-flex rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">UI preview: repeated source rows for scale testing</p> : null}
        </div>
        <p className="text-sm text-muted-foreground">{result.total} result{result.total === 1 ? "" : "s"}</p>
      </div>
      <TenderFilters initialQuery={filters.q || ""} initialStatus={filters.status || ""} />
      <div className="mt-6">
        {error ? <EmptyState title="Official source could not be read" description="The portal may be unavailable or has required CAPTCHA/authenticated access. Open the official source to search manually." /> : result.items.length ? <><div className="grid gap-4 lg:grid-cols-2">{result.items.map((tender) => <TenderCard key={tender.id} tender={tender} />)}</div><div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm sm:flex-row"><p className="text-muted-foreground">Showing {((result.page - 1) * result.pageSize) + 1}–{Math.min(result.page * result.pageSize, result.total)} of {result.total}</p>{result.totalPages > 1 ? <nav className="flex items-center gap-2" aria-label="Tender pages">{result.page > 1 ? <Link href={pageHref(result.page - 1)} className="rounded-md border border-border px-3 py-2 hover:bg-secondary">Previous</Link> : null}<span className="px-2 text-muted-foreground">Page {result.page} of {result.totalPages}</span>{result.page < result.totalPages ? <Link href={pageHref(result.page + 1)} className="rounded-md border border-border px-3 py-2 hover:bg-secondary">Next</Link> : null}</nav> : null}</div></> : <NoResultsState title={directMode ? "The official public page returned no tender rows" : "Connect PostgreSQL or enable direct mode"} description={directMode ? "Use the official portal link for CAPTCHA-backed search." : "Set SOURCE_MODE=direct and SOURCE_ENABLED=true to fetch public homepage rows."} />}
      </div>
    </main>
  </>
}
