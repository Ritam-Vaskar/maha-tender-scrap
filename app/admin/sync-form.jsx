"use client"

import { useState } from "react"
import { Button } from "@/components/ui-kit"

export default function AdminSyncForm() {
  const [token, setToken] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  async function run() {
    setBusy(true); setMessage("")
    try {
      const response = await fetch("/api/admin/sync", { method: "POST", headers: { "x-admin-token": token } })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Sync failed")
      setMessage(body.result?.message || `Sync finished: ${body.result?.newTenders || 0} new records.`)
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  return <div className="mt-5 space-y-3"><label className="block text-sm font-medium">Admin token<input type="password" value={token} onChange={(event) => setToken(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="Enter ADMIN_SYNC_TOKEN" /></label><Button type="button" disabled={!token || busy} onClick={run}>{busy ? "Running sync..." : "Run sync"}</Button>{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}</div>
}