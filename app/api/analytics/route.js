import { NextResponse } from "next/server"
import { getAnalytics } from "@/lib/db/analytics"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const analytics = await getAnalytics()
    return NextResponse.json(analytics)
  } catch (err) {
    console.log("[v0] GET analytics error:", err.message)
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 })
  }
}
