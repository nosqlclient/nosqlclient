var toastr = require('toastr');
/**
 * Created by RSercan on 26.12.2015.
 */
var interval = null;
var memoryChart = null, connectionsChart = null, networkChart = null, opCountersChart = null;

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
        tickFormatter: function (val) {
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

Template.databaseStats.onRendered(function () {
    if (Settings.findOne().showDBStats) {
        interval = Meteor.setInterval(function () {
            Template.databaseStats.fetchStatus();
        }, 3000);

        // fetch stats only once.
        Template.databaseStats.fetchStats();
    }
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        toastr.info("It can take a few seconds to populate charts !");
    }
});

Template.databaseStats.onDestroyed(function () {
    if (interval) {
        clearInterval(interval);
    }
});

Template.databaseStats.initOperationCountersChart = function (data) {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        var divChart = $('#divOperationCountersChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }
        if (divChart.find('.flot-base').length <= 0) {
            var customOptions = jQuery.extend(true, {}, lineOptions);
            customOptions.colors = [];
            customOptions.bars = {
                align: "center",
                barWidth: 0.5
            };
            customOptions.series = {
                bars: {
                    show: true
                },
                points: {
                    show: true
                }
            };
            customOptions.xaxis = {
                show: true,
                ticks: [[0, "Insert"], [1, "Query"], [2, "Update"], [3, "Delete"], [4, "Getmore"]]
            };
            try {
                opCountersChart = $.plot(divChart, data, customOptions);
            }
            catch (e) {
                opCountersChart = null;
            }
        }
        else {
            opCountersChart.setData(data);
            opCountersChart.setupGrid();
            opCountersChart.draw();
        }
    }
};

Template.databaseStats.initNetworkChart = function (data) {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        var divChart = $('#divNetworkChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            var customLineOptions = jQuery.extend(true, {}, lineOptions);
            customLineOptions.colors.push("#273be2");
            try {
                networkChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                networkChart = null;
            }
        }
        else {
            var existingData = networkChart.getData();
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

            networkChart.setData(existingData);
            networkChart.setupGrid();
            networkChart.draw();
        }
    }
};

Template.databaseStats.initConnectionsChart = function (data, availableConnections) {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        var divChart = $('#divConnectionsChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        $('#spanAvailableConnections').html(', Available: ' + availableConnections);

        if (divChart.find('.flot-base').length <= 0) {
            try {
                connectionsChart = $.plot(divChart, data, lineOptions);
            }
            catch (e) {
                connectionsChart = null;
            }
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

Template.databaseStats.initMemoryChart = function (data, text) {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        var divChart = $('#divHeapMemoryChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            var customLineOptions = jQuery.extend(true, {}, lineOptions);
            customLineOptions.colors.push("#273be2");
            customLineOptions.yaxis = {
                tickFormatter: function (val) {
                    return val + " " + text;
                }
            };
            try {
                memoryChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                memoryChart = null;
            }
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

Template.databaseStats.helpers({
    'getServerStatus': function () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Template.strSessionServerStatus) == undefined) {
                Template.databaseStats.fetchStatus();
            }

            return Session.get(Template.strSessionServerStatus);
        }
    },

    'getDBStats': function () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Template.strSessionDBStats) == undefined) {
                Template.databaseStats.fetchStats();
            }

            return Session.get(Template.strSessionDBStats);
        }
    }
});

Template.databaseStats.fetchStats = function () {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        Meteor.call("dbStats", function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't execute dbStats");
                Session.set(Template.strSessionDBStats, undefined);
            }
            else {
                Template.databaseStats.convertInformationsToKB(result.result);
                Session.set(Template.strSessionDBStats, result.result);
            }
        });
    }
};

Template.databaseStats.fetchStatus = function () {
    if (Session.get(Template.strSessionCollectionNames) != undefined) {
        Meteor.call("serverStatus", function (err, result) {
            if (err || result.error) {
                var errorMessage = result.error ? result.error.message : err.message;
                $('#errorMessage').text("Successfully connected but, couldn't fetch server status: " + errorMessage);
                Session.set(Template.strSessionServerStatus, undefined);
            }
            else {
                Session.set(Template.strSessionServerStatus, result.result);
                var memoryData = [], connectionsData = [], networkData = [], opCountersData = [];

                var memoryText = Template.databaseStats.populateMemoryData(result.result, memoryData);
                var availableConnections = Template.databaseStats.populateConnectionData(result.result, connectionsData);
                Template.databaseStats.populateNetworkData(result.result, networkData);
                Template.databaseStats.populateOPCountersData(result.result, opCountersData);

                // make sure gui is rendered
                Meteor.setTimeout(function () {
                    Template.databaseStats.initMemoryChart(memoryData, memoryText);
                    Template.databaseStats.initConnectionsChart(connectionsData, availableConnections);
                    Template.databaseStats.initNetworkChart(networkData);
                    Template.databaseStats.initOperationCountersChart(opCountersData)
                }, 1000);
            }
        });
    }
};

Template.databaseStats.populateOPCountersData = function (result, data) {
    if (result.opcounters) {
        var counts = [
            [0, result.opcounters.insert],
            [1, result.opcounters.query],
            [2, result.opcounters.update],
            [3, result.opcounters.delete],
            [4, result.opcounters.getmore]
        ];

        data.push({label: "Counts", data: counts, color: "#1ab394"});
    }
};

Template.databaseStats.populateConnectionData = function (result, data) {
    if (result.connections) {
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

Template.databaseStats.populateNetworkData = function (result, data) {
    if (result.network) {
        var bytesInData = [];
        var bytesOutData = [];
        var totalRequestsData = [];

        var scale = 1;
        var text = "MB";
        var settings = Settings.findOne();
        switch (settings.scale) {
            case "KiloBytes":
                scale = 1024;
                text = "KB";
                break;
            case "MegaBytes":
                scale = 1024 * 1024;
                text = "MB";
                break;
            default:
                scale = 1;
                text = "Bytes";
                break;
        }


        var time = new Date().getTime();

        bytesInData.push([time, Math.round((result.network.bytesIn / scale) * 100) / 100]);
        bytesOutData.push([time, Math.round((result.network.bytesOut / scale) * 100) / 100]);
        totalRequestsData.push([time, result.network.numRequests]);

        data.push({data: bytesInData, label: "Incoming " + text});
        data.push({data: bytesOutData, label: "Outgoing " + text});
        data.push({data: totalRequestsData, label: "Total Requests"});
    }
};

Template.databaseStats.populateMemoryData = function (result, data) {
    if (result.mem) {
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

Template.databaseStats.convertInformationsToKB = function (stats) {
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