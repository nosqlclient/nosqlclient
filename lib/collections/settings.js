/**
 * Created by RSercan on 19.1.2016.
 */
import {Mongo} from 'meteor/mongo';

export const Settings = new Mongo.Collection('settings');
Settings.attachSchema(new SimpleSchema({
    scale: {
        type: "String",
        allowedValues: ['MegaBytes', 'KiloBytes', 'Bytes']
    },

    defaultResultView: {
        type: "String",
        allowedValues: ['Jsoneditor', 'Aceeditor']
    },

    maxAllowedFetchSize: {
        type: "Number"
    },

    socketTimeoutInSeconds: {
        type: "Number"
    },

    connectionTimeoutInSeconds: {
        type: "Number"
    },

    autoCompleteFields: {
        type: "Boolean"
    },

    showDBStats: {
        type: "Boolean"
    },

    dumpPath: {
        type: "String"
    }
}));
