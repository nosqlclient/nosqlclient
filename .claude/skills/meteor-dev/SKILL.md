---
name: meteor-dev
description: Run, restart, debug and reset the nosqlclient Meteor 1.10 dev server. Use when starting the app, checking server logs, installing npm deps, or hitting Meteor/Node 12 build errors.
---

# Meteor dev server (Meteor 1.10.2 / Node 12)

Meteor lives in `~/.meteor`; prefix every command with `export PATH=$HOME/.meteor:$PATH;`.

## Start
Run in background, log to scratchpad, then wait for readiness:
```bash
meteor run --settings settings.json > "$LOG" 2>&1   # run_in_background
until grep -qE "App running at|Your application has errors|Can't start Mongo|Exited" "$LOG"; do sleep 1; done; tail -20 "$LOG"
```
Ready = `=> App running at: http://localhost:3000/`. Server-side `console.log`/winston goes to the same log. Client code hot-reloads; server changes restart the app automatically — just re-check the log for `Started your app` / errors.

## Deps
- `meteor npm ci` / `meteor npm install <pkg>` — never system `npm` (Node 20 would build incompatible native modules).
- Meteor packages: `meteor add|remove <pkg>` (edits `.meteor/packages` + `.meteor/versions`).
- Ignore the "Meteor 3.x is available" banner — do not run `meteor update` unless doing a planned upgrade.

## Troubleshooting
- Port 3000 busy: `lsof -i :3000` → kill the old `meteor`/`node` process, or `meteor run --port 3100`.
- App DB corrupted / want clean settings: stop server, `meteor reset`.
- Internal MongoDB won't start: `MONGO_URL=mongodb://localhost:27017/nosqlclient meteor run ...` against an external mongod.
- Stop: kill the background task (TaskStop) or `pkill -f "meteor run"`.

## Checks before finishing a change
```bash
meteor npm run lint
meteor npm run test:server
```
Then verify behaviour in the browser (claude-in-chrome) at http://localhost:3000.
