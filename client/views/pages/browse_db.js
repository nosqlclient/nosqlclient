/**
 * Created by RSercan on 26.12.2015.
 */
var interval = null;
Template.browseDB.onRendered(function () {
    if (Settings.findOne().showDBStats) {
        interval = Meteor.setInterval(function () {
            Template.browseDB.fetchStatus();
        }, 10000);

        // fetch stats only once.
        Template.browseDB.fetchStats();
    }
});

Template.browseDB.onDestroyed(function () {
    if (interval) {
        clearInterval(interval);
    }
});

Template.browseDB.helpers({
    'getServerStatus': function () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Template.strSessionServerStatus) == undefined) {
                Template.browseDB.fetchStatus();
            }

            return Session.get(Template.strSessionServerStatus);
        }
    },

    'getDBStats': function () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Template.strSessionDBStats) == undefined) {
                Template.browseDB.fetchStats();
            }

            return Session.get(Template.strSessionDBStats);
        }
    }
});

Template.browseDB.fetchStats = function () {
    if (Session.get(Template.strSessionConnection)) {
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        Meteor.call("dbStats", connection, function (err, result) {
            if (err || result.error) {
                Session.set(Template.strSessionDBStats, undefined);
            }
            else {
                Template.browseDB.convertInformationsToKB(result.result);

                Session.set(Template.strSessionDBStats, result.result);
            }
        });
    }
};

Template.browseDB.fetchStatus = function () {
    if (Session.get(Template.strSessionConnection)) {
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        Meteor.call("serverStatus", connection, function (err, result) {
            if (err || result.error) {
                var errorMessage;
                if (err) {
                    errorMessage = err.message;
                } else {
                    errorMessage = result.error.message;
                }

                Session.set(Template.strSessionServerStatus, undefined);
                clearInterval(interval);
                toastr.error("Couldn't fetch serverStatus, " + errorMessage);
            }
            else {
                Session.set(Template.strSessionServerStatus, result.result);
            }
        });
    }
};

Template.browseDB.convertInformationsToKB = function (stats) {
    var scale = 1024;
    var text = "Bytes";
    var settings = Settings.findOne();
    switch (settings.scale) {
        case "MegaBytes":
            scale = 1024 * 1024;
            text = "MBs";
            break;
        case "KiloBytes":
            scale = 1024;
            text = "KBs";
            break;
        default:
            scale = 1;
            text = "Bytes";
            break;
    }
    stats.dataSize = isNaN(Number(stats.dataSize / scale).toFixed(2)) ? "0.00 " + text : Number(stats.dataSize / scale).toFixed(2) + " " + text;
    stats.storageSize = isNaN(Number(stats.storageSize / scale).toFixed(2)) ? "0.00 " + text : Number(stats.storageSize / scale).toFixed(2) + " " + text;
    stats.indexSize = isNaN(Number(stats.indexSize / scale).toFixed(2)) ? "0.00 " + text : Number(stats.indexSize / scale).toFixed(2) + " " + text;
    stats.fileSize = isNaN(Number(stats.fileSize / scale).toFixed(2)) ? "0.00 " + text : Number(stats.fileSize / scale).toFixed(2) + " " + text;
};