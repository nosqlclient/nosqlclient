import { Meteor } from 'meteor/meteor';
import { MongoDB } from '/server/imports/core';

Meteor.methods({
  isCapped(selectedCollection, sessionId) {
    const methodArray = [
      {
        isCapped: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  insertMany(selectedCollection, docs, options, sessionId) {
    const methodArray = [
      {
        insertMany: [docs, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  indexInformation(selectedCollection, isFull, sessionId) {
    const methodArray = [
      {
        indexInformation: [{ full: isFull }],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  geoNear(selectedCollection, xAxis, yAxis, options, sessionId) {
    const methodArray = [
      {
        geoNear: [xAxis, yAxis, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  geoHaystackSearch(selectedCollection, xAxis, yAxis, options, sessionId) {
    const methodArray = [
      {
        geoHaystackSearch: [xAxis, yAxis, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  dropIndex(selectedCollection, indexName, sessionId) {
    const methodArray = [
      {
        dropIndex: [indexName],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  distinct(selectedCollection, selector, fieldName, options, sessionId) {
    const methodArray = [
      {
        distinct: [fieldName, selector, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  delete(selectedCollection, selector, sessionId) {
    const methodArray = [
      {
        deleteMany: [selector],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  createIndex(selectedCollection, fields, options, sessionId) {
    const methodArray = [
      {
        createIndex: [fields, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOne(selectedCollection, selector, cursorOptions, sessionId) {
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

  find(selectedCollection, selector, cursorOptions, executeExplain, sessionId) {
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

    if (executeExplain) {
      methodArray.push({ explain: [] });
    } else {
      methodArray.push({ toArray: [] });
    }

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndUpdate(selectedCollection, selector, setObject, options, sessionId) {
    const methodArray = [
      {
        findOneAndUpdate: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndReplace(selectedCollection, selector, setObject, options, sessionId) {
    const methodArray = [
      {
        findOneAndReplace: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  findOneAndDelete(selectedCollection, selector, options, sessionId) {
    const methodArray = [
      {
        findOneAndDelete: [selector, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  aggregate(selectedCollection, pipeline, options = {}, sessionId) {
    const methodArray = [
      {
        aggregate: [pipeline, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  count(selectedCollection, selector, options, sessionId) {
    const methodArray = [
      {
        count: [selector, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  group(selectedCollection, keys, condition, initial, reduce, finalize, command, sessionId) {
    const methodArray = [
      {
        group: [keys, condition, initial, reduce, finalize, command],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  saveFindResult(selectedCollection, updateObjects, deleteObjectIds, addedObjects, sessionId) {
    Object.entries(updateObjects).forEach(obj => MongoDB.execute({ selectedCollection, methodArray: [{ updateOne: [{ _id: obj._id }, obj, {}] }], sessionId }));

    if (deleteObjectIds.length > 0) MongoDB.execute({ selectedCollection, methodArray: [{ deleteMany: [{ _id: { $in: deleteObjectIds } }] }], sessionId });
    if (addedObjects.length > 0) MongoDB.execute({ selectedCollection, methodArray: [{ insertMany: [addedObjects] }], sessionId });
  },

  bulkWrite(selectedCollection, operations, options, sessionId) {
    const methodArray = [
      {
        bulkWrite: [operations, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  updateOne(selectedCollection, selector, setObject, options, sessionId) {
    const methodArray = [
      {
        updateOne: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  updateMany(selectedCollection, selector, setObject, options, sessionId) {
    const methodArray = [
      {
        updateMany: [selector, setObject, options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  stats(selectedCollection, options, sessionId) {
    const methodArray = [
      {
        stats: [options],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  rename(selectedCollection, newName, options, sessionId) {
    const methodArray = [
      {
        rename: [newName, options],
      },
    ];

    return MongoDB.execute({ selectedCollection, methodArray, sessionId, removeCollectionTopology: true });
  },

  reIndex(selectedCollection, sessionId) {
    const methodArray = [
      {
        reIndex: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  options(selectedCollection, sessionId) {
    const methodArray = [
      {
        options: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  dropCollection(selectedCollection, sessionId) {
    const methodArray = [
      {
        drop: [],
      },
    ];
    return MongoDB.execute({ selectedCollection, methodArray, sessionId });
  },

  mapReduce(selectedCollection, map, reduce, options, sessionId) {
    return MongoDB.executeMapReduce({ selectedCollection, map, reduce, options, sessionId });
  }
});
