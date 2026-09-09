import Link from "next/link"
import { ArrowUpRight, Clock3, MapPin } from "lucide-react"
import { Badge, Card, SampleTag } from "@/components/ui-kit"

function formatValue(value) {
  if (!value) return "Value not specified"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function deadline(tender) {
  if (!tender.submissionEndAt) return { label: "Deadline not specified", tone: "default" }
  const deadlineAt = new Date(tender.submissionEndAt).getTime()
  if (Number.isNaN(deadlineAt)) return { label: "Deadline unavailable", tone: "default" }
  const days = Math.ceil((deadlineAt - Date.now()) / 86400000)
  if (days < 0) return { label: "Closed", tone: "closed" }
  if (days < 3) return { label: `${days || 1} days left`, tone: "urgent" }
  if (days <= 7) return { label: `${days} days left`, tone: "soon" }
  return { label: `${days} days left`, tone: "open" }
}

export function TenderCard({ tender }) {
  const due = deadline(tender)
  const destination = tender.isSourceDirect ? `/tenders/source?url=${encodeURIComponent(tender.sourceUrl)}&sourceId=${encodeURIComponent(tender.sourceId || tender.referenceNumber || "")}` : `/tenders/${tender.id}`
  return (
    <Card className="group flex flex-col gap-5 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{tender.organisationShortName || tender.organisationName || "Organisation not specified"}</span>
            {tender.isSample ? <SampleTag /> : null}
            {tender.isPreview ? <Badge variant="outline" title="Repeated source row for UI scale testing">UI preview {tender.previewCopy}</Badge> : null}
          </div>
          <Link href={destination} className="line-clamp-2 font-display text-lg font-bold leading-snug hover:text-primary">
            {tender.title}
          </Link>
        </div>
        <Link href={destination} aria-label={`View ${tender.title}`} className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div><span className="text-muted-foreground">Tender ID</span><p className="mt-1 truncate font-medium">{tender.sourceId || "Not specified"}</p></div>
        <div><span className="text-muted-foreground">Estimated value</span><p className="mt-1 font-display font-bold">{formatValue(tender.estimatedValue)}</p></div>
        <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><span>{[tender.location, tender.districtName].filter(Boolean).join(", ") || "Location not specified"}</span></div>
        <div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><span>{tender.submissionEndAt ? new Date(tender.submissionEndAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Deadline not specified"}</span></div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Badge variant={due.tone === "urgent" ? "outline" : due.tone === "soon" ? "accent" : due.tone === "open" ? "primary" : "default"} className={due.tone === "urgent" ? "border-danger/30 text-danger" : ""}>{due.label}</Badge>
        <span className="text-xs text-muted-foreground">{tender.category || "General procurement"}</span>
      </div>
    </Card>
  )
}

export { formatValue }