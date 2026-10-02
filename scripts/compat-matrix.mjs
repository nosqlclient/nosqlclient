// Compatibility smoke test: drives nosqlclient's Meteor methods over DDP (same path as the UI)
// against the local MongoDB matrix (scripts/mongo-matrix.sh) and prints an operation x instance table.
//
// Usage: node --experimental-websocket scripts/compat-matrix.mjs [m42 m60 ...] [--json out.json]
// Requires: app running on http://localhost:3000, matrix instances started and seeded (scripts/compat-seed.js).
//
// Safety: only ports from ALLOWED_PORTS are ever used; before any write the target server's
// actual port is verified via getCmdLineOpts. All writes go to the `nosqlclient_test` database.
import { writeFileSync } from 'node:fs';
import DDP from './lib/ddp.mjs';

const APP_WS = 'ws://localhost:3000/websocket';
const TEST_DB = 'nosqlclient_test';
const ALLOWED_PORTS = new Set([27042, 27060, 27070, 27080, 27081]);

const INSTANCES = {
  m42: { port: 27042, auth: true },
  m60: { port: 27060, auth: true },
  m70: { port: 27070, auth: true },
  m80: { port: 27080, auth: true },
  m80rs: { port: 27081, auth: false, rs: 'rs0' },
};

// ---------- helpers ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));
const short = (s, n = 160) => { const t = String(s).replace(/\s+/g, ' '); return t.length > n ? `${t.slice(0, n)}…` : t; };

function describeError(err) {
  if (!err) return 'unknown error';
  if (typeof err === 'string') return err;
  const d = err.details || err.ddp?.details;
  const parts = [err.reason || err.message || err.error, d && (d.message || d.errmsg || (typeof d === 'string' ? d : JSON.stringify(d)))];
  return short(parts.filter(Boolean).join(' | '));
}

function assertAllowedUrl(url) {
  const ports = [...url.matchAll(/:(\d+)(?=[,/?]|$)/g)].map(m => Number(m[1]));
  if (ports.length === 0 || ports.some(p => !ALLOWED_PORTS.has(p))) throw new Error(`SAFETY: url ${url} uses non-whitelisted port`);
}

// ---------- test plan ----------
function operations(inst) {
  const col = selectedCollection => ({ selectedCollection });
  const ops = [
    // read-only
    ['ping', 'ping', {}],
    ['buildInfo', 'buildInfo', {}],
    ['serverInfo', 'serverInfo', {}],
    ['serverStatus', 'serverStatus', {}],
    ['top', 'top', {}],
    ['dbStats', 'dbStats', {}],
    ['listDatabases', 'listDatabases', {}],
    ['getDatabases', 'getDatabases', {}],
    ['listCollectionNames', 'listCollectionNames', { dbName: TEST_DB }],
    ['count', 'count', { ...col('items'), selector: {}, options: {} }],
    ['count view', 'count', { ...col('items_view'), selector: {}, options: {} }],
    ['find', 'find', { ...col('items'), selector: { group: 1 }, cursorOptions: { limit: 10, sort: { n: -1 } }, executeExplain: false }],
    ['find explain', 'find', { ...col('items'), selector: { group: 1 }, cursorOptions: { limit: 10 }, executeExplain: true }],
    ['find BSON types', 'find', { ...col('types'), selector: {}, cursorOptions: {}, executeExplain: false }],
    ['find Int64 > 2^53', 'find', { ...col('types'), selector: { _id: 1 }, cursorOptions: {}, executeExplain: false }],
    ['findOne', 'findOne', { ...col('items'), selector: { n: 5 }, cursorOptions: {} }],
    ['aggregate', 'aggregate', { ...col('items'), pipeline: [{ $group: { _id: '$group', c: { $sum: 1 } } }], options: {} }],
    ['distinct', 'distinct', { ...col('items'), selector: {}, fieldName: 'group', options: {} }],
    ['stats', 'stats', { ...col('items'), options: {} }],
    ['indexInformation', 'indexInformation', { ...col('items'), isFull: true }],
    ['isCapped', 'isCapped', col('capped')],
    ['options', 'options', col('capped')],
    ['profilingInfo', 'profilingInfo', {}],
    ['validateCollection', 'validateCollection', { collectionName: 'items', options: {} }],
    ['getFilesInfo (GridFS)', 'getFilesInfo', { bucketName: 'fs', selector: {}, limit: 50 }],
    ['command usersInfo', 'command', { command: { usersInfo: 1 }, runOnAdminDB: false, options: {} }],
    ['group (removed 4.2)', 'group', { ...col('items'), keys: { group: 1 }, condition: {}, initial: { c: 0 }, reduce: 'function (cur, res) { res.c += 1; }', finalize: null, command: true }],
    ['mapReduce', 'mapReduce', { ...col('items'), map: 'function () { emit(this.group, 1); }', reduce: 'function (k, v) { return Array.sum(v); }', options: { out: { inline: 1 } } }],
    ['geoHaystackSearch (removed 5.0)', 'geoHaystackSearch', { ...col('items'), xAxis: 0, yAxis: 0, options: { maxDistance: 1, search: {} } }],
    // writes (guarded, test db only)
    ['createCollection', 'createCollection', { collectionName: 'scratch', options: {} }, true],
    ['insertMany', 'insertMany', { ...col('scratch'), docs: [{ a: 1 }, { a: 2 }, { a: 3 }], options: {} }, true],
    ['updateOne', 'updateOne', { ...col('scratch'), selector: { a: 1 }, setObject: { $set: { b: 1 } }, options: {} }, true],
    ['updateMany', 'updateMany', { ...col('scratch'), selector: {}, setObject: { $set: { c: 1 } }, options: {} }, true],
    ['findOneAndUpdate', 'findOneAndUpdate', { ...col('scratch'), selector: { a: 2 }, setObject: { $set: { d: 1 } }, options: {} }, true],
    ['bulkWrite', 'bulkWrite', { ...col('scratch'), operations: [{ insertOne: { document: { a: 9 } } }], options: {} }, true],
    ['delete', 'delete', { ...col('scratch'), selector: { a: 3 } }, true],
    ['createIndex', 'createIndex', { ...col('scratch'), fields: { a: 1 }, options: { name: 'a_1' } }, true],
    ['dropIndex', 'dropIndex', { ...col('scratch'), indexName: 'a_1' }, true],
    ['reIndex', 'reIndex', col('scratch'), true],
    ['rename', 'rename', { ...col('scratch'), newName: 'scratch2', options: {} }, true],
    ['dropCollection', 'dropCollection', col('scratch2'), true],
    ['addUser', 'addUser', { username: 'compat_tmp', password: 'tmp', options: { roles: ['read'] }, runOnAdminDB: false }, true],
    ['removeUser', 'removeUser', { username: 'compat_tmp', runOnAdminDB: false }, true],
  ];
  if (inst.rs) ops.splice(3, 0, ['replSetGetStatus', 'replSetGetStatus', {}]);
  return ops;
}

