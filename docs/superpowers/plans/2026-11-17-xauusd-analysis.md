# Daily XAUUSD Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public Analysis page backed by a daily XAUUSD report using closed GoldPrice.dev bars, deterministic indicator/R:B calculations, Gemini, and PostgreSQL persistence.

**Architecture:** A backend domain service fetches the GoldPrice.dev spot quote and closed 5m/15m/1h/4h bars, computes indicators, obtains calendar citations through Gemini Search Grounding, and validates a structured Gemini report. A PostgreSQL-backed daily job runs at 08:00 `America/Santo_Domingo`; Fastify exposes read-only history, and React renders the report and its states.

**Tech Stack:** Existing TypeScript, Fastify 5, `pg`, PostgreSQL, React 19/Vite/Vitest; `@google/genai` for Gemini, `node-cron` for the in-process schedule, `react-markdown` + `remark-gfm` for safe report rendering.

---

## Codebase map

### Backend

- `backend/src/app.ts`: Fastify route registration and API error handling; add the read-only analysis route without placing the scheduler in request setup.
- `backend/src/config.ts`: environment loading; add optional Gemini/GoldPrice credentials and `GEMINI_MODEL`, without logging secret values or failing the whole API when a key is absent.
- `backend/src/server.ts`: production process wiring and shutdown hooks; start and stop the scheduler here.
- `backend/src/schemas.ts`: strict query validation; add `limit` and inclusive ISO `before`.
- `backend/src/analysis/types.ts`: typed provider bars, indicators, report/scenario JSON, and persisted record contracts.
- `backend/src/analysis/indicators.ts`: EMA, Wilder RSI, and Momentum calculations.
- `backend/src/analysis/scenarios.ts`: validate scenario prices and calculate distances/R:B.
- `backend/src/analysis/marketData.ts`: timeout-bounded GoldPrice.dev HTTP client and response validation.
- `backend/src/analysis/prompt.ts`, `backend/src/analysis/gemini.ts`: prompt and Gemini grounding/structured-output adapters.
- `backend/src/analysis/service.ts`, `backend/src/analysis/scheduler.ts`: daily orchestration, idempotency, retries and schedule.
- `backend/src/analysisRepository.ts`: parameterized persistence and paginated public reads.
- `backend/migrations/003_market_analyses.sql`: unique daily report table and indexes.
- `backend/test/analysis.test.ts`: isolated unit tests with injected fetch/Gemini/clock dependencies.
- `backend/test/integration.test.ts`: migration, uniqueness and API integration against its disposable PostgreSQL schema.
- `backend/package.json`, root `package-lock.json`: test script and explicit runtime dependencies.
- `backend/.env.example`, `backend/README.md`: variable and API/job documentation; never edit `backend/.env`.

### Frontend and product docs

- `frontend/src/types.ts`, `frontend/src/App.tsx`, `frontend/src/components/SiteHeader.tsx`: page type, rendering, navigation and title.
- `frontend/src/components/AnalysisPage.tsx`: paginated fetch and loading/error/empty/report states.
- `frontend/src/components/AnalysisContent.tsx`: safe Markdown plus structured scenario/comparison tables.
- `frontend/src/components/AnalysisContent.test.tsx`: render and untrusted-markup regression checks using `react-dom/server`.
- `frontend/src/styles.css`: dark/gold desktop/mobile layout and contained table overflow.
- `frontend/package.json`, root `package-lock.json`: safe Markdown dependencies.
- `docs/project.md`, `docs/work.md`: record the approved requirement and observed test evidence.

## Task 1: Indicator and scenario math

