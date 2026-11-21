# XaurixFX API

Node.js 22.14+, TypeScript, Fastify 5 and PostgreSQL through `pg`. No ORM or financial integration. Start from the repository root with `npm install`, then copy `backend/.env.example` to `backend/.env` and configure your own local PostgreSQL credentials. Do not commit `.env`.

```powershell
npm run db:migrate --workspace @xaurix/backend
npm run dev --workspace @xaurix/backend
npm run build --workspace @xaurix/backend
npm run start --workspace @xaurix/backend
npm test --workspace @xaurix/backend
npm run test:integration --workspace @xaurix/backend
```

Default listen address: `127.0.0.1:4000`. `FRONTEND_ORIGIN` defaults to `http://localhost:5173` (`APP_ORIGIN` is accepted as an alias). Unsafe requests require that exact `Origin`, including requests made by command-line clients. Configure an HTTPS origin with `NODE_ENV=production`; that enables a Secure, host-only session cookie. Do not enable proxy trust without defining the proxy boundary and reviewing rate limiting.

## API contract

All request/response bodies are JSON except the empty logout response. Errors use `{ "message": "..." }`. Input schemas reject unknown properties and query parameters. No route accepts a client-supplied owner or balance. Successful user payloads contain only `{ id, name, email }`. The public starter catalog is fixed at three courses.

| Method and route | Access | Input / output |
|---|---|---|
| `GET /api/health` | Public | 200 `{status:"ok",database:"connected"}` after PostgreSQL query; 503 if unavailable |
| `POST /api/auth/register` | Public + origin | `{name,email,password}` → 201 `{user}` + session cookie. Name 2–100 characters, email trimmed/lowercased, password 12–128 characters. Duplicate normalized email: 409. |
| `POST /api/auth/login` | Public + origin | `{email,password}` → 200 `{user}` + rotated session cookie; invalid credentials: 401 |
| `GET /api/auth/me` | Session | `{user}`; missing/revoked/expired session: 401 |
| `POST /api/auth/logout` | Origin | Revokes current session, clears cookie, returns 204. Repeating logout is harmless. |
| `PATCH /api/profile` | Session + origin | `{name}` → `{user}` for the session owner; last successful update wins |
| `GET /api/content` | Public | `{courses}`; starter text lessons, no video/media claims |
| `GET /api/analysis` | Public | `?limit=1..30&before=YYYY-MM-DD` → `{analyses,nextBefore}`; newest first, with an inclusive date cursor. Reads stored records only; it does not trigger generation. |
| `POST /api/analysis/generate` | Admin session + Origin | Same as `analysis:publish` for today's date (paid Gemini call); 5/hour. Admins: explicit existing account IDs in comma-separated `ANALYSIS_ADMIN_USER_IDS` in `backend/.env`; no default admin and no email-based grants. 401 without session, 403 if not admin, 502 if Gemini fails. `GET /api/auth/me` returns `canGenerateAnalysis`. |
| `GET /api/analysis/:date/images/:scenario` | Public | Scenario image (`A`/`B`) generated after the report: prompt 2 (A), then prompt 3 (B), model `GEMINI_IMAGE_MODEL` (default `gemini-3-pro-image`, Nano Banana Pro: precise text rendering; 16:9, 2K). Bytes stored through `ImageStore` (local `ANALYSIS_IMAGE_DIR`, default `storage/analysis-images`, git-ignored; swap for a cloud implementation in `src/analysis/imageStore.ts`). Listing includes `images[]`. |

## Daily XAUUSD analysis

The backend sends the complete Spanish XAUUSD prompt to Gemini in one `models.generateContent` request, with Google Search available. Only `GEMINI_API_KEY` is required for generation; `GEMINI_MODEL` is optional (default: `gemini-4-hydrogen`). Keys stay in the ignored `backend/.env`. No GoldPrice subscription, candle count, indicator computation or response JSON schema blocks the request.

The response text is persisted unchanged as `report.rawText` and rendered as safe Markdown. Provider errors are displayed with credentials redacted. The application does not replace the model's answer or validate its trading levels. Market data availability remains a limitation Gemini must explain in its answer.

On startup the backend applies pending versioned migrations before starting the analysis scheduler. Migration 004 allows publishing without an external price; existing structured reports remain readable. If PostgreSQL is unavailable, the API remains available and shows a connection or migration diagnostic. You can also run `npm run db:migrate` explicitly.

The server schedules generation at 08:00 `America/Santo_Domingo` (UTC−4), with a catch-up on startup after 08:00. Any existing published report for that date is reused, even after a prompt update. Failed report records can be retried on the next run; the same daily row is updated under the date lock. There are no application-level delayed retries.

To test the actual prompt without starting the server or connecting to PostgreSQL, run from the repository root:

```powershell
npm run analysis:check -w backend
```