// ---------- runner ----------
// DDP escapes EJSON-looking keys as {$escape: {...}}; the Meteor client unwraps them, so do we.
const unescape = (v) => {
  if (Array.isArray(v)) return v.map(unescape);
  if (v && typeof v === 'object') {
    if (Object.keys(v).length === 1 && v.$escape) return unescape(v.$escape);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unescape(x)]));
  }
  return v;
};
const typesDoc = r => Array.isArray(r) && unescape(r).find(d => d._id === 1);

// Content checks: an operation only counts as OK when its result also looks right.
const EXPECT = {
  count: r => r === 1000,
  'count view': r => r === 100,
  find: r => Array.isArray(r) && r.length === 10 && r[0].n === 991,
  'find BSON types': (r) => {
    const t = typesDoc(r);
    return !!t && t.decimal?.$numberDecimal === '1234.5678' && !!t.date?.$date && !!t.objectId?.$oid
      && !!t.bin?.$binary && !!t.uuid?.$binary && !!t.ts?.$timestamp && t.nested?.a?.b?.c?.[2]?.d === 'deep';
  },
  'find Int64 > 2^53': (r) => {
    const t = typesDoc(r);
    return !!t && (t.long?.$numberLong === '9007199254740993' || String(t.long) === '9007199254740993');
  },
  findOne: r => r && r.n === 5,
  aggregate: r => Array.isArray(r) && r.length === 10 && r.every(g => g.c === 100),
  distinct: r => Array.isArray(r) && r.length === 10,
  listCollectionNames: r => Array.isArray(r) && ['items', 'types', 'items_view', 'capped'].every(n => r.some(c => c.name === n)),
  'getFilesInfo (GridFS)': r => Array.isArray(r) && r.some(f => f.filename === 'hello.txt'),
};

async function runCase(ddp, sessionId, label, method, args) {
  try {
    const res = await ddp.call(method, { ...args, sessionId });
    if (res && res.error) return { label, ok: false, detail: describeError(res.error) };
    const check = EXPECT[label];
    if (check && !check(res?.result)) return { label, ok: false, detail: `unexpected result: ${short(JSON.stringify(res?.result), 300)}`, result: res?.result };
    return { label, ok: true, detail: res && res.executionTime !== undefined ? `${res.executionTime}ms` : '', result: check ? res?.result : undefined };
  } catch (e) {
    return { label, ok: false, detail: describeError(e.ddp || e) };
  }
}

async function verifyPort(ddp, sessionId, expectedPort) {
  const res = await ddp.call('command', { command: { getCmdLineOpts: 1 }, runOnAdminDB: true, options: {}, sessionId });
  const port = res?.result?.parsed?.net?.port;
  if (port !== expectedPort) throw new Error(`SAFETY: connected server reports port ${port}, expected ${expectedPort} — aborting writes`);
}

