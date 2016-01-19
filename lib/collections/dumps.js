/**
 * Created by RSercan on 19.1.2016.
 */
Dumps = new Mongo.Collection('dumps');
Dumps.attachSchema(new SimpleSchema({
    connectionName: {
        type: "String"
    },

    date: {
        type: "Date"
    },

    sizeInBytes: {
        type: "Number"
    }
}));