**Files:**
- Create: `backend/src/analysis/types.ts`
- Create: `backend/src/analysis/indicators.ts`
- Create: `backend/src/analysis/scenarios.ts`
- Create: `backend/test/analysis.test.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Write indicator and scenario tests**

Add these cases to `backend/test/analysis.test.ts` using `node:test` and
`node:assert/strict`, and add that file to the explicit backend `test` script in
`backend/package.json` before running it:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEma, calculateMomentum, calculateRsi } from '../src/analysis/indicators.js';
import { calculateScenarioMetrics, validateScenario } from '../src/analysis/scenarios.js';

test('EMA seeds with a period SMA, then uses alpha 2/(period+1)', () => {
  assert.deepEqual(calculateEma([10, 11, 12, 13], 3), [null, null, 11, 12]);
});

test('Momentum 14 uses close/close[-14] times 100', () => {
  assert.equal(calculateMomentum([100, ...Array(13).fill(100), 110], 14), 110);
});

test('scenario metrics use the midpoint of an entry range', () => {
  const metrics = calculateScenarioMetrics({
    direction: 'buy', entryLow: 2000, entryHigh: 2002, stopLoss: 1996,
    takeProfits: [2010, 2014, 2018],
  });
  assert.equal(metrics.entryReference, 2001);
  assert.equal(metrics.risk, 5);
  assert.deepEqual(metrics.rewardRisk, [1.8, 2.6, 3.4]);
});

test('scenario direction must place stop and targets on valid sides', () => {
  assert.equal(validateScenario({
    direction: 'buy', entryLow: 2000, entryHigh: 2002, stopLoss: 2003,
    takeProfits: [2010, 2014, 2018],
  }).valid, false);
});

test('RSI returns null until enough closes exist and handles flat closes', () => {
  assert.ok(calculateRsi(Array(15).fill(100), 14).every(value => value === null || value === 50));
});
```

- [ ] **Step 2: Run the unit suite and confirm it fails**

Run: `npm test --workspace @xaurix/backend`
Expected: FAIL because the analysis modules do not exist.

- [ ] **Step 3: Implement typed values and calculations**

In `types.ts`, define these shared types before adding consumers:

```ts
export type MarketInterval = '5m' | '15m' | '1h' | '4h';
export type AnalysisStatus = 'published' | 'insufficient_data' | 'failed';
export type Direction = 'buy' | 'sell';

export interface MarketBar {
  barStart: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string | null;
  isClosed: boolean;
}

export interface TimeframeBars {
  interval: MarketInterval;
  bars: MarketBar[];
}

export interface MarketSnapshot {
  symbol: 'XAU-USD-SPOT';
  spot: { price: string; isStale: boolean; computedAt: string; source: string };
  bars: TimeframeBars[];
}

export interface ScenarioPrices {
  direction: Direction;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  takeProfits: [number, number, number];
}
```

Define `calculateEma(values: number[], period: number): Array<number | null>` with a
simple-moving-average seed at `period - 1`, then `alpha = 2 / (period + 1)`. Define
`calculateRsi(values: number[], period = 14): Array<number | null>` using Wilder's
smoothed average gains/losses; return `null` until there are `period` changes, return
50 when both averages are zero and 100 when loss is zero but gain is positive. Define
`calculateMomentum(values: number[], period = 14): number | null` as
`values.at(-1)! / values.at(-(period + 1))! * 100`, returning `null` for insufficient
closes or a zero denominator. Reject non-finite prices and periods below 1.

`validateScenario` must reject non-finite/missing values, reversed entry ranges, zero
risk, and stops/targets on the wrong side for `buy`/`sell`. `calculateScenarioMetrics`
uses the entry midpoint, returns absolute risk/reward distances and ratios rounded only
when serialized for display (not during calculation). Mark each target that is below
1:2; do not discard it, because the requested report must state when the criterion fails.

- [ ] **Step 4: Run focused unit tests**

Run: `npm test --workspace @xaurix/backend`
Expected: PASS for EMA seeding, Wilder RSI, Momentum formula, invalid scenarios and
midpoint-based distances/R:B.

- [ ] **Step 5: Commit the calculations**

Commit only these files:

