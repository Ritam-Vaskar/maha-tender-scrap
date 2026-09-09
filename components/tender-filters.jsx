"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function TenderFilters({ initialQuery = "", initialStatus = "" }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const firstQuery = useRef(true)

  function apply(nextQuery = query, nextStatus = status) {
    const params = new URLSearchParams(searchParams.toString())
    nextQuery.trim() ? params.set("q", nextQuery.trim()) : params.delete("q")
    nextStatus ? params.set("status", nextStatus) : params.delete("status")
    params.delete("page")
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  useEffect(() => {
    if (firstQuery.current) {
      firstQuery.current = false
      return undefined
    }
    const timer = setTimeout(() => apply(), 400)
    return () => clearTimeout(timer)
  }, [query])

  function submit(event) {
    event.preventDefault()
    apply()
  }

  return <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_200px]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, ID, organisation, district..." className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring" aria-label="Search tenders" /></label><select name="status" value={status} onChange={(event) => { setStatus(event.target.value); apply(query, event.target.value) }} className="h-10 rounded-md border border-input bg-background px-3 text-sm" aria-label="Filter by tender status"><option value="">Any status</option><option value="live">Live</option><option value="closingSoon">Closing soon</option><option value="closed">Closed</option></select>{isPending ? <span className="text-xs text-muted-foreground md:col-span-2">Updating results...</span> : null}</form>
}
