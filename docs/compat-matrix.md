# MongoDB server compatibility — baseline (2026-09-29)

State of the unmodified fork (Meteor 1.10.2, `mongodb` driver 3.5.8) against MongoDB 4.2–8.0.

## How it was tested
- Servers: `scripts/mongo-matrix.sh` — 4.2.5, 6.0.29, 7.0.43, 8.0.32 (standalone, `--auth`) and 8.0.32 single-node replica set.
- Data: `scripts/compat-seed.js` → database `nosqlclient_test` (all BSON types, 1000 docs, indexes, view, capped, GridFS, `system.js`, user).
- Driver: `node --experimental-websocket scripts/compat-matrix.mjs [instances] [--json out.json]` — calls the app's Meteor methods over DDP (same path as the UI): `parseUrl` → `checkAndSaveConnection` → `connect` → operations. Results are content-checked (counts, BSON values), not just "no error".
- Connection variants per instance: URL, form fields with SCRAM-SHA-1, form fields with SCRAM-SHA-256 (RS: URL and fields). **All variants gave identical results.**
- Shell tested with `mongoBinaryPath` pointed at Meteor's bundled legacy `mongo` 4.2.5 (see finding 3).

## Results
| operation | 4.2 | 6.0 | 7.0 | 8.0 | 8.0 RS |
|---|---|---|---|---|---|
| parseUrl, connect (URL / SCRAM-1 / SCRAM-256) | OK | OK | OK | OK | OK |
| ping, buildInfo, serverInfo, serverStatus, top, dbStats | OK | OK | OK | OK | OK |
| listDatabases, getDatabases, listCollectionNames | OK | OK | OK | OK | OK |
| count, count on view, find, find explain, findOne | OK | OK | OK | OK | OK |
| find — BSON types (Decimal128, Date, ObjectId, Binary, UUID, Timestamp, nested) | OK | OK | OK | OK | OK |
| **find — Int64 > 2^53** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| aggregate, distinct, mapReduce | OK | OK | OK | OK | OK |
| stats, indexInformation, isCapped, options, profilingInfo, validateCollection | OK | OK | OK | OK | OK |
| GridFS getFilesInfo, command usersInfo | OK | OK | OK | OK | OK |
| create/insert/update/findOneAndUpdate/bulkWrite/delete/rename/drop | OK | OK | OK | OK | OK |
| createIndex, dropIndex | OK | OK | OK | OK | OK |
| reIndex | OK | OK | OK | OK | FAIL (server: standalone only) |
| addUser, removeUser | OK | OK | OK | OK | OK |
| replSetGetStatus | – | – | – | – | OK |
| group | FAIL (removed in 4.2) | FAIL | FAIL | FAIL | FAIL |
| geoHaystackSearch | FAIL | FAIL (removed in 5.0) | FAIL | FAIL | FAIL |
| shell (`connectToShell`, `db.version()`), analyzeSchema | OK* | OK* | OK* | OK* | OK* |

\* only after changing `mongoBinaryPath` — with defaults the shell fails everywhere (finding 3).

## Findings
1. **Basic connectivity to MongoDB 6/7/8 works with driver 3.5.8** — including SCRAM-SHA-256 and replica sets. A driver/Meteor upgrade is *not* required for these scenarios. Not yet covered: TLS/x509, `mongodb+srv://` (Atlas), SSH tunnel, LDAP/Kerberos — the reported connectivity problems may live there.
2. **Int64 precision loss (data-corruption risk, all versions).** `NumberLong("9007199254740993")` comes back as `9007199254740992`. Values above 2^53 are silently rounded to JS numbers somewhere between the driver (`promoteLongs`) and the app's EJSON serialization (`server/imports/core/mongodb/helper.js` `proceedExecutingQuery`). Editing and saving such a document would write the wrong value.
3. **Shell / schema analyzer broken with default settings.**
   - Default settings set `mongoBinaryPath: '/opt/mongodb/bin/'` (Docker image path) → `binary-mongo-not-found` outside Docker.
   - The fallback bundled shell `public/mongo/linux/mongo` is **v3.4.4** and cannot connect to any tested server (not even 4.2).
   - Legacy shell 4.2.5 works against 4.2–8.0 for simple commands. Long-term fix: support `mongosh`.
4. **UI offers operations removed from the server:** `group` (removed 4.2), `geoHaystackSearch` (removed 5.0), `reIndex` on replica sets (standalone only). `mapReduce` still works but is deprecated since 5.0.

## Not covered yet
- mongodump/mongorestore/mongoexport/mongoimport (need MongoDB Database Tools binaries).
- UI rendering of results/errors (browser pass), performance on large collections.
- TLS, SRV, x509, SSH tunnel.
