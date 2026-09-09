import Link from "next/link"
import { ArrowRight, BarChart3, Compass, Search } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { Button, Card } from "@/components/ui-kit"
import { EmptyState } from "@/components/states"
import { TenderCard } from "@/components/tender-card"
import { getKpis, listTenders } from "@/lib/db/tenders"
import { listDistricts, listOrganisations } from "@/lib/db/reference"
import { fetchPublicHomePage } from "@/lib/ingestion/sourceClient"
import { parseListing } from "@/lib/ingestion/tenderParser"

export const dynamic = "force-dynamic"

async function getDashboard() {
  if (process.env.SOURCE_MODE === "direct" && process.env.SOURCE_ENABLED === "true") {
    try {
      const tenders = parseListing(await fetchPublicHomePage()).map((item, index) => ({ ...item, id: `source-${index}-${item.sourceId}`, isSourceDirect: true }))
      const now = Date.now()
      const closingSoon = tenders.filter((tender) => { const deadline = new Date(tender.submissionEndAt || "").getTime(); return Number.isFinite(deadline) && deadline >= now && deadline <= now + 7 * 86400000 }).length
      return { kpis: { newTenders: tenders.length, closingSoon, highValue: null, totalTenders: tenders.length }, tenders: tenders.slice(0, 4), districts: [], organisations: [], configured: true, direct: true }
    } catch (error) { console.error("Direct dashboard source unavailable", error) }
  }
  if (!process.env.DATABASE_URL) return { kpis: null, tenders: [], districts: [], organisations: [], configured: false }
  try {
    const [kpis, latest, districts, organisations] = await Promise.all([getKpis(), listTenders({ sort: "newest", pageSize: 4 }), listDistricts(), listOrganisations()])
    return { kpis, tenders: latest.items, districts: districts.slice(0, 12), organisations: organisations.slice(0, 6), configured: true }
  } catch (error) {
    console.error("Dashboard data unavailable", error)
    return { kpis: null, tenders: [], districts: [], organisations: [], configured: true }
  }
}

export default async function HomePage() {
  const data = await getDashboard()
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10 lg:py-14">
      <div className="relative max-w-3xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Independent tender intelligence</p><h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">Find the right government tenders faster.</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Search, monitor and analyze Maharashtra government procurement opportunities from one focused workspace.</p><form action="/tenders" className="mt-8 flex max-w-2xl flex-col gap-2 rounded-xl border border-border bg-background p-2 shadow-sm sm:flex-row"><Search className="m-3 hidden h-5 w-5 text-muted-foreground sm:block" /><input name="q" placeholder="Search titles, IDs, organisations or districts" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /><Button type="submit" size="lg"><Search className="h-4 w-4" />Search tenders</Button></form></div>
    </section>
    {!data.configured ? <div className="mt-8"><EmptyState title="Connect PostgreSQL or enable direct source mode" description="Set SOURCE_MODE=direct and SOURCE_ENABLED=true to show public homepage rows, or configure DATABASE_URL for the full indexed workspace." action={<Button as={Link} href="/tenders">Explore the search workspace</Button>} /></div> : null}
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["New tenders", data.kpis?.newTenders], ["Closing soon", data.kpis?.closingSoon], ["High value", data.kpis?.highValue], ["Total indexed", data.kpis?.totalTenders]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-bold">{value ?? "—"}</p><p className="mt-2 text-xs text-muted-foreground">Based on indexed records</p></Card>)}</section>
    <section className="mt-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Fresh from the index</p><h2 className="mt-1 text-2xl font-bold">Recently published</h2></div><Button as={Link} href="/tenders" variant="ghost">View all <ArrowRight className="h-4 w-4" /></Button></div>{data.tenders.length ? <div className="grid gap-4 lg:grid-cols-2">{data.tenders.map((tender) => <TenderCard key={tender.id} tender={tender} />)}</div> : <EmptyState title="No tender records yet" description="Once your ingestion worker writes records to PostgreSQL, the newest opportunities will appear here." />}</section>
    <section className="mt-12 grid gap-6 lg:grid-cols-3"><Card className="p-6 lg:col-span-2"><div className="flex items-start gap-4"><div className="rounded-lg bg-primary/10 p-3 text-primary"><Compass className="h-5 w-5" /></div><div><h2 className="text-xl font-bold">Browse by district</h2><p className="mt-1 text-sm text-muted-foreground">Explore where indexed opportunities are being published.</p></div></div>{data.districts.length ? <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">{data.districts.map((district) => <Link key={district.id} href={`/tenders?district=${encodeURIComponent(district.name)}`} className="rounded-lg border border-border px-3 py-3 text-sm transition-colors hover:border-primary hover:bg-primary/5"><span className="font-medium">{district.name}</span><span className="mt-1 block text-xs text-muted-foreground">{district.tenderCount} tenders</span></Link>)}</div> : <p className="mt-6 text-sm text-muted-foreground">District data will appear after the first successful sync.</p>}</Card><Card className="p-6"><div className="w-fit rounded-lg bg-warning/15 p-3 text-warning"><BarChart3 className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-bold">Procurement analytics</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Understand tender volume, value and deadline pressure using only your indexed records.</p><Button as={Link} href="/analytics" variant="outline" className="mt-6">Open analytics</Button></Card></section>
    <p className="mt-12 text-center text-xs leading-5 text-muted-foreground">MahTender is an independent discovery interface. Information is sourced from the official Maharashtra Government eProcurement Portal and is not an official government website.</p>
  </main></>
}