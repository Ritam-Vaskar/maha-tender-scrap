import { SiteHeader } from "@/components/layout/site-header"
import { EmptyState } from "@/components/states"
import { TenderCard } from "@/components/tender-card"
import { listSavedTenders } from "@/lib/db/saved"
import { getUserId } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function SavedPage() {
  let tenders = []
  if (process.env.DATABASE_URL) { try { tenders = await listSavedTenders(await getUserId()) } catch (error) { console.error("Saved tenders unavailable", error) } }
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-sm font-semibold text-primary">Your workspace</p><h1 className="mt-1 text-3xl font-bold">Saved tenders</h1><p className="mt-2 text-sm text-muted-foreground">Keep opportunities close while your review is in progress.</p><div className="mt-8">{tenders.length ? <div className="grid gap-4 lg:grid-cols-2">{tenders.map((tender) => <TenderCard key={tender.id} tender={tender} />)}</div> : <EmptyState title="No saved tenders yet" description="Save a tender from its detail page and it will appear here." />}</div></main></>
}