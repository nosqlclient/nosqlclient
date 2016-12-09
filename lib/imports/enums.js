/**
 * Created by RSercan on 29.12.2015.
 */
(function () {
    let Enums = function () {
        this.QUERY_TYPES = {
            BULK_WRITE: "bulkWrite",
            FIND: "find",
            FINDONE: "findOne",
            FINDONE_AND_UPDATE: "findOneAndUpdate",
            FINDONE_AND_REPLACE: "findOneAndReplace",
            FINDONE_AND_DELETE: "findOneAndDelete",
            COUNT: "count",
            AGGREGATE: "aggregate",
            CREATE_INDEX: "createIndex",
            DELETE: "delete",
            DISTINCT: "distinct",
            DROP_INDEX: "dropIndex",
            GEO_HAYSTACK_SEARCH: "geoHaystackSearch",
            GEO_NEAR: "geoNear",
            INDEX_INFORMATION: "indexInformation",
            INSERT_MANY: "insertMany",
            IS_CAPPED: "isCapped",
            MAP_REDUCE: "mapReduce",
            OPTIONS: "options",
            RE_INDEX: "reIndex",
            RENAME: "rename",
            STATS: "stats",
            UPDATE_MANY: "updateMany",
            UPDATE_ONE: "updateOne"
        };

        this.ADMIN_QUERY_TYPES = {
            ADD_USER: "addUser",
            BUILD_INFO: "buildInfo",
            COMMAND: "command",
            LIST_DATABASES: "listDatabases",
            PING: "ping",
            PROFILING_INFO: "profilingInfo",
            REMOVE_USER: "removeUser",
            REPL_SET_GET_STATUS: "replSetGetStatus",
            SERVER_STATUS: "serverStatus",
            SERVER_INFO: "serverInfo",
            SET_PROFILING_LEVEL: "setProfilingLevel",
            VALIDATE_COLLECTION: "validateCollection"
        };

        this.PROFILING_LEVELS = {
            OFF: "off",
            SLOW_ONLY: "slow_only",
            ALL: "all"
        };

        this.ADD_USER_OPTIONS = {
            CUSTOM_DATA: "customData",
            ROLES: "roles"
        };

        this.COUNT_OPTIONS = {
            LIMIT: "limit",
            SKIP: "skip",
            MAX_TIME_MS: "maxTimeMS"
        };

        this.BULK_WRITE_OPTIONS = {
            BYPASS_DOCUMENT_VALIDATION: "bypassDocumentValidation",
            ORDERED: "ordered"
        };

        this.AGGREGATE_OPTIONS = {
            COLLATION: "collation",
            BYPASS_DOCUMENT_VALIDATION: "bypassDocumentValidation",
            MAX_TIME_MS: "maxTimeMS",
            ALLOW_DISK_USE: "allowDiskUse",
            EXPLAIN: "explain"
        };

        this.UPDATE_OPTIONS = {
            UPSERT: "upsert"
        };

        this.STATS_OPTIONS = {
            SCALE: "scale"
        };

        this.RENAME_OPTIONS = {
            DROP_TARGET: "dropTarget"
        };

        this.MAP_REDUCE_OPTIONS = {
            OUT: "out",
            QUERY: "query",
            SORT: "sort",
            LIMIT: "limit",
            FINALIZE: "finalize",
            SCOPE: "scope",
            VERBOSE: "verbose",
            BYPASS_DOCUMENT_VALIDATION: "bypassDocumentValidation"
        };

        this.GEO_NEAR_OPTIONS = {
            MAX_NUMBER: "num",
            MIN_DISTANCE: "minDistance",
            MAX_DISTANCE: "maxDistance",
            DISTANCE_MULTIPLIER: "distanceMultiplier",
            QUERY: "query",
            SPHERICAL: "spherical",
            UNIQUE_DOCS: "uniqueDocs",
            INCLUDE_LOCS: "includeLocs"

        };

        this.GEO_HAYSTACK_SEARCH_OPTIONS = {
            SEARCH: "search",
            MAX_DISTANCE: "maxDistance",
            LIMIT: "limit"
        };

        this.CREATE_INDEX_OPTIONS = {
            UNIQUE: "unique",
            SPARSE: "sparse",
            BACKGROUND: "background",
            MIN: "min",
            MAX: "max",
            NAME: "name",
            DROP_DUPS: "dropDups",
            EXPIRE_AFTER_SECONDS: "expireAfterSeconds",
            COLLATION: "collation"
        };

        this.CURSOR_OPTIONS = {
            PROJECT: "project",
            SKIP: "skip",
            SORT: "sort",
            LIMIT: "limit",
            MAX: "max",
            MIN: "min"
        };

        this.DISTINCT_OPTIONS = {
            MAX_TIME_MS: "maxTimeMS"
        };

        this.FINDONE_MODIFY_OPTIONS = {
            PROJECTION: "projection",
            SORT: "sort",
            UPSERT: "upsert",
            RETURN_ORIGINAL: "returnOriginal"
        };

        this.DUMP_STATUS = {
            IN_PROGRESS: "In Progress",
            NOT_IMPORTED: "Not Imported",
            FINISHED: "Finished",
            ERROR: "Error"
        };
    };

    export default new Enums();
})();