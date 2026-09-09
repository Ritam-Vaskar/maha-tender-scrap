import { NextResponse } from "next/server"
import { listDistricts } from "@/lib/db/reference"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const districts = await listDistricts()
    return NextResponse.json({ districts })
  } catch (err) {
    console.log("[v0] GET districts error:", err.message)
    return NextResponse.json({ error: "Failed to load districts." }, { status: 500 })
  }
}
