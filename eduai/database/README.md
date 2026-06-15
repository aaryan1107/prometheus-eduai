# EduAI Database Plan

Right now the MVP stores important data in local server files:

- `eduai/server/data/sourceStore.json`: Library uploads, extracted text, chunks, comments.
- `eduai/server/data/studentStore.json`: imported roster and session end date.
- `eduai/server/data/assessmentPackages.js`: in-memory/prototype evaluation packages and audit arrays.
- Browser `localStorage`: only UI session role and theme.

That is fine for local testing, but it is not release storage. If the app is deployed to a normal host, JSON files can reset during redeploys, break with multiple users, and are hard to back up safely.

For release, use Postgres. Supabase is the best fit for this app because it gives:

- hosted Postgres for rosters, Library, Evaluation packages, Vault records, and audit logs
- Storage buckets for uploaded PDFs/images
- Auth and row-level security later
- optional vector search for Library chunks

Use `schema.sql` as the first production schema. The expected flow is:

1. Teacher imports roster into `roster_sessions` and `students`.
2. Teacher uploads Library material into `library_sources` and `source_chunks`.
3. Teacher creates an evaluation package in `evaluation_packages`.
4. Question paper, marking scheme, and answer script are linked in `evaluation_assets`.
5. Answer script is locked in `vault_records`.
6. Promi report is stored in `ai_evaluations`.
7. Every important action lands in `evaluation_audit_logs`.

Files themselves should live in object storage, not inside the database. Store the file URL/path in Postgres and store extracted text in Postgres for search and AI context.
