import { NextResponse } from "next/server"
import { listOrganisations } from "@/lib/db/reference"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const organisations = await listOrganisations()
    return NextResponse.json({ organisations })
  } catch (err) {
    console.log("[v0] GET organisations error:", err.message)
    return NextResponse.json({ error: "Failed to load organisations." }, { status: 500 })
  }
}
