# Local development

Tested on Ubuntu 24.04. Nothing is installed system-wide; no sudo needed.

## One-time setup
```bash
# 1. Meteor 1.10.2 (bundles Node 12 and its own MongoDB for the app's internal data)
curl -s "https://install.meteor.com/?release=1.10.2" | sh     # the final sudo step may fail — that's fine
echo 'export PATH="$HOME/.meteor:$PATH"' >> ~/.bashrc && source ~/.bashrc

# 2. Dependencies — always through meteor (Node 12), never system npm
cd nosqlclient-fork
meteor npm ci
```
Optional, for testing against several MongoDB versions: `mongosh` on PATH and the test servers from `scripts/mongo-matrix.sh` (binaries for 6.0/7.0/8.0 go to `~/.local/share/mongo-matrix/`, see `.claude/skills/mongo-matrix/SKILL.md` for download steps; 4.2 is Meteor's bundled mongod).

## Run the app
```bash
meteor run --settings settings.json
```
Open http://localhost:3000. Code changes reload automatically (client refresh / server restart).
- The app's own data (saved connections, settings, query history) lives in `.meteor/local/db`, served by Meteor's mongod on port **3001**. Wipe it with `meteor reset` (app stopped).
- Port busy: `meteor run --settings settings.json --port 3100`.
- Stop: Ctrl+C.

## Test MongoDB servers (optional)
```bash
scripts/mongo-matrix.sh start      # 4.2 :27042, 6.0 :27060, 7.0 :27070, 8.0 :27080 (admin/admin), 8.0 replica set :27081
scripts/mongo-matrix.sh status
scripts/mongo-matrix.sh stop
```
They run as plain background processes (no containers), bind to 127.0.0.1 only and never touch port 27017.
In the app: Connect → e.g. `mongodb://admin:admin@localhost:27080/nosqlclient_test?authSource=admin`.

Test data:
```bash
mongosh "mongodb://admin:admin@localhost:27080/admin" --quiet scripts/compat-seed.js    # nosqlclient_test: BSON types, items, view, GridFS…
mongosh "mongodb://admin:admin@localhost:27080/admin" --quiet scripts/perf-seed.js      # perf10k / perf50k / perf100k
mongosh "mongodb://admin:admin@localhost:27080/admin" --quiet --eval "PERF_TARGETS=[['perf1m',1000000]]" scripts/perf-seed.js
```

## Checks
```bash
meteor npm run lint
node --experimental-websocket scripts/compat-matrix.mjs            # app running + servers started + seeded; see docs/compat-matrix.md
node --experimental-websocket scripts/perf-find.mjs m80 3 perf1m   # browse-collection timings; see docs/perf-browse.md
node --experimental-websocket scripts/check-ordering.mjs m80        # read-after-write ordering (guards this.unblock() in methods)
```
`compat-matrix.mjs` saves connections named `compat-*` in the app; `perf-find.mjs` reuses `compat-m80-url`, so run the compat test once first.

## Gotchas
- Meteor builds every directory except `imports/`, `public/`, `private/`, `tests/` and dot-dirs as app code. Dev scripts belong in `scripts/` (ignored via `.meteorignore`), otherwise the app crashes on start.
- Shell / Schema Analyzer need a legacy `mongo` shell: set Settings → "Mongo binary path" to `~/.meteor/packages/meteor-tool/1.10.2/mt-os.linux.x86_64/dev_bundle/mongodb/bin/` (the default `/opt/mongodb/bin/` exists only in the Docker image; the bundled 3.4 shell can't connect to modern servers).
- Ignore the "Meteor 3.x is available" banner — don't run `meteor update`.
