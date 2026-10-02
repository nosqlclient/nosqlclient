// mongosh script: creates perf10k / perf50k / perf100k in `nosqlclient_test` with realistic ~1 KB documents.
// Usage: mongosh "<matrix instance url>" --quiet scripts/perf-seed.js
const d = db.getSiblingDB('nosqlclient_test');
const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliett'];
const doc = i => ({
  orderNo: `ORD-${String(i).padStart(8, '0')}`,
  customer: { id: i % 5000, name: `Customer ${i % 5000}`, email: `customer${i % 5000}@example.com`, tier: ['gold', 'silver', 'bronze'][i % 3] },
  status: ['new', 'paid', 'shipped', 'delivered', 'cancelled'][i % 5],
  total: NumberDecimal(((i * 37) % 100000 / 100).toFixed(2)),
  createdAt: new Date(1700000000000 + i * 60000),
  items: Array.from({ length: 1 + (i % 5) }, (_, k) => ({ sku: `SKU-${(i + k) % 997}`, qty: 1 + k, price: 9.99 + k })),
  tags: words.slice(i % 7, (i % 7) + 3),
  note: `${words[i % 10]} ${words[(i + 3) % 10]} `.repeat(8),
});

// Override the set with --eval, e.g.: mongosh <url> --quiet --eval "PERF_TARGETS=[['perf1m',1000000]]" scripts/perf-seed.js
const targets = typeof PERF_TARGETS !== 'undefined' ? PERF_TARGETS : [['perf10k', 10000], ['perf50k', 50000], ['perf100k', 100000]];
targets.forEach(([name, n]) => {
  d[name].drop();
  for (let start = 0; start < n; start += 10000) {
    d[name].insertMany(Array.from({ length: Math.min(10000, n - start) }, (_, j) => doc(start + j)), { ordered: false });
  }
  const s = d[name].stats();
  print(`${name}: ${s.count} docs, avgObjSize ${s.avgObjSize} B, size ${(s.size / 1048576).toFixed(1)} MB`);
});
