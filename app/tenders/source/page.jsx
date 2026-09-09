import Link from "next/link"
import { ArrowLeft, ExternalLink, FileText, MapPin, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge, Button, Card } from "@/components/ui-kit"
import { EmptyState } from "@/components/states"
import { fetchPublicTenderDetail } from "@/lib/ingestion/sourceClient"
import { parseTenderDetail } from "@/lib/ingestion/tenderParser"

export const dynamic = "force-dynamic"

function field(label, value) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value || "Not specified in the public source page"}</p></div>
}

export default async function DirectTenderPage({ searchParams }) {
  const params = await searchParams
  const sourceUrl = typeof params?.url === "string" ? params.url : ""
  const sourceId = typeof params?.sourceId === "string" ? params.sourceId : ""
  let tender = null
  let error = null
  if (sourceUrl) {
    try { tender = parseTenderDetail(await fetchPublicTenderDetail(sourceUrl, sourceId)) } catch (caught) { error = caught.message }
  } else error = "No official tender URL was provided."
  return <><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><Link href="/tenders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to tenders</Link>{error ? <div className="mt-8"><EmptyState title="Official tender detail is unavailable" description={`${error} Open the official source directly to continue.`} action={sourceUrl ? <Button as="a" href={sourceUrl} target="_blank" rel="noreferrer">Open official source <ExternalLink className="h-4 w-4" /></Button> : null} /></div> : <><section className="mt-6 border-b border-border pb-8"><div className="flex flex-wrap items-center gap-2"><Badge variant="primary">Official public source</Badge><span className="text-xs text-muted-foreground">Not stored in PostgreSQL</span></div><h1 className="mt-4 text-3xl font-bold leading-tight">{tender.title || tender.sourceId || "Maharashtra government tender"}</h1><p className="mt-3 text-sm text-muted-foreground">This page is rendered by MahTender from the publicly accessible official portal response.</p><Button as="a" href={sourceUrl} target="_blank" rel="noreferrer" variant="outline" className="mt-5">Open official source <ExternalLink className="h-4 w-4" /></Button></section><div className="grid gap-6 py-8 lg:grid-cols-[1fr_300px]"><div className="space-y-6"><Card className="p-6"><h2 className="text-xl font-bold">Tender information</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{field("Tender ID", tender.sourceId)}{field("Reference number", tender.referenceNumber || tender.sourceId)}{field("Organisation / department", tender.organisation)}{field("Location", tender.location)}{field("Estimated value", tender.estimatedValue)}{field("EMD", tender.emd)}{field("Submission closes", tender.submissionEnd)}{field("Bid opening", tender.openingAt)}</div></Card><Card className="p-6"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><div><h2 className="font-bold">Source attribution</h2><p className="mt-1 text-sm text-muted-foreground">Maharashtra Government eProcurement Portal</p></div></div></Card></div><Card className="p-6"><h2 className="text-lg font-bold">Documents</h2>{tender.documents?.length ? <div className="mt-4 space-y-3">{tender.documents.map((document) => <a key={document.sourceUrl} href={new URL(document.sourceUrl, sourceUrl).toString()} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary"><FileText className="mt-0.5 h-4 w-4 text-primary" /><span className="text-sm font-medium">{document.name}</span></a>)}</div> : <p className="mt-4 text-sm leading-6 text-muted-foreground">No public documents were exposed in this response. CAPTCHA or authenticated documents must be opened on the official portal.</p>}</Card></div></>}</main></>
}