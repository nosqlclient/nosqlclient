import * as collections from '/lib/imports/collections';

const Database = function Database() {
  this.types = {
    Actions: collections.Actions,
    Connections: collections.Connections,
    Dumps: collections.Dumps,
    QueryHistory: collections.QueryHistory,
    SchemaAnalyzeResult: collections.SchemaAnalyzeResult,
    Settings: collections.Settings,
    ShellCommands: collections.ShellCommands
  };
};

function resolveType(type) {
  if (Object.prototype.toString.call(type) === '[object String]') return this.types[type];
  return type;
}

Database.prototype = {
  create({ type, document }) {
    return resolveType(type).insert(document);
  },

  read({ type, query, queryOptions = {} }) {
    return resolveType(type).find(query, queryOptions).fetch();
  },

  readOne({ type, query, queryOptions = {} }) {
    return resolveType(type).findOne(query, queryOptions);
  },

  count({ type, query, queryOptions = {} }) {
    return resolveType(type).find(query, queryOptions).count();
  },

  update({ type, selector, modifier, options = {} }) {
    return resolveType(type).update(selector, modifier, options);
  },

  remove({ type, selector }) {
    return resolveType(type).update(selector);
  },

  // aliases
  insert({ type, document }) {
    return this.create({ type, document });
  },

  find({ type, query, isSingle = false, queryOptions = {} }) {
    return this.read({ type, queryOptions, isSingle, query });
  }
};

export default new Database();