async function testVariant(ddp, name, inst, variant) {
  const userPart = inst.auth ? 'admin:admin@' : '';
  const query = inst.rs ? `?replicaSet=${inst.rs}` : (inst.auth ? '?authSource=admin' : '');
  const url = `mongodb://${userPart}localhost:${inst.port}/${TEST_DB}${query}`;
  assertAllowedUrl(url);

  const connectionName = `compat-${name}-${variant}`;
  const sessionId = `compat-${name}-${variant}`;
  const results = [];

  // parseUrl, like the UI does when the URL field is filled in
  let parsed;
  try {
    parsed = await ddp.call('parseUrl', { connection: { url } });
    results.push({ label: 'parseUrl', ok: true, detail: '' });
  } catch (e) {
    results.push({ label: 'parseUrl', ok: false, detail: describeError(e.ddp || e) });
    return results;
  }

  const connection = { ...parsed, connectionName, databaseName: TEST_DB };
  if (variant === 'url') connection.url = url;
  else {
    delete connection.url;
    if (inst.auth) {
      connection.authenticationType = variant; // scram_sha_1 | scram_sha_256
      connection[variant] = { username: 'admin', password: 'admin', authSource: 'admin' };
    }
  }
  (connection.servers || []).forEach((s) => {
    if (!ALLOWED_PORTS.has(Number(s.port))) throw new Error(`SAFETY: parsed server port ${s.port} not whitelisted`);
  });

  // replace an older connection with the same name
  const old = ddp.docs('connections').find(c => c.connectionName === connectionName);
  if (old) await ddp.call('removeConnection', { connectionId: old._id });
  await ddp.call('checkAndSaveConnection', { connection });
  let saved;
  for (let i = 0; i < 20 && !saved; i += 1) {
    saved = ddp.docs('connections').find(c => c.connectionName === connectionName);
    if (!saved) await sleep(100);
  }
  if (!saved) { results.push({ label: 'save connection', ok: false, detail: 'not visible in connections publication' }); return results; }

  const conn = await runCase(ddp, sessionId, 'connect', 'connect', { connectionId: saved._id });
  results.push(conn);
  if (!conn.ok) return results;

  let writesAllowed = true;
  try { await verifyPort(ddp, sessionId, inst.port); } catch (e) {
    writesAllowed = false;
    results.push({ label: 'port verification', ok: false, detail: e.message });
  }

  for (const [label, method, args, isWrite] of operations(inst)) {
    if (isWrite && !writesAllowed) { results.push({ label, ok: false, detail: 'skipped (port verification failed)' }); continue; }
    results.push(await runCase(ddp, sessionId, label, method, args));
  }

  // shell: result lines arrive through the shell_commands publication
  const before = ddp.docs('shell_commands').length;
  const shellConn = await runCase(ddp, sessionId, 'connectToShell', 'connectToShell', { connectionId: saved._id });
  results.push(shellConn);
  if (shellConn.ok) {
    await ddp.call('executeShellCommand', { command: 'db.version()', connectionId: saved._id, sessionId }).catch(() => {});
    await sleep(4000);
    const out = ddp.docs('shell_commands').slice(before).map(d => d.message).join(' ');
    const ok = /\d+\.\d+\.\d+/.test(out) && !/error|not found|ENOENT/i.test(out);
    results.push({ label: 'shell db.version()', ok, detail: short(out || '(no output)') });
    await ddp.call('clearShell', { sessionId }).catch(() => {});
  }

  results.push(await runCase(ddp, sessionId, 'analyzeSchema', 'analyzeSchema', { connectionId: saved._id, collection: 'items' }));
  await ddp.call('disconnect', { sessionId }).catch(() => {});
  return results;
}

async function main() {
  const argv = process.argv.slice(2);
  const jsonIdx = argv.indexOf('--json');
  const jsonOut = jsonIdx >= 0 ? argv.splice(jsonIdx, 2)[1] : null;
  const names = argv.length ? argv : Object.keys(INSTANCES);

  const ddp = new DDP(APP_WS);
  await ddp.open();
  await ddp.subscribe('connections');
  await ddp.subscribe('shell_commands');

  const columns = [];
  for (const name of names) {
    const inst = INSTANCES[name];
    if (!inst) throw new Error(`unknown instance ${name}`);
    const variants = inst.auth ? ['url', 'scram_sha_1', 'scram_sha_256'] : ['url', 'fields'];
    for (const variant of variants) {
      process.stderr.write(`testing ${name}/${variant}…\n`);
      columns.push({ name: `${name}/${variant}`, results: await testVariant(ddp, name, inst, variant) });
    }
  }
  ddp.close();

  // table
  const labels = [...new Set(columns.flatMap(c => c.results.map(r => r.label)))];
  const cell = (c, l) => { const r = c.results.find(x => x.label === l); return r ? (r.ok ? 'OK' : 'FAIL') : '-'; };
  console.log(`| operation | ${columns.map(c => c.name).join(' | ')} |`);
  console.log(`|---|${columns.map(() => '---').join('|')}|`);
  labels.forEach(l => console.log(`| ${l} | ${columns.map(c => cell(c, l)).join(' | ')} |`));

  console.log('\nFailures:');
  columns.forEach(c => c.results.filter(r => !r.ok).forEach(r => console.log(`- ${c.name} :: ${r.label}: ${r.detail}`)));

  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(columns, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
