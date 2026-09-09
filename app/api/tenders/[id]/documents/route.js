import { NextResponse } from "next/server"
import { getTenderDocuments } from "@/lib/db/tenders"

export const dynamic = "force-dynamic"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const documents = await getTenderDocuments(id)
    return NextResponse.json({ documents })
  } catch (err) {
    console.log("[v0] GET documents error:", err.message)
    return NextResponse.json({ error: "Failed to load documents." }, { status: 500 })
  }
}
