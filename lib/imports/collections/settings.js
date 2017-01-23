/**
 * Created by RSercan on 19.1.2016.
 */
import {Mongo} from "meteor/mongo";
import {SimpleSchema} from "meteor/aldeed:simple-schema";

export const Settings = new Mongo.Collection('settings');
Settings.attachSchema(new SimpleSchema({
    scale: {
        type: "String",
        allowedValues: ['MegaBytes', 'KiloBytes', 'Bytes'],
        optional: true
    },

    defaultResultView: {
        type: "String",
        allowedValues: ['Jsoneditor', 'Aceeditor'],
        optional: true
    },

    maxAllowedFetchSize: {
        type: "Number",
        optional: true
    },

    socketTimeoutInSeconds: {
        type: "Number",
        optional: true
    },

    connectionTimeoutInSeconds: {
        type: "Number",
        optional: true
    },

    autoCompleteFields: {
        type: "Boolean",
        optional: true
    },

    showDBStats: {
        type: "Boolean",
        optional: true
    },

    dbStatsScheduler: {
        type: "Number",
        optional: true
    },

    showLiveChat: {
        type: "Boolean",
        optional: true
    },

    dumpPath: {
        type: "String",
        optional: true
    }
}));
