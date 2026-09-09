import { NextResponse } from "next/server"
import { listSavedTenders, listSavedTenderIds } from "@/lib/db/saved"
import { getUserId } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const userId = await getUserId()
    const { searchParams } = new URL(request.url)
    if (searchParams.get("ids") === "1") {
      const ids = await listSavedTenderIds(userId)
      return NextResponse.json({ ids })
    }
    const tenders = await listSavedTenders(userId)
    return NextResponse.json({ tenders })
  } catch (err) {
    console.log("[v0] GET saved error:", err.message)
    return NextResponse.json({ error: "Failed to load saved tenders." }, { status: 500 })
  }
}
