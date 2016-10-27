/**
 * Created by RSercan on 19.1.2016.
 */
import {Mongo} from 'meteor/mongo';

export const Dumps = new Mongo.Collection('dumps');
Dumps.attachSchema(new SimpleSchema({
    connectionId: {
        type: "String"
    },

    connectionName: {
        type: "String"
    },

    date: {
        type: "Date"
    },

    sizeInBytes: {
        type: "Number"
    },

    filePath: {
        type: "String"
    },

    status: {
        type: "String",
        defaultValue: "Not Imported",
        allowedValues: ['In Progress', 'Not Imported', "Finished", "Error"]
    }
}));
