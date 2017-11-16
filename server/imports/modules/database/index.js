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

Database.prototype = {
  create({ type, document }) {
    return this.types[type].insert(document);
  },

  read({ type, query, queryOptions = {} }) {
    return this.types[type].find(query, queryOptions).fetch();
  },

  readOne({ type, query, queryOptions = {} }) {
    return this.types[type].findOne(query, queryOptions);
  },

  count({ type, query, queryOptions = {} }) {
    return this.types[type].find(query, queryOptions).count();
  },

  update({ type, selector, modifier, options = {} }) {
    return this.types[type].update(selector, modifier, options);
  },

  remove({ type, selector }) {
    return this.types[type].update(selector);
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
