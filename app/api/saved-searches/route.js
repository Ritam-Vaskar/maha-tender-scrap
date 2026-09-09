import { NextResponse } from "next/server"
import { listSavedSearches, createSavedSearch, deleteSavedSearch } from "@/lib/db/saved"
import { getUserId, ensureUserId } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await getUserId()
    const searches = await listSavedSearches(userId)
    return NextResponse.json({ searches })
  } catch (err) {
    console.log("[v0] GET saved-searches error:", err.message)
    return NextResponse.json({ error: "Failed to load saved searches." }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await ensureUserId()
    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : ""
    if (!name) {
      return NextResponse.json({ error: "A name is required." }, { status: 400 })
    }
    const query = typeof body?.query === "string" ? body.query.slice(0, 200) : null
    const filters = body?.filters && typeof body.filters === "object" ? body.filters : null
    const search = await createSavedSearch(userId, name, query, filters)
    return NextResponse.json({ search }, { status: 201 })
  } catch (err) {
    console.log("[v0] POST saved-searches error:", err.message)
    return NextResponse.json({ error: "Failed to create saved search." }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const userId = await ensureUserId()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })
    await deleteSavedSearch(userId, id)
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.log("[v0] DELETE saved-searches error:", err.message)
    return NextResponse.json({ error: "Failed to delete saved search." }, { status: 500 })
  }
}
