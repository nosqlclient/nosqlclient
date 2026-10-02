// Minimal DDP (Meteor) client over the global WebSocket (node --experimental-websocket).
export default class DDP {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.collections = {};
    this.readyWaiters = new Map();
  }

  open() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onerror = e => reject(new Error(`ws error: ${e.message || e.type}`));
      this.ws.onopen = () => this.send({ msg: 'connect', version: '1', support: ['1'] });
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        if (m.msg === 'connected') resolve();
        else if (m.msg === 'ping') this.send({ msg: 'pong', id: m.id });
        else if (m.msg === 'result') {
          const p = this.pending.get(m.id);
          if (!p) return;
          this.pending.delete(m.id);
          clearTimeout(p.timer);
          this.lastResultBytes = ev.data.length;
          if (m.error) p.reject(Object.assign(new Error(m.error.reason || m.error.message || m.error.error), { ddp: m.error }));
          else p.resolve(m.result);
        } else if (m.msg === 'added' || m.msg === 'changed') {
          const c = (this.collections[m.collection] ||= new Map());
          c.set(m.id, { ...(c.get(m.id) || {}), ...m.fields, _id: m.id });
        } else if (m.msg === 'removed') {
          this.collections[m.collection]?.delete(m.id);
        } else if (m.msg === 'ready') {
          m.subs.forEach(id => this.readyWaiters.get(id)?.());
        }
      };
    });
  }

  send(obj) { this.ws.send(JSON.stringify(obj)); }

  call(method, args, timeoutMs = 30000) {
    const id = String(this.nextId++);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`timeout after ${timeoutMs}ms`)); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.send({ msg: 'method', method, params: [args], id });
    });
  }

  subscribe(name) {
    const id = String(this.nextId++);
    return new Promise((resolve) => {
      this.readyWaiters.set(id, resolve);
      this.send({ msg: 'sub', id, name, params: [] });
    });
  }

  docs(collection) { return [...(this.collections[collection]?.values() || [])]; }

  close() { this.ws.close(); }
}

