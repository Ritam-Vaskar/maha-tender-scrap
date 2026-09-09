import { cookies } from "next/headers"

// Modular session layer.
//
// Authentication is intentionally kept behind this single helper so a real
// provider (Auth.js / NextAuth, Better Auth, etc.) can be dropped in later
// without changing any callers. Today it issues an anonymous, cookie-scoped
// identity so features like saved tenders and saved searches work end-to-end.
// Every user-scoped query filters by this id.

const COOKIE = "mt_uid"
const ADMIN_COOKIE = "mt_admin"

export async function getUserId() {
  const store = await cookies()
  const existing = store.get(COOKIE)?.value
  if (existing) return existing
  // Fallback identity for read paths where we cannot set a cookie.
  return "guest"
}

// Use in Route Handlers / Server Actions where a stable id should be persisted.
export async function ensureUserId() {
  const store = await cookies()
  const existing = store.get(COOKIE)?.value
  if (existing) return existing
  const id = `u_${crypto.randomUUID()}`
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return id
}

export async function isAdmin() {
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === "1"
}
