import { FileSearch, Inbox, AlertTriangle, WifiOff, SearchX } from "lucide-react"
import { cn } from "@/lib/cn"

function Shell({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function EmptyState({ title = "Nothing here yet", description, action, className }) {
  return <Shell icon={Inbox} title={title} description={description} action={action} className={className} />
}

export function NoResultsState({ title = "No tenders match your filters.", description, action, className }) {
  return <Shell icon={SearchX} title={title} description={description} action={action} className={className} />
}

export function ErrorState({ title = "Unable to load tender information.", description, action, className }) {
  return <Shell icon={AlertTriangle} title={title} description={description} action={action} className={className} />
}

export function NotFoundState({ title = "Tender not found.", description, action, className }) {
  return <Shell icon={FileSearch} title={title} description={description} action={action} className={className} />
}

export function NetworkErrorState({ title = "Network error.", description = "Please check your connection and try again.", action, className }) {
  return <Shell icon={WifiOff} title={title} description={description} action={action} className={className} />
}
