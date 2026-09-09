import { NextResponse } from "next/server"
import { getTenderById } from "@/lib/db/tenders"

export const dynamic = "force-dynamic"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const tender = await getTenderById(id)
    if (!tender) {
      return NextResponse.json({ error: "Tender not found." }, { status: 404 })
    }
    return NextResponse.json({ tender })
  } catch (err) {
    console.log("[v0] GET /api/tenders/[id] error:", err.message)
    return NextResponse.json({ error: "Failed to load tender." }, { status: 500 })
  }
}
