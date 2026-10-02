---
name: mongo-matrix
description: Start/stop local test MongoDB servers (4.2, 6.0, 7.0, 8.0, 8.0 replica set), get connection strings, and seed test data. Use when reproducing or verifying connectivity bugs with newer MongoDB versions, or when large collections are needed for performance testing.
---

# MongoDB test matrix

Plain `mongod` processes managed by `scripts/mongo-matrix.sh` — no containers (podman image storage on this machine is broken; don't use podman/docker for this).
Binaries + data: `~/.local/share/mongo-matrix/{<version>/mongod, data/<instance>/}`. 4.2.5 is a symlink to Meteor's bundled mongod (4.4 would need libssl1.1, absent on Ubuntu 24.04).

```bash
scripts/mongo-matrix.sh start [m42 m60 ...]   # default: all; creates admin user / initiates RS on first start
scripts/mongo-matrix.sh status
scripts/mongo-matrix.sh stop [...]
```
Logs: `~/.local/share/mongo-matrix/data/<instance>/mongod.log`. Wipe one instance: stop it, `rm -rf ~/.local/share/mongo-matrix/data/<instance>`.
Ports in use elsewhere: 27017 (user's own `nice_jang` container — don't touch), 3001 (Meteor's internal DB).

## Connection strings (paste into nosqlclient "Connect" → URL)
| Instance | Version | URL |
|----------|---------|-----|
| m42   | 4.2.5  | `mongodb://admin:admin@localhost:27042/admin` |
| m60   | 6.0.29 | `mongodb://admin:admin@localhost:27060/admin` |
| m70   | 7.0.43 | `mongodb://admin:admin@localhost:27070/admin` |
| m80   | 8.0.32 | `mongodb://admin:admin@localhost:27080/admin` |
| m80rs | 8.0.32 | `mongodb://localhost:27081/?replicaSet=rs0` |

m42 is the baseline that should work with driver 3.5.8 — compare every bug against it.
Sanity-check a server independently of the app: `mongosh "<url>" --eval 'db.runCommand({ping:1})'`.

## Seed data
```bash
mongosh "mongodb://admin:admin@localhost:27080/admin" --quiet --eval '
  const d = db.getSiblingDB("perf");
  d.big.drop();
  for (let b = 0; b < 100; b++) {
    d.big.insertMany(Array.from({length: 1000}, (_, i) => ({
      n: b * 1000 + i, name: "doc" + i, tags: ["a","b","c"].slice(0, i % 4),
      nested: { x: Math.random(), when: new Date(), arr: Array.from({length: i % 20}, (_, k) => k) }
    })));
  }
  print(d.big.countDocuments());'
```
Gives `perf.big` with 100k mixed docs — use for browse/find/aggregate performance checks.

## Adding a version
Find tarball URL in https://downloads.mongodb.org/full.json (target `ubuntu2204`/`ubuntu2404`, edition `targeted`), extract only `bin/mongod` into `~/.local/share/mongo-matrix/<version>/`, add a line to `INSTANCES` in the script.

## Not yet covered
TLS/x509, SRV (`mongodb+srv://` needs DNS — use Atlas free tier), LDAP/Kerberos.