It loads the backend environment, uses `GEMINI_API_KEY` and `GEMINI_MODEL`, prints Google's answer and source links, and returns a nonzero exit code on failure. It does not store a report. Standard successful generation uses one request; the SDK may retry transient HTTP 408/429/500/502/503/504 once (1–2 second backoff), but never retries authentication or permission errors. Each request has a 120-second timeout. No base URL override is used; the SDK sends the API key in the official header using `v1beta`.

To generate and **publish** a report for the public page, run:

```powershell
npm run analysis:publish -w backend
```

This command checks PostgreSQL and applies migrations before calling Gemini, saves the result under the Dominican date, and prints the same report. It reuses a successful current-version report already stored for today. Unlike `analysis:check`, it writes to the history read by the page. Then click **Actualizar análisis** on the Analysis page. A 401 from `/api/auth/me` for a signed-out visitor is expected and does not restrict this public endpoint. A 503 from `/api/analysis` reports the database/schema failure; it is separate from Gemini authentication.

Google Search source links and the Search Suggestions HTML returned in `groundingMetadata` are retained alongside the unchanged text. The UI displays the HTML in an isolated iframe without scripts or same-origin access. Partial responses are shown with their finish reason rather than discarded. Empty responses include Google's block/finish reason, and connection errors preserve the underlying DNS/transport cause with credentials removed.

Reviewed official references:
- [SDK request syntax and Google Search](https://aistudio.google.com/docs/google-search?generate-content=true)
- [API key setup](https://aistudio.google.com/docs/api-key)
- [Supported interfaces](https://aistudio.google.com/docs/interactions-overview)
- [Troubleshooting](https://aistudio.google.com/docs/troubleshooting)
- [HTTP options and retries](https://googleapis.github.io/js-genai/release_docs/interfaces/types.HttpOptions.html)

The public **Análisis** page reads stored history through `GET /api/analysis`; `limit` defaults to 10 and `before` is an inclusive date cursor. Reading history does not make paid requests to Gemini. The server must be running for the daily schedule; it does not execute trades.

## Identity and database integrity

Registration inserts the user and a session in one transaction. Email uniqueness is enforced in PostgreSQL after normalization. The investor `accounts` table was removed (migration 002) after the pivot to a course-selling landing.

## Migrations and verification

`db:migrate` runs versioned SQL inside a transaction with an advisory lock. Applied SHA-256 checksums detect edited historical migrations. Run new forward migrations for later changes. This initial migration creates tables only; there is no automatic destructive down command. On a disposable database, recovery is deletion of only the owned test schema. On a database with user data, back up before migration and restore from a verified backup if necessary; do not drop production tables to roll back.

Integration tests require `TEST_DATABASE_URL` for a disposable PostgreSQL database and a role allowed to create schemas. They create a random `test_<uuid>` schema, use a pool scoped to that schema, and drop only that exact schema afterward. They never drop the public schema. Tests cover anonymous access, cross-account writes/reads, extra-property rejection, origin validation, concurrent normalized registration, the unique account constraint, forced transaction rollback, cookie settings, session expiration/rotation/revocation, brute-force throttling, migration idempotency/checksum validation, public catalog, and disabled financial actions. Unit tests verify salts, password checks and token digests.

Implementation references: [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), [Node crypto](https://nodejs.org/docs/latest-v22.x/api/crypto.html), [node-postgres transactions](https://node-postgres.com/features/transactions).

## Schedule and manual generation permissions

- Cron is `0 8 * * *`, with timezone `America/Santo_Domingo` (08:00 RD = 12:00 UTC), every day. It runs inside the backend process; the backend and PostgreSQL must stay available. Startup after 08:00 catches up today's report; this is not an external persistent scheduler.
- Public history, pagination, images and **Actualizar análisis** only read stored data. Only **Generar análisis de hoy** invokes the protected POST route; it is displayed after the backend confirms permission for the current account.
- Set `ANALYSIS_ADMIN_USER_IDS` to the exact `user.id` of existing authorized accounts, comma-separated, then restart the backend. Leave it empty to disable manual generation for everyone. The signed-in account can obtain its own ID from `GET /api/auth/me`; never grant by unverified email or registration order. `ANALYSIS_ADMIN_EMAILS` no longer grants permissions.
- The POST route requires a valid session, exact Origin and an allowlisted account ID; client role/userId flags confer no access. It is limited to five requests per hour. Concurrent admin requests share an in-process promise, and database date locks serialize scheduled/manual publication.
- Published reports are never regenerated just for a new prompt version. Image generation has its own database date lock; both ready and failed scenario attempts are reused to avoid charging again on clicks or restarts. Retrying a failed image is deliberately not exposed in this interface.
- Operators with filesystem/environment access can still run the CLI; it is not exposed to website visitors. `analysis:check` intentionally calls Gemini for diagnostics and should not be used for routine history refreshes.

Validation uses fake providers and controlled transport, with no live Gemini consumption. Tests cover anonymous/non-admin/forged access, Origin, concurrent clicks, stored report reuse, image attempt reuse, cron time and overlap. Cross-process database behavior and a continuously running deployment remain operational checks.
