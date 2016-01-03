/**
 * Created by RSercan on 29.12.2015.
 */
QUERY_TYPES = {
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
    IS_CAPPED : "isCapped"
};

GEO_NEAR_OPTIONS = {
    MAX_NUMBER: "num",
    MIN_DISTANCE: "minDistance",
    MAX_DISTANCE: "maxDistance",
    DISTANCE_MULTIPLIER: "distanceMultiplier",
    QUERY: "query",
    SPHERICAL: "spherical",
    UNIQUE_DOCS: "uniqueDocs",
    INCLUDE_LOCS: "includeLocs"

};

GEO_HAYSTACK_SEARCH_OPTIONS = {
    SEARCH: "search",
    MAX_DISTANCE: "maxDistance",
    LIMIT: "limit"
};

CREATE_INDEX_OPTIONS = {
    UNIQUE: "unique",
    SPARSE: "sparse",
    BACKGROUND: "background",
    MIN: "min",
    MAX: "max"
};

CURSOR_OPTIONS = {
    PROJECT: "project",
    SKIP: "skip",
    SORT: "sort",
    LIMIT: "limit",
    MAX: "max",
    MIN: "min"
};

FINDONE_MODIFY_OPTIONS = {
    PROJECTION: "projection",
    SORT: "sort",
    UPSERT: "upsert",
    RETURN_ORIGINAL: "returnOriginal"
};