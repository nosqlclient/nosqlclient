// Regression check for this.unblock(): a read sent right after a write (without waiting for the write's result)
// must still see that write. Writes go to nosqlclient_test.order_test, which is dropped afterwards.
// Usage: node --experimental-websocket scripts/check-ordering.mjs [instance=m80]   (app on :3000, compat connection saved)
import DDP from './lib/ddp.mjs';

const PORTS = { m42: 27042, m60: 27060, m70: 27070, m80: 27080 };
const instance = process.argv[2] || 'm80';
const RUNS = 20;

const ddp = new DDP('ws://localhost:3000/websocket');
await ddp.open();
await ddp.subscribe('connections');
const conn = ddp.docs('connections').find(c => c.connectionName === `compat-${instance}-url`);
if (!conn || !String(conn.url).includes(`:${PORTS[instance]}/`)) throw new Error(`SAFETY: connection compat-${instance}-url missing or unexpected`);

const sessionId = `order-${instance}`;
await ddp.call('connect', { connectionId: conn._id, sessionId });
let seen = 0;
for (let i = 0; i < RUNS; i += 1) {
  const marker = `m${Date.now()}_${i}`;
  const write = ddp.call('insertMany', { selectedCollection: 'order_test', docs: [{ marker }], options: {}, sessionId });
  const read = ddp.call('find', { selectedCollection: 'order_test', selector: { marker }, cursorOptions: {}, executeExplain: false, sessionId });
  const [, res] = await Promise.all([write, read]);
  if (res.result && res.result.length === 1) seen += 1;
}
await ddp.call('dropCollection', { selectedCollection: 'order_test', sessionId });
await ddp.call('disconnect', { sessionId });
console.log(`write-then-read ordering: ${seen}/${RUNS} reads saw the preceding write`);
process.exit(seen === RUNS ? 0 : 1);
