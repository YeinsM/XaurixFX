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

All request/response bodies are JSON except the empty logout response. Errors use `{ "message": "..." }`. Input schemas reject unknown properties and query parameters. No route accepts a client-supplied owner or balance. Successful user payloads contain only `{ id, name, email }`. No paging is needed: there is one account per registered user, live history is empty, and the public starter catalog is fixed at three courses and three illustrative analyses.

| Method and route | Access | Input / output |
|---|---|---|
| `GET /api/health` | Public | 200 `{status:"ok",database:"connected"}` after PostgreSQL query; 503 if unavailable |
| `POST /api/auth/register` | Public + origin | `{name,email,password}` → 201 `{user}` + session cookie. Name 2–100 characters, email trimmed/lowercased, password 12–128 characters. Duplicate normalized email: 409. |
| `POST /api/auth/login` | Public + origin | `{email,password}` → 200 `{user}` + rotated session cookie; invalid credentials: 401 |
| `GET /api/auth/me` | Session | `{user}`; missing/revoked/expired session: 401 |
| `POST /api/auth/logout` | Origin | Revokes current session, clears cookie, returns 204. Repeating logout is harmless. |
| `PATCH /api/profile` | Session + origin | `{name}` → `{user}` for the session owner; last successful update wins |
| `GET /api/dashboard` | Session | Account belonging to the session owner, `mode:"live"`, empty histories, disabled financial capabilities |
| `GET /api/demo/dashboard` | Public | Same dashboard shape, `mode:"demo"`, explicitly fictitious public fixture |
| `GET /api/content` | Public | `{courses,analyses}`; starter text lessons and clearly illustrative analysis, no video/media claims |
| `POST /api/deposits` | Session + origin | Always 503 with explanation; no instructions/address generated and no movement written |
| `POST /api/withdrawals` | Session + origin | Always 503 with explanation; no movement written |

Dashboard fields: `mode`, `user`, `account`, `performance`, `transactions`, `capabilities`. `account` contains `id`, `currency`, `balance`, `principal`, `profit`, `returnPercent`, `participationPercent`, `valuationAt`, `targetDate`, `status`. Monetary values and percentages are decimal strings; unavailable percentages/dates are null. Live accounts begin at zero with `pending_integration` status. `mode:"live"` means an actual registered user's stored account, not a live broker feed. No calculation or allocation policy is implemented. Numeric columns use exact `numeric(38,18)` placeholders so this foundation does not silently impose a two-decimal crypto policy; integration requires a reviewed currency/precision/ledger design.

## Identity and database integrity

Registration inserts the user, their unique account, and a session in one transaction. Email uniqueness is enforced in PostgreSQL after normalization. A unique `accounts.user_id` constraint prevents concurrent duplicate accounts. All account/profile lookups use session identity. Passwords use asynchronous scrypt with independent random 16-byte salts. Sessions use random 32-byte tokens; PostgreSQL stores SHA-256 digests, a seven-day expiration and revocation timestamps. Cookies are HttpOnly and SameSite=Strict. Authentication routes have per-IP rate limits; these in-memory limits assume a single instance and require a shared limiter before horizontal deployment. Reset, email verification, MFA, administration and financial actions are outside this starter's scope.

## Migrations and verification

`db:migrate` runs versioned SQL inside a transaction with an advisory lock. Applied SHA-256 checksums detect edited historical migrations. Run new forward migrations for later changes. This initial migration creates tables only; there is no automatic destructive down command. On a disposable database, recovery is deletion of only the owned test schema. On a database with user data, back up before migration and restore from a verified backup if necessary; do not drop production tables to roll back.

Integration tests require `TEST_DATABASE_URL` for a disposable PostgreSQL database and a role allowed to create schemas. They create a random `test_<uuid>` schema, use a pool scoped to that schema, and drop only that exact schema afterward. They never drop the public schema. Tests cover anonymous access, cross-account writes/reads, extra-property rejection, origin validation, concurrent normalized registration, the unique account constraint, forced transaction rollback, cookie settings, session expiration/rotation/revocation, brute-force throttling, migration idempotency/checksum validation, public catalog, and disabled financial actions. Unit tests verify salts, password checks and token digests.

Implementation references: [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), [Node crypto](https://nodejs.org/docs/latest-v22.x/api/crypto.html), [node-postgres transactions](https://node-postgres.com/features/transactions).
