# MahTender

MahTender is an independent tender discovery interface for Maharashtra government procurement data. It is not an official Government of Maharashtra website. The application reads indexed records from PostgreSQL and links users back to the official Maharashtra eProcurement portal for source documents and any CAPTCHA or authenticated workflow.

## Requirements

- Node.js 20+
- PostgreSQL 14+ locally, or a Render PostgreSQL database
- A verified, permitted source adapter before enabling ingestion

## Local setup

```powershell
Copy-Item .env.example .env.local
npm install
```

Create a local database named `mahatender`, then set `DATABASE_URL` in `.env.local`.

Apply the schema and seed one clearly marked development record:

```powershell
psql "$env:DATABASE_URL" -f db/schema.sql
npm run db:seed
```

The seed record is labelled `Sample` in the UI and must not be treated as official data.

Start the app:

```powershell
npm run dev
```

If the dashboard reports PostgreSQL `ECONNREFUSED`, PostgreSQL is not running at the host/port in `DATABASE_URL`; start the local service, then run `npm run db:schema` and `npm run db:seed`.

Open `http://localhost:3000`.

## Environment variables

See `.env.example`. `DATABASE_URL` is the only required value for database-backed features. `SOURCE_ENABLED` defaults to false. Keep it false until the selectors in `lib/ingestion/tenderParser.js` have been tested against the official portal and the collection is legally and technically permitted. `ADMIN_SYNC_TOKEN` protects the sync history and trigger route; send it as the `x-admin-token` header.

## Ingestion

The intended flow is:

`official portal -> sourceClient -> tenderParser -> tenderNormalizer -> tenderRepository -> PostgreSQL -> Next.js API`

The frontend never scrapes the source. The adapter is rate-limited, retry-aware, deduplicates on `sourceId`, and records sync outcomes in `sync_logs`. It does not solve or bypass CAPTCHA, authentication, or other access controls. Run a configured sync with:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/admin/sync -Headers @{ "x-admin-token" = $env:ADMIN_SYNC_TOKEN }
```

The official Maharashtra active-tender listing currently requires CAPTCHA before it returns tender rows. The adapter detects that response and records a failed/skipped sync with an explicit message; it does not attempt to bypass the CAPTCHA. This means live active-tender ingestion cannot be honestly enabled until the portal offers an authorised machine-readable feed or you supply records through an approved integration. The homepage and any future public, non-CAPTCHA table can still be parsed by the isolated adapter.

To inspect the source without touching PostgreSQL, run `npm run source:probe`. It reports the HTTP status, response size, whether CAPTCHA was detected, and whether parseable rows were actually returned.

## AI summaries and documents

AI summarization is optional and must be configured with `AI_API_KEY`. Missing fields are represented as unavailable rather than invented. Documents are never proxied through an access-control workaround: public source URLs can be opened directly, while protected or unavailable documents show an official-source fallback.

## Render deployment

1. Create a Render PostgreSQL database and attach it to the web service as `DATABASE_URL`. Do not commit the connection string. Render provides the value through the service environment.
2. Set `DB_SSL=true` on Render. The application uses PostgreSQL SSL with certificate verification disabled, as required by many managed PostgreSQL providers.
3. Set `SOURCE_ENABLED=false` until the source adapter is verified.
4. Set a long random `ADMIN_SYNC_TOKEN` and any optional AI configuration.
5. Build with `npm install && npm run build` and start with `npm start`.
6. Apply `db/schema.sql` once against the Render database, then run the sync endpoint from a protected job or operator tool.

The `pg` pool works with standard local PostgreSQL and Render PostgreSQL. Production SSL is enabled by the application client.

## Quality checks

```powershell
npm run build
npm run lint
```

The application renders useful empty states when PostgreSQL is not configured or contains no records.