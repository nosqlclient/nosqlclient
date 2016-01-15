/**
 * Created by RSercan on 26.12.2015.
 */
Connections = new Mongo.Collection('connections');
Connections.attachSchema(new SimpleSchema({
    name: {
        type: "String"
    },
    host: {
        type: "String"
    },
    port: {
        type: "Number"
    },
    databaseName: {
        type: "String"
    },
    user: {
        type: "String",
        optional: true
    },
    password: {
        type: "String",
        optional: true
    }
}));

Settings = new Mongo.Collection('settings');
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

    connectionTimeoutInSeconds : {
        type: "Number"
    },

    autoCompleteFields: {
        type: "Boolean"
    }
}));