CREATE TABLE IF NOT EXISTS organisations (id serial PRIMARY KEY, name text NOT NULL UNIQUE, short_name text, type text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS departments (id serial PRIMARY KEY, name text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS districts (id serial PRIMARY KEY, name text NOT NULL UNIQUE, region text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, email text UNIQUE, name text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS tenders (
  id serial PRIMARY KEY, source_id text NOT NULL UNIQUE, title text NOT NULL, reference_number text,
  organisation_id integer REFERENCES organisations(id), department_id integer REFERENCES departments(id), district_id integer REFERENCES districts(id),
  location text, category text, product_category text, form_of_contract text, tender_type text, estimated_value numeric, emd numeric, tender_fee numeric,
  published_at timestamptz, document_start_at timestamptz, submission_start_at timestamptz, submission_end_at timestamptz, opening_at timestamptz,
  status text NOT NULL DEFAULT 'live', description text, eligibility text, source_url text NOT NULL, is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenders_published_idx ON tenders (published_at DESC);
CREATE INDEX IF NOT EXISTS tenders_deadline_idx ON tenders (submission_end_at);
CREATE INDEX IF NOT EXISTS tenders_source_idx ON tenders (source_id);
CREATE TABLE IF NOT EXISTS tender_documents (id serial PRIMARY KEY, tender_id integer NOT NULL REFERENCES tenders(id) ON DELETE CASCADE, name text NOT NULL, document_type text, source_url text NOT NULL, mime_type text, file_size integer, preview_available boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS corrigendums (id serial PRIMARY KEY, tender_id integer NOT NULL REFERENCES tenders(id) ON DELETE CASCADE, title text NOT NULL, description text, published_at timestamptz, source_url text NOT NULL);
CREATE TABLE IF NOT EXISTS saved_tenders (id serial PRIMARY KEY, user_id text NOT NULL, tender_id integer NOT NULL REFERENCES tenders(id) ON DELETE CASCADE, note text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, tender_id));
CREATE TABLE IF NOT EXISTS saved_searches (id serial PRIMARY KEY, user_id text NOT NULL, name text NOT NULL, query text, filters jsonb NOT NULL DEFAULT '{}'::jsonb, last_matched_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS tender_views (id serial PRIMARY KEY, tender_id integer NOT NULL REFERENCES tenders(id) ON DELETE CASCADE, user_id text, viewed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS notifications (id serial PRIMARY KEY, user_id text NOT NULL, type text NOT NULL, title text NOT NULL, message text, tender_id integer REFERENCES tenders(id) ON DELETE CASCADE, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sync_logs (id serial PRIMARY KEY, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, status text NOT NULL DEFAULT 'running', new_tenders integer NOT NULL DEFAULT 0, updated_tenders integer NOT NULL DEFAULT 0, failed_records integer NOT NULL DEFAULT 0, documents_discovered integer NOT NULL DEFAULT 0, message text);