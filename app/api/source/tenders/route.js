import { NextResponse } from "next/server"
import { fetchPublicHomePage } from "@/lib/ingestion/sourceClient"
import { parseListing } from "@/lib/ingestion/tenderParser"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const html = await fetchPublicHomePage()
    const items = parseListing(html).map((item, index) => ({ ...item, id: `source-${index}-${item.sourceId}`, isSourceDirect: true }))
    return NextResponse.json({ items, total: items.length, sourceUrl: process.env.SOURCE_BASE_URL, direct: true })
  } catch (error) {
    console.error("Direct source fetch failed", error)
    return NextResponse.json({ items: [], total: 0, direct: true, sourceUrl: process.env.SOURCE_BASE_URL, error: error.message }, { status: 502 })
  }
}