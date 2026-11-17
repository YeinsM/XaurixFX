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

## Daily XAUUSD analysis

The backend fetches a current XAUUSD spot quote and closed 5m, 15m, 1h and 4h candles from GoldPrice.dev, calculates indicators and scenario risk/reward values, and asks Gemini for a structured, cited interpretation. Configure `GOLDPRICE_API_KEY` with GoldPrice.dev Pro intraday access, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL` (default: `gemini-4-hydrogen`). Keep provider keys only in the ignored `backend/.env`; the example file contains blank values.

The server process schedules the job for 08:00 `America/Santo_Domingo` (UTC−4). It must be running for the scheduled job; on startup after 08:00 it catches up only if that day's record is missing. PostgreSQL date locking and the unique date constraint prevent duplicate daily records. Transient provider failures are retried after 1, 5 and 15 minutes; a final failure is stored with status `failed`. Insufficient or stale market data is not presented as a current actionable setup.

The public **Análisis** page reads the latest history through `GET /api/analysis`; `limit` defaults to 10 and `before` is an inclusive `YYYY-MM-DD` cursor returned as `nextBefore`. `insufficient_data` and `failed` records do not contain a published report. The page is informational only: it does not execute trades or request a new report from the browser.

## Identity and database integrity

Registration inserts the user and a session in one transaction. Email uniqueness is enforced in PostgreSQL after normalization. The investor `accounts` table was removed (migration 002) after the pivot to a course-selling landing.

## Migrations and verification

`db:migrate` runs versioned SQL inside a transaction with an advisory lock. Applied SHA-256 checksums detect edited historical migrations. Run new forward migrations for later changes. This initial migration creates tables only; there is no automatic destructive down command. On a disposable database, recovery is deletion of only the owned test schema. On a database with user data, back up before migration and restore from a verified backup if necessary; do not drop production tables to roll back.

Integration tests require `TEST_DATABASE_URL` for a disposable PostgreSQL database and a role allowed to create schemas. They create a random `test_<uuid>` schema, use a pool scoped to that schema, and drop only that exact schema afterward. They never drop the public schema. Tests cover anonymous access, cross-account writes/reads, extra-property rejection, origin validation, concurrent normalized registration, the unique account constraint, forced transaction rollback, cookie settings, session expiration/rotation/revocation, brute-force throttling, migration idempotency/checksum validation, public catalog, and disabled financial actions. Unit tests verify salts, password checks and token digests.

Implementation references: [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), [Node crypto](https://nodejs.org/docs/latest-v22.x/api/crypto.html), [node-postgres transactions](https://node-postgres.com/features/transactions).
