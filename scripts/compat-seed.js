// mongosh script: seeds the `nosqlclient_test` database used by scripts/compat-matrix.mjs.
// Usage: mongosh "<matrix instance url>" --quiet scripts/compat-seed.js
const d = db.getSiblingDB('nosqlclient_test');
d.dropDatabase();

d.types.insertMany([
  {
    _id: 1,
    objectId: ObjectId(),
    date: new Date('2024-01-02T03:04:05Z'),
    decimal: NumberDecimal('1234.5678'),
    long: NumberLong('9007199254740993'),
    int: NumberInt(42),
    double: 3.14,
    bin: BinData(0, 'aGVsbG8='),
    uuid: UUID('3b241101-e2bb-4255-8caf-4136c566a962'),
    ts: Timestamp({ t: 1700000000, i: 1 }),
    regex: /abc/i,
    minKey: MinKey(),
    maxKey: MaxKey(),
    nil: null,
    nested: { a: { b: { c: [1, 2, { d: 'deep' }] } } },
  },
  { _id: 2, text: 'zażółć gęślą jaźń', emoji: '🚀', arr: [] },
]);

d.items.insertMany(Array.from({ length: 1000 }, (_, i) => ({
  n: i, name: `item${i}`, group: i % 10, tags: ['a', 'b', 'c'].slice(0, i % 4), created: new Date(1700000000000 + i * 60000),
})));
d.items.createIndex({ group: 1, n: -1 }, { name: 'group_n' });
d.items.createIndex({ name: 'text' }, { name: 'name_text' });

d.createView('items_view', 'items', [{ $match: { group: 1 } }]);
d.createCollection('capped', { capped: true, size: 4096 });

// minimal GridFS file (bucket "fs")
const fileId = ObjectId();
d.fs.files.insertOne({ _id: fileId, length: 5, chunkSize: 261120, uploadDate: new Date(), filename: 'hello.txt', contentType: 'text/plain' });
d.fs.chunks.insertOne({ files_id: fileId, n: 0, data: BinData(0, 'aGVsbG8=') });

d.system.js.insertOne({ _id: 'addNumbers', value: Code('function (a, b) { return a + b; }') });

try { d.dropUser('compat_user'); } catch (e) { /* not present */ }
d.createUser({ user: 'compat_user', pwd: 'compat', roles: [{ role: 'readWrite', db: 'nosqlclient_test' }] });

print(`seeded ${db.version()}: ${d.getCollectionNames().sort().join(',')}`);
