import { Meteor } from 'meteor/meteor';
import { MongoDB } from '/server/imports/core';

// Read-only methods call this.unblock() so a slow read doesn't queue this client's later calls behind it;
// write methods stay blocking, so a read issued after a write still sees it. A blocking call issued after a read
// (e.g. disconnect) may run while that read is still in flight; the read then fails with a connection error.
Meteor.methods({
  profilingInfo({ sessionId }) {
    this.unblock();
    const methodArray = [
      {
        profilingInfo: [],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  setProfilingLevel({ level, sessionId }) {
    const methodArray = [
      {
        setProfilingLevel: [level],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  isCapped({ selectedCollection, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        isCapped: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  insertMany({ selectedCollection, docs, options, sessionId }) {
    const methodArray = [
      {
        insertMany: [docs, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  indexInformation({ selectedCollection, isFull, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        indexInformation: [{ full: isFull }],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  geoHaystackSearch({ selectedCollection, xAxis, yAxis, options, sessionId }) {
    const methodArray = [
      {
        geoHaystackSearch: [xAxis, yAxis, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  dropIndex({ selectedCollection, indexName, sessionId }) {
    const methodArray = [
      {
        dropIndex: [indexName],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  distinct({ selectedCollection, selector, fieldName, options, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        distinct: [fieldName, selector, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  delete({ selectedCollection, selector, sessionId }) {
    const methodArray = [
      {
        deleteMany: [selector],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  createIndex({ selectedCollection, fields, options, sessionId }) {
    const methodArray = [
      {
        createIndex: [fields, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOne({ selectedCollection, selector, cursorOptions, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        find: [selector],
      },
    ];
    Object.keys(cursorOptions).forEach((key) => {
      if (cursorOptions[key]) {
        const obj = {};
        obj[key] = [cursorOptions[key]];
        methodArray.push(obj);
      }
    });
    methodArray.push({ limit: [1] });
    methodArray.push({ next: [] });
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  find({ selectedCollection, selector, cursorOptions, executeExplain, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        find: [selector],
      },
    ];
    Object.keys(cursorOptions).forEach((key) => {
      if (cursorOptions[key]) {
        const obj = {};
        obj[key] = [cursorOptions[key]];
        methodArray.push(obj);
      }
    });

    if (executeExplain) methodArray.push({ explain: [] });
    else methodArray.push({ toArray: [] });

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndUpdate({ selectedCollection, selector, setObject, options, sessionId }) {
    const methodArray = [
      {
        findOneAndUpdate: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndReplace({ selectedCollection, selector, replacement, options, sessionId }) {
    const methodArray = [
      {
        findOneAndReplace: [selector, replacement, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndDelete({ selectedCollection, selector, options, sessionId }) {
    const methodArray = [
      {
        findOneAndDelete: [selector, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  aggregate({ selectedCollection, pipeline, options = {}, sessionId }) {
    // $out/$merge write, so such pipelines keep blocking like other writes
    if (Array.isArray(pipeline) && !pipeline.some(stage => stage && typeof stage === 'object' && ('$out' in stage || '$merge' in stage))) this.unblock();
    const methodArray = [
      {
        aggregate: [pipeline, options]
      },
      { toArray: [] }
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  count({ selectedCollection, selector, options, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        countDocuments: [selector, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  group({ selectedCollection, keys, condition, initial, reduce, finalize, command, sessionId }) {
    const methodArray = [
      {
        group: [keys, condition, initial, reduce, finalize, command],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  saveFindResult({ selectedCollection, updateObjects, deletedObjectIds, addedObjects, sessionId }) {
    for (let i = 0; i < updateObjects.length; i += 1) {
      const result = MongoDB.execute({ selectedCollection, methodArray: [{ replaceOne: [{ _id: updateObjects[i]._id }, updateObjects[i], {}] }], sessionId });
      if (result.error) return result;
    }
    if (deletedObjectIds.length > 0) {
      const result = MongoDB.execute({ selectedCollection, methodArray: [{ deleteMany: [{ _id: { $in: deletedObjectIds } }] }], sessionId });
      if (result.error) return result;
    }
    if (addedObjects.length > 0) {
      const result = MongoDB.execute({ selectedCollection, methodArray: [{ insertMany: [addedObjects] }], sessionId });
      if (result.error) return result;
    }
  },

  bulkWrite({ selectedCollection, operations, options, sessionId }) {
    const methodArray = [
      {
        bulkWrite: [operations, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  updateOne({ selectedCollection, selector, setObject, options, sessionId }) {
    const methodArray = [
      {
        updateOne: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  updateMany({ selectedCollection, selector, setObject, options, sessionId }) {
    const methodArray = [
      {
        updateMany: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  stats({ selectedCollection, options, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        stats: [options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  rename({ selectedCollection, newName, options, sessionId }) {
    const methodArray = [
      {
        rename: [newName, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId, removeCollectionTopology: true });
  },

  reIndex({ selectedCollection, sessionId }) {
    const methodArray = [
      {
        reIndex: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  options({ selectedCollection, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        options: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  dropCollection({ selectedCollection, sessionId }) {
    const methodArray = [
      {
        drop: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  mapReduce({ selectedCollection, map, reduce, options, sessionId }) {
    return MongoDB.executeMapReduce({ selectedCollection, map, reduce, options, sessionId });
  }
});
