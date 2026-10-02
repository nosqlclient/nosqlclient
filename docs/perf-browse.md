# Browse collection — slow load on big collections (2026-09-29)

## What the UI actually does
1. **Selecting a collection** (`client/imports/ui/collection/util.js` `getCollectionInformation`):
   - starts a ladda spinner on `#btnExecuteQuery` (button **disabled**) — `Notification.start`,
   - `count({})` → server `countDocuments` (`server/imports/methods/mongodb/collection.js`) = `aggregate [$match {}, $group $sum]` → **COLLSCAN of the whole collection**,
   - then `find({}, {limit: 50, skip: random(0..count)})` for autocomplete keys (`client/imports/modules/querying/index.js`) → **COLLSCAN up to `skip`**,
   - `stats` for the info panel.
2. **Execute** on FIND with an empty selector sends `{sort: {_id: -1}, limit: 50}` — LIMIT/SORT are preselected (`find.js`), limit input defaults to `50` (`limit.html`). This query itself is fast.
3. **No method calls `this.unblock()`**, so Meteor runs one client's methods strictly in order: Execute (and `stats`, which releases the spinner) waits behind the full-scan `count` and the `skip` sampling.

> Correction: an earlier version of this note measured `find` with no cursor options (whole collection, 26–52 MB). That is **not** the UI default — it only happens when the user removes the LIMIT option or sets limit 0/empty.

## Measurements (MongoDB 8.0, localhost, data in RAM)
| collection | count (COLLSCAN) | skip sampling | Execute alone | Execute right after select |
|---|---|---|---|---|
| 100k | 17–26 ms | 8–17 ms | 5–10 ms | — |
| 1M | 137–144 ms | 44–113 ms | 5–8 ms | **145–148 ms** (queued behind count) |

`$sample` of 50 docs: ~20 ms on 1M, independent of size. Scans grow linearly: at tens of millions of documents or data not in cache, selection costs seconds, and the Execute button stays disabled/queued for that long.
Without a limit (`cursorOptions: {}`): 10k → 0.3 s / 5 MB, 50k → 1.7 s / 26 MB, 100k → 3.6 s / 52 MB, app RSS grows to 1.2 GB.

## Design
Goal: selecting a collection and a default Execute never scan or fetch the whole collection; nothing that works today changes behaviour.

### 1. Autocomplete sampling without scans (main fix)
`Querying.getDistinctKeysForAutoComplete` (`client/imports/modules/querying/index.js`): replace `count` + `find(skip random)` with one call
`aggregate({ selectedCollection, pipeline: [{ $sample: { size: countToTake } }], options: {} })`.
- Keeps: `autoCompleteSamplesCount` setting (0 disables), `.chunks` skip, same `findKeysOfObject` on the result.
- `$sample` supported since 3.2; tested fast on 4.2 and 8.0, works on views, capped and small collections.
- Explicit **Count** query (`querying.js`) is untouched — it stays exact (`countDocuments`).

### 2. Don't block Execute while collection info loads
`getCollectionInformation` (`client/imports/ui/collection/util.js`): stop starting the spinner on `#btnExecuteQuery` (it disables the button); show loading in `#divCollectionInfo` instead. `Notification.stop()` stops *all* ladda spinners, so it must not be triggered by the info calls while a user query runs — call it only for the info spinner (ladda instance `.stop()`), not `stopAll`.

### 3. Read-only methods don't queue behind each other
Add `this.unblock()` to read-only methods: `find`, `findOne`, `count`, `aggregate`, `distinct`, `stats`, `dbStats`, `serverStatus`, `listCollectionNames`, `getDatabases`, `indexInformation`. Write methods stay ordered.
- Risk: a read overtaking an earlier write from the same client. UI issues reads after write callbacks, so ordering holds; re-check `save_editor.js` (save → refresh) during implementation.
- Mongo client per `sessionId` is a pooled `MongoClient`, safe for concurrent use.

