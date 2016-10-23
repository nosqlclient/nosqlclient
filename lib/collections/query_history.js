/**
 * Created by RSercan on 23.2.2016.
 */
import {Mongo} from 'meteor/mongo';

export const QueryHistory = new Mongo.Collection('query_histories');
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
        type: "String"
    }
}));
