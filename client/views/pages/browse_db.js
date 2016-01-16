/**
 * Created by RSercan on 26.12.2015.
 */
var interval = null;
var memoryChart = null, connectionsChart = null, networkChart = null;

var lineOptions = {
    series: {
        lines: {
            show: true,
            lineWidth: 3,
            fill: true,
            fillColor: {
                colors: [{
                    opacity: 0.0
                }, {
                    opacity: 0.0
                }]
            }
        },
        points: {
            show: true
        }
    },
    xaxis: {
        show: true,
        tickFormatter: function (val, axis) {
            return moment(val).format('HH:mm:ss');
        }
    },
    colors: ["#1ab394", "#ff0f0f"],
    grid: {
        color: "#999999",
        hoverable: true,
        clickable: true,
        tickColor: "#D4D4D4",
        borderWidth: 0
    },
    legend: {
        position: "ne"
    },
    tooltip: true,
    tooltipOpts: {
        content: "%y"
    }
};

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

Template.browseDB.initNetworkChart = function (data) {
    
};

Template.browseDB.initConnectionsChart = function (data, availableConnections) {
    if (Session.get(Template.strSessionConnection)) {
        if (data == undefined || data.length == 0) {
            $('#divHeapMemoryChart').html('This feature is not supported on this platform (OS)');
            return;
        }

        $('#spanAvailableConnections').html(', Available: ' + availableConnections);

        if ($('#divConnectionsChart .flot-base').length <= 0) {
            connectionsChart = $.plot($("#divConnectionsChart"), data, lineOptions);
        }
        else {
            var existingData = connectionsChart.getData();
            if (existingData[0].data.length == 10) {
                existingData[0].data = existingData[0].data.slice(1, 10);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 10);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }


            connectionsChart.setData(existingData);
            connectionsChart.setupGrid();
            connectionsChart.draw();
        }
    }
};

Template.browseDB.initMemoryChart = function (data, text) {
    if (Session.get(Template.strSessionConnection)) {
        if (data == undefined || data.length == 0) {
            $('#divHeapMemoryChart').html('This feature is not supported on this platform (OS)');
            return;
        }

        if ($('#divHeapMemoryChart .flot-base').length <= 0) {
            var customLineOptions = jQuery.extend(true, {}, lineOptions);
            customLineOptions.colors.push("#273be2");
            customLineOptions.yaxis = {
                tickFormatter: function (val, axis) {
                    return val + " " + text;
                }
            };
            memoryChart = $.plot($("#divHeapMemoryChart"), data, customLineOptions);
        }
        else {
            var existingData = memoryChart.getData();
            if (existingData[0].data.length == 15) {
                existingData[0].data = existingData[0].data.slice(1, 15);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 15);
                }

                if (existingData.length >= 3 && existingData[2].data) {
                    existingData[2].data = existingData[2].data.slice(1, 15);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }
            if (existingData.length >= 3 && existingData[2].data && data[2].data) {
                existingData[2].data.push.apply(existingData[2].data, data[2].data);
            }


            memoryChart.setData(existingData);
            memoryChart.setupGrid();
            memoryChart.draw();
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
                var memoryData = [], connectionsData = [];
                var memoryText = Template.browseDB.populateMemoryData(result.result, memoryData);
                var availableConnections = Template.browseDB.populateConnectionData(result.result, connectionsData);

                // make sure gui is rendered
                Meteor.setTimeout(function () {
                    Template.browseDB.initMemoryChart(memoryData, memoryText);
                    Template.browseDB.initConnectionsChart(connectionsData, availableConnections);
                }, 1500);
            }
        });
    }
};

Template.browseDB.populateConnectionData = function (result, data) {
    if (result.connections && result.connections.current && result.connections.totalCreated && result.connections.available) {
        var currentData = [];
        var totalCreatedData = [];


        var time = new Date().getTime();

        currentData.push([time, Math.round(result.connections.current * 100) / 100]);
        totalCreatedData.push([time, Math.round(result.connections.totalCreated * 100) / 100]);


        data.push({data: currentData, label: "Active"});
        data.push({data: totalCreatedData, label: "Total Created"});

        return result.connections.available;
    }
};

Template.browseDB.populateMemoryData = function (result, data) {
    if (result.mem && result.mem.virtual && result.mem.mapped && result.mem.resident) {
        var scale = 1;
        var text = "MB";
        var settings = Settings.findOne();
        switch (settings.scale) {
            case "KiloBytes":
                scale = 1024;
                text = "KB";
                break;
            case "Bytes":
                scale = 1024 * 1024;
                text = "Bytes";
                break;
            default:
                scale = 1;
                text = "MB";
                break;
        }

        var virtualMemData = [];
        var mappedMemData = [];
        var residentMemData = [];


        var time = new Date().getTime();

        virtualMemData.push([time, Math.round((result.mem.virtual * scale) * 100) / 100]);
        mappedMemData.push([time, Math.round((result.mem.mapped * scale) * 100) / 100]);
        residentMemData.push([time, Math.round((result.mem.resident * scale) * 100) / 100]);


        data.push({data: virtualMemData, label: "Virtual"});
        data.push({data: mappedMemData, label: "Mapped"});
        data.push({data: residentMemData, label: "Current"});

        return text;
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