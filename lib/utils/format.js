// Formatting helpers shared across the app. Pure functions, no side effects.

export function formatINR(value) {
  if (value === null || value === undefined || value === "") return "—"
  const n = Number(value)
  if (Number.isNaN(n)) return "—"
  if (n >= 10000000) {
    return `₹${trim(n / 10000000)} Cr`
  }
  if (n >= 100000) {
    return `₹${trim(n / 100000)} Lakh`
  }
  return `₹${n.toLocaleString("en-IN")}`
}

export function formatINRFull(value) {
  if (value === null || value === undefined || value === "") return "—"
  const n = Number(value)
  if (Number.isNaN(n)) return "—"
  return `₹${n.toLocaleString("en-IN")}`
}

function trim(n) {
  return n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")
}

export function formatDate(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function formatDateTime(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Returns a deadline descriptor based on the submission end date.
// levels: expired | red (<3d) | orange (3-7d) | green (>7d)
export function deadlineStatus(submissionEndAt) {
  if (!submissionEndAt) {
    return { level: "unknown", label: "No deadline", days: null }
  }
  const end = new Date(submissionEndAt).getTime()
  const now = Date.now()
  const diffMs = end - now
  if (diffMs <= 0) {
    return { level: "expired", label: "Closed", days: 0 }
  }
  const days = diffMs / (1000 * 60 * 60 * 24)
  const rounded = Math.ceil(days)
  let label
  if (rounded <= 1) {
    const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)))
    label = `${hours}h left`
  } else {
    label = `${rounded}d left`
  }
  let level = "green"
  if (days < 3) level = "red"
  else if (days <= 7) level = "orange"
  return { level, label, days: rounded }
}

export const DEADLINE_STYLES = {
  green: "bg-success/10 text-success border-success/20",
  orange: "bg-warning/10 text-warning border-warning/20",
  red: "bg-danger/10 text-danger border-danger/20",
  expired: "bg-muted text-muted-foreground border-border",
  unknown: "bg-muted text-muted-foreground border-border",
}
