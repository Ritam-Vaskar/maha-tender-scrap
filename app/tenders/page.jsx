import { SiteHeader } from "@/components/layout/site-header"
import { EmptyState, NoResultsState } from "@/components/states"
import { TenderCard } from "@/components/tender-card"
import { listTenders } from "@/lib/db/tenders"
import { parseTenderFilters } from "@/lib/api/params"
import { fetchPublicHomePage } from "@/lib/ingestion/sourceClient"
import { parseListing } from "@/lib/ingestion/tenderParser"

export const dynamic = "force-dynamic"

export default async function TendersPage({ searchParams }) {
  const params = await searchParams
  const filters = parseTenderFilters(new URLSearchParams(params || {}))
  let result = { items: [], total: 0, totalPages: 1, page: 1 }
  let error = false
  if (process.env.SOURCE_MODE === "direct" && process.env.SOURCE_ENABLED === "true") {
    try {
      const sourceItems = parseListing(await fetchPublicHomePage())
      const query = String(filters.q || "").toLowerCase()
      const now = Date.now()
      const filtered = sourceItems.filter((item) => {
        const matchesQuery = !query || `${item.title} ${item.referenceNumber} ${item.sourceId}`.toLowerCase().includes(query)
        const deadline = item.submissionEndAt ? new Date(item.submissionEndAt).getTime() : NaN
        const matchesStatus = !filters.status || (filters.status === "closed" && deadline < now) || (filters.status === "live" && deadline >= now) || (filters.status === "closingSoon" && deadline >= now && deadline <= now + 7 * 86400000)
        return matchesQuery && matchesStatus
      })
      if (filters.sort === "closingSoon") filtered.sort((a, b) => new Date(a.submissionEndAt || 8640000000000000).getTime() - new Date(b.submissionEndAt || 8640000000000000).getTime())
      const items = filtered.map((item, index) => ({ ...item, id: `source-${index}-${item.sourceId}`, isSourceDirect: true }))
      result = { items, total: items.length, totalPages: 1, page: 1 }
    } catch (err) { console.error("Direct source search unavailable", err); error = true }
  } else if (process.env.DATABASE_URL) {
    try { result = await listTenders(filters) } catch (err) { console.error("Tender search unavailable", err); error = true }
  }
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary">Discovery workspace</p><h1 className="mt-1 text-3xl font-bold">Tenders</h1><p className="mt-2 text-sm text-muted-foreground">{process.env.SOURCE_MODE === "direct" ? "Direct public-source mode. Only rows returned without CAPTCHA are shown." : "Search indexed Maharashtra procurement opportunities."}</p></div><p className="text-sm text-muted-foreground">{result.total} result{result.total === 1 ? "" : "s"}</p></div><form className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_180px_160px_auto]"><input name="q" defaultValue={filters.q || ""} placeholder="Search title, ID, organisation, district..." className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring" /><select name="status" defaultValue={filters.status || ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Any status</option><option value="live">Live</option><option value="closingSoon">Closing soon</option><option value="closed">Closed</option></select><select name="sort" defaultValue={filters.sort} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="newest">Newest</option><option value="closingSoon">Closing soon</option><option value="highestValue">Highest value</option><option value="lowestValue">Lowest value</option></select><button className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Apply filters</button></form><div className="mt-6">{error ? <EmptyState title="Official source could not be read" description="The portal may be unavailable or has required CAPTCHA/authenticated access. Open the official source to search manually." /> : result.items.length ? <div className="grid gap-4 lg:grid-cols-2">{result.items.map((tender) => <TenderCard key={tender.id} tender={tender} />)}</div> : <NoResultsState title={process.env.SOURCE_MODE === "direct" ? "The official public page returned no tender rows" : "Connect PostgreSQL or enable direct mode"} description={process.env.SOURCE_MODE === "direct" ? "Use the official portal link for CAPTCHA-backed search." : "Set SOURCE_MODE=direct and SOURCE_ENABLED=true to fetch public homepage rows."} />}</div></main></>
}