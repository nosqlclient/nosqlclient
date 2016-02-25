/**
 * Created by RSercan on 23.2.2016.
 */
QueryHistory = new Mongo.Collection('query_histories');
QueryHistory.attachSchema(new SimpleSchema({
    connectionId: {
        type: "String"
    },

    date: {
        type: "Date"
    },

    collectionName: {
        type: "String"
    },

    queryName: {
        type: "String"
    },

    params: {
        type: "Object"
    }
}));
