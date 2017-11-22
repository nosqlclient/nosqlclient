import { Settings, SchemaAnalyzeResult, ShellCommands, QueryHistory, Actions, Connections, Dumps } from '/lib/imports/collections';

const ReactivityProvider = function () {
  this.types = {
    Settings,
    SchemaAnalyzeResult,
    ShellCommands,
    QueryHistory,
    Actions,
    Connections,
    Dumps
  };
};

const resolveType = function (type) {
  if (Object.prototype.toString.call(type) === '[object String]') return this.types[type];
  return type;
};

ReactivityProvider.prototype = {
  findOne(type, query = {}) {
    return resolveType(type).findOne(query);
  },

  find(type, query = {}, options = {}) {
    return resolveType(type).find(query, options).fetch();
  },

  observeChanges(type, query = {}, options = {}, callbacks) {
    resolveType(type).find(query, options).observeChanges(callbacks);
  }
};

export default new ReactivityProvider();
