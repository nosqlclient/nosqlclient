/**
 * Created by RSercan on 26.12.2015.
 */
var interval = null;
var heapMemoryChart = null, heapMemoryChartIndex = 0;

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

Template.browseDB.initCharts = function (data) {
    if (Session.get(Template.strSessionConnection)) {
        if (data == undefined) {
            $('#divHeapMemoryChart').html('This feature is only supported for Linux systems');
            return;
        }
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

        data = Math.round(data * 100 * scale) / 100;

        if (heapMemoryChart == null) {
            var lineOptions = {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 2,
                        fill: true,
                        fillColor: {
                            colors: [{
                                opacity: 0.0
                            }, {
                                opacity: 0.0
                            }]
                        }
                    }
                },
                xaxis: {
                    tickDecimals: 0,
                    show: false
                },
                colors: ["#1ab394"],
                grid: {
                    color: "#999999",
                    hoverable: true,
                    clickable: true,
                    tickColor: "#D4D4D4",
                    borderWidth: 0
                },
                legend: {
                    show: false
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%y " + text
                },
                yaxis: {
                    tickFormatter: function (val, axis) {
                        return val + text;
                    }
                }
            };

            heapMemoryChart = $.plot($("#divHeapMemoryChart"), [data], lineOptions);
        }
        else {
            var existingData = heapMemoryChart.getData();
            console.log(existingData);
            if (existingData[0].data.length == 3) {
                existingData[0].data = existingData[0].data.slice(0, 2);
            }
            existingData[0].data.push.apply(existingData[0].data, data);
            heapMemoryChart.setData(existingData);
            heapMemoryChart.setupGrid();
            heapMemoryChart.draw();
        }
    }
};

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
                var data;
                //if (result.result.extra_info.heap_usage_bytes) {
                //    data = [[++heapMemoryChartIndex, result.result.extra_info.heap_usage_bytes]];
                //}

                data = [[++heapMemoryChartIndex, (Math.random() * 100) ]];

                // make sure gui is rendered
                Meteor.setTimeout(function () {
                    Template.browseDB.initCharts(data);
                }, 1500);
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