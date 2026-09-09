import { getSql } from "./client"

// Notification architecture (in-app first).
//
// Notifications are generated from domain events: a tracked tender closing
// soon, a corrigendum being published, or a saved search matching a new
// tender. Email delivery can be layered on later behind the same repository.

export async function listNotifications(userId) {
  const sql = getSql()
  return sql.query(
    `SELECT id, type, title, body, tender_id AS "tenderId", read, created_at AS "createdAt"
     FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId],
  )
}

// Derives closing-soon notifications for a user's tracked tenders on the fly.
// This keeps the demo functional without a background worker while matching
// the eventual event-driven design.
export async function deriveClosingSoonNotifications(userId) {
  const sql = getSql()
  return sql.query(
    `SELECT t.id AS "tenderId", t.title, t.submission_end_at AS "submissionEndAt"
     FROM saved_tenders s JOIN tenders t ON t.id = s.tender_id
     WHERE s.user_id = $1 AND t.submission_end_at >= now()
       AND t.submission_end_at <= now() + interval '7 days'
     ORDER BY t.submission_end_at ASC`,
    [userId],
  )
}
