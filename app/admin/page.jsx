import { SiteHeader } from "@/components/layout/site-header"
import { Card } from "@/components/ui-kit"
import { EmptyState } from "@/components/states"
import { getLatestSync } from "@/lib/ingestion/tenderRepository"
import AdminSyncForm from "./sync-form"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  let logs = []
  let databaseReady = Boolean(process.env.DATABASE_URL)
  if (databaseReady) {
    try { logs = await getLatestSync() } catch (error) { databaseReady = false; console.error("Admin logs unavailable", error) }
  }
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-sm font-semibold text-primary">Operator console</p><h1 className="mt-1 text-3xl font-bold">Ingestion administration</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Run the isolated source adapter only after its selectors and access permissions have been verified. CAPTCHA and authenticated workflows are never automated.</p><div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]"><Card className="p-6"><h2 className="text-lg font-bold">Tender sync</h2><p className="mt-2 text-sm text-muted-foreground">The sync endpoint requires the server-side ADMIN_SYNC_TOKEN.</p><AdminSyncForm /><p className="mt-5 text-xs leading-5 text-muted-foreground">SOURCE_ENABLED is currently <strong>{process.env.SOURCE_ENABLED === "true" ? "enabled" : "disabled"}</strong>.</p></Card><Card className="p-6"><h2 className="text-lg font-bold">System logs</h2>{!databaseReady ? <div className="mt-5"><EmptyState title="PostgreSQL is not available" description="Configure DATABASE_URL and apply db/schema.sql to view sync history." /></div> : logs.length ? <div className="mt-5 space-y-3">{logs.map((log) => <div key={log.id} className="rounded-lg border border-border p-4 text-sm"><div className="flex items-center justify-between gap-4"><strong>{log.status}</strong><span className="text-xs text-muted-foreground">{new Date(log.startedAt).toLocaleString("en-IN")}</span></div><p className="mt-2 text-muted-foreground">{log.message || `${log.newTenders} new, ${log.updatedTenders} updated, ${log.failedRecords} failed`}</p></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">No sync runs recorded.</p>}</Card></div></main></>
}