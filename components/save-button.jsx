"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui-kit"

export function SaveButton({ tenderId, initiallySaved = false }) {
  const [saved, setSaved] = useState(initiallySaved)
  const [busy, setBusy] = useState(false)
  async function toggle() {
    setBusy(true)
    try {
      const response = await fetch(`/api/tenders/${tenderId}/save`, { method: saved ? "DELETE" : "POST" })
      if (!response.ok) throw new Error("Save failed")
      setSaved(!saved)
    } finally { setBusy(false) }
  }
  return <Button variant={saved ? "secondary" : "outline"} disabled={busy} onClick={toggle}><Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />{saved ? "Saved" : "Save tender"}</Button>
}