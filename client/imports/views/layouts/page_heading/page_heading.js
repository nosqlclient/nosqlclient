import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections";
import "./page_heading.html";

const Ladda = require('ladda');

Template.pageHeading.helpers({
    // Route for Home link in breadcrumbs
    'home': 'databaseStats',

    getCollectionInformation () {
        if (Helper.getParentTemplateName(1) != 'browseCollection' || Session.get(Helper.strSessionSelectedCollection) == undefined) {
            $('#divCollectionInfo').html("");
            return;
        }
        let settings = Settings.findOne();

        Meteor.setTimeout(function () {
            let btnExecuteQuery = document.querySelector('#btnExecuteQuery');
            if (!settings || !btnExecuteQuery) {
                return;
            }

            Ladda.create(btnExecuteQuery).start();
            const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

            // get distinct field keys for auto complete on every collection change.
            Helper.getDistinctKeysForAutoComplete(selectedCollection);

            Meteor.call("stats", selectedCollection, {}, Meteor.default_connection._lastSessionId, function (err, result) {
                if (err || result.error) {
                    $('#divCollectionInfo').html("<div class=\"row\"><div class=\"col-lg-7\"><b>Couldn't fetch stats:</b></div><div class=\"col-lg-5\">" + Helper.getErrorMessage(err, result) + "</div></div>");
                }
                else {
                    populateCollectionInfo(result.result, settings);
                }
                Ladda.stopAll();
            });
        }, 150);
    }
});

const populateCollectionInfo = function (result, settings) {
    let scale = 1;
    let text = "Bytes";

    switch (settings.scale) {
        case "MegaBytes":
            scale = 1024 * 1024;
            text = "MB";
            break;
        case "KiloBytes":
            scale = 1024;
            text = "KB";
            break;
        default:
            scale = 1;
            text = "Bytes";
            break;
    }
    // we are manually doing the scale to prevent showing 0 MB for sizes 0.7, 0.8, 0.9 etc. MBs as mongodb does.
    let resultString = "<div class=\"row\"><div class=\"col-lg-7\"><b>Count:</b></div><div class=\"col-lg-5\">" + result.count + "</div></div>";
    resultString += "<div class=\"row\"><div class=\"col-lg-7\"><b>Index Count:</b></div><div class=\"col-lg-5\">" + result.nindexes + "</div></div>";

    const size = isNaN(Number(result.size / scale).toFixed(2)) ? "0.00" : Number(result.size / scale).toFixed(2);
    resultString += "<div class=\"row\"><div class=\"col-lg-7\"><b>Size:</b></div><div class=\"col-lg-5\">" + size + " " + text + "</div></div>";

    const totalIndexSize = isNaN(Number(result.totalIndexSize / scale).toFixed(2)) ? "0.00" : Number(result.totalIndexSize / scale).toFixed(2);
    resultString += "<div class=\"row\"><div class=\"col-lg-7\"><b>Total Index Size:</b></div><div class=\"col-lg-5\">" + totalIndexSize + " " + text + "</div></div>";

    const avgObjSize = isNaN(Number(result.avgObjSize / scale).toFixed(2)) ? "0.00" : Number(result.avgObjSize / scale).toFixed(2);
    resultString += "<div class=\"row\"><div class=\"col-lg-7\"><b>Average Object Size:</b></div><div class=\"col-lg-5\">" + avgObjSize + " " + text + "</div></div>";
    resultString += "<div class=\"row\"><div class=\"col-lg-7\"><b>Is Capped:</b></div><div class=\"col-lg-5\">" + result.capped + "</div></div>";

    $('#divCollectionInfo').html(resultString);
};