### 4. Safety cap when LIMIT is missing (the "no filter fetches too much" guard)
In `getFindFinalObject(...).execute` (`client/imports/ui/querying/querying.js`), **only in the non-export branch**: if `cursorOptions.limit` is absent or empty, set it to a new setting `defaultFindLimit` (default 50) and show an info toast "limited to N; set LIMIT explicitly to change".
- Explicit numbers are respected; `limit 0` stays "no limit" (deliberate opt-in to fetch everything).
- Export CSV/JSON (`/export` route) unchanged — same options as today.
- Query history re-run goes through the same `execute`, so old history entries without limit also get the cap.
- `saveFindResult` diff works on fetched docs only (`save_editor.js`), so a cap can't cause deletions.
- The unused `maxAllowedFetchSize` setting: leave as is (out of scope).

### Out of scope (later)
Pagination (next/prev page with skip/limit), rendering cost of large result sets in jsoneditor.

## Verification plan
- `scripts/perf-find.mjs` extended with the UI sequence: select → Execute latency on perf100k/perf1m before/after (expect Execute ≈ 5–10 ms, no COLLSCAN in `mongod.log` slow queries).
- `scripts/compat-matrix.mjs` all instances — no regressions.
- Browser pass (claude-in-chrome): select collection → Execute enabled immediately; autocomplete keys present; Count query exact; export CSV unchanged; edit + save result; remove LIMIT → capped with toast; limit 0 → all docs.
- `meteor npm run lint`, `meteor npm run test:server` (+ existing client unit tests for querying if runnable).

## Implementation status (2026-09-30)
All four changes implemented (order 1 → 2 → 4 → 3):
1. `$sample` autocomplete sampling — `client/imports/modules/querying/index.js`.
2. Collection info no longer spins/disables `#btnExecuteQuery`; spinner in `#divCollectionInfo`, no `Notification.stop()` from info calls — `client/imports/ui/collection/util.js`.
4. `defaultFindLimit` (default 50, settings page field, server default) applied when LIMIT is missing/empty, with toast `find-limit-applied`; export untouched — `client/imports/ui/querying/querying.js`, `client/imports/ui/settings/index.js`, `settings.html`, `server/imports/core/settings/index.js`, `i18n/en.i18n.json`.
3. `this.unblock()` in read-only methods (`aggregate` only without `$out`/`$merge`) — `server/imports/methods/mongodb/{collection,admin,connectivity}.js`.

Results on perf1m (`scripts/perf-find.mjs m80 3 perf1m`):
| scenario | before | after |
|---|---|---|
| select collection | 183–273 ms (count COLLSCAN + skip) | 25–29 ms ($sample) |
| Execute right after select | 145–156 ms (queued) | 8 ms |
| Execute alone | 5–11 ms | 8–10 ms |

Regression checks: `compat-matrix.mjs` on all 5 instances — 674 cases, 0 differences vs baseline; write-then-read ordering 20/20; lint clean. Server test suite has 0 tests; client unit tests updated (`querying.tests.js`, `util.tests.js`) but can't run (chromedriver 2.40). UI not yet verified in a browser.

## Code review follow-up (2026-10-02)
`/code-review high` found regressions caused mainly by `this.unblock()` (Meteor's per-client queue used to serialize everything). Fixed:
1. Out-of-order responses when switching collections quickly: `stats` and `$sample` callbacks ignore results for a collection that is no longer selected (`util.js`, `modules/querying/index.js`).
2. Stats arriving after a fast Execute wiped the "execution time" row: panel updates go through `setCollectionInfoHtml`, which keeps `#executionTime`.
3. `dbStats` / `serverStatus` / `top` (polled every few seconds by the DB stats page) are blocking again, so the queue throttles them on a slow server.
4. Comments now say that a blocking call issued after a read (e.g. `disconnect`) can run while the read is in flight.
5. Default find limit is applied to a copy of the cursor options: query history keeps what the user wrote, and Explain runs uncapped.
6. `$out`/`$merge` detection uses key presence (`'$out' in stage`).
7. `profilingInfo` unblocked like the other reads.

Re-verified: compat matrix on all instances with no failures beyond the known ones; `scripts/check-ordering.mjs` 20/20; perf1m select 10 ms, Execute after select 11 ms; lint clean.
