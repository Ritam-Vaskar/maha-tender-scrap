import { NextResponse } from "next/server"
import { saveTender, unsaveTender } from "@/lib/db/saved"
import { ensureUserId } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const userId = await ensureUserId()
    let note = null
    try {
      const body = await request.json()
      note = typeof body?.note === "string" ? body.note.slice(0, 500) : null
    } catch {
      // no body is fine
    }
    await saveTender(userId, id, note)
    return NextResponse.json({ saved: true })
  } catch (err) {
    console.log("[v0] POST save error:", err.message)
    return NextResponse.json({ error: "Failed to save tender." }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const userId = await ensureUserId()
    await unsaveTender(userId, id)
    return NextResponse.json({ saved: false })
  } catch (err) {
    console.log("[v0] DELETE save error:", err.message)
    return NextResponse.json({ error: "Failed to remove tender." }, { status: 500 })
  }
}