```powershell
git add backend/src/analysis/types.ts backend/src/analysis/indicators.ts backend/src/analysis/scenarios.ts backend/test/analysis.test.ts backend/package.json
git commit -m "feat: add analysis calculations" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: GoldPrice.dev market data adapter

**Files:**
- Create: `backend/src/analysis/marketData.ts`
- Modify: `backend/src/config.ts`
- Modify: `backend/test/analysis.test.ts`
- Modify: `backend/.env.example`

- [ ] **Step 1: Add failing provider/config tests**

Use an injected `fetch` function; never call GoldPrice.dev from tests. Cover the five
requests (spot with `include=sources`, plus four bar intervals), Bearer key header,
decimal strings, `is_closed=false` exclusion, stale spot, malformed JSON, HTTP 403,
429, timeout and missing key. Assert all requests use symbol `XAU-USD-SPOT`, and query
intervals `5m`, `15m`, `1h`, `4h`. Assert errors do not include a fake key such as
`test-secret-not-for-logs`.

```ts
test('market data requests only XAU-USD-SPOT and retains closed bars', async () => {
  const urls: URL[] = [];
  const client = createMarketDataClient({
    apiKey: 'test-secret-not-for-logs',
    fetch: async input => {
      const url = new URL(String(input));
      urls.push(url);
      if (url.pathname === '/v1/prices') {
        return new Response(JSON.stringify({
          symbols: [{
            symbol: 'XAU', quote_currency: 'USD', unit: 'troy_ounce',
            contract_type: 'spot', price: '2000.00', is_stale: false,
            computed_at: '2026-11-17T12:00:00Z', sources: [],
          }],
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      const interval = url.searchParams.get('interval')!;
      return new Response(JSON.stringify({
        symbol: 'XAU-USD-SPOT', interval, next_cursor: null,
        meta: { tier: 'pro_2026', count: 2, source_id: 'test' },
        bars: [
          { bar_start: '2026-11-17T11:50:00Z', open: '1999', high: '2001', low: '1998', close: '2000', volume: null, is_closed: true },
          { bar_start: '2026-11-17T11:55:00Z', open: '2000', high: '2002', low: '1999', close: '2001', volume: null, is_closed: false },
        ],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  const snapshot = await client.fetchSnapshot(new Date('2026-11-17T12:00:00Z'));
  assert.deepEqual(snapshot.bars.map(({ interval }) => interval), ['5m', '15m', '1h', '4h']);
  assert.ok(snapshot.bars.every(({ bars }) => bars.every(bar => bar.isClosed)));
  assert.ok(urls.every(url => url.searchParams.get('symbol') === 'XAU-USD-SPOT'));
});
```

- [ ] **Step 2: Run the unit suite and verify it fails**

Run: `npm test --workspace @xaurix/backend`
Expected: FAIL because `createMarketDataClient` is not implemented.

- [ ] **Step 3: Implement the adapter and configuration**

Use `https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT&include=sources` and, for
each interval,
`/v1/bars?symbol=XAU-USD-SPOT&interval=<interval>&from=<run-time-minus-90-days>&to=<run-time>&limit=250`.
Follow `next_cursor` until 250 closed bars are available or the provider exhausts the
requested range. Use `AbortSignal.timeout(10_000)`. Parse HTTP status and JSON shape
before creating domain types; preserve exact decimal strings until indicator input conversion. Return
`is_stale`, `computed_at`, source metadata, interval and UTC timestamps. Never infer
spot volume; `null` remains null. Treat 403/429, timeouts, invalid payloads and an
absent key as explicit errors; do not return empty success-shaped snapshots.

Extend `readConfig()` with optional `goldPriceApiKey`, optional `geminiApiKey`, and
`geminiModel` defaulting to `gemini-4-hydrogen`. Add only blank names to
`backend/.env.example`; do not open or modify `backend/.env`. This adapter uses Node's
existing `fetch`, so it adds no dependency.

- [ ] **Step 4: Run focused provider/config tests**

Run: `npm test --workspace @xaurix/backend`
Expected: PASS, including plan denial, stale data and secret-redaction cases.

- [ ] **Step 5: Commit the adapter**

Run `npm test --workspace @xaurix/backend`, then commit the adapter, config, tests and
example env:

```powershell
git add backend/src/analysis/marketData.ts backend/src/config.ts backend/test/analysis.test.ts backend/.env.example
git commit -m "feat: add GoldPrice market data adapter" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 3: Gemini grounding and structured report generation

**Files:**
- Create: `backend/src/analysis/prompt.ts`
- Create: `backend/src/analysis/gemini.ts`
- Modify: `backend/src/analysis/types.ts`
- Modify: `backend/test/analysis.test.ts`
- Modify: `backend/package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write Gemini adapter tests**

Inject a fake Gemini client and test two distinct requests: first, Search Grounding
collects economic-calendar events and retains citation URL/title metadata; second,
analysis receives only the GoldPrice bars, deterministic indicators and calendar
results, with no search tool enabled. Test malformed structured JSON, missing required
fields, unsafe HTML text and provider errors. Empty calendar citations must produce an
explicit “no se pudo consultar” calendar result and still permit technical analysis;
they must never create unsourced events. Assert the prompt contains the three exact
Spanish section names and explicitly prohibits unclosed bars and invented levels.

- [ ] **Step 2: Run Gemini tests and confirm they fail**

Run: `npm test --workspace @xaurix/backend`
Expected: FAIL because the Gemini adapter and report schema are absent.

- [ ] **Step 3: Implement the schema and prompt**

Define `AnalysisReport` as three text sections plus two scenario objects containing
direction, conditions, M15 zone, M5 confirmation, entry low/high or null, stop, three
targets, cancellation, management, validity, invalidation and rationale. Keep distances
and R:B out of model-authoritative fields; Task 1 calculations generate them.

Copy the approved prompt from
`docs/superpowers/specs/2026-11-17-xauusd-analysis-design.md` into `prompt.ts`, and
include the input packet schema. Use `@google/genai` with model `gemini-4-hydrogen`.
Add `@google/genai` to `backend/package.json` and run `npm install` from the repository
root to update `package-lock.json`.
Call `interactions.create` with `tools: [{ type: 'google_search' }]` only for the
calendar request; pass its text and URL citations to a second call with JSON response
schema and no tools. Validate the returned JSON with explicit type guards. Fail on
truncated/invalid JSON; never parse from a success-shaped fallback. Apply 30-second
timeouts and never log prompts, key values, full provider bodies or raw model output.

- [ ] **Step 4: Run Gemini tests**

Run: `npm test --workspace @xaurix/backend`
Expected: PASS; tests use injected responses and make no external API requests.

- [ ] **Step 5: Commit the Gemini adapter**

Run `npm test --workspace @xaurix/backend`, then commit prompt, schema, client, tests and
lockfile:

```powershell
git add backend/src/analysis/prompt.ts backend/src/analysis/gemini.ts backend/src/analysis/types.ts backend/test/analysis.test.ts backend/package.json package-lock.json
git commit -m "feat: add grounded Gemini analysis" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 4: Database persistence and public read API

**Files:**
- Create: `backend/migrations/003_market_analyses.sql`
- Create: `backend/src/analysisRepository.ts`
- Modify: `backend/src/schemas.ts`
- Modify: `backend/src/app.ts`
- Modify: `backend/test/integration.test.ts`

- [ ] **Step 1: Write failing PostgreSQL/API tests**

Extend `backend/test/integration.test.ts` to insert one report per date, reject a second
row for the same date, return descending results, honor `limit`/inclusive `before`,
reject invalid query parameters, and return no model/API credentials. Test
`published`, `insufficient_data` and `failed` records. Seed rows through repository
functions, not hand-built JSON in route code.

- [ ] **Step 2: Run integration tests and confirm failure**

Run: `npm run test:integration --workspace @xaurix/backend`
Expected: FAIL on the absent migration/repository/API. The command requires the
disposable `TEST_DATABASE_URL` already documented by the backend.

- [ ] **Step 3: Add the migration and repository**

Create `market_analyses` with `analysis_date date PRIMARY KEY`, a checked status,
nullable JSONB `report`, JSONB `sources`, source/reference timestamps, generated time,
model, prompt version, sanitized error code, and created/updated timestamps. Add an
index supporting descending date reads. Do not store credentials or raw candle arrays.
Use parameterized SQL for insert/update/list. Query with
`analysis_date <= $before ORDER BY analysis_date DESC LIMIT $limitPlusOne`; validate
`limit` in the API schema (integer 1–30, default 10) and `before` as `YYYY-MM-DD`.

- [ ] **Step 4: Add the route and validate integration**

Register `GET /api/analysis` in `app.ts` after existing public content routes. Return
`{ analyses, nextBefore }`, where the repository fetches `limit + 1`, returns only the
requested number, and sets `nextBefore` to one calendar day before the oldest returned
date only when an extra row exists. This keeps the `before` filter inclusive without
repeating the prior page's oldest report. Include report content only for `published`;
keep status and safe metadata for other states. Add no generate/mutate route. Return a
standard 400 for bad query values and explicit 503 for a database read failure.

Run: `npm run test:integration --workspace @xaurix/backend`
Expected: PASS, including migration checksum/idempotency tests and the new table/routes.

- [ ] **Step 5: Commit persistence and API**

Commit only migration, repository, schema, route and integration tests:

```powershell
git add backend/migrations/003_market_analyses.sql backend/src/analysisRepository.ts backend/src/schemas.ts backend/src/app.ts backend/test/integration.test.ts
git commit -m "feat: persist and expose daily analyses" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 5: Daily orchestration and scheduler

**Files:**
- Create: `backend/src/analysis/service.ts`
- Create: `backend/src/analysis/scheduler.ts`
- Modify: `backend/src/server.ts`
- Modify: `backend/test/analysis.test.ts`
- Modify: `backend/package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write failing job and schedule tests**

Inject the quote client, Gemini adapter, repository, clock, logger and cron factory.
Test one normal run, missing keys, stale spot, missing/short timeframe, 403, one
transient failure followed by success, exhausted retries, duplicate same-date invocation,
and scheduler stop on server close. Verify incomplete inputs persist
`insufficient_data` and never call the technical report generation function.

```ts
const snapshotMissingM5: MarketSnapshot = {
  symbol: 'XAU-USD-SPOT',
  spot: { price: '2000', isStale: false, computedAt: '2026-11-17T12:00:00Z', source: 'GoldPrice.dev' },
  bars: (['15m', '1h', '4h'] as const).map(interval => ({ interval, bars: [] })),
};

test('incomplete bars persist insufficient_data without asking Gemini for levels', async () => {
  let generateReportCalls = 0;
  const repository = {
    withDateLock: async <T>(_date: string, operation: () => Promise<T>) => operation(),
    findByDate: async () => undefined,
    save: async (_record: { status: string }) => {},
  };
  const result = await runDailyAnalysis({
    date: '2026-11-17',
    marketData: snapshotMissingM5,
    generateReport: async () => { generateReportCalls++; throw new Error('must not run'); },
    repository,
  });
  assert.equal(result.status, 'insufficient_data');
  assert.equal(generateReportCalls, 0);
});
```

- [ ] **Step 2: Run job tests and confirm they fail**

Run: `npm test --workspace @xaurix/backend`
Expected: FAIL because `runDailyAnalysis` and the scheduler do not exist.

- [ ] **Step 3: Implement idempotent daily orchestration**

`runDailyAnalysis` gets the Dominican local date, takes a PostgreSQL advisory lock, and
checks the unique report row before doing external work. Fetch provider data, require
all four intervals and at least 200 closed H4 bars, calculate indicators, fetch
calendar citations, generate/validate the report, calculate scenario metrics and persist.
A stale spot or inadequate bars persists `insufficient_data` without invoking the
analysis model or emitting entry levels. Missing configuration persists `failed` with
a sanitized error code. Retry transient provider/model errors three times with
1/5/15-minute backoff; preserve `failed` on exhaustion. Always release the lock in
`finally`.

Define the repository boundary as
`withDateLock<T>(date: string, operation: () => Promise<T>): Promise<T>`,
`findByDate(date: string): Promise<AnalysisRecord | undefined>` and
`save(record: AnalysisRecord): Promise<void>`. Define `runDailyAnalysis(date, deps)`
to receive the market client, calendar/report generators, repository and clock; this
keeps all external dependencies fakeable in tests.

Use `node-cron.schedule('0 8 * * *', callback, { timezone: 'America/Santo_Domingo' })`.
At startup call an idempotent catch-up check for today's date; do not execute twice if
the 08:00 cron already claimed it. Return a `stop()` function and invoke it during
Fastify shutdown. The worker runs only in `server.ts`, never in `buildApp()` or tests.
Add `node-cron` to `backend/package.json` and run `npm install` from the repository root
to update `package-lock.json`.

- [ ] **Step 4: Run job tests and backend build**

Run: `npm test --workspace @xaurix/backend`
Expected: PASS, with no external API calls.

Run: `npm run build --workspace @xaurix/backend`
Expected: TypeScript build succeeds.

- [ ] **Step 5: Commit daily job**

Run `npm test --workspace @xaurix/backend` and
`npm run test:integration --workspace @xaurix/backend`, then commit scheduler, service,
wiring, tests, dependency manifest and lockfile:

```powershell
git add backend/src/analysis/service.ts backend/src/analysis/scheduler.ts backend/src/server.ts backend/test/analysis.test.ts backend/package.json package-lock.json
git commit -m "feat: schedule daily XAUUSD analysis" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 6: Analysis page and navigation

**Files:**
- Create: `frontend/src/components/AnalysisPage.tsx`
- Create: `frontend/src/components/AnalysisContent.tsx`
- Create: `frontend/src/components/AnalysisContent.test.tsx`
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/SiteHeader.tsx`
- Modify: `frontend/src/styles.css`
- Modify: `frontend/package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add render tests for report and safe Markdown**

Use Vitest and `renderToStaticMarkup` from `react-dom/server`. Test report headings,
source and Dominican timestamps, citations rendered as external links with
`rel="noopener noreferrer"`, comparison table content, and untrusted `<script>` text
not becoming an executable element. Test loading, empty, `insufficient_data` and API
error message branches through a pure `AnalysisContent` view component.

- [ ] **Step 2: Run frontend test and confirm failure**

Run: `npm test --workspace @xaurix/frontend`
Expected: FAIL because the components and `analysis` page type do not exist.

- [ ] **Step 3: Implement report types, page and navigation**

Add `'analysis'` to `Page`, the `pages` set and title map; add the `AnalysisPage` render
branch and `SiteHeader` label/link. `AnalysisPage` calls the existing `api` helper with
`/analysis?limit=10`; a “Cargar anteriores” button requests the next `before` page and
appends results without duplicates. Do not request report generation from the browser.

Render Markdown with `react-markdown` and `remark-gfm`; do not enable raw HTML or
unsafe URL transforms. Render the structured scenarios and backend-calculated
comparison table using React elements. Show clear loading, empty, stale/error,
insufficient-data and published states. Add `react-markdown` and `remark-gfm` to the
frontend manifest, then run `npm install` from repository root.

- [ ] **Step 4: Style and verify the page**

Add `.an-*` rules to `styles.css` using existing `--gold`, `--muted`, `--border` and
`--panel` variables. Keep the report width readable, source/citation metadata visible,
and comparison tables within `.an-table-scroll { max-width: 100%; overflow-x: auto; }`.
At the existing mobile breakpoint, use a single-column report and retain keyboard focus
styles. Do not create a second visual theme.

Run: `npm test --workspace @xaurix/frontend`
Expected: PASS for the report, table, links and safe rendering.

Run: `npm run build --workspace @xaurix/frontend`
Expected: TypeScript and Vite build succeed.

- [ ] **Step 5: Commit frontend**

Commit page, components, navigation, tests, styles, manifest and lockfile:

```powershell
git add frontend/src/components/AnalysisPage.tsx frontend/src/components/AnalysisContent.tsx frontend/src/components/AnalysisContent.test.tsx frontend/src/types.ts frontend/src/App.tsx frontend/src/components/SiteHeader.tsx frontend/src/styles.css frontend/package.json package-lock.json
git commit -m "feat: add daily analysis page" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 7: Documentation and end-to-end verification

**Files:**
- Modify: `backend/README.md`
- Modify: `backend/.env.example`
- Modify: `docs/project.md`
- Modify: `docs/work.md`

- [ ] **Step 1: Document the runtime contract**

Document `GEMINI_API_KEY`, `GOLDPRICE_API_KEY`, optional `GEMINI_MODEL`,
`GET /api/analysis` query/response behavior, the Pro intraday requirement, 08:00
Dominican timezone, process-uptime limitation, retry/failure states and the fact that
the page is informational. State that keys belong only in the ignored backend `.env`;
do not include real values.

- [ ] **Step 2: Run all unit tests and builds**

Run: `npm test`
Expected: backend `node:test` and frontend Vitest suites pass.

Run: `npm run build`
Expected: backend TypeScript and frontend TypeScript/Vite builds pass.

- [ ] **Step 3: Run PostgreSQL integration tests**

Run: `npm run test:integration`
Expected: migration and analysis API tests pass against the configured disposable
`TEST_DATABASE_URL`; no public schema is dropped.

- [ ] **Step 4: Verify the browser and schedule behavior**

With the existing local PostgreSQL and backend/frontend dev scripts, check:

- `GET /api/analysis` returns the latest status and cursor metadata.
- The navigation opens **Análisis**, and the latest report displays source, timestamps,
  citations and the generated comparison table.
- Loading, no-report, error and insufficient-data states remain understandable.
- At 390 px and desktop width, no document-level horizontal overflow is introduced;
  only the comparison table scrolls horizontally.
- The automated scheduler tests prove 07:59:59 has not run, 08:00 runs once, and restart
  after 08:00 catches up only if the date has no stored record.

Do not invoke live Gemini/GoldPrice calls as part of the test suite. A real-key smoke
test, if needed, is a separately run manual check and must not print keys or full prompts.

- [ ] **Step 5: Update evidence and commit documentation**

Update the affected row in `docs/work.md` with implementation state and actual test
evidence; update `docs/project.md` only with the newly confirmed Analysis requirement.
Do not register speculative bugs. Commit documentation:

```powershell
git add backend/README.md backend/.env.example docs/project.md docs/work.md
git commit -m "docs: document daily XAUUSD analysis" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Plan self-review

- **Spec coverage:** source/candle integrity and 4 timeframes (Tasks 2–3); formulas and
  R:B (Task 1); citations and structured output (Task 3); persistence/API (Task 4);
  daily schedule, retry, lock and catch-up (Task 5); public page, navigation and mobile
  states (Task 6); environment, product docs and verification (Task 7).
- **Placeholder scan:** all tasks name exact paths, commands, expected outcomes and
  injected dependencies. No step requires a live external provider for automated tests.
- **Type consistency:** Task 1 defines `MarketInterval`, `MarketBar`, `MarketSnapshot`,
  `AnalysisStatus` and scenario math types. Task 3 adds `AnalysisReport`; Task 4 adds the
  persisted `AnalysisRecord`. Provider, generator, repository, scheduler and UI then
  consume those same contracts.
- **Scope:** no trading execution, manual trigger, data-provider substitution, hosting
  decision, or unrelated refactor is included.
