// Measures what the browse-collection page costs on big collections, through the app's Meteor methods.
// Scenarios mirror the UI:
//   select(old)   = picking a collection before the fix: count + find({limit: 50, skip: random}) for autocomplete
//   select(new)   = picking a collection after the fix: aggregate [$sample 50]
//   execute       = "Execute" on FIND with defaults: empty selector, sort {_id: -1}, limit 50
//   execute after select(old|new) = Execute sent right after selecting (Meteor runs one client's methods in order)
//   no limit      = FIND with LIMIT removed (whole collection) — only for collections <= 100k
//
// Usage: node --experimental-websocket scripts/perf-find.mjs [instance=m80] [runs=3] [collections=perf100k,perf1m]
// Requires: app on :3000, collections from scripts/perf-seed.js, and the connection saved by compat-matrix.mjs.
import { execSync } from 'node:child_process';
import DDP from './lib/ddp.mjs';

const PORTS = { m42: 27042, m60: 27060, m70: 27070, m80: 27080 };
const [instance = 'm80', runsArg = '3', collectionsArg = 'perf100k,perf1m'] = process.argv.slice(2);
const runs = Number(runsArg);
const collections = collectionsArg.split(',');
const NO_LIMIT_MAX = 100000;

const appRssMb = () => {
  try {
    const pid = execSync("pgrep -f 'meteor/local/build/main.js' | head -1").toString().trim();
    return Math.round(Number(execSync(`ps -o rss= -p ${pid}`).toString().trim()) / 1024);
  } catch (e) { return NaN; }
};

const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const mb = b => (b / 1048576).toFixed(2);

async function main() {
  if (!PORTS[instance]) throw new Error(`unknown instance ${instance}`);
  const ddp = new DDP('ws://localhost:3000/websocket');
  await ddp.open();
  await ddp.subscribe('connections');
  const conn = ddp.docs('connections').find(c => c.connectionName === `compat-${instance}-url`);
  if (!conn) throw new Error(`connection compat-${instance}-url not found — run compat-matrix.mjs ${instance} first`);
  if (!String(conn.url).includes(`:${PORTS[instance]}/`)) throw new Error(`SAFETY: unexpected connection url ${conn.url}`);

  const sessionId = `perf-${instance}`;
  const c = await ddp.call('connect', { connectionId: conn._id, sessionId });
  if (c?.error) throw new Error(`connect failed: ${JSON.stringify(c.error)}`);

  const call = (method, args) => ddp.call(method, { ...args, sessionId }, 600000).then((res) => {
    if (res?.error) throw new Error(`${method}: ${JSON.stringify(res.error).slice(0, 200)}`);
    return res;
  });
  const timed = async (fn) => { const t0 = performance.now(); const res = await fn(); return { ms: Math.round(performance.now() - t0), res, bytes: ddp.lastResultBytes }; };

  const selectOld = selectedCollection => call('count', { selectedCollection, selector: {}, options: {} })
    .then(cnt => call('find', { selectedCollection, selector: {}, cursorOptions: { limit: 50, skip: Math.round(Math.random() * cnt.result) }, executeExplain: false }));
  const selectNew = selectedCollection => call('aggregate', { selectedCollection, pipeline: [{ $sample: { size: 50 } }], options: {} });
  const execute = selectedCollection => call('find', { selectedCollection, selector: {}, cursorOptions: { sort: { _id: -1 }, limit: 50 }, executeExplain: false });
  // old UI sent count first and only then the sample find, so Execute queued behind count (the sample find came later)
  const executeAfter = (selectFirstCall, selectedCollection) => { selectFirstCall(selectedCollection).catch(() => {}); return execute(selectedCollection); };

  console.log(`instance ${instance}, ${runs} runs each, medians; app RSS before: ${appRssMb()} MB\n`);
  console.log('| collection | scenario | time | payload |');
  console.log('|---|---|---|---|');

  for (const selectedCollection of collections) {
    const scenarios = {
      'select (old: count + skip)': () => selectOld(selectedCollection),
      'select (new: $sample)': () => selectNew(selectedCollection),
      'execute (defaults)': () => execute(selectedCollection),
      'execute right after select (old)': () => executeAfter(s => call('count', { selectedCollection: s, selector: {}, options: {} }), selectedCollection),
      'execute right after select (new)': () => executeAfter(selectNew, selectedCollection),
    };
    const count = (await call('count', { selectedCollection, selector: {}, options: {} })).result;
    if (count <= NO_LIMIT_MAX) scenarios['no limit (LIMIT removed)'] = () => call('find', { selectedCollection, selector: {}, cursorOptions: {}, executeExplain: false });

    for (const [name, fn] of Object.entries(scenarios)) {
      const samples = [];
      for (let i = 0; i < runs; i += 1) {
        samples.push(await timed(fn));
        await new Promise(r => setTimeout(r, 300)); // let any fire-and-forget select call finish
      }
      console.log(`| ${selectedCollection} | ${name} | ${median(samples.map(s => s.ms))} ms | ${mb(median(samples.map(s => s.bytes)))} MB |`);
    }
  }
  console.log(`\napp RSS after: ${appRssMb()} MB`);

  await ddp.call('disconnect', { sessionId }).catch(() => {});
  ddp.close();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
