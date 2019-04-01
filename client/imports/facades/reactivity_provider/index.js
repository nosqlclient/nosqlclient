import { Connections, Dumps, QueryHistory, SchemaAnalyzeResult, Settings, ShellCommands } from '/lib/imports/collections';

const ReactivityProvider = function () {
  this.types = {
    Settings,
    SchemaAnalyzeResult,
    ShellCommands,
    QueryHistory,
    Connections,
    Dumps
  };
};

const checkParams = function (types, type, ...objects) {
  if (!type || Object.values(types).indexOf(type) === -1) return false;

  let result = true;
  objects.forEach((object) => {
    if (typeof object !== 'object' || object.constructor !== Object) result = false;
  });

  return result;
};

/**
 * These methods actually call internal MongoDB collections, so we should prevent doing something based on errored returns.
 * Therefore throwing an error.
 */
ReactivityProvider.prototype = {
  findOne(type, query = {}) {
    if (!checkParams(this.types, type, query)) {
      throw new Error(`unexpected internal error on findOne: type: ${type} query: ${query}`);
    }

    return type.findOne(query);
  },

  find(type, query = {}, options = {}) {
    if (!checkParams(this.types, type, query, options)) {
      throw new Error(`unexpected internal error on find: type: ${type} query: ${query}, options: ${options}`);
    }

    return type.find(query, options).fetch();
  },

  observeChanges(type, query = {}, options = {}, callbacks = {}) {
    if (!checkParams(this.types, type, query, options, callbacks)) {
      throw new Error(`unexpected internal error on observeChanges: type: ${type} query: ${query}, options: ${options}, callbacks: ${callbacks}`);
    }

    type.find(query, options).observeChanges(callbacks);
  }
};

export default new ReactivityProvider();
