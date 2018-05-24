const Enums = function () {
  this.LOCAL_STORAGE_KEYS = {
    MONGO_BINARY_INFO: 'mongoclient-mongo-binary-220-warn',
    WHAT_IS_NEW: 'mongoclient-whats-new-220-info',
    SHELL_COMMAND_HISTORY: 'mongoclient-shell-history',
    AGGREGATE_COMMAND_HISTORY: 'mongoclient-aggregate-history',
    MONGOCLIENT_SKIN: 'mongoclient-skin',
  };

  this.QUERY_TYPES = {
    BULK_WRITE: 'bulkWrite',
    FIND: 'find',
    FINDONE: 'findOne',
    FINDONE_AND_UPDATE: 'findOneAndUpdate',
    FINDONE_AND_REPLACE: 'findOneAndReplace',
    FINDONE_AND_DELETE: 'findOneAndDelete',
    COUNT: 'count',
    AGGREGATE: 'aggregate',
    CREATE_INDEX: 'createIndex',
    GROUP: 'group',
    DELETE: 'delete',
    DISTINCT: 'distinct',
    DROP_INDEX: 'dropIndex',
    GEO_HAYSTACK_SEARCH: 'geoHaystackSearch',
    INDEX_INFORMATION: 'indexInformation',
    INSERT_MANY: 'insertMany',
    IS_CAPPED: 'isCapped',
    MAP_REDUCE: 'mapReduce',
    OPTIONS: 'options',
    RE_INDEX: 'reIndex',
    RENAME: 'rename',
    STATS: 'stats',
    UPDATE_MANY: 'updateMany',
    UPDATE_ONE: 'updateOne',
    PROFILING_INFO: 'profilingInfo',
    SET_PROFILING_LEVEL: 'setProfilingLevel'
  };

  this.ADMIN_QUERY_TYPES = {
    ADD_USER: 'addUser',
    BUILD_INFO: 'buildInfo',
    COMMAND: 'command',
    LIST_DATABASES: 'listDatabases',
    PING: 'ping',
    REMOVE_USER: 'removeUser',
    REPL_SET_GET_STATUS: 'replSetGetStatus',
    SERVER_STATUS: 'serverStatus',
    SERVER_INFO: 'serverInfo',
    VALIDATE_COLLECTION: 'validateCollection'
  };

  this.COMMAND_OPTIONS = {
    MAX_TIME_MS: 'maxTimeMS',
  };

  this.PROFILING_LEVELS = {
    OFF: 'off',
    SLOW_ONLY: 'slow_only',
    ALL: 'all',
  };

  this.ADD_USER_OPTIONS = {
    CUSTOM_DATA: 'customData',
    ROLES: 'roles',
  };

  this.ADD_COLLECTION_OPTIONS = {
    CAPPED: 'capped',
    FLAGS: 'flags',
    INDEX_OPTION_DEFAULTS: 'indexOptionDefaults',
  };

  this.COUNT_OPTIONS = {
    LIMIT: 'limit',
    SKIP: 'skip',
    HINT: 'hint',
    MAX_TIME_MS: 'maxTimeMS',
  };

  this.BULK_WRITE_OPTIONS = {
    BYPASS_DOCUMENT_VALIDATION: 'bypassDocumentValidation',
    ORDERED: 'ordered',
  };

  this.AGGREGATE_OPTIONS = {
    COLLATION: 'collation',
    BYPASS_DOCUMENT_VALIDATION: 'bypassDocumentValidation',
    MAX_TIME_MS: 'maxTimeMS',
    ALLOW_DISK_USE: 'allowDiskUse',
    EXPLAIN: 'explain',
    COMMENT: 'comment',
    HINT: 'hint'
  };

  this.UPDATE_OPTIONS = {
    UPSERT: 'upsert',
    ARRAY_FILTERS: 'arrayFilters'
  };

  this.STATS_OPTIONS = {
    SCALE: 'scale',
  };

  this.RENAME_OPTIONS = {
    DROP_TARGET: 'dropTarget',
  };

  this.MAP_REDUCE_OPTIONS = {
    OUT: 'out',
    QUERY: 'query',
    SORT: 'sort',
    LIMIT: 'limit',
    FINALIZE: 'finalize',
    SCOPE: 'scope',
    VERBOSE: 'verbose',
    KEEP_TEMP: 'keeptemp',
    JS_MODE: 'jsMode',
    BYPASS_DOCUMENT_VALIDATION: 'bypassDocumentValidation',
  };

  this.GEO_HAYSTACK_SEARCH_OPTIONS = {
    SEARCH: 'search',
    MAX_DISTANCE: 'maxDistance',
    LIMIT: 'limit',
  };

  this.CREATE_INDEX_OPTIONS = {
    UNIQUE: 'unique',
    SPARSE: 'sparse',
    BACKGROUND: 'background',
    MIN: 'min',
    MAX: 'max',
    NAME: 'name',
    DROP_DUPS: 'dropDups',
    EXPIRE_AFTER_SECONDS: 'expireAfterSeconds',
    COLLATION: 'collation',
  };

  this.CURSOR_OPTIONS = {
    PROJECT: 'project',
    SKIP: 'skip',
    HINT: 'hint',
    SORT: 'sort',
    LIMIT: 'limit',
    MAX: 'max',
    MIN: 'min',
    MAX_TIME_MS: 'maxTimeMS',
  };

  this.INSERT_MANY_OPTIONS = {
    BYPASS_DOCUMENT_VALIDATION: 'bypassDocumentValidation',
    SERIALIZE_FUNCTIONS: 'serializeFunctions',
  };

  this.DISTINCT_OPTIONS = {
    MAX_TIME_MS: 'maxTimeMS',
  };

  this.FINDONE_MODIFY_OPTIONS = {
    PROJECTION: 'projection',
    MAX_TIME_MS: 'maxTimeMS',
    SORT: 'sort',
    UPSERT: 'upsert',
    RETURN_ORIGINAL: 'returnOriginal',
    ARRAY_FILTERS: 'arrayFilters'
  };
};

Enums.prototype = {
  get(key) {
    return this[key];
  }
};

export default new Enums();
