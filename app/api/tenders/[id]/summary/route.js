import { NextResponse } from "next/server"
import { getTenderById } from "@/lib/db/tenders"
import { summarizeTender } from "@/lib/ai/summarizeTender"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const tender = await getTenderById(id)
    if (!tender) {
      return NextResponse.json({ error: "Tender not found." }, { status: 404 })
    }
    const summary = await summarizeTender(tender)
    return NextResponse.json({ summary })
  } catch (err) {
    console.log("[v0] POST summary error:", err.message)
    return NextResponse.json(
      {
        error:
          "AI summary is unavailable. This feature requires an AI service to be configured for the deployment.",
      },
      { status: 503 },
    )
  }
}
