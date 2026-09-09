import { NextResponse } from "next/server"
import { listTenders } from "@/lib/db/tenders"
import { parseTenderFilters } from "@/lib/api/params"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = parseTenderFilters(searchParams)
    const result = await listTenders(filters)
    return NextResponse.json(result)
  } catch (err) {
    console.log("[v0] GET /api/tenders error:", err.message)
    return NextResponse.json({ error: "Failed to load tenders." }, { status: 500 })
  }
}
