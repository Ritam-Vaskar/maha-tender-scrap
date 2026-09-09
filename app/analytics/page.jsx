import { SiteHeader } from "@/components/layout/site-header"
import { Card } from "@/components/ui-kit"
import { EmptyState } from "@/components/states"
import { getAnalytics } from "@/lib/db/analytics"
import { fetchPublicHomePage } from "@/lib/ingestion/sourceClient"
import { parseListing } from "@/lib/ingestion/tenderParser"
import { AnalyticsCharts } from "@/components/analytics-charts"

export const dynamic = "force-dynamic"

async function getDirectAnalytics() {
  const tenders = parseListing(await fetchPublicHomePage())
  const now = Date.now()
  const deadlineRows = [
    ["Closed", (item) => new Date(item.submissionEndAt || "").getTime() < now],
    ["Within 3 days", (item) => { const date = new Date(item.submissionEndAt || "").getTime(); return date >= now && date <= now + 3 * 86400000 }],
    ["3–7 days", (item) => { const date = new Date(item.submissionEndAt || "").getTime(); return date > now + 3 * 86400000 && date <= now + 7 * 86400000 }],
    ["7–30 days", (item) => { const date = new Date(item.submissionEndAt || "").getTime(); return date > now + 7 * 86400000 && date <= now + 30 * 86400000 }],
  ].map(([name, matches]) => ({ name, count: tenders.filter(matches).length })).filter((row) => row.count)
  const statusRows = [
    ["Closed", (item) => new Date(item.submissionEndAt || "").getTime() < now],
    ["Closing soon", (item) => { const date = new Date(item.submissionEndAt || "").getTime(); return date >= now && date <= now + 7 * 86400000 }],
    ["Live", (item) => new Date(item.submissionEndAt || "").getTime() > now + 7 * 86400000],
  ].map(([name, matches]) => ({ name, count: tenders.filter(matches).length })).filter((row) => row.count)
  return { totals: { totalTenders: tenders.length, totalValue: null, avgValue: null }, byDistrict: [], byOrganisation: [], byCategory: [], valueDistribution: [], closingDistribution: deadlineRows, byStatus: statusRows }
}

export default async function AnalyticsPage() {
  let data = null
  if (process.env.SOURCE_MODE === "direct" && process.env.SOURCE_ENABLED === "true") { try { data = await getDirectAnalytics() } catch (error) { console.error("Direct analytics unavailable", error) } } else if (process.env.DATABASE_URL) { try { data = await getAnalytics() } catch (error) { console.error("Analytics unavailable", error) } }
  const directMode = process.env.SOURCE_MODE === "direct"
  const formatMoney = (value) => value === null || value === undefined ? "Not available" : `₹${Math.round(value).toLocaleString("en-IN")}`
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-sm font-semibold text-primary">{directMode ? "Public source snapshot" : "Evidence from your index"}</p><h1 className="mt-1 text-3xl font-bold">Analytics</h1><p className="mt-2 text-sm text-muted-foreground">{directMode ? "Calculated from the public Latest Tenders rows currently returned by the official portal." : "Aggregates are calculated from indexed tender records only."}</p>{data ? <><section className="mt-8 grid gap-4 sm:grid-cols-3"><Card className="p-5"><p className="text-sm text-muted-foreground">Public tenders</p><p className="mt-2 text-3xl font-bold">{data.totals.totalTenders}</p></Card><Card className="p-5"><p className="text-sm text-muted-foreground">Total estimated value</p><p className="mt-2 text-xl font-bold">{formatMoney(data.totals.totalValue)}</p></Card><Card className="p-5"><p className="text-sm text-muted-foreground">Average tender value</p><p className="mt-2 text-xl font-bold">{formatMoney(data.totals.avgValue)}</p></Card></section><AnalyticsCharts closingDistribution={data.closingDistribution} byDistrict={data.byDistrict} byOrganisation={data.byOrganisation} byStatus={data.byStatus} /></> : <div className="mt-8"><EmptyState title="Analytics are unavailable" description="The official source did not respond, or PostgreSQL is not configured." /></div>}</main></>
}