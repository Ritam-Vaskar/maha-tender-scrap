import { NextResponse } from "next/server"
import { getTenderCorrigendums } from "@/lib/db/tenders"

export const dynamic = "force-dynamic"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const corrigendums = await getTenderCorrigendums(id)
    return NextResponse.json({ corrigendums })
  } catch (err) {
    console.log("[v0] GET corrigendums error:", err.message)
    return NextResponse.json({ error: "Failed to load corrigendums." }, { status: 500 })
  }
}
