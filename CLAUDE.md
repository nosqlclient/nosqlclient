# nosqlclient (fork)

Web MongoDB client. Fork of nosqlclient/nosqlclient (upstream inactive since 2023).
Remotes: `origin` = Nicramus/nosqlclient, `upstream` = nosqlclient/nosqlclient.

## Stack
- **Meteor 1.10.2** — bundles Node 12.16.1 and a dev MongoDB (app's internal DB). Installed in `~/.meteor` (on PATH via `~/.bashrc`).
- Client: **Blaze** templates + jQuery 2, Bootstrap 3, FlowRouter/BlazeLayout, tap:i18n, CodeMirror/ace/jsoneditor, DataTables. Vendored jQuery plugins in `client/plugins/` (don't edit unless necessary).
- Server: Meteor methods, `mongodb` driver **3.5.8** (callback API + `meteorhacks:async`/Fibers), tunnel-ssh 4.1.4, winston.
- Keep to the existing stack (Blaze + jQuery). Don't introduce React/other frameworks.

## Commands
Human-facing setup/run guide: `docs/DEVELOPMENT.md` (keep it in sync when commands change).
Always use `meteor npm` / `meteor node` (Node 12), never system npm (Node 20).
```bash
meteor run --settings settings.json      # dev server, http://localhost:3000
meteor npm run lint                      # eslint (airbnb), currently clean
meteor npm run test:server               # mocha server tests
meteor reset                             # wipe local app DB (.meteor/local)
```
Client tests (`test:client`) use chromedriver 2.40 + selenium — effectively dead.

Compatibility smoke test (app must be running, matrix started + seeded; results in `docs/compat-matrix.md`):
```bash
scripts/mongo-matrix.sh start
for p in 27042 27060 27070 27080; do mongosh "mongodb://admin:admin@localhost:$p/admin" --quiet scripts/compat-seed.js; done
mongosh "mongodb://localhost:27081/?replicaSet=rs0" --quiet scripts/compat-seed.js
node --experimental-websocket scripts/compat-matrix.mjs            # all instances; or: ... m80 m80rs
```
Meteor eagerly builds every non-`imports/` directory as app code. Dev tooling must live in `scripts/` (excluded via `.meteorignore` and `.eslintignore`) or it will crash the app.

## Architecture
Request flow: Blaze view → `client/imports/ui/<feature>` → `Communicator.call` (`client/imports/facades/communicator`, declares every method + default args) → Meteor method (`server/imports/methods/**`) → core (`server/imports/core/**`) → mongodb driver.
`Communicator.call` silently drops args whose key isn't declared in `this.methods[methodName]` or whose type differs from the default — new methods/args must be registered there first.

- `server/imports/core/mongodb/index.js` — `MongoClient.connect`, SSH tunnel, per-session `dbObjectsBySessionId`.
- `server/imports/core/connection/index.js` — connection model, URL parsing/building, options (auth, SSL, SSH).
- `server/imports/core/mongodb/{shell,backup,helper}.js` — spawns external binaries (`mongo` legacy shell, `mongodump/restore/export/import`); binary path from settings (`helper.js`).
- `server/imports/modules/{database,logger,error_handler}` — app DB access, logging, typed errors.
- `client/imports/views/pages/*` — page templates; `lib/imports/router.js` — routes; `lib/imports/collections.js` — shared collections.
- `client/imports/modules/*` — session manager, notifications, extended JSON, querying helpers, ui_components.
- `i18n/` — translations (tap:i18n).

## Known pain points (targets for the fork)
- Driver 3.5.8 → weak support for MongoDB 6/7/8, SRV/TLS/auth edge cases. Fix likely requires driver 4.x+ → Meteor 2.x upgrade.
- Shell page spawns legacy `mongo` binary (removed in MongoDB 6) → needs `mongosh`.
- Dockerfile on `debian:jessie` + Node 12 (EOL).
- UI/perf: large result sets rendered via DataTables/jsoneditor in-browser.

## Verification
No UI tests. Verify UI changes by running the app and driving it in the browser (claude-in-chrome). Test MongoDB servers (4.2/6/7/8/RS): `scripts/mongo-matrix.sh start`, details in `.claude/skills/mongo-matrix`.
