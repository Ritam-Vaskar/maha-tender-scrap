import { NextResponse } from "next/server"
import { runSync } from "@/lib/ingestion/runSync"
import { getLatestSync } from "@/lib/ingestion/tenderRepository"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request) {
  const expected = process.env.ADMIN_SYNC_TOKEN
  return Boolean(expected && request.headers.get("x-admin-token") === expected)
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Admin authorization required." }, { status: 401 })
  try {
    const logs = await getLatestSync()
    return NextResponse.json({ logs })
  } catch (err) {
    console.log("[v0] GET admin/sync error:", err.message)
    return NextResponse.json({ error: "Failed to load sync history." }, { status: 500 })
  }
}

export async function POST(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Admin authorization required." }, { status: 401 })
  try {
    const result = await runSync({ maxPages: 1 })
    const logs = await getLatestSync()
    return NextResponse.json({ result, logs })
  } catch (err) {
    console.log("[v0] POST admin/sync error:", err.message)
    return NextResponse.json({ error: "Sync failed to start." }, { status: 500 })
  }
}
