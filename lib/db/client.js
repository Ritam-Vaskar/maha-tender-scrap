import pg from "pg"

const { Pool } = pg
let pool = null

export function getSql() {
  if (pool) return pool
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured")
  }
  const useSsl = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
  pool = new Pool({
    connectionString: url,
    max: Number(process.env.DB_POOL_MAX || 10),
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  })
  return {
    query: async (text, params) => {
      try {
        return (await pool.query(text, params)).rows
      } catch (error) {
        const detail = error.code === "ECONNREFUSED"
          ? "PostgreSQL refused the connection. Start PostgreSQL and verify DATABASE_URL in .env."
          : error.message
        throw new Error(`Database query failed: ${detail}`)
      }
    },
  }
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}
