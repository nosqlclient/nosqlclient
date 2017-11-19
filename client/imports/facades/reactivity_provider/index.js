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
  }
};

export default new ReactivityProvider();
